import React from 'react';


const CODE39_MAP = {
  '0': '101001101101', '1': '110100101011', '2': '101100101011', '3': '110110010101',
  '4': '101001101011', '5': '110100110101', '6': '101100110101', '7': '101001011011',
  '8': '110100101101', '9': '101100101101', 'A': '110101001011', 'B': '101101001011',
  'C': '110110100101', 'D': '101011001011', 'E': '110101100101', 'F': '101101100101',
  'G': '101010011011', 'H': '110101001101', 'I': '101101001101', 'J': '101011001101',
  'K': '110101010011', 'L': '101101010011', 'M': '110110101001', 'N': '101011010011',
  'O': '110101101001', 'P': '101101101001', 'Q': '101010110011', 'R': '110101011001',
  'S': '101101011001', 'T': '101011011001', 'U': '110010101011', 'V': '100110101011',
  'W': '110011010101', 'X': '100101101011', 'Y': '110010110101', 'Z': '100110110101',
  '-': '100101011011', '.': '110010101101', ' ': '100110101101', '*': '100101101101',
  '$': '100100100101', '/': '100100101001', '+': '100101001001', '%': '101001001001'
};

export const Barcode = ({ value = '', height = 50, widthScale = 1.8, showText = true }) => {

  const cleanVal = value.toString().toUpperCase().replace(/[^0-9A-Z\-\.\s\$\/\+\%]/g, '');
  const barcodeString = `*${cleanVal}*`;
  

  let binaryString = '';
  for (let i = 0; i < barcodeString.length; i++) {
    const char = barcodeString[i];
    const pattern = CODE39_MAP[char] || CODE39_MAP['*'];
    binaryString += pattern + '0'; // inter-character space
  }

  
  const barWidth = widthScale;
  const svgWidth = binaryString.length * barWidth;
  const svgHeight = height + (showText ? 20 : 0);

  const rects = [];
  let currentX = 0;

  for (let i = 0; i < binaryString.length; i++) {
    if (binaryString[i] === '1') {
      rects.push(
        <rect
          key={i}
          x={currentX}
          y={0}
          width={barWidth}
          height={height}
          fill="currentColor"
        />
      );
    }
    currentX += barWidth;
  }

  return (
    <div className="flex flex-col items-center">
      <svg
        width="100%"
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="none"
        className="text-slate-800 dark:text-slate-200"
      >
        <g>{rects}</g>
      </svg>
      {showText && (
        <span className="text-[10px] font-mono tracking-widest mt-1 text-slate-500 dark:text-slate-400">
          {cleanVal}
        </span>
      )}
    </div>
  );
};

export default Barcode;
