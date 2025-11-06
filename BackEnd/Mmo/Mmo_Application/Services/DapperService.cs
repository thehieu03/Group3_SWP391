using Dapper;
using Microsoft.Extensions.Logging;
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
    private readonly ILogger<DapperService> _logger;

    public DapperService(IDbConnection connection, ILogger<DapperService> logger)
    {
        _connection = connection;
        _logger = logger;
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


        var parameters = roleIds.Select(roleId => new { accountId, roleId }).ToList();

        var sql = @"
            INSERT IGNORE INTO accountroles (accountId, roleId) 
            VALUES (@accountId, @roleId)";

        _logger.LogDebug("InsertAccountRoles SQL: {Sql}", sql);
        _logger.LogDebug("InsertAccountRoles Parameters: accountId={AccountId}, roleIds=[{RoleIds}]", 
            accountId, string.Join(", ", roleIds));

        var affectedRows = await _connection.ExecuteAsync(sql, parameters);
        _logger.LogDebug("InsertAccountRoles affected rows: {AffectedRows}", affectedRows);

        return affectedRows > 0;
    }

    public async Task<bool> DeleteAccountRolesAsync(int accountId, List<int> roleIds)
    {
        if (!roleIds.Any())
            return true;


        var placeholders = string.Join(",", roleIds.Select((_, index) => $"@roleId{index}"));
        var sql = $@"
            DELETE FROM accountroles 
            WHERE accountId = @accountId AND roleId IN ({placeholders})";


        var parameters = new DynamicParameters();
        parameters.Add("@accountId", accountId);
        for (var i = 0; i < roleIds.Count; i++) parameters.Add($"@roleId{i}", roleIds[i]);

        _logger.LogDebug("DeleteAccountRoles SQL: {Sql}", sql);
        _logger.LogDebug("DeleteAccountRoles Parameters: accountId={AccountId}, roleIds=[{RoleIds}]", 
            accountId, string.Join(", ", roleIds));

        var affectedRows = await _connection.ExecuteAsync(sql, parameters);
        _logger.LogDebug("DeleteAccountRoles affected rows: {AffectedRows}", affectedRows);

        return affectedRows >= 0;
    }

    public async Task<bool> ReplaceAccountRolesAsync(int accountId, List<int> newRoleIds)
    {
        var deleteSql = "DELETE FROM accountroles WHERE accountId = @accountId";
        await _connection.ExecuteAsync(deleteSql, new { accountId });


        if (newRoleIds.Any()) return await InsertAccountRolesAsync(accountId, newRoleIds);

        return true;
    }

    public async Task<bool> DeactivateUserShopsAsync(int accountId)
    {
        var sql = @"
            UPDATE shops 
            SET isActive = false 
            WHERE accountId = @accountId";

        var affectedRows = await _connection.ExecuteAsync(sql, new { accountId });
        return true;
    }
}