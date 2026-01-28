import { useEffect, useRef } from 'react';
import { useGameStore } from '../game/store/useGameStore';

export const SimRunner = () => {
  const { game, tick, processDispatchJobs } = useGameStore();
  const lastTickRef = useRef(Date.now());
  const frameRef = useRef();
  
  useEffect(() => {
    if (!game) return;
    
    const gameLoop = () => {
      const now = Date.now();
      const deltaMs = now - lastTickRef.current;
      lastTickRef.current = now;
      
      // Run game tick
      tick(deltaMs);
      
      // Process dispatch jobs
      processDispatchJobs();
      
      // Schedule next frame
      frameRef.current = requestAnimationFrame(gameLoop);
    };
    
    // Start the game loop
    frameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [game, tick, processDispatchJobs]);
  
  return null; // This component doesn't render anything
};

export default SimRunner;
