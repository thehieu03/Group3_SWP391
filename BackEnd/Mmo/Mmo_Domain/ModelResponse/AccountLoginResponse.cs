using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mmo_Domain.ModelResponse
{
    public class AccountLoginResponse
    {
        public string Username { get; set; }

        public string Password { get; set; }
        public string Token { get; set; }
    }
}