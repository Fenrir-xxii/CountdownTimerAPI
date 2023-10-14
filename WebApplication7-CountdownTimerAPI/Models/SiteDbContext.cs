using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace WebApplication7_CountdownTimerAPI.Models;

public class SiteDbContext : IdentityDbContext<User, IdentityRole<int>, int>
{
    public SiteDbContext(DbContextOptions options) : base(options)  
    {

    }
}
