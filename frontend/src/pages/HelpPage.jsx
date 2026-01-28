import React, { useState } from 'react';
import { useGameStore, formatCurrency } from '../game/store/useGameStore';
import { HelpCircle, Save, Trash2, Plus, AlertTriangle, BookOpen, Clock, DollarSign, Truck, Building, CreditCard, Play, X } from 'lucide-react';

export const HelpPage = () => {
  const { saveSlots, newGame, loadGame, deleteSlot, activeSlotId, saveGame, game, takeLoan, repayLoan } = useGameStore();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteInput, setDeleteInput] = useState('');
  const [newGameSlot, setNewGameSlot] = useState(null);
  const [newGameName, setNewGameName] = useState('');
  const [loanAmount, setLoanAmount] = useState('50000');
  const [repayAmount, setRepayAmount] = useState('');
  const [loanError, setLoanError] = useState(null);
  const [activeSection, setActiveSection] = useState('saves');
  
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
  
  const handleTakeLoan = () => {
    setLoanError(null);
    const amount = parseInt(loanAmount);
    const result = takeLoan(amount);
    if (!result.success) {
      setLoanError(result.error);
    }
  };
  
  const handleRepayLoan = () => {
    setLoanError(null);
    const amount = parseInt(repayAmount) || game?.loans.creditLine.principalOwed;
    const result = repayLoan(amount);
    if (!result.success) {
      setLoanError(result.error);
    } else {
      setRepayAmount('');
    }
  };
  
  const slots = [1, 2, 3, 4, 5];
  const hasLoan = game?.loans.creditLine.enabled && game?.loans.creditLine.principalOwed > 0;
  
  return (
    <div className="p-6" data-testid="help-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-black text-[var(--text-main)]">HELP & MANAGEMENT</h1>
        <p className="text-[var(--text-muted)] mt-1">Game rules, saves, and loans</p>
      </div>
      
      {/* Section Tabs */}
      <div className="flex gap-2 mb-6 bg-[var(--surface)] p-1">
        {[
          { id: 'saves', label: 'Save Manager', icon: Save },
          { id: 'loans', label: 'Loans', icon: CreditCard },
          { id: 'rules', label: 'Game Rules', icon: BookOpen },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors ${
              activeSection === id 
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-highlight)]'
            }`}
          >
            <Icon size={18} />
            <span className="font-bold uppercase">{label}</span>
          </button>
        ))}
      </div>
      
      {/* Save Manager */}
      {activeSection === 'saves' && (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="font-heading text-xl font-bold text-[var(--text-main)] mb-4">SAVE SLOTS</h2>
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
                          
                          <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                            <div className="bg-[var(--background)] p-2">
                              <span className="text-[var(--muted)]">Cash</span>
                              <div className="font-mono text-[var(--success)]">
                                £{(slot.meta.preview.cash / 1000).toFixed(0)}k
                              </div>
                            </div>
                            <div className="bg-[var(--background)] p-2">
                              <span className="text-[var(--muted)]">Day</span>
                              <div className="font-mono text-[var(--text-main)]">{slot.meta.preview.day}</div>
                            </div>
                            <div className="bg-[var(--background)] p-2">
                              <span className="text-[var(--muted)]">Year</span>
                              <div className="font-mono text-[var(--text-main)]">{slot.meta.preview.year}</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {!isActive && (
                              <button onClick={() => loadGame(slotId)} className="btn-primary flex-1 py-2" data-testid={`load-slot-${slotId}`}>
                                <Play size={14} className="inline mr-1" /> LOAD
                              </button>
                            )}
                            {isActive && (
                              <button onClick={() => saveGame()} className="btn-secondary flex-1 py-2" data-testid={`save-slot-${slotId}`}>
                                <Save size={14} className="inline mr-1" /> SAVE
                              </button>
                            )}
                            <button onClick={() => setDeleteConfirm(slotId)} className="btn-danger py-2 px-3" data-testid={`delete-slot-${slotId}`}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                          
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
                                <button onClick={() => { setDeleteConfirm(null); setDeleteInput(''); }} className="px-3 py-1 bg-[var(--border)] text-[var(--text-muted)] text-sm">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="text-center py-4">
                            <div className="text-[var(--text-muted)] mb-3">Empty Slot {slotId}</div>
                            <button onClick={() => handleNewGame(slotId)} className="btn-outline" data-testid={`new-game-${slotId}`}>
                              <Plus size={14} className="inline mr-1" /> NEW GAME
                            </button>
                          </div>
                          
                          {newGameSlot === slotId && (
                            <div className="mt-3 p-3 bg-[var(--primary)]/10 border border-[var(--primary)] animate-fade-in">
                              <div className="text-sm text-[var(--text-main)] mb-2">Enter save name:</div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newGameName}
                                  onChange={(e) => setNewGameName(e.target.value)}
                                  className="flex-1 text-sm"
                                  placeholder={`Save ${slotId}`}
                                  data-testid="new-game-name-input"
                                />
                                <button onClick={confirmNewGame} className="btn-primary py-1 px-3 text-sm" data-testid="confirm-new-game">
                                  START
                                </button>
                                <button onClick={() => setNewGameSlot(null)} className="px-3 py-1 bg-[var(--border)] text-[var(--text-muted)] text-sm">
                                  Cancel
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
          
          <div>
            <h2 className="font-heading text-xl font-bold text-[var(--text-main)] mb-4">SAVE INFO</h2>
            <div className="card">
              <div className="card-content space-y-4">
                <div className="flex items-start gap-3">
                  <Save size={20} className="text-[var(--primary)] mt-1" />
                  <div>
                    <div className="font-bold text-[var(--text-main)]">Autosave</div>
                    <div className="text-sm text-[var(--text-muted)]">Game saves automatically every in-game hour to your active slot.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Trash2 size={20} className="text-[var(--danger)] mt-1" />
                  <div>
                    <div className="font-bold text-[var(--text-main)]">Delete Protection</div>
                    <div className="text-sm text-[var(--text-muted)]">To delete a save, you must type <strong className="text-[var(--danger)]">GONE</strong> exactly.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-[var(--secondary)] mt-1" />
                  <div>
                    <div className="font-bold text-[var(--text-main)]">Game Speed</div>
                    <div className="text-sm text-[var(--text-muted)]">Use 1x/2x/5x/10x buttons to control time speed. Pause anytime.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Loans Section */}
      {activeSection === 'loans' && game && (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="font-heading text-xl font-bold text-[var(--text-main)] mb-4">CREDIT LINE</h2>
            
            {loanError && (
              <div className="bg-[var(--danger)]/10 border border-[var(--danger)] p-3 mb-4 text-[var(--danger)] text-sm">
                {loanError}
              </div>
            )}
            
            {hasLoan ? (
              <div className="card border-[var(--danger)]">
                <div className="card-header bg-[var(--danger)]/10">
                  <h3 className="font-heading font-bold text-[var(--danger)]">ACTIVE LOAN</h3>
                </div>
                <div className="card-content">
                  <div className="text-center mb-4">
                    <div className="text-xs text-[var(--text-muted)] uppercase">Outstanding Balance</div>
                    <div className="font-mono text-4xl font-bold text-[var(--danger)]">
                      {formatCurrency(game.loans.creditLine.principalOwed)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="bg-[var(--background)] p-3">
                      <div className="text-[var(--text-muted)]">Interest Rate</div>
                      <div className="font-mono text-[var(--text-main)]">
                        {(game.loans.creditLine.inPenalty 
                          ? game.loans.creditLine.penaltyInterestRateMonthly 
                          : game.loans.creditLine.interestRateMonthly) * 100}%/mo
                        {game.loans.creditLine.inPenalty && <span className="text-[var(--danger)]"> (PENALTY)</span>}
                      </div>
                    </div>
                    <div className="bg-[var(--background)] p-3">
                      <div className="text-[var(--text-muted)]">Min Weekly Payment</div>
                      <div className="font-mono text-[var(--text-main)]">{formatCurrency(500)}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={repayAmount}
                      onChange={(e) => setRepayAmount(e.target.value)}
                      placeholder={`Enter amount (min £500)`}
                      className="w-full"
                    />
                    <button onClick={handleRepayLoan} className="btn-primary w-full">
                      REPAY {repayAmount ? formatCurrency(parseInt(repayAmount)) : 'FULL BALANCE'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-header">
                  <h3 className="font-heading font-bold text-[var(--text-main)]">TAKE OUT LOAN</h3>
                </div>
                <div className="card-content">
                  <div className="mb-4">
                    <label className="block text-xs text-[var(--text-muted)] uppercase mb-2">Loan Amount</label>
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      min="10000"
                      max="500000"
                      step="10000"
                      className="w-full text-xl font-mono"
                    />
                    <div className="text-xs text-[var(--text-muted)] mt-1">Min: £10,000 • Max: £500,000</div>
                  </div>
                  
                  <div className="bg-[var(--background)] p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-[var(--text-muted)]">Interest Rate</div>
                        <div className="font-mono text-[var(--text-main)]">2%/month</div>
                      </div>
                      <div>
                        <div className="text-[var(--text-muted)]">Min Weekly Payment</div>
                        <div className="font-mono text-[var(--text-main)]">£500</div>
                      </div>
                    </div>
                  </div>
                  
                  <button onClick={handleTakeLoan} className="btn-primary w-full">
                    <CreditCard size={16} className="inline mr-2" />
                    TAKE LOAN OF {formatCurrency(parseInt(loanAmount) || 0)}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <h2 className="font-heading text-xl font-bold text-[var(--text-main)] mb-4">LOAN TERMS</h2>
            <div className="card">
              <div className="card-content space-y-4">
                <div className="flex items-start gap-3">
                  <CreditCard size={20} className="text-[var(--primary)] mt-1" />
                  <div>
                    <div className="font-bold text-[var(--text-main)]">Single Credit Line</div>
                    <div className="text-sm text-[var(--text-muted)]">You can have one active loan at a time.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign size={20} className="text-[var(--accent)] mt-1" />
                  <div>
                    <div className="font-bold text-[var(--text-main)]">Flexible Repayment</div>
                    <div className="text-sm text-[var(--text-muted)]">Pay any amount, but minimum £500/week required.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-[var(--danger)] mt-1" />
                  <div>
                    <div className="font-bold text-[var(--text-main)]">Missed Payment Penalty</div>
                    <div className="text-sm text-[var(--text-muted)]">Miss a weekly payment? -5% reputation and 5% penalty interest rate until caught up.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Rules Section */}
      {activeSection === 'rules' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <AlertTriangle size={16} className="text-[var(--primary)]" />
                <span className="font-heading font-bold">GETTING STARTED</span>
              </div>
              <div className="card-content text-sm text-[var(--text-muted)] space-y-2">
                <p>1. Start a new game from Save Manager</p>
                <p>2. Buy your first <strong className="text-[var(--text-main)]">Small Transport Depot</strong> (£50,000) from an industrial estate</p>
                <p>3. This unlocks all game features</p>
                <p>4. Hire a driver, buy a vehicle, accept contracts!</p>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <Clock size={16} className="text-[var(--secondary)]" />
                <span className="font-heading font-bold">TIME & BILLING</span>
              </div>
              <div className="card-content text-sm text-[var(--text-muted)] space-y-2">
                <p>• Game starts <strong className="text-[var(--text-main)]">1 Jan 2026</strong></p>
                <p>• Monthly bills at midnight on the 1st</p>
                <p>• First bill: <strong className="text-[var(--text-main)]">1 Feb 2026</strong></p>
                <p>• Includes: facility overhead + staff wages</p>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <Truck size={16} className="text-[var(--accent)]" />
                <span className="font-heading font-bold">FLEET RULES</span>
              </div>
              <div className="card-content text-sm text-[var(--text-muted)] space-y-2">
                <p>• Vehicle condition wears with distance (0.15%/km)</p>
                <p>• Cannot dispatch below <strong className="text-[var(--danger)]">10% condition</strong></p>
                <p>• Repairs require mechanic garage (£50/condition point)</p>
                <p>• Drivers: max 15h/day, need 10h rest</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <DollarSign size={16} className="text-[var(--success)]" />
                <span className="font-heading font-bold">CONTRACTS & DISPATCH</span>
              </div>
              <div className="card-content text-sm text-[var(--text-muted)] space-y-2">
                <p>• No deadlines - complete at your pace</p>
                <p>• Cancelling costs cash penalty + reputation</p>
                <p>• Dispatch requires: driver + vehicle (≥10% condition)</p>
                <p>• Job completion pays out automatically</p>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <Building size={16} className="text-[var(--primary)]" />
                <span className="font-heading font-bold">PASSIVE INCOME</span>
              </div>
              <div className="card-content text-sm text-[var(--text-muted)] space-y-2">
                <p>• <strong className="text-[var(--text-main)]">Quarries</strong>: 500t/day (125t each: Sandstone, 6F2, Type1, Type2)</p>
                <p>• <strong className="text-[var(--text-main)]">Building Supplies</strong>: £90,000/week fixed income</p>
                <p>• Sell materials in Marketplace</p>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <CreditCard size={16} className="text-[var(--danger)]" />
                <span className="font-heading font-bold">LOANS</span>
              </div>
              <div className="card-content text-sm text-[var(--text-muted)] space-y-2">
                <p>• Single credit line (£10k - £500k)</p>
                <p>• 2% monthly interest (5% if penalty)</p>
                <p>• Weekly minimum payment: £500</p>
                <p>• Miss payment: rep hit + penalty rate</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpPage;
