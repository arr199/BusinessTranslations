# API Integration Guide

## Overview

The application is now prepared for full API integration with proper loading states, error handling, and best practices.

## Architecture

### API Service Layer (`src/services/api.ts`)

- Centralized API calls with proper error handling
- Generic `fetchApi` wrapper with TypeScript support
- Organized into three API modules:
  - `translationsApi` - CRUD operations for translations
  - `modulesApi` - CRUD operations for modules
  - `languagesApi` - CRUD operations for languages

### State Management (`src/store/translationStore.ts`)

- Zustand store with async actions
- Separate loading states for each resource type
- Centralized error handling
- All CRUD operations return promises for proper async handling

### Custom Hook (`src/hooks/useInitializeData.ts`)

- Handles initial data loading
- Supports both mock data and API calls via environment variable
- Returns loading states and errors

### Loading States (`src/components/LoadingSkeleton.tsx`)

- `TableSkeleton` - Full table skeleton with 8 rows
- `LoadingSpinner` - Reusable spinner with size variants (sm, md, lg)

### Error Handling (`src/components/ErrorBanner.tsx`)

- Dismissible error banner
- Shows API errors to users
- Styled with dark mode support

## Environment Variables

Create a `.env` file in the project root:

```env
# API base URL
VITE_API_URL=http://localhost:5000/api

# Use mock data instead of API (true/false)
VITE_USE_MOCK_DATA=true
```

## API Endpoints Expected

### Translations

- `GET /api/translations` - Get all translations
- `GET /api/translations/:id` - Get translation by ID
- `POST /api/translations` - Create new translation
- `PATCH /api/translations/:id` - Update translation value
- `DELETE /api/translations/:id` - Delete translation

### Modules

- `GET /api/modules` - Get all modules
- `GET /api/modules/:id` - Get module by ID
- `POST /api/modules` - Create new module
- `PATCH /api/modules/:id` - Update module
- `DELETE /api/modules/:id` - Delete module

### Languages

- `GET /api/languages` - Get all languages
- `GET /api/languages/:code` - Get language by code
- `POST /api/languages` - Create new language
- `PATCH /api/languages/:code` - Update language
- `DELETE /api/languages/:code` - Delete language

## Request/Response Format

### Translation Object

```typescript
{
  id: string;
  module: string;
  key: string;
  language: string;
  languageCode: string;
  value: string;
  status: "verified" | "pending" | "missing";
}
```

### Module Object

```typescript
{
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
}
```

### Language Object

```typescript
{
  code: string; // e.g., "EN", "ES"
  name: string; // e.g., "English", "Spanish"
}
```

## Error Handling

The API service throws `ApiError` with:

- `status` - HTTP status code
- `message` - Error message

All store actions catch errors and update the `error` state, which is displayed via `ErrorBanner`.

## Usage

### Switch to API Mode

Set `VITE_USE_MOCK_DATA=false` in your `.env` file and ensure your API is running.

### Add New API Endpoints

1. Add the endpoint function to the appropriate API module in `src/services/api.ts`
2. Add the corresponding action to the store in `src/store/translationStore.ts`
3. Call the action from your component

Example:

```typescript
// In api.ts
export const translationsApi = {
  // ... existing methods
  getByModule: (moduleId: string) =>
    fetchApi<Translation[]>(`/translations?module=${moduleId}`),
};

// In store
bulkUpdate: async (ids: string[], value: string) => {
  set({ error: null });
  try {
    await Promise.all(ids.map((id) => translationsApi.update(id, value)));
    // Update state...
  } catch (error) {
    set({ error: "Failed to bulk update" });
    throw error;
  }
};
```

## Best Practices Applied

1. **Separation of Concerns** - API logic separate from UI components
2. **Type Safety** - Full TypeScript support throughout
3. **Error Handling** - Centralized error handling with user feedback
4. **Loading States** - Skeleton loaders for better UX
5. **Environment Configuration** - Easy switching between mock and real API
6. **Async/Await** - Proper async handling with promises
7. **Single Responsibility** - Each hook/component has one purpose
8. **Reusability** - Generic API wrapper and reusable components
