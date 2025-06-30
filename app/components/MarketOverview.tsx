import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react"

interface MarketData {
  total_market_cap: number
  total_volume: number
  market_cap_change_percentage_24h: number
}

interface MarketOverviewProps {
  data: MarketData
  currency: "usd" | "idr"
}

export default function MarketOverview({ data, currency }: MarketOverviewProps) {
  const formatNumber = (num: number) => {
    if (currency === "idr") {
      if (num >= 1e15) return `Rp${(num / 1e15).toFixed(2)}P`
      if (num >= 1e12) return `Rp${(num / 1e12).toFixed(2)}T`
      if (num >= 1e9) return `Rp${(num / 1e9).toFixed(2)}M`
      if (num >= 1e6) return `Rp${(num / 1e6).toFixed(2)}Jt`
      return `Rp${num.toLocaleString("id-ID")}`
    }

    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    return `$${num.toLocaleString()}`
  }

  const isPositive = data.market_cap_change_percentage_24h >= 0

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Market Cap</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.total_market_cap)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">24h Volume</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.total_volume)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${isPositive ? "bg-green-100" : "bg-red-100"}`}>
              {isPositive ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Market Cap Change</p>
              <p className={`text-2xl font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {isPositive ? "+" : ""}
                {data.market_cap_change_percentage_24h.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
