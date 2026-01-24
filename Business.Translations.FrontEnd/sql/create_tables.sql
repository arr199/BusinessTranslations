-- ============================================================================
-- Business Translations System - Database Schema
-- ============================================================================
-- Description: Creates tables for multi-language translation management
-- Compatible with: SQL Server 2016+
-- Version: 1.0.0
-- Created: January 2026
-- ============================================================================

-- Drop existing tables if they exist (optional - remove if you want to preserve data)
-- DROP TABLE IF EXISTS Translations;
-- DROP TABLE IF EXISTS Modules;
-- DROP TABLE IF EXISTS Languages;

-- ============================================================================
-- Table: Languages
-- Description: Stores all available languages for translations
-- ============================================================================
CREATE TABLE Languages (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(5) UNIQUE NOT NULL,
    Name NVARCHAR(50) NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
CREATE INDEX idx_code ON Languages(Code);
CREATE INDEX idx_is_active ON Languages(IsActive);

-- ============================================================================
-- Table: Modules
-- Description: Organizes translations by application modules or features
-- ============================================================================
CREATE TABLE Modules (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) UNIQUE NOT NULL,
    Slug NVARCHAR(100) UNIQUE NOT NULL,
    Icon NVARCHAR(50),
    Description NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
CREATE INDEX idx_slug ON Modules(Slug);

-- ============================================================================
-- Table: Translations
-- Description: Stores translation key-value pairs for each language and module
-- ============================================================================
CREATE TABLE Translations (
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
CREATE INDEX idx_status ON Translations(Status);

-- ============================================================================
-- Optional: Trigger to update UpdatedAt automatically
-- ============================================================================
GO
CREATE TRIGGER trg_translations_updated_at
ON Translations
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE t
    SET UpdatedAt = GETUTCDATE()
    FROM Translations t
    INNER JOIN inserted i ON t.Id = i.Id;
END;
GO

-- ============================================================================
-- Sample Data (Optional - uncomment to insert)
-- ============================================================================

-- Insert default languages
-- INSERT INTO Languages (Code, Name, IsActive) VALUES
-- (N'EN', N'English', 1),
-- (N'ES', N'Spanish', 1),
-- (N'FR', N'French', 1),
-- (N'DE', N'German', 1),
-- (N'IT', N'Italian', 1);

-- Insert sample modules
-- INSERT INTO Modules (Name, Slug, Icon, Description) VALUES
-- (N'Authentication', N'auth', N'🔐', N'User login and registration'),
-- (N'Dashboard', N'dashboard', N'📊', N'Main dashboard interface'),
-- (N'Settings', N'settings', N'⚙️', N'Application settings');

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check tables were created successfully
-- SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';

-- Verify table structures
-- EXEC sp_help 'Languages';
-- EXEC sp_help 'Modules';
-- EXEC sp_help 'Translations';

-- Check indexes
-- EXEC sp_helpindex 'Languages';
-- EXEC sp_helpindex 'Modules';
-- EXEC sp_helpindex 'Translations';

-- ============================================================================
-- End of Schema Creation
-- ============================================================================
