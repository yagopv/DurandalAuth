using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace DurandalAuth.Domain.Model
{
        /// <summary>
        ///  User Profile entity
        /// </summary>
        [Table("DurandalAuth_UserProfiles")]
        [DataContract(IsReference = true)]
        public class UserProfile
        {
            /// <summary>
            /// Identity
            /// </summary>
            [Key]
            [DatabaseGeneratedAttribute(DatabaseGeneratedOption.Identity)]
            [DataMember]
            public int UserProfileId { get; set; }

            /// <summary>
            /// The UserName
            /// </summary>
            [Required]
            [StringLength(50)]
            [DataMember]
            public string UserName { get; set; }

            /// <summary>
            ///  Email for the User
            /// </summary>
            /// <remarks>Ignoring this field in serialization via JsonIgnore</remarks>
            [Required]
            [DataType(DataType.EmailAddress)]
            [StringLength(200)]
            [EmailAddress]
            [DataMember]
            [JsonIgnore]
            public string Email { get; set; }
        }
}
