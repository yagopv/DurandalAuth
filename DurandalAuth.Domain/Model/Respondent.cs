using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace DurandalAuth.Domain.Model
{
    [DataContract(IsReference = true)]
    public class Respondent
    {
        [Key]
        [DataMember]
        public int Id { get; set; }

        [StringLength(100)]
        [Required(ErrorMessage = "Your name is required")]
        [DisplayName("Full Name")]
        [DataMember]
        public string FullName { get; set; }

        [StringLength(100)]
        //[Required]
        [Required(ErrorMessage = "Email address is required")]
        [EmailAddress(ErrorMessage = "Invalid Email Address")]
        [DisplayName("Email Address")]
        //[EmailAddressAttribute]
        [DataType(DataType.EmailAddress, ErrorMessage="Not at email address")]
        [DataMember]
        public string EmailAddress { get; set; }

        [StringLength(100)]
        [Required(ErrorMessage = "Your organization is required")]

        [DisplayName("Organization")]
        [DataMember]
        public string Organisation { get; set; }

    }
}
