using Mmo_Application.Services.Interface;
using Mmo_Domain.IUnit; // 🔹 Cần using IUnitOfWork
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Mmo_Application.Services
{
    public class BaseServices<T> : IBaseServices<T> where T : class
    {
     
        protected readonly IUnitOfWork _unitOfWork;

        public BaseServices(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        
        public async Task<int> AddAsync(T entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));
            await _unitOfWork.GenericRepository<T>().AddAsync(entity);
            return await _unitOfWork.SaveChangesAsync();
        }

        public bool Delete(int id)
        {
            _unitOfWork.GenericRepository<T>().Delete(id);
            return _unitOfWork.SaveChanges() > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            _unitOfWork.GenericRepository<T>().Delete(id);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(T entity)
        {
            _unitOfWork.GenericRepository<T>().Delete(entity);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _unitOfWork.GenericRepository<T>().GetAllAsync();
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            return await _unitOfWork.GenericRepository<T>().GetByIdAsync(id);
        }

        public async Task<bool> UpdateAsync(T entity)
        {
            _unitOfWork.GenericRepository<T>().Update(entity);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }
    }
}