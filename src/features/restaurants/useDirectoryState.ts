import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useTenants } from '@/hooks/queries';
import type { TenantSort } from '@/services/api';
import type { Tenant } from '@/types';
import type { DirectoryFilters } from './types';

export interface DirectoryState {
  searchInput: string;
  setSearchInput: (value: string) => void;
  sort: TenantSort;
  setSort: (value: TenantSort) => void;
  filters: DirectoryFilters;
  setFilter: <K extends keyof DirectoryFilters>(key: K, value: DirectoryFilters[K]) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  selected: Set<string>;
  toggleRow: (id: string) => void;
  toggleAllOnPage: (ids: string[]) => void;
  deselectAll: () => void;
  query: ReturnType<typeof useTenants>;
  rows: Tenant[];
  pageRows: Tenant[];
  pageCount: number;
}

export function useDirectoryState(initialSearch = ''): DirectoryState {
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 300);
  const [sort, setSort] = useState<TenantSort>('newest');
  const [filters, setFilters] = useState<DirectoryFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const params = useMemo(
    () => ({ search: debouncedSearch.trim() || undefined, sort, ...filters }),
    [debouncedSearch, sort, filters],
  );

  const query = useTenants(params);
  const rows = useMemo(() => query.data ?? [], [query.data]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort, filters, pageSize]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = useMemo(
    () => rows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [rows, safePage, pageSize],
  );

  const setFilter = useCallback(
    <K extends keyof DirectoryFilters>(key: K, value: DirectoryFilters[K]) => {
      setFilters((prev) => {
        const next = { ...prev };
        if (value === undefined || value === false) {
          delete next[key];
        } else {
          next[key] = value;
        }
        return next;
      });
    },
    [],
  );

  const clearFilters = useCallback(() => setFilters({}), []);

  const toggleRow = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllOnPage = useCallback((ids: string[]) => {
    setSelected((prev) => {
      const allSelected = ids.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const deselectAll = useCallback(() => setSelected(new Set()), []);

  const activeFilterCount =
    Object.values(filters).filter((value) => value !== undefined && value !== false).length;

  return {
    searchInput,
    setSearchInput,
    sort,
    setSort,
    filters,
    setFilter,
    clearFilters,
    activeFilterCount,
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    selected,
    toggleRow,
    toggleAllOnPage,
    deselectAll,
    query,
    rows,
    pageRows,
    pageCount,
  };
}
