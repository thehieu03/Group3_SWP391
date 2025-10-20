using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Mmo_Domain.ModelRequest
{
    public class AccountRegisterRequest
    {
        [Required]
        [StringLength(50)]
        public string Username { get; set; } = null!;
        [EmailAddress]
        [MaxLength(100)]
        [MinLength(10)]
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string ConfirmPassword { get; set; } = null!;
    }
}
