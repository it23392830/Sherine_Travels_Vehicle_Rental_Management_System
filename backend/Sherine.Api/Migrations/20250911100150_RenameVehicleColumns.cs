using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sherine.Api.Migrations
{
    public partial class RenameVehicleColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Rename PriceVehicleOnly -> PriceWithoutDriver
            migrationBuilder.RenameColumn(
                name: "PriceVehicleOnly",
                table: "Vehicles",
                newName: "PriceWithoutDriver");

            // Drop old Plate + Model columns
            migrationBuilder.DropColumn(
                name: "Plate",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "Model",
                table: "Vehicles");

            // Add new Type column
            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Vehicles",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert back
            migrationBuilder.RenameColumn(
                name: "PriceWithoutDriver",
                table: "Vehicles",
                newName: "PriceVehicleOnly");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Vehicles");

            migrationBuilder.AddColumn<string>(
                name: "Plate",
                table: "Vehicles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Model",
                table: "Vehicles",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
