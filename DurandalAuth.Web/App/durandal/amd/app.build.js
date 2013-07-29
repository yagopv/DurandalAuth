{
  "name": "durandal/amd/almond-custom",
  "inlineText": true,
  "stubModules": [
    "durandal/amd/text"
  ],
  "paths": {
    "text": "durandal/amd/text"
  },
  "baseUrl": "D:\\Proyectos\\DurandalAuth\\DurandalAuth.Web\\App",
  "mainConfigFile": "D:\\Proyectos\\DurandalAuth\\DurandalAuth.Web\\App\\main.js",
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
    "services/entitymanagerprovider",
    "services/errorhandler",
    "services/logger",
    "services/repository",
    "services/unitofwork",
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
    "text!views/header.html",
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
  "out": "D:\\Proyectos\\DurandalAuth\\DurandalAuth.Web\\App\\main-built.js",
  "pragmas": {
    "build": true
  },
  "wrap": true,
  "insertRequire": [
    "main"
  ]
}