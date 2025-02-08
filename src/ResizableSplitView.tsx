import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent, ReactNode } from 'react';

const SPLIT_VIEW_RADIO = 1.618;


const ResizableSplitView: React.FC<{
    leftSide: ReactNode,
    rightSide: ReactNode
}> = ({leftSide, rightSide}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [splitPosition, setSplitPosition] = useState(100 / (1+SPLIT_VIEW_RADIO));
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragHandleRef = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = (e: ReactMouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Limit the split position between 10% and 90%
    const clampedPosition = Math.min(Math.max(newPosition, 10), 90);
    setSplitPosition(clampedPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className="flex h-full w-full"
    >
      {/* Left Panel */}
      <div 
        className="h-full"
        style={{ width: `${splitPosition}vw` }}
      >
        {leftSide}
      </div>

      {/* Drag Handle */}
      <div
        ref={dragHandleRef}
        className={`w-2 h-full cursor-col-resize bg-gray-400 hover:bg-gray-500 active:bg-gray-600 transition-colors
          ${isDragging ? 'bg-gray-400' : ''}`}
        onMouseDown={handleMouseDown}
      />

      {/* Right Panel */}
      <div 
        className="h-full flex-1"
      >
        {rightSide}
      </div>
    </div>
  );
};

export default ResizableSplitView;