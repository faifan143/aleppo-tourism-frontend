/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

// Use direct backend URL
const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Add request interceptor to include the auth token if available
api.interceptors.request.use((config) => {
  // Use a single access_token for both users and admins
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Get error response data
    const errorData = error.response?.data as any;
    const errorMessage = errorData?.message || "حدث خطأ في الاتصال بالخادم";

    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      // Clear token
      Cookies.remove("access_token");

      // Show error toast
      toast.error("انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.");

      // Redirect to login if we're in a browser environment
      if (typeof window !== "undefined") {
        // Check if we're not already on the login page to avoid redirect loops
        const path = window.location.pathname;
        if (!path.includes("/login") && !path.includes("/admin-login")) {
          window.location.href = path.includes("/admin") ? "/admin-login" : "/login";
        }
      }
    }
    // Handle 403 Forbidden - no permission
    else if (error.response?.status === 403) {
      toast.error("ليس لديك صلاحية للقيام بهذه العملية");
    }
    // Handle 404 Not Found
    else if (error.response?.status === 404) {
      toast.error("المورد المطلوب غير موجود");
    }
    // Handle 422 Validation Error 
    else if (error.response?.status === 422) {
      if (errorData?.errors) {
        // Format validation errors
        const validationErrors = Object.values(errorData.errors).flat();
        validationErrors.forEach((err: unknown) => {
          if (typeof err === 'string') {
            toast.error(err);
          }
        });
      } else {
        toast.error(errorMessage);
      }
    }
    // Handle 500 Server Error
    else if (error.response?.status && error.response?.status >= 500) {
      toast.error("حدث خطأ في الخادم. يرجى المحاولة لاحقاً");
    }
    // Handle network errors
    else if (error.code === 'ECONNABORTED') {
      toast.error("انتهت مهلة الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.");
    }
    // Handle other errors
    else {
      console.error("API Error:", error);
    }

    return Promise.reject(error);
  }
);

// Helper function to extract API error messages
export const extractErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return "حدث خطأ غير معروف";
};

// API client with simplified methods
export const apiClient = {
  get: async <T>(url: string): Promise<T> => {
    try {
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error(`GET ${url} failed:`, error);
      throw error;
    }
  },

  post: async <T>(url: string, data?: unknown): Promise<T> => {
    try {
      const response = await api.post(url, data);
      return response.data;
    } catch (error) {
      console.error(`POST ${url} failed:`, error);
      throw error;
    }
  },

  put: async <T>(url: string, data?: unknown): Promise<T> => {
    try {
      const response = await api.put(url, data);
      return response.data;
    } catch (error) {
      console.error(`PUT ${url} failed:`, error);
      throw error;
    }
  },

  patch: async <T>(url: string, data?: unknown): Promise<T> => {
    try {
      const response = await api.patch(url, data);
      return response.data;
    } catch (error) {
      console.error(`PATCH ${url} failed:`, error);
      throw error;
    }
  },

  delete: async <T>(url: string): Promise<T> => {
    try {
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      console.error(`DELETE ${url} failed:`, error);
      throw error;
    }
  },
};

// Tourism-specific API functions
export const tourismApi = {
  getAll: () => api.get("/tourism-places"),

  getById: (id: number) =>
    api.get(`/tourism-places/${id}`),

  create: (formData: FormData) => {
    // Temporary fix: Check if adminId is missing and add it with a hardcoded value
    if (!formData.has('adminId')) {
      console.log("Adding default adminId to request");
      formData.append('adminId', '1'); // Using a default adminId of 1 for testing
    }

    return api.post("/tourism-places/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id: number, data: any) =>
    api.patch(`/tourism-places/update/${id}`, data, {
      headers: data instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" }
    }),

  delete: (id: number) =>
    api.delete(`/tourism-places/delete/${id}`),

  addPhotos: (id: number, formData: FormData) =>
    api.post(`/tourism-places/${id}/photos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Events API functions
export const eventsApi = {
  getAll: async () => {
    const response = await api.get("/events");
    return response.data;
  },

  getByPlaceId: async (tourismPlaceId: number) => {
    const response = await api.get(`/events/place/${tourismPlaceId}`);
    return response.data;
  },

  getUpcoming: async () => {
    const response = await api.get("/events/upcoming");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  create: async (formData: FormData) => {
    const response = await api.post("/events", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  update: async (id: number, formData: FormData) => {
    const response = await api.patch(`/events/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};
