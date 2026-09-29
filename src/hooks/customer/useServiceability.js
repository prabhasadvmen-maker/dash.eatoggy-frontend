import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { serviceabilityService } from '../../services/customer/serviceabilityService.js';

export const useServiceability = (lat, lng) => {
  const [coords, setCoords] = useState({ lat, lng });

  useEffect(() => {
    if (lat && lng) {
      setCoords({ lat, lng });
    }
  }, [lat, lng]);

  const serviceabilityQuery = useQuery({
    queryKey: ['serviceability', coords.lat, coords.lng],
    queryFn: () => serviceabilityService.checkServiceability(coords.lat, coords.lng),
    enabled: !!(coords.lat && coords.lng),
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  const checkServiceability = (newLat, newLng) => {
    setCoords({ lat: newLat, lng: newLng });
  };

  const data = serviceabilityQuery.data?.data || {};

  return {
    isServiceable: !!data.isServiceable,
    deliveryFee: data.deliveryFee || 0,
    estimatedDeliveryMinutes: data.estimatedDeliveryMinutes || 0,
    kitchenId: data.kitchenId || null,
    checkServiceability,
    loading: serviceabilityQuery.isLoading,
    error: serviceabilityQuery.error
  };
};
