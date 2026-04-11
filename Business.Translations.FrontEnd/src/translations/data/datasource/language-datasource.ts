import { ApiError } from "../../../../core/errors/Errors";
import type { BtGetLanguagesResponse, UiLanguage } from "../../domain/types";
import { fetchApi } from "./fetch-api-helper";

type ApiResult = { success: boolean; message: string };

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

  create: (language: { code: string; name: string }) =>
    fetchApi<ApiResult>("/bt/languages", {
      method: "POST",
      body: JSON.stringify(language),
    }),

  update: (id: string, language: Partial<UiLanguage>) =>
    fetchApi<ApiResult>(`/bt/languages/${id}`, {
      method: "PUT",
      body: JSON.stringify(language),
    }),

  delete: (id: string) =>
    fetchApi<ApiResult>(`/bt/languages/${id}`, {
      method: "DELETE",
    }),
};
