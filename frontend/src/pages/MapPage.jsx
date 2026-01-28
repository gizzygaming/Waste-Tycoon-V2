import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGameStore, formatCurrency } from '../game/store/useGameStore';
import { getBuyableFacilities } from '../game/data/siteGenerator';
import { MapPin, Building, Truck, Pickaxe, Store, AlertTriangle, X, ChevronRight, Target, CheckCircle } from 'lucide-react';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const createIcon = (color, isOwned = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: ${isOwned ? '#22C55E' : color};
        border: 3px solid ${isOwned ? '#16A34A' : '#000'};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: ${isOwned ? '#fff' : '#000'};
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

const SITE_COLORS = {
  industrial_estate: '#EAB308',
  mechanic: '#F97316',
  quarry: '#78716C',
  retail_park: '#0EA5E9',
  construction_site: '#EF4444',
  customer_house: '#A855F7',
  customer_business: '#6366F1',
};

// Component to handle map focus
const MapFocuser = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 12, { duration: 0.5 });
    }
  }, [center, zoom, map]);
  
  return null;
};

export const MapPage = () => {
  const { game, selectSite, buySite } = useGameStore();
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedSize, setSelectedSize] = useState('small');
  const [focusCenter, setFocusCenter] = useState(null);
  const [purchaseError, setPurchaseError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  
  if (!game) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="map-loading">
        <div className="text-[var(--text-muted)]">Loading game...</div>
      </div>
    );
  }
  
  const selectedSite = game.map.selectedSiteId ? game.map.sites[game.map.selectedSiteId] : null;
  const isOwned = selectedSite ? game.map.ownedSiteIds[selectedSite.id] : false;
  const hasFirstDepot = Object.keys(game.facilities.depots).length > 0;
  const buyableFacilities = selectedSite ? getBuyableFacilities(selectedSite) : [];
  
  // Filter sites
  const filteredSites = Object.values(game.map.sites).filter(site => {
    if (filterType === 'all') return true;
    if (filterType === 'depot') return site.kind === 'industrial_estate' && site.tags?.includes('depot_available');
    if (filterType === 'owned') return game.map.ownedSiteIds[site.id];
    return site.kind === filterType;
  });
  
  const handleBuy = () => {
    if (!selectedSite || !selectedFacility) return;
    
    setPurchaseError(null);
    const result = buySite(selectedSite.id, selectedFacility.type, selectedSize);
    
    if (result.success) {
      setSelectedFacility(null);
      setSelectedSize('small');
    } else {
      setPurchaseError(result.error);
    }
  };
  
  const handleFocusSelected = () => {
    if (selectedSite) {
      setFocusCenter([selectedSite.lat, selectedSite.lng]);
      setTimeout(() => setFocusCenter(null), 100);
    }
  };
  
  return (
    <div className="flex flex-col lg:flex-row h-full" data-testid="map-page">
      {/* Map Container */}
      <div className="flex-1 relative min-h-[300px] lg:min-h-0">
        {/* Setup Instruction Banner */}
        {!hasFirstDepot && (
          <div className="absolute top-2 left-2 right-2 lg:top-4 lg:left-4 lg:right-4 z-[1000] bg-[var(--primary)] text-[var(--primary-foreground)] p-2 lg:p-4 flex items-center gap-2 lg:gap-3" data-testid="setup-banner">
            <AlertTriangle size={20} className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-heading text-sm lg:text-lg font-bold">SETUP REQUIRED</div>
              <div className="text-xs lg:text-sm opacity-90 truncate lg:whitespace-normal">
                Buy your first Transport Depot (£50,000) from an Industrial Estate to unlock the game.
              </div>
            </div>
            <button 
              onClick={() => setFilterType('depot')}
              className="bg-black/20 hover:bg-black/30 px-2 lg:px-4 py-1 lg:py-2 font-bold text-xs lg:text-sm transition-colors flex-shrink-0"
            >
              SHOW DEPOTS
            </button>
          </div>
        )}
        
        {/* Filter Controls */}
        <div className="absolute bottom-2 left-2 lg:bottom-4 lg:left-4 z-[1000] bg-[var(--surface)] border border-[var(--border)] p-1 lg:p-2 flex gap-1 lg:gap-2 overflow-x-auto max-w-[calc(100%-1rem)]">
          {[
            { id: 'all', label: 'All' },
            { id: 'depot', label: 'Depots' },
            { id: 'industrial_estate', label: 'Industrial' },
            { id: 'quarry', label: 'Quarries' },
            { id: 'owned', label: 'Owned' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-2 lg:px-3 py-1 text-[10px] lg:text-xs font-bold uppercase transition-colors whitespace-nowrap ${
                filterType === f.id 
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-highlight)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        
        <MapContainer
          center={[54.5, -2.5]}
          zoom={6}
          className="h-full w-full"
          data-testid="leaflet-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapFocuser center={focusCenter} zoom={12} />
          
          <MarkerClusterGroup 
            chunkedLoading 
            maxClusterRadius={60}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
          >
            {filteredSites.map((site) => {
              const isOwnedSite = game.map.ownedSiteIds[site.id];
              
              return (
                <Marker
                  key={site.id}
                  position={[site.lat, site.lng]}
                  icon={createIcon(SITE_COLORS[site.kind] || '#737373', isOwnedSite)}
                  eventHandlers={{
                    click: (e) => {
                      e.originalEvent?.stopPropagation?.();
                      selectSite(site.id);
                      setSelectedFacility(null);
                      setPurchaseError(null);
                    },
                  }}
                >
                  <Popup>
                    <div className="text-sm min-w-[150px]">
                      <strong>{site.name}</strong>
                      <div className="text-xs mt-1" style={{color: '#666'}}>
                        {site.kind.replace(/_/g, ' ')}
                      </div>
                      {site.tags && (
                        <div style={{marginTop: '8px'}}>
                          {site.tags.map(tag => (
                            <span key={tag} style={{
                              fontSize: '10px',
                              background: '#EAB30833',
                              color: '#EAB308',
                              padding: '2px 4px',
                              marginRight: '4px'
                            }}>
                              {tag.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          selectSite(site.id);
                          setSelectedFacility(null);
                          setPurchaseError(null);
                        }}
                        style={{
                          marginTop: '8px',
                          width: '100%',
                          padding: '6px',
                          background: '#EAB308',
                          color: '#000',
                          border: 'none',
                          fontWeight: 'bold',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        SELECT SITE
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
      
      {/* Site Details Panel */}
      <div className="w-full lg:w-80 xl:w-96 bg-[var(--surface)] border-t lg:border-t-0 lg:border-l border-[var(--border)] flex flex-col max-h-[50vh] lg:max-h-none overflow-auto" data-testid="site-panel">
        {selectedSite ? (
          <>
            {/* Site Header */}
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-start">
              <div>
                <h2 className="font-heading text-xl font-bold text-[var(--text-main)]" data-testid="site-name">
                  {selectedSite.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge badge-info">
                    {selectedSite.kind.replace(/_/g, ' ')}
                  </span>
                  {isOwned && (
                    <span className="badge badge-success flex items-center gap-1">
                      <CheckCircle size={10} /> OWNED
                    </span>
                  )}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-2">
                  {selectedSite.region}
                </div>
              </div>
              <button
                onClick={() => selectSite(null)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                data-testid="close-panel"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Site Tags */}
            {selectedSite.tags && selectedSite.tags.length > 0 && (
              <div className="p-4 border-b border-[var(--border)]">
                <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                  Available Features
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedSite.tags.map((tag) => (
                    <span key={tag} className="badge bg-[var(--surface-highlight)] text-[var(--text-main)]">
                      {tag.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Buyable Facilities */}
            {!isOwned && buyableFacilities.length > 0 && (
              <div className="flex-1 overflow-auto p-4">
                <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">
                  Available Facilities
                </div>
                
                {/* First depot requirement notice */}
                {!hasFirstDepot && (
                  <div className="bg-[var(--background)] border-2 border-[var(--primary)] p-3 mb-4">
                    <div className="text-[var(--primary)] font-bold text-sm mb-1 flex items-center gap-2">
                      <Target size={16} /> FIRST PURCHASE
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      You must buy a <strong className="text-[var(--text-main)]">Small Transport Depot</strong> to start your business.
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  {buyableFacilities.map((facility) => {
                    const isSelected = selectedFacility?.type === facility.type;
                    const isValidFirstPurchase = !hasFirstDepot ? 
                      (facility.type === 'transport_depot' && selectedSite.tags?.includes('depot_available')) : 
                      true;
                    
                    return (
                      <div
                        key={facility.type}
                        className={`card cursor-pointer transition-all duration-150 ${
                          isSelected ? 'border-[var(--primary)] bg-[var(--primary)]/5' : ''
                        } ${!isValidFirstPurchase ? 'opacity-40 cursor-not-allowed' : 'hover:border-[var(--muted)]'}`}
                        onClick={() => isValidFirstPurchase && setSelectedFacility(isSelected ? null : facility)}
                        data-testid={`facility-option-${facility.type}`}
                      >
                        <div className="p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-heading font-bold text-[var(--text-main)] uppercase">
                              {facility.type.replace(/_/g, ' ')}
                            </span>
                            <ChevronRight size={16} className={`text-[var(--muted)] transition-transform ${
                              isSelected ? 'rotate-90 text-[var(--primary)]' : ''
                            }`} />
                          </div>
                          
                          {isSelected && (
                            <div className="mt-3 space-y-3 animate-fade-in">
                              {/* Size Selection */}
                              <div>
                                <div className="text-xs text-[var(--text-muted)] mb-2">Select Size</div>
                                <div className="flex gap-2">
                                  {facility.sizes.map((size) => {
                                    const isDisabled = !hasFirstDepot && facility.type === 'transport_depot' && size !== 'small';
                                    return (
                                      <button
                                        key={size}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (!isDisabled) setSelectedSize(size);
                                        }}
                                        disabled={isDisabled}
                                        className={`flex-1 py-2 px-3 text-xs uppercase font-bold transition-colors ${
                                          selectedSize === size
                                            ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                                            : isDisabled
                                              ? 'bg-[var(--border)] text-[var(--muted)] cursor-not-allowed'
                                              : 'bg-[var(--background)] text-[var(--text-muted)] hover:bg-[var(--surface-highlight)]'
                                        }`}
                                        data-testid={`size-${size}`}
                                      >
                                        {size}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              
                              {/* Price */}
                              <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
                                <span className="text-xs text-[var(--text-muted)]">Price</span>
                                <span className="font-mono text-xl font-bold text-[var(--primary)]">
                                  {formatCurrency(facility.prices[selectedSize])}
                                </span>
                              </div>
                              
                              {/* Cash check */}
                              {game.company.cash < facility.prices[selectedSize] && (
                                <div className="text-xs text-[var(--danger)]">
                                  Insufficient funds (need {formatCurrency(facility.prices[selectedSize] - game.company.cash)} more)
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Already Owned Message */}
            {isOwned && (
              <div className="flex-1 p-4">
                <div className="bg-[var(--success)]/10 border border-[var(--success)] p-4">
                  <div className="text-[var(--success)] font-bold flex items-center gap-2">
                    <CheckCircle size={18} /> OWNED
                  </div>
                  <div className="text-sm text-[var(--text-muted)] mt-1">
                    You own a facility at this location. View it in Facilities.
                  </div>
                </div>
              </div>
            )}
            
            {/* No Facilities Available */}
            {!isOwned && buyableFacilities.length === 0 && (
              <div className="flex-1 p-4">
                <div className="bg-[var(--border)]/20 border border-[var(--border)] p-4">
                  <div className="text-[var(--text-muted)]">No facilities available</div>
                  <div className="text-xs text-[var(--muted)] mt-1">
                    This location cannot be purchased.
                  </div>
                </div>
              </div>
            )}
            
            {/* Purchase Error */}
            {purchaseError && (
              <div className="mx-4 mb-4 bg-[var(--danger)]/10 border border-[var(--danger)] p-3">
                <div className="text-[var(--danger)] text-sm">{purchaseError}</div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="p-4 border-t border-[var(--border)] space-y-2">
              <button
                onClick={handleFocusSelected}
                className="btn-secondary w-full"
                data-testid="focus-selected"
              >
                <Target size={16} className="inline mr-2" />
                Focus on Map
              </button>
              
              {!isOwned && selectedFacility && (
                <button
                  onClick={handleBuy}
                  disabled={game.company.cash < selectedFacility.prices[selectedSize]}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="buy-button"
                >
                  BUY FOR {formatCurrency(selectedFacility.prices[selectedSize])}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col p-4">
            <div className="text-center mb-6">
              <MapPin size={48} className="mx-auto mb-4 text-[var(--muted)]" />
              <div className="text-[var(--text-muted)]">
                Select a site on the map
              </div>
              <div className="text-xs text-[var(--muted)] mt-2">
                Click any marker, or use the dropdown below
              </div>
            </div>
            
            {/* Quick Site Selector */}
            <div className="border-t border-[var(--border)] pt-4">
              <label className="block text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                Quick Select Site
              </label>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    selectSite(e.target.value);
                    setSelectedFacility(null);
                    setPurchaseError(null);
                  }
                }}
                className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--text-main)] p-3"
                data-testid="quick-site-selector"
              >
                <option value="">-- Select a site --</option>
                {!hasFirstDepot && (
                  <optgroup label="🎯 Depot Sites (Buy First!)">
                    {Object.values(game.map.sites)
                      .filter(s => s.kind === 'industrial_estate' && s.tags?.includes('depot_available'))
                      .slice(0, 20)
                      .map(site => (
                        <option key={site.id} value={site.id}>
                          {site.name} - {site.region}
                        </option>
                      ))
                    }
                  </optgroup>
                )}
                <optgroup label="Industrial Estates">
                  {Object.values(game.map.sites)
                    .filter(s => s.kind === 'industrial_estate')
                    .slice(0, 15)
                    .map(site => (
                      <option key={site.id} value={site.id}>
                        {site.name} ({site.region})
                      </option>
                    ))
                  }
                </optgroup>
                <optgroup label="Quarries">
                  {Object.values(game.map.sites)
                    .filter(s => s.kind === 'quarry')
                    .slice(0, 10)
                    .map(site => (
                      <option key={site.id} value={site.id}>
                        {site.name} ({site.region})
                      </option>
                    ))
                  }
                </optgroup>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
