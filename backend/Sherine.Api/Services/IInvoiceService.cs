using Sherine.Api.Models;

namespace Sherine.Api.Services
{
    public interface IInvoiceService
    {
        byte[] GenerateInvoicePdf(Booking booking);
    }
}


