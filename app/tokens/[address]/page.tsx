'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TokenData, Believer } from '@/lib/types'
import TokenRadarChart from '@/components/TokenRadarChart'
import TopBelieversTable from '@/components/TopBelieversTable'
import TokenMetricsCards from '@/components/TokenMetricsCards'

export default function TokenDetailPage({ params }: { params: { address: string } }) {
  const [token, setToken] = useState<TokenData | null>(null)
  const [believers, setBelievers] = useState<Believer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Get all tokens to find the specific one
        const tokensResponse = await fetch('/api/tokens')
        if (!tokensResponse.ok) throw new Error('Failed to fetch tokens')
        
        const tokensData = await tokensResponse.json()
        const foundToken = tokensData.fcs_data.find(
          (t: TokenData) => t.address.toLowerCase() === params.address.toLowerCase()
        )
        
        if (foundToken) {
          setToken(foundToken)
          
          // Get the token's top believers
          const believersResponse = await fetch(`/api/tokens/${params.address}/believers`)
          if (!believersResponse.ok) throw new Error('Failed to fetch believers')
          
          const believersData = await believersResponse.json()
          setBelievers(believersData.believers)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [params.address])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="data-card p-20 text-center">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-700 rounded mx-auto mb-4"></div>
            <div className="h-4 w-40 bg-gray-800 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="data-card p-12 text-center">
          <div className="text-xl mb-4">Token not found</div>
          <Link href="/" className="btn-action hover:underline">
            Return to tokens list
          </Link>
        </div>
      </div>
    )
  }

  // Score visualization helper
  const getScoreHealthStatus = (score: number | null): string => {
    if (score === null) return 'Unknown';
    if (score >= 70) return 'Strong';
    if (score >= 40) return 'Moderate';
    return 'Weak';
  }
  
  const getScoreHealthClass = (score: number | null): string => {
    if (score === null) return '';
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-mid';
    return 'score-low';
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/" className="text-gray-400 hover:text-white text-sm flex items-center space-x-1">
            <span>←</span>
            <span>Back to Tokens</span>
          </Link>
          <div className="flex items-center space-x-3 mt-2">
            <h1 className="text-3xl font-bold">
              {token.name} 
              <span className="text-xl opacity-70 ml-2">{token.symbol}</span>
            </h1>
            <div className={`px-2 py-0.5 text-xs font-medium rounded ${getScoreHealthClass(token.believerScore)} bg-opacity-20`}>
              {getScoreHealthStatus(token.believerScore)}
            </div>
          </div>
          <div className="text-xs mt-1 text-gray-500 font-mono">
            {token.address}
          </div>
        </div>
      </div>

      <TokenMetricsCards token={token} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TokenRadarChart token={token} />
        </div>
        <div className="lg:col-span-2">
          <TopBelieversTable believers={believers} />
        </div>
      </div>

      <div className="data-card p-6">
        <h3 className="text-lg font-medium mb-4">Understanding Believer Score</h3>
        <div className="space-y-4 text-sm text-gray-300">
          <p>
            <strong className="text-white">Believer Score</strong> is a composite measure of token holder engagement and quality, normalized to a 0-100 scale.
          </p>
          <p>
            The score is calculated in multiple stages:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-black/20 p-4 rounded border border-gray-800">
              <h4 className="text-sm font-medium text-white mb-2">1. Raw Score</h4>
              <p className="text-xs text-gray-400">
                Based on number of wallets holding the token and their social credibility. Higher scores indicate more credible holders.
              </p>
            </div>
            <div className="bg-black/20 p-4 rounded border border-gray-800">
              <h4 className="text-sm font-medium text-white mb-2">2. Diversity Adjustment</h4>
              <p className="text-xs text-gray-400">
                Applies a concentration penalty (HHI) to tokens held by few wallets. A more equal distribution results in a higher score.
              </p>
            </div>
            <div className="bg-black/20 p-4 rounded border border-gray-800">
              <h4 className="text-sm font-medium text-white mb-2">3. Market Cap Adjustment</h4>
              <p className="text-xs text-gray-400">
                Applies a tiered penalty based on the holder-to-market cap ratio to identify artificially inflated tokens.
              </p>
            </div>
            <div className="bg-black/20 p-4 rounded border border-gray-800">
              <h4 className="text-sm font-medium text-white mb-2">4. Normalization</h4>
              <p className="text-xs text-gray-400">
                Final scores are converted to a 0-100 scale for easier comparison, with higher scores indicating stronger token health.
              </p>
            </div>
          </div>
          <p className="mt-4">
            Tokens with higher believer scores typically have a stronger community of credible holders and a more balanced token distribution.
          </p>
        </div>
      </div>
    </div>
  )
}