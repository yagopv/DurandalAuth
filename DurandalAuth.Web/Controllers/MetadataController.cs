using System.Web.Http;

using Breeze.WebApi2;

using DurandalAuth.Domain.UnitOfWork;

namespace DurandalAuth.Web.Controllers
{
    /// <summary>
    /// The Breeze controller providing access to the Model Metadata
    /// </summary>    
    [BreezeController]
    [AllowAnonymous]
    public class MetadataController : ApiController
    {

        IUnitOfWork UnitOfWork;

        /// <summary>
        /// ctor
        /// </summary>
        public MetadataController(IUnitOfWork uow)
        {
            UnitOfWork = uow;
        }

        /// <summary>
        /// Model Metadata
        /// </summary>
        /// <returns>string containing the metadata</returns>       
        [HttpGet]
        public string Metadata()
        {
            return UnitOfWork.Metadata();
        }
    }
}