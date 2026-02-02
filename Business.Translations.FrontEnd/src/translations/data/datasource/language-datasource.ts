import { ApiError } from "../../../../core/errors/Errors";
import type { BtGetLanguagesResponse, UiLanguage } from "../../domain/types";
import { fetchApi } from "./fetch-api-helper";




export const languagesDataSource = {
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
