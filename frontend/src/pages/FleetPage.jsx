import React, { useState } from 'react';
import { useGameStore, formatCurrency, ASSET_DEFS } from '../game/store/useGameStore';
import { Car, Truck, Package, Wrench, AlertTriangle, Clock, CheckCircle, Trash2 } from 'lucide-react';

export const FleetPage = () => {
  const { game, startRepair, sellAsset } = useGameStore();
  const [activeTab, setActiveTab] = useState('vehicles');
  const [sellConfirm, setSellConfirm] = useState(null);
  
  if (!game?.ui?.hasUnlockedGame) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="fleet-locked">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-[var(--primary)]" />
          <div className="font-heading text-xl text-[var(--text-main)]">FLEET LOCKED</div>
          <div className="text-[var(--text-muted)] mt-2">Purchase your first depot to unlock fleet management.</div>
        </div>
      </div>
    );
  }
  
  const assets = Object.values(game.assets.physical);
  const vehicles = assets.filter(a => a.kind === 'vehicle');
  const trailers = assets.filter(a => a.kind === 'trailer');
  const containers = assets.filter(a => a.kind === 'container');
  
  // Check for mechanic access
  const hasMechanic = Object.values(game.facilities.facilities).some(f => 
    f.type === 'mechanic_garage' && !f.closedAtGameSeconds
  );
  
  // Calculate fleet value
  const fleetValue = assets.reduce((sum, a) => {
    const def = ASSET_DEFS[a.defId];
    if (a.isLeased) return sum;
    const condition = a.condition || 100;
    return sum + Math.round((def?.price || 0) * 0.6 * condition / 100);
  }, 0);
  
  const handleRepair = (vehicleId) => {
    startRepair(vehicleId);
  };
  
  const handleSell = (assetId) => {
    sellAsset(assetId);
    setSellConfirm(null);
  };
  
  const tabs = [
    { id: 'vehicles', label: 'Vehicles', count: vehicles.length, icon: Car },
    { id: 'trailers', label: 'Trailers', count: trailers.length, icon: Truck },
    { id: 'containers', label: 'Containers', count: containers.length, icon: Package },
  ];
  
  const activeAssets = activeTab === 'vehicles' ? vehicles : 
                       activeTab === 'trailers' ? trailers : containers;
  
  return (
    <div className="p-3 lg:p-6" data-testid="fleet-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 lg:mb-6">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-black text-[var(--text-main)]">FLEET</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage your vehicles, trailers, and containers</p>
        </div>
        <div className="card">
          <div className="p-3 lg:p-4">
            <div className="text-[10px] lg:text-xs text-[var(--text-muted)] uppercase">Fleet Value</div>
            <div className="font-mono text-xl lg:text-2xl font-bold text-[var(--primary)]">{formatCurrency(fleetValue)}</div>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-4 lg:mb-6">
        <div className="card">
          <div className="p-3 lg:p-4 flex items-center gap-3 lg:gap-4">
            <Car size={24} className="text-[var(--primary)] hidden sm:block" />
            <div>
              <div className="text-[10px] lg:text-xs text-[var(--text-muted)] uppercase">Vehicles</div>
              <div className="font-mono text-xl lg:text-2xl font-bold text-[var(--text-main)]">{vehicles.length}</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="p-3 lg:p-4 flex items-center gap-3 lg:gap-4">
            <Truck size={24} className="text-[var(--secondary)] hidden sm:block" />
            <div>
              <div className="text-[10px] lg:text-xs text-[var(--text-muted)] uppercase">Trailers</div>
              <div className="font-mono text-xl lg:text-2xl font-bold text-[var(--text-main)]">{trailers.length}</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="p-3 lg:p-4 flex items-center gap-3 lg:gap-4">
            <Package size={24} className="text-[var(--accent)] hidden sm:block" />
            <div>
              <div className="text-[10px] lg:text-xs text-[var(--text-muted)] uppercase">Containers</div>
              <div className="font-mono text-xl lg:text-2xl font-bold text-[var(--text-main)]">{containers.length}</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="p-3 lg:p-4 flex items-center gap-3 lg:gap-4">
            <Wrench size={24} className={`${hasMechanic ? 'text-[var(--success)]' : 'text-[var(--danger)]'} hidden sm:block`} />
            <div>
              <div className="text-[10px] lg:text-xs text-[var(--text-muted)] uppercase">Mechanic</div>
              <div className={`font-bold text-sm lg:text-base ${hasMechanic ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {hasMechanic ? 'Available' : 'No Access'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-1 lg:gap-2 mb-4 lg:mb-6 bg-[var(--surface)] p-1">
        {tabs.map(({ id, label, count, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1 lg:gap-2 py-2 lg:py-3 transition-colors ${
              activeTab === id
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-highlight)]'
            }`}
            data-testid={`tab-${id}`}
          >
            <Icon size={16} />
            <span className="font-bold uppercase text-xs lg:text-base">{label}</span>
            <span className="font-mono text-xs lg:text-sm">({count})</span>
          </button>
        ))}
      </div>
      
      {/* Asset Grid */}
      {activeAssets.length > 0 ? (
        <div className="grid gap-3 lg:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeAssets.map((asset) => {
            const def = ASSET_DEFS[asset.defId];
            const depot = game.facilities.depots[asset.depotId];
            const isVehicle = asset.kind === 'vehicle';
            const needsRepair = isVehicle && asset.condition < 10;
            const isRepairing = isVehicle && asset.inRepair;
            const sellValue = !asset.isLeased ? Math.round((def?.price || 0) * 0.6 * (asset.condition || 100) / 100) : 0;
            
            // Check if in active job
            const inJob = Object.values(game.dispatch.activeJobs).some(j => 
              j.vehicleAssetId === asset.id || j.trailerAssetId === asset.id || j.containerAssetId === asset.id
            );
            
            return (
              <div key={asset.id} className="card" data-testid={`asset-${asset.id}`}>
                <div className="card-header flex justify-between items-center">
                  {isVehicle ? (
                    <span className="font-mono font-bold text-[var(--text-main)]">{asset.plate}</span>
                  ) : (
                    <span className="font-bold text-[var(--text-main)]">{def?.name || asset.defId}</span>
                  )}
                  <div className="flex gap-2">
                    {asset.isLeased && <span className="badge badge-warning">LEASED</span>}
                    {inJob && <span className="badge badge-info">ON JOB</span>}
                  </div>
                </div>
                <div className="card-content">
                  <div className="text-[var(--text-main)] font-bold mb-1">
                    {def?.name || asset.defId.replace(/_/g, ' ')}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mb-4">
                    Location: {depot?.name || 'Unknown Depot'}
                  </div>
                  
                  {/* Vehicle Condition */}
                  {isVehicle && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--text-muted)]">Condition</span>
                        <span className={`font-mono ${
                          asset.condition > 50 ? 'text-[var(--success)]' :
                          asset.condition > 20 ? 'text-[var(--accent)]' : 'text-[var(--danger)]'
                        }`}>{asset.condition}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className={`progress-bar-fill ${
                            asset.condition > 50 ? 'high' : asset.condition > 20 ? 'medium' : 'low'
                          }`}
                          style={{ width: `${asset.condition}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Repair Status */}
                  {isRepairing && (
                    <div className="flex items-center gap-2 text-[var(--secondary)] bg-[var(--secondary)]/10 p-2 mb-3">
                      <Clock size={16} className="animate-pulse" />
                      <span className="text-sm font-bold">REPAIRING...</span>
                    </div>
                  )}
                  
                  {/* Needs Repair Warning */}
                  {needsRepair && !isRepairing && (
                    <div className="flex items-center gap-2 text-[var(--danger)] bg-[var(--danger)]/10 p-2 mb-3">
                      <AlertTriangle size={16} />
                      <span className="text-sm font-bold">NEEDS REPAIR</span>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="space-y-2">
                    {/* Repair Button */}
                    {isVehicle && !isRepairing && asset.condition < 100 && !inJob && (
                      <button
                        onClick={() => handleRepair(asset.id)}
                        disabled={!hasMechanic}
                        className={`w-full py-2 text-sm font-bold transition-colors ${
                          hasMechanic 
                            ? 'btn-secondary' 
                            : 'bg-[var(--border)] text-[var(--muted)] cursor-not-allowed'
                        }`}
                        data-testid={`repair-${asset.id}`}
                      >
                        <Wrench size={14} className="inline mr-2" />
                        REPAIR ({formatCurrency((100 - asset.condition) * 50)})
                      </button>
                    )}
                    
                    {/* Sell Button */}
                    {!asset.isLeased && !inJob && (
                      <>
                        {sellConfirm === asset.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSell(asset.id)}
                              className="flex-1 btn-danger py-2 text-sm"
                            >
                              CONFIRM SELL
                            </button>
                            <button
                              onClick={() => setSellConfirm(null)}
                              className="px-4 py-2 bg-[var(--border)] text-[var(--text-muted)] text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSellConfirm(asset.id)}
                            className="w-full py-2 text-sm font-bold bg-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--danger)] hover:text-white transition-colors"
                            data-testid={`sell-${asset.id}`}
                          >
                            <Trash2 size={14} className="inline mr-2" />
                            SELL ({formatCurrency(sellValue)})
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="p-12 text-center">
            {activeTab === 'vehicles' && <Car size={48} className="mx-auto mb-4 text-[var(--muted)]" />}
            {activeTab === 'trailers' && <Truck size={48} className="mx-auto mb-4 text-[var(--muted)]" />}
            {activeTab === 'containers' && <Package size={48} className="mx-auto mb-4 text-[var(--muted)]" />}
            <div className="text-[var(--text-muted)]">No {activeTab} owned</div>
            <div className="text-xs text-[var(--muted)] mt-2">Purchase {activeTab} from the Shop</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetPage;
