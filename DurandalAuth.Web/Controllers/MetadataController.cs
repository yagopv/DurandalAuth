using System.Web.Http;

using Breeze.WebApi2;

using DurandalAuth.Domain.UnitOfWork;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System;
using System.ComponentModel;
using System.Linq;
using System.Web.Compilation;

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
            //Original metadata call
            //return UnitOfWork.Metadata();


           //Code from http://stackoverflow.com/questions/16733251/breezejs-overriding-displayname
             //response by vCastro looks elegant but fails at let prop = t.GetProperties().SingleOrDefault(prop => prop.Name == pname)

            JObject metadata = JObject.Parse(UnitOfWork.Metadata());
            string EFNameSpace = metadata["schema"]["namespace"].ToString();

            //There must be a more elegant way of coding these lines to parse the cSpace.. mapping for iteration in the foreach loop.
            string typeNameSpaces = metadata["schema"]["cSpaceOSpaceMapping"].ToString();
            typeNameSpaces = "{" + typeNameSpaces.Replace("],[", "]|[").Replace("[", "").Replace("]", "").Replace(",", ":").Replace("|", ",") + "}";
            JObject jTypeNameSpaces = JObject.Parse(typeNameSpaces);

            foreach (var entityType in metadata["schema"]["entityType"])
            {
                string typeName = entityType["name"].ToString();
                //string ns = entityType["name"]["namespace"].ToString();
                string defaultTypeNameSpace = EFNameSpace + "." + typeName;
                string entityTypeNameSpace = jTypeNameSpaces[defaultTypeNameSpace].ToString();
                Type t = BuildManager.GetType(entityTypeNameSpace, false);

                IEnumerable<JToken> metaProps = null;
                if (entityType["property"].Type == JTokenType.Object)
                    metaProps = new[] { entityType["property"] };
                else
                    metaProps = entityType["property"].AsEnumerable();

                var props = from p in metaProps
                            let pname = p["name"].ToString()
                            let prop = t.GetProperties().SingleOrDefault(prop => prop.Name == pname)
                            where prop != null
                            from attr in prop.CustomAttributes
                            where attr.AttributeType.Name == "DisplayNameAttribute"
                            select new
                            {
                                Prop = p,
                                DisplayName = ((DisplayNameAttribute)Attribute.GetCustomAttribute(prop, typeof(DisplayNameAttribute))).DisplayName
                            };
                foreach (var p in props)
                {
                    p.Prop["displayName"] = p.DisplayName;
                }
            }
             

            //From http://stackoverflow.com/questions/16733251/breezejs-overriding-displayname jpcoder

            //JObject metadata = JObject.Parse(UnitOfWork.Metadata());
            ////string nameSpace = metadata["schema"]["namespace"].ToString();
            ////JN adaptation
            //string EFNameSpace = metadata["schema"]["namespace"].ToString();
            //string typeNameSpaces = metadata["schema"]["cSpaceOSpaceMapping"].ToString();
            //typeNameSpaces = "{" + typeNameSpaces.Replace("],[", "]|[").Replace("[", "").Replace("]", "").Replace(",", ":").Replace("|", ",") + "}";
            //JObject jTypeNameSpaces = JObject.Parse(typeNameSpaces);

            //foreach (var entityType in metadata["schema"]["entityType"])
            //{
            //    string typeName = entityType["name"].ToString();
            //    string defaultTypeNameSpace = EFNameSpace + "." + typeName;
            //    string entityTypeNameSpace = jTypeNameSpaces[defaultTypeNameSpace].ToString();
            //    Type t = BuildManager.GetType(entityTypeNameSpace, false);
            //    //Type t = Type.GetType(nameSpace + "." + typeName);
            //    foreach (var prop in t.GetProperties())
            //    {
            //        foreach (var attr in prop.CustomAttributes)
            //        {
            //            string name = attr.GetType().Name;
            //            foreach (var p in entityType["property"])
            //            {
            //                if (prop.Name == p["name"].ToString())
            //                {
            //                    if (attr.AttributeType.Name == "DisplayNameAttribute")
            //                    {
            //                        DisplayNameAttribute a = (DisplayNameAttribute)Attribute.GetCustomAttribute(prop, typeof(DisplayNameAttribute));
            //                        p["displayName"] = a.DisplayName;
            //                        break;
            //                    }
            //                }
            //            }
            //        }
            //    }
            //}

            return metadata.ToString();
            
        }
    }
}