/*
  Waste Tycoon — authoritative data schema
  These types define:
  - runtime game state
  - save slot files (5 slots)
  - all core systems: world time, map sites, facilities, staff, assets, shop, contracts, dispatch, marketplace, loans
*/

export type SaveSlotId = 1 | 2 | 3 | 4 | 5;

export type SaveSlotMeta = {
  slotId: SaveSlotId;
  name: string;
  updatedAtIso: string;
  createdAtIso: string;
  buildVersion: string;
  preview: {
    cash: number;
    day: number;
    year: number;
    hasFirstDepot: boolean;
  };
};

export type SaveSlotFile = {
  meta: SaveSlotMeta;
  game: SaveGame;
};

export type SaveGame = {
  seed: number;

  world: WorldState;
  company: CompanyState;

  map: MapState;

  facilities: FacilitiesState;
  staff: StaffState;

  assets: AssetsState;
  shop: ShopState;

  contracts: ContractsState;
  dispatch: DispatchState;

  marketplace: MarketplaceState;
  loans: LoansState;

  ui?: UIState;
};

// ---------------- World / Time ----------------

export type WorldState = {
  year: number;           // starts 2026
  dayOfYear: number;      // 1..365/366
  secondsToday: number;   // 0..86399

  paused: boolean;

  // bookkeeping
  totalGameSeconds: number;
  lastAutosaveGameSeconds: number;
  lastMonthlyBill: { year: number; month: number } | null;
};

// ---------------- Company / Ledger ----------------

export type CompanyState = {
  cash: number;
  reputation: number; // 0..100
  ledger: LedgerEntry[];
};

export type LedgerEntry = {
  id: string;
  atGameSeconds: number;
  kind:
    | "contract_income"
    | "monthly_overhead"
    | "weekly_lease"
    | "loan_payment"
    | "loan_interest"
    | "facility_purchase"
    | "asset_purchase"
    | "asset_sale"
    | "penalty"
    | "passive_income"
    | "other";
  amount: number; // +income, -expense
  label: string;
};

// ---------------- Map / Sites ----------------

export type SiteKind =
  | "industrial_estate"
  | "mechanic"
  | "quarry"
  | "retail_park"
  | "building_supply_store"
  | "office"
  | "construction_site"
  | "customer_house"
  | "customer_business"
  | "trading_yard"
  | "waste_yard"
  | "depot";

export type WorldSite = {
  id: string;
  kind: SiteKind;
  name: string;
  lat: number;
  lng: number;
  region?: string;
  tags?: string[];
};

export type SiteOutcome = {
  industrialEstate?: {
    yields: "depot" | "yard";         // never both
    hasMechanicGarage: boolean;
  };
};

export type MapState = {
  sites: Record<string, WorldSite>;
  ownedSiteIds: Record<string, true>;
  siteOutcomes: Record<string, SiteOutcome>;
  selectedSiteId: string | null;
};

// ---------------- Facilities ----------------

export type FacilityType =
  | "transport_depot"
  | "waste_yard"
  | "office"
  | "mechanic_garage"
  | "quarry"
  | "building_supply_store"
  | "trading_yard";

export type FacilitySize = "small" | "medium" | "large";

export type StaffRole =
  | "driver"
  | "site_manager"
  | "transport_manager"
  | "compliance_manager"
  | "yard_operative"
  | "machine_operator"
  | "weighbridge_clerk"
  | "mechanic"
  | "admin"
  | "regional_manager"
  | "loader_driver";

export type FacilityOwned = {
  id: string;
  siteId: string;
  type: FacilityType;
  size: FacilitySize;
  name: string;

  createdAtGameSeconds: number;
  purchasePrice: number;
  overheadPerWeek: number;

  capacityKind: "tonnes" | "units" | "bays";
  capacityMax: number;

  tonnesStored: number;
  storageUnitsUsed: number;
  baysUsed: number;

  compliance: number; // 0..100
  complianceManagerHiredAtGameSeconds: number | null;
  closedAtGameSeconds: number | null;

  requiredStaff: Partial<Record<StaffRole, number>>;
};

export type DepotRecord = {
  id: string;          // depotId (same as facilityId)
  facilityId: string;  // link back
  name: string;
  storageMax: number;
};

export type FacilitiesState = {
  facilities: Record<string, FacilityOwned>;
  depots: Record<string, DepotRecord>;
};

// ---------------- Staff ----------------

export type StaffMember = {
  id: string;
  name?: string;
  role: StaffRole;
  facilityId?: string;
  hiredAtGameSeconds: number;

  hoursWorkedToday: number;
  restUntilGameSeconds: number;
};

export type StaffState = {
  staff: Record<string, StaffMember>;
};

// ---------------- Assets ----------------

export type AssetKind = "vehicle" | "trailer" | "container";

export type AssetRecord = {
  id: string;
  kind: AssetKind;

  defId: string;
  depotId: string;
  createdDay: number;
  deliveredDay?: number;

  isLeased: boolean;
  lease?: {
    depositPaid: number;
    weeklyPayment: number;
    lastChargedWeekIndex: number;
  };

  plate?: string;

  condition?: number; // vehicles only
  inRepair?: {
    startedAtGameSeconds: number;
    completesAtGameSeconds: number;
    repairSiteId: string;
  };
};

export type AssetsState = {
  physical: Record<string, AssetRecord>;
};

// ---------------- Shop ----------------

export type ShopTab = "fleet" | "trailers" | "containers" | "upgrades";

export type ShopState = {
  ui: {
    tab: ShopTab;
    depotId: string | null;
    onlyThisDepot: boolean;
    search: string;
    sort: "priceAsc" | "priceDesc" | "nameAsc";
    brand: "ALL" | string;
    sellMode: boolean;
  };

  upgrades: {
    byDepot: Record<string, { fuelSaving: boolean; reliability: boolean }>;
  };
};

// ---------------- Contracts ----------------

export type ContractType = "skip_hire" | "grab_collection" | "work_haulage";

export type ContractStatus =
  | "available"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "failed";

export type Contract = {
  id: string;
  type: ContractType;
  status: ContractStatus;

  title: string;
  description?: string;

  createdAtGameSeconds: number;
  acceptedAtGameSeconds?: number;
  completedAtGameSeconds?: number;

  payout: number;
  penaltyOnCancel: number;
  repHitOnFail: number;

  requirements: {
    requiresVehicleType?: string;
    requiresTrailerType?: string;
    requiresContainerType?: string;
    requiresDriver: true;
  };

  pickupSiteId?: string;
  dropoffSiteId?: string;

  tonnes?: number;
  materialId?: MaterialId;
};

export type ContractsState = {
  byId: Record<string, Contract>;
};

// ---------------- Dispatch ----------------

export type DispatchJobStatus =
  | "planned"
  | "en_route_pickup"
  | "loading"
  | "en_route_dropoff"
  | "unloading"
  | "completed"
  | "cancelled";

export type DispatchJob = {
  id: string;
  contractId: string;
  status: DispatchJobStatus;

  driverId: string;
  vehicleAssetId: string;
  trailerAssetId?: string;
  containerAssetId?: string;

  startedAtGameSeconds?: number;
  completesAtGameSeconds?: number;

  distanceKm: number;
  conditionWear: number;

  pickupSiteId?: string;
  dropoffSiteId?: string;
};

export type DispatchState = {
  activeJobs: Record<string, DispatchJob>;
  completedJobs: Record<string, DispatchJob>;
};

// ---------------- Marketplace / Materials ----------------

export type MaterialId =
  | "sandstone"
  | "6f2"
  | "type1"
  | "type2"
  | "general_waste"
  | "metal"
  | "plastic"
  | "paper"
  | "cardboard"
  | "rubble"
  | "topsoil"
  | "sand"
  | "gravel";

export type MaterialPrice = {
  materialId: MaterialId;
  buy?: number;
  sell: number;
};

export type MarketplaceState = {
  prices: Record<MaterialId, MaterialPrice>;

  inventoryTonnesByFacility: Record<string, Partial<Record<MaterialId, number>>>;

  lastWeeklyPassiveIncomeWeekIndex: number;
};

// ---------------- Loans ----------------

export type LoansState = {
  creditLine: {
    enabled: boolean;
    principalOwed: number;

    interestRateMonthly: number;
    penaltyInterestRateMonthly: number;

    weeklyMinPayment: number; // 500
    lastWeeklyPaymentWeekIndex: number;

    inPenalty: boolean;
  };
};

// ---------------- UI state ----------------

export type UIState = {
  activeSaveSlotId: SaveSlotId | null;
  hasUnlockedGame: boolean;
  lastRoute?: string;
};
