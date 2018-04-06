import React, { Component } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Polyline } from "react-google-maps"

class GoogleMaps extends Component {

  state = {
    lines: [
      [
        {lat:50, lng:1},
        {lat:50.1, lng:1.1}
      ],
    ]
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ lines: [...this.state.lines, [{lat:50.1, lng:1.1}, {lat:50.4, lng:1.3}]] })
    }, 5000)
  }

  render() {
    return (
      <GoogleMap
        defaultZoom={8}
        defaultCenter={{ lat: 50, lng: 1 }}
        options={{ gestureHandling: "greedy" }}
      >
        {this.state.lines.map((line, i) => {
          return (
            <Polyline
              path={line}
              options={{
              strokeColor: '#00a1e1',
              strokeOpacity: 1,
              strokeWeight: 2,
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
