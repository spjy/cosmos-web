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

Modify the .env file to have the correct variables.

```
REACT_APP_SATELLITE_IP=localhost # IP of the COSMOS Web Server
```

## Running

```
npm start
```

## Docker

If you want to run COSMOS Web through Docker:

```
docker build . -t cosmos_web
docker run 3000:3000 cosmos_web
```
