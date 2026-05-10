export type ListingType = 'RENTAL' | 'SALE'

export interface Listing {
  id: number
  title: string
  description: string
  address: string
  neighbourhood: string
  price: number
  bedrooms: number
  bathrooms: number
  sqft: number
  type: ListingType
  latitude: number
  longitude: number
  source: string
  imageUrl?: string
  createdAt: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface AuthResponse {
  token: string
  email: string
  name: string
}

export interface SavedListingDto {
  id: number
  listing: Listing
  savedAt: string
}

export interface SearchParams {
  neighbourhood?: string
  type?: ListingType | ''
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  page?: number
  size?: number
}

export interface AskResponse {
  answer: string
  listings: Listing[]
  query_time_ms: number
}

export const TORONTO_NEIGHBOURHOODS = [
  'Annex',
  'Beaches',
  'Distillery District',
  'Downtown',
  'East York',
  'Etobicoke',
  'Forest Hill',
  'Leaside',
  'Leslieville',
  'Midtown',
  'North York',
  'Roncesvalles',
  'Scarborough',
  'Trinity Bellwoods',
  'Yorkville',
] as const
