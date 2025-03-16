
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

            //Configure Field entity
            modelBuilder.Entity<Field>()
                .HasKey(f => f.FieldId);  // Specify primary key

            // Configure User entity
            modelBuilder.Entity<User>()
                .HasKey(u => u.UserId);  // Specify primary key

            // Configure Reservation entity
            modelBuilder.Entity<Reservation>()
                .HasKey(r => r.ReservationId);  // Specify primary key

            // Configure Comment entity
            modelBuilder.Entity<Comment>()
                .HasKey(c => c.CommentId);  // Specify primary key

            // Configure relationship between Reservation and User
            modelBuilder.Entity<User>()
                 .HasMany(t => t.Reservations)
              .WithOne(c => c.Author)
            .HasForeignKey("user_id");  // Specify foreign key
        }
    }
}