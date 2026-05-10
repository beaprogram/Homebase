import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSavedListings, saveListing, unsaveListing } from '../api/savedListings'
import { useAuthStore } from '../store/authStore'

export const useSavedListings = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  return useQuery({
    queryKey: ['saved-listings'],
    queryFn: getSavedListings,
    enabled: isAuthenticated,
  })
}

export const useSaveListing = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: saveListing,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved-listings'] }),
  })
}

export const useUnsaveListing = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: unsaveListing,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved-listings'] }),
  })
}
