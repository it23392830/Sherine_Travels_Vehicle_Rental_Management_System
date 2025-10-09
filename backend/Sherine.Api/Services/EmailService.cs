using MailKit.Net.Smtp;
using MimeKit;
using MimeKit.Utils;

namespace Sherine.Api.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendAsync(string toEmail, string subject, string bodyText, byte[]? attachment = null, string? attachmentName = null)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Sherine Travels", _config["Smtp:From"]));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;

            var builder = new BodyBuilder { TextBody = bodyText };
            if (attachment != null)
            {
                var name = string.IsNullOrWhiteSpace(attachmentName) ? "invoice.pdf" : attachmentName;
                builder.Attachments.Add(name, attachment, new ContentType("application", "pdf"));
            }
            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            var host = _config["Smtp:Host"] ?? "";
            var port = int.TryParse(_config["Smtp:Port"], out var p) ? p : 587;
            await client.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTlsWhenAvailable);

            var user = _config["Smtp:User"];
            var pass = _config["Smtp:Pass"];
            if (!string.IsNullOrWhiteSpace(user))
            {
                await client.AuthenticateAsync(user, pass);
            }
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}


