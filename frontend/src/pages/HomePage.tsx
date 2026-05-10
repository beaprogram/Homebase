import { useState } from 'react'
import type { SearchParams } from '../types'
import { useListings } from '../hooks/useListings'
import SearchFilters from '../components/listings/SearchFilters'
import ListingGrid from '../components/listings/ListingGrid'
import Pagination from '../components/ui/Pagination'
import AskPanel from '../components/ai/AskPanel'

export default function HomePage() {
  const [params, setParams] = useState<SearchParams>({ page: 0, size: 18 })
  const { data, isLoading } = useListings(params)

  const handleSearch = (newParams: SearchParams) =>
    setParams((prev) => ({ ...prev, ...newParams, size: prev.size }))

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page }))

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Find your next home in Toronto</h1>
          <p className="text-primary-200 text-lg">
            Search thousands of rental and for-sale listings. Filter by neighbourhood, transit access, and price.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Panel */}
        <div className="mb-8">
          <AskPanel />
        </div>

        {/* Content grid */}
        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <SearchFilters onSearch={handleSearch} initialParams={params} />
          </aside>

          {/* Listings */}
          <div className="flex-1 min-w-0">
            {/* Mobile filters */}
            <div className="lg:hidden mb-4">
              <SearchFilters onSearch={handleSearch} initialParams={params} />
            </div>

            <ListingGrid
              listings={data?.content ?? []}
              isLoading={isLoading}
              totalElements={data?.totalElements}
            />

            {data && (
              <Pagination
                currentPage={data.number}
                totalPages={data.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
