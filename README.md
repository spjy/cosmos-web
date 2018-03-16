# COSMOS Web #
for the Hawaii Space Flight Laboratory, by Spencer Young

COSMOS Web is an app that visualizes live orbit and attitude data using a 3D rendering. It also can save old data and replay it.


### Requirements ###
- MongoDB
- COSMOS

### Installing ###

1. Clone the repository
2. In `/`, rename `.env.example` to `.env`. For the `BROADCAST_IP`, enter the IP of the propagator or socket.
3. Install dependencies: `npm install`

### Running ###

1. Run server in `/`: `npm start`
2. Run client in `/client`: `npm start`
3. Access the site at http://localhost:3000
