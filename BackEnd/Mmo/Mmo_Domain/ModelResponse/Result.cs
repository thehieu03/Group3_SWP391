using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mmo_Domain.ModelResponse
{
    namespace Mmo_Domain.ModelResponse
    {
        public class Result<T>
        {
            public bool Success { get; set; }
            public string Message { get; set; }
            public T? Data { get; set; }

            public static Result<T> Ok(T data, string message = "Thành công")
            {
                return new Result<T> { Success = true, Data = data, Message = message };
            }

            public static Result<T> Fail(string message)
            {
                // Trả về default(T) (thường là null) cho Data khi thất bại
                return new Result<T> { Success = false, Message = message, Data = default };
            }
        }
    }
}
