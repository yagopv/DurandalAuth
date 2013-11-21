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
    [DataContract(IsReference = true)]
    public class Article : AuditInfoComplete
    {
        /// <summary>
        /// Post identity
        /// </summary>
        [Key]        
        [DataMember]
        public Guid ArticleId { get; set; }

        /// <summary>
        /// Title of this article
        /// </summary>
        [Required]
        [StringLength(200)]
        [DataMember]        
        public string Title { get; set; }

        /// <summary>
        /// The title accesible by url
        /// </summary>
        [StringLength(200)]
        [DataMember]
        public string UrlCodeReference { get; set; }

        /// <summary>
        /// Description for this article
        /// </summary>
        [Required]
        [StringLength(500)]
        [DataMember]
        public string Description { get; set; }

        /// <summary>
        /// Url for the image representing the post
        /// </summary>
        [Required]
        [StringLength(500)]
        [DataType(DataType.ImageUrl)]
        [DataMember]
        public string ImageUrl { get; set; }

        /// <summary>
        /// Will store markdown text
        /// </summary>
        [DataMember]
        public string Markdown { get; set; }

        /// <summary>
        /// Will store the markdown converted to html for quicker rendering
        /// </summary>
        [DataType(DataType.Html)]
        [DataMember]
        public string Html { get; set; }

        /// <summary>
        /// If the article is published and visible to others or not
        /// </summary>
        [DataMember]
        [Required]
        public bool IsPublished { get; set; }


        /// <summary>
        /// Foreign CategoryId key
        /// </summary> 
        [DataMember]
        public Guid CategoryId { get; set; }

        /// <summary>
        /// Related Category
        /// </summary>
        [ForeignKey("CategoryId")]
        [DataMember]
        public Category Category { get; set; }

        /// <summary>
        /// Related Tags
        /// </summary>
        [DataMember]
        public  ICollection<Tag> Tags { get; set; }

        /// <summary>
        /// Create a url reference
        /// </summary>
        /// <param name="title">The string to convert</param>
        public void SetUrlReference()
        {
            char[] arr = this.Title.Where(c => (char.IsLetterOrDigit(c) || char.IsWhiteSpace(c))).ToArray();
            var urlcodereference = new string(arr);
            this.UrlCodeReference = urlcodereference.Trim().ToLower().Replace(" ", "-");
        }
    }
}
