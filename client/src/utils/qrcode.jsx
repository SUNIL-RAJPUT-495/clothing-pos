import React from 'react';


const stringToHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};


const seedRandom = (seed) => {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
};

export const QRCode = ({ value = '', size = 120 }) => {
  const hash = stringToHash(value || 'default');
  const rand = seedRandom(hash + 999);
  


  const gridSize = 25;
  const matrix = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));



  const drawSquare = (x, y, w, fill = true) => {
    for (let dy = 0; dy < w; dy++) {
      for (let dx = 0; dx < w; dx++) {
        if (x + dx < gridSize && y + dy < gridSize) {
          matrix[y + dy][x + dx] = fill;
        }
      }
    }
  };

  
  const drawFinderPattern = (x, y) => {
    drawSquare(x, y, 7, true);
    drawSquare(x + 1, y + 1, 5, false);
    drawSquare(x + 2, y + 2, 3, true);
  };

  drawFinderPattern(0, 0); // Top-left
  drawFinderPattern(gridSize - 7, 0); // Top-right
  drawFinderPattern(0, gridSize - 7); // Bottom-left

  // Draw Alignment Pattern (5x5 at bottom-right)
  const drawAlignmentPattern = (x, y) => {
    drawSquare(x, y, 5, true);
    drawSquare(x + 1, y + 1, 3, false);
    drawSquare(x + 2, y + 2, 1, true);
  };
  drawAlignmentPattern(gridSize - 9, gridSize - 9);

  // Timing patterns (connecting lines)
  for (let i = 8; i < gridSize - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Draw simulated data modules in the remaining space
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // Skip finder patterns
      if (
        (x < 8 && y < 8) ||
        (x > gridSize - 9 && y < 8) ||
        (x < 8 && y > gridSize - 9)
      ) {
        continue;
      }
      // Skip alignment pattern
      if (x >= gridSize - 9 && x < gridSize - 4 && y >= gridSize - 9 && y < gridSize - 4) {
        continue;
      }
      // Skip timing patterns
      if (x === 6 || y === 6) {
        continue;
      }

      // Fill with random noise based on hash seed
      matrix[y][x] = rand() > 0.48;
    }
  }

  // Render SVG elements
  const cellSize = size / gridSize;
  const rects = [];

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (matrix[y][x]) {
        rects.push(
          <rect
            key={`${x}-${y}`}
            x={x * cellSize}
            y={y * cellSize}
            width={cellSize}
            height={cellSize}
            fill="currentColor"
          />
        );
      }
    }
  }

  return (
    <div className="flex flex-col items-center bg-white p-2 rounded-xl border border-slate-100 shadow-sm inline-block">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="text-slate-900"
      >
        <g>{rects}</g>
      </svg>
      <span className="text-[8px] font-mono tracking-wider mt-1 text-slate-400 select-all truncate max-w-[100px]">
        {value}
      </span>
    </div>
  );
};

export default QRCode;
