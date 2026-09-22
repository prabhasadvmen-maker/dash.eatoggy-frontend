import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useDataTableSync = ({
  defaultLimit = 20,
  defaultSortBy = 'createdAt',
  defaultSortOrder = 'desc',
  syncWithUrl = true
} = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPageState] = useState(syncWithUrl ? parseInt(searchParams.get('page') || '1', 10) : 1);
  const [limit, setLimitState] = useState(syncWithUrl ? parseInt(searchParams.get('limit') || String(defaultLimit), 10) : defaultLimit);
  const [search, setSearchState] = useState(syncWithUrl ? searchParams.get('search') || '' : '');
  const [sortBy, setSortByState] = useState(syncWithUrl ? searchParams.get('sortBy') || defaultSortBy : defaultSortBy);
  const [sortOrder, setSortOrderState] = useState(syncWithUrl ? searchParams.get('sortOrder') || defaultSortOrder : defaultSortOrder);
  const [filters, setFiltersState] = useState(() => {
    if (!syncWithUrl) return {};
    const initFilters = {};
    for (const [key, value] of searchParams.entries()) {
      if (!['page', 'limit', 'search', 'sortBy', 'sortOrder'].includes(key)) {
        initFilters[key] = value;
      }
    }
    return initFilters;
  });

  useEffect(() => {
    if (!syncWithUrl) return;

    const newParams = new URLSearchParams();
    if (page > 1) newParams.set('page', page);
    if (limit !== defaultLimit) newParams.set('limit', limit);
    if (search) newParams.set('search', search);
    if (sortBy !== defaultSortBy) newParams.set('sortBy', sortBy);
    if (sortOrder !== defaultSortOrder) newParams.set('sortOrder', sortOrder);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newParams.set(key, value);
      }
    });

    setSearchParams(newParams, { replace: true });
  }, [page, limit, search, sortBy, sortOrder, filters, setSearchParams, syncWithUrl, defaultLimit, defaultSortBy, defaultSortOrder]);

  const setPage = useCallback((newPage) => setPageState(newPage), []);
  const setLimit = useCallback((newLimit) => {
    setLimitState(newLimit);
    setPageState(1);
  }, []);
  const setSearch = useCallback((val) => {
    setSearchState(val);
    setPageState(1);
  }, []);
  const setSort = useCallback((field, order) => {
    setSortByState(field);
    setSortOrderState(order);
    setPageState(1);
  }, []);
  const setFilters = useCallback((newFilters) => {
    setFiltersState(newFilters);
    setPageState(1);
  }, []);
  
  const handleClearFilters = useCallback(() => {
    setSearchState('');
    setFiltersState({});
    setSortByState(defaultSortBy);
    setSortOrderState(defaultSortOrder);
    setPageState(1);
  }, [defaultSortBy, defaultSortOrder]);

  return {
    page, setPage,
    limit, setLimit,
    search, setSearch,
    sortBy, sortOrder, setSort,
    filters, setFilters,
    handleClearFilters
  };
};
