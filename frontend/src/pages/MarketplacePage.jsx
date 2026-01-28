import React, { useState } from 'react';
import { useGameStore, formatCurrency, MATERIAL_PRICES, ASSET_DEFS } from '../game/store/useGameStore';
import { Store, AlertTriangle, TrendingUp, Package, Truck, DollarSign, User, ChevronDown } from 'lucide-react';

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
  const { game, sellMaterial, scheduleMaterialDelivery } = useGameStore();
  const [sellQuantity, setSellQuantity] = useState({});
  const [sellError, setSellError] = useState(null);
  const [deliveryMode, setDeliveryMode] = useState({}); // Track which items are in delivery mode
  const [selectedDriver, setSelectedDriver] = useState({});
  const [selectedVehicle, setSelectedVehicle] = useState({});
  
  if (!game?.ui?.hasUnlockedGame) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="marketplace-locked">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-[var(--primary)]" />
          <div className="font-heading text-xl text-[var(--text-main)]">MARKETPLACE LOCKED</div>
          <div className="text-[var(--text-muted)] mt-2">Purchase your first depot to unlock the marketplace.</div>
        </div>
      </div>
    );
  }
  
  const prices = Object.values(game.marketplace.prices);
  
  // Calculate inventory by facility
  const inventoryByFacility = {};
  let totalValue = 0;
  
  Object.entries(game.marketplace.inventoryTonnesByFacility).forEach(([facilityId, inventory]) => {
    const facility = game.facilities.facilities[facilityId];
    if (!facility) return;
    
    const facilityInventory = [];
    Object.entries(inventory).forEach(([materialId, tonnes]) => {
      if (tonnes > 0) {
        const price = MATERIAL_PRICES[materialId]?.sell || 0;
        const value = tonnes * price;
        totalValue += value;
        facilityInventory.push({ materialId, tonnes, price, value });
      }
    });
    
    if (facilityInventory.length > 0) {
      inventoryByFacility[facilityId] = {
        facility,
        inventory: facilityInventory,
      };
    }
  });
  
  const handleSell = (facilityId, materialId, maxTonnes) => {
    const key = `${facilityId}-${materialId}`;
    const quantity = parseFloat(sellQuantity[key]) || maxTonnes;
    
    if (quantity <= 0 || quantity > maxTonnes) {
      setSellError('Invalid quantity');
      return;
    }
    
    const result = sellMaterial(facilityId, materialId, quantity);
    if (result.success) {
      setSellQuantity({ ...sellQuantity, [key]: '' });
      setSellError(null);
    } else {
      setSellError(result.error);
    }
  };
  
  const handleScheduleDelivery = (facilityId, materialId, maxTonnes) => {
    const key = `${facilityId}-${materialId}`;
    const quantity = parseFloat(sellQuantity[key]) || maxTonnes;
    const driverId = selectedDriver[key];
    const vehicleId = selectedVehicle[key];
    
    if (quantity <= 0 || quantity > maxTonnes) {
      setSellError('Invalid quantity');
      return;
    }
    
    if (!driverId) {
      setSellError('Select a driver');
      return;
    }
    
    if (!vehicleId) {
      setSellError('Select a vehicle');
      return;
    }
    
    const result = scheduleMaterialDelivery(facilityId, materialId, quantity, driverId, vehicleId);
    if (result.success) {
      setSellQuantity({ ...sellQuantity, [key]: '' });
      setDeliveryMode({ ...deliveryMode, [key]: false });
      setSelectedDriver({ ...selectedDriver, [key]: '' });
      setSelectedVehicle({ ...selectedVehicle, [key]: '' });
      setSellError(null);
    } else {
      setSellError(result.error);
    }
  };
  
  // Get available drivers and vehicles
  const drivers = Object.values(game.staff.staff).filter(s => s.role === 'driver');
  const vehicles = Object.values(game.assets.physical).filter(a => a.kind === 'vehicle');
  const activeJobs = Object.values(game.dispatch.activeJobs);
  
  const dispatchedDriverIds = new Set(activeJobs.map(j => j.driverId));
  const dispatchedVehicleIds = new Set(activeJobs.map(j => j.vehicleAssetId));
  
  const availableDrivers = drivers.filter(d => !dispatchedDriverIds.has(d.id));
  const availableVehicles = vehicles.filter(v => !dispatchedVehicleIds.has(v.id) && !v.inRepair && v.condition >= 10);
  
  return (
    <div className="p-3 lg:p-6" data-testid="marketplace-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 lg:mb-6">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-black text-[var(--text-main)]">MARKETPLACE</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">View prices and sell your materials</p>
        </div>
        <div className="card bg-[var(--success)]/10 border-[var(--success)]">
          <div className="p-3 lg:p-4">
            <div className="text-[10px] lg:text-xs text-[var(--text-muted)] uppercase">Inventory Value</div>
            <div className="font-mono text-xl lg:text-2xl font-bold text-[var(--success)]">{formatCurrency(totalValue)}</div>
          </div>
        </div>
      </div>
      
      {/* Info Banner */}
      <div className="card bg-[var(--secondary)]/10 border-[var(--secondary)] mb-4 lg:mb-6">
        <div className="p-3 lg:p-4 flex items-center gap-3 lg:gap-4">
          <TrendingUp size={20} className="text-[var(--secondary)] flex-shrink-0" />
          <div>
            <div className="text-[var(--text-main)] font-bold text-sm lg:text-base">Material Trading</div>
            <div className="text-[10px] lg:text-xs text-[var(--text-muted)]">
              Materials are produced by quarries (500t/day) and stored at your facilities. Sell directly from here.
            </div>
          </div>
        </div>
      </div>
      
      {sellError && (
        <div className="bg-[var(--danger)]/10 border border-[var(--danger)] p-3 mb-4 lg:mb-6 text-[var(--danger)] text-sm">
          {sellError}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Prices */}
        <div>
          <h2 className="font-heading text-lg lg:text-xl font-bold text-[var(--text-main)] mb-3 lg:mb-4 flex items-center gap-2">
            <DollarSign size={18} />
            PRICES
          </h2>
          <div className="card">
            <div className="card-header grid grid-cols-3 text-xs text-[var(--text-muted)] uppercase tracking-widest">
              <span>Material</span>
              <span className="text-right">Buy</span>
              <span className="text-right">Sell</span>
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
                    {price.buy ? `${formatCurrency(price.buy)}/t` : '-'}
                  </span>
                  <span className="font-mono text-right text-[var(--success)] font-bold">
                    {formatCurrency(price.sell)}/t
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Inventory */}
        <div>
          <h2 className="font-heading text-lg lg:text-xl font-bold text-[var(--text-main)] mb-3 lg:mb-4 flex items-center gap-2">
            <Package size={18} />
            YOUR INVENTORY
          </h2>
          
          {Object.keys(inventoryByFacility).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(inventoryByFacility).map(([facilityId, { facility, inventory }]) => (
                <div key={facilityId} className="card">
                  <div className="card-header">
                    <h3 className="font-heading font-bold text-[var(--text-main)]">{facility.name}</h3>
                  </div>
                  <div className="divide-y divide-[var(--border)]">
                    {inventory.map(({ materialId, tonnes, price, value }) => {
                      const key = `${facilityId}-${materialId}`;
                      return (
                        <div key={materialId} className="p-4" data-testid={`inventory-${facilityId}-${materialId}`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[var(--text-main)] font-medium">
                              {MATERIAL_NAMES[materialId] || materialId}
                            </span>
                            <span className="font-mono text-[var(--success)]">
                              {formatCurrency(value)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="text-xs text-[var(--text-muted)] mb-1">
                                {tonnes.toFixed(1)}t @ {formatCurrency(price)}/t
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  placeholder={`Max ${tonnes.toFixed(0)}t`}
                                  value={sellQuantity[key] || ''}
                                  onChange={(e) => setSellQuantity({ ...sellQuantity, [key]: e.target.value })}
                                  className="flex-1 py-1 px-2 text-sm"
                                  max={tonnes}
                                  min={1}
                                />
                                <button
                                  onClick={() => handleSell(facilityId, materialId, tonnes)}
                                  className="btn-primary py-1 px-4 text-sm"
                                  data-testid={`sell-${key}`}
                                >
                                  SELL
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card">
              <div className="p-12 text-center">
                <Package size={48} className="mx-auto mb-4 text-[var(--muted)]" />
                <div className="text-[var(--text-muted)]">No materials in inventory</div>
                <div className="text-xs text-[var(--muted)] mt-2">
                  Buy a quarry to start producing materials (500t/day)
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
