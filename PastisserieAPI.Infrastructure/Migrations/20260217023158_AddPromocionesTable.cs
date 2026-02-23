using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PastisserieAPI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPromocionesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CarritoItems_CarritosCompra_CarritoId",
                table: "CarritoItems");

            migrationBuilder.DropForeignKey(
                name: "FK_CarritosCompra_Users_UsuarioId",
                table: "CarritosCompra");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CarritosCompra",
                table: "CarritosCompra");

            migrationBuilder.RenameTable(
                name: "CarritosCompra",
                newName: "Carritos");

            migrationBuilder.RenameIndex(
                name: "IX_CarritosCompra_UsuarioId",
                table: "Carritos",
                newName: "IX_Carritos_UsuarioId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Carritos",
                table: "Carritos",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Promociones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TipoDescuento = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Valor = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CodigoPromocional = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    ImagenUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaActualizacion = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Promociones", x => x.Id);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_CarritoItems_Carritos_CarritoId",
                table: "CarritoItems",
                column: "CarritoId",
                principalTable: "Carritos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Carritos_Users_UsuarioId",
                table: "Carritos",
                column: "UsuarioId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CarritoItems_Carritos_CarritoId",
                table: "CarritoItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Carritos_Users_UsuarioId",
                table: "Carritos");

            migrationBuilder.DropTable(
                name: "Promociones");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Carritos",
                table: "Carritos");

            migrationBuilder.RenameTable(
                name: "Carritos",
                newName: "CarritosCompra");

            migrationBuilder.RenameIndex(
                name: "IX_Carritos_UsuarioId",
                table: "CarritosCompra",
                newName: "IX_CarritosCompra_UsuarioId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CarritosCompra",
                table: "CarritosCompra",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CarritoItems_CarritosCompra_CarritoId",
                table: "CarritoItems",
                column: "CarritoId",
                principalTable: "CarritosCompra",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CarritosCompra_Users_UsuarioId",
                table: "CarritosCompra",
                column: "UsuarioId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
