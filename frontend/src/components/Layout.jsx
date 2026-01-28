import React from 'react';
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
  FastForward,
  Save
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

export const Layout = () => {
  const navigate = useNavigate();
  const { game, togglePause, setSpeed, speedMultiplier, saveGame } = useGameStore();
  
  const hasUnlocked = game?.ui?.hasUnlockedGame || false;
  
  const handleNavClick = (e, path) => {
    if (!hasUnlocked && path !== '/map' && path !== '/help') {
      e.preventDefault();
      // Could show a toast here
    }
  };
  
  const gameDate = game ? getGameDate(game.world) : new Date();
  const formattedDate = gameDate.toLocaleDateString('en-GB', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
  
  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden" data-testid="game-layout">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col" data-testid="sidebar">
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
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Reputation</span>
                <span className="font-mono text-[var(--text-main)]">{game.company.reputation}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Depots</span>
                <span className="font-mono text-[var(--text-main)]">
                  {Object.keys(game.facilities.depots).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Fleet</span>
                <span className="font-mono text-[var(--text-main)]">
                  {Object.values(game.assets.physical).filter(a => a.kind === 'vehicle').length}
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-6" data-testid="topbar">
          {/* Cash Display */}
          <div className="flex items-center gap-8">
            <div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Cash</div>
              <div className="font-mono text-2xl font-bold text-[var(--success)]" data-testid="cash-display">
                {game ? formatCurrency(game.company.cash) : '£0'}
              </div>
            </div>
          </div>
          
          {/* Time Controls */}
          <div className="flex items-center gap-6">
            {/* Date/Time */}
            <div className="text-right">
              <div className="font-mono text-lg text-[var(--text-main)]" data-testid="game-date">
                {formattedDate}
              </div>
              <div className="font-mono text-sm text-[var(--text-muted)]" data-testid="game-time">
                {game ? formatGameTime(game.world) : '00:00'}
              </div>
            </div>
            
            {/* Speed Controls */}
            <div className="flex items-center gap-2 bg-[var(--background)] p-1">
              <button
                onClick={togglePause}
                data-testid="pause-button"
                className={`p-2 transition-colors duration-150 ${
                  game?.world.paused 
                    ? 'text-[var(--danger)]' 
                    : 'text-[var(--success)]'
                } hover:bg-[var(--surface-highlight)]`}
                title={game?.world.paused ? 'Resume' : 'Pause'}
              >
                {game?.world.paused ? <Play size={20} /> : <Pause size={20} />}
              </button>
              
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSpeed(speed)}
                  data-testid={`speed-${speed}x`}
                  className={`px-2 py-1 font-mono text-sm transition-colors duration-150 ${
                    speedMultiplier === speed 
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                      : 'text-[var(--text-muted)] hover:bg-[var(--surface-highlight)]'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
            
            {/* Save Button */}
            <button
              onClick={saveGame}
              data-testid="save-button"
              className="btn-secondary flex items-center gap-2 py-2 px-4"
              title="Save Game"
            >
              <Save size={16} />
              <span className="text-sm">SAVE</span>
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[var(--background)]" data-testid="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
