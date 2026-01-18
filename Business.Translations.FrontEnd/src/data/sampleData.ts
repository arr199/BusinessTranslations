import type { Module, Translation } from "../types";

export interface Language {
  code: string;
  name: string;
}

export const SAMPLE_LANGUAGES: Language[] = [
  { code: "EN", name: "English" },
  { code: "ES", name: "Spanish" },
  { code: "FR", name: "French" },
  { code: "DE", name: "German" },
  { code: "IT", name: "Italian" },
  { code: "PT", name: "Portuguese" },
];

export const SAMPLE_MODULES: Module[] = [
  { id: "1", name: "All Modules", icon: "apps", isActive: true },
  { id: "2", name: "Auth", icon: "lock", isActive: false },
  { id: "3", name: "Common", icon: "public", isActive: false },
  { id: "4", name: "Billing", icon: "receipt_long", isActive: false },
  { id: "5", name: "Dashboard", icon: "dashboard", isActive: false },
  { id: "6", name: "Notifications", icon: "mail", isActive: false },
  { id: "7", name: "Storefront", icon: "shopping_cart", isActive: false },
];

export const SAMPLE_TRANSLATIONS: Translation[] = [
  {
    id: "1",
    module: "Auth",
    key: "login_welcome_header",
    language: "English",
    languageCode: "EN",
    value: "Welcome back! Please login.",
    status: "verified",
  },
  {
    id: "2",
    module: "Auth",
    key: "login_welcome_header",
    language: "Spanish",
    languageCode: "ES",
    value: "¡Bienvenido de nuevo! Por favor, ingrese.",
    status: "verified",
  },
  {
    id: "3",
    module: "Common",
    key: "btn_save_changes",
    language: "French",
    languageCode: "FR",
    value: "",
    status: "missing",
  },
  {
    id: "4",
    module: "Billing",
    key: "invoice_total_label",
    language: "English",
    languageCode: "EN",
    value: "Grand Total Amount",
    status: "verified",
  },
  {
    id: "5",
    module: "Billing",
    key: "invoice_total_label",
    language: "German",
    languageCode: "DE",
    value: "Gesamtbetrag",
    status: "verified",
  },
  {
    id: "6",
    module: "Dashboard",
    key: "welcome_message",
    language: "English",
    languageCode: "EN",
    value: "Welcome to your dashboard",
    status: "verified",
  },
  {
    id: "7",
    module: "Dashboard",
    key: "welcome_message",
    language: "Italian",
    languageCode: "IT",
    value: "Benvenuto nella tua dashboard",
    status: "verified",
  },
  {
    id: "8",
    module: "Common",
    key: "btn_cancel",
    language: "English",
    languageCode: "EN",
    value: "Cancel",
    status: "verified",
  },
  {
    id: "9",
    module: "Common",
    key: "btn_cancel",
    language: "Portuguese",
    languageCode: "PT",
    value: "Cancelar",
    status: "verified",
  },
  {
    id: "10",
    module: "Notifications",
    key: "new_notification",
    language: "French",
    languageCode: "FR",
    value: "",
    status: "missing",
  },
];
