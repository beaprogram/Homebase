import { useQuery } from '@tanstack/react-query'
import { getListing, searchListings } from '../api/listings'
import type { SearchParams } from '../types'

export const useListings = (params: SearchParams) =>
  useQuery({
    queryKey: ['listings', params],
    queryFn: () => searchListings(params),
    placeholderData: (prev) => prev,
  })

export const useListing = (id: number) =>
  useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListing(id),
    enabled: !!id,
  })
