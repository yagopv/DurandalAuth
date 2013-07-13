using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DurandalAuth.Domain.Model
{
    /// <summary>
    /// Represents a Post for a given Blog
    /// </summary>
    [Table("DurandalAuth_Articles")]
    public class Article : AuditInfo
    {
        /// <summary>
        /// Post identity
        /// </summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ArticleId { get; set; }

        /// <summary>
        /// Title of this article
        /// </summary>
        [Required]
        [StringLength(200)]
        public string Title { get; set; }

        /// <summary>
        /// Description for this article
        /// </summary>
        [Required]
        [StringLength(500)]
        public string Description { get; set; }

        /// <summary>
        /// HTML Text for the given post
        /// </summary>
        [DataType(DataType.Html)]
        public string Text { get; set; }

    }
}
