# COSMOS Web

COSMOS Web - a web application to visualize telemetry data from a satellite. UI Repository.

See https://github.com/spjy/cosmos-web-server for the server component of COSMOS Web.

## Requirements

1. Node.js
2. NPM

## Installing

Open a terminal and change directories to the location you want to install the repository.

```
git clone https://github.com/spjy/cosmos-web.git
cd cosmos-web
npm install
```

If you need to modify the default environment variable values (do not modify .env.defaults directly):

```
cp .env.defaults .env
```

```
WEB_API=localhost # For the old Node app
WEBSOCKET_IP=localhost # New WS implementation
QUERY_WEBSOCKET_PORT=8080 # Port of the WS to access the query endpoints
LIVE_WEBSOCKET_PORT=8081 # Port of the WS to access the live endpoints

```

## Running

```
npm start
```

## Docker Development Image

If you want to run the COSMOS Web development image through Docker:

```
docker build . -t cosmos_web
docker run 3000:3000 cosmos_web
```
## Standards

### Filesystem

**File Naming Standards**

All files should be in upper camel case format. If it contains JSX within the file, the extension shall be `.jsx`.

**JSX File Standards**

All JSX files shall follow the React Hooks API standard. This means all components should follow the functional style component creation.

If a component requires a prop function to be passed (e.g. onChange), it should be abstracted out, meaning it should have its own function definition. If it is only changing the state and/or calling another function, you may use just an inline function. Function names should be in lower camel case.

The React component along with all React states, functions and props should be documented using the [React Styleguidist](https://react-styleguidist.js.org/docs/documenting.html) standard.

For use of a global state (to allow components to share the same state where the React state becomes difficult to manage), the React Context API should be used in conjunction with reducers (if needed).

**Folder Organization**

`/src/components`

This folder contains each page's components, and each page's corresponding components should be in a folder with the same name as the page.

Exception: Components that are reusable and can span across different pages are to be put into the `Global` folder.

`/src/pages`

This folder contains a different route to a page. Each page should contain only layout logic and store logic if children components require it.

`/src/store`

This folder contains the React Context global store and reducer logic.

### Commit Style

Follow the [AngularJS commit style](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines).
