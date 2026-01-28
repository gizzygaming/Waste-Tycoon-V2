import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGameStore, formatCurrency } from '../game/store/useGameStore';
import { getBuyableFacilities } from '../game/data/siteGenerator';
import { MapPin, Building, Truck, Pickaxe, Store, AlertTriangle, X, ChevronRight } from 'lucide-react';

// Fix for default marker icons in webpack
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
        width: 24px;
        height: 24px;
        background: ${isOwned ? '#22C55E' : color};
        border: 2px solid ${isOwned ? '#16A34A' : '#000'};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: ${isOwned ? '#fff' : '#000'};
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
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

const SITE_ICONS = {
  industrial_estate: Building,
  mechanic: Truck,
  quarry: Pickaxe,
  retail_park: Store,
  construction_site: AlertTriangle,
  customer_house: MapPin,
  customer_business: MapPin,
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
  
  const handleBuy = () => {
    if (!selectedSite || !selectedFacility) return;
    
    // Check first purchase rules
    if (!hasFirstDepot) {
      if (selectedFacility.type !== 'transport_depot') {
        setPurchaseError('Your first purchase must be a Transport Depot');
        return;
      }
      if (selectedSize !== 'small') {
        setPurchaseError('You must start with a Small depot');
        return;
      }
      if (!selectedSite.tags?.includes('depot_available')) {
        setPurchaseError('This site does not have depot space available');
        return;
      }
    }
    
    const result = buySite(selectedSite.id, selectedFacility.type, selectedSize);
    
    if (result.success) {
      setPurchaseError(null);
      setSelectedFacility(null);
    } else {
      setPurchaseError(result.error);
    }
  };
  
  const handleFocusSelected = () => {
    if (selectedSite) {
      setFocusCenter([selectedSite.lat, selectedSite.lng]);
    }
  };
  
  return (
    <div className="flex h-full" data-testid="map-page">
      {/* Map Container */}
      <div className="flex-1 relative">
        {/* Setup Instruction Banner */}
        {!hasFirstDepot && (
          <div className="absolute top-4 left-4 right-4 z-[1000] bg-[var(--primary)] text-[var(--primary-foreground)] p-4 flex items-center gap-3" data-testid="setup-banner">
            <AlertTriangle size={24} />
            <div>
              <div className="font-heading text-lg font-bold">SETUP REQUIRED</div>
              <div className="text-sm opacity-90">
                Buy your first Transport Depot on the Map to unlock the game. 
                Look for Industrial Estates with depot space available.
              </div>
            </div>
          </div>
        )}
        
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
          >
            {Object.values(game.map.sites).map((site) => {
              const isOwnedSite = game.map.ownedSiteIds[site.id];
              const Icon = SITE_ICONS[site.kind] || MapPin;
              
              return (
                <Marker
                  key={site.id}
                  position={[site.lat, site.lng]}
                  icon={createIcon(SITE_COLORS[site.kind] || '#737373', isOwnedSite)}
                  eventHandlers={{
                    click: () => {
                      selectSite(site.id);
                      setSelectedFacility(null);
                      setPurchaseError(null);
                    },
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>{site.name}</strong>
                      <br />
                      <span className="text-xs opacity-70">{site.kind.replace(/_/g, ' ')}</span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
      
      {/* Site Details Panel */}
      <div className="w-96 bg-[var(--surface)] border-l border-[var(--border)] flex flex-col" data-testid="site-panel">
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
                    <span className="badge badge-success">OWNED</span>
                  )}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-2">
                  {selectedSite.region}
                </div>
              </div>
              <button
                onClick={() => selectSite(null)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                data-testid="close-panel"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Site Tags */}
            {selectedSite.tags && selectedSite.tags.length > 0 && (
              <div className="p-4 border-b border-[var(--border)]">
                <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                  Available
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
                  <div className="bg-[var(--background)] border border-[var(--primary)] p-3 mb-4">
                    <div className="text-[var(--primary)] font-bold text-sm mb-1">
                      FIRST PURCHASE
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      You must buy a Small Transport Depot from an industrial estate to start your business.
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
                        className={`card cursor-pointer transition-colors duration-150 ${
                          isSelected ? 'border-[var(--primary)]' : ''
                        } ${!isValidFirstPurchase ? 'opacity-50' : ''}`}
                        onClick={() => isValidFirstPurchase && setSelectedFacility(facility)}
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
                                <span className="font-mono text-lg font-bold text-[var(--primary)]">
                                  {formatCurrency(facility.prices[selectedSize])}
                                </span>
                              </div>
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
                  <div className="text-[var(--success)] font-bold">OWNED</div>
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
                    This location does not have any purchasable facilities.
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
                Focus Selected
              </button>
              
              {!isOwned && selectedFacility && (
                <button
                  onClick={handleBuy}
                  className="btn-primary w-full"
                  data-testid="buy-button"
                >
                  BUY {selectedFacility.type.replace(/_/g, ' ').toUpperCase()} - {formatCurrency(selectedFacility.prices[selectedSize])}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <MapPin size={48} className="mx-auto mb-4 text-[var(--muted)]" />
              <div className="text-[var(--text-muted)]">
                Select a site on the map to view details
              </div>
              <div className="text-xs text-[var(--muted)] mt-2">
                Click on any marker to see available facilities
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
