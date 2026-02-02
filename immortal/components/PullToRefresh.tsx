import React, { useState, useRef } from 'react';
import { RefreshCcw } from 'lucide-react';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const startY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const pullThreshold = 80;

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0) {
            startY.current = e.touches[0].pageY;
        } else {
            startY.current = -1;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startY.current === -1 || isRefreshing) return;

        const currentY = e.touches[0].pageY;
        const diff = currentY - startY.current;

        if (diff > 0) {
            // Check if we are at the top of the page
            if (window.scrollY === 0) {
                setPullDistance(Math.min(diff * 0.4, 100));
            }
        } else {
            setPullDistance(0);
        }
    };

    const handleTouchEnd = async () => {
        if (startY.current === -1 || isRefreshing) return;

        if (pullDistance >= pullThreshold - 20) {
            setIsRefreshing(true);
            setPullDistance(40);
            try {
                await onRefresh();
            } finally {
                setTimeout(() => {
                    setIsRefreshing(false);
                    setPullDistance(0);
                }, 500);
            }
        } else {
            setPullDistance(0);
        }
    };

    return (
        <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative transition-transform duration-200 ease-out"
            style={{ transform: `translateY(${pullDistance}px)` }}
        >
            <div
                className="absolute left-0 right-0 flex justify-center items-center pointer-events-none"
                style={{
                    top: -60,
                    height: 60,
                    opacity: pullDistance > 0 ? 1 : 0,
                    transform: `translateY(${pullDistance > 40 ? 40 : pullDistance}px)`
                }}
            >
                <div className={`p-2 bg-gaming-accent/10 border border-gaming-accent/20 rounded-full transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
                    style={{ transform: `rotate(${pullDistance * 3}deg)` }}>
                    <RefreshCcw size={18} className="text-gaming-accent" />
                </div>
            </div>
            {children}
        </div>
    );
};

export default PullToRefresh;
