import { ApiError } from "../../../../core/errors/Errors";
import type { BtGetModulesResponse, Module } from "../../domain/types";
import { fetchApi } from "./fetch-api-helper";

type ApiResult = { success: boolean; message: string };

export const modulesDataSource = {
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

  create: (module: Omit<Module, "id">) =>
    fetchApi<ApiResult>("/bt/modules", {
      method: "POST",
      body: JSON.stringify({ name: module.name, icon: module.icon }),
    }),

  update: (id: string, module: Partial<Module>) =>
    fetchApi<ApiResult>(`/bt/modules/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name: module.name, icon: module.icon }),
    }),

  delete: (id: string) =>
    fetchApi<ApiResult>(`/bt/modules/${id}`, {
      method: "DELETE",
    }),
};
