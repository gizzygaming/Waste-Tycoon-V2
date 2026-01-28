import { v4 as uuidv4 } from 'uuid';

// Seeded random number generator
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// UK locations data - major industrial areas
const UK_REGIONS = [
  // England - North
  { name: 'Manchester', lat: 53.4808, lng: -2.2426, region: 'North West' },
  { name: 'Liverpool', lat: 53.4084, lng: -2.9916, region: 'North West' },
  { name: 'Leeds', lat: 53.8008, lng: -1.5491, region: 'Yorkshire' },
  { name: 'Sheffield', lat: 53.3811, lng: -1.4701, region: 'Yorkshire' },
  { name: 'Bradford', lat: 53.7960, lng: -1.7594, region: 'Yorkshire' },
  { name: 'Newcastle', lat: 54.9783, lng: -1.6178, region: 'North East' },
  { name: 'Sunderland', lat: 54.9069, lng: -1.3838, region: 'North East' },
  { name: 'Hull', lat: 53.7676, lng: -0.3274, region: 'Yorkshire' },
  { name: 'Preston', lat: 53.7632, lng: -2.7031, region: 'North West' },
  { name: 'Blackburn', lat: 53.7501, lng: -2.4849, region: 'North West' },
  
  // England - Midlands
  { name: 'Birmingham', lat: 52.4862, lng: -1.8904, region: 'West Midlands' },
  { name: 'Coventry', lat: 52.4068, lng: -1.5197, region: 'West Midlands' },
  { name: 'Wolverhampton', lat: 52.5869, lng: -2.1257, region: 'West Midlands' },
  { name: 'Nottingham', lat: 52.9548, lng: -1.1581, region: 'East Midlands' },
  { name: 'Leicester', lat: 52.6369, lng: -1.1398, region: 'East Midlands' },
  { name: 'Derby', lat: 52.9225, lng: -1.4746, region: 'East Midlands' },
  { name: 'Stoke-on-Trent', lat: 53.0027, lng: -2.1794, region: 'West Midlands' },
  { name: 'Northampton', lat: 52.2405, lng: -0.9027, region: 'East Midlands' },
  
  // England - South
  { name: 'London', lat: 51.5074, lng: -0.1278, region: 'London' },
  { name: 'Bristol', lat: 51.4545, lng: -2.5879, region: 'South West' },
  { name: 'Southampton', lat: 50.9097, lng: -1.4044, region: 'South East' },
  { name: 'Portsmouth', lat: 50.8198, lng: -1.0880, region: 'South East' },
  { name: 'Plymouth', lat: 50.3755, lng: -4.1427, region: 'South West' },
  { name: 'Reading', lat: 51.4543, lng: -0.9781, region: 'South East' },
  { name: 'Milton Keynes', lat: 52.0406, lng: -0.7594, region: 'South East' },
  { name: 'Swindon', lat: 51.5558, lng: -1.7797, region: 'South West' },
  { name: 'Oxford', lat: 51.7520, lng: -1.2577, region: 'South East' },
  { name: 'Cambridge', lat: 52.2053, lng: 0.1218, region: 'East' },
  { name: 'Norwich', lat: 52.6309, lng: 1.2974, region: 'East' },
  { name: 'Ipswich', lat: 52.0567, lng: 1.1482, region: 'East' },
  { name: 'Luton', lat: 51.8787, lng: -0.4200, region: 'East' },
  { name: 'Brighton', lat: 50.8225, lng: -0.1372, region: 'South East' },
  { name: 'Bournemouth', lat: 50.7192, lng: -1.8808, region: 'South West' },
  { name: 'Exeter', lat: 50.7184, lng: -3.5339, region: 'South West' },
  
  // Wales
  { name: 'Cardiff', lat: 51.4816, lng: -3.1791, region: 'Wales' },
  { name: 'Swansea', lat: 51.6214, lng: -3.9436, region: 'Wales' },
  { name: 'Newport', lat: 51.5842, lng: -2.9977, region: 'Wales' },
  
  // Scotland
  { name: 'Glasgow', lat: 55.8642, lng: -4.2518, region: 'Scotland' },
  { name: 'Edinburgh', lat: 55.9533, lng: -3.1883, region: 'Scotland' },
  { name: 'Aberdeen', lat: 57.1497, lng: -2.0943, region: 'Scotland' },
  { name: 'Dundee', lat: 56.4620, lng: -2.9707, region: 'Scotland' },
  { name: 'Inverness', lat: 57.4778, lng: -4.2247, region: 'Scotland' },
];

// Site type definitions
const SITE_TYPES = {
  industrial_estate: {
    nameTemplates: ['{city} Industrial Estate', '{city} Business Park', '{city} Trading Estate', 'Riverside Industrial Park', 'Westgate Business Centre', 'Central Industrial Estate'],
    spawnChance: 0.3,
  },
  mechanic: {
    nameTemplates: ['{city} Commercial Vehicle Services', 'HGV Repairs {city}', 'Fleet Maintenance Centre', 'Truck & Plant Services'],
    spawnChance: 0.1,
  },
  quarry: {
    nameTemplates: ['{city} Quarry', 'Stone Hill Quarry', 'Aggregates Ltd', 'Minerals Extraction Site'],
    spawnChance: 0.08,
  },
  retail_park: {
    nameTemplates: ['{city} Retail Park', 'Shopping Village', 'Trade Park {city}', 'Builders Merchant Row'],
    spawnChance: 0.12,
  },
  construction_site: {
    nameTemplates: ['New Build Development', 'Commercial Construction', '{city} Housing Project', 'Infrastructure Works'],
    spawnChance: 0.15,
  },
  customer_house: {
    nameTemplates: ['Residential Area', '{city} Houses', 'Suburban District', 'Housing Estate'],
    spawnChance: 0.15,
  },
  customer_business: {
    nameTemplates: ['Commercial Premises', 'Business Centre', '{city} Offices', 'Retail Units'],
    spawnChance: 0.1,
  },
};

export function generateUKSites(seed) {
  const random = seededRandom(seed);
  const sites = {};
  
  // Generate sites for each region
  UK_REGIONS.forEach((region, regionIndex) => {
    const sitesPerRegion = 3 + Math.floor(random() * 4); // 3-6 sites per region
    
    for (let i = 0; i < sitesPerRegion; i++) {
      // Determine site type based on spawn chances
      let siteType;
      const roll = random();
      let cumulative = 0;
      
      for (const [type, config] of Object.entries(SITE_TYPES)) {
        cumulative += config.spawnChance;
        if (roll <= cumulative) {
          siteType = type;
          break;
        }
      }
      
      if (!siteType) siteType = 'industrial_estate';
      
      // Generate site position with some offset from city center
      const latOffset = (random() - 0.5) * 0.15;
      const lngOffset = (random() - 0.5) * 0.2;
      
      // Generate site name
      const templates = SITE_TYPES[siteType].nameTemplates;
      let name = templates[Math.floor(random() * templates.length)];
      name = name.replace('{city}', region.name);
      
      // Add unique suffix if needed
      if (i > 0) {
        name += ` ${['North', 'South', 'East', 'West', 'Central'][i % 5]}`;
      }
      
      const siteId = uuidv4();
      
      sites[siteId] = {
        id: siteId,
        kind: siteType,
        name,
        lat: region.lat + latOffset,
        lng: region.lng + lngOffset,
        region: region.region,
        tags: generateTags(siteType, random),
      };
    }
  });
  
  // Ensure there are some depot-eligible sites
  let depotCount = 0;
  Object.values(sites).forEach((site) => {
    if (site.kind === 'industrial_estate') depotCount++;
  });
  
  // Add more industrial estates if needed
  if (depotCount < 10) {
    const additionalCount = 10 - depotCount;
    for (let i = 0; i < additionalCount; i++) {
      const region = UK_REGIONS[Math.floor(random() * UK_REGIONS.length)];
      const siteId = uuidv4();
      
      sites[siteId] = {
        id: siteId,
        kind: 'industrial_estate',
        name: `${region.name} Industrial Park ${['Alpha', 'Beta', 'Gamma', 'Delta'][i % 4]}`,
        lat: region.lat + (random() - 0.5) * 0.15,
        lng: region.lng + (random() - 0.5) * 0.2,
        region: region.region,
        tags: ['depot_available', 'yard_available'],
      };
    }
  }
  
  return sites;
}

function generateTags(siteType, random) {
  const tags = [];
  
  switch (siteType) {
    case 'industrial_estate':
      // Seeded: yields either depot OR yard, never both
      if (random() > 0.5) {
        tags.push('depot_available');
      } else {
        tags.push('yard_available');
      }
      // Some have mechanic garages
      if (random() > 0.7) {
        tags.push('has_mechanic');
      }
      break;
    case 'retail_park':
      if (random() > 0.6) {
        tags.push('building_supply_available');
      }
      break;
    case 'quarry':
      tags.push('buyable');
      break;
    default:
      break;
  }
  
  return tags;
}

// Get buyable facilities for a site
export function getBuyableFacilities(site) {
  const facilities = [];
  
  switch (site.kind) {
    case 'industrial_estate':
      if (site.tags?.includes('depot_available')) {
        facilities.push({
          type: 'transport_depot',
          sizes: ['small', 'medium', 'large'],
          prices: { small: 50000, medium: 150000, large: 350000 },
        });
      }
      if (site.tags?.includes('yard_available')) {
        facilities.push({
          type: 'waste_yard',
          sizes: ['small', 'medium', 'large'],
          prices: { small: 75000, medium: 200000, large: 500000 },
        });
        facilities.push({
          type: 'trading_yard',
          sizes: ['small', 'medium', 'large'],
          prices: { small: 60000, medium: 175000, large: 400000 },
        });
      }
      if (site.tags?.includes('has_mechanic')) {
        facilities.push({
          type: 'mechanic_garage',
          sizes: ['small', 'medium', 'large'],
          prices: { small: 40000, medium: 100000, large: 250000 },
        });
      }
      break;
    case 'retail_park':
      if (site.tags?.includes('building_supply_available')) {
        facilities.push({
          type: 'building_supply_store',
          sizes: ['small', 'medium', 'large'],
          prices: { small: 150000, medium: 300000, large: 600000 },
        });
      }
      break;
    case 'quarry':
      if (site.tags?.includes('buyable')) {
        facilities.push({
          type: 'quarry',
          sizes: ['small', 'medium', 'large'],
          prices: { small: 500000, medium: 1000000, large: 2000000 },
        });
      }
      break;
    default:
      break;
  }
  
  // Add office to any commercial site
  if (['industrial_estate', 'retail_park'].includes(site.kind)) {
    facilities.push({
      type: 'office',
      sizes: ['small', 'medium', 'large'],
      prices: { small: 25000, medium: 75000, large: 200000 },
    });
  }
  
  return facilities;
}

export default generateUKSites;
