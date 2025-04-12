'use client'

import { TokenData } from '@/lib/types'

interface TokenMetricsCardsProps {
  token: TokenData
}

export default function TokenMetricsCards({ token }: TokenMetricsCardsProps) {
  // Format market cap
  const formatMarketCap = (num: number | null): string => {
    if (num === null) return 'N/A'
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  // Format percentage
  const formatPercent = (num: number | null): string => {
    if (num === null) return 'N/A'
    return `${num.toFixed(2)}%`
  }

  const metrics = [
    {
      title: 'Believer Score',
      value: token.believerScore?.toFixed(2) || 'N/A',
      description: 'Final normalized score (0-100)'
    },
    {
      title: 'Market Cap',
      value: formatMarketCap(token.marketCap),
      description: 'Token market capitalization'
    },
    {
      title: 'Holder Count',
      value: token.walletCount?.toLocaleString() || 'N/A',
      description: 'Unique wallet holders'
    },
    {
      title: 'Social Holders',
      value: token.warpcastWallets?.toLocaleString() || 'N/A',
      description: 'Holders with Warpcast accounts'
    },
    {
      title: 'Social Percentage',
      value: formatPercent(token.warpcastPercentage),
      description: 'Percentage of socially connected holders'
    },
    {
      title: 'Social Cred Score',
      value: token.avgSocialCredScore?.toFixed(2) || 'N/A',
      description: 'Average holder social credibility'
    },
    {
      title: 'Holder/MCap Ratio',
      value: token.holderToMarketCapRatio?.toFixed(4) || 'N/A',
      description: 'Higher values may receive market cap penalty'
    },
    {
      title: 'Diversity Score',
      value: token.diversityAdjustedScore?.toFixed(2) || 'N/A',
      description: 'Score adjusted for token concentration'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div key={index} className="data-card p-4">
          <div className="text-sm font-medium text-gray-300">{metric.title}</div>
          <div className="text-2xl font-semibold mt-1">{metric.value}</div>
          <div className="text-xs text-gray-400 mt-1">{metric.description}</div>
        </div>
      ))}
    </div>
  )
}