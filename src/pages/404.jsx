import React from 'react';
import { Link } from '@reach/router';
import { ArrowLeftOutlined } from '@ant-design/icons';

function FourOhFour() {
  return (
    <div className="flex flex-col h-screen items-center justify-center font-mono text-center">
      <img className="w-1/5" src="/void.png" alt="Man Looking Into The COSMOS" />
      <div className="mt-4 mb-4 text-4xl text-gray-700">
        404.
      </div>
      <div className="text-md text-gray-600 cursor-pointer">
        <Link to="/">
          <ArrowLeftOutlined className="text-xl align-text-bottom mr-4 text-red-400 hover:text-red-600 arrow pl-4" type="arrow-left" />
          <span className="text-blue-500 hover:text-blue-600">
            This page was lost in the COSMOS. Turn back now.
          </span>
        </Link>
      </div>
    </div>
  );
}

export default FourOhFour;
