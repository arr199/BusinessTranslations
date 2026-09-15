export interface Translation {
  id: string;
  languageId: string;
  moduleId: string;
  language: string;
  module: string;
  keyName: string;
  languageCode: string;
  value: string;
  status: "verified" | "missing" | "pending";
}

export interface CreateTranslationRequest {
  moduleId: string;
  languageId: string;
  keyName: string;
  value: string;
}

export interface Module {
  id: string;
  name: string;
  icon: string;
  isActive?: boolean;
}

export interface UiLanguage {
  id: string;
  code: string;
  name: string;
  isActive?: boolean;
}

export type BtModuleModel = {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BtLanguageModel = {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type BtTranslationModel = {
  id: number;
  moduleId: number;
  languageId: number;
  keyName: string;
  value: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;

  module: BtModuleModel;
  language: BtLanguageModel;
};

export type BtGetTranslationsResponse = {
  success: boolean;
  message: string;
  error: string | null;
  data: BtTranslationModel[];
  totalCount: number;
};

export type CsvTranslationRow = {
  module: string;
  keyName: string;
  languageCode: string;
  value: string;
};

export type TranslationRowOutcome = {
  key: string;
  reason: string;
};

export type BulkImportSummary = {
  created: number;
  updated: number;
  skipped: TranslationRowOutcome[];
  failed: TranslationRowOutcome[];
};

export type BtBulkImportResponse = {
  success: boolean;
  message: string;
  error: string | null;
  data: BulkImportSummary;
};

export type BtGetModulesResponse = {
  success: boolean;
  message: string;
  error: string | null;
  data: BtModuleModel[];
};

export type BtGetLanguagesResponse = {
  success: boolean;
  message: string;
  error: string | null;
  data: BtLanguageModel[];
};
