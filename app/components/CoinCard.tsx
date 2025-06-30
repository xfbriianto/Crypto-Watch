"use client"

import Image from "next/image"
import { useState } from "react"
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import MiniChart from "./MiniChart"

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

interface CoinCardProps {
  coin: CoinData
  currency: "usd" | "idr"
}

export default function CoinCard({ coin, currency }: CoinCardProps) {
  const [expanded, setExpanded] = useState(false)
  const priceChange24h = coin.price_change_percentage_24h
  const priceChange7d = coin.price_change_percentage_7d
  const isPositive24h = priceChange24h >= 0
  const isPositive7d = priceChange7d >= 0

  const formatPrice = (price: number) => {
    if (currency === "idr") {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price)
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price)
  }

  const formatNumber = (num: number) => {
    if (currency === "idr") {
      if (num >= 1e15) return `Rp${(num / 1e15).toFixed(2)}P`
      if (num >= 1e12) return `Rp${(num / 1e12).toFixed(2)}T`
      if (num >= 1e9) return `Rp${(num / 1e9).toFixed(2)}M`
      if (num >= 1e6) return `Rp${(num / 1e6).toFixed(2)}Jt`
      if (num >= 1e3) return `Rp${(num / 1e3).toFixed(2)}Rb`
      return `Rp${num.toLocaleString("id-ID")}`
    }

    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const formatSupply = (supply: number) => {
    if (supply >= 1e9) return `${(supply / 1e9).toFixed(2)}B`
    if (supply >= 1e6) return `${(supply / 1e6).toFixed(2)}M`
    if (supply >= 1e3) return `${(supply / 1e3).toFixed(2)}K`
    return supply.toLocaleString()
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`
  }

  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12">
              <Image
                src={coin.image || "/placeholder.svg"}
                alt={`${coin.name} logo`}
                fill
                className="rounded-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{coin.name}</h3>
              <div className="flex items-center space-x-2">
                <p className="text-gray-500 text-sm uppercase font-medium">{coin.symbol}</p>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  #{coin.market_cap_rank}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="p-1">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-gray-900">{formatPrice(coin.current_price)}</p>
            <div className="flex items-center space-x-1">
              {isPositive24h ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-semibold ${isPositive24h ? "text-green-600" : "text-red-600"}`}>
                {formatPercentage(priceChange24h)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">7d Change</span>
            <span className={`font-medium ${isPositive7d ? "text-green-600" : "text-red-600"}`}>
              {formatPercentage(priceChange7d)}
            </span>
          </div>
        </div>

        {/* Mini Chart */}
        <div className="h-20">
          <MiniChart data={coin.sparkline_in_7d.price} isPositive={isPositive7d} symbol={coin.symbol} />
        </div>

        {/* Basic Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Market Cap</p>
            <p className="font-semibold">{formatNumber(coin.market_cap)}</p>
          </div>
          <div>
            <p className="text-gray-600">Volume 24h</p>
            <p className="font-semibold">{formatNumber(coin.total_volume)}</p>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">24h High</p>
                <p className="font-semibold text-green-600">{formatPrice(coin.high_24h)}</p>
              </div>
              <div>
                <p className="text-gray-600">24h Low</p>
                <p className="font-semibold text-red-600">{formatPrice(coin.low_24h)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">All Time High</p>
                <p className="font-semibold">{formatPrice(coin.ath)}</p>
                <p className={`text-xs ${coin.ath_change_percentage >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatPercentage(coin.ath_change_percentage)} from ATH
                </p>
              </div>
              <div>
                <p className="text-gray-600">Circulating Supply</p>
                <p className="font-semibold">
                  {formatSupply(coin.circulating_supply)} {coin.symbol.toUpperCase()}
                </p>
                {coin.max_supply && <p className="text-xs text-gray-500">Max: {formatSupply(coin.max_supply)}</p>}
              </div>
            </div>

            {/* Price Range Bar */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600">24h Range</p>
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-400 to-green-400 h-2 rounded-full relative"
                    style={{
                      width: `${((coin.current_price - coin.low_24h) / (coin.high_24h - coin.low_24h)) * 100}%`,
                    }}
                  >
                    <div className="absolute right-0 top-0 w-3 h-3 bg-blue-500 rounded-full transform -translate-y-0.5"></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{formatPrice(coin.low_24h)}</span>
                  <span>{formatPrice(coin.high_24h)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
