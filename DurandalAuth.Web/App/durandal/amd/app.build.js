{
  "name": "durandal/amd/almond-custom",
  "inlineText": true,
  "stubModules": [
    "durandal/amd/text"
  ],
  "paths": {
    "text": "durandal/amd/text"
  },
  "baseUrl": "D:\\Proyectos\\BgStrap\\BgStrap.Web\\App",
  "mainConfigFile": "D:\\Proyectos\\BgStrap\\BgStrap.Web\\App\\main.js",
  "include": [
    "main-built",
    "main",
    "durandal/app",
    "durandal/composition",
    "durandal/events",
    "durandal/http",
    "text!durandal/messageBox.html",
    "durandal/messageBox",
    "durandal/modalDialog",
    "durandal/system",
    "durandal/viewEngine",
    "durandal/viewLocator",
    "durandal/viewModel",
    "durandal/viewModelBinder",
    "durandal/widget",
    "durandal/plugins/router",
    "durandal/transitions/entrance",
    "services/appsecurity",
    "services/errorhandler",
    "services/logger",
    "services/utils",
    "viewmodels/shell",
    "viewmodels/account/account",
    "viewmodels/account/externalloginconfirmation",
    "viewmodels/account/externalloginfailure",
    "viewmodels/account/login",
    "viewmodels/account/register",
    "viewmodels/admin/admin",
    "viewmodels/home/home",
    "viewmodels/user/user",
    "text!views/shell.html",
    "text!views/account/account.html",
    "text!views/account/externalloginconfirmation.html",
    "text!views/account/externalloginfailure.html",
    "text!views/account/login.html",
    "text!views/account/register.html",
    "text!views/admin/admin.html",
    "text!views/home/home.html",
    "text!views/user/user.html"
  ],
  "exclude": [],
  "keepBuildDir": true,
  "optimize": "uglify2",
  "out": "D:\\Proyectos\\BgStrap\\BgStrap.Web\\App\\main-built.js",
  "pragmas": {
    "build": true
  },
  "wrap": true,
  "insertRequire": [
    "main"
  ]
}