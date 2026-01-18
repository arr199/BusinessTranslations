# Project Structure

Clean and minimal architecture with Zustand for state management.

## 📁 Folder Structure

```
src/
├── components/       # Reusable UI components
├── data/            # Sample/mock data
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── store/           # Zustand stores
└── types/           # TypeScript interfaces
```

## 🎯 State Management (Zustand)

**Store**: `src/store/translationStore.ts`

Simple, clean state management with Zustand:

```tsx
import { useTranslationStore } from "./store";

function MyComponent() {
  const { translations, updateTranslation } = useTranslationStore();
  // Use state directly - no complex setup needed
}
```

## 📦 Key Files

- **Types**: `src/types/index.ts` - Shared TypeScript interfaces
- **Sample Data**: `src/data/sampleData.ts` - Mock data for development
- **Store**: `src/store/translationStore.ts` - Zustand store for translations
- **Main Page**: `src/pages/TranslationDashboard.tsx` - Main dashboard

## 🚀 Adding New Features

1. **Add types** in `src/types/index.ts`
2. **Create store** in `src/store/` if needed
3. **Build components** in `src/components/`
4. **Use in pages** from `src/pages/`

Keep it simple!
