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
    },
    dispatch: {
      activeJobs: {},
      completedJobs: {},
    },
    marketplace: {
      prices: {
        sandstone: { materialId: 'sandstone', sell: 25 },
        '6f2': { materialId: '6f2', sell: 18 },
        type1: { materialId: 'type1', sell: 22 },
        type2: { materialId: 'type2', sell: 20 },
        general_waste: { materialId: 'general_waste', sell: 15 },
        metal: { materialId: 'metal', sell: 120 },
        plastic: { materialId: 'plastic', sell: 45 },
        paper: { materialId: 'paper', sell: 30 },
        cardboard: { materialId: 'cardboard', sell: 35 },
        rubble: { materialId: 'rubble', sell: 8 },
        topsoil: { materialId: 'topsoil', sell: 28 },
        sand: { materialId: 'sand', sell: 22 },
        gravel: { materialId: 'gravel', sell: 20 },
      },
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
          state.game = slots[slotId].game;
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
        state.saveSlots[activeSlotId] = { meta, game: state.game };
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
    
    setSpeed: (multiplier) => {
      set((state) => {
        state.speedMultiplier = multiplier;
      });
    },
    
    // Tick function called by SimRunner
    tick: (deltaMs) => {
      const { game, speedMultiplier } = get();
      if (!game || game.world.paused) return;
      
      const deltaSeconds = (deltaMs / 1000) * speedMultiplier * 60; // 1 real second = 1 game minute at 1x
      
      set((state) => {
        const world = state.game.world;
        
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
        
        // Check for monthly billing
        const gameDate = getGameDate(world);
        if (gameDate.getDate() === 1 && world.secondsToday < 3600) {
          const currentMonth = gameDate.getMonth();
          const currentYear = gameDate.getFullYear();
          
          if (!world.lastMonthlyBill || 
              world.lastMonthlyBill.year !== currentYear || 
              world.lastMonthlyBill.month !== currentMonth) {
            // Process monthly bills
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
            
            world.lastMonthlyBill = { year: currentYear, month: currentMonth };
          }
        }
        
        // Autosave every in-game hour
        if (world.totalGameSeconds - world.lastAutosaveGameSeconds >= 3600) {
          world.lastAutosaveGameSeconds = world.totalGameSeconds;
          // Trigger autosave (will be called after this tick)
        }
      });
      
      // Check if autosave needed
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
      const { game } = get();
      if (!game) return { success: false, error: 'No active game' };
      
      const site = game.map.sites[siteId];
      if (!site) return { success: false, error: 'Site not found' };
      
      // Check if this is first purchase (must be Small Transport Depot)
      const hasDepot = Object.keys(game.facilities.depots).length > 0;
      if (!hasDepot) {
        if (facilityType !== 'transport_depot' || facilitySize !== 'small') {
          return { success: false, error: 'First purchase must be a Small Transport Depot' };
        }
        if (site.kind !== 'industrial_estate') {
          return { success: false, error: 'First depot must be on an industrial estate' };
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
        return { success: false, error: 'Insufficient funds' };
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
        
        // Create facility
        const overheadPerWeek = Math.round(price * 0.005); // 0.5% of purchase price per week
        const capacityMax = facilitySize === 'small' ? 10 : facilitySize === 'medium' ? 25 : 50;
        
        state.game.facilities.facilities[facilityId] = {
          id: facilityId,
          siteId,
          type: facilityType,
          size: facilitySize,
          name: `${site.name} ${facilityType.replace(/_/g, ' ')}`,
          createdAtGameSeconds: state.game.world.totalGameSeconds,
          purchasePrice: price,
          overheadPerWeek,
          capacityKind: facilityType === 'transport_depot' ? 'units' : 'tonnes',
          capacityMax,
          tonnesStored: 0,
          storageUnitsUsed: 0,
          baysUsed: 0,
          compliance: 100,
          complianceManagerHiredAtGameSeconds: null,
          closedAtGameSeconds: null,
          requiredStaff: facilityType === 'transport_depot' ? { site_manager: 1 } : {},
        };
        
        // If it's a depot, create depot record
        if (facilityType === 'transport_depot') {
          state.game.facilities.depots[facilityId] = {
            id: facilityId,
            facilityId,
            name: `${site.name} Depot`,
            storageMax: capacityMax,
          };
          
          // Unlock the game
          state.game.ui.hasUnlockedGame = true;
        }
      });
      
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
      const { game } = get();
      if (!game) return { success: false, error: 'No active game' };
      
      const hireCosts = {
        driver: 2000,
        site_manager: 3500,
        transport_manager: 4000,
        compliance_manager: 3000,
        yard_operative: 1800,
        machine_operator: 2200,
        weighbridge_clerk: 1500,
        mechanic: 2500,
        admin: 1600,
        regional_manager: 5000,
        loader_driver: 2100,
      };
      
      const cost = hireCosts[role] || 2000;
      
      if (game.company.cash < cost) {
        return { success: false, error: 'Insufficient funds for hiring' };
      }
      
      set((state) => {
        const staffId = uuidv4();
        
        state.game.company.cash -= cost;
        
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
          amount: -cost,
          label: `Hired ${role.replace(/_/g, ' ')}`,
        });
      });
      
      get().saveGame();
      return { success: true };
    },
    
    fireStaff: (staffId) => {
      set((state) => {
        if (state.game?.staff.staff[staffId]) {
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
      const { game } = get();
      if (!game) return { success: false, error: 'No active game' };
      
      // Asset definitions
      const assetDefs = {
        // Vehicles
        small_tipper: { kind: 'vehicle', name: 'Small Tipper', price: 35000, leaseDeposit: 5000, leaseWeekly: 350 },
        large_tipper: { kind: 'vehicle', name: 'Large Tipper', price: 65000, leaseDeposit: 8000, leaseWeekly: 500 },
        skip_truck: { kind: 'vehicle', name: 'Skip Truck', price: 85000, leaseDeposit: 12000, leaseWeekly: 650 },
        grab_lorry: { kind: 'vehicle', name: 'Grab Lorry', price: 120000, leaseDeposit: 15000, leaseWeekly: 850 },
        artic_unit: { kind: 'vehicle', name: 'Artic Unit', price: 95000, leaseDeposit: 12000, leaseWeekly: 700 },
        // Trailers
        flatbed_trailer: { kind: 'trailer', name: 'Flatbed Trailer', price: 15000, leaseDeposit: 2000, leaseWeekly: 120 },
        tipper_trailer: { kind: 'trailer', name: 'Tipper Trailer', price: 25000, leaseDeposit: 3500, leaseWeekly: 200 },
        walking_floor: { kind: 'trailer', name: 'Walking Floor Trailer', price: 45000, leaseDeposit: 6000, leaseWeekly: 350 },
        // Containers
        skip_8yd: { kind: 'container', name: '8 Yard Skip', price: 800 },
        skip_12yd: { kind: 'container', name: '12 Yard Skip', price: 1200 },
        skip_16yd: { kind: 'container', name: '16 Yard Skip', price: 1600 },
        roro_20yd: { kind: 'container', name: '20 Yard RoRo', price: 3500 },
        roro_40yd: { kind: 'container', name: '40 Yard RoRo', price: 5500 },
      };
      
      const def = assetDefs[defId];
      if (!def) return { success: false, error: 'Unknown asset type' };
      
      const cost = isLeased ? def.leaseDeposit : def.price;
      if (game.company.cash < cost) {
        return { success: false, error: 'Insufficient funds' };
      }
      
      // Check depot capacity
      const depot = game.facilities.depots[depotId];
      if (!depot) return { success: false, error: 'Invalid depot' };
      
      const currentUsage = Object.values(game.assets.physical).filter(a => a.depotId === depotId).length;
      if (currentUsage >= depot.storageMax) {
        return { success: false, error: 'Depot at capacity' };
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
            lastChargedWeekIndex: Math.floor(gameDay / 7),
          } : undefined,
          plate: def.kind === 'vehicle' ? generatePlate() : undefined,
          condition: def.kind === 'vehicle' ? 100 : undefined,
        };
        
        state.game.company.ledger.push({
          id: uuidv4(),
          atGameSeconds: state.game.world.totalGameSeconds,
          kind: isLeased ? 'other' : 'asset_purchase',
          amount: -cost,
          label: isLeased ? `Lease deposit for ${def.name}` : `Purchased ${def.name}`,
        });
      });
      
      get().saveGame();
      return { success: true };
    },
    
    // ========== CONTRACT ACTIONS ==========
    
    generateContracts: () => {
      set((state) => {
        if (!state.game) return;
        
        // Generate some random contracts
        const contractTypes = ['skip_hire', 'grab_collection', 'work_haulage'];
        
        for (let i = 0; i < 5; i++) {
          const contractId = uuidv4();
          const type = contractTypes[Math.floor(Math.random() * contractTypes.length)];
          
          const payouts = {
            skip_hire: { base: 150, variance: 100 },
            grab_collection: { base: 350, variance: 200 },
            work_haulage: { base: 500, variance: 300 },
          };
          
          const payout = payouts[type].base + Math.floor(Math.random() * payouts[type].variance);
          
          state.game.contracts.byId[contractId] = {
            id: contractId,
            type,
            status: 'available',
            title: `${type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Job #${Math.floor(Math.random() * 9000) + 1000}`,
            description: `Standard ${type.replace(/_/g, ' ')} operation`,
            createdAtGameSeconds: state.game.world.totalGameSeconds,
            payout,
            penaltyOnCancel: Math.round(payout * 0.2),
            repHitOnFail: 5,
            requirements: {
              requiresDriver: true,
              requiresVehicleType: type === 'skip_hire' ? 'skip_truck' : type === 'grab_collection' ? 'grab_lorry' : undefined,
            },
          };
        }
      });
    },
    
    acceptContract: (contractId) => {
      set((state) => {
        if (state.game?.contracts.byId[contractId]) {
          state.game.contracts.byId[contractId].status = 'accepted';
          state.game.contracts.byId[contractId].acceptedAtGameSeconds = state.game.world.totalGameSeconds;
        }
      });
      get().saveGame();
    },
    
    cancelContract: (contractId) => {
      const { game } = get();
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
      
      get().saveGame();
    },
    
    // ========== DISPATCH ACTIONS ==========
    
    createDispatchJob: (contractId, driverId, vehicleId, trailerId, containerId) => {
      const { game } = get();
      if (!game) return { success: false, error: 'No active game' };
      
      const contract = game.contracts.byId[contractId];
      if (!contract || contract.status !== 'accepted') {
        return { success: false, error: 'Contract not accepted' };
      }
      
      const driver = game.staff.staff[driverId];
      if (!driver || driver.role !== 'driver') {
        return { success: false, error: 'Valid driver required' };
      }
      
      const vehicle = game.assets.physical[vehicleId];
      if (!vehicle || vehicle.kind !== 'vehicle') {
        return { success: false, error: 'Valid vehicle required' };
      }
      
      if (vehicle.condition < 10) {
        return { success: false, error: 'Vehicle condition too low (min 10%)' };
      }
      
      set((state) => {
        const jobId = uuidv4();
        const distanceKm = 20 + Math.floor(Math.random() * 80); // 20-100km
        const durationSeconds = distanceKm * 120; // ~2 min per km
        
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
          conditionWear: Math.ceil(distanceKm * 0.1), // 0.1% per km
        };
        
        state.game.contracts.byId[contractId].status = 'in_progress';
      });
      
      get().saveGame();
      return { success: true };
    },
    
    // Check and complete dispatch jobs (called by SimRunner)
    processDispatchJobs: () => {
      const { game } = get();
      if (!game) return;
      
      const currentTime = game.world.totalGameSeconds;
      
      set((state) => {
        Object.values(state.game.dispatch.activeJobs).forEach((job) => {
          if (job.completesAtGameSeconds <= currentTime && job.status !== 'completed') {
            // Complete the job
            job.status = 'completed';
            
            // Move to completed
            state.game.dispatch.completedJobs[job.id] = { ...job };
            delete state.game.dispatch.activeJobs[job.id];
            
            // Complete the contract
            const contract = state.game.contracts.byId[job.contractId];
            if (contract) {
              contract.status = 'completed';
              contract.completedAtGameSeconds = currentTime;
              
              // Pay out
              state.game.company.cash += contract.payout;
              state.game.company.ledger.push({
                id: uuidv4(),
                atGameSeconds: currentTime,
                kind: 'contract_income',
                amount: contract.payout,
                label: `Contract completed: ${contract.title}`,
              });
            }
            
            // Apply vehicle wear
            const vehicle = state.game.assets.physical[job.vehicleAssetId];
            if (vehicle && vehicle.condition !== undefined) {
              vehicle.condition = Math.max(0, vehicle.condition - job.conditionWear);
            }
          }
        });
      });
    },
  }))
);

// Helper functions
function generateStaffName() {
  const firstNames = ['James', 'John', 'David', 'Michael', 'Chris', 'Sarah', 'Emma', 'Lisa', 'Karen', 'Michelle', 'Daniel', 'Mark', 'Paul', 'Andrew', 'Steven'];
  const lastNames = ['Smith', 'Jones', 'Williams', 'Brown', 'Taylor', 'Davies', 'Wilson', 'Evans', 'Thomas', 'Roberts', 'Johnson', 'Walker', 'Wright', 'Robinson', 'Hall'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function generatePlate() {
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
}

export default useGameStore;
