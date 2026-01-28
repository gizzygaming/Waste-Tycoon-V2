import React, { useEffect } from 'react';
import { useGameStore, formatCurrency } from '../game/store/useGameStore';
import { FileText, Check, X, Clock, AlertTriangle, Truck } from 'lucide-react';

const CONTRACT_TYPE_INFO = {
  skip_hire: {
    label: 'Skip Hire',
    description: 'Deliver and collect skip containers',
    icon: '🗑️',
  },
  grab_collection: {
    label: 'Grab Collection',
    description: 'Collect loose waste with grab lorry',
    icon: '🏗️',
  },
  work_haulage: {
    label: 'Work Haulage',
    description: 'Transport materials between sites',
    icon: '🚛',
  },
};

export const ContractsPage = () => {
  const { game, generateContracts, acceptContract, cancelContract } = useGameStore();
  
  useEffect(() => {
    // Generate contracts if none exist
    if (game && Object.keys(game.contracts.byId).length === 0) {
      generateContracts();
    }
  }, [game, generateContracts]);
  
  if (!game?.ui?.hasUnlockedGame) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="contracts-locked">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-[var(--primary)]" />
          <div className="font-heading text-xl text-[var(--text-main)]">CONTRACTS LOCKED</div>
          <div className="text-[var(--text-muted)] mt-2">
            Purchase your first depot to unlock contracts.
          </div>
        </div>
      </div>
    );
  }
  
  const contracts = Object.values(game.contracts.byId);
  const availableContracts = contracts.filter(c => c.status === 'available');
  const activeContracts = contracts.filter(c => ['accepted', 'in_progress'].includes(c.status));
  const completedContracts = contracts.filter(c => c.status === 'completed');
  
  return (
    <div className="p-6" data-testid="contracts-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-black text-[var(--text-main)]">CONTRACTS</h1>
          <p className="text-[var(--text-muted)] mt-1">Accept and manage your work contracts</p>
        </div>
        <button 
          onClick={generateContracts}
          className="btn-secondary"
          data-testid="refresh-contracts"
        >
          Refresh Contracts
        </button>
      </div>
      
      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="p-4">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Available</div>
            <div className="font-mono text-2xl font-bold text-[var(--secondary)] mt-1">
              {availableContracts.length}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="p-4">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Active</div>
            <div className="font-mono text-2xl font-bold text-[var(--primary)] mt-1">
              {activeContracts.length}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="p-4">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Completed</div>
            <div className="font-mono text-2xl font-bold text-[var(--success)] mt-1">
              {completedContracts.length}
            </div>
          </div>
        </div>
      </div>
      
      {/* Active Contracts */}
      {activeContracts.length > 0 && (
        <div className="mb-8">
          <h2 className="font-heading text-xl font-bold text-[var(--text-main)] mb-4">
            ACTIVE CONTRACTS
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeContracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                onCancel={() => cancelContract(contract.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Available Contracts */}
      <div>
        <h2 className="font-heading text-xl font-bold text-[var(--text-main)] mb-4">
          AVAILABLE CONTRACTS
        </h2>
        {availableContracts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableContracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                onAccept={() => acceptContract(contract.id)}
              />
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="p-8 text-center">
              <FileText size={48} className="mx-auto mb-4 text-[var(--muted)]" />
              <div className="text-[var(--text-muted)]">No contracts available</div>
              <div className="text-xs text-[var(--muted)] mt-2">
                Check back later or refresh to generate new contracts
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ContractCard = ({ contract, onAccept, onCancel }) => {
  const typeInfo = CONTRACT_TYPE_INFO[contract.type] || {};
  const isActive = ['accepted', 'in_progress'].includes(contract.status);
  
  return (
    <div className="card" data-testid={`contract-${contract.id}`}>
      <div className="card-header flex justify-between items-center">
        <span className="badge badge-info">{typeInfo.label || contract.type}</span>
        <span className={`badge ${
          contract.status === 'available' ? 'bg-[var(--border)]' :
          contract.status === 'accepted' ? 'badge-warning' :
          contract.status === 'in_progress' ? 'badge-info' :
          contract.status === 'completed' ? 'badge-success' : 'badge-danger'
        }`}>
          {contract.status.replace(/_/g, ' ')}
        </span>
      </div>
      <div className="card-content">
        <h3 className="font-heading font-bold text-[var(--text-main)] mb-2" data-testid="contract-title">
          {contract.title}
        </h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          {contract.description || typeInfo.description}
        </p>
        
        {/* Requirements */}
        <div className="space-y-2 mb-4">
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Requirements</div>
          <div className="flex flex-wrap gap-2">
            <span className="badge bg-[var(--surface-highlight)] text-[var(--text-main)]">
              <Truck size={10} className="mr-1" /> Driver Required
            </span>
            {contract.requirements.requiresVehicleType && (
              <span className="badge bg-[var(--surface-highlight)] text-[var(--text-main)]">
                {contract.requirements.requiresVehicleType.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>
        
        {/* Payout */}
        <div className="flex justify-between items-center py-3 border-t border-[var(--border)]">
          <span className="text-xs text-[var(--text-muted)] uppercase">Payout</span>
          <span className="font-mono text-xl font-bold text-[var(--success)]">
            {formatCurrency(contract.payout)}
          </span>
        </div>
        
        {/* Penalty Info */}
        <div className="flex justify-between items-center text-xs text-[var(--text-muted)] mb-4">
          <span>Cancel Penalty: {formatCurrency(contract.penaltyOnCancel)}</span>
          <span>Rep Hit: -{contract.repHitOnFail}%</span>
        </div>
        
        {/* Actions */}
        {onAccept && contract.status === 'available' && (
          <button 
            onClick={onAccept}
            className="btn-primary w-full"
            data-testid="accept-contract"
          >
            <Check size={16} className="inline mr-2" />
            ACCEPT CONTRACT
          </button>
        )}
        
        {onCancel && isActive && (
          <button 
            onClick={onCancel}
            className="btn-danger w-full"
            data-testid="cancel-contract"
          >
            <X size={16} className="inline mr-2" />
            CANCEL
          </button>
        )}
      </div>
    </div>
  );
};

export default ContractsPage;
