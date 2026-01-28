import React, { useEffect } from "react";
import "@/App.css";
import "@/index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useGameStore } from "./game/store/useGameStore";

// Components
import { Layout } from "./components/Layout";
import { SimRunner } from "./components/SimRunner";

// Pages
import { MapPage } from "./pages/MapPage";
import { ContractsPage } from "./pages/ContractsPage";
import { DispatchPage } from "./pages/DispatchPage";
import { FleetPage } from "./pages/FleetPage";
import { ShopPage } from "./pages/ShopPage";
import { FacilitiesPage } from "./pages/FacilitiesPage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { HelpPage } from "./pages/HelpPage";

// Start Screen Component
const StartScreen = () => {
  const { saveSlots, newGame, loadGame } = useGameStore();
  const slots = [1, 2, 3, 4, 5];
  const hasAnySave = Object.keys(saveSlots).length > 0;
  
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-8" data-testid="start-screen">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-6xl font-black text-[var(--primary)] tracking-tight mb-2">
            WASTE TYCOON
          </h1>
          <p className="text-[var(--text-muted)] uppercase tracking-widest">
            UK Waste & Logistics Empire
          </p>
        </div>
        
        {/* Save Slots */}
        <div className="space-y-3 mb-8">
          {slots.map((slotId) => {
            const slot = saveSlots[slotId];
            
            return (
              <div 
                key={slotId}
                className="card hover:border-[var(--primary)] transition-colors"
                data-testid={`start-slot-${slotId}`}
              >
                <div className="p-4 flex items-center justify-between">
                  {slot ? (
                    <>
                      <div>
                        <div className="font-bold text-[var(--text-main)]">{slot.meta.name}</div>
                        <div className="text-xs text-[var(--text-muted)]">
                          Day {slot.meta.preview.day}, {slot.meta.preview.year} • £{(slot.meta.preview.cash / 1000).toFixed(0)}k
                        </div>
                      </div>
                      <button
                        onClick={() => loadGame(slotId)}
                        className="btn-primary"
                        data-testid={`continue-${slotId}`}
                      >
                        CONTINUE
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-[var(--text-muted)]">Empty Slot {slotId}</div>
                      <button
                        onClick={() => newGame(slotId)}
                        className="btn-outline"
                        data-testid={`new-game-${slotId}`}
                      >
                        NEW GAME
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="text-center text-xs text-[var(--muted)]">
          <p>Build your waste empire across the UK</p>
          <p className="mt-1">Start by purchasing a Transport Depot</p>
        </div>
      </div>
    </div>
  );
};

// Game Wrapper - shows start screen or game
const GameWrapper = () => {
  const { game, activeSlotId, loadGame, saveSlots } = useGameStore();
  const [isLoading, setIsLoading] = useState(true);
  
  // Auto-load game from localStorage on mount
  useEffect(() => {
    if (activeSlotId && saveSlots[activeSlotId] && !game) {
      loadGame(activeSlotId);
    }
    // Give it a moment then stop loading
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, [game, activeSlotId, loadGame, saveSlots]);
  
  // Show loading briefly while we check localStorage
  if (isLoading && !game && activeSlotId) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-[var(--primary)] font-heading text-xl">Loading game...</div>
      </div>
    );
  }
  
  if (!game || !activeSlotId) {
    return <StartScreen />;
  }
  
  return (
    <>
      <SimRunner />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/map" replace />} />
          <Route path="map" element={<MapPage />} />
          <Route path="contracts" element={<ContractsPage />} />
          <Route path="dispatch" element={<DispatchPage />} />
          <Route path="fleet" element={<FleetPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="facilities" element={<FacilitiesPage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="help" element={<HelpPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/map" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <GameWrapper />
    </BrowserRouter>
  );
}

export default App;
