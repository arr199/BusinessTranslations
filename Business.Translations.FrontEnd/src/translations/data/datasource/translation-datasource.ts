import { ApiError } from "../../../../core/errors/Errors";
import type {
  BtGetTranslationsResponse,
  BtTranslationModel,
  Translation,
} from "../../domain/types";
import { fetchApi } from "./fetch-api-helper";

export const translationsDataSource = {
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
      ? `/bt/translations?${params.toString()}`
      : "/bt/translations";

    const response = await fetchApi<BtGetTranslationsResponse>(url);

    if (!response.success) {
      throw new ApiError(500, response.error || response.message);
    }

    return {
      items: (response.data || []).map(mapBtTranslationToUi),
      totalCount: response.totalCount ?? 0,
    };
  },

  create: (translation: Omit<Translation, "id">) =>
    fetchApi<Translation>("/bt/translations", {
      method: "POST",
      body: JSON.stringify({
        moduleId: Number(translation.moduleId),
        languageId: Number(translation.languageId),
        keyName: translation.keyName,
        value: translation.value,
      }),
    }),

  update: (id: string, value: string, status?: string) =>
    fetchApi<{ success: boolean }>(`/bt/translations/${id}`, {
      method: "PUT",
      body: JSON.stringify({ value, ...(status && { status }) }),
    }),

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/bt/translations/${id}`, {
      method: "DELETE",
    }),

  bulkDelete: (ids: string[]) =>
    fetchApi<{ success: boolean }>("/bt/translations", {
      method: "DELETE",
      body: JSON.stringify({ ids: ids.map(Number) }),
    }),
};

function normalizeStatus(status: string): Translation["status"] {
  const s = (status || "").toLowerCase();
  if (s === "verified" || s === "missing" || s === "pending") return s;
  return "pending";
}

function mapBtTranslationToUi(t: BtTranslationModel): Translation {
  return {
    id: String(t.id),
    module: t.module?.name ?? String(t.moduleId),
    keyName: t.keyName,
    language: t.language?.name ?? `Language ${t.languageId}`,
    languageCode: (t.language?.code ?? String(t.languageId)).toUpperCase(),
    value: t.value ?? "",
    status: normalizeStatus(t.status),
    languageId: t.languageId.toString(),
    moduleId: t.moduleId.toString(),
  };
}
