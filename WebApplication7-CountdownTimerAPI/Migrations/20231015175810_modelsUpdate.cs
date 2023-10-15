using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApplication6_CountdownTimer.Migrations
{
    /// <inheritdoc />
    public partial class modelsUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "FavoriteCountdowns",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "CountdownRecords",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteCountdowns_UserId",
                table: "FavoriteCountdowns",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CountdownRecords_UserId",
                table: "CountdownRecords",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CountdownRecords_AspNetUsers_UserId",
                table: "CountdownRecords",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FavoriteCountdowns_AspNetUsers_UserId",
                table: "FavoriteCountdowns",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CountdownRecords_AspNetUsers_UserId",
                table: "CountdownRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_FavoriteCountdowns_AspNetUsers_UserId",
                table: "FavoriteCountdowns");

            migrationBuilder.DropIndex(
                name: "IX_FavoriteCountdowns_UserId",
                table: "FavoriteCountdowns");

            migrationBuilder.DropIndex(
                name: "IX_CountdownRecords_UserId",
                table: "CountdownRecords");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "FavoriteCountdowns");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "CountdownRecords");
        }
    }
}
