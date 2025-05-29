using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebAPIDemo.Migrations
{
    /// <inheritdoc />
    public partial class AddUserReservationJoinTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserReservations_Reservations_ParticipatingReservationsReservationId",
                table: "UserReservations");

            migrationBuilder.DropForeignKey(
                name: "FK_UserReservations_Users_ParticipantsUserId",
                table: "UserReservations");

            migrationBuilder.RenameColumn(
                name: "ParticipatingReservationsReservationId",
                table: "UserReservations",
                newName: "ReservationId");

            migrationBuilder.RenameColumn(
                name: "ParticipantsUserId",
                table: "UserReservations",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_UserReservations_ParticipatingReservationsReservationId",
                table: "UserReservations",
                newName: "IX_UserReservations_ReservationId");

            migrationBuilder.CreateTable(
                name: "ReservationUser",
                columns: table => new
                {
                    ParticipantsUserId = table.Column<int>(type: "int", nullable: false),
                    ParticipatingReservationsReservationId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReservationUser", x => new { x.ParticipantsUserId, x.ParticipatingReservationsReservationId });
                    table.ForeignKey(
                        name: "FK_ReservationUser_Reservations_ParticipatingReservationsReservationId",
                        column: x => x.ParticipatingReservationsReservationId,
                        principalTable: "Reservations",
                        principalColumn: "reservation_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReservationUser_Users_ParticipantsUserId",
                        column: x => x.ParticipantsUserId,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReservationUser_ParticipatingReservationsReservationId",
                table: "ReservationUser",
                column: "ParticipatingReservationsReservationId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserReservations_Reservations_ReservationId",
                table: "UserReservations",
                column: "ReservationId",
                principalTable: "Reservations",
                principalColumn: "reservation_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserReservations_Users_UserId",
                table: "UserReservations",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserReservations_Reservations_ReservationId",
                table: "UserReservations");

            migrationBuilder.DropForeignKey(
                name: "FK_UserReservations_Users_UserId",
                table: "UserReservations");

            migrationBuilder.DropTable(
                name: "ReservationUser");

            migrationBuilder.RenameColumn(
                name: "ReservationId",
                table: "UserReservations",
                newName: "ParticipatingReservationsReservationId");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "UserReservations",
                newName: "ParticipantsUserId");

            migrationBuilder.RenameIndex(
                name: "IX_UserReservations_ReservationId",
                table: "UserReservations",
                newName: "IX_UserReservations_ParticipatingReservationsReservationId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserReservations_Reservations_ParticipatingReservationsReservationId",
                table: "UserReservations",
                column: "ParticipatingReservationsReservationId",
                principalTable: "Reservations",
                principalColumn: "reservation_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserReservations_Users_ParticipantsUserId",
                table: "UserReservations",
                column: "ParticipantsUserId",
                principalTable: "Users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
