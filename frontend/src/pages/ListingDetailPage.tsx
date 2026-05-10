import { useParams, useNavigate } from 'react-router-dom'
import { useListing } from '../hooks/useListings'
import { useSaveListing, useUnsaveListing, useSavedListings } from '../hooks/useSavedListings'
import { useAuthStore } from '../store/authStore'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import AskPanel from '../components/ai/AskPanel'

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: listing, isLoading, error } = useListing(Number(id))
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const { data: saved } = useSavedListings()
  const saveMutation = useSaveListing()
  const unsaveMutation = useUnsaveListing()

  const isSaved = saved?.some((sl) => sl.listing.id === Number(id))

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  if (error || !listing) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-slate-500">Listing not found.</p>
      <Button variant="secondary" className="mt-4" onClick={() => navigate('/')}>Back to search</Button>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-primary-600 mb-4 flex items-center gap-1">
        ← Back
      </button>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Image */}
        <div className="h-64 bg-slate-100">
          {listing.imageUrl ? (
            <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={listing.type === 'RENTAL' ? 'blue' : 'green'}>
                  {listing.type === 'RENTAL' ? 'Rental' : 'For Sale'}
                </Badge>
                <span className="text-sm text-slate-400">{listing.neighbourhood}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-800">{listing.title}</h1>
              <p className="text-slate-500 mt-1">{listing.address}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-primary-600">
                ${listing.price?.toLocaleString()}{listing.type === 'RENTAL' ? '/mo' : ''}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-5 py-4 border-t border-slate-100">
            {listing.bedrooms != null && (
              <div className="text-center">
                <p className="text-xl font-bold text-slate-800">
                  {listing.bedrooms === 0 ? 'Studio' : listing.bedrooms}
                </p>
                <p className="text-xs text-slate-500">Bedrooms</p>
              </div>
            )}
            {listing.bathrooms != null && (
              <div className="text-center">
                <p className="text-xl font-bold text-slate-800">{listing.bathrooms}</p>
                <p className="text-xs text-slate-500">Bathrooms</p>
              </div>
            )}
            {listing.sqft != null && (
              <div className="text-center">
                <p className="text-xl font-bold text-slate-800">{listing.sqft.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Sqft</p>
              </div>
            )}
          </div>

          {listing.description && (
            <div className="mt-4">
              <h2 className="font-semibold text-slate-700 mb-2">Description</h2>
              <p className="text-slate-600 text-sm leading-relaxed">{listing.description}</p>
            </div>
          )}

          {/* Save button */}
          {isAuthenticated && (
            <div className="mt-6">
              <Button
                variant={isSaved ? 'secondary' : 'primary'}
                onClick={() => isSaved ? unsaveMutation.mutate(listing.id) : saveMutation.mutate(listing.id)}
                loading={saveMutation.isPending || unsaveMutation.isPending}
              >
                {isSaved ? '♥ Saved — click to unsave' : '♡ Save listing'}
              </Button>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-4">Source: {listing.source}</p>
        </div>
      </div>

      <div className="mt-8">
        <AskPanel />
      </div>
    </div>
  )
}
