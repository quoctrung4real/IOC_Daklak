using Backend.Models;

namespace Backend.Services;

public interface ITextToSpeechService
{
    Task<TextToSpeechResponseDto> SynthesizeAsync(TextToSpeechRequestDto request, CancellationToken cancellationToken);
}
