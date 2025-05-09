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
  
  // Get score indicators
  const getScoreClass = (score: number | null, threshold1 = 10, threshold2 = 30, threshold3 = 70): string => {
    if (score === null) return '';
    if (score >= threshold3) return 'text-emerald-400';
    if (score >= threshold2) return 'text-emerald-200';
    if (score >= threshold1) return 'text-yellow-300';
    return 'text-red-400';
  }

  // Get symbol for trend indicators
  const getScoreSymbol = (score: number | null, threshold1 = 10, threshold2 = 30, threshold3 = 70): string => {
    if (score === null) return '';
    if (score >= threshold3) return '▲';
    if (score >= threshold2) return '►';
    if (score >= threshold1) return '▼';
    return '▼';
  }

  const metrics = [
    {
      title: 'Believer Score',
      value: token.believerScore?.toFixed(2) || 'N/A',
      description: 'Final normalized score (0-100)',
      className: getScoreClass(token.believerScore),
      symbol: getScoreSymbol(token.believerScore)
    },
    {
      title: 'Market Cap',
      value: formatMarketCap(token.marketCap),
      description: 'Token market capitalization',
      isMonetary: true
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
      description: 'Percentage of socially connected holders',
      className: getScoreClass(token.warpcastPercentage, 20, 50, 80),
      symbol: getScoreSymbol(token.warpcastPercentage, 20, 50, 80)
    },
    {
      title: 'Social Cred Score',
      value: token.avgSocialCredScore?.toFixed(2) || 'N/A',
      description: 'Average holder social credibility',
      className: getScoreClass(token.avgSocialCredScore, 2, 5, 10),
      symbol: getScoreSymbol(token.avgSocialCredScore, 2, 5, 10)
    },
    {
      title: 'Holder/MCap Ratio',
      value: token.holderToMarketCapRatio?.toFixed(4) || 'N/A',
      description: 'Higher values may receive market cap penalty',
      // Inverse for this one since lower is better
      className: token.holderToMarketCapRatio ? 
        (token.holderToMarketCapRatio > 1 ? 'text-red-400' : 
         token.holderToMarketCapRatio > 0.5 ? 'text-yellow-300' : 'text-emerald-400') : '',
      symbol: token.holderToMarketCapRatio ?
        (token.holderToMarketCapRatio > 1 ? '▼' : 
         token.holderToMarketCapRatio > 0.5 ? '►' : '▲') : ''
    },
    {
      title: 'Diversity Score',
      value: token.diversityAdjustedScore?.toFixed(2) || 'N/A',
      description: 'Score adjusted for token concentration',
      className: getScoreClass(token.diversityAdjustedScore, 
        token.believerScore ? token.believerScore * 0.5 : 40, 
        token.believerScore ? token.believerScore * 0.8 : 70,
        token.believerScore ? token.believerScore * 0.9 : 90),
      symbol: getScoreSymbol(token.diversityAdjustedScore,
        token.believerScore ? token.believerScore * 0.5 : 40,
        token.believerScore ? token.believerScore * 0.8 : 70,
        token.believerScore ? token.believerScore * 0.9 : 90)
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div key={index} className="data-card p-4 transition-all hover:translate-y-[-2px]">
          <div className="text-sm font-medium text-gray-400 flex items-center justify-between">
            <span>{metric.title}</span>
            {metric.symbol && (
              <span className={`text-xs ${metric.className}`}>{metric.symbol}</span>
            )}
          </div>
          <div className={`text-2xl font-semibold mt-2 ${metric.className || ''}`}>
            {metric.value}
          </div>
          <div className="text-xs text-gray-500 mt-1">{metric.description}</div>
        </div>
      ))}
    </div>
  )
}