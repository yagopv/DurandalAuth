/** 
 * @module Route table
 */
define(function () {

    var routes = {
		// Breeze Routes. Relative to entitymanagerprovider service name
        lookupUrl: "durandalauth/lookups",
        saveChangesUrl: "durandalauth/savechanges",
        publicArticlesUrl: "durandalauth/publicarticles",
        privateArticlesUrl: "durandalauth/privatearticles",
        categoriesUrl: "durandalauth/categories",
		
		//Authentication Routes
        addExternalLoginUrl : "/api/account/addexternallogin",
        changePasswordUrl : "/api/account/changepassword",
        loginUrl : "/token",
        logoutUrl : "/api/account/logout",
        registerUrl : "/api/account/register",
        registerExternalUrl : "/api/account/registerexternal",
        removeLoginUrl : "/api/account/removelogin",
        setPasswordUrl: "/api/account/setpassword",
        siteUrl : "/",
        userInfoUrl: "/api/account/userinfo",
        getUsersUrl: "/api/account/getusers",
        forgotPassword: "/api/account/forgotpassword",
        resendMailRoute: "/api/account/resendconfirmationemail",
        resetPassword: "/api/account/resetpassword",
        deleteaccount: "/api/account/deleteaccount"
    };

    return routes;

});