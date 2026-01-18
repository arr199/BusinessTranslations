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
