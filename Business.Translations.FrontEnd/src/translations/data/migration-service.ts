/**
 * Migration Service
 * Handles database schema migration operations
 */

import { COMPLETE_SQL_SCRIPT } from "../presentation/constants/databaseSchema";

export interface MigrationResponse {
  success: boolean;
  message: string;
  tablesCreated?: string[];
  errors?: string[];
}

export interface MigrationStatus {
  isInitialized: boolean;
  tablesExist: string[];
  tablesMissing: string[];
  lastChecked: Date;
}

/**
 * Run database migration to create tables
 * @param apiBaseUrl - Base URL for the API
 * @returns Migration response with success status
 */
export async function runMigration(
  apiBaseUrl: string = "/api",
): Promise<MigrationResponse> {
  try {
    const response = await fetch(`${apiBaseUrl}/createTables`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Migration failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Migration error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
      errors: [
        error instanceof Error ? error.message : "Unknown error occurred",
      ],
    };
  }
}

/**
 * Check migration status - whether tables exist
 * @param apiBaseUrl - Base URL for the API
 * @returns Migration status with table information
 */
export async function checkMigrationStatus(
  apiBaseUrl: string = "/api",
): Promise<MigrationStatus> {
  try {
    const response = await fetch(`${apiBaseUrl}/migration/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check migration status: ${response.status}`);
    }

    const data = await response.json();
    return {
      ...data,
      lastChecked: new Date(),
    };
  } catch (error) {
    console.error("Migration status check error:", error);
    return {
      isInitialized: false,
      tablesExist: [],
      tablesMissing: ["Languages", "Modules", "Translations"],
      lastChecked: new Date(),
    };
  }
}

/**
 * Get the complete SQL script for manual execution
 * @returns Complete SQL script as string
 */
export function getMigrationSQL(): string {
  return COMPLETE_SQL_SCRIPT;
}

/**
 * Download migration SQL as a file
 * @param filename - Name of the file to download
 */
export function downloadMigrationSQL(
  filename: string = "create_tables.sql",
): void {
  const blob = new Blob([COMPLETE_SQL_SCRIPT], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Verify tables exist by checking if we can query them
 * @param apiBaseUrl - Base URL for the API
 * @returns Array of table names that exist
 */
export async function verifyTables(
  apiBaseUrl: string = "/api",
): Promise<string[]> {
  const tables = [
    { apiRoute: "languages", tableName: "Languages" },
    { apiRoute: "modules", tableName: "Modules" },
    { apiRoute: "translations", tableName: "Translations" },
  ];
  const existingTables: string[] = [];

  for (const table of tables) {
    try {
      const response = await fetch(`${apiBaseUrl}/${table.apiRoute}/count`, {
        method: "GET",
      });

      if (response.ok) {
        existingTables.push(table.tableName);
      }
    } catch (error) {
      // Table doesn't exist or is not accessible
      console.debug(`Table ${table.tableName} verification failed:`, error);
    }
  }

  return existingTables;
}

// Export for use in components
export const migrationService = {
  runMigration,
  checkMigrationStatus,
  getMigrationSQL,
  downloadMigrationSQL,
  verifyTables,
};
