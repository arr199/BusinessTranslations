export interface Translation {
  id: string;
  module: string;
  key: string;
  language: string;
  languageCode: string;
  value: string;
  status: "verified" | "missing" | "pending";
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
  createAt?: string;
  updatedAt?: string;

  module: BtModuleModel;
  language: BtLanguageModel;
};

export type BtGetTranslationsResponse = {
  success: boolean;
  message: string;
  error: string | null;
  data: BtTranslationModel[];
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
