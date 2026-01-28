import React, { useState } from 'react';
import { useGameStore } from '../game/store/useGameStore';
import { HelpCircle, Save, Trash2, Plus, AlertTriangle, BookOpen, Clock, DollarSign, Truck } from 'lucide-react';

export const HelpPage = () => {
  const { saveSlots, newGame, loadGame, deleteSlot, renameSlot, activeSlotId, saveGame } = useGameStore();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteInput, setDeleteInput] = useState('');
  const [newGameSlot, setNewGameSlot] = useState(null);
  const [newGameName, setNewGameName] = useState('');
  
  const handleNewGame = (slotId) => {
    setNewGameSlot(slotId);
    setNewGameName(`Save ${slotId}`);
  };
  
  const confirmNewGame = () => {
    if (newGameSlot) {
      newGame(newGameSlot, newGameName || `Save ${newGameSlot}`);
      setNewGameSlot(null);
      setNewGameName('');
    }
  };
  
  const handleDelete = (slotId) => {
    if (deleteInput === 'GONE') {
      deleteSlot(slotId);
      setDeleteConfirm(null);
      setDeleteInput('');
    }
  };
  
  const slots = [1, 2, 3, 4, 5];
  
  return (
    <div className="p-6" data-testid="help-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-black text-[var(--text-main)]">HELP & SAVES</h1>
        <p className="text-[var(--text-muted)] mt-1">Game rules and save management</p>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Save Manager */}
        <div>
          <h2 className="font-heading text-xl font-bold text-[var(--text-main)] mb-4">SAVE MANAGER</h2>
          
          <div className="space-y-3">
            {slots.map((slotId) => {
              const slot = saveSlots[slotId];
              const isActive = activeSlotId === slotId;
              
              return (
                <div 
                  key={slotId} 
                  className={`card ${isActive ? 'border-[var(--primary)]' : ''}`}
                  data-testid={`save-slot-${slotId}`}
                >
                  <div className="card-content">
                    {slot ? (
                      <>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-bold text-[var(--text-main)]">{slot.meta.name}</div>
                            <div className="text-xs text-[var(--text-muted)]">
                              {new Date(slot.meta.updatedAtIso).toLocaleString()}
                            </div>
                          </div>
                          {isActive && <span className="badge badge-success">ACTIVE</span>}
                        </div>
                        
                        {/* Preview */}
                        <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                          <div className="bg-[var(--background)] p-2">
                            <span className="text-[var(--muted)]">Cash</span>
                            <div className="font-mono text-[var(--success)]">
                              £{(slot.meta.preview.cash / 1000).toFixed(0)}k
                            </div>
                          </div>
                          <div className="bg-[var(--background)] p-2">
                            <span className="text-[var(--muted)]">Day</span>
                            <div className="font-mono text-[var(--text-main)]">
                              {slot.meta.preview.day}
                            </div>
                          </div>
                          <div className="bg-[var(--background)] p-2">
                            <span className="text-[var(--muted)]">Year</span>
                            <div className="font-mono text-[var(--text-main)]">
                              {slot.meta.preview.year}
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2">
                          {!isActive && (
                            <button
                              onClick={() => loadGame(slotId)}
                              className="btn-primary flex-1 py-2"
                              data-testid={`load-slot-${slotId}`}
                            >
                              LOAD
                            </button>
                          )}
                          {isActive && (
                            <button
                              onClick={() => saveGame()}
                              className="btn-secondary flex-1 py-2"
                              data-testid={`save-slot-${slotId}`}
                            >
                              <Save size={14} className="inline mr-1" />
                              SAVE
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(slotId)}
                            className="btn-danger py-2 px-3"
                            data-testid={`delete-slot-${slotId}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        
                        {/* Delete Confirmation */}
                        {deleteConfirm === slotId && (
                          <div className="mt-3 p-3 bg-[var(--danger)]/10 border border-[var(--danger)] animate-fade-in">
                            <div className="text-sm text-[var(--danger)] mb-2">
                              Type <strong>GONE</strong> to confirm deletion:
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={deleteInput}
                                onChange={(e) => setDeleteInput(e.target.value)}
                                className="flex-1 text-sm"
                                placeholder="Type GONE"
                                data-testid="delete-confirm-input"
                              />
                              <button
                                onClick={() => handleDelete(slotId)}
                                disabled={deleteInput !== 'GONE'}
                                className="btn-danger py-1 px-3 text-sm disabled:opacity-50"
                                data-testid="confirm-delete"
                              >
                                DELETE
                              </button>
                              <button
                                onClick={() => { setDeleteConfirm(null); setDeleteInput(''); }}
                                className="btn-outline py-1 px-3 text-sm"
                              >
                                CANCEL
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="text-center py-4">
                          <div className="text-[var(--text-muted)] mb-3">Empty Slot {slotId}</div>
                          <button
                            onClick={() => handleNewGame(slotId)}
                            className="btn-primary"
                            data-testid={`new-game-${slotId}`}
                          >
                            <Plus size={14} className="inline mr-1" />
                            NEW GAME
                          </button>
                        </div>
                        
                        {/* New Game Dialog */}
                        {newGameSlot === slotId && (
                          <div className="mt-3 p-3 bg-[var(--primary)]/10 border border-[var(--primary)] animate-fade-in">
                            <div className="text-sm text-[var(--text-main)] mb-2">
                              Enter save name:
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newGameName}
                                onChange={(e) => setNewGameName(e.target.value)}
                                className="flex-1 text-sm"
                                placeholder={`Save ${slotId}`}
                                data-testid="new-game-name-input"
                              />
                              <button
                                onClick={confirmNewGame}
                                className="btn-primary py-1 px-3 text-sm"
                                data-testid="confirm-new-game"
                              >
                                START
                              </button>
                              <button
                                onClick={() => setNewGameSlot(null)}
                                className="btn-outline py-1 px-3 text-sm"
                              >
                                CANCEL
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Rules Reference */}
        <div>
          <h2 className="font-heading text-xl font-bold text-[var(--text-main)] mb-4">GAME RULES</h2>
          
          <div className="space-y-4">
            {/* Getting Started */}
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <AlertTriangle size={16} className="text-[var(--primary)]" />
                <span className="font-heading font-bold">GETTING STARTED</span>
              </div>
              <div className="card-content text-sm text-[var(--text-muted)] space-y-2">
                <p>1. Start a new game from the save slots</p>
                <p>2. Buy your first <strong className="text-[var(--text-main)]">Small Transport Depot</strong> from an industrial estate (£50,000)</p>
                <p>3. This unlocks all other game features</p>
                <p>4. Build your empire!</p>
              </div>
            </div>
            
            {/* Time & Billing */}
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <Clock size={16} className="text-[var(--secondary)]" />
                <span className="font-heading font-bold">TIME & BILLING</span>
              </div>
              <div className="card-content text-sm text-[var(--text-muted)] space-y-2">
                <p>• Game starts <strong className="text-[var(--text-main)]">1 Jan 2026</strong></p>
                <p>• Monthly bills at midnight on the 1st</p>
                <p>• First bill: <strong className="text-[var(--text-main)]">1 Feb 2026</strong></p>
                <p>• Autosave every in-game hour</p>
              </div>
            </div>
            
            {/* Fleet */}
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <Truck size={16} className="text-[var(--accent)]" />
                <span className="font-heading font-bold">FLEET RULES</span>
              </div>
              <div className="card-content text-sm text-[var(--text-muted)] space-y-2">
                <p>• Vehicle condition wears with distance</p>
                <p>• Cannot dispatch below <strong className="text-[var(--danger)]">10% condition</strong></p>
                <p>• Repairs require mechanic access</p>
                <p>• Drivers work max 15h/day, need 10h rest</p>
              </div>
            </div>
            
            {/* Contracts */}
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <DollarSign size={16} className="text-[var(--success)]" />
                <span className="font-heading font-bold">CONTRACTS</span>
              </div>
              <div className="card-content text-sm text-[var(--text-muted)] space-y-2">
                <p>• No deadlines - complete at your pace</p>
                <p>• Cancelling costs cash + reputation</p>
                <p>• Dispatch requires driver + valid vehicle</p>
              </div>
            </div>
            
            {/* Save Rules */}
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <Save size={16} className="text-[var(--muted)]" />
                <span className="font-heading font-bold">SAVE SYSTEM</span>
              </div>
              <div className="card-content text-sm text-[var(--text-muted)] space-y-2">
                <p>• 5 save slots available</p>
                <p>• Autosave every in-game hour</p>
                <p>• Delete requires typing <strong className="text-[var(--danger)]">GONE</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
