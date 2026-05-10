import type { Listing } from '../../types'
import ListingCard from './ListingCard'
import Spinner from '../ui/Spinner'

interface ListingGridProps {
  listings: Listing[]
  isLoading: boolean
  totalElements?: number
}

export default function ListingGrid({ listings, isLoading, totalElements }: ListingGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="font-medium">No listings found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div>
      {totalElements != null && (
        <p className="text-sm text-slate-500 mb-4">{totalElements.toLocaleString()} listings found</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
    </div>
  )
}
