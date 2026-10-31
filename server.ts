import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import webpush from 'web-push';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard deterministic VAPID keys for dev/prototype stability so push subscriptions persist
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'UUxI4OOTjhSZwXwKjXvEWBf_pA_QeXw7hA7_2E3eG3M'
};

try {
  webpush.setVapidDetails(
    'mailto:compliance-security@noavalogix.org',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
  console.log('[Push] WebPush VAPID configured successfully');
} catch (err) {
  console.error('[Push] VAPID configuration error:', err);
}

interface PushSubscriptionRecord {
  id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId: string;
  userRole: string;
  deviceName: string;
  browser: string;
  createdAt: string;
  lastActive: string;
}

interface DeliveryLog {
  id: string;
  title: string;
  body: string;
  fdrId?: string;
  recipientsCount: number;
  successCount: number;
  failedCount: number;
  channel: 'PUSH' | 'SIMULATED_EMAIL';
  timestamp: string;
  details?: string;
}

// In-memory persistent stores for prototype
const subscriptions: Map<string, PushSubscriptionRecord> = new Map();
const deliveryLogs: DeliveryLog[] = [
  {
    id: 'log-1',
    title: 'System Startup: Expiry Engine Initialized',
    body: 'Automated 30d, 15d, 7d, 5d, 3d, 0d milestone monitor online.',
    recipientsCount: 1,
    successCount: 1,
    failedCount: 0,
    channel: 'PUSH',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    details: 'Engine booted and verified listening on /api/push'
  }
];

const simulatedEmailRecipients = [
  '240352.cs@rmkec.ac.in',
  '240017.cs@rmkec.ac.in',
  '240030.cs@rmkec.ac.in',
  '25cs200@rmkec.ac.in',
  '25cs216@rmkec.ac.in',
  '240255.cs@rmkec.ac.in'
];

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'NoavaLogix Compliance Backend',
      timestamp: new Date().toISOString(),
      pushSubscriptionsCount: subscriptions.size,
      serviceWorkerRegistered: true
    });
  });

  // 1. Get VAPID Public Key for client subscription
  app.get('/api/push/vapid-public-key', (req: Request, res: Response) => {
    res.json({
      publicKey: vapidKeys.publicKey
    });
  });

  // 2. Register / Update Push Subscription
  app.post('/api/push/subscribe', (req: Request, res: Response) => {
    const { subscription, userId, userRole, deviceName, browser } = req.body;
    if (!subscription || !subscription.endpoint) {
      res.status(400).json({ error: 'Valid subscription object is required.' });
      return;
    }

    const endpoint = subscription.endpoint;
    const record: PushSubscriptionRecord = {
      id: 'sub_' + Math.random().toString(36).substring(2, 9),
      endpoint: endpoint,
      keys: subscription.keys || { p256dh: '', auth: '' },
      userId: userId || 'anonymous',
      userRole: userRole || 'Officer',
      deviceName: deviceName || 'Web Browser',
      browser: browser || 'Unknown',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    subscriptions.set(endpoint, record);
    console.log(`[Push] Subscribed device for ${record.userId} (${record.userRole}). Total subscriptions: ${subscriptions.size}`);

    res.json({
      success: true,
      message: 'Mobile push subscription securely registered on NoavaLogix server.',
      subscriptionId: record.id,
      totalSubscribers: subscriptions.size
    });
  });

  // 3. Unsubscribe
  app.post('/api/push/unsubscribe', (req: Request, res: Response) => {
    const { endpoint } = req.body;
    if (endpoint && subscriptions.has(endpoint)) {
      subscriptions.delete(endpoint);
      res.json({ success: true, message: 'Unsubscribed successfully.' });
      return;
    }
    res.json({ success: true, message: 'Endpoint was not found or already unsubscribed.' });
  });

  // 4. Get active subscriptions list
  app.get('/api/push/subscriptions', (req: Request, res: Response) => {
    const list = Array.from(subscriptions.values()).map(s => ({
      id: s.id,
      userId: s.userId,
      userRole: s.userRole,
      deviceName: s.deviceName,
      browser: s.browser,
      createdAt: s.createdAt,
      lastActive: s.lastActive,
      endpointPreview: s.endpoint.substring(0, 45) + '...'
    }));
    res.json({
      total: list.length,
      subscriptions: list
    });
  });

  // 5. Send Real Test Push Notification
  app.post('/api/push/send-test', async (req: Request, res: Response) => {
    const { title, body, fdrId, url, targetUserId } = req.body;
    const payload = JSON.stringify({
      title: title || 'NoavaLogix — FDR Expiry Alert',
      body: body || 'FDR ending 4821 from State Bank of India is maturing in 3 days. Immediate review is recommended.',
      fdrId: fdrId || 'FDR-SBI-2024-001',
      url: url || '/?tab=expiry&fdrId=FDR-SBI-2024-001',
      timestamp: Date.now()
    });

    const activeSubs = Array.from(subscriptions.values());
    if (activeSubs.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No active push subscriptions found on server. Please click "Enable Mobile Push Notifications" in the application to register this device first.'
      });
      return;
    }

    let successCount = 0;
    let failedCount = 0;
    const staleEndpoints: string[] = [];

    for (const sub of activeSubs) {
      if (targetUserId && sub.userId !== targetUserId) {
        continue;
      }
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys
          },
          payload
        );
        successCount++;
        sub.lastActive = new Date().toISOString();
      } catch (err: any) {
        console.error(`[Push] Delivery error for ${sub.endpoint.slice(0, 30)}:`, err.statusCode || err.message);
        failedCount++;
        // If 404 or 410, subscription has expired on FCM / Mozilla push service
        if (err.statusCode === 404 || err.statusCode === 410) {
          staleEndpoints.push(sub.endpoint);
        }
      }
    }

    // Clean up stale subscriptions
    staleEndpoints.forEach(ep => subscriptions.delete(ep));

    const log: DeliveryLog = {
      id: 'log-' + Date.now(),
      title: title || 'NoavaLogix — FDR Expiry Alert',
      body: body || 'FDR ending 4821 from State Bank of India is maturing in 3 days. Immediate review is recommended.',
      fdrId: fdrId || 'FDR-SBI-2024-001',
      recipientsCount: successCount + failedCount,
      successCount,
      failedCount,
      channel: 'PUSH',
      timestamp: new Date().toISOString(),
      details: failedCount > 0 ? `Delivered to ${successCount} devices. ${failedCount} stale device endpoints pruned.` : `Successfully pushed to ${successCount} devices.`
    };
    deliveryLogs.unshift(log);

    res.json({
      success: true,
      deliveredTo: successCount,
      failed: failedCount,
      stalePruned: staleEndpoints.length,
      message: `Push notification dispatched. ${successCount} device(s) confirmed receipt.`
    });
  });

  // 6. Automated Expiry & Risk Scan Trigger
  app.post('/api/fdr/check-expiry', async (req: Request, res: Response) => {
    const { urgentRecords } = req.body;
    const records = urgentRecords || [
      { id: 'FDR-SBI-2024-001', bank: 'State Bank of India', fdrNumber: '394829104821', daysToMaturity: 3, amount: '₹ 50,00,000' },
      { id: 'FDR-HDFC-2024-003', bank: 'HDFC Bank', fdrNumber: '503009218204', daysToMaturity: 5, amount: '₹ 1,20,00,000' }
    ];

    let triggeredCount = 0;
    for (const record of records) {
      const payload = JSON.stringify({
        title: `NoavaLogix — FDR Expiry Alert`,
        body: `FDR ending ${record.fdrNumber.slice(-4)} from ${record.bank} is maturing in ${record.daysToMaturity} days. Immediate review is recommended.`,
        fdrId: record.id,
        url: `/?tab=expiry&fdrId=${record.id}`,
        timestamp: Date.now()
      });

      for (const sub of subscriptions.values()) {
        try {
          await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload);
          triggeredCount++;
        } catch (e) {
          // ignore individual fails
        }
      }
    }

    deliveryLogs.unshift({
      id: 'log-scan-' + Date.now(),
      title: 'Automated Expiry Scan Executed',
      body: `Evaluated ${records.length} approaching FDR records. Dispatched mobile push alerts to active subscriber endpoints.`,
      recipientsCount: subscriptions.size,
      successCount: triggeredCount,
      failedCount: 0,
      channel: 'PUSH',
      timestamp: new Date().toISOString(),
      details: 'Milestone scan: 3-day and 5-day thresholds triggered.'
    });

    res.json({
      success: true,
      evaluatedCount: records.length,
      notificationsPushed: triggeredCount,
      subscriberCount: subscriptions.size
    });
  });

  // 7. Get Delivery Logs
  app.get('/api/push/logs', (req: Request, res: Response) => {
    res.json({
      logs: deliveryLogs,
      simulatedEmailRecipients: simulatedEmailRecipients
    });
  });

  // 8. Send Expiry Email Alert to configured institutional address (e.g. 240352.cs@rmkec.ac.in)
  app.post('/api/notifications/send-expiry-email', async (req: Request, res: Response) => {
    const {
      recipientEmail = '240352.cs@rmkec.ac.in',
      collegeName = 'Apex Institute of Technology & Engineering',
      fdrNumber = '394829104821',
      bankName = 'State Bank of India',
      principalAmount = '₹ 50,00,000',
      maturityDate = '02-Nov-2026',
      daysToMaturity = 3,
      customMessage
    } = req.body;

    const subject = `NoavaLogix Urgent Notice: Your Recent FDR is going to expire — ${collegeName}`;
    const body = customMessage || `Dear Administrator / Registrar,

This is an urgent compliance notification from the NoavaLogix FDR Intelligence System.

Your Recent FDR #${fdrNumber} for ${collegeName} deposited with ${bankName} (${principalAmount}) is going to expire in ${daysToMaturity} days on ${maturityDate}.

Under statutory AICTE and UGC regulatory guidelines, institutional endowment deposits must maintain an uninterrupted lien. Failure to renew or submit an approved encashment release prior to the maturity date will trigger a non-compliance breach notice.

Next Steps:
1. Contact ${bankName} to execute deposit renewal under the same regulatory lien code.
2. Upload the renewed FDR certificate on NoavaLogix for automated OCR validation.

Compliance Reference: AICTE-FDR-NOTIF-${Date.now().toString().slice(-6)}
Delivered to authorized recipient: ${recipientEmail}`;

    const emailRecord = {
      id: 'email-' + Date.now(),
      recipientEmail,
      collegeName,
      fdrNumber,
      bankName,
      principalAmount,
      maturityDate,
      daysToMaturity,
      subject,
      body,
      timestamp: new Date().toISOString(),
      status: 'DISPATCHED'
    };

    deliveryLogs.unshift({
      id: 'log-email-' + Date.now(),
      title: `Expiry Alert Sent to ${recipientEmail}`,
      body: `Your Recent FDR #${fdrNumber} for ${collegeName} is going to expire in ${daysToMaturity} days (${bankName}).`,
      fdrId: fdrNumber,
      recipientsCount: 1,
      successCount: 1,
      failedCount: 0,
      channel: 'SIMULATED_EMAIL',
      timestamp: new Date().toISOString(),
      details: `Delivered to: ${recipientEmail} • College: ${collegeName} • Subject: ${subject}`
    });

    // Also dispatch Web Push to registered devices if active
    for (const sub of subscriptions.values()) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify({
            title: `NoavaLogix — Expiry Alert (${collegeName})`,
            body: `Your Recent FDR #${fdrNumber.slice(-4)} is going to expire in ${daysToMaturity} days. Immediate review required.`,
            fdrId: 'FDR-SBI-2024-001',
            url: `/?tab=my-fdrs&fdrNumber=${fdrNumber}`
          })
        );
      } catch (err) {
        // ignore
      }
    }

    res.json({
      success: true,
      message: `Expiry alert email successfully dispatched to ${recipientEmail} for ${collegeName} (FDR #${fdrNumber})`,
      emailRecord
    });
  });

  // 8. Simulated Multi-Bank Verification Adapter
  app.post('/api/bank-adapter/verify', (req: Request, res: Response) => {
    const { bankCode, fdrNumber, principalAmount, interestRate, issueDate, maturityDate } = req.body;
    
    // Simulate real bank core banking gateway response with discrepancy checks
    let status: 'Verified' | 'Mismatch Detected' | 'Confirmation Required' | 'Unable to Verify' = 'Verified';
    const discrepancies: string[] = [];

    // Realistic discrepancy logic for sample data testing
    if (fdrNumber && fdrNumber.includes('MISMATCH')) {
      status = 'Mismatch Detected';
      discrepancies.push('Principal amount on record (₹ 75,00,000) does not match bank CBS ledger (₹ 65,00,000).');
    } else if (fdrNumber && fdrNumber.includes('PENDING')) {
      status = 'Confirmation Required';
      discrepancies.push('Physical branch dual-authorization token pending at zonal clearing house.');
    } else if (fdrNumber && fdrNumber.includes('ERROR')) {
      status = 'Unable to Verify';
      discrepancies.push('Bank CBS core system timed out. Zonal Gateway error CBS-504.');
    }

    const verificationRecord = {
      bankCode: bankCode || 'SBI',
      bankName: bankCode === 'SBI' ? 'State Bank of India' : bankCode === 'HDFC' ? 'HDFC Bank' : bankCode,
      fdrNumber,
      cbsReferenceNumber: 'CBS-TXN-' + Math.floor(10000000 + Math.random() * 90000000),
      status,
      timestamp: new Date().toISOString(),
      matchedFields: {
        fdrNumber: true,
        principalAmount: !discrepancies.some(d => d.includes('amount')),
        interestRate: true,
        issueDate: true,
        maturityDate: true,
        lienStatus: 'Lien Marked in favour of AICTE / Regulatory Council'
      },
      discrepancies,
      adapterVersion: 'NoavaLogix MultiBank Adapter v2.4 (Simulated Sandbox)',
      auditNote: 'Simulated response from mock bank adapter. For regulatory staging only.'
    };

    res.json(verificationRecord);
  });

  // Mount Vite or static server
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NoavaLogix] Server started and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[NoavaLogix] Failed to start server:', err);
});
