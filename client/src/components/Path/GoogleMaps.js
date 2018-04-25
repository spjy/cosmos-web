import React, { Component } from 'react';
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
    return (
      <GoogleMap
        defaultZoom={8}
        defaultCenter={{ lat: 0, lng: 0 }}
        options={{ gestureHandling: "greedy" }}
      >
        <Marker position={{lat: this.props.position.latitude, lng: this.props.position.longitude}} />
        {this.props.path.map((line, i) => {
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

export default withScriptjs(withGoogleMap(GoogleMaps));
