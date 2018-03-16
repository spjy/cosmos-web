import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Slider, Icon, Row, Col, Alert, Popconfirm } from 'antd';

class ReplayOrbit extends Component {

  startSlider() {
    if (this.props.playable) {
      this.props.onReplayOrbitChange({
        playable: false // Prevent users from starting multiple intervals
      })
      this.sliderIncrement();
    }
  }

  sliderIncrement() {
    this.slider = setInterval(() => {
      if (this.props.slider < this.props.max) { // Check if slider reached maximum value
        this.props.onReplayOrbitChange({
          slider: this.props.slider + 1,
          currentCoord: this.props.replay[this.props.slider]
        });
        // this.setState({
        //   slider: this.props.slider + 1,
        //   currentCoord: this.props.replay[this.props.slider]
        // }); // If not, keep incrementing
      } else {
        this.stopSlider(); // If so, clear interval
      }
    }, 1000);
  }

  stopSlider() {
    clearInterval(this.slider);
    this.props.onReplayOrbitChange({
      playable: true
    });
  }

  onSliderChange(value) {
    this.props.onReplayOrbitChange({
      slider: value
    });
  }

  componentWillUnmount() {
    this.stopSlider();
  }

  render() {
    return (
      <div>
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
              You are viewing a replay {this.props.type} of <strong>{this.props.satellite}</strong>.
              <Row>
                <Col sm={2} md={1} style={{ paddingTop: '0.5em' }}>
                  <Icon
                    className="media-buttons"
                    type="play-circle-o"
                    onClick={this.startSlider.bind(this)}
                  />
                  &nbsp;
                  <Icon
                    className="media-buttons"
                    type="pause-circle-o"
                    onClick={this.stopSlider.bind(this)}
                  />
                  &nbsp;
                  {this.props.slider}
                </Col>
                <Col sm={22} md={23}>
                  <Slider
                    defaultValue={0}
                    value={this.props.slider || 0}
                    min={0} max={this.props.max}
                    marks={{
                      0: '0',
                      [this.props.max / 2]: this.props.max / 2,
                      [this.props.max]: this.props.max,
                    }}
                    onChange={this.onSliderChange.bind(this)}
                  />
                </Col>
              </Row>
            </div>
          }
          showIcon
        />
      </div>
    );
  }
}

ReplayOrbit.propTypes = {
  type: PropTypes.string.isRequired,
  playable: PropTypes.bool.isRequired,
  satellite: PropTypes.string.isRequired,
  max: PropTypes.number.isRequired,
  slider: PropTypes.number.isRequired,
  onReplayOrbitChange: PropTypes.func.isRequired,
}

export default ReplayOrbit;
