import { useLocation } from 'react-router';
import { useMemo } from 'react';
import qs from 'qs';

export const useQueryParams = () => {
  const location = useLocation();
  return useMemo(() => qs.parse(location.search.slice(1)), [location]);
};
