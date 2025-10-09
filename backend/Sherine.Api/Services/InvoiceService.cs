using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Sherine.Api.Models;

namespace Sherine.Api.Services
{
    public class InvoiceService : IInvoiceService
    {
        public byte[] GenerateInvoicePdf(Booking booking)
        {
            QuestPDF.Settings.License = LicenseType.Community;

            var doc = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(30);
                    page.Header().Text("Sherine Travels - Invoice").SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);
                    page.Content().Column(col =>
                    {
                        col.Spacing(8);
                        col.Item().Text($"Booking ID: BK{booking.Id:D6}");
                        col.Item().Text($"Date: {DateTime.UtcNow:yyyy-MM-dd}");
                        col.Item().Text($"Vehicle: {booking.Vehicle?.Type ?? "-"}");
                        col.Item().Text($"With Driver: {(booking.WithDriver ? "Yes" : "No")}");
                        col.Item().Text($"Kilometers: {booking.Kilometers}");
                        col.Item().Text($"Start: {booking.StartDate:yyyy-MM-dd}  End: {booking.EndDate:yyyy-MM-dd}");
                        col.Item().Text($"Total: LKR {booking.TotalPrice:N2}").Bold();
                        col.Item().Text($"Paid: LKR {booking.PaidAmount:N2}");
                        col.Item().Text($"Payment Status: {booking.PaymentStatus}");
                        col.Item().Text("Thank you for your business!").FontColor(Colors.Grey.Darken2);
                    });
                });
            });

            using var stream = new MemoryStream();
            doc.GeneratePdf(stream);
            return stream.ToArray();
        }
    }
}


