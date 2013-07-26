using System;
using System.Web.Optimization;

namespace DurandalAuth.Web {
  public class BundleConfig {
	public static void RegisterBundles(BundleCollection bundles) {
	  bundles.IgnoreList.Clear();
	  AddDefaultIgnorePatterns(bundles.IgnoreList);

	  bundles.Add(
		new ScriptBundle("~/scripts/vendor")
		  .Include("~/Scripts/jquery-{version}.js")
		  .Include("~/Scripts/knockout-{version}.js")
		  .Include("~/Scripts/knockout.validation.js")          
		  .Include("~/Scripts/sammy-{version}.js")
		  .Include("~/Scripts/bootstrap.js")
		  .Include("~/Scripts/toastr.js")
		  .Include("~/Scripts/jquery.hammer.min.js")
		  .Include("~/Scripts/Stashy.js")
          .Include("~/scripts/Q.js")
          .Include("~/scripts/breeze.debug.js")
		);

	  bundles.Add(
		new StyleBundle("~/Content/css")
		  .Include("~/Content/ie10mobile.css")
		  .Include("~/Content/bootstrap.css")
		  .Include("~/Content/bootstrap-responsive.css")
		  .Include("~/Content/font-awesome.css")
		  .Include("~/Content/durandal.css")
		  .Include("~/Content/toastr.css")
		  .Include("~/Content/Stashy.css")
		);

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