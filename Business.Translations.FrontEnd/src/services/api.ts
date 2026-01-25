import type { Translation, Module } from "../types";
import type { Language } from "../data/sampleData";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// API error class
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// Generic fetch wrapper
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || `Request failed with status ${response.status}`,
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, "Network error or server unavailable");
  }
}

// Translations API
export const translationsApi = {
  getAll: () => fetchApi<Translation[]>("/translations"),

  getById: (id: string) => fetchApi<Translation>(`/translations/${id}`),

  create: (translation: Omit<Translation, "id">) =>
    fetchApi<Translation>("/translations", {
      method: "POST",
      body: JSON.stringify(translation),
    }),

  update: (id: string, value: string) =>
    fetchApi<Translation>(`/translations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ value }),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/translations/${id}`, {
      method: "DELETE",
    }),
};

// Modules API
export const modulesApi = {
  getAll: () => fetchApi<Module[]>("/modules"),

  getById: (id: string) => fetchApi<Module>(`/modules/${id}`),

  create: (module: Omit<Module, "id">) =>
    fetchApi<Module>("/modules", {
      method: "POST",
      body: JSON.stringify(module),
    }),

  update: (id: string, module: Partial<Module>) =>
    fetchApi<Module>(`/modules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(module),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/modules/${id}`, {
      method: "DELETE",
    }),
};

// Languages API
export const languagesApi = {
  getAll: () => fetchApi<Language[]>("/languages"),

  getById: (code: string) => fetchApi<Language>(`/languages/${code}`),

  create: (language: Language) =>
    fetchApi<Language>("/languages", {
      method: "POST",
      body: JSON.stringify(language),
    }),

  update: (code: string, language: Partial<Language>) =>
    fetchApi<Language>(`/languages/${code}`, {
      method: "PATCH",
      body: JSON.stringify(language),
    }),

  delete: (code: string) =>
    fetchApi<void>(`/languages/${code}`, {
      method: "DELETE",
    }),
};
