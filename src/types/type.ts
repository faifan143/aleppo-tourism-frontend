interface TourismPhoto {
  id: number;
  url: string;
  tourismPlaceId: number;
  createdAt: string;
}

interface Review {
  id: number;
  content: string;
  rating: number;
  userId: number;
  tourismPlaceId: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface Event {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  image?: string;
  tourismPlaceId: number;
  createdAt: string;
  updatedAt: string;
}

enum PlaceCategory {
  ARCHAEOLOGICAL = "ARCHAEOLOGICAL",
  RESTAURANT = "RESTAURANT",
  ENTERTAINMENT = "ENTERTAINMENT",
  RELIGIOUS = "RELIGIOUS",
  EDUCATIONAL = "EDUCATIONAL"
}

interface TourismPlace {
  id: number;
  name: string;
  description: string;
  category: PlaceCategory;
  expectedPeakTime: string;
  visitTimeRange?: string;
  latitude: number;
  longitude: number;
  coverImage: string;
  adminId: number;
  createdAt: string;
  updatedAt: string;
  photos: TourismPhoto[];
  reviews: Review[];
  events: Event[];
}

export type { TourismPlace, TourismPhoto, Review, Event };
export { PlaceCategory };
