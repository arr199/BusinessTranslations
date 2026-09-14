#!/bin/bash
# Local-dev only: creates the TranslationsAPI database that
# Business.Translations.SampleApp/appsettings.json points at (Initial Catalog=TranslationsAPI).
# Tables themselves are created by the package via the dashboard
# (POST /bt/createTables); DEBUG builds also seed sample data there.
set -e

: "${MSSQL_SA_PASSWORD:?MSSQL_SA_PASSWORD is required}"

echo "Waiting for SQL Server to accept connections..."
until /opt/mssql-tools18/bin/sqlcmd -C -S sqlserver -U sa -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1" -b -o /dev/null; do
  sleep 2
done

echo "Ensuring TranslationsAPI database exists..."
/opt/mssql-tools18/bin/sqlcmd -C -S sqlserver -U sa -P "$MSSQL_SA_PASSWORD" \
  -Q "IF DB_ID('TranslationsAPI') IS NULL CREATE DATABASE [TranslationsAPI]" -b

echo "TranslationsAPI database ready."
