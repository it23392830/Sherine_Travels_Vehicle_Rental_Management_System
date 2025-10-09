using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Sherine.Api.Services
{
    public class PayPalService : IPayPalService
    {
        private readonly HttpClient _httpClient;
        private readonly string _clientId;
        private readonly string _secret;
        private readonly string _baseUrl;

        public PayPalService(IConfiguration configuration)
        {
            _httpClient = new HttpClient();
            _clientId = configuration["PayPal:ClientId"] ?? string.Empty;
            _secret = configuration["PayPal:Secret"] ?? string.Empty;
            _baseUrl = configuration["PayPal:BaseUrl"] ?? "https://api-m.sandbox.paypal.com";
        }

        private async Task<string> GetAccessTokenAsync()
        {
            var authValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_clientId}:{_secret}"));
            using var req = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/v1/oauth2/token");
            req.Headers.Authorization = new AuthenticationHeaderValue("Basic", authValue);
            req.Content = new StringContent("grant_type=client_credentials", Encoding.UTF8, "application/x-www-form-urlencoded");

            var res = await _httpClient.SendAsync(req);
            res.EnsureSuccessStatusCode();
            using var stream = await res.Content.ReadAsStreamAsync();
            using var doc = await JsonDocument.ParseAsync(stream);
            return doc.RootElement.GetProperty("access_token").GetString()!;
        }

        public async Task<string> CreateOrderAsync(decimal amount, string currency, string referenceId, string description)
        {
            var token = await GetAccessTokenAsync();

            var body = new
            {
                intent = "CAPTURE",
                purchase_units = new[]
                {
                    new
                    {
                        reference_id = referenceId,
                        description,
                        amount = new { currency_code = currency, value = amount.ToString("0.00") }
                    }
                },
                application_context = new
                {
                    shipping_preference = "NO_SHIPPING",
                    user_action = "PAY_NOW"
                }
            };

            var json = JsonSerializer.Serialize(body);
            using var req = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/v2/checkout/orders");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            req.Content = new StringContent(json, Encoding.UTF8, "application/json");

            var res = await _httpClient.SendAsync(req);
            res.EnsureSuccessStatusCode();
            using var stream = await res.Content.ReadAsStreamAsync();
            using var doc = await JsonDocument.ParseAsync(stream);
            return doc.RootElement.GetProperty("id").GetString()!;
        }

        public async Task<bool> CaptureOrderAsync(string orderId)
        {
            var token = await GetAccessTokenAsync();
            using var req = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/v2/checkout/orders/{orderId}/capture");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            req.Content = new StringContent("{}", Encoding.UTF8, "application/json");

            var res = await _httpClient.SendAsync(req);
            if (!res.IsSuccessStatusCode) return false;
            using var stream = await res.Content.ReadAsStreamAsync();
            using var doc = await JsonDocument.ParseAsync(stream);
            var status = doc.RootElement.GetProperty("status").GetString();
            return string.Equals(status, "COMPLETED", StringComparison.OrdinalIgnoreCase);
        }
    }
}


