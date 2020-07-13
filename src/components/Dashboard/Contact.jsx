import React, { useState, useEffect } from 'react';
// import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import BaseComponent from '../BaseComponent';

function Contact({
  // height,
}) {
  const lastDate = useSelector((s) => s.lastDate);

  const [color, setColor] = useState('red');

  const timer = () => {};

  // Get lastDate (last retrieved date) and compare with current time)
  // Compare. If <2 min, green, <5min, yellow, < 10min, red

  useEffect(() => {
    if (lastDate && timer && timer.current) {
      if (typeof timer.current === 'function') {
        clearInterval(timer.current);
      }

      const minuteDifference = lastDate.diff(dayjs(), 'minute');

      console.log(minuteDifference);

      if (minuteDifference <= 2) {
        setColor('green');

        timer.current = setTimeout(() => {
          setColor('yellow');
        }, 10000);
      } else if (minuteDifference <= 5) {
        setColor('yellow');

        timer.current = setTimeout(() => {
          setColor('red');
        }, 180);
      } else {
        setColor('red');
      }
    }
  }, [lastDate]);

  return (
    <BaseComponent
      name="Contact"
    >
      <div
        className={`w-full h-full rounded transition ease-in duration-500 bg-${color}-300`}
      >
        &nbsp;
      </div>
    </BaseComponent>
  );
}

Contact.propTypes = {
  // height: PropTypes.number.isRequired,
};

export default Contact;
