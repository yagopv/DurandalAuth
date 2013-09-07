using System;
using System.Web.Optimization;

namespace DurandalAuth.Web {
  public class BundleConfig {
	public static void RegisterBundles(BundleCollection bundles) {
	  bundles.IgnoreList.Clear();
	  AddDefaultIgnorePatterns(bundles.IgnoreList);

	  // js Vendor
	  bundles.Add(
		new ScriptBundle("~/scripts/vendor")
		  .Include("~/Scripts/jquery-{version}.js")
		  .Include("~/Scripts/knockout-{version}.js")
		  .Include("~/Scripts/knockout.validation.js")          
		  .Include("~/Scripts/bootstrap.js")
		  .Include("~/Scripts/toastr.js")
		  .Include("~/Scripts/jquery.hammer.min.js")
		  .Include("~/Scripts/Stashy.js")
		  .Include("~/Scripts/Q.js")
		  .Include("~/Scripts/breeze.js")
		  .Include("~/Scripts/moment.js")
		  .Include("~/Scripts/jquery.tagsinput.js")
		  .Include("~/Scripts/marked.js")
		  .Include("~/Scripts/zen-form.js")
		  .Include("~/Scripts/highlight.pack.js")
		);

	  // css vendor
	  bundles.Add(
		new StyleBundle("~/Content/css")
		  .Include("~/Content/ie10mobile.css")
		  .Include("~/Content/bootstrap.css")
		  .Include("~/Content/font-awesome.css")
		  .Include("~/Content/durandal.css")
		  .Include("~/Content/toastr.css")
		  .Include("~/Content/Stashy.css")
		  .Include("~/Content/jquery.tagsinput.css")
		  .Include("~/Content/zen-form.css")
		  .Include("~/Content/vs.css")
		);

	  // css custom
	  bundles.Add(
		new StyleBundle("~/Content/custom")
		  .Include("~/Content/app.css")
		);
	}

	public static void AddDefaultIgnorePatterns(IgnoreList ignoreList) {
	  if(ignoreList == null) {
		throw new ArgumentNullException("ignoreList");
	  }

	  ignoreList.Ignore("*.intellisense.js");
	  ignoreList.Ignore("*-vsdoc.js");
	  ignoreList.Ignore("*.debug.js", OptimizationMode.WhenEnabled);
	}
  }
}