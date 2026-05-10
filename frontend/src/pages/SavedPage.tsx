import { Link } from 'react-router-dom'
import { useSavedListings, useUnsaveListing } from '../hooks/useSavedListings'
import Spinner from '../components/ui/Spinner'
import ListingCard from '../components/listings/ListingCard'
import Button from '../components/ui/Button'

export default function SavedPage() {
  const { data: saved, isLoading } = useSavedListings()

  if (isLoading) {
    return <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Saved Listings</h1>

      {!saved || saved.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="font-medium">No saved listings yet</p>
          <p className="text-sm mt-1 mb-4">Browse listings and click the heart to save them</p>
          <Link to="/">
            <Button variant="secondary">Browse listings</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {saved.map((sl) => (
            <ListingCard key={sl.id} listing={sl.listing} />
          ))}
        </div>
      )}
    </div>
  )
}
