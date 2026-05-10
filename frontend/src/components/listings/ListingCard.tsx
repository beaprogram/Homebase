import { Link } from 'react-router-dom'
import type { Listing } from '../../types'
import Badge from '../ui/Badge'
import { useSaveListing, useUnsaveListing, useSavedListings } from '../../hooks/useSavedListings'
import { useAuthStore } from '../../store/authStore'

interface ListingCardProps {
  listing: Listing
}

function formatPrice(price: number, type: Listing['type']) {
  if (type === 'RENTAL') {
    return `$${price.toLocaleString()}/mo`
  }
  return `$${price.toLocaleString()}`
}

export default function ListingCard({ listing }: ListingCardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const { data: saved } = useSavedListings()
  const saveMutation = useSaveListing()
  const unsaveMutation = useUnsaveListing()

  const isSaved = saved?.some((sl) => sl.listing.id === listing.id)

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isSaved) {
      unsaveMutation.mutate(listing.id)
    } else {
      saveMutation.mutate(listing.id)
    }
  }

  return (
    <Link to={`/listings/${listing.id}`} className="block group">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative h-48 bg-slate-100">
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge variant={listing.type === 'RENTAL' ? 'blue' : 'green'}>
              {listing.type === 'RENTAL' ? 'Rental' : 'For Sale'}
            </Badge>
          </div>
          {isAuthenticated && (
            <button
              onClick={handleSaveToggle}
              className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:scale-110 transition-transform"
            >
              <svg
                className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'fill-none text-slate-400'}`}
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs text-slate-400 mb-1">{listing.neighbourhood}</p>
          <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
            {listing.title}
          </h3>
          <p className="text-lg font-bold text-primary-600 mt-2">
            {formatPrice(listing.price, listing.type)}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            {listing.bedrooms != null && (
              <span>{listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} bed`}</span>
            )}
            {listing.bathrooms != null && <span>{listing.bathrooms} bath</span>}
            {listing.sqft != null && <span>{listing.sqft.toLocaleString()} sqft</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}
