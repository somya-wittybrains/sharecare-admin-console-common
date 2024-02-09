# Admin Console Developer's Guide

### TL;DR - New Module Checklist
Wanna skip all the "why & how" and get to the chase?  To create a new module, at a minimum, you must:
- [ ] Open a request to the SSO security team (via the Jira AUTHMGT project) to create a new SSO role for each distinct assignable permission you plan to include in your module
- [ ] Create a new feature branch for your module in the Sharecare Admin Console project (e.g. `git flow feature start MyModule`
- [ ] Add a folder under /ui/src/modules for your module (e.g. `/ui/src/modules/MyModule`)
- [ ] Add an `index.js` file to your module folder that returns a React component (in which you will render your module)
- [ ] Add a `.meta` property to your React component, containing and instance of `/ui/src/modules/ModuleMetadata` documenting the particulars of your module (more details available [here](#module-definition))
- [ ] Make sure your metadata contains at least one assignable permission, and that all of your assignable permissions reference the correct SSO roles you requested in the first step above
- [ ] Update `/ui/src/modules/index.js` to reference the metadata for your module

To test that you have wired things up correctly, you must:
- [ ] Make sure the SSO security team has created the roles you requested above in the QA environment
- [ ] Have an Admin Console super-admin enable the module and roles you defined for the Genera QA site
- [ ] Verify that your module appears as an assignable permission in the `Company Profile -> Users` module
- [ ] Grant module access to a user via said UI
- [ ] Login as the user to which access was granted and verify that the user is presented your module as an option and can open & view the module

Okay - so you have a module!  Now what?  Typically, something like this:
- [ ] Build a router in your component to map the different UI areas your module will implement to distinct child components (routing is described in more detail [here](#intra-module-routing))
- [ ] Lay out the presentation for each of your child components
- [ ] Create MobX data stores to feed your child components and use those stores (with fake data) to test your components (more info on MobX stores [here](#data-stores))
- [ ] Create server controllers and services (as needed) to implement each of the actual data functions modeled in your data stores
- [ ] Update your initial SSO role request[s] to include all of the data services your module will consume and ensure these updates are completed in the QA environment
- [ ] Wire up your data stores to access your controllers

You should now be able to fully test your module.  Congratulations - you just made a new Admin Console module!  Time to link up with the Admin Console team and get your code reviewed and merged into the primary `develop` branch so you can get into the testing & release cycle.

# Table of Contents
1. [TL;DR - New Module Checklist](#tldr---new-module-checklist)
1. [Architecture Overview](#architecture-overview)
1. [Project Structure](#project-structure)
1. [Module Definition](#module-definition)
1. [Intra-Module Routing](#intra-module-routing)
1. [Data Stores](#data-stores)
1. [Appendix A - Configuration](#appendix-a---configuration)
1. [Appendix B - Object Models](#appendix-b---object-models)
   1. [ModuleMetadata](#modulemetadata)
   1. [Tree.Branch](#treebranch)
   1. [Tree.Leaf](#treeleaf)
1. [Appendix C - Authentication Flows](#appendix-c---authentication-flows)

## Architecture Overview
The Sharecare Admin Console is a React-based single-page application (currently v16.8) built with the [Semantic UI React](https://react.semantic-ui.com/) visual toolkit and a Node back-end (currently v10.16 LTS) contained in [a single Git project](https://github.com/Sharecare/sharecare-admin-console).  All UI rendering is performed client-side, and all business processes and rules are enforced by the back-end server.  Within the UI is a suite of separate applications - henceforward referred to as "modules" - that all share a common underlying security framework.

The security model of the application comes in two parts - the client, which interprets the user's permissions and determines what options to present, and the server, which stores the user's credentials in an encrypted cookie and uses those credentials to execute service requests on the user's behalf.  In this way, the user's bearer token is never exposed in a browser environment.

However, it's important to understand that the server is not simply a proxy that adds the bearer token to service requests made by the client.  The client is NOT a safe environment and should never be trusted to do anything that matters.  The client is a tool for rendering data to the user and capturing the user's input.  The business rules (i.e. code) that determine what data should be presented to the user and what should happen as a result of user input should *always* be performed on the server.

## Project Structure
Location | Description
--|--
/api | all server files
/api/config | environment-specific configurations
/api/src | source code for the server
/api/src/controllers | the definitions for the REST API of the server
/api/src/services | generic interfaces for interacting with external services (so that these interactions are reusable across controllers)
/api/src/transformers | logic to translate between the representation of data found in external services and the representation of data as the client understands it
/ui | all client files
/ui/public | the base directory for the generated client, containing static resources that should be included in the client bundle
/ui/src | source code for the client
/ui/src/assets | static assets that need to be accessible by the source code
/ui/src/controls | common UI controls that are shared across modules
/ui/src/hooks | common React hooks that are shared across modules
/ui/src/model | the logical model of the underlying client framework
/ui/src/modules | base directory for all modules (each contained in a distinct sub-folder)

## Module Definition
Module definition is stored in-code within your module directory as an instance of the [`ModuleMetadata`](#modulemetadata) class.  `ModuleMetadata` contains all of the information necessary for the Sharecare Admin Console to know when and how to render your component, including:

 - A unique id for the module (used in various configuration references)
 - A title, icon, and brief description - all used for display purposes to the user
 - The desired URL path to the module and the React component to render for the module
 - A data structure modeling the various assignable permissions supported by the module

The permissions management UI in Admin Console is arranged as a hierarchical tree.  At the topmost level is the module name which may or may not have a list of selectable roles.  The module, in turn, can be expandable to show a list of sub-options, each of which may or may not *also* have a list of selectable roles.  And in theory, this pattern can continue to recursively occur even further down the tree - honestly it can all get pretty complicated to even describe, much less model in code.

To make this all work, Admin Console defines a concept of leaves and branches.  Leaves (represented by the [`Tree.Leaf`](#treeleaf) class) are individual roles that can be assigned to a user, whereas branches (represented by the [`Tree.Branch`](#treebranch) class) define the structure of how those roles will be presented on the selector screen.  This pattern is consistent all the way up the chain - the `/ui/src/modules/index.js` file you update to add your module metadata definition internally defines a `Leaf.Branch` that becomes the trunk of the tree, and that branch then contains an array of all of the branches from each the metadata documents (so each module is itself a distinct branch containing all of the branches & leaves that are relevant to that module). 

The rendering rules for translating branches and leaves into a UI presentation are as follows:
 1. Draw a checkbox for the branch and the branch name.  Toggling on the checkbox on enables assigning permissions from that branch, whereas toggling the checkbox off clears all associated permissions.
 2. If the branch contains a single leaf, this leaf is not shown on the screen, but toggling the branch checkbox on also grants the user the role associated with this leaf.
 3. If the branch contains multiple leaves, a selector box is rendered to the right of the branch name, allowing selection of the specific role to be granted to the user.  Toggling on the branch will by default set the selection to the first option in the list.
 4. If the branch contains other branches, recursively repeat the above logic, indenting slightly to indicate that the permissions being displayed are within the parent branch (indicating they will be cleared if the parent branch is de-selected).

This image provides examples of each of the above concepts: ![Permissions Example](./permissions_example.png)

## Intra-Module Routing
Admin Console's client follows a "reactive" programming model - which in general means that when a user takes an action, that action should *only* be concerned with updating the state of the client application to reflect the user's action.  The UI, in turn, then "reacts" to the change in state by updating the presentation shown to the user as appropriate.  This decoupling of action from effect is the _CORE_ principal of reactive programming in general and React specifically.  For example:

 - User types a value in a field - the keypress action should *only* be concern with updating the value of the underlying object, *not* updating the UI to show the new value
 - User presses the "Delete" button on an object - the onClick event should *only* update the underlying object to indicate it has been marked for deletion, *not* triggering display of a confirmation dialog
 - User selects to view an object - the onClick event should *only* update the current view state to point to the object, *not* trigger the particular components that need to be drawn.

That last one is a bit tricky, though.  What exactly is the state that is being updated that indicates the current view?  First instinct might be to create state values to hold this information - but there's actually a much better option : the page URL!  Not only is using the metaphor of the page URL very natural for this purpose (the URL should logically match what you see), but also the view locations in your module become deep linkable without any additional effort.

In Admin Console, we make heavy use of of the [React Router](https://reacttraining.com/react-router/web/guides/quick-start) library to control the current view.  Through this library you can easily control the current state of the view without coupling your action logic to any of the rendering logic for the target view.  Here are several examples taken from the `Member Management` module to demonstrate how this library is used:

#### /ui/src/modules/member-management/MemberManagementModule.js
This code sets up the various paths to the primary views inside of Member Management.  `match.url` is the part of the requested URL that matched to the current page, and in this case the current page is `"/members"`, so the routes set up by this file are `/members` which draws the search page with its list of matching members, `/members/account/<some-id>` which draws the detail view for the specified SSO account, and `/members/member/<some-reference-id>` which draws the detail view for the specified eligibility record.
```html
41  <Switch>
42    <Route exact path={`${match.url}`} component={MembersList} />
43    <MemberRoute
44       exact
45       path={`${match.url}/account/:accountId`}
46       component={MemberView}
47       basePath={match.url}
48    />
49    <MemberRoute
50      exact
51      path={`${match.url}/member/:referenceId`}
52      component={MemberView}
53      basePath={match.url}
54    />
55  </Switch>
```

#### /ui/src/modules/member-management/MembersList.js
This code updates the current URL to reflect the search parameters entered by the user.  Yes - that is correct - when the user types search criteria on this page the handling logic does *NOT* call the search.  It just updates the page URL with the criteria and then the page reacts by seeing the new URL and knowing that the correct view for that URL is to execute and show the results of the search that matches the criteria.  So if you copy this URL and send it to another user, that user will get the exact same search results you were looking at!
```javascript
190  const onSearch = () => {
191    debug('onSearch(%o)', draftQuery);
192
193    history.replace(
194      `${match.url}?${buildSearchParams(null, null, draftQuery, 1)}`
195    );
196  };
```

#### /ui/src/modules/member-management/MemberView/index.js
This code is a bit tricky.  Inside of the top-level router for the module (up in `MemberManagementModule.js`) this code creates a new `HashRouter` that allows targeting of page URLs by the fragment attached to the end of the URL.  Within that block,  it sets up routes to target individual sections on the Member View page, allowing navigation within the secondary section menu on this view.  Note that the router is configured as "noslash" - meaning that there is no standard prefix before the section identifier value on the fragments used on this page.  This results in page URLs that look like `/members/account/4ddc06b9-3e54-4328-a1ee-11c911fe5644#member-management_sponsorships` (where `/members` mapped to the Member Management module within the primary router in `App.js`, then `/account/4ddc06b9-3e54-4328-a1ee-11c911fe5644` mapped to the `MemberView` component in the module router in `MemberManagementModule.js`, and finally `#member-management_sponsorships` maps to the id of a specific section component in the hash router on this page).
```html
 96  <HashRouter hashType='noslash'>
...
172    <Switch>
173      {sections.map(({ id, component: Component }, i) => (
174        <Route
175          key={`section${i}`}
176          path={`/${id}`}
177          render={() => <Component member={member} />}
178        />
179      ))}
180      {!!sections.length && (
181        <Route render={() => <DefaultComponent member={member} />} />
182      )}
183    </Switch>
...
203  </HashRouter>
```

#### /ui/src/modules/member-management/MemberView/SectionMenu.js
And just to close that loop, here's the code that generates the section navigation menu.  Note that for each generated menu option, the only control logic is a React Router `Link` tag pointing to `/<section id>`.
```html
28  <Menu pointing secondary className='justify-start'>
29    {sections.map(({ key, name }, i) => (
30      <Menu.Item
31        key={key}
32        as={Link}
33        name={name}
34        active={match.path === '/' ? i === 0 : match.path === `/${key}`}
35        replace
36        to={`/${key}`}
37      >
38        {t(name)}
39      </Menu.Item>
40    ))}
41  </Menu>
```

## Data Stores
By convention, Admin Console models all external data sources that are used by the UI as [MobX](https://mobx.js.org/index.html) data stores.  MobX, a very straightforward Flux implementation, provides a clean abstraction between the visual components and the external data sources, allowing for better re-use of external data source references and helping enforce the "reactive" programming model.

MobX data stores define a set of "observable" state elements and a set of "actions" that can be performed on that state.  I won't try to rehash the MobX documentation here, but a few examples to help get you started seem appropriate.

A basic MobX data store looks something like:

```javascript
import { computed, observable, autorun } from 'mobx';

export default class SampleStore {
  // observable values that are used to render components
  @observable stateParam1 = 'some default';
  @observable stateParam2 = 123456;
  @observable stateParam3 = { some:'complex', object:'example' };
  
  constructor (restStore) {
    this.restStore = restStore;
  }
  
  // computed values that are also observable
  @computed
  get isValid () {
    return this.stateParam2 > 100000 && !this.stateParam1;
  }
  
  // method that will trigger a re-render of any components that depend upon
  //  observables that were updated by this action
  @action
  loadParam3 (id) {
	this.restStore.fetch('/some/service', {
	  method: 'POST',
	  body: JSON.stringify({ id })
	}).then(action(param => {
	  this.stateParam3 = param;
	}))
  }
}
```

In Admin Console, MobX data stores are typically injected into a component using a React Context Provider.  To see an example of adding a data store to a context provider, see `/ui/src/modules/member-management/model/index.js`, which constructs and adds a large number of MobX data stores to the returned `MemberModuleStoreContext` object.  That context is then instantiated and stored in a context provider in the `/ui/src/modules/member-management/MemberManagementModule.js` file like this:

```javascript
 9 import { useAppModelStore } from 'model/hooks';
14 import MemberModuleStore, { MemberModuleStoreContext } from './model';
...
12 const memberModuleStore = new MemberModuleStore();
13 
20 function MemberManagementModule ({ iconComponent, title, description, match }) {
21   const { restStore, authStore } = useAppModelStore();
22   useEffect(() => {
23     memberModuleStore.init(moduleMeta, restStore, authStore);
24   }, [moduleMeta, restStore, authStore]);
...
28   return (
29     <MemberModuleStoreContext.Provider value={memberModuleStore}>
30       {memberModuleStore.ready && (
...
58       )}
59     </MemberModuleStoreContext.Provider>
60   );
61 });
```
Any component loaded within the `MemberModuleStoreContext.Provider` block will now have access to the store held in the context, via the React `useContext` hook.  For example, `/ui/src/modules/member-management/MembersList.js` uses the following statement to gain access to the membersStore, which is uses to both trigger a search action for members and to retrieve and render search results:

```javascript
 97   const { membersStore, memberAccountStore } = useContext(
 98     MemberModuleStoreContext
 99   );
...
141       membersStore.search(query, Number(params.get('page')) || 1, {
142         forceRefresh
143      });
...
440                   membersStore.accounts.map((accountObj, i) => (
441                     <Table.Row
442                       style={{ cursor: 'pointer' }}
443                       key={`account_${i}}`}
444                       onClick={handleRowClick(
445                         accountObj.id
446                           ? `/members/account/${accountObj.id}`
447                           : `/members/member/${accountObj.referenceId}`
448                       )}
449                     >
...
490                     </Table.Row>
491                   ))
492                 )}
```

## Appendix A - Configuration
Admin Console configuration is performed using the [Node-Config library by Loren West](https://github.com/lorenwest/node-config).  This library allows definition of a default configuration structure, and then overrides those values as appropriate for the environment by matching the injected `HOSTNAME` environment variable to a specific config override for that environment.  Maestro defaults the `HOSTNAME` value to the host of the first entry in the service bindings definition - which for Admin Console is `genera` so configuration files follow the pattern `genera[.env].console[.admin].sharecare.com[.region].json`.

For convenience,  Node-Config also allows for the definition of specific environment variables that can be used to override specific values in the configuration.  As a policy, any and all configuration keys added to the Admin Console application should also have an override key added in the `/api/config/custom-environment-variables.json` file so that, when necessary for debugging, this value can be updated as necessary in a deployed server without having to push a new build.

Module authors are encouraged to add new configuration values as necessary to provide for the needs of their module so the available config options are constantly in flux, but here I will define the current set of options to document those and to demonstrate the basic pattern if you need to add additional keys.

Configuration Key | Meaning | Default
--|--|--
name | Simply text identifier used in internal references - probably never needs to be changed | sharecare-admin-console
route.scheme | Whether inbound requests for this instance are over http or https | http
route.host | The target host for this instance | localhost:3000
route.path | The target base path for this instance | /api
bind.port | The port upon which this instance will listen | 3001
bind.threads | The number of Node cluster threads this instance will run | 1
crypto.secret | The secret value used to encrypt user credentials | secret
crypto.passphrase | The passphrase salt used to sign JWT tokens | passphrase
sso.host | The base hostname of the target SSO for this instance | https://auth.qa.sharecare.com
sso.accountHost | The base hostname of the target SSO Account service for this instance | https://auth.qa.sharecare.com
sso.authorizationHost | The base hostname of the target SSO Authorization service for this instance | https://auth.qa.sharecare.com
sso.accessHost | The base hostname of the target SSO Access (i.e. OAuth2) service for this instance | https://auth.qa.sharecare.com
sso.id | The SSO client application used by this instance | localhost
sso.secret | The SSO client secret used by this instance | test
environments.current | For multi-environment modules, the local environment | uat
environments.proxy | For multi-environment modules, the remote environment which must be reached by proxy | prod
adminConsole.host | The base host and path of the Admin Console API server used by this instance | https://api.qa.sharecare.com /admin-console
api.host | The base host and path of the API service environment used by this instance | https://api.qa.sharecare.com
eligibility.host | The base host and path of the Member Eligibility API server used by this instance | https://servicesapi.mservices.sharecare.com /membereligibility
reward-incentive.uat.host | The base host and path of the UAT IRS API server used by this instance | https://api.mservices.sharecare.com/irs
reward-incentive.uat.previewHost | The base host and path of the UAT You application used by this instance | https://you.qa.sharecare.com
reward-incentive.prod.host | The base host and path of the Prod IRS API server used by this instance | https://serviceproxy.qa.sharecare.com /api.stage.sharecare.com/irs
reward-incentive.prod.previewHost | The base host and path of the Prod You application used by this instance | https://you.uat.sharecare.com
sponsor.uat.host | The base host and path of the UAT Sponsor service used by this instance | https://servicesapi.mservices.sharecare.com /membereligibility/v2/sponsor
sponsor.prod.host | The base host and path of the Prod Sponsor service used by this instance | https://servicesapi.stage.sharecare.com /membereligibility/v2/sponsor
challenges.uat.host | The base host and path of the UAT Challenges API server used by this instance | https://api.mservices.sharecare.com /challenges
challenges.prod.host | The base host and path of the Prod Challenges API server used by this instance | https://serviceproxy.qa.sharecare.com /api.stage.sharecare.com/challenges
health-tracker.uat.host | The base host and path of the UAT Health Tracker API server used by this instance | https://api.mservices.sharecare.com /health-tracker
health-tracker.prod.host | The base host and path of the Prod Health Tracker API server used by this instance | https://api.mservices.sharecare.com /health-tracker
you.host | The base host and path of the You application used by this instance | https://ue1-dev-monolab-08-serve-elb.feingoldtech.com
you.id | The SSO client application used by the target You application for this instance | sc-mobile-web
cloudinary.cloudName | The Cloudinary organization name used by this instance | sharecare
logging | The logging level used by this instance | warn

## Appendix B - Object Models

### ModuleMetadata
from `/ui/src/modules/ModuleMetadata.js`

Parameter | Meaning | Example
-- | -- | --
name | A unique identifier for the module | `company-profile`
category | A display name for the module category - used to place modules in distinct menus in the top navigation bar | `Dashboard`
title | The display name for the module that will be shown to the user | `Company Profile`
description | A brief (sentence or two) description of the purpose of the module which will also be shown to the user | `Manage settings, users, permissions, and configure help & support information`
path | The base URL path to navigate to this module | `company-profile` (which would mount the module at x.console.sharecare.com/company-profile)
component | A full reference to the React component to be rendered, used to load and render the module | `modules/company-profile`
iconComponent | A full reference to the React component to be rendered as the module icon, used to load and render the module icon | `modules/company-profile/Icon`
roles | An array of `Tree.Branch` and/or `Tree.Leaf` definitions mapping the assignable permissions of this module | `[new Leaf('company-profile_readOnly','Read Only','CONSOLE_COMPANY_MEMBER'), new Leaf('company-profile_edit','Edit','CONSOLE_COMPANY_MANAGER')]`
requiresAllSponsors | For multi-sponsor sites, whether or not this module should be available to users not granted access to all sponsors | `true`

### Tree.Branch
from `/ui/model/Tree.js`

Parameter | Meaning | Example
-- | -- | --
id | Unique identifier of this tree element | `member-management_rewards`
name | A descriptive name for the role/permissions that will be shown to the user | `Rewards & Fulfillment`
children | An array of `Tree.Branch` and/or `Tree.Leaf` definitions mapping the structure of roles & permissions under this branch | `[new Leaf('member-management_rewards_readOnly','Read Only','CONSOLE_MEMBER_REWARDS_VIEW'),new Leaf('member-management_rewards_activityWaiver','Activity Waiver','CONSOLE_MEMBER_REWARDS_ACTIVITY_WAIVER')]`

### Tree.Leaf
from `/ui/model/Tree.js`

Parameter | Meaning | Example
-- | -- | --
id | Unique identifier of this tree element | `member-management_rewards_readOnly`
name | A descriptive name for the role/permission that will be shown to the user | `Read Only`
value | The name of the SSO role corresponding to this assignable permission | `CONSOLE_MEMBER_REWARDS_VIEW`

## Appendix C - Authentication Flows
![A detailed flow diagram for the page load and authentication process](https://www.websequencediagrams.com/files/render?link=BCkaATFmeUh3MkZlK8mXT4juFLwHIYzlJnvCPVzyb4HqpzpmFu0jVH24VY5kpv1f)
<!--stackedit_data:
eyJoaXN0b3J5IjpbMjA2MDA2NjU0NSwtMjAxOTYwNzkwOSwtNj
Q0ODU5MDcwLC0xMjQ3NjY2XX0=
-->