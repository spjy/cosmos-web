import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withScriptjs, withGoogleMap, GoogleMap, Polyline, Marker } from "react-google-maps"

class GoogleMaps extends Component {

  // state = {
  //   lines: [
  //     [
  //       {lat:50, lng:1},
  //       {lat:50.1, lng:1.1},
  //       {lat:50.2, lng:1.2}
  //     ],
  //   ]
  // }

  // componentDidMount() {
  //   setTimeout(() => {
  //     this.setState({ lines: [...this.state.lines, [{lat:50.1, lng:1.1}, {lat:50.4, lng:1.3}]] })
  //   }, 5000)
  // }

  render() {
    const { path, position } = this.props;

    return (
      <GoogleMap
        defaultZoom={2}
        defaultCenter={{ lat: 0, lng: 0 }}
        options={{ gestureHandling: "greedy" }}
      >
        {position.map((pos, i) => {
          return (
            <Marker position={{lat: pos.lat, lng: pos.lng }} key={i} />
          );
        })}
        {path.map((line, i) => {
          return (
            <Polyline
              path={line}
              options={{
              strokeColor: '#00a1e1',
              strokeOpacity: 1,
              strokeWeight: 2.5,
            }}
            key={i}
            />
          )
        })}

      </GoogleMap>
    );
  }
}

GoogleMaps.propTypes = {
  path: PropTypes.array,
  positon: PropTypes.object,
}

export default withScriptjs(withGoogleMap(GoogleMaps));
