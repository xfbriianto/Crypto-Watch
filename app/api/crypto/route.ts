import { NextResponse } from "next/server"

type Coin = {
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
  max_supply: number | null
  ath: number
  ath_change_percentage: number
  sparkline_in_7d: { price: number[] }
}

/* ---------- MOCK DATA FOR FALLBACK ---------- */
const mockData: Coin[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "btc",
    current_price: 43000,
    price_change_percentage_24h: 2.5,
    price_change_percentage_7d: -1.2,
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    market_cap: 850000000000,
    market_cap_rank: 1,
    total_volume: 25000000000,
    high_24h: 44000,
    low_24h: 42000,
    circulating_supply: 19500000,
    total_supply: 19500000,
    max_supply: 21000000,
    ath: 69000,
    ath_change_percentage: -37.7,
    sparkline_in_7d: { price: Array.from({ length: 168 }, (_, i) => 43000 + Math.sin(i / 10) * 1000) },
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "eth",
    current_price: 2600,
    price_change_percentage_24h: 1.8,
    price_change_percentage_7d: 3.2,
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    market_cap: 320000000000,
    market_cap_rank: 2,
    total_volume: 15000000000,
    high_24h: 2650,
    low_24h: 2550,
    circulating_supply: 120000000,
    total_supply: 120000000,
    max_supply: null,
    ath: 4800,
    ath_change_percentage: -45.8,
    sparkline_in_7d: { price: Array.from({ length: 168 }, (_, i) => 2600 + Math.sin(i / 8) * 200) },
  },
]

/* ---------- SIMPLE IN-MEMORY CACHE ---------- */
interface CacheEntry {
  data: Coin[]
  time: number
}
const cache: Record<string, CacheEntry> = {} // key = currency (usd, idr, …)
const TTL = 1000 * 60 // 1 minute
const ongoingFetches: Record<string, Promise<Coin[]>> = {}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const currency = (searchParams.get("currency") || "usd").toLowerCase()
  const forceRefresh = searchParams.get("force") === "true"

  const now = Date.now()
  const cached = cache[currency]

  // Skip cache if force refresh is requested
  if (!forceRefresh && cached && now - cached.time < TTL) {
    return NextResponse.json(cached.data)
  }

  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h,7d`

  // Deduplicate concurrent requests in the same runtime
  if (!forceRefresh && currency in ongoingFetches) {
    try {
      const data = await ongoingFetches[currency]
      return NextResponse.json(data)
    } catch (_) {
      /* fallthrough */
    }
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(url, {
        cache: forceRefresh ? "no-store" : "default",
        next: forceRefresh ? { revalidate: 0 } : { revalidate: 60 },
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      if (res.status === 429) {
        console.log("Rate limited, using fallback data")
        // Rate-limited: gunakan cache lokal bila ada, atau mock data
        if (cached) return cached.data
        return mockData.map((coin) => ({
          ...coin,
          current_price: currency === "idr" ? coin.current_price * 15000 : coin.current_price,
        }))
      }

      if (!res.ok) {
        console.log(`CoinGecko API error: ${res.status}`)
        // API error: gunakan cache atau mock data
        if (cached) return cached.data
        return mockData.map((coin) => ({
          ...coin,
          current_price: currency === "idr" ? coin.current_price * 15000 : coin.current_price,
        }))
      }

      const raw = await res.json()

      const data: Coin[] = raw.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        price_change_percentage_7d: coin.price_change_percentage_7d_in_currency || coin.price_change_percentage_7d,
        image: coin.image,
        market_cap: coin.market_cap,
        market_cap_rank: coin.market_cap_rank,
        total_volume: coin.total_volume,
        high_24h: coin.high_24h,
        low_24h: coin.low_24h,
        circulating_supply: coin.circulating_supply,
        total_supply: coin.total_supply,
        max_supply: coin.max_supply,
        ath: coin.ath,
        ath_change_percentage: coin.ath_change_percentage,
        sparkline_in_7d: coin.sparkline_in_7d || { price: Array.from({ length: 168 }, () => coin.current_price) },
      }))

      // simpan ke cache in-memory
      cache[currency] = { data, time: Date.now() }
      return data
    } catch (error) {
      console.error("Fetch error:", error)
      // Network error: gunakan cache atau mock data
      if (cached) return cached.data
      return mockData.map((coin) => ({
        ...coin,
        current_price: currency === "idr" ? coin.current_price * 15000 : coin.current_price,
      }))
    }
  })()

  ongoingFetches[currency] = fetchPromise

  try {
    const fresh = await fetchPromise
    return NextResponse.json(fresh)
  } finally {
    delete ongoingFetches[currency]
  }
}
