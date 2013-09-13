## What´s this?

This template is a port of the default ASP MVC 4 Internet template and its security system.

The included features are:

- Forms and oAuth authentication and authorization using SimpleMembership providers

- Authorization in Durandal views

- AntiForgery tokens

- Model validation both client (knockout validation) and server (data attributes)

- UnitOfWork and Repository patterns both client and server

- Using Breeze JS in the client for better data management

- pushState enabled

- Styled with Bootstrap 3


##Check it out!! ...

... the [sample site](https://durandalauth.azurewebsites.net) and play with it

##Weyland config

When you make changes over this project you are going to need to optimize the Durandal files, so remember, you have to install **node** and **weyland**

```
//install node and run this in your command line
npm install -g weyland
weyland build
```

Or you can follow this links:

[Building with weyland](http://durandaljs.com/documentation/Building-with-Weyland/)

[Automating builds with Visual Studio](http://durandaljs.com/documentation/Automating-Builds-with-Visual-Studio/)

##About pushState

Since Durandal 2.0 we can use pushState so this feature is enabled by default. If you prefer hashes you can always set pushState to false in shell.js

```
.activate({ pushState : true }); // set to false for using hash style url´s

```