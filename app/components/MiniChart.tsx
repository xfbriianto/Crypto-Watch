"use client"

import { Line, LineChart, ResponsiveContainer } from "recharts"

interface MiniChartProps {
  data: number[]
  isPositive: boolean
  symbol: string
}

export default function MiniChart({ data, isPositive, symbol }: MiniChartProps) {
  const chartData = data.map((price, index) => ({
    index,
    price,
  }))

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
