using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ExpenseTracker.Migrations
{
    /// <inheritdoc />
    public partial class AlignSchemaToExpenseClaimWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Requests_EmployeeId",
                table: "Requests");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeProfiles_EmployeeId",
                table: "EmployeeProfiles");

            migrationBuilder.DropIndex(
                name: "IX_Drafts_EmployeeId",
                table: "Drafts");

            migrationBuilder.RenameColumn(
                name: "Category",
                table: "Requests",
                newName: "CategoryId");

            migrationBuilder.RenameColumn(
                name: "Category",
                table: "Drafts",
                newName: "CategoryId");

            migrationBuilder.RenameColumn(
                name: "Category",
                table: "ApprovedItems",
                newName: "CategoryId");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfExpense",
                table: "Requests",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Requests",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "EmployeeProfiles",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfExpense",
                table: "Drafts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateTable(
                name: "ExpenseCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExpenseCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StatusHistory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RequestId = table.Column<int>(type: "int", nullable: false),
                    FromStatus = table.Column<int>(type: "int", nullable: false),
                    ToStatus = table.Column<int>(type: "int", nullable: false),
                    ChangedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StatusHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StatusHistory_Requests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "Requests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Requests_CategoryId",
                table: "Requests",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Requests_EmployeeId_DateOfExpense",
                table: "Requests",
                columns: new[] { "EmployeeId", "DateOfExpense" });

            migrationBuilder.CreateIndex(
                name: "IX_Requests_Status_CreatedAt",
                table: "Requests",
                columns: new[] { "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeProfiles_Email",
                table: "EmployeeProfiles",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeProfiles_EmployeeId",
                table: "EmployeeProfiles",
                column: "EmployeeId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Drafts_CategoryId",
                table: "Drafts",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Drafts_EmployeeId_DraftDate",
                table: "Drafts",
                columns: new[] { "EmployeeId", "DraftDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovedItems_CategoryId",
                table: "ApprovedItems",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ExpenseCategories_Name",
                table: "ExpenseCategories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StatusHistory_RequestId_ChangedAt",
                table: "StatusHistory",
                columns: new[] { "RequestId", "ChangedAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_ApprovedItems_ExpenseCategories_CategoryId",
                table: "ApprovedItems",
                column: "CategoryId",
                principalTable: "ExpenseCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Drafts_ExpenseCategories_CategoryId",
                table: "Drafts",
                column: "CategoryId",
                principalTable: "ExpenseCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Requests_ExpenseCategories_CategoryId",
                table: "Requests",
                column: "CategoryId",
                principalTable: "ExpenseCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApprovedItems_ExpenseCategories_CategoryId",
                table: "ApprovedItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Drafts_ExpenseCategories_CategoryId",
                table: "Drafts");

            migrationBuilder.DropForeignKey(
                name: "FK_Requests_ExpenseCategories_CategoryId",
                table: "Requests");

            migrationBuilder.DropTable(
                name: "ExpenseCategories");

            migrationBuilder.DropTable(
                name: "StatusHistory");

            migrationBuilder.DropIndex(
                name: "IX_Requests_CategoryId",
                table: "Requests");

            migrationBuilder.DropIndex(
                name: "IX_Requests_EmployeeId_DateOfExpense",
                table: "Requests");

            migrationBuilder.DropIndex(
                name: "IX_Requests_Status_CreatedAt",
                table: "Requests");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeProfiles_Email",
                table: "EmployeeProfiles");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeProfiles_EmployeeId",
                table: "EmployeeProfiles");

            migrationBuilder.DropIndex(
                name: "IX_Drafts_CategoryId",
                table: "Drafts");

            migrationBuilder.DropIndex(
                name: "IX_Drafts_EmployeeId_DraftDate",
                table: "Drafts");

            migrationBuilder.DropIndex(
                name: "IX_ApprovedItems_CategoryId",
                table: "ApprovedItems");

            migrationBuilder.DropColumn(
                name: "DateOfExpense",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "DateOfExpense",
                table: "Drafts");

            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "Requests",
                newName: "Category");

            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "Drafts",
                newName: "Category");

            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "ApprovedItems",
                newName: "Category");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "EmployeeProfiles",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.CreateIndex(
                name: "IX_Requests_EmployeeId",
                table: "Requests",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeProfiles_EmployeeId",
                table: "EmployeeProfiles",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Drafts_EmployeeId",
                table: "Drafts",
                column: "EmployeeId");
        }
    }
}
