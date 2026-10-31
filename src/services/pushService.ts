// Web Push Notification client service for NoavaLogix

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export interface PushStatus {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  subscriptionEndpoint?: string;
  serviceWorkerActive: boolean;
  error?: string;
}

export async function checkPushSupport(): Promise<PushStatus> {
  const isSupported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  if (!isSupported) {
    return {
      isSupported: false,
      permission: 'default',
      isSubscribed: false,
      serviceWorkerActive: false,
      error: 'Web Push is not supported in this browser or environment context.'
    };
  }

  const permission = Notification.permission;
  let isSubscribed = false;
  let endpoint = '';
  let swActive = false;

  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      swActive = !!reg.active;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        isSubscribed = true;
        endpoint = sub.endpoint;
      }
    }
  } catch (err: any) {
    console.warn('[Push] Status check notice:', err);
  }

  return {
    isSupported: true,
    permission,
    isSubscribed,
    subscriptionEndpoint: endpoint,
    serviceWorkerActive: swActive
  };
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('[SW] Registered successfully with scope:', reg.scope);
    await navigator.serviceWorker.ready;
    return reg;
  } catch (err) {
    console.error('[SW] Registration failed:', err);
    return null;
  }
}

export async function subscribeToPushNotifications(userId: string, userRole: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return { success: false, message: 'Web Push is not supported on this browser.' };
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, message: `Notification permission was ${permission}. Please allow notifications in browser settings.` };
    }

    const registration = await registerServiceWorker();
    if (!registration) {
      return { success: false, message: 'Failed to initialize Service Worker.' };
    }

    // Fetch VAPID public key from backend
    const vapidRes = await fetch('/api/push/vapid-public-key');
    if (!vapidRes.ok) {
      throw new Error('Failed to retrieve VAPID public key from server');
    }
    const { publicKey } = await vapidRes.json();

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const convertedKey = urlBase64ToUint8Array(publicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as unknown as BufferSource
      });
    }

    // Send subscription object to backend to store securely
    const subRes = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userId,
        userRole,
        deviceName: navigator.userAgent.includes('Mobile') ? 'Mobile Device (PWA)' : 'Desktop Workstation',
        browser: navigator.userAgent
      })
    });

    const data = await subRes.json();
    return {
      success: true,
      message: data.message || 'Push subscription registered on server.'
    };
  } catch (error: any) {
    console.error('[Push] Subscription failed:', error);
    return {
      success: false,
      message: error.message || 'Error configuring push subscription.'
    };
  }
}

export async function sendTestPush(title?: string, body?: string, fdrId?: string): Promise<{ success: boolean; message: string; deliveredTo?: number }> {
  try {
    const res = await fetch('/api/push/send-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title || 'NoavaLogix — FDR Expiry Alert',
        body: body || 'FDR ending 4821 from State Bank of India is maturing in 3 days. Immediate review is recommended.',
        fdrId: fdrId || 'FDR-SBI-2024-001',
        url: `/?tab=expiry&fdrId=${fdrId || 'FDR-SBI-2024-001'}`
      })
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error triggering test push.' };
  }
}

export async function runServerExpiryScan(): Promise<{ success: boolean; message: string; notificationsPushed?: number; subscriberCount?: number }> {
  try {
    const res = await fetch('/api/fdr/check-expiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export interface ExpiryEmailPayload {
  recipientEmail?: string;
  collegeName?: string;
  fdrNumber?: string;
  bankName?: string;
  principalAmount?: string;
  maturityDate?: string;
  daysToMaturity?: number;
  customMessage?: string;
}

export async function sendExpiryEmailAlert(payload: ExpiryEmailPayload): Promise<{ success: boolean; message: string; emailRecord?: any }> {
  try {
    const res = await fetch('/api/notifications/send-expiry-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to dispatch email alert.' };
  }
}

export async function getPushDeliveryLogs(): Promise<any> {
  try {
    const res = await fetch('/api/push/logs');
    return await res.json();
  } catch (err) {
    return { logs: [], simulatedEmailRecipients: [] };
  }
}
