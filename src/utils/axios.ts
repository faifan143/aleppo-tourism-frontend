/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance } from "axios";

interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
}

const createApiClient = ({
  baseURL,
  timeout = 10000,
}: ApiClientConfig): AxiosInstance => {
  const api = axios.create({
    baseURL,
    timeout,
    headers: { "Content-Type": "application/json" },
    // withCredentials: true,
  });

  return api;
};

const api = createApiClient({
  baseURL: "http://localhost:8000",
});

export const apiClient = {
  get: <T>(url: string): Promise<{ data: T }> => api.get(url),
  post: <T>(url: string, data?: unknown): Promise<{ data: T }> =>
    api.post(url, data),
  put: <T>(url: string, data?: unknown): Promise<{ data: T }> =>
    api.put(url, data),
  patch: <T>(url: string, data?: unknown): Promise<{ data: T }> =>
    api.patch(url, data),
  delete: <T>(url: string): Promise<{ data: T }> => api.delete(url),
};

export const tourismApi = {
  getAll: () => api.get("/tourism-places"),
  create: (formData: FormData) =>
    api.post("/tourism-places/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: number, data: any) =>
    api.patch(`/tourism-places/update/${id}`, data),
  delete: (id: number) => api.delete(`/tourism-places/delete/${id}`),
  addPhotos: (id: number, formData: FormData) =>
    api.post(`/tourism-places/${id}/photos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
