'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TokenData } from '../lib/types'

export default function Home() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<keyof TokenData>('believerScore')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')
  
  const router = useRouter()

  useEffect(() => {
    async function fetchTokens() {
      try {
        const response = await fetch('/api/tokens')
        if (!response.ok) throw new Error('Failed to fetch tokens')
        const data = await response.json()
        setTokens(data.fcs_data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTokens()
  }, [])

  // Sort tokens
  const sortedTokens = [...tokens].sort((a, b) => {
    const aValue = a[sortField] ?? 0
    const bValue = b[sortField] ?? 0
    
    return sortDirection === 'asc' 
      ? (aValue < bValue ? -1 : 1)
      : (aValue > bValue ? -1 : 1)
  })

  // Filter tokens
  const filteredTokens = sortedTokens.filter(token => 
    token.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    token.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle sort click
  const handleSort = (field: keyof TokenData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Format number with commas and decimal precision
  const formatNumber = (num: number | null, decimals = 2): string => {
    if (num === null) return 'N/A'
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }

  // Format percentage
  const formatPercent = (num: number | null): string => {
    if (num === null) return 'N/A'
    return `${num.toFixed(2)}%`
  }

  // Format market cap
  const formatMarketCap = (num: number | null): string => {
    if (num === null) return 'N/A'
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }
  
  // Get color class based on score
  const getScoreColorClass = (score: number | null): string => {
    if (score === null) return '';
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-mid';
    return 'score-low';
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold gradient-text mb-2">
          Token Believer Analytics
        </h1>
        <p className="text-gray-400 max-w-2xl">
          Comprehensive analysis of token holder engagement, concentration metrics, and social credibility indicators.
        </p>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">
            {filteredTokens.length} tokens
          </span>
          <div className="h-4 border-r border-gray-700"></div>
          <span className="text-sm text-gray-400">
            Sorted by: {String(sortField).replace(/([A-Z])/g, ' $1').toLowerCase()}
          </span>
        </div>
        
        <div className="w-72 relative">
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-black/30 border border-gray-800 rounded-md focus:outline-none focus:border-purple-500/50 text-sm"
          />
          <div className="absolute right-3 top-2.5 text-gray-500">
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-gray-500 hover:text-gray-300"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="data-card p-20 text-center">
          <div className="animate-pulse">
            <div className="h-6 w-32 bg-gray-700 rounded mx-auto mb-4"></div>
            <div className="h-4 w-64 bg-gray-800 rounded mx-auto"></div>
          </div>
        </div>
      ) : (
        <div className="data-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full token-table">
              <thead>
                <tr className="bg-black/30">
                  <th className="text-left cursor-pointer hover:bg-black/40" onClick={() => handleSort('name')}>
                    Token {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-right cursor-pointer hover:bg-black/40" onClick={() => handleSort('believerScore')}>
                    Believer Score {sortField === 'believerScore' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-right cursor-pointer hover:bg-black/40" onClick={() => handleSort('marketCap')}>
                    Market Cap {sortField === 'marketCap' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-right cursor-pointer hover:bg-black/40" onClick={() => handleSort('walletCount')}>
                    Holders {sortField === 'walletCount' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-right cursor-pointer hover:bg-black/40" onClick={() => handleSort('warpcastPercentage')}>
                    Social % {sortField === 'warpcastPercentage' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-right cursor-pointer hover:bg-black/40" onClick={() => handleSort('avgSocialCredScore')}>
                    Social Cred {sortField === 'avgSocialCredScore' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTokens.map((token) => (
                  <tr key={token.address}>
                    <td>
                      <div>
                        <div className="font-medium">{token.name}</div>
                        <div className="text-xs text-gray-400 flex items-center space-x-1">
                          <span>{token.symbol}</span>
                          <span className="px-1">•</span>
                          <span className="font-mono text-[10px] truncate max-w-[120px]">{token.address}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className={`font-semibold ${getScoreColorClass(token.believerScore)}`}>
                        {token.believerScore ? token.believerScore.toFixed(2) : 'N/A'}
                      </div>
                    </td>
                    <td className="text-right">{formatMarketCap(token.marketCap)}</td>
                    <td className="text-right">{token.walletCount?.toLocaleString() || 'N/A'}</td>
                    <td className="text-right">{formatPercent(token.warpcastPercentage)}</td>
                    <td className="text-right">{formatNumber(token.avgSocialCredScore)}</td>
                    <td className="text-center">
                      <button 
                        onClick={() => router.push(`/tokens/${token.address}`)}
                        className="btn-action"
                      >
                        View Analysis
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredTokens.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No tokens found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}