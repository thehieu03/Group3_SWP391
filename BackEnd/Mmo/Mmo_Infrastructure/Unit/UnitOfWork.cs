using Mmo_Domain.IUnit; // 🔹 1. Using "Hợp đồng"
using Mmo_Domain.IRepository;
using Mmo_Infrastructure.Repository;
using System.Threading.Tasks;

namespace Mmo_Infrastructure.Unit
{
    // 🔹 PHẢI LÀ "public class" và kế thừa IUnitOfWork
    public class UnitOfWork : IUnitOfWork
    {
        // 🔹 2. Phụ thuộc vào AppDbContext (chi tiết của Infrastructure)
        private readonly AppDbContext _context;

        // 🔹 3. Triển khai các Repository (giống hệt Interface)
        public IAccountRepository Accounts { get; private set; }
        // public ICategoryRepository Categories { get; private set; }

        public UnitOfWork(AppDbContext context)
        {
            _context = context;

            // 🔹 4. Khởi tạo các Repository cụ thể
            Accounts = new AccountRepository(_context);
            // Categories = new CategoryRepository(_context);
        }

        // 🔹 5. Triển khai hàm Generic
        public IGenericRepository<T> GenericRepository<T>() where T : class
        {
            return new GenericRepository<T>(_context);
        }

        // 🔹 6. Triển khai hàm Save (cụ thể)
        public int SaveChanges()
        {
            return _context.SaveChanges();
        }

        // 🔹 7. Triển khai hàm SaveAsync (cụ thể)
        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        // 🔹 8. Triển khai hàm Dispose
        public void Dispose()
        {
            _context.Dispose();
        }
    }
}