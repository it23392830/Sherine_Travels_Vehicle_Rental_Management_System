using System.Threading.Tasks;

namespace Sherine.Api.Services
{
    public interface IPayPalService
    {
        Task<string> CreateOrderAsync(decimal amount, string currency, string referenceId, string description);
        Task<bool> CaptureOrderAsync(string orderId);
    }
}


