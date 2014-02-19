using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace DurandalAuth.Domain.Model
{
    [DataContract(IsReference = true)]
    public class RespondentComment : AuditInfoComplete
    {
        [Key]
        [DataMember]
        public int Id { get; set; }

        [DataMember]
        public int Option { get; set; }

        [StringLength(100)]
        //[Required(ErrorMessage = "Your name is required")]
        [DisplayName("Comment")]
        [DataMember]
        public string Comment { get; set; }

        [DataMember]
        public int RespondentId { get; set; }

        [ForeignKey("RespondentId")]
        [DataMember]
        public virtual Respondent Respondent { get; set; }

    }
}
