interface TourismPhoto {
  id: number;
  url: string;
  tourismPlaceId: number;
  createdAt: string;
}

interface TourismPlace {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  coverImage: string;
  adminId: number;
  createdAt: string;
  updatedAt: string;
  photos: TourismPhoto[];
}

export type { TourismPlace, TourismPhoto };
