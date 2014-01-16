using System;
using System.Collections.Generic;
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
        [Required]
        [DataMember]
        public string FullName { get; set; }

        [StringLength(100)]
        [Required]
        [DataMember]
        public string EmailAddress { get; set; }

        [StringLength(100)]
        [Required]
        [DataMember]
        public string Organisation { get; set; }

    }
}
