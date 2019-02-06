# COSMOS Web #
for the Hawaii Space Flight Laboratory, by Spencer Young

COSMOS Web is an app that visualizes live orbit and attitude data using a 3D rendering. It also can save historical data and replay it.

### Requirements ###
- [NodeJS v8.11.1+](https://nodejs.org)
- [MongoDB 3.4+](https://www.mongodb.com/)
- [COSMOS](http://cosmos-project.org/)

### Installing ###

1. Clone the repository to `~/cosmos/source/tools`
```
cd cosmos
git clone https://github.com/kaseyhagi/cosmos-web.git source/tools/cosmos-web
```
2. In `/`, rename `.env.example` to `.env`. Replace `SATELLITE_IP` with the IP of the propagator or socket.  
3. Install dependencies
```
cd source/tools/cosmos-web
npm install
cd client
npm install
```
4. Install nodemon  This package allows the app to refresh whenever changes are made to the source code
```
cd ../
$ npm install -g nodemon
```
### Modify Environment Variables ###
in the `cosmos-web` directory, duplicate the file `.env.example` and name it `.env`:
```
cp .env.example .env
```
in the `cosmos-web/client` directory, duplicate the file `.env.example` and name it `.env`:
```
cd client
cp .env.example .env
```
### Running ###

1. Run server in `cosmos-web/`:
```
cd ../
npm run-script dev
```
2. Run client in `cosmos-web/client`  
In a new Terminal:
```
cd ~/cosmos/source/tools/cosmos-web/client
npm start
```
3. Access the site at http://localhost:3000

4. Run the COSMOS Propagator (simple)
```
 propagator_simple
```

### Optional: run as your own local server ###
Make changes to `.env` in `cosmos-web/`  
Replace the value for `SATELLITE_IP` with your IP address  
Make changes to `.env` in `cosmos-web/client/`  
Replace the value for `REACT_APP_SATELLITE_IP` with your IP address  
Restart client and server
