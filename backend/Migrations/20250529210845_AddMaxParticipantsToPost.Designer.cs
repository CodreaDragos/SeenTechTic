﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using WebAPIDemo.Data;

#nullable disable

namespace WebAPIDemo.Migrations
{
    [DbContext(typeof(DataContext))]
    [Migration("20250529210845_AddMaxParticipantsToPost")]
    partial class AddMaxParticipantsToPost
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.3")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("ReservationUser", b =>
                {
                    b.Property<int>("ParticipantsUserId")
                        .HasColumnType("int");

                    b.Property<int>("ParticipatingReservationsReservationId")
                        .HasColumnType("int");

                    b.HasKey("ParticipantsUserId", "ParticipatingReservationsReservationId");

                    b.HasIndex("ParticipatingReservationsReservationId");

                    b.ToTable("UserReservations", (string)null);
                });

            modelBuilder.Entity("WebAPIDemo.Models.Comment", b =>
                {
                    b.Property<int>("CommentId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("comment_id");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("CommentId"));

                    b.Property<int>("AuthorId")
                        .HasColumnType("int")
                        .HasColumnName("author_id");

                    b.Property<string>("CommentContent")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("comment_content");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2")
                        .HasColumnName("created_at");

                    b.Property<int>("PostId")
                        .HasColumnType("int")
                        .HasColumnName("post_id");

                    b.HasKey("CommentId");

                    b.HasIndex("AuthorId");

                    b.HasIndex("PostId");

                    b.ToTable("Comments");
                });

            modelBuilder.Entity("WebAPIDemo.Models.Field", b =>
                {
                    b.Property<int>("FieldId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("field_id");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("FieldId"));

                    b.Property<string>("FieldName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("field_name");

                    b.Property<bool>("IsReserved")
                        .HasColumnType("bit")
                        .HasColumnName("isReserved");

                    b.Property<int>("SportType")
                        .HasColumnType("int")
                        .HasColumnName("sport_type");

                    b.HasKey("FieldId");

                    b.ToTable("Fields");
                });

            modelBuilder.Entity("WebAPIDemo.Models.Post", b =>
                {
                    b.Property<int>("PostId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("post_id");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("PostId"));

                    b.Property<int>("AuthorId")
                        .HasColumnType("int")
                        .HasColumnName("author_id");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2")
                        .HasColumnName("created_at");

                    b.Property<int?>("MaxParticipants")
                        .HasColumnType("int");

                    b.Property<string>("PostDescription")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("post_description");

                    b.Property<string>("PostTitle")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("post_title");

                    b.Property<int?>("ReservationId")
                        .HasColumnType("int");

                    b.HasKey("PostId");

                    b.HasIndex("AuthorId");

                    b.HasIndex("ReservationId")
                        .IsUnique()
                        .HasFilter("[ReservationId] IS NOT NULL");

                    b.ToTable("posts");
                });

            modelBuilder.Entity("WebAPIDemo.Models.Reservation", b =>
                {
                    b.Property<int>("ReservationId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("reservation_id");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ReservationId"));

                    b.Property<int>("AuthorId")
                        .HasColumnType("int")
                        .HasColumnName("author_id");

                    b.Property<DateTime>("EndTime")
                        .HasColumnType("datetime2")
                        .HasColumnName("end_time");

                    b.Property<int>("FieldId")
                        .HasColumnType("int")
                        .HasColumnName("field_id");

                    b.Property<DateTime>("StartTime")
                        .HasColumnType("datetime2")
                        .HasColumnName("start_time");

                    b.HasKey("ReservationId");

                    b.HasIndex("AuthorId");

                    b.HasIndex("FieldId");

                    b.ToTable("Reservations");
                });

            modelBuilder.Entity("WebAPIDemo.Models.User", b =>
                {
                    b.Property<int>("UserId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("user_id");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("UserId"));

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("email");

                    b.Property<string>("Password")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("password");

                    b.Property<string>("ProfilePicture")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("profile_picture");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("role");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("username");

                    b.HasKey("UserId");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("ReservationUser", b =>
                {
                    b.HasOne("WebAPIDemo.Models.User", null)
                        .WithMany()
                        .HasForeignKey("ParticipantsUserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WebAPIDemo.Models.Reservation", null)
                        .WithMany()
                        .HasForeignKey("ParticipatingReservationsReservationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("WebAPIDemo.Models.Comment", b =>
                {
                    b.HasOne("WebAPIDemo.Models.User", "Author")
                        .WithMany("Comments")
                        .HasForeignKey("AuthorId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("WebAPIDemo.Models.Post", "Post")
                        .WithMany("Comments")
                        .HasForeignKey("PostId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Author");

                    b.Navigation("Post");
                });

            modelBuilder.Entity("WebAPIDemo.Models.Post", b =>
                {
                    b.HasOne("WebAPIDemo.Models.User", "Author")
                        .WithMany("Posts")
                        .HasForeignKey("AuthorId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("WebAPIDemo.Models.Reservation", "Reservation")
                        .WithOne("Post")
                        .HasForeignKey("WebAPIDemo.Models.Post", "ReservationId");

                    b.Navigation("Author");

                    b.Navigation("Reservation");
                });

            modelBuilder.Entity("WebAPIDemo.Models.Reservation", b =>
                {
                    b.HasOne("WebAPIDemo.Models.User", "Author")
                        .WithMany("AuthoredReservations")
                        .HasForeignKey("AuthorId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("WebAPIDemo.Models.Field", "Field")
                        .WithMany("Reservations")
                        .HasForeignKey("FieldId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Author");

                    b.Navigation("Field");
                });

            modelBuilder.Entity("WebAPIDemo.Models.Field", b =>
                {
                    b.Navigation("Reservations");
                });

            modelBuilder.Entity("WebAPIDemo.Models.Post", b =>
                {
                    b.Navigation("Comments");
                });

            modelBuilder.Entity("WebAPIDemo.Models.Reservation", b =>
                {
                    b.Navigation("Post");
                });

            modelBuilder.Entity("WebAPIDemo.Models.User", b =>
                {
                    b.Navigation("AuthoredReservations");

                    b.Navigation("Comments");

                    b.Navigation("Posts");
                });
#pragma warning restore 612, 618
        }
    }
}
