import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Slider, Icon, Row, Col, Alert, Popconfirm } from 'antd';
import moment from 'moment';

class Replay extends Component {

  startSlider() {
    if (this.props.playable) {
      this.props.onReplayChange({
        playable: false // Prevent users from starting multiple intervals
      })
      this.sliderIncrement();
    }
  }

  sliderIncrement() {
    let delay = 1000;
    this.delay = () => {
      if (this.props.slider < this.props.max) { // Check if slider reached maximum value
        let date1;

        if (this.props.slider === this.props.max - 1) { // Prevent from going above the maximum value
          date1 = 0;
        } else {
          date1 = -(moment(this.props.replay[this.props.slider + 1].createdAt)); // get date one, convert to positive
        }

        let date2 = -(moment(this.props.replay[this.props.slider].createdAt)); // get date two, convert to positive

        delay = moment(date1).diff(moment(date2)); // find difference between two dates

        this.props.onReplayChange({
          slider: this.props.slider + 1,
          currentCoord: this.props.replay[this.props.slider]
        });

        this.slider = setTimeout(this.delay, delay);
      } else {
        this.stopSlider(); // If so, clear interval
      }
    }

    setTimeout(this.delay, delay);
  }

  stopSlider() {
    clearTimeout(this.slider);

    this.props.onReplayChange({
      playable: true
    });
  }

  onSliderChange(value) {
    this.props.onReplayChange({
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
            <Popconfirm
              title="Switch to live view?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => this.props.onReplayChange({ live: true, replay: [] })}>
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

Replay.propTypes = {
  type: PropTypes.string.isRequired,
  playable: PropTypes.bool.isRequired,
  satellite: PropTypes.string.isRequired,
  max: PropTypes.number.isRequired,
  slider: PropTypes.number.isRequired,
  onReplayChange: PropTypes.func.isRequired,
}

export default Replay;
