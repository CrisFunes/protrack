import React from 'react';

const JiraIcon = ({ width = 48, height = 48, className }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M40.202 7.22998H22.124C22.124 11.736 25.777 15.388 30.282 15.388H33.611V18.601C33.611 23.107 37.264 26.759 41.769 26.759V8.79798C41.769 7.93198 41.067 7.22998 40.201 7.22998H40.202Z" fill="#1D7AFC"/>
      <path d="M31.255 16.2358H13.177C13.177 20.7418 16.83 24.3938 21.335 24.3938H24.664V27.6068C24.664 32.1128 28.317 35.7648 32.822 35.7648V17.8038C32.822 16.9378 32.12 16.2358 31.254 16.2358H31.255Z" fill="url(#paint0_linear_818_567)"/>
      <path d="M22.308 25.2412H4.22998C4.22998 29.7472 7.88298 33.3992 12.388 33.3992H15.717V36.6122C15.717 41.1182 19.37 44.7702 23.875 44.7702V26.8092C23.875 25.9432 23.173 25.2412 22.307 25.2412H22.308Z" fill="url(#paint1_linear_818_567)"/>
      <defs>
        <linearGradient id="paint0_linear_818_567" x1="32.439" y1="16.2658" x2="24.749" y2="24.1958" gradientUnits="userSpaceOnUse">
          <stop offset="0.176" stopColor="#0055CC"/>
          <stop offset="1" stopColor="#1D7AFC"/>
        </linearGradient>
        <linearGradient id="paint1_linear_818_567" x1="24.003" y1="25.3252" x2="15.112" y2="33.9752" gradientUnits="userSpaceOnUse">
          <stop offset="0.176" stopColor="#0055CC"/>
          <stop offset="1" stopColor="#1D7AFC"/>
        </linearGradient>
      </defs>
    </svg>
  );
};

export default JiraIcon;