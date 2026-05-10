import { useState } from 'react'
import type { SearchParams } from '../../types'
import { TORONTO_NEIGHBOURHOODS } from '../../types'
import Button from '../ui/Button'

interface SearchFiltersProps {
  onSearch: (params: SearchParams) => void
  initialParams?: SearchParams
}

export default function SearchFilters({ onSearch, initialParams = {} }: SearchFiltersProps) {
  const [neighbourhood, setNeighbourhood] = useState(initialParams.neighbourhood ?? '')
  const [type, setType] = useState<SearchParams['type']>(initialParams.type ?? '')
  const [minPrice, setMinPrice] = useState(initialParams.minPrice?.toString() ?? '')
  const [maxPrice, setMaxPrice] = useState(initialParams.maxPrice?.toString() ?? '')
  const [minBedrooms, setMinBedrooms] = useState(initialParams.minBedrooms?.toString() ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch({
      neighbourhood: neighbourhood || undefined,
      type: type || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minBedrooms: minBedrooms ? Number(minBedrooms) : undefined,
      page: 0,
    })
  }

  const handleReset = () => {
    setNeighbourhood('')
    setType('')
    setMinPrice('')
    setMaxPrice('')
    setMinBedrooms('')
    onSearch({ page: 0 })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <h2 className="font-semibold text-slate-800">Filters</h2>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Neighbourhood</label>
        <select
          value={neighbourhood}
          onChange={(e) => setNeighbourhood(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All neighbourhoods</option>
          {TORONTO_NEIGHBOURHOODS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
        <div className="flex gap-2">
          {(['', 'RENTAL', 'SALE'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${
                type === t
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-slate-200 text-slate-600 hover:border-primary-400'
              }`}
            >
              {t === '' ? 'All' : t === 'RENTAL' ? 'Rental' : 'For Sale'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Min Price</label>
          <input
            type="number"
            placeholder="$0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Max Price</label>
          <input
            type="number"
            placeholder="No limit"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Min Bedrooms</label>
        <select
          value={minBedrooms}
          onChange={(e) => setMinBedrooms(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Any</option>
          <option value="0">Studio+</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
        </select>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">Search</Button>
        <Button type="button" variant="secondary" onClick={handleReset}>Reset</Button>
      </div>
    </form>
  )
}
