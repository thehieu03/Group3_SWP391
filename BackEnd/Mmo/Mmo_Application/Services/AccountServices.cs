using Mmo_Application.Services.Interface;
using Mmo_Domain.IUnit;
using Mmo_Domain.ModelRequest;
using Mmo_Domain.ModelResponse;
using Mmo_Domain.Models;
using Org.BouncyCastle.Crypto.Generators;
using System.Text.RegularExpressions;
using BCrypt.Net;

namespace Mmo_Application.Services
{
    public class AccountServices : BaseServices<Account>, IAccountServices
    {
        private readonly IUnitOfWork _unitOfWork;

        public AccountServices(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<AccountResponse>> RegisterAsync(AccountRequest request)
        {
           
            if (await _unitOfWork.Accounts.CheckExistsAsync(request.Email, request.Username))
                return Result<AccountResponse>.Fail("Email hoặc tài khoản đã tồn tại!");

            
            if (request.Password != request.ConfirmPassword)
                return Result<AccountResponse>.Fail("Mật khẩu nhập lại không khớp!");

           
            if (!Regex.IsMatch(request.Password, @"^(?=.*[A-Za-z])(?=.*\d).{8,}$"))
                return Result<AccountResponse>.Fail("Mật khẩu phải có ít nhất 8 ký tự, gồm chữ và số!");

            
            var newAccount = new Account
            {
                Username = request.Username,
                Email = request.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Accounts.AddAsync(newAccount);
            await _unitOfWork.SaveChangesAsync();

            var response = new AccountResponse
            {
                Username = newAccount.Username,
                Email = newAccount.Email,
                Message = "Đăng ký thành công!"
            };

            return Result<AccountResponse>.Ok(response, "Đăng ký thành công!");
        }

        public async Task<Result<AccountResponse>> LoginAsync(AccountRequest request)
        {
            var account = await _unitOfWork.Accounts.GetByEmailAsync(request.Email);
            if (account == null)
                return Result<AccountResponse>.Fail("Email không tồn tại!");

            if (!BCrypt.Net.BCrypt.Verify(request.Password, account.Password))
                return Result<AccountResponse>.Fail("Sai mật khẩu!");

            // 🔹 (sau này có thể thay bằng JWT)
            var token = Guid.NewGuid().ToString();

            var response = new AccountResponse
            {
                Username = account.Username,
                Token = token
            };

            return Result<AccountResponse>.Ok(response, "Đăng nhập thành công!");
        }
    }
}