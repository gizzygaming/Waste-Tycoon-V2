import React from 'react';
import { useGameStore, formatCurrency } from '../game/store/useGameStore';
import { Store, AlertTriangle, TrendingUp, Package } from 'lucide-react';

const MATERIAL_NAMES = {
  sandstone: 'Sandstone',
  '6f2': '6F2 Aggregate',
  type1: 'Type 1',
  type2: 'Type 2',
  general_waste: 'General Waste',
  metal: 'Scrap Metal',
  plastic: 'Plastic',
  paper: 'Paper',
  cardboard: 'Cardboard',
  rubble: 'Rubble',
  topsoil: 'Topsoil',
  sand: 'Sand',
  gravel: 'Gravel',
};

export const MarketplacePage = () => {
  const { game } = useGameStore();
  
  if (!game?.ui?.hasUnlockedGame) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="marketplace-locked">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-[var(--primary)]" />
          <div className="font-heading text-xl text-[var(--text-main)]">MARKETPLACE LOCKED</div>
          <div className="text-[var(--text-muted)] mt-2">
            Purchase your first depot to unlock the marketplace.
          </div>
        </div>
      </div>
    );
  }
  
  const prices = Object.values(game.marketplace.prices);
  
  // Calculate total inventory across all facilities
  const totalInventory = {};
  Object.values(game.marketplace.inventoryTonnesByFacility).forEach((facilityInv) => {
    Object.entries(facilityInv).forEach(([materialId, tonnes]) => {
      totalInventory[materialId] = (totalInventory[materialId] || 0) + tonnes;
    });
  });
  
  return (
    <div className="p-6" data-testid="marketplace-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-black text-[var(--text-main)]">MARKETPLACE</h1>
        <p className="text-[var(--text-muted)] mt-1">View material prices and manage inventory</p>
      </div>
      
      {/* Info Banner */}
      <div className="card bg-[var(--secondary)]/10 border-[var(--secondary)] mb-6">
        <div className="p-4 flex items-center gap-4">
          <TrendingUp size={24} className="text-[var(--secondary)]" />
          <div>
            <div className="text-[var(--text-main)] font-bold">Selling Materials</div>
            <div className="text-xs text-[var(--text-muted)]">
              To sell materials, dispatch a delivery job from your yard to a buyer. Prices shown are per tonne.
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Prices */}
        <div>
          <h2 className="font-heading text-xl font-bold text-[var(--text-main)] mb-4">MATERIAL PRICES</h2>
          <div className="card">
            <div className="card-header grid grid-cols-3 text-xs text-[var(--text-muted)] uppercase tracking-widest">
              <span>Material</span>
              <span className="text-right">Buy Price</span>
              <span className="text-right">Sell Price</span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {prices.map((price) => (
                <div 
                  key={price.materialId} 
                  className="grid grid-cols-3 p-4 hover:bg-[var(--surface-highlight)] transition-colors"
                  data-testid={`price-${price.materialId}`}
                >
                  <span className="text-[var(--text-main)] font-medium">
                    {MATERIAL_NAMES[price.materialId] || price.materialId}
                  </span>
                  <span className="font-mono text-right text-[var(--text-muted)]">
                    {price.buy ? formatCurrency(price.buy) : '-'}
                  </span>
                  <span className="font-mono text-right text-[var(--success)]">
                    {formatCurrency(price.sell)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Inventory */}
        <div>
          <h2 className="font-heading text-xl font-bold text-[var(--text-main)] mb-4">YOUR INVENTORY</h2>
          {Object.keys(totalInventory).length > 0 ? (
            <div className="card">
              <div className="card-header grid grid-cols-3 text-xs text-[var(--text-muted)] uppercase tracking-widest">
                <span>Material</span>
                <span className="text-right">Tonnes</span>
                <span className="text-right">Value</span>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {Object.entries(totalInventory).map(([materialId, tonnes]) => {
                  const price = game.marketplace.prices[materialId];
                  const value = tonnes * (price?.sell || 0);
                  
                  return (
                    <div 
                      key={materialId} 
                      className="grid grid-cols-3 p-4"
                      data-testid={`inventory-${materialId}`}
                    >
                      <span className="text-[var(--text-main)] font-medium">
                        {MATERIAL_NAMES[materialId] || materialId}
                      </span>
                      <span className="font-mono text-right text-[var(--text-main)]">
                        {tonnes.toFixed(1)}t
                      </span>
                      <span className="font-mono text-right text-[var(--success)]">
                        {formatCurrency(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="p-8 text-center">
                <Package size={48} className="mx-auto mb-4 text-[var(--muted)]" />
                <div className="text-[var(--text-muted)]">No materials in inventory</div>
                <div className="text-xs text-[var(--muted)] mt-2">
                  Materials are stored at yards and quarries
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
