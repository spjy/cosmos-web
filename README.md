# COSMOS Web #
for the Hawaii Space Flight Laboratory, by Spencer Young

COSMOS Web is an app that visualizes live orbit and attitude data using a 3D rendering. It also can save historical data and replay it.

### Requirements ###
- [NodeJS v8.11.1](https://nodejs.org)
- [MongoDB v?](https://nodejs.org)
- [COSMOS](http://cosmos-project.org/)

### Installing ###

1. Clone the repository
2. In `/`, rename `.env.example` to `.env`. For the `BROADCAST_IP`, enter the IP of the propagator or socket.
3. Install dependencies in `/` and `/client`: 
```
$npm install
```

### Running ###

1. Run server in `/`:
```
$npm start
```
2. Run client in `/client`:
```
$npm start
```
3. Access the site at http://localhost:3000

4. Run the COSMOS Propagartor (simple)
```
$propagator_simple
```

