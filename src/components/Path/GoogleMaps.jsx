import React from 'react';
import PropTypes from 'prop-types';
import {
  withScriptjs, withGoogleMap, GoogleMap, Polyline, Marker
} from "react-google-maps";

const GoogleMaps = ({ path, position }) => (
  <GoogleMap
    defaultZoom={2}
    defaultCenter={{ lat: 0, lng: 0 }}
    options={{ gestureHandling: 'greedy' }}
  >
    {
      position.map((pos, i) => (
        <Marker
          position={{
            lat: pos.lat,
            lng: pos.lng
          }}
          key={i}
        />
      ))}
    {
      path.map((line, i) => (
        <Polyline
          path={line}
          options={{
            strokeColor: '#00a1e1',
            strokeOpacity: 1,
            strokeWeight: 2.5
          }}
          key={i}
        />
      ))
    }

  </GoogleMap>
);

GoogleMaps.propTypes = {
  path: PropTypes.arrayOf.isRequired,
  positon: PropTypes.object.isRequired
};

export default withScriptjs(withGoogleMap(GoogleMaps));
