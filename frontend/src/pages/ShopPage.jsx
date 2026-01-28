import React, { useState } from 'react';
import { useGameStore, formatCurrency, ASSET_DEFS } from '../game/store/useGameStore';
import { ShoppingCart, Car, Truck, Package, Settings, AlertTriangle, Check, CreditCard, DollarSign } from 'lucide-react';

const SHOP_CATEGORIES = {
  fleet: {
    label: 'Vehicles',
    icon: Car,
    items: ['small_tipper', 'large_tipper', 'skip_truck', 'grab_lorry', 'artic_unit'],
  },
  trailers: {
    label: 'Trailers',
    icon: Truck,
    items: ['flatbed_trailer', 'tipper_trailer', 'walking_floor'],
  },
  containers: {
    label: 'Containers',
    icon: Package,
    items: ['skip_8yd', 'skip_12yd', 'skip_16yd', 'roro_20yd', 'roro_40yd'],
  },
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
          <div className="text-[var(--text-muted)] mt-2">Purchase your first depot to unlock the shop.</div>
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
  
  const handleBuy = (defId) => {
    const def = ASSET_DEFS[defId];
    const canLease = leaseMode && def.leaseDeposit;
    
    setPurchaseError(null);
    setPurchaseSuccess(null);
    
    const result = buyAsset(defId, selectedDepotId, canLease);
    
    if (result.success) {
      setPurchaseSuccess(`${def.name} ${canLease ? 'leased' : 'purchased'}!`);
      setTimeout(() => setPurchaseSuccess(null), 3000);
    } else {
      setPurchaseError(result.error);
    }
  };
  
  const category = SHOP_CATEGORIES[currentTab];
  const items = category?.items.map(id => ({ id, ...ASSET_DEFS[id] })) || [];
  
  return (
    <div className="p-3 lg:p-6" data-testid="shop-page">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4 mb-4 lg:mb-6">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-black text-[var(--text-main)]">SHOP</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Purchase or lease vehicles, trailers, and containers</p>
        </div>
        
        {/* Depot Selector & Storage */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-4">
          <div className="flex-1 sm:flex-none">
            <label className="block text-[10px] lg:text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
              Deliver To Depot
            </label>
            <select
              value={selectedDepotId || ''}
              onChange={(e) => setShopDepot(e.target.value)}
              className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--text-main)] px-2 lg:px-3 py-2 text-sm lg:min-w-[200px]"
              data-testid="depot-selector"
            >
              {depots.map((depot) => (
                <option key={depot.id} value={depot.id}>{depot.name}</option>
              ))}
            </select>
          </div>
          
          <div className="card">
            <div className="p-2 lg:p-3">
              <div className="text-[10px] lg:text-xs text-[var(--text-muted)] uppercase">Storage</div>
              <div className="font-mono text-lg lg:text-xl">
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
      <div className="flex gap-1 lg:gap-2 mb-4 lg:mb-6 bg-[var(--surface)] p-1">
        {Object.entries(SHOP_CATEGORIES).map(([id, { label, icon: Icon }]) => (
          <button
            key={id}
            onClick={() => setShopTab(id)}
            className={`flex-1 flex items-center justify-center gap-1 lg:gap-2 py-2 lg:py-3 transition-colors ${
              currentTab === id
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-highlight)]'
            }`}
            data-testid={`tab-${id}`}
          >
            <Icon size={16} />
            <span className="font-bold uppercase text-xs lg:text-base">{label}</span>
          </button>
        ))}
      </div>
      
      {/* Lease Toggle */}
      {currentTab !== 'containers' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-6 mb-4 lg:mb-6 p-3 lg:p-4 bg-[var(--surface)] border border-[var(--border)]">
          <div className="flex items-center gap-2 lg:gap-3">
            <button
              onClick={() => setLeaseMode(false)}
              className={`flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 font-bold text-xs lg:text-sm transition-colors ${
                !leaseMode 
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-highlight)]'
              }`}
              data-testid="buy-mode"
            >
              <DollarSign size={14} />
              BUY
            </button>
            <button
              onClick={() => setLeaseMode(true)}
              className={`flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 font-bold text-xs lg:text-sm transition-colors ${
                leaseMode 
                  ? 'bg-[var(--secondary)] text-[var(--secondary-foreground)]' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-highlight)]'
              }`}
              data-testid="lease-mode"
            >
              <CreditCard size={14} />
              LEASE
            </button>
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {leaseMode 
              ? 'Pay deposit now + weekly payments. Return anytime.' 
              : 'Full ownership. Can sell later at 60% value.'}
          </div>
        </div>
      )}
      
      {/* Messages */}
      {purchaseSuccess && (
        <div className="bg-[var(--success)]/10 border border-[var(--success)] p-3 mb-6 flex items-center gap-2">
          <Check size={16} className="text-[var(--success)]" />
          <span className="text-[var(--success)]">{purchaseSuccess}</span>
        </div>
      )}
      
      {purchaseError && (
        <div className="bg-[var(--danger)]/10 border border-[var(--danger)] p-3 mb-6 flex items-center gap-2">
          <AlertTriangle size={16} className="text-[var(--danger)]" />
          <span className="text-[var(--danger)]">{purchaseError}</span>
        </div>
      )}
      
      {/* Storage Full Warning */}
      {storageUsed >= storageMax && (
        <div className="bg-[var(--danger)]/10 border border-[var(--danger)] p-3 mb-6 flex items-center gap-2">
          <AlertTriangle size={16} className="text-[var(--danger)]" />
          <span className="text-[var(--danger)]">Depot storage is full! Buy a larger depot or sell existing assets.</span>
        </div>
      )}
      
      {/* Items Grid */}
      <div className="grid gap-3 lg:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const canLease = leaseMode && item.leaseDeposit;
          const displayPrice = canLease ? item.leaseDeposit : item.price;
          const canAfford = game.company.cash >= displayPrice;
          const canBuy = canAfford && storageUsed < storageMax;
          
          return (
            <div key={item.id} className="card" data-testid={`shop-item-${item.id}`}>
              <div className="card-header">
                <h3 className="font-heading font-bold text-[var(--text-main)]">{item.name}</h3>
              </div>
              <div className="card-content">
                {/* Item Info */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Type</span>
                    <span className="text-[var(--text-main)] capitalize">{item.kind}</span>
                  </div>
                  {item.capacity > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Capacity</span>
                      <span className="text-[var(--text-main)]">{item.capacity}t</span>
                    </div>
                  )}
                </div>
                
                {/* Pricing */}
                <div className="border-t border-[var(--border)] pt-4 mb-4">
                  {leaseMode && item.leaseDeposit ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-[var(--text-muted)]">Deposit</span>
                        <span className="font-mono font-bold text-[var(--secondary)]">
                          {formatCurrency(item.leaseDeposit)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-[var(--text-muted)]">Weekly</span>
                        <span className="font-mono text-[var(--text-main)]">
                          {formatCurrency(item.leaseWeekly)}/wk
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[var(--text-muted)]">Price</span>
                      <span className="font-mono text-2xl font-bold text-[var(--primary)]">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Buy Button */}
                <button
                  onClick={() => handleBuy(item.id)}
                  disabled={!canBuy}
                  className={`w-full py-3 font-bold uppercase transition-colors ${
                    canBuy 
                      ? leaseMode && item.leaseDeposit
                        ? 'btn-secondary'
                        : 'btn-primary'
                      : 'bg-[var(--border)] text-[var(--muted)] cursor-not-allowed'
                  }`}
                  data-testid={`buy-${item.id}`}
                >
                  <ShoppingCart size={16} className="inline mr-2" />
                  {canLease ? 'LEASE' : 'BUY'}
                </button>
                
                {!canAfford && (
                  <div className="text-xs text-[var(--danger)] text-center mt-2">
                    Need {formatCurrency(displayPrice - game.company.cash)} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShopPage;
