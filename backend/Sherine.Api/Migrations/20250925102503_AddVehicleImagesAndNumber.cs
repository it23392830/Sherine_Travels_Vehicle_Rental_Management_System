using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sherine.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddVehicleImagesAndNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl1",
                table: "Vehicles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl2",
                table: "Vehicles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Number",
                table: "Vehicles",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl1",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "ImageUrl2",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "Number",
                table: "Vehicles");
        }
    }
}
