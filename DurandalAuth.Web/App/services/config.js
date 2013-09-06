define(function () {
    var controllerLocation = 'durandalauth/';

    var config = {
        lookupLocation: controllerLocation + 'lookups',
        saveChangesLocation: controllerLocation + 'savechanges',
        publicArticlesLocation: controllerLocation + 'publicarticles',
        privateArticlesLocation: controllerLocation + 'privatearticles',        
        userProfileLocation: controllerLocation + 'userprofiles',
        categoriesLocation: controllerLocation + 'categories'
    };

    return config;

});