import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'antd';

class LiveOrbit extends Component {
  startSlider() {
    if (this.state.playable) {
      this.setState({ playable: false }); // Prevent users from starting multiple intervals
      this.sliderIncrement();
    }
  }

  sliderIncrement() {
    this.slider = setInterval(() => {
      if (this.state.slider < this.state.max) { // Check if slider reached maximum value
        this.setState({ slider: this.state.slider + 1,
          currentCoord: this.state.replay[this.state.slider]
        }); // If not, keep incrementing
        socket.emit('satellite orbit', this.state.currentCoord)
      } else {
        this.stopSlider(); // If so, clear interval
      }
    }, 1000);
  }

  stopSlider() {
    clearInterval(this.slider);
    this.setState({ playable: true });
  }

  render() {
    return (
      <Alert message={
        <div>
          Replay
          <Popconfirm title="Switch to live view?" okText="Yes" cancelText="No">
            <a><Icon style={{ paddingLeft: "0.5em" }} type="swap" /></a>
          </Popconfirm>
        </div>
      } type="warning"
        description={
          <div>
            You are viewing a replay orbit of <strong>{this.props.satellite}</strong>.
            <Row>
              <Col sm={2} md={1} style={{ paddingTop: '0.5em' }}>
                <Icon className="media-buttons"
                  type="play-circle-o"
                  onClick={this.startSlider.bind(this)}
                />
                &nbsp;
                <Icon className="media-buttons"
                  type="pause-circle-o"
                  onClick={this.stopSlider.bind(this)}
                />
                &nbsp;
                {this.props.slider}
              </Col>
              <Col sm={22} md={23}>
                <Slider
                  defaultValue={0}
                  value={this.props.slider}
                  min={0} max={this.props.max}
                  marks={{
                    0: '0',
                    [this.props.max / 2]: this.props.max / 2,
                    [this.props.max]: this.props.max,
                  }}
                  onChange={this.handleChange.bind(this)}
                />
              </Col>
            </Row>
          </div>
        }
        showIcon
      />
    );
  }
}


export default LiveOrbit;
