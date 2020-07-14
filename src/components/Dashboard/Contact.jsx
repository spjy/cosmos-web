import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { Badge } from 'antd';
import BaseComponent from '../BaseComponent';

function Contact() {
  const lastDate = useSelector((s) => s.lastDate);

  const [color, setColor] = useState('red');

  const timerYellow = useRef(null);
  const timerRed = useRef(null);

  // Get lastDate (last retrieved date) and compare with current time)
  // Compare. If <2 min, green, <5min, yellow, < 10min, red

  useEffect(() => {
    if (lastDate) {
      const minuteDifference = lastDate.diff(dayjs(), 'minute');
      if (-minuteDifference <= 2) {
        setColor('green');

        if (timerYellow.current != null && timerRed.current != null) {
          clearTimeout(timerYellow.current);
          clearTimeout(timerRed.current);
        }

        timerYellow.current = setTimeout(() => {
          setColor('orange');
        }, 300000);
        timerRed.current = setTimeout(() => {
          setColor('red');
        }, 600000);
      }
    }
  }, [lastDate]);

  return (
    <BaseComponent
      name="Contact"
      toolsSlot={(
        <>
          <span className="mr-3">
            <Badge status="success" />
            {'< 5 min'}
          </span>
          <span className="mr-3">
            <Badge status="warning" />
            {'< 10 min'}
          </span>
          <span className="mr-3">
            <Badge status="error" />
            {'> 10 min'}
          </span>
        </>
      )}
    >
      <div
        className={`w-full h-64 rounded transition ease-in duration-500 bg-${color}-300`}
      >
        &nbsp;
      </div>
    </BaseComponent>
  );
}

export default Contact;
