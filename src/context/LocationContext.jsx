import React, { createContext, useContext, useState, useEffect } from 'react';
import { customerSaveLocation } from '../services/customerAuthService.js';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('customer_location');
    return saved ? JSON.parse(saved) : null;
  });
  const [locationError, setLocationError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const requestLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const err = 'Geolocation is not supported by this browser.';
        setLocationError(err);
        resolve({ success: false, error: err });
        return;
      }

      setLoadingLocation(true);
      setLocationError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          let addressStr = 'Current Location';
          let cityStr = '';
          let stateStr = '';
          let pincodeStr = '';

          try {
            // Reverse geocode via free Nominatim API for human-readable address
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              if (geoData.display_name) {
                addressStr = geoData.display_name;
              }
              if (geoData.address) {
                cityStr = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.county || '';
                stateStr = geoData.address.state || '';
                pincodeStr = geoData.address.postcode || '';
              }
            }
          } catch (geoErr) {
            console.warn('Reverse geocoding error:', geoErr);
          }

          const locData = {
            latitude,
            longitude,
            accuracy: position.coords.accuracy,
            address: addressStr,
            city: cityStr,
            state: stateStr,
            pincode: pincodeStr,
            timestamp: new Date().toISOString()
          };

          setLocation(locData);
          localStorage.setItem('customer_location', JSON.stringify(locData));

          // Save to backend database via API
          try {
            await customerSaveLocation({
              latitude,
              longitude,
              address: addressStr,
              city: cityStr,
              state: stateStr,
              pincode: pincodeStr,
              saveAsAddress: true
            });
          } catch (apiErr) {
            console.error('Failed to save customer location to backend API:', apiErr);
          }

          setLoadingLocation(false);
          resolve({ success: true, location: locData });
        },
        (error) => {
          let msg = 'Unable to retrieve location';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location permission denied';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Location information unavailable';
          } else if (error.code === error.TIMEOUT) {
            msg = 'Location request timed out';
          }
          setLocationError(msg);
          setLoadingLocation(false);
          resolve({ success: false, error: msg });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const setManualLocation = (addressStr) => {
    const locData = {
      latitude: null,
      longitude: null,
      address: addressStr,
      timestamp: new Date().toISOString()
    };
    setLocation(locData);
    localStorage.setItem('customer_location', JSON.stringify(locData));
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        locationError,
        loadingLocation,
        requestLocation,
        setManualLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);

export default LocationContext;
