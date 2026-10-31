import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, X, RotateCcw } from 'lucide-react';
import { speechController } from '../../services/speechService';

interface VoiceBriefingBarProps {
  briefingText: string;
  autoplayBlocked: boolean;
  onDismiss: () => void;
  onOpenExtension: () => void;
}

export const VoiceBriefingBar: React.FC<VoiceBriefingBarProps> = ({
  briefingText,
  autoplayBlocked,
  onDismiss,
  onOpenExtension
}) => {
  const [status, setStatus] = useState({
    isSpeaking: speechController.isSpeaking,
    isPaused: speechController.isPaused,
    isMuted: speechController.isMuted
  });

  useEffect(() => {
    const unsub = speechController.subscribe(setStatus);
    return unsub;
  }, []);

  const handleStartBriefing = () => {
    speechController.speak(briefingText);
  };

  return (
    <div className="bg-gradient-to-r from-[#0e2a27] via-[#143834] to-[#0e2a27] border-b border-[#d8be9a]/30 px-4 py-2.5 text-xs text-[#fbf8f3] flex flex-wrap items-center justify-between gap-3 shadow-md animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-[#091a18] border border-[#d8be9a]/40 flex items-center justify-center text-[#d8be9a] shrink-0">
          <Volume2 className={`w-4 h-4 ${status.isSpeaking && !status.isPaused ? 'animate-bounce text-[#2ecc71]' : ''}`} />
        </div>
        <div>
          <span className="font-bold text-[#d8be9a] uppercase text-[10px] tracking-wider block">
            NoavaLogix Expiry Voice Intelligence
          </span>
          <span className="text-xs text-[#fbf8f3] font-medium">
            {autoplayBlocked
              ? 'Morning AI Compliance Briefing Ready — Browser blocked autoplay.'
              : status.isSpeaking
              ? status.isPaused
                ? 'AI Voice Briefing Paused'
                : 'Broadcasting Live Compliance Briefing...'
              : 'Voice briefing finished.'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {autoplayBlocked && !status.isSpeaking ? (
          <button
            onClick={handleStartBriefing}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#d8be9a] to-[#c4a274] text-[#091a18] font-bold text-xs uppercase tracking-wider hover:brightness-105 shadow flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Enable Voice Briefing</span>
          </button>
        ) : status.isSpeaking ? (
          <>
            {status.isPaused ? (
              <button
                onClick={() => speechController.resume()}
                className="px-2.5 py-1 rounded bg-[#143834] text-[#d8be9a] border border-[#d8be9a]/30 hover:bg-[#1a4a45] text-xs font-semibold flex items-center gap-1"
              >
                <Play className="w-3 h-3" /> Resume
              </button>
            ) : (
              <button
                onClick={() => speechController.pause()}
                className="px-2.5 py-1 rounded bg-[#143834] text-[#d8be9a] border border-[#d8be9a]/30 hover:bg-[#1a4a45] text-xs font-semibold flex items-center gap-1"
              >
                <Pause className="w-3 h-3" /> Pause
              </button>
            )}
            <button
              onClick={() => speechController.toggleMute()}
              className="p-1 rounded text-[#d8be9a] hover:bg-[#143834]"
              title="Mute"
            >
              {status.isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </>
        ) : (
          <button
            onClick={handleStartBriefing}
            className="px-2.5 py-1 rounded bg-[#143834] text-[#d8be9a] border border-[#d8be9a]/30 hover:bg-[#1a4a45] text-xs font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Replay
          </button>
        )}

        <button
          onClick={onOpenExtension}
          className="text-xs text-[#d8be9a] underline hover:text-white px-2 py-1"
        >
          View Transcript
        </button>

        <button
          onClick={onDismiss}
          className="p-1 text-gray-400 hover:text-white"
          title="Dismiss Banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
