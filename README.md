# Sharecare Admin Console
Our public management interface for internal and customer use.


### Setup npm private registry
See [NPM documentation](https://npme.npmjs.com/docs/cli/configuration.html) for enterprise setup.

Run the following from the root of the project:
```bash
npm config set registry https://nexus.admin.sharecare.com/repository/npm-repo/
npm login
# use you Active Directory credentials on the prompt
```


### Installation
See [React app documentation](./react-app.md) for the full documentation.

Run the following from the root of the project:
```bash
npm install -g nodemon
npm install -g concurrently
npm install -prefix api
npm install -prefix ui
```


###  Running the app
Run the following from the root of the project
```bash
npm run debug
```
This will start the api server and webpack dev server.


### Dependencies
No local dependencies.  Requires a configured SSO instance.


## Code philosophy

### Routing
URLs should point to a **resource**. That means that any variable part of a routing path should be needed for identifying a resource. The corollary is that anything **not** use to identify a resource should be encoded in the query string (e.g. filter / sort params) or the hash (e.g. tab name).

### Windows OS users
Using the above installation process while we are trying there might be issue while running the code so if above process dont help, please use the following steps to run the sharecare-admin-console

Please open two different terminals note that the terminals should be Git Bash terminal and run the api and ui separatly

Please run **npm install** in three places: **repo root**, **api** folder, and **ui** folder. Order in which you run the three **npm install** operations does not seem to matter, but all three should be done before trying to run Care console

**cd api** and run **npm run start**, similary in another terminal **cd ui** and run **npm run debug**

In the terminal where the UI is running check the port(usually the port is 3000) in which application is up and accordingly hit **http://admin.localhost:3000**
