import React, { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, Check, Loader2, AlertCircle, X } from 'lucide-react';
import { getLocationCoordinates, reverseGeocode, searchLocations } from '../../../services/locationService';

const LocationSelector = ({
  value,
  onChange,
  label = 'Location / City',
  required = false,
  error = '',
  helperText = '',
  placeholder = 'Search location or address...',
  id = 'location-selector-input',
  className = ''
}) => {
  const [query, setQuery] = useState(
    typeof value === 'object' ? value?.formattedAddress || value?.city || '' : value || ''
  );
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);

  // GPS Current Location states
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [detectedLocation, setDetectedLocation] = useState(null);

  useEffect(() => {
    if (typeof value === 'object' && value?.formattedAddress) {
      setQuery(value.formattedAddress);
    } else if (typeof value === 'string' && value !== query) {
      setQuery(value);
    }
  }, [value]);

  // Handle Search Input Change
  const handleQueryChange = async (e) => {
    const val = e.target.value;
    setQuery(val);
    setGpsError('');

    if (onChange) {
      onChange({
        formattedAddress: val,
        city: val,
        state: '',
        pincode: '',
        latitude: null,
        longitude: null
      });
    }

    if (val.trim().length >= 2) {
      setSearching(true);
      try {
        const results = await searchLocations(val);
        setSuggestions(results);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Handle Use Current Location Click
  const handleUseCurrentLocation = async () => {
    setGpsLoading(true);
    setGpsError('');
    setDetectedLocation(null);

    try {
      const coords = await getLocationCoordinates();
      const addrData = await reverseGeocode(coords.latitude, coords.longitude);
      setDetectedLocation(addrData);
    } catch (err) {
      setGpsError(err.message || 'Unable to detect location. Please search manually.');
    } finally {
      setGpsLoading(false);
    }
  };

  // Confirm / Select Location
  const handleSelectLocation = (locationObj) => {
    const formatted = locationObj.formattedAddress || locationObj.city || '';
    setQuery(formatted);
    setSuggestions([]);
    setDetectedLocation(null);
    setGpsError('');

    if (onChange) {
      onChange(locationObj);
    }
  };

  // Clear Selection
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setDetectedLocation(null);
    setGpsError('');
    if (onChange) {
      onChange({ formattedAddress: '', city: '', state: '', pincode: '', latitude: null, longitude: null });
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Main Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          id={id}
          value={query}
          onChange={handleQueryChange}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3 bg-white border text-slate-900 placeholder-slate-400 text-xs font-medium rounded-xl transition-all shadow-sm focus:outline-none focus:ring-1 ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
              : 'border-slate-300 focus:border-[#d4af37] focus:ring-[#d4af37]'
          }`}
          required={required}
        />
        {query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          searching && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
          )
        )}
      </div>

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500">{helperText}</p>}

      {/* Current Location Action Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <button
          type="button"
          id="onboard-use-location-btn"
          onClick={handleUseCurrentLocation}
          disabled={gpsLoading}
          className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-[#a58523] border border-[#d4af37]/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          {gpsLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>Detecting current location...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4 shrink-0 text-[#d4af37]" />
              <span>Use Current Location</span>
            </>
          )}
        </button>
      </div>

      {/* GPS Error / Permission Denied Banner */}
      {gpsError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{gpsError}</span>
          </div>
        </div>
      )}

      {/* GPS Detected Location Confirmation Banner */}
      {detectedLocation && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Current Location Detected</span>
          </div>
          <p className="text-xs text-emerald-900 font-medium leading-relaxed">
            {detectedLocation.formattedAddress}
          </p>
          <button
            type="button"
            id="use-detected-location-confirm-btn"
            onClick={() => handleSelectLocation(detectedLocation)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all shadow-sm"
          >
            Use This Location
          </button>
        </div>
      )}

      {/* Nearby Locations / Search Suggestions List */}
      {suggestions.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-md space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 px-1 block">
            Nearby Locations & Suggestions
          </span>
          <div className="space-y-1.5">
            {suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectLocation(item)}
                className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 text-xs text-slate-800 flex items-center justify-between transition-all group"
              >
                <div className="flex items-start gap-2 pr-2">
                  <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                  <span className="font-medium group-hover:text-slate-900">{item.formattedAddress}</span>
                </div>
                <Check className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#d4af37] shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
