// Vehicle Icons - Different PNG for each vehicle type
export const VEHICLE_ICONS = {
  small_tipper: 'https://static.prod-images.emergentagent.com/jobs/ae5784e9-78b1-4db7-be01-05986779710a/images/8ae3546f14dfea7ca566016b29409dba393c0e2cc92aca4950cea8b24a5be704.png',
  large_tipper: 'https://static.prod-images.emergentagent.com/jobs/ae5784e9-78b1-4db7-be01-05986779710a/images/355fa164592b986ae199be50dd78890149d7e305936fbe92006e92aa4737dcc9.png',
  skip_truck: 'https://static.prod-images.emergentagent.com/jobs/ae5784e9-78b1-4db7-be01-05986779710a/images/9708af90c34a0df72645f104961d0824d8112758d821d40b27d0934e978c8261.png',
  grab_lorry: 'https://static.prod-images.emergentagent.com/jobs/ae5784e9-78b1-4db7-be01-05986779710a/images/2c53783cbbc13640eae5d35f99cf9eb6d1b8b2704fae74304aad6dd2b9213e86.png',
  artic_unit: 'https://static.prod-images.emergentagent.com/jobs/ae5784e9-78b1-4db7-be01-05986779710a/images/c068f9692e2f122fc12120d8d6ce10c5f183f9e7010f33a54a6237738b74a3fb.png',
};

// Facility Icons - Different PNG for each facility type
export const FACILITY_ICONS = {
  transport_depot: '/icons/facilities/transport_depot.png',
  mechanic_garage: '/icons/facilities/mechanic_garage.png',
  quarry: '/icons/facilities/quarry.png',
  office: '/icons/facilities/office.png',
  building_supply_store: '/icons/facilities/building_supply_store.png',
  waste_transfer: '/icons/facilities/waste_transfer.png',
  recycling_centre: '/icons/facilities/recycling_centre.png',
  waste_yard: '/icons/facilities/waste_yard.png',
  trading_yard: '/icons/facilities/trading_yard.png',
};


// Site type to facility icon mapping
export const SITE_TYPE_ICONS = {
  industrial_estate: FACILITY_ICONS.transport_depot,
  quarry: FACILITY_ICONS.quarry,
  depot: FACILITY_ICONS.transport_depot,
  waste_transfer_station: FACILITY_ICONS.waste_transfer,
  recycling_centre: FACILITY_ICONS.recycling_centre,
  construction_site: FACILITY_ICONS.building_supply_store,
  default: FACILITY_ICONS.transport_depot,
};

// Get vehicle icon by defId
export const getVehicleIcon = (defId) => {
  return VEHICLE_ICONS[defId] || VEHICLE_ICONS.small_tipper;
};

// Get facility icon by type
export const getFacilityIcon = (facilityType) => {
  return FACILITY_ICONS[facilityType] || FACILITY_ICONS.transport_depot;
};

// Get site icon by site kind
export const getSiteIcon = (siteKind) => {
  return SITE_TYPE_ICONS[siteKind] || SITE_TYPE_ICONS.default;
};
