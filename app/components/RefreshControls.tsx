"use client"

import { RefreshCw, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

interface RefreshControlsProps {
  currency: "usd" | "idr"
  setCurrency: (currency: "usd" | "idr") => void
  autoRefresh: boolean
  setAutoRefresh: (enabled: boolean) => void
  refreshInterval: number
  setRefreshInterval: (interval: number) => void
  onRefresh: () => void
  refreshing: boolean
}

export default function RefreshControls({
  currency,
  setCurrency,
  autoRefresh,
  setAutoRefresh,
  refreshInterval,
  setRefreshInterval,
  onRefresh,
  refreshing,
}: RefreshControlsProps) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="relative">
      <div className="flex items-center space-x-3">
        {/* Currency Selector */}
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as "usd" | "idr")}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="usd">🇺🇸 USD</option>
          <option value="idr">🇮🇩 IDR</option>
        </select>

        {/* Settings Toggle */}
        <Button
          onClick={() => setShowSettings(!showSettings)}
          variant="outline"
          size="sm"
          className={`${showSettings ? "bg-gray-100" : ""}`}
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* Manual Refresh */}
        <Button
          onClick={onRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-transparent"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="absolute top-12 right-0 z-10 w-80 shadow-lg">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Refresh Settings</h3>

            {/* Auto Refresh Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Auto Refresh</label>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Interval Selector */}
            {autoRefresh && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Refresh Interval</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 30, label: "30 seconds" },
                    { value: 60, label: "1 minute" },
                    { value: 120, label: "2 minutes" },
                    { value: 300, label: "5 minutes" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setRefreshInterval(option.value)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        refreshInterval === option.value
                          ? "bg-blue-100 border-blue-300 text-blue-700"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t text-xs text-gray-500">
              <p>💡 Shorter intervals may hit rate limits</p>
              <p>🔋 Longer intervals save battery on mobile</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
