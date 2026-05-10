import client from './client'
import type { SavedListingDto } from '../types'

export const getSavedListings = () =>
  client.get<SavedListingDto[]>('/api/saved-listings').then((r) => r.data)

export const saveListing = (listingId: number) =>
  client.post<SavedListingDto>(`/api/saved-listings/${listingId}`).then((r) => r.data)

export const unsaveListing = (listingId: number) =>
  client.delete(`/api/saved-listings/${listingId}`)
