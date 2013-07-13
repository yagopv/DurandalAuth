using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DurandalAuth.Domain.Model
{
        /// <summary>
        ///  User Profile entity
        /// </summary>
        [Table("DurandalAuth_UserProfiles")]
        public class UserProfile
        {
            /// <summary>
            /// Identity
            /// </summary>
            [Key]
            [DatabaseGeneratedAttribute(DatabaseGeneratedOption.Identity)]
            public int UserProfileId { get; set; }

            /// <summary>
            /// The UserName
            /// </summary>
            [Required]
            [StringLength(50)]
            public string UserName { get; set; }

            /// <summary>
            ///  Email for the User
            /// </summary>
            [Required]
            [DataType(DataType.EmailAddress)]
            [StringLength(200)]
            [EmailAddress]
            public string Email { get; set; }
        }
}
