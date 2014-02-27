using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Mail;
using System.Net.Mime;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mail;

namespace DurandalAuth.Web.Helpers
{
    public class EmailService : IIdentityMessageService
    {
        public Task SendAsync(IdentityMessage message)
        {
            if (ConfigurationManager.AppSettings["EmailServer"] != "{EmailServer}" &&
                ConfigurationManager.AppSettings["EmailUser"] != "{EmailUser}" &&
                ConfigurationManager.AppSettings["EmailPassword"] != "{EmailPassword}")
            {
                System.Net.Mail.MailMessage mailMsg = new System.Net.Mail.MailMessage();

                // To
                mailMsg.To.Add(new MailAddress(message.Destination, ""));

                // From
                mailMsg.From = new MailAddress("donotreply@durandalauth.com", "DurandalAuth administrator");

                // Subject and multipart/alternative Body
                mailMsg.Subject = message.Subject;
                string html = message.Body;
                mailMsg.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(html, null, MediaTypeNames.Text.Html));

                // Init SmtpClient and send
                SmtpClient smtpClient = new SmtpClient(ConfigurationManager.AppSettings["EmailServer"], Convert.ToInt32(587));
                System.Net.NetworkCredential credentials = new System.Net.NetworkCredential(ConfigurationManager.AppSettings["EmailUser"], ConfigurationManager.AppSettings["EmailPassword"]);
                smtpClient.Credentials = credentials;

                return Task.Factory.StartNew(() => smtpClient.SendAsync(mailMsg, "token"));
            }
            else
            {
                return Task.FromResult(0);
            }
        }

    }
}