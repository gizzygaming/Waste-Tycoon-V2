import React, { useState } from 'react';
import { useGameStore, formatCurrency } from '../game/store/useGameStore';
import { Building, Users, AlertTriangle, Edit2, Check, X, UserPlus } from 'lucide-react';

const STAFF_ROLES = [
  { id: 'driver', label: 'Driver', cost: 2000 },
  { id: 'site_manager', label: 'Site Manager', cost: 3500 },
  { id: 'transport_manager', label: 'Transport Manager', cost: 4000 },
  { id: 'yard_operative', label: 'Yard Operative', cost: 1800 },
  { id: 'mechanic', label: 'Mechanic', cost: 2500 },
  { id: 'admin', label: 'Admin', cost: 1600 },
];

export const FacilitiesPage = () => {
  const { game, renameFacility, hireStaff, fireStaff } = useGameStore();
  const [selectedFacilityId, setSelectedFacilityId] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [hiringRole, setHiringRole] = useState(null);
  
  if (!game?.ui?.hasUnlockedGame) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="facilities-locked">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-[var(--primary)]" />
          <div className="font-heading text-xl text-[var(--text-main)]">FACILITIES LOCKED</div>
          <div className="text-[var(--text-muted)] mt-2">
            Purchase your first depot to unlock facilities.
          </div>
        </div>
      </div>
    );
  }
  
  const facilities = Object.values(game.facilities.facilities);
  const selectedFacility = selectedFacilityId ? game.facilities.facilities[selectedFacilityId] : null;
  const facilityStaff = selectedFacility 
    ? Object.values(game.staff.staff).filter(s => s.facilityId === selectedFacilityId)
    : [];
  
  // Calculate office points
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
      renameFacility(selectedFacilityId, newName.trim());
      setEditingName(false);
    }
  };
  
  const handleHire = (roleId) => {
    if (selectedFacilityId) {
      const result = hireStaff(selectedFacilityId, roleId);
      if (result.success) {
        setHiringRole(null);
      }
    }
  };
  
  return (
    <div className="p-6" data-testid="facilities-page">
      {/* Header with Office Points Banner */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-black text-[var(--text-main)]">FACILITIES</h1>
          <p className="text-[var(--text-muted)] mt-1">Manage your depots, yards, and offices</p>
        </div>
        
        {/* Office Points Banner */}
        <div className="card bg-[var(--secondary)]/10 border-[var(--secondary)]">
          <div className="p-4 flex items-center gap-4">
            <Building size={24} className="text-[var(--secondary)]" />
            <div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Office Points</div>
              <div className="font-mono text-2xl font-bold text-[var(--secondary)]">{officePoints}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {/* Facilities List */}
        <div>
          <h2 className="font-heading text-lg font-bold text-[var(--text-main)] mb-4">YOUR FACILITIES</h2>
          <div className="space-y-2">
            {facilities.map((facility) => {
              const staffCount = Object.values(game.staff.staff).filter(s => s.facilityId === facility.id).length;
              
              return (
                <button
                  key={facility.id}
                  onClick={() => setSelectedFacilityId(facility.id)}
                  className={`w-full text-left p-4 border transition-colors ${
                    selectedFacilityId === facility.id
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--border)] hover:border-[var(--muted)] bg-[var(--surface)]'
                  }`}
                  data-testid={`facility-${facility.id}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-[var(--text-main)]">{facility.name}</span>
                    <span className="badge badge-info text-[10px]">{facility.size}</span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mb-2">
                    {facility.type.replace(/_/g, ' ')}
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted)]">Staff: {staffCount}</span>
                    <span className="text-[var(--muted)]">Compliance: {facility.compliance}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Facility Details */}
        <div className="col-span-2">
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
                      className="flex-1 bg-[var(--background)] px-2 py-1"
                      autoFocus
                      data-testid="rename-input"
                    />
                    <button onClick={handleSaveRename} className="text-[var(--success)]" data-testid="save-rename">
                      <Check size={18} />
                    </button>
                    <button onClick={() => setEditingName(false)} className="text-[var(--danger)]">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="font-heading text-xl font-bold text-[var(--text-main)]" data-testid="facility-name">
                      {selectedFacility.name}
                    </h2>
                    <button onClick={handleStartRename} className="text-[var(--muted)] hover:text-[var(--text-main)]" data-testid="rename-button">
                      <Edit2 size={16} />
                    </button>
                  </>
                )}
              </div>
              
              <div className="card-content">
                {/* Info Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-[var(--background)] p-3">
                    <div className="text-xs text-[var(--text-muted)] uppercase">Type</div>
                    <div className="font-bold text-[var(--text-main)]">
                      {selectedFacility.type.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div className="bg-[var(--background)] p-3">
                    <div className="text-xs text-[var(--text-muted)] uppercase">Size</div>
                    <div className="font-bold text-[var(--text-main)] capitalize">
                      {selectedFacility.size}
                    </div>
                  </div>
                  <div className="bg-[var(--background)] p-3">
                    <div className="text-xs text-[var(--text-muted)] uppercase">Overhead</div>
                    <div className="font-mono font-bold text-[var(--accent)]">
                      {formatCurrency(selectedFacility.overheadPerWeek)}/wk
                    </div>
                  </div>
                </div>
                
                {/* Compliance Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[var(--text-muted)] uppercase tracking-widest">Compliance</span>
                    <span className="font-mono text-[var(--text-main)]">{selectedFacility.compliance}%</span>
                  </div>
                  <div className="progress-bar">
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
                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[var(--text-muted)] uppercase tracking-widest">
                      Capacity ({selectedFacility.capacityKind})
                    </span>
                    <span className="font-mono text-[var(--text-main)]">
                      {selectedFacility.capacityKind === 'units' ? selectedFacility.storageUnitsUsed : selectedFacility.tonnesStored}
                      /{selectedFacility.capacityMax}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill"
                      style={{ 
                        width: `${(selectedFacility.capacityKind === 'units' 
                          ? selectedFacility.storageUnitsUsed 
                          : selectedFacility.tonnesStored) / selectedFacility.capacityMax * 100}%` 
                      }}
                    />
                  </div>
                </div>
                
                {/* Staff Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-heading font-bold text-[var(--text-main)]">STAFF</h3>
                    <button
                      onClick={() => setHiringRole(hiringRole ? null : 'selecting')}
                      className="btn-secondary py-1 px-3 text-sm"
                      data-testid="hire-staff-button"
                    >
                      <UserPlus size={14} className="inline mr-1" />
                      HIRE
                    </button>
                  </div>
                  
                  {/* Hire Menu */}
                  {hiringRole && (
                    <div className="bg-[var(--background)] p-4 mb-4 animate-fade-in">
                      <div className="text-xs text-[var(--text-muted)] uppercase mb-3">Select Role to Hire</div>
                      <div className="grid grid-cols-3 gap-2">
                        {STAFF_ROLES.map((role) => (
                          <button
                            key={role.id}
                            onClick={() => handleHire(role.id)}
                            className="p-2 border border-[var(--border)] hover:border-[var(--primary)] text-left transition-colors"
                            data-testid={`hire-${role.id}`}
                          >
                            <div className="font-bold text-sm text-[var(--text-main)]">{role.label}</div>
                            <div className="font-mono text-xs text-[var(--primary)]">{formatCurrency(role.cost)}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Staff List */}
                  {facilityStaff.length > 0 ? (
                    <div className="space-y-2">
                      {facilityStaff.map((staff) => (
                        <div 
                          key={staff.id} 
                          className="flex items-center justify-between bg-[var(--background)] p-3"
                          data-testid={`staff-${staff.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <Users size={16} className="text-[var(--muted)]" />
                            <div>
                              <div className="font-bold text-[var(--text-main)]">{staff.name}</div>
                              <div className="text-xs text-[var(--text-muted)]">{staff.role.replace(/_/g, ' ')}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => fireStaff(staff.id)}
                            className="text-[var(--danger)] hover:bg-[var(--danger)]/10 p-2 transition-colors"
                            data-testid={`fire-${staff.id}`}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-[var(--text-muted)] py-6 bg-[var(--background)]">
                      <Users size={32} className="mx-auto mb-2 text-[var(--muted)]" />
                      No staff assigned
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
