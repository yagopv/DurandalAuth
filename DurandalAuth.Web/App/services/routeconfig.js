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
        userProfileUrl: "durandalauth/userprofiles",
        categoriesUrl: "durandalauth/categories",
		
		//Authentication Routes
        addExternalLoginUrl : "/api/Account/AddExternalLogin",
        changePasswordUrl : "/api/Account/changePassword",
        loginUrl : "/Token",
        logoutUrl : "/api/Account/Logout",
        registerUrl : "/api/Account/Register",
        registerExternalUrl : "/api/Account/RegisterExternal",
        removeLoginUrl : "/api/Account/RemoveLogin",
        setPasswordUrl: "/api/Account/setPassword",
        siteUrl : "/",
        userInfoUrl : "/api/Account/UserInfo"
    };

    return routes;

});