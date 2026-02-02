import { ApiError } from "../../../../core/errors/Errors";
import type { BtGetModulesResponse, Module } from "../../domain/types";
import { fetchApi } from "./fetch-api-helper";

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
