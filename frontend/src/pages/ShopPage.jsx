import React, { useState } from 'react';
import { useGameStore, formatCurrency } from '../game/store/useGameStore';
import { ShoppingCart, Car, Truck, Package, Settings, AlertTriangle, Check } from 'lucide-react';

const SHOP_ITEMS = {
  fleet: [
    { id: 'small_tipper', name: 'Small Tipper', price: 35000, leaseDeposit: 5000, leaseWeekly: 350, desc: 'Light duty tipper for small loads' },
    { id: 'large_tipper', name: 'Large Tipper', price: 65000, leaseDeposit: 8000, leaseWeekly: 500, desc: '8-wheel tipper for heavy loads' },
    { id: 'skip_truck', name: 'Skip Truck', price: 85000, leaseDeposit: 12000, leaseWeekly: 650, desc: 'Skip loader vehicle' },
    { id: 'grab_lorry', name: 'Grab Lorry', price: 120000, leaseDeposit: 15000, leaseWeekly: 850, desc: 'Grab arm equipped lorry' },
    { id: 'artic_unit', name: 'Artic Unit', price: 95000, leaseDeposit: 12000, leaseWeekly: 700, desc: 'Articulated tractor unit' },
  ],
  trailers: [
    { id: 'flatbed_trailer', name: 'Flatbed Trailer', price: 15000, leaseDeposit: 2000, leaseWeekly: 120, desc: 'Standard flatbed trailer' },
    { id: 'tipper_trailer', name: 'Tipper Trailer', price: 25000, leaseDeposit: 3500, leaseWeekly: 200, desc: 'Tipping trailer for aggregates' },
    { id: 'walking_floor', name: 'Walking Floor', price: 45000, leaseDeposit: 6000, leaseWeekly: 350, desc: 'Self-unloading trailer' },
  ],
  containers: [
    { id: 'skip_8yd', name: '8 Yard Skip', price: 800, desc: 'Small skip container' },
    { id: 'skip_12yd', name: '12 Yard Skip', price: 1200, desc: 'Medium skip container' },
    { id: 'skip_16yd', name: '16 Yard Skip', price: 1600, desc: 'Large skip container' },
    { id: 'roro_20yd', name: '20 Yard RoRo', price: 3500, desc: 'Roll-on roll-off container' },
    { id: 'roro_40yd', name: '40 Yard RoRo', price: 5500, desc: 'Large RoRo container' },
  ],
};

export const ShopPage = () => {
  const { game, buyAsset, setShopTab, setShopDepot } = useGameStore();
  const [leaseMode, setLeaseMode] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);
  const [purchaseError, setPurchaseError] = useState(null);
  
  if (!game?.ui?.hasUnlockedGame) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="shop-locked">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-[var(--primary)]" />
          <div className="font-heading text-xl text-[var(--text-main)]">SHOP LOCKED</div>
          <div className="text-[var(--text-muted)] mt-2">
            Purchase your first depot to unlock the shop.
          </div>
        </div>
      </div>
    );
  }
  
  const depots = Object.values(game.facilities.depots);
  const currentTab = game.shop.ui.tab;
  const selectedDepotId = game.shop.ui.depotId || (depots.length > 0 ? depots[0].id : null);
  const selectedDepot = depots.find(d => d.id === selectedDepotId);
  
  const currentAssets = Object.values(game.assets.physical).filter(a => a.depotId === selectedDepotId);
  const storageUsed = currentAssets.length;
  const storageMax = selectedDepot?.storageMax || 10;
  
  const handleBuy = (item) => {
    if (!selectedDepotId) {
      setPurchaseError('Please select a depot first');
      return;
    }
    
    const result = buyAsset(item.id, selectedDepotId, leaseMode && item.leaseDeposit);
    
    if (result.success) {
      setPurchaseSuccess(`${item.name} purchased successfully!`);
      setPurchaseError(null);
      setTimeout(() => setPurchaseSuccess(null), 3000);
    } else {
      setPurchaseError(result.error);
      setPurchaseSuccess(null);
    }
  };
  
  const tabs = [
    { id: 'fleet', label: 'Fleet', icon: Car },
    { id: 'trailers', label: 'Trailers', icon: Truck },
    { id: 'containers', label: 'Containers', icon: Package },
    { id: 'upgrades', label: 'Upgrades', icon: Settings },
  ];
  
  return (
    <div className="p-6" data-testid="shop-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-black text-[var(--text-main)]">SHOP</h1>
          <p className="text-[var(--text-muted)] mt-1">Purchase vehicles, trailers, and containers</p>
        </div>
        
        {/* Depot Selector */}
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
              Deliver To
            </label>
            <select
              value={selectedDepotId || ''}
              onChange={(e) => setShopDepot(e.target.value)}
              className="bg-[var(--background)] border border-[var(--border)] text-[var(--text-main)] px-3 py-2 min-w-[200px]"
              data-testid="depot-selector"
            >
              {depots.map((depot) => (
                <option key={depot.id} value={depot.id}>{depot.name}</option>
              ))}
            </select>
          </div>
          
          {/* Storage Info */}
          <div className="card">
            <div className="p-3">
              <div className="text-xs text-[var(--text-muted)] uppercase">Storage</div>
              <div className="font-mono text-lg">
                <span className={storageUsed >= storageMax ? 'text-[var(--danger)]' : 'text-[var(--text-main)]'}>
                  {storageUsed}
                </span>
                <span className="text-[var(--muted)]"> / {storageMax}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[var(--surface)] p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setShopTab(id)}
            className={`flex items-center gap-2 px-4 py-2 transition-colors ${
              currentTab === id
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-highlight)]'
            }`}
            data-testid={`tab-${id}`}
          >
            <Icon size={16} />
            <span className="font-bold uppercase text-sm">{label}</span>
          </button>
        ))}
      </div>
      
      {/* Lease Toggle */}
      {currentTab !== 'containers' && currentTab !== 'upgrades' && (
        <div className="flex items-center gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={leaseMode}
              onChange={(e) => setLeaseMode(e.target.checked)}
              className="w-4 h-4"
              data-testid="lease-toggle"
            />
            <span className="text-[var(--text-main)]">Lease Mode</span>
          </label>
          <span className="text-xs text-[var(--text-muted)]">
            {leaseMode ? 'Pay deposit + weekly payments' : 'Purchase outright'}
          </span>
        </div>
      )}
      
      {/* Success/Error Messages */}
      {purchaseSuccess && (
        <div className="bg-[var(--success)]/10 border border-[var(--success)] p-3 mb-6 flex items-center gap-2">
          <Check size={16} className="text-[var(--success)]" />
          <span className="text-[var(--success)]">{purchaseSuccess}</span>
        </div>
      )}
      
      {purchaseError && (
        <div className="bg-[var(--danger)]/10 border border-[var(--danger)] p-3 mb-6">
          <span className="text-[var(--danger)]">{purchaseError}</span>
        </div>
      )}
      
      {/* Items Grid */}
      {currentTab !== 'upgrades' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SHOP_ITEMS[currentTab]?.map((item) => (
            <div key={item.id} className="card" data-testid={`shop-item-${item.id}`}>
              <div className="card-header">
                <h3 className="font-heading font-bold text-[var(--text-main)]">{item.name}</h3>
              </div>
              <div className="card-content">
                <p className="text-sm text-[var(--text-muted)] mb-4">{item.desc}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-xs text-[var(--text-muted)]">
                      {leaseMode && item.leaseDeposit ? 'Deposit' : 'Price'}
                    </span>
                    <span className="font-mono font-bold text-[var(--primary)]">
                      {formatCurrency(leaseMode && item.leaseDeposit ? item.leaseDeposit : item.price)}
                    </span>
                  </div>
                  {leaseMode && item.leaseWeekly && (
                    <div className="flex justify-between">
                      <span className="text-xs text-[var(--text-muted)]">Weekly</span>
                      <span className="font-mono text-[var(--text-main)]">
                        {formatCurrency(item.leaseWeekly)}/wk
                      </span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleBuy(item)}
                  disabled={storageUsed >= storageMax}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid={`buy-${item.id}`}
                >
                  <ShoppingCart size={16} className="inline mr-2" />
                  {leaseMode && item.leaseDeposit ? 'LEASE' : 'BUY'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="p-8 text-center">
            <Settings size={48} className="mx-auto mb-4 text-[var(--muted)]" />
            <div className="text-[var(--text-muted)]">Upgrades coming soon</div>
            <div className="text-xs text-[var(--muted)] mt-2">
              Depot upgrades like fuel savings and reliability improvements will be available here.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
