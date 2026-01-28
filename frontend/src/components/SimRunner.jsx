import { useEffect, useRef } from 'react';
import { useGameStore } from '../game/store/useGameStore';

export const SimRunner = () => {
  const { game, tick, processDispatchJobs, processRepairs, generateContracts } = useGameStore();
  const lastTickRef = useRef(Date.now());
  const frameRef = useRef();
  
  useEffect(() => {
    if (!game) return;
    
    // Generate initial contracts if none exist
    if (game.ui.hasUnlockedGame && Object.keys(game.contracts.byId).length === 0) {
      generateContracts(8);
    }
    
    const gameLoop = () => {
      const now = Date.now();
      const deltaMs = Math.min(now - lastTickRef.current, 100); // Cap delta to prevent huge jumps
      lastTickRef.current = now;
      
      // Run game tick
      tick(deltaMs);
      
      // Process dispatch jobs
      processDispatchJobs();
      
      // Process vehicle repairs
      processRepairs();
      
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
  }, [game, tick, processDispatchJobs, processRepairs, generateContracts]);
  
  // Generate new contracts periodically
  useEffect(() => {
    if (!game || !game.ui.hasUnlockedGame) return;
    
    const interval = setInterval(() => {
      const availableContracts = Object.values(game.contracts.byId).filter(c => c.status === 'available');
      if (availableContracts.length < 5) {
        generateContracts(3);
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [game, generateContracts]);
  
  return null; // This component doesn't render anything
};

export default SimRunner;
