using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sherine.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateVehiclePricingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PriceWithoutDriver",
                table: "Vehicles",
                newName: "PricePerKmWithoutDriver");

            migrationBuilder.RenameColumn(
                name: "PriceWithDriver",
                table: "Vehicles",
                newName: "PricePerKmWithDriver");

            migrationBuilder.AddColumn<decimal>(
                name: "PriceForOvernight",
                table: "Vehicles",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PriceForOvernight",
                table: "Vehicles");

            migrationBuilder.RenameColumn(
                name: "PricePerKmWithoutDriver",
                table: "Vehicles",
                newName: "PriceWithoutDriver");

            migrationBuilder.RenameColumn(
                name: "PricePerKmWithDriver",
                table: "Vehicles",
                newName: "PriceWithDriver");
        }
    }
}
