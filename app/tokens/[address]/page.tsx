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
    return <div className="text-center py-20">Loading token data...</div>
  }

  if (!token) {
    return (
      <div className="text-center py-20">
        <div className="text-xl mb-4">Token not found</div>
        <Link href="/" className="text-blue-400 hover:underline">
          Return to tokens list
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-gray-400 hover:text-white text-sm">
            ← Back to Tokens
          </Link>
          <h1 className="text-3xl font-bold mt-2">
            {token.name} <span className="text-xl opacity-70 ml-2">{token.symbol}</span>
          </h1>
          <div className="text-xs mt-1 text-gray-400 font-mono">
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
            <strong>Believer Score</strong> is a composite measure of token holder engagement and quality, normalized to a 0-100 scale.
          </p>
          <p>
            The score is calculated in multiple stages:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li><strong>Raw Score:</strong> Based on number of holders and their social reputation</li>
            <li><strong>Diversity Adjustment:</strong> Applies a concentration penalty to tokens held by few wallets</li>
            <li><strong>Market Cap Adjustment:</strong> Applies a tiered penalty based on the holder-to-market cap ratio</li>
            <li><strong>Normalization:</strong> Final scores are converted to a 0-100 scale for easier comparison</li>
          </ol>
          <p>
            Tokens with higher believer scores typically have a stronger community of credible holders and a more balanced token distribution.
          </p>
        </div>
      </div>
    </div>
  )
}