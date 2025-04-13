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
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const tokensPerPage = 15
  
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

  // Pagination logic
  const indexOfLastToken = currentPage * tokensPerPage
  const indexOfFirstToken = indexOfLastToken - tokensPerPage
  const currentTokens = filteredTokens.slice(indexOfFirstToken, indexOfLastToken)
  const totalPages = Math.ceil(filteredTokens.length / tokensPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

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
    if (score >= 70) return 'bg-emerald-900/30';
    if (score >= 50) return 'bg-emerald-800/30';
    if (score >= 30) return 'bg-emerald-700/30';
    if (score >= 20) return 'bg-yellow-800/30';
    if (score >= 10) return 'bg-yellow-900/30';
    return 'bg-red-900/30';
  }

  // Truncate address
  const truncateAddress = (address: string): string => {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
          All Tokens
        </h1>
        <p className="text-gray-400 max-w-2xl text-base mt-1">
          Comprehensive analysis of token holder engagement, concentration metrics, and social credibility indicators.
        </p>
      </div>
      
      <Tabs defaultValue="all-tokens" className="w-full mb-6">
        <div className="mb-6">
          <TabsList className="bg-black/30 p-1 rounded-lg">
            <TabsTrigger value="all-tokens" className="px-6 py-2 text-sm">
              All Tokens
            </TabsTrigger>
            <TabsTrigger value="select-token" className="px-6 py-2 text-sm">
              Select a Token
            </TabsTrigger>
          </TabsList>
        </div>
        
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
                className="w-full px-4 py-3 bg-black/30 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
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
            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-800 shadow-lg p-20 text-center">
              <LoadingSpinner size="lg" message="Loading token dashboard..." />
            </div>
          ) : (
            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-800 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-black/40 border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-black/50" 
                          onClick={() => handleSort('name')}>
                        Token {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-black/50" 
                          onClick={() => handleSort('believerScore')}>
                        Believer Score {sortField === 'believerScore' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-black/50" 
                          onClick={() => handleSort('marketCap')}>
                        Market Cap {sortField === 'marketCap' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-black/50" 
                          onClick={() => handleSort('walletCount')}>
                        Holders {sortField === 'walletCount' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-black/50" 
                          onClick={() => handleSort('warpcastPercentage')}>
                        Social % {sortField === 'warpcastPercentage' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-black/50" 
                          onClick={() => handleSort('avgSocialCredScore')}>
                        Social Cred {sortField === 'avgSocialCredScore' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTokens.map((token, index) => (
                      <tr 
                        key={token.address}
                        className={`border-b border-gray-800/50 hover:bg-black/40 transition-colors
                          ${index % 2 === 0 ? 'bg-black/20' : 'bg-black/10'}`}
                      >
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-semibold text-white">{token.name}</div>
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
                        <td className="py-4 px-4 text-right">
                          <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${getScoreBgClass(token.believerScore)}`}>
                            <span className={`font-semibold ${getScoreColorClass(token.believerScore)}`}>
                              {token.believerScore ? token.believerScore.toFixed(2) : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-medium">{formatMarketCap(token.marketCap)}</td>
                        <td className="py-4 px-4 text-right font-medium">{token.walletCount?.toLocaleString() || 'N/A'}</td>
                        <td className="py-4 px-4 text-right font-medium">{formatPercent(token.warpcastPercentage)}</td>
                        <td className="py-4 px-4 text-right font-medium">{formatNumber(token.avgSocialCredScore)}</td>
                        <td className="py-4 px-4 text-center">
                          <button 
                            onClick={() => router.push(`/tokens/${token.address}`)}
                            className="px-4 py-1.5 bg-purple-800/30 text-purple-300 hover:bg-purple-800/50 rounded-md transition-all border border-purple-700/50 text-sm font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}

                    {currentTokens.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400">
                          No tokens found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-gray-800 bg-black/30">
                  <div className="text-sm text-gray-500">
                    Showing {indexOfFirstToken + 1}-{Math.min(indexOfLastToken, filteredTokens.length)} of {filteredTokens.length}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'text-gray-600 bg-black/20' : 'text-gray-300 bg-black/40 hover:bg-black/60'}`}
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNumber = currentPage > 3 ? 
                        (currentPage - 2) + i : 
                        i + 1;
                        
                      if (pageNumber <= totalPages) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`px-3 py-1 rounded-md ${pageNumber === currentPage ? 'bg-purple-800/50 text-white' : 'bg-black/30 text-gray-400 hover:bg-black/50'}`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                      return null;
                    })}
                    <button
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'text-gray-600 bg-black/20' : 'text-gray-300 bg-black/40 hover:bg-black/60'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="select-token">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-800 shadow-lg p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Select a Token to View</h3>
            <div className="flex flex-col items-center justify-center gap-6">
              <p className="text-gray-400 max-w-md">
                Choose a token from the &quot;All Tokens&quot; tab or search for a specific token to view detailed analysis
              </p>
              <button 
                onClick={() => {
                  // Find and click the "all-tokens" tab
                  const allTokensTab = document.querySelector('[role="tab"][value="all-tokens"]') as HTMLElement;
                  if (allTokensTab) {
                    allTokensTab.click();
                  }
                }}
                className="px-5 py-2.5 bg-purple-800/30 text-purple-300 hover:bg-purple-800/50 rounded-lg transition-all border border-purple-700/50 text-base font-medium"
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