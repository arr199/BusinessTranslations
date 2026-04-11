export interface TableSchema {
  name: string;
  description: string;
  schema: string;
  sql: string;
}

export const DATABASE_SCHEMAS: TableSchema[] = [
  {
    name: "Languages",
    description: "Stores all available languages for translations",
    schema: `Id:         integer [primary key, identity]
Code:       nvarchar(5) [unique, not null]
Name:       nvarchar(50) [not null]
IsActive:   bit [default: 1]
CreatedAt:  datetime2`,
    sql: `CREATE TABLE Languages (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Code NVARCHAR(5) UNIQUE NOT NULL,
  Name NVARCHAR(50) NOT NULL,
  IsActive BIT DEFAULT 1,
  CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
CREATE INDEX idx_code ON Languages(Code);
CREATE INDEX idx_is_active ON Languages(IsActive);`,
  },
  {
    name: "Modules",
    description: "Organizes translations by application modules or features",
    schema: `Id:         integer [primary key, identity]
Name:       nvarchar(100) [unique, not null]
Slug:       nvarchar(100) [unique, not null]
Icon:       nvarchar(50)
Description: nvarchar(max)
CreatedAt:  datetime2`,
    sql: `CREATE TABLE Modules (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(100) UNIQUE NOT NULL,
  Slug NVARCHAR(100) UNIQUE NOT NULL,
  Icon NVARCHAR(50),
  Description NVARCHAR(MAX),
  CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
CREATE INDEX idx_slug ON Modules(Slug);`,
  },
  {
    name: "Translations",
    description:
      "Stores translation key-value pairs for each language and module",
    schema: `Id:          integer [primary key, identity]
  ModuleId:    integer [foreign key -> Modules.Id]
  KeyName:     nvarchar(255) [not null]
  LanguageId:  integer [foreign key -> Languages.Id]
  Value:       nvarchar(max)
  Status:      nvarchar(20) [default: 'pending']
  CreatedAt:   datetime2
  UpdatedAt:   datetime2`,
    sql: `CREATE TABLE Translations (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ModuleId INT NOT NULL,
    KeyName NVARCHAR(255) NOT NULL,
    LanguageId INT NOT NULL,
    Value NVARCHAR(MAX),
    Status NVARCHAR(20) DEFAULT 'pending',
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_translations_modules FOREIGN KEY (ModuleId) REFERENCES Modules(Id) ON DELETE CASCADE,
    CONSTRAINT FK_translations_languages FOREIGN KEY (LanguageId) REFERENCES Languages(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_translation UNIQUE (ModuleId, KeyName, LanguageId)
  );
  CREATE INDEX idx_module_id ON Translations(ModuleId);
  CREATE INDEX idx_language_id ON Translations(LanguageId);
  CREATE INDEX idx_key_name ON Translations(KeyName);
  CREATE INDEX idx_status ON Translations(Status);`,
  },
];

// Complete SQL script for all tables
export const COMPLETE_SQL_SCRIPT = DATABASE_SCHEMAS.map(
  (table) => table.sql,
).join("\n\n");

// Helper function to get SQL for a specific table
export function getTableSQL(tableName: string): string | undefined {
  return DATABASE_SCHEMAS.find((table) => table.name === tableName)?.sql;
}
