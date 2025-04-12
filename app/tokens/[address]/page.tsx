'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { TokenData, Believer } from '@/lib/types'
import TokenRadarChart from '@/components/TokenRadarChart'
import TopBelieversTable from '@/components/TopBelieversTable'
import TokenMetricsCards from '@/components/TokenMetricsCards'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function TokenDetailPage() {
  const [token, setToken] = useState<TokenData | null>(null)
  const [believers, setBelievers] = useState<Believer[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const params = useParams()
  const address = typeof params.address === 'string' ? params.address : Array.isArray(params.address) ? params.address[0] : ''

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Get all tokens to find the specific one
        const tokensResponse = await fetch('/api/tokens')
        if (!tokensResponse.ok) throw new Error('Failed to fetch tokens')
        
        const tokensData = await tokensResponse.json()
        const foundToken = tokensData.fcs_data.find(
          (t: TokenData) => t.address.toLowerCase() === address.toLowerCase()
        )
        
        if (foundToken) {
          setToken(foundToken)
          
          // Get the token's top believers
          const believersResponse = await fetch(`/api/tokens/${address}/believers`)
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
    
    if (address) {
      fetchData()
    }
  }, [address])

  // Copy address to clipboard
  const copyToClipboard = () => {
    if (token) {
      navigator.clipboard.writeText(token.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 3000);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="data-card p-20 text-center">
          <LoadingSpinner 
            size="lg" 
            message="Loading token data..."
            className="py-16"
          />
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
    if (score >= 30) return 'Moderate';
    return 'Weak';
  }
  
  const getScoreHealthClass = (score: number | null): string => {
    if (score === null) return '';
    if (score >= 70) return 'score-high';
    if (score >= 50) return 'score-high opacity-90';
    if (score >= 30) return 'score-high opacity-75';
    if (score >= 20) return 'score-mid';
    if (score >= 10) return 'score-mid opacity-75';
    return 'score-low';
  }
  
  const getScoreBgClass = (score: number | null): string => {
    if (score === null) return '';
    if (score >= 70) return 'bg-emerald-400/20';
    if (score >= 50) return 'bg-emerald-300/20';
    if (score >= 30) return 'bg-emerald-200/20';
    if (score >= 20) return 'bg-yellow-300/20';
    if (score >= 10) return 'bg-yellow-200/20';
    return 'bg-red-400/20';
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link href="/" className="text-gray-400 hover:text-white text-sm flex items-center space-x-1 mb-4">
            <span>←</span>
            <span>Back to All Tokens</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="text-3xl font-bold">
              {token.name}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-xl opacity-70 px-3 py-1 bg-black/20 rounded">{token.symbol}</span>
              
              <div className={`px-2.5 py-1 text-sm font-medium rounded ${getScoreBgClass(token.believerScore)}`}>
                <span className={getScoreHealthClass(token.believerScore)}>
                  {getScoreHealthStatus(token.believerScore)} ({token.believerScore?.toFixed(2)})
                </span>
              </div>
            </div>
          </div>
          <div 
            className="text-sm mt-2 text-gray-400 font-mono bg-black/20 px-3 py-1.5 rounded cursor-pointer hover:bg-black/30 transition-colors inline-flex items-center"
            onClick={copyToClipboard}
          >
            {token.address}
            {copiedAddress && <span className="ml-2 text-green-400">✓ Copied</span>}
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