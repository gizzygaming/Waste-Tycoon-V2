import React, { useState } from 'react';
import { useGameStore, formatCurrency, ASSET_DEFS } from '../game/store/useGameStore';
import { Truck, User, Clock, AlertTriangle, Play, CheckCircle, X, Package } from 'lucide-react';

export const DispatchPage = () => {
  const { game, createDispatchJob } = useGameStore();
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [error, setError] = useState(null);
  
  if (!game?.ui?.hasUnlockedGame) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="dispatch-locked">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-[var(--primary)]" />
          <div className="font-heading text-xl text-[var(--text-main)]">DISPATCH LOCKED</div>
          <div className="text-[var(--text-muted)] mt-2">Purchase your first depot to unlock dispatch.</div>
        </div>
      </div>
    );
  }
  
  const acceptedContracts = Object.values(game.contracts.byId).filter(c => c.status === 'accepted');
  const drivers = Object.values(game.staff.staff).filter(s => s.role === 'driver');
  const vehicles = Object.values(game.assets.physical).filter(a => a.kind === 'vehicle');
  const containers = Object.values(game.assets.physical).filter(a => a.kind === 'container');
  const activeJobs = Object.values(game.dispatch.activeJobs);
  const completedJobs = Object.values(game.dispatch.completedJobs).slice(-10).reverse();
  
  // Check what's already dispatched
  const dispatchedDriverIds = new Set(activeJobs.map(j => j.driverId));
  const dispatchedVehicleIds = new Set(activeJobs.map(j => j.vehicleAssetId));
  const dispatchedContainerIds = new Set(activeJobs.filter(j => j.containerAssetId).map(j => j.containerAssetId));
  
  const availableDrivers = drivers.filter(d => !dispatchedDriverIds.has(d.id));
  const availableVehicles = vehicles.filter(v => !dispatchedVehicleIds.has(v.id) && !v.inRepair);
  const availableContainers = containers.filter(c => !dispatchedContainerIds.has(c.id));
  
  const handleDispatch = () => {
    setError(null);
    
    if (!selectedContract) {
      setError('Select a contract first');
      return;
    }
    if (!selectedDriver) {
      setError('Select a driver');
      return;
    }
    if (!selectedVehicle) {
      setError('Select a vehicle');
      return;
    }
    
    const result = createDispatchJob(
      selectedContract.id, 
      selectedDriver.id, 
      selectedVehicle.id,
      null,
      selectedContainer?.id
    );
    
    if (result.success) {
      setSelectedContract(null);
      setSelectedDriver(null);
      setSelectedVehicle(null);
      setSelectedContainer(null);
    } else {
      setError(result.error);
    }
  };
  
  const clearSelections = () => {
    setSelectedContract(null);
    setSelectedDriver(null);
    setSelectedVehicle(null);
    setSelectedContainer(null);
    setError(null);
  };
  
  return (
    <div className="p-6" data-testid="dispatch-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-black text-[var(--text-main)]">DISPATCH</h1>
        <p className="text-[var(--text-muted)] mt-1">Assign drivers and vehicles to contracts</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="p-4">
            <div className="text-xs text-[var(--text-muted)] uppercase">Contracts Ready</div>
            <div className="font-mono text-2xl font-bold text-[var(--primary)]">{acceptedContracts.length}</div>
          </div>
        </div>
        <div className="card">
          <div className="p-4">
            <div className="text-xs text-[var(--text-muted)] uppercase">Drivers Available</div>
            <div className="font-mono text-2xl font-bold text-[var(--secondary)]">{availableDrivers.length}/{drivers.length}</div>
          </div>
        </div>
        <div className="card">
          <div className="p-4">
            <div className="text-xs text-[var(--text-muted)] uppercase">Vehicles Ready</div>
            <div className="font-mono text-2xl font-bold text-[var(--accent)]">{availableVehicles.length}/{vehicles.length}</div>
          </div>
        </div>
        <div className="card">
          <div className="p-4">
            <div className="text-xs text-[var(--text-muted)] uppercase">Jobs Active</div>
            <div className="font-mono text-2xl font-bold text-[var(--success)]">{activeJobs.length}</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Create Job */}
        <div className="col-span-2">
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <h2 className="font-heading font-bold text-[var(--text-main)]">CREATE DISPATCH JOB</h2>
              {(selectedContract || selectedDriver || selectedVehicle) && (
                <button onClick={clearSelections} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)]">
                  Clear All
                </button>
              )}
            </div>
            <div className="card-content space-y-6">
              {/* Contract Selection */}
              <div>
                <label className="block text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                  1. Select Contract
                </label>
                {acceptedContracts.length > 0 ? (
                  <div className="grid gap-2 max-h-48 overflow-auto">
                    {acceptedContracts.map((contract) => (
                      <button
                        key={contract.id}
                        onClick={() => setSelectedContract(contract)}
                        className={`text-left p-3 border transition-colors ${
                          selectedContract?.id === contract.id
                            ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                            : 'border-[var(--border)] hover:border-[var(--muted)]'
                        }`}
                        data-testid={`select-contract-${contract.id}`}
                      >
                        <div className="flex justify-between">
                          <span className="font-bold text-[var(--text-main)]">{contract.title}</span>
                          <span className="font-mono text-[var(--success)]">{formatCurrency(contract.payout)}</span>
                        </div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">
                          {contract.type.replace(/_/g, ' ')} • {contract.requirements.requiresVehicleType?.replace(/_/g, ' ') || 'Any vehicle'}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-[var(--text-muted)] p-4 bg-[var(--background)] text-center">
                    <FileText size={24} className="mx-auto mb-2 text-[var(--muted)]" />
                    No accepted contracts. Accept contracts first.
                  </div>
                )}
              </div>
              
              {/* Driver Selection */}
              <div>
                <label className="block text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                  2. Select Driver {drivers.length === 0 && <span className="text-[var(--danger)]">(Hire in Facilities)</span>}
                </label>
                {availableDrivers.length > 0 ? (
                  <div className="grid gap-2 md:grid-cols-2">
                    {availableDrivers.map((driver) => (
                      <button
                        key={driver.id}
                        onClick={() => setSelectedDriver(driver)}
                        className={`text-left p-3 border transition-colors flex items-center gap-3 ${
                          selectedDriver?.id === driver.id
                            ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                            : 'border-[var(--border)] hover:border-[var(--muted)]'
                        }`}
                        data-testid={`select-driver-${driver.id}`}
                      >
                        <User size={20} className="text-[var(--muted)]" />
                        <div>
                          <div className="font-bold text-[var(--text-main)]">{driver.name}</div>
                          <div className="text-xs text-[var(--text-muted)]">Driver</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : drivers.length > 0 ? (
                  <div className="text-[var(--accent)] p-4 bg-[var(--accent)]/10 text-center text-sm">
                    All drivers are currently on jobs
                  </div>
                ) : (
                  <div className="text-[var(--text-muted)] p-4 bg-[var(--background)] text-center">
                    <User size={24} className="mx-auto mb-2 text-[var(--muted)]" />
                    No drivers. Hire drivers in Facilities.
                  </div>
                )}
              </div>
              
              {/* Vehicle Selection */}
              <div>
                <label className="block text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                  3. Select Vehicle {vehicles.length === 0 && <span className="text-[var(--danger)]">(Buy in Shop)</span>}
                </label>
                {availableVehicles.length > 0 ? (
                  <div className="grid gap-2 md:grid-cols-2">
                    {availableVehicles.map((vehicle) => {
                      const isLowCondition = vehicle.condition < 10;
                      const def = ASSET_DEFS[vehicle.defId];
                      return (
                        <button
                          key={vehicle.id}
                          onClick={() => !isLowCondition && setSelectedVehicle(vehicle)}
                          disabled={isLowCondition}
                          className={`text-left p-3 border transition-colors flex items-center gap-3 ${
                            isLowCondition
                              ? 'border-[var(--danger)] opacity-50 cursor-not-allowed'
                              : selectedVehicle?.id === vehicle.id
                                ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                                : 'border-[var(--border)] hover:border-[var(--muted)]'
                          }`}
                          data-testid={`select-vehicle-${vehicle.id}`}
                        >
                          <Truck size={20} className="text-[var(--muted)]" />
                          <div className="flex-1">
                            <div className="font-mono font-bold text-[var(--text-main)]">{vehicle.plate}</div>
                            <div className="text-xs text-[var(--text-muted)]">{def?.name || vehicle.defId}</div>
                          </div>
                          <div className="text-right">
                            <div className={`font-mono text-sm ${
                              vehicle.condition > 50 ? 'text-[var(--success)]' :
                              vehicle.condition > 20 ? 'text-[var(--accent)]' : 'text-[var(--danger)]'
                            }`}>
                              {vehicle.condition}%
                            </div>
                            {isLowCondition && (
                              <div className="text-[10px] text-[var(--danger)]">REPAIR NEEDED</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : vehicles.length > 0 ? (
                  <div className="text-[var(--accent)] p-4 bg-[var(--accent)]/10 text-center text-sm">
                    All vehicles are on jobs or in repair
                  </div>
                ) : (
                  <div className="text-[var(--text-muted)] p-4 bg-[var(--background)] text-center">
                    <Truck size={24} className="mx-auto mb-2 text-[var(--muted)]" />
                    No vehicles. Buy vehicles in Shop.
                  </div>
                )}
              </div>
              
              {/* Container Selection (optional for skip jobs) */}
              {selectedContract?.requirements.requiresContainerType && availableContainers.length > 0 && (
                <div>
                  <label className="block text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                    4. Select Container (Optional)
                  </label>
                  <div className="grid gap-2 md:grid-cols-3">
                    {availableContainers.filter(c => c.defId.includes('skip')).map((container) => {
                      const def = ASSET_DEFS[container.defId];
                      return (
                        <button
                          key={container.id}
                          onClick={() => setSelectedContainer(selectedContainer?.id === container.id ? null : container)}
                          className={`text-left p-2 border transition-colors ${
                            selectedContainer?.id === container.id
                              ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                              : 'border-[var(--border)] hover:border-[var(--muted)]'
                          }`}
                        >
                          <Package size={16} className="text-[var(--muted)] mb-1" />
                          <div className="text-xs font-bold text-[var(--text-main)]">{def?.name || container.defId}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Error */}
              {error && (
                <div className="bg-[var(--danger)]/10 border border-[var(--danger)] p-3 text-[var(--danger)] text-sm flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}
              
              {/* Dispatch Button */}
              <button
                onClick={handleDispatch}
                disabled={!selectedContract || !selectedDriver || !selectedVehicle}
                className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="dispatch-button"
              >
                <Play size={20} className="inline mr-2" />
                DISPATCH JOB
              </button>
            </div>
          </div>
        </div>
        
        {/* Right: Jobs Status */}
        <div className="space-y-6">
          {/* Active Jobs */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-heading font-bold text-[var(--text-main)]">ACTIVE JOBS ({activeJobs.length})</h2>
            </div>
            <div className="card-content">
              {activeJobs.length > 0 ? (
                <div className="space-y-3">
                  {activeJobs.map((job) => {
                    const contract = game.contracts.byId[job.contractId];
                    const driver = game.staff.staff[job.driverId];
                    const elapsed = game.world.totalGameSeconds - job.startedAtGameSeconds;
                    const total = job.completesAtGameSeconds - job.startedAtGameSeconds;
                    const progress = Math.min(100, (elapsed / total) * 100);
                    
                    return (
                      <div key={job.id} className="bg-[var(--background)] p-3" data-testid={`active-job-${job.id}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-[var(--text-main)] text-sm truncate">{contract?.title || 'Job'}</span>
                          <span className="font-mono text-xs text-[var(--success)]">{formatCurrency(contract?.payout || 0)}</span>
                        </div>
                        <div className="text-xs text-[var(--text-muted)] mb-2">
                          {driver?.name} • {job.distanceKm}km
                        </div>
                        <div className="progress-bar mb-1">
                          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-[var(--text-muted)]">
                          <span>{job.status.replace(/_/g, ' ')}</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-[var(--text-muted)] py-6">
                  <Clock size={32} className="mx-auto mb-2 text-[var(--muted)]" />
                  No active jobs
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Completed */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-heading font-bold text-[var(--text-main)]">RECENT COMPLETED</h2>
            </div>
            <div className="card-content">
              {completedJobs.length > 0 ? (
                <div className="space-y-2">
                  {completedJobs.map((job) => {
                    const contract = game.contracts.byId[job.contractId];
                    return (
                      <div key={job.id} className="flex items-center gap-2 text-sm py-1">
                        <CheckCircle size={14} className="text-[var(--success)]" />
                        <span className="text-[var(--text-muted)] flex-1 truncate">{contract?.title || 'Job'}</span>
                        <span className="font-mono text-[var(--success)]">{formatCurrency(contract?.payout || 0)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-[var(--text-muted)] py-4 text-sm">
                  No completed jobs yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FileText = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

export default DispatchPage;
