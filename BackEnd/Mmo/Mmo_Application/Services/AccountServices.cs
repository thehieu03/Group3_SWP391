using BCrypt.Net;
using Mmo_Application.Services.Interface;
using Mmo_Domain.IUnit;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;
using Mmo_Domain.ModelResponse.Mmo_Domain.ModelResponse;
using Mmo_Domain.Models;
using Org.BouncyCastle.Crypto.Generators;
using System.Text.RegularExpressions;

namespace Mmo_Application.Services
{
  
    public class AccountServices : BaseServices<Account>, IAccountServices
    {
        // 🔹 Kế thừa _unitOfWork từ BaseServices
        public AccountServices(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
        }

        public async Task<Result<AccountRegisterResponse>> RegisterAsync(AccountRegisterRequest request)
        {
            // (Code của bạn ở đây đã đúng logic)
            if (await _unitOfWork.Accounts.CheckExistsAsync(request.Email, request.Username))
                return Result<AccountRegisterResponse>.Fail("Email hoặc tài khoản đã tồn tại!");

            if (request.Password != request.ConfirmPassword)
            {
                return Result<AccountRegisterResponse>.Fail("Mật khẩu nhập lại không khớp!");
            }

            if (!Regex.IsMatch(request.Password, @"^(?=.*[A-Za-z])(?=.*\d).{8,}$"))
            {
                return Result<AccountRegisterResponse>.Fail("Mật khẩu phải có ít nhất 8 ký tự, gồm chữ và số!");
            }

            var newAccount = new Account
            {
                Username = request.Username,
                Email = request.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Accounts.AddAsync(newAccount);
            await _unitOfWork.SaveChangesAsync(); // 🔹 Lỗi sẽ hết khi bạn sửa IUnitOfWork

            var response = new AccountRegisterResponse
            {
                Username = newAccount.Username,
                Email = newAccount.Email,
            };

            return Result<AccountRegisterResponse>.Ok(response, "Đăng ký thành công!");
        }

        public async Task<Result<AccountLoginResponse>> LoginAsync(AccountLoginRequest request)
        {
            // (Code của bạn ở đây đã đúng logic)
            var account = await _unitOfWork.Accounts.GetByEmailAsync(request.Email); // 🔹 Lỗi sẽ hết khi bạn sửa IUnitOfWork
            if (account == null)
                return Result<AccountLoginResponse>.Fail("Email không tồn tại!");

            if (!BCrypt.Net.BCrypt.Verify(request.Password, account.Password))
                return Result<AccountLoginResponse>.Fail("Sai mật khẩu!");

            var token = Guid.NewGuid().ToString();

            var response = new AccountLoginResponse
            {
                Username = account.Username,
                Token = token
            };

            return Result<AccountLoginResponse>.Ok(response, "Đăng nhập thành công!");
        }
    }
}