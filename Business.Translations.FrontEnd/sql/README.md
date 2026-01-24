# Database Schema Setup

This directory contains the SQL scripts needed to set up the database tables for the Business Translations system.

## Files

- **create_tables.sql** - Complete SQL script to create all required tables

## Tables

### 1. Languages

Stores all available languages for translations.

**Columns:**

- `Id` - Primary key, identity (auto-increment)
- `Code` - Language code (e.g., 'EN', 'ES'), unique, max 5 characters
- `Name` - Full language name (e.g., 'English'), max 50 characters
- `IsActive` - Bit flag to enable/disable language
- `CreatedAt` - Datetime of creation

### 2. Modules

Organizes translations by application modules or features.

**Columns:**

- `Id` - Primary key, identity (auto-increment)
- `Name` - Module name, unique, max 100 characters
- `Slug` - URL-friendly identifier, unique, max 100 characters
- `Icon` - Icon identifier, max 50 characters
- `Description` - Module description (NVARCHAR(MAX))
- `CreatedAt` - Datetime of creation

### 3. Translations

Stores translation key-value pairs for each language and module.

**Columns:**

- `Id` - Primary key, identity (auto-increment)
- `ModuleId` - Foreign key to Modules table
- `KeyName` - Translation key identifier, max 255 characters
- `LanguageId` - Foreign key to Languages table
- `Value` - Translated text (NVARCHAR(MAX))
- `Status` - Translation status ('pending', 'verified', 'missing')
- `CreatedAt` - Datetime of creation
- `UpdatedAt` - Datetime of last update (auto-updated via trigger)

**Constraints:**

- Foreign keys with CASCADE delete
- Unique constraint on (ModuleId, KeyName, LanguageId)
- Multiple indexes for optimized queries

## Installation Options

### Option 1: Manual Installation

1. Open SQL Server Management Studio (SSMS) or Azure Data Studio
2. Connect to your SQL Server instance
3. Create your database (if not exists)
4. Run the `create_tables.sql` script

```sql
-- In SSMS or Azure Data Studio
USE YourDatabaseName;
GO
-- Then run the create_tables.sql script
```

Or via command line:

```bash
sqlcmd -S your_server -d your_database -i create_tables.sql
```

### Option 2: Using the Dashboard

1. Launch the Business Translations Dashboard
2. When prompted, click "Run Migration"
3. The system will automatically create the tables via API

### Option 3: Copy & Paste

1. Open the Dashboard
2. Click "Copy All SQL" in the Database Schema modal
3. Paste and execute in SSMS or Azure Data Studio

## Verification

After running the migration, verify the tables were created:

```sql
-- List all tables
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE';

-- Check table structures
EXEC sp_help 'Languages';
EXEC sp_help 'Modules';
EXEC sp_help 'Translations';

-- Verify indexes
EXEC sp_helpindex 'Languages';
EXEC sp_helpindex 'Modules';
EXEC sp_helpindex 'Translations';
```

## Sample Data

The script includes commented-out sample data. Uncomment these sections to populate initial languages and modules:

```sql
-- Uncomment these lines in create_tables.sql
INSERT INTO Languages (Code, Name, IsActive) VALUES
(N'EN', N'English', 1),
(N'ES', N'Spanish', 1),
(N'FR', N'French', 1);
```

## Compatibility

- SQL Server 2016+
- Azure SQL Database
- Character set: Unicode (NVARCHAR supports all languages including emojis)
- Identity columns for auto-increment
  -- Automatic UpdatedAt trigger included

## Notes

- All text columns use NVARCHAR for full Unicode support
- IDENTITY(1,1) provides auto-incrementing primary keys
- Datetime columns use DATETIME2 for better precision
- Trigger automatically updates `UpdatedAt` column
- In the actual SQL script, column names use PascalCase (e.g., `CreatedAt`, `ModuleId`)
- Indexes are optimized for common query patterns
- Foreign keys ensure referential integrity with CASCADE delete

## Rollback

To remove all tables:

```sql
DROP TABLE IF EXISTS Translations;
DROP TABLE IF EXISTS Modules;
DROP TABLE IF EXISTS Languages;
```

⚠️ **Warning:** This will delete all translation data!

## Entity Framework Core

If using EF Core, you can scaffold these tables:

```bash
dotnet ef dbcontext scaffold "Server=your_server;Database=your_db;Trusted_Connection=True;" Microsoft.EntityFrameworkCore.SqlServer -o Models
```

## Support

For issues or questions, refer to the main project documentation.
