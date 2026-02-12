import React, { useState, useRef } from "react";
import { RefreshCw } from "lucide-react";

export default function PullToRefresh({ onRefresh, children }) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pullDistance = useRef(0);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (startY.current === 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;
    
    if (distance > 0 && window.scrollY === 0) {
      pullDistance.current = distance;
      if (distance > 80) {
        setPulling(true);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance.current > 80 && !refreshing) {
      setRefreshing(true);
      setPulling(false);
      await onRefresh();
      setRefreshing(false);
    }
    startY.current = 0;
    pullDistance.current = 0;
    setPulling(false);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {(pulling || refreshing) && (
        <div className="absolute top-0 left-0 right-0 flex justify-center py-4 z-50">
          <RefreshCw 
            size={24} 
            className={`text-teal-600 ${refreshing ? 'animate-spin' : ''}`}
          />
        </div>
      )}
      <div className={`${pulling ? 'mt-16' : ''} transition-all duration-200`}>
        {children}
      </div>
    </div>
  );
}