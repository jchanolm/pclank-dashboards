'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TokenData } from '../lib/types'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function Home() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<keyof TokenData>('believerScore')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('all-tokens')
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  
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

  // Copy address to clipboard
  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 3000);
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
    if (score >= 70) return 'text-emerald-400';
    if (score >= 50) return 'text-emerald-300';
    if (score >= 30) return 'text-emerald-200';
    if (score >= 20) return 'text-yellow-300';
    if (score >= 10) return 'text-yellow-200';
    return 'text-red-400';
  }

  // Get background color class based on score
  const getScoreBgClass = (score: number | null): string => {
    if (score === null) return '';
    if (score >= 70) return 'bg-emerald-400/20';
    if (score >= 50) return 'bg-emerald-300/20';
    if (score >= 30) return 'bg-emerald-200/20';
    if (score >= 20) return 'bg-yellow-300/20';
    if (score >= 10) return 'bg-yellow-200/20';
    return 'bg-red-400/20';
  }

  // Truncate address
  const truncateAddress = (address: string): string => {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">
          Product Clank Tokens Dashboard
        </h1>
        <p className="text-gray-400 max-w-2xl text-base mt-1">
          Comprehensive analysis of token holder engagement, concentration metrics, and social credibility indicators.
        </p>
      </div>
      
      <Tabs defaultValue="all-tokens" className="w-full mb-6" 
        onValueChange={(value) => setSelectedTab(value)}>
        <TabsList className="mb-4 bg-black/30 p-1 rounded-lg">
          <TabsTrigger value="all-tokens" className="px-6 py-2">
            All Tokens
          </TabsTrigger>
          <TabsTrigger value="select-token" className="px-6 py-2">
            Select a Token
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-tokens">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="text-sm text-gray-400 font-medium">
                {filteredTokens.length} tokens
              </span>
              <div className="hidden sm:block h-4 border-r border-gray-700"></div>
              <span className="text-sm text-gray-400 font-medium">
                Sorted by: {String(sortField).replace(/([A-Z])/g, ' $1').toLowerCase()}
                {sortDirection === 'desc' ? ' (high to low)' : ' (low to high)'}
              </span>
            </div>
            
            <div className="w-full sm:w-72 relative">
              <input
                type="text"
                placeholder="Search by name, symbol, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-gray-800 rounded-md focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="data-card p-20 text-center">
              <LoadingSpinner 
                size="lg" 
                message="Loading token dashboard..." 
                className="py-16"
              />
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
                            <div className="font-medium text-base">{token.name}</div>
                            <div className="text-sm text-gray-400">{token.symbol}</div>
                            <div className="mt-1">
                              <span 
                                className="text-xs font-mono bg-black/20 px-2 py-1 rounded cursor-pointer hover:bg-black/30 transition-colors flex items-center max-w-fit"
                                onClick={() => copyToClipboard(token.address)}
                                title="Click to copy"
                              >
                                {truncateAddress(token.address)}
                                {copiedAddress === token.address && (
                                  <span className="ml-2 text-green-400 text-xs">✓ Copied</span>
                                )}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="text-right">
                          <div className={`inline-flex items-center px-2.5 py-1 rounded ${getScoreBgClass(token.believerScore)}`}>
                            <span className={`font-semibold ${getScoreColorClass(token.believerScore)}`}>
                              {token.believerScore ? token.believerScore.toFixed(2) : 'N/A'}
                            </span>
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
        </TabsContent>
        
        <TabsContent value="select-token">
          <div className="data-card p-8 text-center">
            <h3 className="text-xl mb-4">Select a Token to View</h3>
            <div className="flex flex-col items-center justify-center gap-6">
              <p className="text-gray-400 max-w-md">
                Choose a token from the "All Tokens" tab or search for a specific token to view detailed analysis
              </p>
              <button 
                onClick={() => setSelectedTab('all-tokens')}
                className="btn-action text-base py-2 px-4"
              >
                View All Tokens
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}