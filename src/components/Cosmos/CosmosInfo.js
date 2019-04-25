const cosmosInfo = {
  hostname: process.env.REACT_APP_SATELLITE_IP,
  socket: `http://${process.env.REACT_APP_SATELLITE_IP}:3001`
};

export { cosmosInfo as default };
