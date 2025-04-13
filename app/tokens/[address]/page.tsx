'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { TokenData, Believer } from '@/lib/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function TokenDetailPage() {
  const [token, setToken] = useState<TokenData | null>(null)
  const [believers, setBelievers] = useState<Believer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const believersPerPage = 10
  
  const params = useParams()
  const router = useRouter()
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
          } catch (believersError) {
            console.error('Believers fetch error:', believersError)
            setError(`Error fetching believers: ${believersError.message}`)
          }
        } else {
          setError('Token not found')
        }
      } catch (error) {
        console.error('Error:', error)
        setError(`Error: ${error.message}`)
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

  // Redirect to Warpcast profile
  const goToWarpcastProfile = (username: string) => {
    window.open(`https://warpcast.com/${username}`, '_blank')
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
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-gray-800 shadow-lg">
            <div className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">MARKET CAP</div>
            <div className="text-2xl font-bold">{formatMarketCap(token.marketCap)}</div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-gray-800 shadow-lg">
            <div className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">HOLDERS</div>
            <div className="text-2xl font-bold">{token.walletCount?.toLocaleString() || 'N/A'}</div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-gray-800 shadow-lg">
            <div className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">SOCIAL HOLDERS</div>
            <div className="text-2xl font-bold">{token.warpcastWallets?.toLocaleString() || 'N/A'}</div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-gray-800 shadow-lg">
            <div className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">SOCIAL %</div>
            <div className="text-2xl font-bold">{formatPercent(token.warpcastPercentage)}</div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-gray-800 shadow-lg">
            <div className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">AVG SOCIAL CRED</div>
            <div className="text-2xl font-bold">{token.avgSocialCredScore?.toFixed(2) || 'N/A'}</div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-gray-800 shadow-lg">
            <div className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">HOLDER/MCAP RATIO</div>
            <div className="text-2xl font-bold">{token.holderToMarketCapRatio?.toFixed(4) || 'N/A'}</div>
          </div>
        </div>
      </section>

      {/* Top Believers */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-200">Top Believers</h2>
          <div className="text-sm text-gray-500">{believers.length} accounts</div>
        </div>
        
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-800 shadow-lg overflow-hidden">
          {believers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800">USERNAME</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800">FID</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800">SOCIAL CRED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBelievers.map((believer, index) => (
                      <tr 
                        key={`${believer.fid}-${index}`} 
                        className={`${index % 2 === 0 ? 'bg-black/20' : 'bg-black/10'} hover:bg-black/30`}
                      >
                        <td 
                          className="py-3 px-4 cursor-pointer hover:text-purple-300 border-b border-gray-800/30"
                          onClick={() => goToWarpcastProfile(believer.username)}
                        >
                          <div className="font-medium text-white">{believer.username}</div>
                          {believer.bio && (
                            <div className="text-xs text-gray-400 mt-1 line-clamp-1">{believer.bio}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-400 border-b border-gray-800/30">{believer.fid}</td>
                        <td className="py-3 px-4 text-right border-b border-gray-800/30">
                          <div className="inline-flex px-3 py-1 rounded-full bg-green-900/30 text-green-400 text-sm font-medium float-right">
                            {believer.fcred.toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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