import React from 'react'
import { VideoOff, Loader } from 'lucide-react'

interface AvatarDisplayProps {
  avatarUrl?: string
  isVideoEnabled: boolean
  agentConnected: boolean
  figureName: string
}

export function AvatarDisplay({ avatarUrl, isVideoEnabled, agentConnected, figureName }: AvatarDisplayProps) {
  if (!isVideoEnabled) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-800/50 rounded-xl">
        <div className="text-center text-slate-400">
          <VideoOff className="h-16 w-16 mx-auto mb-4" />
          <p>Video disabled</p>
        </div>
      </div>
    )
  }

  if (!agentConnected || !avatarUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-800/50 rounded-xl">
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-r from-amber-500/20 to-slate-500/20 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-amber-400/30">
            {agentConnected ? (
              <span className="text-4xl">🎭</span>
            ) : (
              <Loader className="h-8 w-8 text-amber-400 animate-spin" />
            )}
          </div>
          <p className="text-slate-300">
            {agentConnected ? `${figureName} is ready` : 'Connecting to agent...'}
          </p>
          {!agentConnected && (
            <p className="text-sm text-slate-400 mt-2">Please wait while we prepare your conversation</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-slate-800/50 rounded-xl overflow-hidden">
      <iframe
        src={avatarUrl}
        className="w-full h-full border-0"
        allow="camera; microphone; autoplay; encrypted-media; fullscreen"
        title={`${figureName} Avatar`}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    </div>
  )
}