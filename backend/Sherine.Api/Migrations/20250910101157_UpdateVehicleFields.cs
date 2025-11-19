using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sherine.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateVehicleFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Price",
                table: "Vehicles",
                newName: "PriceWithoutDriver");

            migrationBuilder.AddColumn<decimal>(
                name: "PriceWithDriver",
                table: "Vehicles",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "Seats",
                table: "Vehicles",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PriceWithDriver",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "Seats",
                table: "Vehicles");

            migrationBuilder.RenameColumn(
                name: "PriceWithoutDriver",
                table: "Vehicles",
                newName: "Price");
        }
    }
}
