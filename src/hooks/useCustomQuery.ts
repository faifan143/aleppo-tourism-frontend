import { TourismPlace } from "@/types/type";
import { apiClient } from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";

const fetchTourismPlaces = async (): Promise<TourismPlace[]> => {
  const { data } = await apiClient.get<TourismPlace[]>("/tourism-places");

  console.log("data : ", data);

  return data;
};

export const usePlaces = () => {
  return useQuery({
    queryKey: ["tourism-places"],
    queryFn: fetchTourismPlaces,
  });
};



