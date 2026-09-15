namespace Business.Translations.DTOs;

public class BulkCreateTranslationsRequest
{
    public required BulkTranslationRow[] Rows { get; set; }
}

public class BulkTranslationRow
{
    // CSV-sourced rows often carry stray whitespace — trim at the boundary
    // so validation and storage both see normalized values.
    private string _module = "";
    private string _keyName = "";
    private string _languageCode = "";
    private string _value = "";

    public required string Module { get => _module; set => _module = value?.Trim() ?? ""; }
    public required string KeyName { get => _keyName; set => _keyName = value?.Trim() ?? ""; }
    public required string LanguageCode { get => _languageCode; set => _languageCode = value?.Trim() ?? ""; }
    public required string Value { get => _value; set => _value = value?.Trim() ?? ""; }
}

public class BulkCreateTranslationsResponse : ApiResponse<BulkImportSummary> { }

public class BulkImportSummary
{
    public int Created { get; set; }
    public int Updated { get; set; }
    public List<TranslationRowOutcome> Skipped { get; set; } = [];
    public List<TranslationRowOutcome> Failed { get; set; } = [];
}

public class TranslationRowOutcome
{
    public required string Key { get; set; }
    public required string Reason { get; set; }
}
