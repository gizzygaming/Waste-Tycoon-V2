import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import { generateUKSites } from '../data/siteGenerator';

// Helper to format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper to get date from game seconds
export const getGameDate = (world) => {
  const startDate = new Date(2026, 0, 1); // 1 Jan 2026
  const totalDays = Math.floor(world.totalGameSeconds / 86400);
  const resultDate = new Date(startDate);
  resultDate.setDate(resultDate.getDate() + totalDays);
  return resultDate;
};

// Helper to format game time
export const formatGameTime = (world) => {
  const hours = Math.floor(world.secondsToday / 3600);
  const minutes = Math.floor((world.secondsToday % 3600) / 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Get week index from game seconds
export const getWeekIndex = (totalGameSeconds) => {
  return Math.floor(totalGameSeconds / (86400 * 7));
};

// Get day index from game seconds
export const getDayIndex = (totalGameSeconds) => {
  return Math.floor(totalGameSeconds / 86400);
};

// Calculate office points bonus
export const getOfficePointsBonus = (facilities) => {
  const officeCount = Object.values(facilities).filter(f => f.type === 'office' && !f.closedAtGameSeconds).length;
  const points = officeCount * 10;
  return {
    points,
    costReduction: Math.min(0.15, points * 0.005), // Up to 15% cost reduction
    contractBonus: Math.min(0.20, points * 0.007), // Up to 20% better contract payouts
    complianceBoost: Math.min(0.10, points * 0.003), // Up to 10% slower compliance decay
  };
};

// Asset definitions
export const ASSET_DEFS = {
  // Vehicles
  small_tipper: { kind: 'vehicle', name: 'Small Tipper', price: 35000, leaseDeposit: 5000, leaseWeekly: 350, capacity: 8 },
  large_tipper: { kind: 'vehicle', name: 'Large Tipper', price: 65000, leaseDeposit: 8000, leaseWeekly: 500, capacity: 16 },
  skip_truck: { kind: 'vehicle', name: 'Skip Truck', price: 85000, leaseDeposit: 12000, leaseWeekly: 650, capacity: 2 },
  grab_lorry: { kind: 'vehicle', name: 'Grab Lorry', price: 120000, leaseDeposit: 15000, leaseWeekly: 850, capacity: 12 },
  artic_unit: { kind: 'vehicle', name: 'Artic Unit', price: 95000, leaseDeposit: 12000, leaseWeekly: 700, capacity: 0 },
  // Trailers
  flatbed_trailer: { kind: 'trailer', name: 'Flatbed Trailer', price: 15000, leaseDeposit: 2000, leaseWeekly: 120, capacity: 20 },
  tipper_trailer: { kind: 'trailer', name: 'Tipper Trailer', price: 25000, leaseDeposit: 3500, leaseWeekly: 200, capacity: 25 },
  walking_floor: { kind: 'trailer', name: 'Walking Floor', price: 45000, leaseDeposit: 6000, leaseWeekly: 350, capacity: 30 },
  // Containers
  skip_8yd: { kind: 'container', name: '8 Yard Skip', price: 800, capacity: 4 },
  skip_12yd: { kind: 'container', name: '12 Yard Skip', price: 1200, capacity: 6 },
  skip_16yd: { kind: 'container', name: '16 Yard Skip', price: 1600, capacity: 8 },
  roro_20yd: { kind: 'container', name: '20 Yard RoRo', price: 3500, capacity: 10 },
  roro_40yd: { kind: 'container', name: '40 Yard RoRo', price: 5500, capacity: 20 },
};

// Staff hire costs and wages
export const STAFF_CONFIG = {
  driver: { hireCost: 2000, monthlyWage: 2800, maxHoursPerDay: 15 },
  site_manager: { hireCost: 3500, monthlyWage: 3500 },
  transport_manager: { hireCost: 4000, monthlyWage: 4200 },
  compliance_manager: { hireCost: 3000, monthlyWage: 3200 },
  yard_operative: { hireCost: 1800, monthlyWage: 2200 },
  machine_operator: { hireCost: 2200, monthlyWage: 2600 },
  weighbridge_clerk: { hireCost: 1500, monthlyWage: 2000 },
  mechanic: { hireCost: 2500, monthlyWage: 3000 },
  admin: { hireCost: 1600, monthlyWage: 2100 },
  regional_manager: { hireCost: 5000, monthlyWage: 5500 },
  loader_driver: { hireCost: 2100, monthlyWage: 2500 },
};

// Driver rest time required (10 hours)
export const DRIVER_REST_HOURS = 10;
export const DRIVER_MAX_HOURS = 15;

// Material prices
export const MATERIAL_PRICES = {
  sandstone: { sell: 25, buy: 20 },
  '6f2': { sell: 18, buy: 14 },
  type1: { sell: 22, buy: 18 },
  type2: { sell: 20, buy: 16 },
  general_waste: { sell: 15 },
  metal: { sell: 120, buy: 80 },
  plastic: { sell: 45, buy: 30 },
  paper: { sell: 30, buy: 20 },
  cardboard: { sell: 35, buy: 25 },
  rubble: { sell: 8 },
  topsoil: { sell: 28, buy: 22 },
  sand: { sell: 22, buy: 18 },
  gravel: { sell: 20, buy: 16 },
};

// Initial state factory
const createInitialGameState = (seed) => {
  const sites = generateUKSites(seed);
  
  return {
    seed,
    world: {
      year: 2026,
      dayOfYear: 1,
      secondsToday: 28800, // Start at 8:00 AM
      paused: true,
      totalGameSeconds: 28800,
      lastAutosaveGameSeconds: 0,
      lastMonthlyBill: null,
      lastWeeklyProcess: 0,
    },
    company: {
      cash: 100000, // £100,000 starting cash
      reputation: 50,
      ledger: [],
    },
    map: {
      sites,
      ownedSiteIds: {},
      siteOutcomes: {},
      selectedSiteId: null,
    },
    facilities: {
      facilities: {},
      depots: {},
    },
    staff: {
      staff: {},
    },
    assets: {
      physical: {},
    },
    shop: {
      ui: {
        tab: 'fleet',
        depotId: null,
        onlyThisDepot: false,
        search: '',
        sort: 'priceAsc',
        brand: 'ALL',
        sellMode: false,
      },
      upgrades: {
        byDepot: {},
      },
    },
    contracts: {
      byId: {},
      lastGeneratedGameSeconds: 0,
    },
    dispatch: {
      activeJobs: {},
      completedJobs: {},
    },
    marketplace: {
      prices: Object.fromEntries(
        Object.entries(MATERIAL_PRICES).map(([id, p]) => [id, { materialId: id, ...p }])
      ),
      inventoryTonnesByFacility: {},
      lastWeeklyPassiveIncomeWeekIndex: 0,
    },
    loans: {
      creditLine: {
        enabled: false,
        principalOwed: 0,
        interestRateMonthly: 0.02,
        penaltyInterestRateMonthly: 0.05,
        weeklyMinPayment: 500,
        lastWeeklyPaymentWeekIndex: 0,
        inPenalty: false,
      },
    },
    ui: {
      activeSaveSlotId: null,
      hasUnlockedGame: false,
      lastRoute: '/map',
      notifications: [],
    },
  };
};

// Save slot storage key
const SAVE_SLOTS_KEY = 'wasteTycoon_saveSlots';
const ACTIVE_SLOT_KEY = 'wasteTycoon_activeSlot';

// Load save slots from localStorage
const loadSaveSlots = () => {
  try {
    const data = localStorage.getItem(SAVE_SLOTS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

// Save slots to localStorage
const saveSlotsToStorage = (slots) => {
  localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
};

// Get active slot from localStorage
const getActiveSlot = () => {
  try {
    const data = localStorage.getItem(ACTIVE_SLOT_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Save active slot to localStorage
const saveActiveSlot = (slotId) => {
  localStorage.setItem(ACTIVE_SLOT_KEY, JSON.stringify(slotId));
};

// Generate staff name
const generateStaffName = () => {
  const firstNames = ['James', 'John', 'David', 'Michael', 'Chris', 'Sarah', 'Emma', 'Lisa', 'Karen', 'Michelle', 'Daniel', 'Mark', 'Paul', 'Andrew', 'Steven', 'Tom', 'Richard', 'Peter', 'Alan', 'Gary', 'Kevin', 'Brian', 'Colin', 'Derek', 'Ian'];
  const lastNames = ['Smith', 'Jones', 'Williams', 'Brown', 'Taylor', 'Davies', 'Wilson', 'Evans', 'Thomas', 'Roberts', 'Johnson', 'Walker', 'Wright', 'Robinson', 'Hall', 'Clarke', 'Green', 'Lewis', 'Harris', 'Martin', 'Jackson', 'Wood', 'Turner', 'Hill', 'Moore'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

// Generate vehicle plate
const generatePlate = () => {
  const letters = 'ABCDEFGHJKLMNPRSTUVWXYZ';
  const nums = '0123456789';
  let plate = '';
  plate += letters[Math.floor(Math.random() * letters.length)];
  plate += letters[Math.floor(Math.random() * letters.length)];
  plate += nums[Math.floor(Math.random() * nums.length)];
  plate += nums[Math.floor(Math.random() * nums.length)];
  plate += ' ';
  plate += letters[Math.floor(Math.random() * letters.length)];
  plate += letters[Math.floor(Math.random() * letters.length)];
  plate += letters[Math.floor(Math.random() * letters.length)];
  return plate;
};

export const useGameStore = create(
  immer((set, get) => ({
    // Current game state
    game: null,
    
    // Save slots metadata
    saveSlots: loadSaveSlots(),
    
    // Active save slot
    activeSlotId: getActiveSlot(),
    
    // Game speed multiplier
    speedMultiplier: 1,
    
    // Notifications queue
    notifications: [],
    
    // Add notification
    addNotification: (message, type = 'info') => {
      const id = uuidv4();
      set((state) => {
        state.notifications.push({ id, message, type, timestamp: Date.now() });
        // Keep only last 5
        if (state.notifications.length > 5) {
          state.notifications = state.notifications.slice(-5);
        }
      });
      // Auto-remove after 5 seconds
      setTimeout(() => {
        set((state) => {
          state.notifications = state.notifications.filter(n => n.id !== id);
        });
      }, 5000);
    },
    
    clearNotification: (id) => {
      set((state) => {
        state.notifications = state.notifications.filter(n => n.id !== id);
      });
    },
    
    // ========== SAVE SYSTEM ==========
    
    newGame: (slotId, name = `Save ${slotId}`) => {
      const seed = Date.now();
      const game = createInitialGameState(seed);
      
      const meta = {
        slotId,
        name,
        updatedAtIso: new Date().toISOString(),
        createdAtIso: new Date().toISOString(),
        buildVersion: '1.0.0',
        preview: {
          cash: game.company.cash,
          day: game.world.dayOfYear,
          year: game.world.year,
          hasFirstDepot: false,
        },
      };
      
      set((state) => {
        state.game = game;
        state.activeSlotId = slotId;
        state.saveSlots[slotId] = { meta, game };
      });
      
      saveSlotsToStorage(get().saveSlots);
      saveActiveSlot(slotId);
    },
    
    loadGame: (slotId) => {
      const slots = get().saveSlots;
      if (slots[slotId]) {
        set((state) => {
          state.game = JSON.parse(JSON.stringify(slots[slotId].game)); // Deep clone
          state.activeSlotId = slotId;
        });
        saveActiveSlot(slotId);
        return true;
      }
      return false;
    },
    
    saveGame: () => {
      const { game, activeSlotId, saveSlots } = get();
      if (!game || !activeSlotId) return;
      
      const hasFirstDepot = Object.keys(game.facilities.depots).length > 0;
      
      const meta = {
        ...saveSlots[activeSlotId]?.meta,
        slotId: activeSlotId,
        updatedAtIso: new Date().toISOString(),
        preview: {
          cash: game.company.cash,
          day: game.world.dayOfYear,
          year: game.world.year,
          hasFirstDepot,
        },
      };
      
      set((state) => {
        state.saveSlots[activeSlotId] = { meta, game: JSON.parse(JSON.stringify(state.game)) };
      });
      
      saveSlotsToStorage(get().saveSlots);
    },
    
    deleteSlot: (slotId) => {
      set((state) => {
        delete state.saveSlots[slotId];
        if (state.activeSlotId === slotId) {
          state.activeSlotId = null;
          state.game = null;
        }
      });
      saveSlotsToStorage(get().saveSlots);
      if (get().activeSlotId === null) {
        saveActiveSlot(null);
      }
    },
    
    renameSlot: (slotId, newName) => {
      set((state) => {
        if (state.saveSlots[slotId]) {
          state.saveSlots[slotId].meta.name = newName;
        }
      });
      saveSlotsToStorage(get().saveSlots);
    },
    
    // ========== TIME CONTROLS ==========
    
    togglePause: () => {
      set((state) => {
        if (state.game) {
          state.game.world.paused = !state.game.world.paused;
        }
      });
    },
    
    setPaused: (paused) => {
      set((state) => {
        if (state.game) {
          state.game.world.paused = paused;
        }
      });
    },
    
    setSpeed: (multiplier) => {
      set((state) => {
        state.speedMultiplier = multiplier;
      });
    },
    
    // Tick function called by SimRunner
    tick: (deltaMs) => {
      const { game, speedMultiplier, addNotification } = get();
      if (!game || game.world.paused) return;
      
      const deltaSeconds = (deltaMs / 1000) * speedMultiplier * 60; // 1 real second = 1 game minute at 1x
      
      set((state) => {
        const world = state.game.world;
        const prevDay = world.dayOfYear;
        
        world.totalGameSeconds += deltaSeconds;
        world.secondsToday += deltaSeconds;
        
        // Roll over to next day
        while (world.secondsToday >= 86400) {
          world.secondsToday -= 86400;
          world.dayOfYear += 1;
          
          // Roll over to next year
          const isLeapYear = (world.year % 4 === 0 && world.year % 100 !== 0) || (world.year % 400 === 0);
          const daysInYear = isLeapYear ? 366 : 365;
          
          if (world.dayOfYear > daysInYear) {
            world.dayOfYear = 1;
            world.year += 1;
          }
        }
        
        // === DAILY PROCESSES ===
        if (world.dayOfYear !== prevDay) {
          // Quarry production (500 t/day split 4 ways = 125t each)
          Object.values(state.game.facilities.facilities).forEach((facility) => {
            if (facility.type === 'quarry' && !facility.closedAtGameSeconds) {
              const production = 125; // 125t per material type per day
              const materials = ['sandstone', '6f2', 'type1', 'type2'];
              
              if (!state.game.marketplace.inventoryTonnesByFacility[facility.id]) {
                state.game.marketplace.inventoryTonnesByFacility[facility.id] = {};
              }
              
              materials.forEach((mat) => {
                const current = state.game.marketplace.inventoryTonnesByFacility[facility.id][mat] || 0;
                const maxCapacity = facility.capacityMax;
                const totalStored = Object.values(state.game.marketplace.inventoryTonnesByFacility[facility.id]).reduce((a, b) => a + b, 0);
                const canAdd = Math.min(production, maxCapacity - totalStored);
                if (canAdd > 0) {
                  state.game.marketplace.inventoryTonnesByFacility[facility.id][mat] = current + canAdd;
                }
              });
            }
          });
          
          // Staff rest reset
          Object.values(state.game.staff.staff).forEach((staff) => {
            staff.hoursWorkedToday = 0;
          });
        }
        
        // === WEEKLY PROCESSES ===
        const currentWeek = getWeekIndex(world.totalGameSeconds);
        if (currentWeek > world.lastWeeklyProcess) {
          world.lastWeeklyProcess = currentWeek;
          
          // Building supply passive income (£90k/week)
          Object.values(state.game.facilities.facilities).forEach((facility) => {
            if (facility.type === 'building_supply_store' && !facility.closedAtGameSeconds) {
              const income = 90000;
              state.game.company.cash += income;
              state.game.company.ledger.push({
                id: uuidv4(),
                atGameSeconds: world.totalGameSeconds,
                kind: 'passive_income',
                amount: income,
                label: `Building supply income - ${facility.name}`,
              });
            }
          });
          
          // Lease payments
          Object.values(state.game.assets.physical).forEach((asset) => {
            if (asset.isLeased && asset.lease) {
              if (asset.lease.lastChargedWeekIndex < currentWeek) {
                state.game.company.cash -= asset.lease.weeklyPayment;
                state.game.company.ledger.push({
                  id: uuidv4(),
                  atGameSeconds: world.totalGameSeconds,
                  kind: 'weekly_lease',
                  amount: -asset.lease.weeklyPayment,
                  label: `Lease payment - ${ASSET_DEFS[asset.defId]?.name || asset.defId}`,
                });
                asset.lease.lastChargedWeekIndex = currentWeek;
              }
            }
          });
          
          // Loan minimum payment check
          if (state.game.loans.creditLine.enabled && state.game.loans.creditLine.principalOwed > 0) {
            const loan = state.game.loans.creditLine;
            if (loan.lastWeeklyPaymentWeekIndex < currentWeek) {
              // Missed payment - apply penalty
              if (!loan.inPenalty) {
                loan.inPenalty = true;
                state.game.company.reputation = Math.max(0, state.game.company.reputation - 5);
              }
            }
          }
        }
        
        // === MONTHLY BILLING ===
        const gameDate = getGameDate(world);
        if (gameDate.getDate() === 1 && world.secondsToday < 3600) {
          const currentMonth = gameDate.getMonth();
          const currentYear = gameDate.getFullYear();
          
          if (!world.lastMonthlyBill || 
              world.lastMonthlyBill.year !== currentYear || 
              world.lastMonthlyBill.month !== currentMonth) {
            
            // Only bill after first month (Feb 2026+)
            if (currentYear > 2026 || (currentYear === 2026 && currentMonth >= 1)) {
              // Facility overhead
              let totalOverhead = 0;
              Object.values(state.game.facilities.facilities).forEach((facility) => {
                totalOverhead += facility.overheadPerWeek * 4;
              });
              
              if (totalOverhead > 0) {
                state.game.company.cash -= totalOverhead;
                state.game.company.ledger.push({
                  id: uuidv4(),
                  atGameSeconds: world.totalGameSeconds,
                  kind: 'monthly_overhead',
                  amount: -totalOverhead,
                  label: `Monthly overhead - ${gameDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`,
                });
              }
              
              // Staff wages
              let totalWages = 0;
              Object.values(state.game.staff.staff).forEach((staff) => {
                const config = STAFF_CONFIG[staff.role];
                if (config) {
                  totalWages += config.monthlyWage;
                }
              });
              
              if (totalWages > 0) {
                state.game.company.cash -= totalWages;
                state.game.company.ledger.push({
                  id: uuidv4(),
                  atGameSeconds: world.totalGameSeconds,
                  kind: 'monthly_overhead',
                  amount: -totalWages,
                  label: `Staff wages - ${gameDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`,
                });
              }
              
              // Loan interest
              if (state.game.loans.creditLine.enabled && state.game.loans.creditLine.principalOwed > 0) {
                const loan = state.game.loans.creditLine;
                const rate = loan.inPenalty ? loan.penaltyInterestRateMonthly : loan.interestRateMonthly;
                const interest = Math.round(loan.principalOwed * rate);
                loan.principalOwed += interest;
                
                state.game.company.ledger.push({
                  id: uuidv4(),
                  atGameSeconds: world.totalGameSeconds,
                  kind: 'loan_interest',
                  amount: -interest,
                  label: `Loan interest${loan.inPenalty ? ' (penalty rate)' : ''}`,
                });
              }
            }
            
            world.lastMonthlyBill = { year: currentYear, month: currentMonth };
          }
        }
        
        // Autosave every in-game hour
        if (world.totalGameSeconds - world.lastAutosaveGameSeconds >= 3600) {
          world.lastAutosaveGameSeconds = world.totalGameSeconds;
        }
      });
      
      // Trigger autosave if needed
      const newGame = get().game;
      if (newGame && newGame.world.totalGameSeconds - newGame.world.lastAutosaveGameSeconds < 60) {
        get().saveGame();
      }
    },
    
    // ========== MAP ACTIONS ==========
    
    selectSite: (siteId) => {
      set((state) => {
        if (state.game) {
          state.game.map.selectedSiteId = siteId;
        }
      });
    },
    
    buySite: (siteId, facilityType, facilitySize) => {
      const { game, addNotification } = get();
      if (!game) return { success: false, error: 'No active game' };
      
      const site = game.map.sites[siteId];
      if (!site) return { success: false, error: 'Site not found' };
      
      // Check if already owned
      if (game.map.ownedSiteIds[siteId]) {
        return { success: false, error: 'You already own a facility at this site' };
      }
      
      // Check if this is first purchase (must be Small Transport Depot)
      const hasDepot = Object.keys(game.facilities.depots).length > 0;
      if (!hasDepot) {
        if (facilityType !== 'transport_depot' || facilitySize !== 'small') {
          return { success: false, error: 'First purchase must be a Small Transport Depot' };
        }
        if (site.kind !== 'industrial_estate' || !site.tags?.includes('depot_available')) {
          return { success: false, error: 'First depot must be at an industrial estate with depot space' };
        }
      }
      
      // Get price based on facility type and size
      const prices = {
        transport_depot: { small: 50000, medium: 150000, large: 350000 },
        waste_yard: { small: 75000, medium: 200000, large: 500000 },
        mechanic_garage: { small: 40000, medium: 100000, large: 250000 },
        quarry: { small: 500000, medium: 1000000, large: 2000000 },
        trading_yard: { small: 60000, medium: 175000, large: 400000 },
        office: { small: 25000, medium: 75000, large: 200000 },
        building_supply_store: { small: 150000, medium: 300000, large: 600000 },
      };
      
      const price = prices[facilityType]?.[facilitySize];
      if (!price) return { success: false, error: 'Invalid facility type or size' };
      
      if (game.company.cash < price) {
        return { success: false, error: `Insufficient funds. Need ${formatCurrency(price)}` };
      }
      
      // Process purchase
      set((state) => {
        const facilityId = uuidv4();
        
        // Deduct cash
        state.game.company.cash -= price;
        
        // Add ledger entry
        state.game.company.ledger.push({
          id: uuidv4(),
          atGameSeconds: state.game.world.totalGameSeconds,
          kind: 'facility_purchase',
          amount: -price,
          label: `Purchased ${facilitySize} ${facilityType.replace(/_/g, ' ')} at ${site.name}`,
        });
        
        // Mark site as owned
        state.game.map.ownedSiteIds[siteId] = true;
        
        // Calculate overhead and capacity
        const overheadPerWeek = Math.round(price * 0.005);
        const capacities = {
          transport_depot: { small: 10, medium: 25, large: 50 },
          waste_yard: { small: 500, medium: 1500, large: 4000 },
          mechanic_garage: { small: 3, medium: 6, large: 12 },
          quarry: { small: 2000, medium: 5000, large: 10000 },
          trading_yard: { small: 300, medium: 800, large: 2000 },
          office: { small: 10, medium: 25, large: 50 },
          building_supply_store: { small: 200, medium: 500, large: 1000 },
        };
        const capacityMax = capacities[facilityType]?.[facilitySize] || 10;
        
        // Create facility
        state.game.facilities.facilities[facilityId] = {
          id: facilityId,
          siteId,
          type: facilityType,
          size: facilitySize,
          name: `${site.name} ${facilityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
          createdAtGameSeconds: state.game.world.totalGameSeconds,
          purchasePrice: price,
          overheadPerWeek,
          capacityKind: ['transport_depot', 'mechanic_garage'].includes(facilityType) ? 'units' : 'tonnes',
          capacityMax,
          tonnesStored: 0,
          storageUnitsUsed: 0,
          baysUsed: 0,
          compliance: 100,
          complianceManagerHiredAtGameSeconds: null,
          closedAtGameSeconds: null,
          requiredStaff: facilityType === 'transport_depot' ? { site_manager: 1 } : 
                         facilityType === 'quarry' ? { site_manager: 1, machine_operator: 2 } :
                         facilityType === 'mechanic_garage' ? { mechanic: 1 } : {},
        };
        
        // If it's a depot, create depot record
        if (facilityType === 'transport_depot') {
          state.game.facilities.depots[facilityId] = {
            id: facilityId,
            facilityId,
            name: `${site.name} Depot`,
            storageMax: capacityMax,
          };
          
          // Unlock the game on first depot
          if (!state.game.ui.hasUnlockedGame) {
            state.game.ui.hasUnlockedGame = true;
          }
        }
      });
      
      addNotification(`Purchased ${facilityType.replace(/_/g, ' ')} at ${site.name}!`, 'success');
      get().saveGame();
      return { success: true };
    },
    
    // ========== FACILITY ACTIONS ==========
    
    renameFacility: (facilityId, newName) => {
      set((state) => {
        if (state.game?.facilities.facilities[facilityId]) {
          state.game.facilities.facilities[facilityId].name = newName;
          if (state.game.facilities.depots[facilityId]) {
            state.game.facilities.depots[facilityId].name = newName;
          }
        }
      });
      get().saveGame();
    },
    
    // ========== STAFF ACTIONS ==========
    
    hireStaff: (facilityId, role) => {
      const { game, addNotification } = get();
      if (!game) return { success: false, error: 'No active game' };
      
      const config = STAFF_CONFIG[role];
      if (!config) return { success: false, error: 'Unknown staff role' };
      
      if (game.company.cash < config.hireCost) {
        return { success: false, error: `Insufficient funds. Need ${formatCurrency(config.hireCost)}` };
      }
      
      set((state) => {
        const staffId = uuidv4();
        
        state.game.company.cash -= config.hireCost;
        
        state.game.staff.staff[staffId] = {
          id: staffId,
          name: generateStaffName(),
          role,
          facilityId,
          hiredAtGameSeconds: state.game.world.totalGameSeconds,
          hoursWorkedToday: 0,
          restUntilGameSeconds: 0,
        };
        
        state.game.company.ledger.push({
          id: uuidv4(),
          atGameSeconds: state.game.world.totalGameSeconds,
          kind: 'other',
          amount: -config.hireCost,
          label: `Hired ${role.replace(/_/g, ' ')}`,
        });
      });
      
      addNotification(`Hired new ${role.replace(/_/g, ' ')}!`, 'success');
      get().saveGame();
      return { success: true };
    },
    
    fireStaff: (staffId) => {
      const { addNotification } = get();
      set((state) => {
        if (state.game?.staff.staff[staffId]) {
          const staff = state.game.staff.staff[staffId];
          addNotification(`${staff.name} has been dismissed.`, 'info');
          delete state.game.staff.staff[staffId];
        }
      });
      get().saveGame();
    },
    
    // ========== SHOP ACTIONS ==========
    
    setShopTab: (tab) => {
      set((state) => {
        if (state.game) {
          state.game.shop.ui.tab = tab;
        }
      });
    },
    
    setShopDepot: (depotId) => {
      set((state) => {
        if (state.game) {
          state.game.shop.ui.depotId = depotId;
        }
      });
    },
    
    buyAsset: (defId, depotId, isLeased = false) => {
      const { game, addNotification } = get();
      if (!game) return { success: false, error: 'No active game' };
      
      const def = ASSET_DEFS[defId];
      if (!def) return { success: false, error: 'Unknown asset type' };
      
      const cost = isLeased ? def.leaseDeposit : def.price;
      if (!cost) return { success: false, error: 'This item cannot be leased' };
      
      if (game.company.cash < cost) {
        return { success: false, error: `Insufficient funds. Need ${formatCurrency(cost)}` };
      }
      
      // Check depot capacity
      const depot = game.facilities.depots[depotId];
      if (!depot) return { success: false, error: 'Invalid depot' };
      
      const currentUsage = Object.values(game.assets.physical).filter(a => a.depotId === depotId).length;
      if (currentUsage >= depot.storageMax) {
        return { success: false, error: 'Depot storage is full' };
      }
      
      set((state) => {
        const assetId = uuidv4();
        const gameDay = Math.floor(state.game.world.totalGameSeconds / 86400);
        
        state.game.company.cash -= cost;
        
        state.game.assets.physical[assetId] = {
          id: assetId,
          kind: def.kind,
          defId,
          depotId,
          createdDay: gameDay,
          deliveredDay: gameDay,
          isLeased,
          lease: isLeased ? {
            depositPaid: def.leaseDeposit,
            weeklyPayment: def.leaseWeekly,
            lastChargedWeekIndex: getWeekIndex(state.game.world.totalGameSeconds),
          } : undefined,
          plate: def.kind === 'vehicle' ? generatePlate() : undefined,
          condition: def.kind === 'vehicle' ? 100 : undefined,
        };
        
        state.game.company.ledger.push({
          id: uuidv4(),
          atGameSeconds: state.game.world.totalGameSeconds,
          kind: isLeased ? 'other' : 'asset_purchase',
          amount: -cost,
          label: isLeased ? `Lease deposit - ${def.name}` : `Purchased ${def.name}`,
        });
      });
      
      addNotification(`${isLeased ? 'Leased' : 'Purchased'} ${def.name}!`, 'success');
      get().saveGame();
      return { success: true };
    },
    
    sellAsset: (assetId) => {
      const { game, addNotification } = get();
      if (!game) return { success: false, error: 'No active game' };
      
      const asset = game.assets.physical[assetId];
      if (!asset) return { success: false, error: 'Asset not found' };
      
      if (asset.isLeased) {
        return { success: false, error: 'Cannot sell leased assets' };
      }
      
      const def = ASSET_DEFS[asset.defId];
      const sellPrice = Math.round(def.price * 0.6 * (asset.condition || 100) / 100);
      
      set((state) => {
        state.game.company.cash += sellPrice;
        delete state.game.assets.physical[assetId];
        
        state.game.company.ledger.push({
          id: uuidv4(),
          atGameSeconds: state.game.world.totalGameSeconds,
          kind: 'asset_sale',
          amount: sellPrice,
          label: `Sold ${def.name}`,
        });
      });
      
      addNotification(`Sold ${def.name} for ${formatCurrency(sellPrice)}`, 'success');
      get().saveGame();
      return { success: true };
    },
    
    // ========== REPAIR ACTIONS ==========
    
    startRepair: (vehicleId) => {
      const { game, addNotification } = get();
      if (!game) return { success: false, error: 'No active game' };
      
      const vehicle = game.assets.physical[vehicleId];
      if (!vehicle || vehicle.kind !== 'vehicle') {
        return { success: false, error: 'Vehicle not found' };
      }
      
      if (vehicle.inRepair) {
        return { success: false, error: 'Vehicle already in repair' };
      }
      
      // Check for mechanic access
      const hasMechanic = Object.values(game.facilities.facilities).some(f => 
        f.type === 'mechanic_garage' && !f.closedAtGameSeconds
      );
      
      if (!hasMechanic) {
        return { success: false, error: 'No mechanic garage available' };
      }
      
      // Repair cost: £50 per condition point to restore
      const pointsToRepair = 100 - vehicle.condition;
      const repairCost = pointsToRepair * 50;
      const repairTime = pointsToRepair * 60; // 1 minute per point
      
      if (game.company.cash < repairCost) {
        return { success: false, error: `Insufficient funds. Need ${formatCurrency(repairCost)}` };
      }
      
      set((state) => {
        const v = state.game.assets.physical[vehicleId];
        state.game.company.cash -= repairCost;
        v.inRepair = {
          startedAtGameSeconds: state.game.world.totalGameSeconds,
          completesAtGameSeconds: state.game.world.totalGameSeconds + repairTime,
          repairCost,
        };
        
        state.game.company.ledger.push({
          id: uuidv4(),
          atGameSeconds: state.game.world.totalGameSeconds,
          kind: 'other',
          amount: -repairCost,
          label: `Vehicle repair - ${v.plate}`,
        });
      });
      
      addNotification(`Repair started for ${vehicle.plate}`, 'info');
      get().saveGame();
      return { success: true };
    },
    
    // Process repairs (called by SimRunner)
    processRepairs: () => {
      const { game, addNotification } = get();
      if (!game) return;
      
      const currentTime = game.world.totalGameSeconds;
      
      set((state) => {
        Object.values(state.game.assets.physical).forEach((asset) => {
          if (asset.inRepair && asset.inRepair.completesAtGameSeconds <= currentTime) {
            asset.condition = 100;
            delete asset.inRepair;
          }
        });
      });
    },
    
    // ========== CONTRACT ACTIONS ==========
    
    generateContracts: (count = 8) => {
      const { game } = get();
      if (!game) return;
      
      set((state) => {
        const contractTypes = ['skip_hire', 'grab_collection', 'work_haulage'];
        const sites = Object.values(state.game.map.sites);
        
        for (let i = 0; i < count; i++) {
          const contractId = uuidv4();
          const type = contractTypes[Math.floor(Math.random() * contractTypes.length)];
          
          const payouts = {
            skip_hire: { base: 150, variance: 150 },
            grab_collection: { base: 350, variance: 250 },
            work_haulage: { base: 500, variance: 400 },
          };
          
          const payout = payouts[type].base + Math.floor(Math.random() * payouts[type].variance);
          const pickupSite = sites[Math.floor(Math.random() * sites.length)];
          const dropoffSite = sites[Math.floor(Math.random() * sites.length)];
          
          state.game.contracts.byId[contractId] = {
            id: contractId,
            type,
            status: 'available',
            title: `${type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} #${Math.floor(Math.random() * 9000) + 1000}`,
            description: type === 'skip_hire' ? 'Deliver and collect skip container' :
                        type === 'grab_collection' ? 'Collect loose waste material' :
                        'Transport materials to site',
            createdAtGameSeconds: state.game.world.totalGameSeconds,
            payout,
            penaltyOnCancel: Math.round(payout * 0.25),
            repHitOnFail: 5,
            requirements: {
              requiresDriver: true,
              requiresVehicleType: type === 'skip_hire' ? 'skip_truck' : 
                                  type === 'grab_collection' ? 'grab_lorry' : undefined,
              requiresContainerType: type === 'skip_hire' ? 'skip' : undefined,
            },
            pickupSiteId: pickupSite?.id,
            dropoffSiteId: dropoffSite?.id,
            tonnes: type === 'work_haulage' ? 10 + Math.floor(Math.random() * 20) : undefined,
          };
        }
        
        state.game.contracts.lastGeneratedGameSeconds = state.game.world.totalGameSeconds;
      });
    },
    
    acceptContract: (contractId) => {
      const { addNotification } = get();
      set((state) => {
        if (state.game?.contracts.byId[contractId]) {
          state.game.contracts.byId[contractId].status = 'accepted';
          state.game.contracts.byId[contractId].acceptedAtGameSeconds = state.game.world.totalGameSeconds;
        }
      });
      addNotification('Contract accepted!', 'success');
      get().saveGame();
    },
    
    cancelContract: (contractId) => {
      const { game, addNotification } = get();
      if (!game) return;
      
      const contract = game.contracts.byId[contractId];
      if (!contract || contract.status !== 'accepted') return;
      
      set((state) => {
        state.game.contracts.byId[contractId].status = 'cancelled';
        state.game.company.cash -= contract.penaltyOnCancel;
        state.game.company.reputation = Math.max(0, state.game.company.reputation - contract.repHitOnFail);
        
        state.game.company.ledger.push({
          id: uuidv4(),
          atGameSeconds: state.game.world.totalGameSeconds,
          kind: 'penalty',
          amount: -contract.penaltyOnCancel,
          label: `Contract cancellation penalty`,
        });
      });
      
      addNotification(`Contract cancelled. Penalty: ${formatCurrency(contract.penaltyOnCancel)}`, 'warning');
      get().saveGame();
    },
    
    // ========== DISPATCH ACTIONS ==========
    
    createDispatchJob: (contractId, driverId, vehicleId, trailerId = null, containerId = null) => {
      const { game, addNotification } = get();
      if (!game) return { success: false, error: 'No active game' };
      
      const contract = game.contracts.byId[contractId];
      if (!contract || contract.status !== 'accepted') {
        return { success: false, error: 'Contract not accepted' };
      }
      
      const driver = game.staff.staff[driverId];
      if (!driver || driver.role !== 'driver') {
        return { success: false, error: 'Valid driver required' };
      }
      
      // Check if driver is available
      if (Object.values(game.dispatch.activeJobs).some(j => j.driverId === driverId)) {
        return { success: false, error: 'Driver is already on a job' };
      }
      
      const vehicle = game.assets.physical[vehicleId];
      if (!vehicle || vehicle.kind !== 'vehicle') {
        return { success: false, error: 'Valid vehicle required' };
      }
      
      if (vehicle.condition < 10) {
        return { success: false, error: 'Vehicle condition too low (min 10%). Repair first.' };
      }
      
      if (vehicle.inRepair) {
        return { success: false, error: 'Vehicle is in repair' };
      }
      
      // Check if vehicle is available
      if (Object.values(game.dispatch.activeJobs).some(j => j.vehicleAssetId === vehicleId)) {
        return { success: false, error: 'Vehicle is already on a job' };
      }
      
      set((state) => {
        const jobId = uuidv4();
        const distanceKm = 20 + Math.floor(Math.random() * 80); // 20-100km
        const durationSeconds = distanceKm * 90; // ~1.5 min per km at game speed
        
        state.game.dispatch.activeJobs[jobId] = {
          id: jobId,
          contractId,
          status: 'en_route_pickup',
          driverId,
          vehicleAssetId: vehicleId,
          trailerAssetId: trailerId || undefined,
          containerAssetId: containerId || undefined,
          startedAtGameSeconds: state.game.world.totalGameSeconds,
          completesAtGameSeconds: state.game.world.totalGameSeconds + durationSeconds,
          distanceKm,
          conditionWear: Math.ceil(distanceKm * 0.15), // 0.15% per km
        };
        
        state.game.contracts.byId[contractId].status = 'in_progress';
      });
      
      addNotification(`Job dispatched: ${contract.title}`, 'success');
      get().saveGame();
      return { success: true };
    },
    
    // Process dispatch jobs (called by SimRunner)
    processDispatchJobs: () => {
      const { game, addNotification } = get();
      if (!game) return;
      
      const currentTime = game.world.totalGameSeconds;
      const completedIds = [];
      
      Object.values(game.dispatch.activeJobs).forEach((job) => {
        if (job.completesAtGameSeconds <= currentTime && job.status !== 'completed') {
          completedIds.push(job.id);
        }
      });
      
      if (completedIds.length > 0) {
        set((state) => {
          completedIds.forEach((jobId) => {
            const job = state.game.dispatch.activeJobs[jobId];
            if (!job) return;
            
            job.status = 'completed';
            
            // Move to completed
            state.game.dispatch.completedJobs[jobId] = { ...job };
            delete state.game.dispatch.activeJobs[jobId];
            
            // Complete the contract
            const contract = state.game.contracts.byId[job.contractId];
            if (contract) {
              contract.status = 'completed';
              contract.completedAtGameSeconds = currentTime;
              
              // Pay out
              state.game.company.cash += contract.payout;
              state.game.company.reputation = Math.min(100, state.game.company.reputation + 1);
              
              state.game.company.ledger.push({
                id: uuidv4(),
                atGameSeconds: currentTime,
                kind: 'contract_income',
                amount: contract.payout,
                label: `Completed: ${contract.title}`,
              });
            }
            
            // Apply vehicle wear
            const vehicle = state.game.assets.physical[job.vehicleAssetId];
            if (vehicle && vehicle.condition !== undefined) {
              vehicle.condition = Math.max(0, vehicle.condition - job.conditionWear);
            }
          });
        });
        
        completedIds.forEach(() => {
          addNotification('Job completed! Payment received.', 'success');
        });
      }
    },
    
    // ========== LOAN ACTIONS ==========
    
    takeLoan: (amount) => {
      const { game, addNotification } = get();
      if (!game) return { success: false, error: 'No active game' };
      
      if (amount < 10000 || amount > 500000) {
        return { success: false, error: 'Loan amount must be between £10,000 and £500,000' };
      }
      
      set((state) => {
        state.game.loans.creditLine.enabled = true;
        state.game.loans.creditLine.principalOwed += amount;
        state.game.company.cash += amount;
        
        state.game.company.ledger.push({
          id: uuidv4(),
          atGameSeconds: state.game.world.totalGameSeconds,
          kind: 'other',
          amount: amount,
          label: `Loan received`,
        });
      });
      
      addNotification(`Loan of ${formatCurrency(amount)} received!`, 'success');
      get().saveGame();
      return { success: true };
    },
    
    repayLoan: (amount) => {
      const { game, addNotification } = get();
      if (!game) return { success: false, error: 'No active game' };
      
      const loan = game.loans.creditLine;
      if (!loan.enabled || loan.principalOwed <= 0) {
        return { success: false, error: 'No loan to repay' };
      }
      
      const actualPayment = Math.min(amount, loan.principalOwed, game.company.cash);
      if (actualPayment < 500 && loan.principalOwed >= 500) {
        return { success: false, error: 'Minimum payment is £500' };
      }
      
      set((state) => {
        state.game.company.cash -= actualPayment;
        state.game.loans.creditLine.principalOwed -= actualPayment;
        state.game.loans.creditLine.lastWeeklyPaymentWeekIndex = getWeekIndex(state.game.world.totalGameSeconds);
        
        if (state.game.loans.creditLine.principalOwed <= 0) {
          state.game.loans.creditLine.enabled = false;
          state.game.loans.creditLine.inPenalty = false;
        } else if (actualPayment >= 500) {
          state.game.loans.creditLine.inPenalty = false;
        }
        
        state.game.company.ledger.push({
          id: uuidv4(),
          atGameSeconds: state.game.world.totalGameSeconds,
          kind: 'loan_payment',
          amount: -actualPayment,
          label: `Loan repayment`,
        });
      });
      
      addNotification(`Repaid ${formatCurrency(actualPayment)} on loan.`, 'success');
      get().saveGame();
      return { success: true };
    },
    
    // ========== MARKETPLACE ACTIONS ==========
    
    sellMaterial: (facilityId, materialId, tonnes) => {
      const { game, addNotification } = get();
      if (!game) return { success: false, error: 'No active game' };
      
      const inventory = game.marketplace.inventoryTonnesByFacility[facilityId];
      if (!inventory || !inventory[materialId] || inventory[materialId] < tonnes) {
        return { success: false, error: 'Insufficient material in inventory' };
      }
      
      const price = game.marketplace.prices[materialId]?.sell || 0;
      const totalValue = tonnes * price;
      
      set((state) => {
        state.game.marketplace.inventoryTonnesByFacility[facilityId][materialId] -= tonnes;
        state.game.company.cash += totalValue;
        
        state.game.company.ledger.push({
          id: uuidv4(),
          atGameSeconds: state.game.world.totalGameSeconds,
          kind: 'contract_income',
          amount: totalValue,
          label: `Sold ${tonnes}t of ${materialId}`,
        });
      });
      
      addNotification(`Sold ${tonnes}t for ${formatCurrency(totalValue)}!`, 'success');
      get().saveGame();
      return { success: true };
    },
  }))
);

export default useGameStore;
