import React from 'react';
import { useGameStore, formatCurrency } from '../game/store/useGameStore';
import { Car, Truck, Package, Wrench, AlertTriangle } from 'lucide-react';

const ASSET_NAMES = {
  small_tipper: 'Small Tipper',
  large_tipper: 'Large Tipper',
  skip_truck: 'Skip Truck',
  grab_lorry: 'Grab Lorry',
  artic_unit: 'Artic Unit',
  flatbed_trailer: 'Flatbed Trailer',
  tipper_trailer: 'Tipper Trailer',
  walking_floor: 'Walking Floor Trailer',
  skip_8yd: '8 Yard Skip',
  skip_12yd: '12 Yard Skip',
  skip_16yd: '16 Yard Skip',
  roro_20yd: '20 Yard RoRo',
  roro_40yd: '40 Yard RoRo',
};

export const FleetPage = () => {
  const { game } = useGameStore();
  
  if (!game?.ui?.hasUnlockedGame) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="fleet-locked">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-[var(--primary)]" />
          <div className="font-heading text-xl text-[var(--text-main)]">FLEET LOCKED</div>
          <div className="text-[var(--text-muted)] mt-2">
            Purchase your first depot to unlock fleet management.
          </div>
        </div>
      </div>
    );
  }
  
  const assets = Object.values(game.assets.physical);
  const vehicles = assets.filter(a => a.kind === 'vehicle');
  const trailers = assets.filter(a => a.kind === 'trailer');
  const containers = assets.filter(a => a.kind === 'container');
  
  return (
    <div className="p-6" data-testid="fleet-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-black text-[var(--text-main)]">FLEET</h1>
        <p className="text-[var(--text-muted)] mt-1">Manage your vehicles, trailers, and containers</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="p-4 flex items-center gap-4">
            <Car size={32} className="text-[var(--primary)]" />
            <div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Vehicles</div>
              <div className="font-mono text-2xl font-bold text-[var(--text-main)]">{vehicles.length}</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="p-4 flex items-center gap-4">
            <Truck size={32} className="text-[var(--secondary)]" />
            <div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Trailers</div>
              <div className="font-mono text-2xl font-bold text-[var(--text-main)]">{trailers.length}</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="p-4 flex items-center gap-4">
            <Package size={32} className="text-[var(--accent)]" />
            <div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Containers</div>
              <div className="font-mono text-2xl font-bold text-[var(--text-main)]">{containers.length}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Vehicles Section */}
      <div className="mb-8">
        <h2 className="font-heading text-xl font-bold text-[var(--text-main)] mb-4">VEHICLES</h2>
        {vehicles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => {
              const depot = game.facilities.depots[vehicle.depotId];
              const needsRepair = vehicle.condition < 10;
              
              return (
                <div key={vehicle.id} className="card" data-testid={`vehicle-${vehicle.id}`}>
                  <div className="card-header flex justify-between items-center">
                    <span className="font-mono font-bold text-[var(--text-main)]">{vehicle.plate}</span>
                    {vehicle.isLeased && <span className="badge badge-warning">LEASED</span>}
                  </div>
                  <div className="card-content">
                    <div className="text-[var(--text-main)] font-bold mb-2">
                      {ASSET_NAMES[vehicle.defId] || vehicle.defId}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mb-4">
                      Location: {depot?.name || 'Unknown'}
                    </div>
                    
                    {/* Condition Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--text-muted)]">Condition</span>
                        <span className={`font-mono ${
                          vehicle.condition > 50 ? 'text-[var(--success)]' :
                          vehicle.condition > 20 ? 'text-[var(--accent)]' : 'text-[var(--danger)]'
                        }`}>{vehicle.condition}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className={`progress-bar-fill ${
                            vehicle.condition > 50 ? 'high' : vehicle.condition > 20 ? 'medium' : 'low'
                          }`}
                          style={{ width: `${vehicle.condition}%` }}
                        />
                      </div>
                    </div>
                    
                    {needsRepair && (
                      <div className="flex items-center gap-2 text-[var(--danger)] mt-3">
                        <Wrench size={14} />
                        <span className="text-xs font-bold">NEEDS REPAIR</span>
                      </div>
                    )}
                    
                    {vehicle.inRepair && (
                      <div className="flex items-center gap-2 text-[var(--secondary)] mt-3">
                        <Wrench size={14} className="animate-pulse" />
                        <span className="text-xs font-bold">IN REPAIR</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card">
            <div className="p-8 text-center">
              <Car size={48} className="mx-auto mb-4 text-[var(--muted)]" />
              <div className="text-[var(--text-muted)]">No vehicles owned</div>
              <div className="text-xs text-[var(--muted)] mt-2">Purchase vehicles from the Shop</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Trailers Section */}
      <div className="mb-8">
        <h2 className="font-heading text-xl font-bold text-[var(--text-main)] mb-4">TRAILERS</h2>
        {trailers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trailers.map((trailer) => {
              const depot = game.facilities.depots[trailer.depotId];
              return (
                <div key={trailer.id} className="card" data-testid={`trailer-${trailer.id}`}>
                  <div className="card-header flex justify-between items-center">
                    <span className="font-bold text-[var(--text-main)]">
                      {ASSET_NAMES[trailer.defId] || trailer.defId}
                    </span>
                    {trailer.isLeased && <span className="badge badge-warning">LEASED</span>}
                  </div>
                  <div className="card-content">
                    <div className="text-xs text-[var(--text-muted)]">
                      Location: {depot?.name || 'Unknown'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card">
            <div className="p-8 text-center">
              <Truck size={48} className="mx-auto mb-4 text-[var(--muted)]" />
              <div className="text-[var(--text-muted)]">No trailers owned</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Containers Section */}
      <div>
        <h2 className="font-heading text-xl font-bold text-[var(--text-main)] mb-4">CONTAINERS</h2>
        {containers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {containers.map((container) => {
              const depot = game.facilities.depots[container.depotId];
              return (
                <div key={container.id} className="card" data-testid={`container-${container.id}`}>
                  <div className="card-content">
                    <div className="font-bold text-[var(--text-main)] mb-1">
                      {ASSET_NAMES[container.defId] || container.defId}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {depot?.name || 'Unknown'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card">
            <div className="p-8 text-center">
              <Package size={48} className="mx-auto mb-4 text-[var(--muted)]" />
              <div className="text-[var(--text-muted)]">No containers owned</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FleetPage;
