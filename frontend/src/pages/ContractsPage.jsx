import React, { useEffect, useState } from 'react';
import { useGameStore, formatCurrency } from '../game/store/useGameStore';
import { FileText, Check, X, Clock, AlertTriangle, Truck, RefreshCw, DollarSign } from 'lucide-react';

const CONTRACT_TYPE_INFO = {
  skip_hire: { label: 'Skip Hire', color: 'var(--primary)', desc: 'Deliver and collect skip containers' },
  grab_collection: { label: 'Grab Collection', color: 'var(--secondary)', desc: 'Collect loose waste with grab lorry' },
  work_haulage: { label: 'Work Haulage', color: 'var(--accent)', desc: 'Transport materials between sites' },
};

export const ContractsPage = () => {
  const { game, generateContracts, acceptContract, cancelContract } = useGameStore();
  const [filter, setFilter] = useState('available');
  
  useEffect(() => {
    if (game?.ui?.hasUnlockedGame && Object.keys(game.contracts.byId).length === 0) {
      generateContracts(8);
    }
  }, [game, generateContracts]);
  
  if (!game?.ui?.hasUnlockedGame) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="contracts-locked">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-[var(--primary)]" />
          <div className="font-heading text-xl text-[var(--text-main)]">CONTRACTS LOCKED</div>
          <div className="text-[var(--text-muted)] mt-2">Purchase your first depot to unlock contracts.</div>
        </div>
      </div>
    );
  }
  
  const contracts = Object.values(game.contracts.byId);
  const availableContracts = contracts.filter(c => c.status === 'available');
  const activeContracts = contracts.filter(c => ['accepted', 'in_progress'].includes(c.status));
  const completedContracts = contracts.filter(c => c.status === 'completed');
  
  const filteredContracts = filter === 'available' ? availableContracts :
                           filter === 'active' ? activeContracts :
                           filter === 'completed' ? completedContracts : contracts;
  
  // Calculate earnings
  const totalEarnings = completedContracts.reduce((sum, c) => sum + c.payout, 0);
  const potentialEarnings = activeContracts.reduce((sum, c) => sum + c.payout, 0);
  
  return (
    <div className="p-6" data-testid="contracts-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-black text-[var(--text-main)]">CONTRACTS</h1>
          <p className="text-[var(--text-muted)] mt-1">Accept jobs and earn money</p>
        </div>
        <button 
          onClick={() => generateContracts(5)}
          className="btn-secondary flex items-center gap-2"
          data-testid="refresh-contracts"
        >
          <RefreshCw size={16} />
          GET NEW CONTRACTS
        </button>
      </div>
      
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="p-4">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Available</div>
            <div className="font-mono text-3xl font-bold text-[var(--secondary)] mt-1">
              {availableContracts.length}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="p-4">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Active</div>
            <div className="font-mono text-3xl font-bold text-[var(--primary)] mt-1">
              {activeContracts.length}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="p-4">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Pending Payment</div>
            <div className="font-mono text-2xl font-bold text-[var(--accent)] mt-1">
              {formatCurrency(potentialEarnings)}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="p-4">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Total Earned</div>
            <div className="font-mono text-2xl font-bold text-[var(--success)] mt-1">
              {formatCurrency(totalEarnings)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 bg-[var(--surface)] p-1">
        {[
          { id: 'available', label: 'Available', count: availableContracts.length },
          { id: 'active', label: 'Active', count: activeContracts.length },
          { id: 'completed', label: 'Completed', count: completedContracts.length },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex-1 py-2 px-4 font-bold uppercase text-sm transition-colors ${
              filter === f.id 
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-highlight)]'
            }`}
            data-testid={`filter-${f.id}`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>
      
      {/* Contracts Grid */}
      {filteredContracts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              onAccept={() => acceptContract(contract.id)}
              onCancel={() => cancelContract(contract.id)}
            />
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="p-12 text-center">
            <FileText size={48} className="mx-auto mb-4 text-[var(--muted)]" />
            <div className="text-[var(--text-muted)]">No {filter} contracts</div>
            {filter === 'available' && (
              <button 
                onClick={() => generateContracts(5)}
                className="btn-primary mt-4"
              >
                Generate New Contracts
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ContractCard = ({ contract, onAccept, onCancel }) => {
  const typeInfo = CONTRACT_TYPE_INFO[contract.type] || {};
  const isActive = ['accepted', 'in_progress'].includes(contract.status);
  const isCompleted = contract.status === 'completed';
  
  return (
    <div className={`card ${isCompleted ? 'opacity-70' : ''}`} data-testid={`contract-${contract.id}`}>
      <div className="card-header flex justify-between items-center" style={{ borderLeftWidth: '4px', borderLeftColor: typeInfo.color }}>
        <span className="badge" style={{ background: typeInfo.color, color: '#000' }}>
          {typeInfo.label || contract.type}
        </span>
        <span className={`badge ${
          contract.status === 'available' ? 'bg-[var(--border)]' :
          contract.status === 'accepted' ? 'badge-warning' :
          contract.status === 'in_progress' ? 'badge-info' :
          contract.status === 'completed' ? 'badge-success' : 'badge-danger'
        }`}>
          {contract.status === 'in_progress' ? 'IN PROGRESS' : contract.status.toUpperCase()}
        </span>
      </div>
      <div className="card-content">
        <h3 className="font-heading font-bold text-[var(--text-main)] mb-2" data-testid="contract-title">
          {contract.title}
        </h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          {contract.description || typeInfo.desc}
        </p>
        
        {/* Requirements */}
        <div className="space-y-2 mb-4">
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Requirements</div>
          <div className="flex flex-wrap gap-2">
            <span className="badge bg-[var(--surface-highlight)] text-[var(--text-main)]">
              <Truck size={10} className="mr-1" /> Driver
            </span>
            {contract.requirements.requiresVehicleType && (
              <span className="badge bg-[var(--surface-highlight)] text-[var(--text-main)]">
                {contract.requirements.requiresVehicleType.replace(/_/g, ' ')}
              </span>
            )}
            {contract.tonnes && (
              <span className="badge bg-[var(--surface-highlight)] text-[var(--text-main)]">
                {contract.tonnes}t
              </span>
            )}
          </div>
        </div>
        
        {/* Payout */}
        <div className="flex justify-between items-center py-3 border-t border-[var(--border)]">
          <span className="text-xs text-[var(--text-muted)] uppercase flex items-center gap-1">
            <DollarSign size={12} /> Payout
          </span>
          <span className="font-mono text-2xl font-bold text-[var(--success)]">
            {formatCurrency(contract.payout)}
          </span>
        </div>
        
        {/* Penalty Info */}
        {!isCompleted && (
          <div className="flex justify-between items-center text-xs text-[var(--text-muted)] mb-4">
            <span>Cancel Penalty: {formatCurrency(contract.penaltyOnCancel)}</span>
            <span>Rep Hit: -{contract.repHitOnFail}%</span>
          </div>
        )}
        
        {/* Actions */}
        {contract.status === 'available' && (
          <button 
            onClick={onAccept}
            className="btn-primary w-full"
            data-testid="accept-contract"
          >
            <Check size={16} className="inline mr-2" />
            ACCEPT CONTRACT
          </button>
        )}
        
        {contract.status === 'accepted' && (
          <div className="space-y-2">
            <div className="text-xs text-center text-[var(--text-muted)] py-2 bg-[var(--background)]">
              Go to Dispatch to assign a driver & vehicle
            </div>
            <button 
              onClick={onCancel}
              className="btn-danger w-full"
              data-testid="cancel-contract"
            >
              <X size={16} className="inline mr-2" />
              CANCEL
            </button>
          </div>
        )}
        
        {contract.status === 'in_progress' && (
          <div className="flex items-center justify-center gap-2 py-3 bg-[var(--secondary)]/10 text-[var(--secondary)]">
            <Clock size={16} className="animate-pulse" />
            <span className="font-bold text-sm">JOB IN PROGRESS</span>
          </div>
        )}
        
        {isCompleted && (
          <div className="flex items-center justify-center gap-2 py-3 bg-[var(--success)]/10 text-[var(--success)]">
            <Check size={16} />
            <span className="font-bold text-sm">COMPLETED</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractsPage;
