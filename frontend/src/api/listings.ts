import client from './client'
import type { Listing, Page, SearchParams } from '../types'

export const searchListings = (params: SearchParams) =>
  client.get<Page<Listing>>('/api/listings', { params }).then((r) => r.data)

export const getListing = (id: number) =>
  client.get<Listing>(`/api/listings/${id}`).then((r) => r.data)
