'use client'

import { TokenData } from '@/lib/types'
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts'

interface TokenRadarChartProps {
  token: TokenData
}

export default function TokenRadarChart({ token }: TokenRadarChartProps) {
  // Prepare radar chart data
  const radarData = [
    { 
      metric: 'Believer Score', 
      value: normalizeValue(token.believerScore, 100),
      fullValue: token.believerScore
    },
    { 
      metric: 'Diversity', 
      value: normalizeValue(token.diversityAdjustedScore, token.believerScore || 100),
      fullValue: token.diversityAdjustedScore
    },
    { 
      metric: 'Market Adjusted', 
      value: normalizeValue(token.marketAdjustedScore, token.believerScore || 100),
      fullValue: token.marketAdjustedScore
    },
    { 
      metric: 'Social Cred', 
      value: normalizeValue(token.avgSocialCredScore, 10),
      fullValue: token.avgSocialCredScore
    },
    { 
      metric: 'Social %', 
      value: normalizeValue(token.warpcastPercentage, 100),
      fullValue: token.warpcastPercentage
    }
  ]

  // Normalize values for the radar chart (0-100 scale)
  function normalizeValue(value: number | null, maxValue: number): number {
    if (value === null) return 0
    return Math.min(100, (value / maxValue) * 100)
  }

  // Custom tooltip 
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="tooltip">
          <p className="font-medium">{payload[0].payload.metric}</p>
          <p className="text-xs mt-1">Value: {payload[0].payload.fullValue?.toFixed(2) || 'N/A'}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="data-card p-4 h-96">
      <h3 className="text-lg font-medium mb-4">Score Analysis</h3>
      <ResponsiveContainer width="100%" height="85%">
        <RadarChart outerRadius="80%" data={radarData}>
          <PolarGrid stroke="rgba(255,255,255,0.2)" />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} 
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
            axisLine={false}
            tickCount={5}
          />
          <Radar 
            name="Token Metrics" 
            dataKey="value" 
            stroke="rgba(146, 94, 241, 0.9)" 
            fill="rgba(146, 94, 241, 0.4)" 
            fillOpacity={0.6}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}