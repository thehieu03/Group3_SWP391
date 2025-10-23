using Dapper;
using Mmo_Domain.Models;
using System.Data;

namespace Mmo_Application.Services;

public interface IDapperService
{
    Task<int> ExecuteAsync(string sql, object? parameters = null);
    Task<IEnumerable<T>> QueryAsync<T>(string sql, object? parameters = null);
    Task<T?> QueryFirstOrDefaultAsync<T>(string sql, object? parameters = null);
    Task<IEnumerable<Accountrole>> GetAccountRolesAsync(int accountId);
    Task<bool> InsertAccountRolesAsync(int accountId, List<int> roleIds);
    Task<bool> DeleteAccountRolesAsync(int accountId, List<int> roleIds);
    Task<bool> ReplaceAccountRolesAsync(int accountId, List<int> newRoleIds);
    Task<bool> DeactivateUserShopsAsync(int accountId);
}

public class DapperService : IDapperService
{
    private readonly IDbConnection _connection;

    public DapperService(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<int> ExecuteAsync(string sql, object? parameters = null)
    {
        return await _connection.ExecuteAsync(sql, parameters);
    }

    public async Task<IEnumerable<T>> QueryAsync<T>(string sql, object? parameters = null)
    {
        return await _connection.QueryAsync<T>(sql, parameters);
    }

    public async Task<T?> QueryFirstOrDefaultAsync<T>(string sql, object? parameters = null)
    {
        return await _connection.QueryFirstOrDefaultAsync<T>(sql, parameters);
    }

    public async Task<IEnumerable<Accountrole>> GetAccountRolesAsync(int accountId)
    {
        var sql = "SELECT accountId, roleId FROM accountroles WHERE accountId = @accountId";
        var result = await _connection.QueryAsync<Accountrole>(sql, new { accountId });
        return result;
    }

    public async Task<bool> InsertAccountRolesAsync(int accountId, List<int> roleIds)
    {
        if (!roleIds.Any())
            return true;

        // Tạo parameters cho bulk insert
        var parameters = roleIds.Select(roleId => new { accountId, roleId }).ToList();
        
        var sql = @"
            INSERT IGNORE INTO accountroles (accountId, roleId) 
            VALUES (@accountId, @roleId)";

        Console.WriteLine($"[DEBUG] InsertAccountRoles SQL: {sql}");
        Console.WriteLine($"[DEBUG] InsertAccountRoles Parameters: accountId={accountId}, roleIds=[{string.Join(", ", roleIds)}]");
        
        var affectedRows = await _connection.ExecuteAsync(sql, parameters);
        Console.WriteLine($"[DEBUG] InsertAccountRoles affected rows: {affectedRows}");
        
        return affectedRows > 0;
    }

    public async Task<bool> DeleteAccountRolesAsync(int accountId, List<int> roleIds)
    {
        if (!roleIds.Any())
            return true;

        // Tạo placeholders cho IN clause
        var placeholders = string.Join(",", roleIds.Select((_, index) => $"@roleId{index}"));
        var sql = $@"
            DELETE FROM accountroles 
            WHERE accountId = @accountId AND roleId IN ({placeholders})";

        // Tạo parameters object
        var parameters = new DynamicParameters();
        parameters.Add("@accountId", accountId);
        for (int i = 0; i < roleIds.Count; i++)
        {
            parameters.Add($"@roleId{i}", roleIds[i]);
        }

        Console.WriteLine($"[DEBUG] DeleteAccountRoles SQL: {sql}");
        Console.WriteLine($"[DEBUG] DeleteAccountRoles Parameters: accountId={accountId}, roleIds=[{string.Join(", ", roleIds)}]");
        
        var affectedRows = await _connection.ExecuteAsync(sql, parameters);
        Console.WriteLine($"[DEBUG] DeleteAccountRoles affected rows: {affectedRows}");
        
        return affectedRows >= 0; // >= 0 vì có thể không có role nào để xóa
    }

    public async Task<bool> ReplaceAccountRolesAsync(int accountId, List<int> newRoleIds)
    {
        // Xóa tất cả roles hiện tại
        var deleteSql = "DELETE FROM accountroles WHERE accountId = @accountId";
        await _connection.ExecuteAsync(deleteSql, new { accountId });

        // Thêm roles mới
        if (newRoleIds.Any())
        {
            return await InsertAccountRolesAsync(accountId, newRoleIds);
        }

        return true;
    }

    public async Task<bool> DeactivateUserShopsAsync(int accountId)
    {
        var sql = @"
            UPDATE shops 
            SET isActive = false 
            WHERE accountId = @accountId";

        var affectedRows = await _connection.ExecuteAsync(sql, new { accountId });
        return true; // Luôn trả về true vì có thể user không có shop
    }
}
