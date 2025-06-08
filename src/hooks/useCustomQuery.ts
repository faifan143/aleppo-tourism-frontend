import { TourismPlace } from "@/types/type";
import { apiClient } from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";

// Define query keys as constants for consistent usage
export const QUERY_KEYS = {
  ALL_PLACES: ['tourism-places'],
  PLACE_DETAILS: (id: number) => ['tourism-place', id],
  REVIEWS: (placeId: number) => ['reviews', placeId],
  USER_REVIEWS: ['userReviews'],
};

/**
 * Fetch all tourism places
 */
const fetchTourismPlaces = async (): Promise<TourismPlace[]> => {
  const data = await apiClient.get<TourismPlace[]>("/tourism-places");
  console.log("Fetched all places: ", data);
  return data;
};

/**
 * Fetch a single tourism place by ID
 */
const fetchTourismPlaceById = async (id: number): Promise<TourismPlace> => {
  const data = await apiClient.get<TourismPlace>(`/tourism-places/${id}`);
  console.log(`Fetched place ${id}:`, data);
  return data;
};

/**
 * Hook to fetch all places with optimized caching
 */
export const usePlaces = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ALL_PLACES,
    queryFn: fetchTourismPlaces,
    staleTime: 0, // Consider data always stale to ensure fresh data
    refetchOnWindowFocus: true,
    refetchOnMount: true, // Always refetch when component mounts
    refetchInterval: 5000, // Refetch every 5 seconds when component is visible
    retry: 1,
  });
};

/**
 * Hook to fetch a single place by ID
 */
export const usePlaceById = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.PLACE_DETAILS(id),
    queryFn: () => fetchTourismPlaceById(id),
    enabled: !!id, // Only run query when id is available
    staleTime: 0, // Consider data always stale
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 5000, // Refetch every 5 seconds when component is visible
  });
};



