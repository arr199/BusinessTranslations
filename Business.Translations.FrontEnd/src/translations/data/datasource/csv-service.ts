import type { Translation } from "../../domain/types";

export function exportTranslationsCsv(translations: Translation[]) {
  const headers = ["module", "keyName", "languageCode", "value"];
  const rows = translations.map((t) =>
    [t.module, t.keyName, t.languageCode, t.value].map(escapeCsv),
  );

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `translations-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCsvFile(
  file: File,
): Promise<
  { module: string; keyName: string; languageCode: string; value: string }[]
> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim());

      if (lines.length < 2) {
        reject(new Error("CSV file is empty or has no data rows."));
        return;
      }

      const headerLine = lines[0].toLowerCase();
      const headers = parseCsvLine(headerLine).map((h) => h.trim());

      const moduleIdx = headers.indexOf("module");
      const keyIdx = headers.indexOf("keyname");
      const langIdx = headers.indexOf("languagecode");
      const valueIdx = headers.indexOf("value");

      if (
        moduleIdx === -1 ||
        keyIdx === -1 ||
        langIdx === -1 ||
        valueIdx === -1
      ) {
        reject(
          new Error(
            "CSV must have columns: module, keyName, languageCode, value",
          ),
        );
        return;
      }

      const rows = lines.slice(1).map((line) => {
        const cols = parseCsvLine(line);
        return {
          module: (cols[moduleIdx] ?? "").trim(),
          keyName: (cols[keyIdx] ?? "").trim(),
          languageCode: (cols[langIdx] ?? "").trim(),
          value: (cols[valueIdx] ?? "").trim(),
        };
      });

      resolve(rows);
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsText(file);
  });
}

function escapeCsv(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}
