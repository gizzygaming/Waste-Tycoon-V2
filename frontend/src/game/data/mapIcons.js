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
  transport_depot: 'https://static.prod-images.emergentagent.com/jobs/ae5784e9-78b1-4db7-be01-05986779710a/images/1882c38df817f0b8912272375313d4460db881f57b9c2221e968a7f426ce89a2.png',
  mechanic_garage: 'https://static.prod-images.emergentagent.com/jobs/ae5784e9-78b1-4db7-be01-05986779710a/images/be592c1bc731538a6dadc44d508123a5dd9bc1eaad851556f40358becfdda923.png',
  quarry: 'https://static.prod-images.emergentagent.com/jobs/ae5784e9-78b1-4db7-be01-05986779710a/images/ce08c5e37bd327255a5e411469c938eed1fdc7842f83327267891fe3445a2c60.png',
  office: 'https://static.prod-images.emergentagent.com/jobs/ae5784e9-78b1-4db7-be01-05986779710a/images/64029caa18d1403383272f493a2eb0eed48af3a3b7febc6739637e546c78e718.png',
  building_supply_store: 'https://static.prod-images.emergentagent.com/jobs/ae5784e9-78b1-4db7-be01-05986779710a/images/d29b72a7c8283dbac7cc41ff26a74bdc01e9314a1da697d39e3781dffe6c9425.png',
  waste_transfer: 'https://static.prod-images.emergentagent.com/jobs/ae5784e9-78b1-4db7-be01-05986779710a/images/757c2844d3e5800facb55935be5aad184599883c88d927e6310af4a62b52179c.png',
  recycling_centre: 'https://static.prod-images.emergentagent.com/jobs/ae5784e9-78b1-4db7-be01-05986779710a/images/f82ef1cb876091db063d386ac5630dfac183814ec6eb93e10305a248435299bb.png',
  waste_yard: 'https://static.prod-images.emergentagent.com/jobs/ae5784e9-78b1-4db7-be01-05986779710a/images/757c2844d3e5800facb55935be5aad184599883c88d927e6310af4a62b52179c.png',
  trading_yard: 'https://static.prod-images.emergentagent.com/jobs/ae5784e9-78b1-4db7-be01-05986779710a/images/d29b72a7c8283dbac7cc41ff26a74bdc01e9314a1da697d39e3781dffe6c9425.png',
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
