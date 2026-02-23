using PastisserieAPI.Core.Entities;

namespace PastisserieAPI.Core.Interfaces.Repositories
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByEmailWithRolesAsync(string email);
        Task<IEnumerable<User>> GetUsersByRolAsync(string rolNombre);
        Task<IEnumerable<User>> GetAllWithRolesAsync();
        Task<bool> EmailExistsAsync(string email);
    }
}