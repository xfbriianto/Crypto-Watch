import { NextResponse } from "next/server"

/* ---------- TYPES ---------- */
interface GlobalStats {
  total_market_cap: number
  total_volume: number
  market_cap_change_percentage_24h: number
}

/* ---------- MOCK DATA FOR FALLBACK ---------- */
const mockGlobalData: Record<string, GlobalStats> = {
  usd: {
    total_market_cap: 1700000000000, // $1.7T
    total_volume: 45000000000, // $45B
    market_cap_change_percentage_24h: 1.2,
  },
  idr: {
    total_market_cap: 25500000000000000, // 25.5 Quadrillion IDR
    total_volume: 675000000000000, // 675 Trillion IDR
    market_cap_change_percentage_24h: 1.2,
  },
}

/* ---------- IN-MEMORY CACHE ---------- */
const cache: Record<string, { data: GlobalStats; time: number }> = {} // key = currency
const TTL = 1000 * 60 // 1 minute
const ongoingFetches: Record<string, Promise<GlobalStats>> = {}

/* ---------- HANDLER ---------- */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const currency = (searchParams.get("currency") || "usd").toLowerCase()
  const forceRefresh = searchParams.get("force") === "true"
  const now = Date.now()

  // 1️⃣ Return fresh cache if available (skip if force refresh)
  const cached = cache[currency]
  if (!forceRefresh && cached && now - cached.time < TTL) {
    return NextResponse.json(cached.data)
  }

  // 2️⃣ Deduplicate concurrent fetches
  if (!forceRefresh && currency in ongoingFetches) {
    try {
      const data = await ongoingFetches[currency]
      return NextResponse.json(data)
    } catch {
      /* fall through and try again */
    }
  }

  const fetchPromise = (async (): Promise<GlobalStats> => {
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/global", {
        cache: forceRefresh ? "no-store" : "default",
        next: forceRefresh ? { revalidate: 0 } : { revalidate: 60 },
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      // 🛑 Rate-limited or API error → serve cache or mock data
      if (res.status === 429 || !res.ok) {
        console.log(`Global API issue: ${res.status}`)
        if (cached) return cached.data
        return mockGlobalData[currency] || mockGlobalData.usd
      }

      const json = await res.json()
      const key = currency === "idr" ? "idr" : "usd"

      const data: GlobalStats = {
        total_market_cap: json.data.total_market_cap[key] || 0,
        total_volume: json.data.total_volume[key] || 0,
        market_cap_change_percentage_24h: json.data.market_cap_change_percentage_24h_usd ?? 0,
      }

      // Simpan ke cache
      cache[currency] = { data, time: Date.now() }
      return data
    } catch (error) {
      console.error("Global fetch error:", error)
      // Network error: gunakan cache atau mock data
      if (cached) return cached.data
      return mockGlobalData[currency] || mockGlobalData.usd
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
