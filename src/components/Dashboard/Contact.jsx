import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import BaseComponent from '../BaseComponent';

function Contact({
  height,
}) {
  const state = useSelector((s) => s);

  const [color, setColor] = useState('red');

  const timerYellow = useRef(null);
  const timerRed = useRef(null);

  // Get lastDate (last retrieved date) and compare with current time)
  // Compare. If <2 min, green, <5min, yellow, < 10min, red

  useEffect(() => {
    if (state.lastDate) {
      const minuteDifference = state.lastDate.diff(dayjs(), 'minute');

      if (minuteDifference <= 2) {
        setColor('green');

        if (typeof timerYellow.current === 'function') {
          clearTimeout(timerYellow.current);
          clearTimeout(timerRed.current);
        }

        timerYellow.current = setTimeout(() => {
          setColor('yellow');
        }, 300000);
        timerRed.current = setTimeout(() => {
          setColor('red');
        }, 600000);
      }
    }
  }, [state]);

  return (
    <BaseComponent
      name="Contact"
    >
      <div
        className={`w-full rounded transition ease-in duration-500 bg-${color}-300`}
        style={{ height: height / 2 }}
      >
        &nbsp;
      </div>
    </BaseComponent>
  );
}

Contact.propTypes = {
  height: PropTypes.number.isRequired,
};

export default Contact;
