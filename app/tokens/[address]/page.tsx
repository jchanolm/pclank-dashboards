'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { TokenData, Believer } from '@/lib/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"
import { ExternalLink } from 'lucide-react'

export default function TokenDetailPage() {
  const [token, setToken] = useState<TokenData | null>(null)
  const [believers, setBelievers] = useState<Believer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedBio, setExpandedBio] = useState<number | null>(null)
  const believersPerPage = 10
  
  const params = useParams()
  const address = typeof params.address === 'string' ? params.address : Array.isArray(params.address) ? params.address[0] : ''

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        
        // Get all tokens to find the specific one
        const tokensResponse = await fetch('/api/tokens')
        if (!tokensResponse.ok) {
          throw new Error('Failed to fetch tokens list')
        }
        
        const tokensData = await tokensResponse.json()
        const foundToken = tokensData.fcs_data.find(
          (t: TokenData) => t.address.toLowerCase() === address.toLowerCase()
        )
        
        if (foundToken) {
          setToken(foundToken)
          
          // Get the token's top believers
          try {
            const believersUrl = `/api/tokens/${address}/believers`
            
            const believersResponse = await fetch(believersUrl)
            
            if (!believersResponse.ok) {
              const errorText = await believersResponse.text()
              throw new Error(`Failed to fetch believers: ${believersResponse.status} ${errorText}`)
            }
            
            const believersData = await believersResponse.json()
            
            if (believersData && believersData.believers) {
              setBelievers(believersData.believers)
              setTotalPages(Math.ceil(believersData.believers.length / believersPerPage))
            } else {
              setError('Unexpected data format from believers endpoint')
            }
          } catch (believersError: unknown) {
            console.error('Believers fetch error:', believersError)
            setError(`Error fetching believers: ${believersError instanceof Error ? believersError.message : String(believersError)}`)
          }
        } else {
          setError('Token not found')
        }
      } catch (error: unknown) {
        console.error('Error:', error)
        setError(`Error: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setLoading(false)
      }
    }
    
    if (address) {
      fetchData()
    }
  }, [address])

  // Pagination logic
  const indexOfLastBeliever = currentPage * believersPerPage
  const indexOfFirstBeliever = indexOfLastBeliever - believersPerPage
  const currentBelievers = believers.slice(indexOfFirstBeliever, indexOfLastBeliever)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-800 shadow-lg p-8 text-center">
          <LoadingSpinner size="lg" message="Loading token data..." />
        </div>
      </div>
    )
  }

  if (!token || error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-800 shadow-lg p-8 text-center">
          <div className="text-xl mb-4 text-red-400">{error || 'Token not found'}</div>
          <Link href="/" className="mt-6 inline-block px-5 py-2.5 bg-purple-800/30 text-purple-300 hover:bg-purple-800/50 rounded-lg transition-all border border-purple-700/50">
            Return to tokens list
          </Link>
        </div>
      </div>
    )
  }

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

  // Format token balance
  const formatBalance = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    if (num === 0) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  }

  // Redirect to Warpcast profile
  const goToWarpcastProfile = (username: string) => {
    window.open(`https://warpcast.com/${username}`, '_blank')
  }

  // Toggle bio expansion
  const toggleBioExpansion = (index: number) => {
    if (expandedBio === index) {
      setExpandedBio(null)
    } else {
      setExpandedBio(index)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <header className="mb-6">
        <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 mb-4 transition-colors">
          <span>←</span>
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                {token.name}
                <span className="text-lg px-3 py-1 bg-black/30 rounded-full text-gray-300">{token.symbol}</span>
              </h1>
              <div className="text-sm mt-2 font-mono text-gray-500 bg-black/20 px-3 py-1.5 rounded-lg">
                {token.address}
              </div>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-lg bg-black/40 border border-gray-700">
              <span className="text-sm text-gray-400 uppercase tracking-wider mb-1">Believer Score</span>
              <span className="text-4xl font-bold text-green-400">
                {token.believerScore?.toFixed(2) || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Key Metrics */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-200">Key Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-gray-800 shadow-lg flex flex-col items-center text-center">
            <div className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">MARKET CAP</div>
            <div className="text-2xl font-bold">{formatMarketCap(token.marketCap)}</div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-gray-800 shadow-lg flex flex-col items-center text-center">
            <div className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">HOLDERS</div>
            <div className="text-2xl font-bold">{token.walletCount?.toLocaleString() || 'N/A'}</div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-gray-800 shadow-lg flex flex-col items-center text-center">
            <div className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">SOCIAL HOLDERS</div>
            <div className="text-2xl font-bold">{token.warpcastWallets?.toLocaleString() || 'N/A'}</div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-gray-800 shadow-lg flex flex-col items-center text-center">
            <div className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">% WALLETS ON WARPCAST</div>
            <div className="text-2xl font-bold">{formatPercent(token.warpcastPercentage)}</div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-gray-800 shadow-lg flex flex-col items-center text-center">
            <div className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">AVG SOCIAL CRED</div>
            <div className="text-2xl font-bold">{token.avgSocialCredScore?.toFixed(2) || 'N/A'}</div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-gray-800 shadow-lg flex flex-col items-center text-center">
            <div className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">HOLDER/MCAP RATIO</div>
            <div className="text-2xl font-bold">{token.holderToMarketCapRatio?.toFixed(4) || 'N/A'}</div>
          </div>
        </div>
      </section>

      {/* Top Believers */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-200">Holders w/Warpcast Account</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">{believers.length} accounts</div>
            <a 
              href={`https://dexscreener.com/base/${token.address}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-4 py-2 bg-purple-800/30 text-purple-300 hover:bg-purple-800/50 rounded-lg transition-all border border-purple-700/50 flex items-center gap-2"
            >
              <span>View all Holders</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
        
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-800 shadow-lg overflow-hidden">
          {believers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-800">
                      <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-[15%]">Username</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-[40%]">Bio</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-right w-[10%]">FID</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-right w-[15%]">Token Balance</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-right w-[20%]">Social Cred</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentBelievers.map((believer, index) => (
                      <React.Fragment key={`${believer.fid}-${index}`}>
                        <TableRow 
                          className="border-b border-gray-800/50 hover:bg-black/40"
                        >
                          <TableCell 
                            className="py-3 cursor-pointer hover:text-purple-300"
                            onClick={() => goToWarpcastProfile(believer.username)}
                          >
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-white">{believer.username}</span>
                              <ExternalLink size={14} className="text-gray-500" />
                            </div>
                          </TableCell>
                          <TableCell 
                            className="py-3 text-gray-400 text-sm cursor-pointer max-w-[300px]"
                            onClick={() => toggleBioExpansion(index)}
                          >
                            {believer.bio ? (
                              <div className={expandedBio === index ? "" : "line-clamp-1 truncate"}>
                                {believer.bio}
                              </div>
                            ) : (
                              <span className="text-gray-600 italic">No bio</span>
                            )}
                          </TableCell>
                          <TableCell className="py-3 text-right text-gray-400">{believer.fid}</TableCell>
                          <TableCell className="py-3 text-right">
                            <div className="text-gray-300 font-mono inline-flex px-2 py-1 bg-black/30 rounded">
                              {formatBalance(believer.balance)}
                            </div>
                          </TableCell>
                          <TableCell className="py-3 text-right">
                            <div className="inline-flex px-3 py-1 rounded-full bg-green-900/30 text-green-400 text-sm font-medium float-right">
                              {believer.fcred.toFixed(2)}
                            </div>
                          </TableCell>
                        </TableRow>
                        {expandedBio === index && believer.bio && (
                          <TableRow className="bg-black/50">
                            <TableCell colSpan={5} className="py-2 px-4 text-gray-300">
                              <div className="text-sm">{believer.bio}</div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-gray-800 bg-black/30">
                  <div className="text-sm text-gray-400">
                    Showing {indexOfFirstBeliever + 1}-{Math.min(indexOfLastBeliever, believers.length)} of {believers.length}
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
            </>
          ) : (
            <div className="p-8 text-center">
              <div className="text-lg text-gray-400 mb-2">No believer data available</div>
              {error && (
                <div className="mt-2 text-red-400 text-sm">{error}</div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}