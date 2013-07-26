using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace DurandalAuth.Domain.Model
{
    /// <summary>
    /// Tags for the Articles
    /// </summary>
    [Table("DurandalAuth_Tags")]
    [DataContract(IsReference = true)]
    public class Tag
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [DataMember]
        public int TagId { get; set; }

        /// <summary>
        /// Tag Name
        /// </summary>
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
    }
}
