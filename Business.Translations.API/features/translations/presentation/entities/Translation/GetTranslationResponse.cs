using Business.Translations.API.features.translations.data.models;

namespace Business.Translations.DTOs;

public class GetTranslationResponse : ApiResponse<List<TranslationModel>>
{
    public int TotalCount { get; set; }
}
