import React, { useState, useMemo, useEffect } from 'react';
import { useGameStore, formatCurrency, STAFF_CONFIG } from '../game/store/useGameStore';
import { Building, Users, AlertTriangle, Edit2, Check, X, UserPlus, DollarSign, Shield, Warehouse } from 'lucide-react';

const STAFF_ROLES = Object.entries(STAFF_CONFIG).map(([id, config]) => ({
  id,
  label: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  hireCost: config.hireCost,
  monthlyWage: config.monthlyWage,
}));

export const FacilitiesPage = () => {
  const { game, renameFacility, hireStaff, fireStaff } = useGameStore();
  const [selectedFacilityId, setSelectedFacilityId] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [showHireMenu, setShowHireMenu] = useState(false);
  const [fireConfirm, setFireConfirm] = useState(null);
  
  const hasUnlocked = game?.ui?.hasUnlockedGame;
  const facilities = useMemo(() => 
    hasUnlocked ? Object.values(game.facilities.facilities) : [],
    [hasUnlocked, game?.facilities?.facilities]
  );
  
  // Get first facility ID for initial selection
  const firstFacilityId = facilities.length > 0 ? facilities[0].id : null;
  
  // Use first facility if none selected
  const activeFacilityId = selectedFacilityId || firstFacilityId;
  
  if (!hasUnlocked) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="facilities-locked">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-[var(--primary)]" />
          <div className="font-heading text-xl text-[var(--text-main)]">FACILITIES LOCKED</div>
          <div className="text-[var(--text-muted)] mt-2">Purchase your first depot to unlock facilities.</div>
        </div>
      </div>
    );
  }
  
  const selectedFacility = activeFacilityId ? game.facilities.facilities[activeFacilityId] : null;
  const facilityStaff = selectedFacility 
    ? Object.values(game.staff.staff).filter(s => s.facilityId === selectedFacility.id)
    : [];
  
  // Calculate totals
  const totalOverhead = facilities.reduce((sum, f) => sum + f.overheadPerWeek * 4, 0);
  const totalWages = Object.values(game.staff.staff).reduce((sum, s) => {
    const config = STAFF_CONFIG[s.role];
    return sum + (config?.monthlyWage || 0);
  }, 0);
  const officeCount = facilities.filter(f => f.type === 'office').length;
  const officePoints = officeCount * 10;
  
  const handleStartRename = () => {
    if (selectedFacility) {
      setNewName(selectedFacility.name);
      setEditingName(true);
    }
  };
  
  const handleSaveRename = () => {
    if (selectedFacility && newName.trim()) {
      renameFacility(selectedFacility.id, newName.trim());
      setEditingName(false);
    }
  };
  
  const handleHire = (roleId) => {
    if (selectedFacility) {
      hireStaff(selectedFacility.id, roleId);
      setShowHireMenu(false);
    }
  };
  
  const handleFire = (staffId) => {
    fireStaff(staffId);
    setFireConfirm(null);
  };
  
  return (
    <div className="p-3 lg:p-6" data-testid="facilities-page">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 lg:mb-6">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-black text-[var(--text-main)]">FACILITIES</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage your depots, yards, and staff</p>
        </div>
        
        <div className="flex gap-2 lg:gap-4">
          {/* Office Points */}
          <div className="card bg-[var(--secondary)]/10 border-[var(--secondary)]">
            <div className="p-2 lg:p-3 flex items-center gap-2 lg:gap-3">
              <Building size={18} className="text-[var(--secondary)] hidden sm:block" />
              <div>
                <div className="text-[8px] lg:text-[10px] text-[var(--text-muted)] uppercase">Office Pts</div>
                <div className="font-mono text-lg lg:text-xl font-bold text-[var(--secondary)]">{officePoints}</div>
              </div>
            </div>
          </div>
          
          {/* Monthly Costs */}
          <div className="card">
            <div className="p-2 lg:p-3">
              <div className="text-[8px] lg:text-[10px] text-[var(--text-muted)] uppercase">Monthly</div>
              <div className="font-mono text-lg lg:text-xl font-bold text-[var(--danger)]">
                {formatCurrency(totalOverhead + totalWages)}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Facilities List */}
        <div>
          <h2 className="font-heading text-base lg:text-lg font-bold text-[var(--text-main)] mb-3 lg:mb-4">YOUR FACILITIES ({facilities.length})</h2>
          <div className="space-y-2 max-h-[250px] lg:max-h-[calc(100vh-280px)] overflow-auto">
            {facilities.map((facility) => {
              const staffCount = Object.values(game.staff.staff).filter(s => s.facilityId === facility.id).length;
              
              return (
                <button
                  key={facility.id}
                  onClick={() => setSelectedFacilityId(facility.id)}
                  className={`w-full text-left p-3 lg:p-4 border transition-colors ${
                    activeFacilityId === facility.id
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--border)] hover:border-[var(--muted)] bg-[var(--surface)]'
                  }`}
                  data-testid={`facility-${facility.id}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-[var(--text-main)] text-sm">{facility.name}</span>
                    <span className="badge badge-info text-[10px]">{facility.size}</span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mb-2 capitalize">
                    {facility.type.replace(/_/g, ' ')}
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted)]">Staff: {staffCount}</span>
                    <span className={`${facility.compliance > 70 ? 'text-[var(--success)]' : facility.compliance > 40 ? 'text-[var(--accent)]' : 'text-[var(--danger)]'}`}>
                      {facility.compliance}% compliant
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Facility Details */}
        <div className="lg:col-span-2">
          {selectedFacility ? (
            <div className="card">
              {/* Header */}
              <div className="card-header flex justify-between items-center">
                {editingName ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="flex-1 bg-[var(--background)] px-3 py-2"
                      autoFocus
                      data-testid="rename-input"
                    />
                    <button onClick={handleSaveRename} className="p-2 text-[var(--success)] hover:bg-[var(--success)]/10" data-testid="save-rename">
                      <Check size={18} />
                    </button>
                    <button onClick={() => setEditingName(false)} className="p-2 text-[var(--danger)] hover:bg-[var(--danger)]/10">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="font-heading text-xl font-bold text-[var(--text-main)]" data-testid="facility-name">
                      {selectedFacility.name}
                    </h2>
                    <button onClick={handleStartRename} className="p-2 text-[var(--muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-highlight)]" data-testid="rename-button">
                      <Edit2 size={16} />
                    </button>
                  </>
                )}
              </div>
              
              <div className="card-content">
                {/* Info Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-4 lg:mb-6">
                  <div className="bg-[var(--background)] p-2 lg:p-3">
                    <div className="text-[8px] lg:text-[10px] text-[var(--text-muted)] uppercase mb-1">Type</div>
                    <div className="font-bold text-[var(--text-main)] text-xs lg:text-sm capitalize">
                      {selectedFacility.type.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div className="bg-[var(--background)] p-2 lg:p-3">
                    <div className="text-[8px] lg:text-[10px] text-[var(--text-muted)] uppercase mb-1">Size</div>
                    <div className="font-bold text-[var(--text-main)] text-xs lg:text-sm capitalize">
                      {selectedFacility.size}
                    </div>
                  </div>
                  <div className="bg-[var(--background)] p-2 lg:p-3">
                    <div className="text-[8px] lg:text-[10px] text-[var(--text-muted)] uppercase mb-1">Weekly</div>
                    <div className="font-mono font-bold text-[var(--accent)] text-xs lg:text-sm">
                      {formatCurrency(selectedFacility.overheadPerWeek)}
                    </div>
                  </div>
                  <div className="bg-[var(--background)] p-2 lg:p-3">
                    <div className="text-[8px] lg:text-[10px] text-[var(--text-muted)] uppercase mb-1">Price</div>
                    <div className="font-mono font-bold text-[var(--text-main)] text-xs lg:text-sm">
                      {formatCurrency(selectedFacility.purchasePrice)}
                    </div>
                  </div>
                </div>
                
                {/* Compliance & Capacity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
                  {/* Compliance */}
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1">
                        <Shield size={12} /> Compliance
                      </span>
                      <span className="font-mono text-[var(--text-main)]">{selectedFacility.compliance}%</span>
                    </div>
                    <div className="progress-bar h-3">
                      <div 
                        className={`progress-bar-fill ${
                          selectedFacility.compliance > 70 ? 'high' : 
                          selectedFacility.compliance > 40 ? 'medium' : 'low'
                        }`}
                        style={{ width: `${selectedFacility.compliance}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Capacity */}
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1">
                        <Warehouse size={12} /> Capacity ({selectedFacility.capacityKind})
                      </span>
                      <span className="font-mono text-[var(--text-main)]">
                        {selectedFacility.capacityKind === 'units' 
                          ? selectedFacility.storageUnitsUsed 
                          : selectedFacility.tonnesStored.toFixed(0)}
                        /{selectedFacility.capacityMax}
                      </span>
                    </div>
                    <div className="progress-bar h-3">
                      <div 
                        className="progress-bar-fill"
                        style={{ 
                          width: `${((selectedFacility.capacityKind === 'units' 
                            ? selectedFacility.storageUnitsUsed 
                            : selectedFacility.tonnesStored) / selectedFacility.capacityMax) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Staff Section */}
                <div className="border-t border-[var(--border)] pt-3 lg:pt-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 lg:mb-4">
                    <h3 className="font-heading font-bold text-[var(--text-main)] flex items-center gap-2 text-sm lg:text-base">
                      <Users size={16} />
                      STAFF ({facilityStaff.length})
                    </h3>
                    <button
                      onClick={() => setShowHireMenu(!showHireMenu)}
                      className="btn-primary py-1.5 lg:py-2 px-3 lg:px-4 text-xs lg:text-sm"
                      data-testid="hire-staff-button"
                    >
                      <UserPlus size={12} className="inline mr-1 lg:mr-2" />
                      HIRE STAFF
                    </button>
                  </div>
                  
                  {/* Hire Menu */}
                  {showHireMenu && (
                    <div className="bg-[var(--background)] p-3 lg:p-4 mb-3 lg:mb-4 animate-fade-in border border-[var(--border)]">
                      <div className="text-xs text-[var(--text-muted)] uppercase mb-2 lg:mb-3">Select Role to Hire</div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        {STAFF_ROLES.map((role) => (
                          <button
                            key={role.id}
                            onClick={() => handleHire(role.id)}
                            disabled={game.company.cash < role.hireCost}
                            className={`p-3 border text-left transition-colors ${
                              game.company.cash >= role.hireCost
                                ? 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5'
                                : 'border-[var(--border)] opacity-50 cursor-not-allowed'
                            }`}
                            data-testid={`hire-${role.id}`}
                          >
                            <div className="font-bold text-sm text-[var(--text-main)]">{role.label}</div>
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-[var(--primary)]">{formatCurrency(role.hireCost)}</span>
                              <span className="text-[var(--text-muted)]">{formatCurrency(role.monthlyWage)}/mo</span>
                            </div>
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => setShowHireMenu(false)}
                        className="w-full mt-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-highlight)]"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  
                  {/* Staff List */}
                  {facilityStaff.length > 0 ? (
                    <div className="space-y-2">
                      {facilityStaff.map((staff) => {
                        const config = STAFF_CONFIG[staff.role];
                        return (
                          <div 
                            key={staff.id} 
                            className="flex items-center justify-between bg-[var(--background)] p-3"
                            data-testid={`staff-${staff.id}`}
                          >
                            <div className="flex items-center gap-3">
                              <Users size={18} className="text-[var(--muted)]" />
                              <div>
                                <div className="font-bold text-[var(--text-main)]">{staff.name}</div>
                                <div className="text-xs text-[var(--text-muted)] capitalize">{staff.role.replace(/_/g, ' ')}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="font-mono text-xs text-[var(--text-muted)]">Wage</div>
                                <div className="font-mono text-sm text-[var(--accent)]">{formatCurrency(config?.monthlyWage || 0)}/mo</div>
                              </div>
                              {fireConfirm === staff.id ? (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleFire(staff.id)}
                                    className="px-2 py-1 bg-[var(--danger)] text-white text-xs font-bold"
                                  >
                                    CONFIRM
                                  </button>
                                  <button
                                    onClick={() => setFireConfirm(null)}
                                    className="px-2 py-1 bg-[var(--border)] text-[var(--text-muted)] text-xs"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setFireConfirm(staff.id)}
                                  className="p-2 text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors"
                                  data-testid={`fire-${staff.id}`}
                                >
                                  <X size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-[var(--text-muted)] py-8 bg-[var(--background)]">
                      <Users size={32} className="mx-auto mb-2 text-[var(--muted)]" />
                      No staff assigned to this facility
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="p-12 text-center">
                <Building size={48} className="mx-auto mb-4 text-[var(--muted)]" />
                <div className="text-[var(--text-muted)]">Select a facility to view details</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacilitiesPage;
