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
    /// Represents a Post for a given Blog
    /// </summary>
    [Table("DurandalAuth_Articles")]
    [DataContract(IsReference = true)]
    public class Article : AuditInfoComplete
    {
        /// <summary>
        /// Post identity
        /// </summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [DataMember]
        public int ArticleId { get; set; }

        /// <summary>
        /// Title of this article
        /// </summary>
        [Required]
        [StringLength(200)]
        [DataMember]
        public string Title { get; set; }

        /// <summary>
        /// Description for this article
        /// </summary>
        [Required]
        [StringLength(500)]
        [DataMember]
        public string Description { get; set; }

        /// <summary>
        /// HTML Text for the given post
        /// </summary>
        [DataType(DataType.Html)]
        [DataMember]
        public string Text { get; set; }

        /// <summary>
        /// Foreign CategoryId key
        /// </summary>
        public int CategoryId { get; set; }

        /// <summary>
        /// Related Category
        /// </summary>        
        public Category Category { get; set; }

        /// <summary>
        /// Related Tags
        /// </summary>
        public ICollection<Tag> Tags { get; set; }
    }
}
