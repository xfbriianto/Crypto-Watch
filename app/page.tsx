"use client"

import { useState, useEffect } from "react"
import CoinCard from "./components/CoinCard"
import LoadingSkeleton from "./components/LoadingSkeleton"
import MarketOverview from "./components/MarketOverview"
import RefreshControls from "./components/RefreshControls"
import AutoRefreshStatus from "./components/AutoRefreshStatus"
import ErrorBoundary from "./components/ErrorBoundary"


interface CoinData {
  id: string
  name: string
  symbol: string
  current_price: number
  price_change_percentage_24h: number
  price_change_percentage_7d: number
  image: string
  market_cap: number
  market_cap_rank: number
  total_volume: number
  high_24h: number
  low_24h: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  ath: number
  ath_change_percentage: number
  sparkline_in_7d: {
    price: number[]
  }
}

interface MarketData {
  total_market_cap: number
  total_volume: number
  market_cap_change_percentage_24h: number
}

export default function CryptoDashboard() {
  const [coins, setCoins] = useState<CoinData[]>([])
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [currency, setCurrency] = useState<"usd" | "idr">("usd")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(120) // dalam detik
  const [countdown, setCountdown] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchCryptoData = async (forceRefresh = false) => {
    try {
      setError(null)
      const forceParam = forceRefresh ? "&force=true" : ""
      const [coinsResponse, globalResponse] = await Promise.all([
        fetch(`/api/crypto?currency=${currency}${forceParam}`),
        fetch(`/api/crypto/global?currency=${currency}${forceParam}`),
      ])

      // Check if responses are ok
      const coinsData = coinsResponse.ok ? await coinsResponse.json() : []
      const globalData = globalResponse.ok
        ? await globalResponse.json()
        : {
            total_market_cap: 0,
            total_volume: 0,
            market_cap_change_percentage_24h: 0,
          }

      setCoins(coinsData)
      setMarketData(globalData)
      setLastRefresh(new Date())

      // Show warning if using fallback data
      if (!coinsResponse.ok || !globalResponse.ok) {
        setError("Using cached data due to API limitations")
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setError("Network error - showing cached data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchCryptoData(true) // Force refresh untuk manual refresh
    setCountdown(refreshInterval) // Reset countdown setelah manual refresh
  }

  // Handle hydration
  useEffect(() => {
    setMounted(true)
    setCountdown(refreshInterval)
  }, [refreshInterval])

  // Main data fetching and auto-refresh logic
  useEffect(() => {
    if (!mounted) return

    fetchCryptoData()

    let interval: NodeJS.Timeout
    let countdownInterval: NodeJS.Timeout

    if (autoRefresh) {
      setCountdown(refreshInterval)

      // Countdown timer
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return refreshInterval
          }
          return prev - 1
        })
      }, 1000)

      // Auto refresh interval
      interval = setInterval(() => {
        fetchCryptoData(false) // Auto refresh tidak perlu force
        setCountdown(refreshInterval)
      }, refreshInterval * 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
      if (countdownInterval) clearInterval(countdownInterval)
    }
  }, [currency, autoRefresh, refreshInterval, mounted])

  // Prevent hydration mismatch by not rendering time-sensitive components until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Crypto Market Watch</h1>
                <p className="text-gray-600 mt-2">Real-time cryptocurrency market data</p>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton />
        </main>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-black bg-gradient-to-br from-slate-50 to-slate-100 dark:from-black dark:to-gray-900">
        {/* Header */}
        <header className="bg-white shadow-sm border-b dark:bg-black dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Crypto Market Watch</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <p className="text-gray-600 dark:text-gray-300">Real-time cryptocurrency market data</p>
                  {lastRefresh && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">Last updated: {lastRefresh.toLocaleTimeString()}</span>
                  )}
                  <AutoRefreshStatus
                    autoRefresh={autoRefresh}
                    countdown={countdown}
                    refreshInterval={refreshInterval}
                    onToggle={() => setAutoRefresh(!autoRefresh)}
                  />
                </div>
              </div>
              <RefreshControls
                currency={currency}
                setCurrency={setCurrency}
                autoRefresh={autoRefresh}
                setAutoRefresh={setAutoRefresh}
                refreshInterval={refreshInterval}
                setRefreshInterval={setRefreshInterval}
                onRefresh={handleRefresh}
                refreshing={refreshing}
              />
            </div>
          </div>
        </header>

        {/* Market Overview */}
        {marketData && <MarketOverview data={marketData} currency={currency} />}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 dark:bg-red-900 dark:border-red-700">
              <p className="text-red-800 text-center dark:text-red-200">{error}</p>
            </div>
          )}

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {coins.map((coin) => (
                <CoinCard key={coin.id} coin={coin} currency={currency} />
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-16 dark:bg-black dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Crypto Dashboard by v0 | Data from CoinGecko
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
