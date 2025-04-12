'use client'

import { Believer } from '@/lib/types'
import { useState } from 'react'

interface TopBelieversTableProps {
  believers: Believer[]
}

export default function TopBelieversTable({ believers }: TopBelieversTableProps) {
  const [sortBy, setSortBy] = useState<keyof Believer>('fcred')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: keyof Believer) => {
    if (field === sortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('desc')
    }
  }

  const sortedBelievers = [...believers].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : 1
    } else {
      return aValue > bValue ? -1 : 1
    }
  })

  // Get color class based on score
  const getScoreColorClass = (score: number): string => {
    if (score >= 7) return 'score-high';
    if (score >= 3) return 'score-mid';
    return 'score-low';
  }

  return (
    <div className="data-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Top Believers</h3>
        <div className="text-xs text-gray-500">
          {believers.length} accounts
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full token-table">
          <thead>
            <tr className="bg-black/30">
              <th className="text-left cursor-pointer hover:bg-black/40" onClick={() => handleSort('username')}>
                Username {sortBy === 'username' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-left cursor-pointer hover:bg-black/40" onClick={() => handleSort('fid')}>
                FID {sortBy === 'fid' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-right cursor-pointer hover:bg-black/40" onClick={() => handleSort('fcred')}>
                Social Cred {sortBy === 'fcred' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedBelievers.map((believer) => (
              <tr key={believer.fid}>
                <td>
                  <div>
                    <div className="font-medium">{believer.username}</div>
                    <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">{believer.bio}</div>
                  </div>
                </td>
                <td>{believer.fid}</td>
                <td className="text-right">
                  <span className={`font-medium ${getScoreColorClass(believer.fcred)}`}>
                    {believer.fcred.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
            
            {believers.length === 0 && (
              <tr>
                <td colSpan={3} className="py-12 text-center text-gray-400">
                  No believer data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}