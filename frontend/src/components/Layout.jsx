import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Map, 
  FileText, 
  Truck, 
  Car, 
  ShoppingCart, 
  Building, 
  Store, 
  HelpCircle,
  Pause,
  Play,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Menu
} from 'lucide-react';
import { useGameStore, formatCurrency, getGameDate, formatGameTime } from '../game/store/useGameStore';

const NAV_ITEMS = [
  { path: '/map', label: 'Map', icon: Map },
  { path: '/contracts', label: 'Contracts', icon: FileText },
  { path: '/dispatch', label: 'Dispatch', icon: Truck },
  { path: '/fleet', label: 'Fleet', icon: Car },
  { path: '/shop', label: 'Shop', icon: ShoppingCart },
  { path: '/facilities', label: 'Facilities', icon: Building },
  { path: '/marketplace', label: 'Marketplace', icon: Store },
  { path: '/help', label: 'Help', icon: HelpCircle },
];

// Notifications component
const Notifications = () => {
  const { notifications, clearNotification } = useGameStore();
  
  if (notifications.length === 0) return null;
  
  const icons = {
    success: <CheckCircle size={16} className="text-[var(--success)]" />,
    warning: <AlertTriangle size={16} className="text-[var(--primary)]" />,
    error: <AlertTriangle size={16} className="text-[var(--danger)]" />,
    info: <Info size={16} className="text-[var(--secondary)]" />,
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm" data-testid="notifications">
      {notifications.map((notif) => (
        <div 
          key={notif.id}
          className="bg-[var(--surface)] border border-[var(--border)] p-3 flex items-start gap-3 animate-slide-in shadow-lg"
        >
          {icons[notif.type] || icons.info}
          <span className="text-sm text-[var(--text-main)] flex-1">{notif.message}</span>
          <button 
            onClick={() => clearNotification(notif.id)}
            className="text-[var(--muted)] hover:text-[var(--text-main)]"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export const Layout = () => {
  const navigate = useNavigate();
  const { game, togglePause, setSpeed, speedMultiplier, saveGame, addNotification } = useGameStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const hasUnlocked = game?.ui?.hasUnlockedGame || false;
  
  const handleNavClick = (e, path) => {
    if (!hasUnlocked && path !== '/map' && path !== '/help') {
      e.preventDefault();
      addNotification('Buy your first depot to unlock this feature!', 'warning');
    } else {
      setMobileMenuOpen(false);
    }
  };
  
  const handleSave = () => {
    saveGame();
    addNotification('Game saved!', 'success');
  };
  
  const gameDate = game ? getGameDate(game.world) : new Date();
  const formattedDate = gameDate.toLocaleDateString('en-GB', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
  const shortDate = gameDate.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short'
  });
  
  // Calculate total fleet value
  const fleetCount = game ? Object.values(game.assets.physical).filter(a => a.kind === 'vehicle').length : 0;
  const staffCount = game ? Object.keys(game.staff.staff).length : 0;
  
  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden" data-testid="game-layout">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50
        w-64 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} data-testid="sidebar">
        {/* Logo */}
        <div className="p-4 border-b border-[var(--border)]">
          <h1 className="font-heading text-2xl font-black text-[var(--primary)] tracking-tight">
            WASTE TYCOON
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-widest">
            UK Logistics Empire
          </p>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-4" data-testid="main-navigation">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isLocked = !hasUnlocked && path !== '/map' && path !== '/help';
            
            return (
              <NavLink
                key={path}
                to={path}
                onClick={(e) => handleNavClick(e, path)}
                data-testid={`nav-${label.toLowerCase()}`}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 mx-2 mb-1 transition-colors duration-150
                  ${isActive 
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                    : isLocked 
                      ? 'text-[var(--muted)] cursor-not-allowed opacity-50' 
                      : 'text-[var(--text-muted)] hover:bg-[var(--surface-highlight)] hover:text-[var(--text-main)]'
                  }
                `}
              >
                <Icon size={18} />
                <span className="font-medium text-sm uppercase tracking-wide">{label}</span>
                {isLocked && (
                  <span className="ml-auto text-[10px] bg-[var(--border)] px-1.5 py-0.5 rounded-sm">
                    LOCKED
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
        
        {/* Game Info */}
        {game && (
          <div className="p-4 border-t border-[var(--border)] bg-[var(--background)]">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
              Company Stats
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Reputation</span>
                <span className={`font-mono ${game.company.reputation >= 70 ? 'text-[var(--success)]' : game.company.reputation >= 40 ? 'text-[var(--primary)]' : 'text-[var(--danger)]'}`}>
                  {game.company.reputation}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Depots</span>
                <span className="font-mono text-[var(--text-main)]">
                  {Object.keys(game.facilities.depots).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Fleet</span>
                <span className="font-mono text-[var(--text-main)]">{fleetCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Staff</span>
                <span className="font-mono text-[var(--text-main)]">{staffCount}</span>
              </div>
              {game.loans.creditLine.enabled && game.loans.creditLine.principalOwed > 0 && (
                <div className="flex justify-between">
                  <span className="text-[var(--danger)]">Loan</span>
                  <span className="font-mono text-[var(--danger)]">
                    {formatCurrency(game.loans.creditLine.principalOwed)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 lg:h-16 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-3 lg:px-6" data-testid="topbar">
          {/* Mobile Menu Button + Cash Display */}
          <div className="flex items-center gap-3 lg:gap-8">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
              data-testid="mobile-menu-toggle"
            >
              <Menu size={24} />
            </button>
            
            <div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest hidden sm:block">Cash</div>
              <div className={`font-mono text-lg lg:text-2xl font-bold ${game && game.company.cash >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`} data-testid="cash-display">
                {game ? formatCurrency(game.company.cash) : '£0'}
              </div>
            </div>
            
            {/* Active Jobs Indicator - Hidden on very small screens */}
            {game && Object.keys(game.dispatch.activeJobs).length > 0 && (
              <div className="hidden sm:flex items-center gap-2 bg-[var(--secondary)]/20 px-2 lg:px-3 py-1">
                <Truck size={16} className="text-[var(--secondary)] animate-pulse" />
                <span className="font-mono text-sm text-[var(--secondary)]">
                  {Object.keys(game.dispatch.activeJobs).length}
                </span>
              </div>
            )}
          </div>
          
          {/* Time Controls */}
          <div className="flex items-center gap-2 lg:gap-6">
            {/* Date/Time - Compact on mobile */}
            <div className="text-right">
              <div className="font-mono text-sm lg:text-lg text-[var(--text-main)]" data-testid="game-date">
                <span className="hidden sm:inline">{formattedDate}</span>
                <span className="sm:hidden">{shortDate}</span>
              </div>
              <div className="font-mono text-xs lg:text-sm text-[var(--text-muted)]" data-testid="game-time">
                {game ? formatGameTime(game.world) : '00:00'}
              </div>
            </div>
            
            {/* Speed Controls - Simplified on mobile */}
            <div className="flex items-center gap-1 bg-[var(--background)] p-1">
              <button
                onClick={togglePause}
                data-testid="pause-button"
                className={`p-1.5 lg:p-2 transition-colors duration-150 ${
                  game?.world.paused 
                    ? 'text-[var(--danger)] bg-[var(--danger)]/10' 
                    : 'text-[var(--success)]'
                } hover:bg-[var(--surface-highlight)]`}
                title={game?.world.paused ? 'Resume' : 'Pause'}
              >
                {game?.world.paused ? <Play size={18} /> : <Pause size={18} />}
              </button>
              
              {/* Show fewer speed options on mobile */}
              {[1, 2, 5, 10].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSpeed(speed)}
                  data-testid={`speed-${speed}x`}
                  className={`px-1.5 lg:px-2 py-1 font-mono text-xs lg:text-sm transition-colors duration-150 ${
                    speedMultiplier === speed 
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                      : 'text-[var(--text-muted)] hover:bg-[var(--surface-highlight)]'
                  } ${speed === 5 ? 'hidden sm:block' : ''}`}
                >
                  {speed}x
                </button>
              ))}
            </div>
            
            {/* Save Button - Icon only on mobile */}
            <button
              onClick={handleSave}
              data-testid="save-button"
              className="btn-secondary flex items-center gap-2 py-1.5 lg:py-2 px-2 lg:px-4"
              title="Save Game"
            >
              <Save size={16} />
              <span className="text-sm hidden sm:inline">SAVE</span>
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[var(--background)]" data-testid="main-content">
          <Outlet />
        </main>
      </div>
      
      {/* Notifications */}
      <Notifications />
    </div>
  );
};

export default Layout;
