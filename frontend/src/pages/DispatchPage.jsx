import React, { useState } from 'react';
import { useGameStore, formatCurrency } from '../game/store/useGameStore';
import { Truck, User, Clock, AlertTriangle, Play, CheckCircle } from 'lucide-react';

export const DispatchPage = () => {
  const { game, createDispatchJob } = useGameStore();
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [error, setError] = useState(null);
  
  if (!game?.ui?.hasUnlockedGame) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="dispatch-locked">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-[var(--primary)]" />
          <div className="font-heading text-xl text-[var(--text-main)]">DISPATCH LOCKED</div>
          <div className="text-[var(--text-muted)] mt-2">
            Purchase your first depot to unlock dispatch.
          </div>
        </div>
      </div>
    );
  }
  
  const acceptedContracts = Object.values(game.contracts.byId).filter(c => c.status === 'accepted');
  const drivers = Object.values(game.staff.staff).filter(s => s.role === 'driver');
  const vehicles = Object.values(game.assets.physical).filter(a => a.kind === 'vehicle');
  const activeJobs = Object.values(game.dispatch.activeJobs);
  const completedJobs = Object.values(game.dispatch.completedJobs).slice(-10);
  
  const handleDispatch = () => {
    if (!selectedContract || !selectedDriver || !selectedVehicle) {
      setError('Please select a contract, driver, and vehicle');
      return;
    }
    
    const result = createDispatchJob(selectedContract.id, selectedDriver.id, selectedVehicle.id);
    
    if (result.success) {
      setSelectedContract(null);
      setSelectedDriver(null);
      setSelectedVehicle(null);
      setError(null);
    } else {
      setError(result.error);
    }
  };
  
  return (
    <div className="p-6" data-testid="dispatch-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-black text-[var(--text-main)]">DISPATCH</h1>
        <p className="text-[var(--text-muted)] mt-1">Create and manage dispatch jobs</p>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Create Job */}
        <div className="col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="font-heading font-bold text-[var(--text-main)]">CREATE NEW JOB</h2>
            </div>
            <div className="card-content space-y-6">
              {/* Contract Selection */}
              <div>
                <label className="block text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                  Select Contract
                </label>
                {acceptedContracts.length > 0 ? (
                  <div className="grid gap-2">
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
                        <div className="text-xs text-[var(--text-muted)] mt-1">{contract.type.replace(/_/g, ' ')}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-[var(--text-muted)] p-4 bg-[var(--background)] text-center">
                    No accepted contracts. Accept contracts first.
                  </div>
                )}
              </div>
              
              {/* Driver Selection */}
              <div>
                <label className="block text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                  Select Driver
                </label>
                {drivers.length > 0 ? (
                  <div className="grid gap-2">
                    {drivers.map((driver) => (
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
                ) : (
                  <div className="text-[var(--text-muted)] p-4 bg-[var(--background)] text-center">
                    No drivers available. Hire drivers in Facilities.
                  </div>
                )}
              </div>
              
              {/* Vehicle Selection */}
              <div>
                <label className="block text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                  Select Vehicle
                </label>
                {vehicles.length > 0 ? (
                  <div className="grid gap-2">
                    {vehicles.map((vehicle) => {
                      const isLowCondition = vehicle.condition < 10;
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
                            <div className="font-bold text-[var(--text-main)]">{vehicle.plate}</div>
                            <div className="text-xs text-[var(--text-muted)]">{vehicle.defId.replace(/_/g, ' ')}</div>
                          </div>
                          <div className="text-right">
                            <div className={`font-mono text-sm ${
                              vehicle.condition > 50 ? 'text-[var(--success)]' :
                              vehicle.condition > 20 ? 'text-[var(--accent)]' : 'text-[var(--danger)]'
                            }`}>
                              {vehicle.condition}%
                            </div>
                            {isLowCondition && (
                              <div className="text-[10px] text-[var(--danger)]">NEEDS REPAIR</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-[var(--text-muted)] p-4 bg-[var(--background)] text-center">
                    No vehicles available. Buy vehicles in Shop.
                  </div>
                )}
              </div>
              
              {/* Error */}
              {error && (
                <div className="bg-[var(--danger)]/10 border border-[var(--danger)] p-3 text-[var(--danger)] text-sm">
                  {error}
                </div>
              )}
              
              {/* Dispatch Button */}
              <button
                onClick={handleDispatch}
                disabled={!selectedContract || !selectedDriver || !selectedVehicle}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="dispatch-button"
              >
                <Play size={16} className="inline mr-2" />
                DISPATCH JOB
              </button>
            </div>
          </div>
        </div>
        
        {/* Right: Active Jobs */}
        <div>
          <div className="card mb-6">
            <div className="card-header">
              <h2 className="font-heading font-bold text-[var(--text-main)]">ACTIVE JOBS</h2>
            </div>
            <div className="card-content">
              {activeJobs.length > 0 ? (
                <div className="space-y-3">
                  {activeJobs.map((job) => {
                    const contract = game.contracts.byId[job.contractId];
                    const progress = Math.min(100, ((game.world.totalGameSeconds - job.startedAtGameSeconds) / 
                      (job.completesAtGameSeconds - job.startedAtGameSeconds)) * 100);
                    
                    return (
                      <div key={job.id} className="bg-[var(--background)] p-3" data-testid={`active-job-${job.id}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-[var(--text-main)] text-sm">{contract?.title || 'Job'}</span>
                          <span className="badge badge-info">{job.status.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="progress-bar mb-2">
                          <div 
                            className="progress-bar-fill" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-[var(--text-muted)]">
                          <span>{job.distanceKm} km</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-[var(--text-muted)] py-4">
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
                      <div key={job.id} className="flex items-center gap-2 text-sm">
                        <CheckCircle size={14} className="text-[var(--success)]" />
                        <span className="text-[var(--text-muted)] flex-1 truncate">{contract?.title || 'Job'}</span>
                        <span className="font-mono text-[var(--success)]">{formatCurrency(contract?.payout || 0)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-[var(--text-muted)] py-4">
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

export default DispatchPage;
