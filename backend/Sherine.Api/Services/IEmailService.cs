using System.Threading.Tasks;

namespace Sherine.Api.Services
{
    public interface IEmailService
    {
        Task SendAsync(string toEmail, string subject, string bodyText, byte[]? attachment = null, string? attachmentName = null);
    }
}


