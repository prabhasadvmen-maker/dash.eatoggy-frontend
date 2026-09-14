import React, { createContext, useContext, useState, useEffect } from 'react';

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
        (position) => {
          const locData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            address: 'Current Location',
            timestamp: new Date().toISOString()
          };
          setLocation(locData);
          localStorage.setItem('customer_location', JSON.stringify(locData));
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
