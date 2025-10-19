using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mmo_Domain.IRepository;

namespace Mmo_Domain.IUnit
{
    public interface IUnitOfWork : IDisposable
    {
        // 🔹 BẠN BỊ THIẾU DÒNG NÀY (để gọi .Accounts)
        IAccountRepository Accounts { get; }
        // (Thêm các repo khác ở đây, ví dụ: ICategoryRepository Categories { get; })

        // 🔹 BẠN BỊ THIẾU DÒNG NÀY (để gọi .SaveChangesAsync())
        Task<int> SaveChangesAsync();

        // (Các phương thức khác bạn cần, ví dụ:)
        int SaveChanges();
        IGenericRepository<T> GenericRepository<T>() where T : class;
    }
}
