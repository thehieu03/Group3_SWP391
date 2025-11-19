namespace Mmo_Application.Services.Interface;

public interface IFeedbackServices :IBaseServices<Feedback>
{
    Task<IEnumerable<Feedback>> GetByProductIdAsync(int productId);
}
