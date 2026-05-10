import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ListingCard from '../components/listings/ListingCard'
import type { Listing } from '../types'

vi.mock('../store/authStore', () => ({
  useAuthStore: () => ({ isAuthenticated: () => false }),
}))

vi.mock('../hooks/useSavedListings', () => ({
  useSavedListings: () => ({ data: [] }),
  useSaveListing: () => ({ mutate: vi.fn(), isPending: false }),
  useUnsaveListing: () => ({ mutate: vi.fn(), isPending: false }),
}))

const listing: Listing = {
  id: 1,
  title: 'Cozy 1BR in Annex',
  description: 'Nice unit',
  address: '123 Main St',
  neighbourhood: 'Annex',
  price: 1800,
  bedrooms: 1,
  bathrooms: 1,
  sqft: 600,
  type: 'RENTAL',
  latitude: 43.6,
  longitude: -79.4,
  source: 'test',
  createdAt: '2025-01-01T00:00:00Z',
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
)

describe('ListingCard', () => {
  it('renders title and price', () => {
    render(<ListingCard listing={listing} />, { wrapper })
    expect(screen.getByText('Cozy 1BR in Annex')).toBeInTheDocument()
    expect(screen.getByText('$1,800/mo')).toBeInTheDocument()
  })

  it('renders neighbourhood', () => {
    render(<ListingCard listing={listing} />, { wrapper })
    expect(screen.getByText('Annex')).toBeInTheDocument()
  })

  it('renders RENTAL badge', () => {
    render(<ListingCard listing={listing} />, { wrapper })
    expect(screen.getByText('Rental')).toBeInTheDocument()
  })

  it('renders SALE badge for sale listings', () => {
    render(<ListingCard listing={{ ...listing, type: 'SALE', price: 800000 }} />, { wrapper })
    expect(screen.getByText('For Sale')).toBeInTheDocument()
    expect(screen.getByText('$800,000')).toBeInTheDocument()
  })
})
