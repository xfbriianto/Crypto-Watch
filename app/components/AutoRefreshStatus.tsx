"use client"

import { Clock, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AutoRefreshStatusProps {
  autoRefresh: boolean
  countdown: number
  refreshInterval: number
  onToggle: () => void
}

export default function AutoRefreshStatus({
  autoRefresh,
  countdown,
  refreshInterval,
  onToggle,
}: AutoRefreshStatusProps) {
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getIntervalText = (interval: number) => {
    if (interval < 60) return `${interval}s`
    return `${interval / 60}m`
  }

  if (!autoRefresh) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Pause className="h-4 w-4" />
        <span>Auto refresh paused</span>
        <Button onClick={onToggle} variant="ghost" size="sm" className="h-6 px-2 text-xs">
          Resume
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="flex items-center space-x-1 text-green-600">
        <Clock className="h-4 w-4" />
        <span>Auto refresh</span>
      </div>
      <span className="text-gray-500">every {getIntervalText(refreshInterval)}</span>
      <span className="text-gray-400">•</span>
      <span className="font-mono font-semibold text-blue-600">{formatCountdown(countdown)}</span>
      <Button onClick={onToggle} variant="ghost" size="sm" className="h-6 px-2 text-xs">
        <Pause className="h-3 w-3" />
      </Button>
    </div>
  )
}
