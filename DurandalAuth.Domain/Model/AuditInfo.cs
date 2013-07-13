using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace DurandalAuth.Domain.Model
{
    /// <summary>
    ///  Audit info for the different Entities
    /// </summary>
    public class AuditInfo
    {
        /// <summary>
        /// ConcurrencyCheck
        /// </summary>
        [Timestamp]
        public byte[] RowVersion { get; set; }

        /// <summary>
        /// Date the entity was created
        /// </summary>
        public DateTime DateCreated { get; set; }

        /// <summary>
        /// Date the entity was updated
        /// </summary>
        public DateTime DateUpdated { get; set; }

        /// <summary>
        ///  User creating the entity
        /// </summary>
        public UserProfile UserCreated { get; set; }

        /// <summary>
        /// User updating the entity
        /// </summary>
        public UserProfile UserUpdated { get; set; }

    }
}
