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

        /// <summary>
        /// The category name accesible by url
        /// </summary>
        [StringLength(100)]
        [DataMember]
        public string UrlCodeReference { get; set; }

        /// <summary>
        /// Create a url reference
        /// </summary>
        /// <param name="title">The string to convert</param>
        public void SetUrlReference()
        {
            char[] arr = this.Name.Where(c => (char.IsLetterOrDigit(c) || char.IsWhiteSpace(c))).ToArray();
            var urlcodereference = new string(arr);
            this.UrlCodeReference = urlcodereference.Trim().ToLower().Replace(" ", "-");
        }
    }
}
