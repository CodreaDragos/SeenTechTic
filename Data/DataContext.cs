using WebAPIDemo.Models;
using Microsoft.EntityFrameworkCore;

namespace WebAPIDemo.Data
{
    public class DataContext : DbContext
    {

        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {
        }

        //define the tables -> by convention they are plural
        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; }  
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Field> Fields { get; set; }
        public DbSet<Reservation> Reservations { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure Post entity
            modelBuilder.Entity<Post>()
                .HasKey(p => p.PostId);  // Specify primary key

            modelBuilder.Entity<Post>()
                .HasOne(p => p.Author)
                .WithMany(u => u.Posts)
                .HasForeignKey(p => p.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure one-to-one relationship between Post and Reservation
            modelBuilder.Entity<Post>()
                .HasOne(p => p.Reservation)
                .WithOne(r => r.Post)
                .HasForeignKey<Post>(p => p.ReservationId);

            //Configure Field entity
            modelBuilder.Entity<Field>()
                .HasKey(f => f.FieldId);  // Specify primary key

            // Configure User entity
            modelBuilder.Entity<User>()
                .HasKey(u => u.UserId);  // Specify primary key

            // Configure Reservation entity
            modelBuilder.Entity<Reservation>()
                .HasKey(r => r.ReservationId);  // Specify primary key

            // Configure one-to-many relationship between User and authored Reservations
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Author)
                .WithMany(u => u.AuthoredReservations)
                .HasForeignKey(r => r.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Field)
                .WithMany(f => f.Reservations)
                .HasForeignKey(r => r.FieldId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Comment entity
            modelBuilder.Entity<Comment>()
                .HasKey(c => c.CommentId);  // Specify primary key

            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Author)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Post)
                .WithMany(p => p.Comments)
                .HasForeignKey(c => c.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure many-to-many relationship between User and Reservation for participants
            modelBuilder.Entity<User>()
                .HasMany(u => u.ParticipatingReservations)
                .WithMany(r => r.Participants)
                .UsingEntity(j => j.ToTable("UserReservations"));
        }
    }
}