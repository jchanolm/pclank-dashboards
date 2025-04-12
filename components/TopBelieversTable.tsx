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

  return (
    <div className="data-card p-4">
      <h3 className="text-lg font-medium mb-4">Top Believers</h3>
      <div className="overflow-x-auto">
        <table className="w-full token-table">
          <thead>
            <tr className="bg-black/20">
              <th className="px-3 py-2 text-left cursor-pointer" onClick={() => handleSort('username')}>
                Username {sortBy === 'username' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-3 py-2 text-left cursor-pointer" onClick={() => handleSort('fid')}>
                FID {sortBy === 'fid' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-3 py-2 text-right cursor-pointer" onClick={() => handleSort('fcred')}>
                Social Cred {sortBy === 'fcred' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedBelievers.map((believer) => (
              <tr key={believer.fid}>
                <td className="px-3 py-2">
                  <div>
                    <div className="font-medium">{believer.username}</div>
                    <div className="text-xs opacity-70 line-clamp-1 max-w-xs">{believer.bio}</div>
                  </div>
                </td>
                <td className="px-3 py-2">{believer.fid}</td>
                <td className="px-3 py-2 text-right font-medium">{believer.fcred.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}