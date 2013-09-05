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
    /// Categories for the Articles
    /// </summary>
    [Table("DurandalAuth_Categories")]
    [DataContract(IsReference = true)]
    public class Category
    {
        [Key]
        [DataMember]
        public Guid CategoryId { get; set; }

        /// <summary>
        /// Category Name
        /// </summary>
        [StringLength(100)]
        [DataMember]
        public string Name { get; set; }

    }
}
