import type {
  Translation,
  Module,
  UiLanguage,
  BtTranslationModel,
  BtGetTranslationsResponse,
  BtGetModulesResponse,
  BtGetLanguagesResponse,
} from "../types";
import { ApiError } from "../core/Errors";

function normalizeStatus(status: string): Translation["status"] {
  const s = (status || "").toLowerCase();
  if (s === "verified" || s === "missing" || s === "pending") return s;
  return "pending";
}

function mapBtTranslationToUi(t: BtTranslationModel): Translation {
  return {
    id: String(t.id),
    module: t.module?.name ?? String(t.moduleId),
    key: t.keyName,
    language: t.language?.name ?? `Language ${t.languageId}`,
    languageCode: (t.language?.code ?? String(t.languageId)).toUpperCase(),
    value: t.value ?? "",
    status: normalizeStatus(t.status),
  };
}

// Generic fetch wrapper
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  try {
    const response = await fetch(`${endpoint}`, {
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
  getAll: async (filters?: {
    moduleId?: string;
    languageId?: string;
    keywords?: string;
    limit?: number;
    offset?: number;
  }) => {
    const params = new URLSearchParams();

    const limit = filters?.limit;
    const offset = filters?.offset;
    if (typeof limit === "number") params.set("limit", String(limit));
    if (typeof offset === "number") params.set("offset", String(offset));

    const keywords = filters?.keywords?.trim();
    if (keywords) params.set("keywords", keywords);

    const moduleIdNum = filters?.moduleId ? Number(filters.moduleId) : NaN;
    if (!Number.isNaN(moduleIdNum)) params.set("moduleId", String(moduleIdNum));

    const languageIdNum = filters?.languageId
      ? Number(filters.languageId)
      : NaN;
    if (!Number.isNaN(languageIdNum))
      params.set("languageId", String(languageIdNum));

    const url = params.toString()
      ? `/bt/translation?${params.toString()}`
      : "/bt/translation";

    const response = await fetchApi<BtGetTranslationsResponse>(url);

    if (!response.success) {
      throw new ApiError(500, response.error || response.message);
    }

    return (response.data || []).map(mapBtTranslationToUi);
  },

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
  getAll: async () => {
    const response = await fetchApi<BtGetModulesResponse>("/bt/modules");

    if (!response.success) {
      throw new ApiError(500, response.error || response.message);
    }

    return (response.data || []).map(
      (m): Module => ({
        id: String(m.id),
        name: m.name,
        icon: m.icon ?? "apps",
        isActive: true,
      }),
    );
  },

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
  getAll: async () => {
    const response = await fetchApi<BtGetLanguagesResponse>("/bt/languages");

    if (!response.success) {
      throw new ApiError(500, response.error || response.message);
    }

    return (response.data || []).map(
      (l): UiLanguage => ({
        id: String(l.id),
        code: l.code.toUpperCase(),
        name: l.name,
        isActive: l.isActive,
      }),
    );
  },

  getById: (id: string) => fetchApi<UiLanguage>(`/languages/${id}`),

  create: (language: { code: string; name: string }) =>
    fetchApi<UiLanguage>("/languages", {
      method: "POST",
      body: JSON.stringify(language),
    }),

  update: (id: string, language: Partial<UiLanguage>) =>
    fetchApi<UiLanguage>(`/languages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(language),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/languages/${id}`, {
      method: "DELETE",
    }),
};
