'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TokenData } from '../lib/types'

export default function Home() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<keyof TokenData>('believerScore')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [activeTab, setActiveTab] = useState<'table' | 'detail'>('table')
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  
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

  // When a token is selected in the dropdown, navigate to its page
  useEffect(() => {
    if (selectedToken) {
      router.push(`/tokens/${selectedToken}`)
    }
  }, [selectedToken, router])

  // Sort tokens
  const sortedTokens = [...tokens].sort((a, b) => {
    const aValue = a[sortField] ?? 0
    const bValue = b[sortField] ?? 0
    
    return sortDirection === 'asc' 
      ? (aValue < bValue ? -1 : 1)
      : (aValue > bValue ? -1 : 1)
  })

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Token Believer Dashboard</h2>
        
        <div className="w-72">
          <select
            value={selectedToken || ''}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-md focus:outline-none focus:border-white/30"
          >
            <option value="">Select a token...</option>
            {tokens.map((token) => (
              <option key={token.address} value={token.address}>
                {token.name} ({token.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-b border-white/10 mb-6">
        <button 
          className={`px-4 py-2 ${activeTab === 'table' ? 'border-b-2 border-purple-500 text-white' : 'text-gray-400'}`}
          onClick={() => setActiveTab('table')}
        >
          All Tokens
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading token data...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full token-table">
            <thead>
              <tr className="bg-black/20">
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort('name')}>
                  Token {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right cursor-pointer" onClick={() => handleSort('believerScore')}>
                  Believer Score {sortField === 'believerScore' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right cursor-pointer" onClick={() => handleSort('marketCap')}>
                  Market Cap {sortField === 'marketCap' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right cursor-pointer" onClick={() => handleSort('walletCount')}>
                  Holders {sortField === 'walletCount' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right cursor-pointer" onClick={() => handleSort('warpcastPercentage')}>
                  Social % {sortField === 'warpcastPercentage' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right cursor-pointer" onClick={() => handleSort('avgSocialCredScore')}>
                  Social Cred {sortField === 'avgSocialCredScore' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedTokens.map((token) => (
                <tr key={token.address} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-white">{token.name}</div>
                      <div className="text-sm opacity-70">{token.symbol}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-semibold text-blue-400">
                      {token.believerScore ? token.believerScore.toFixed(2) : 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">{formatMarketCap(token.marketCap)}</td>
                  <td className="px-4 py-3 text-right">{token.walletCount?.toLocaleString() || 'N/A'}</td>
                  <td className="px-4 py-3 text-right">{formatPercent(token.warpcastPercentage)}</td>
                  <td className="px-4 py-3 text-right">{formatNumber(token.avgSocialCredScore)}</td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => router.push(`/tokens/${token.address}`)}
                      className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded text-xs"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}