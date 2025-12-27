import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { fetchListings } from "../services/listings";
import { mapApiListingToCard } from "../utils/listingMapper";
import { parseSearchParams, toSearchParamsObj } from "../utils/query";
import ListingCard from "../components/listing/ListingCard";
import FilterSidebar from "../components/filters/FilterSidebar";
import SortSelect from "../components/filters/SortSelect";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseSearchParams(searchParams), [searchParams]);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["listings", filters],
    queryFn: () => fetchListings(filters),
    keepPreviousData: true,
  });

  const items = (data?.items || []).map(mapApiListingToCard);
  const total = data?.total || 0;
  const page = data?.page || filters.page || 1;
  const pageSize = data?.page_size || filters.page_size || 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const applyFilters = (next) => {
    setSearchParams(toSearchParamsObj(next));
  };

  const setSort = (sort) => applyFilters({ ...filters, sort, page: 1 });

  const goPage = (p) => applyFilters({ ...filters, page: Math.min(Math.max(1, p), totalPages) });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Search</h1>
          <div className="text-sm opacity-80">
            {isFetching ? "Updating…" : `${total.toLocaleString()} results`}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <SortSelect value={filters.sort} onChange={setSort} />
          </div>

          <button
            className="md:hidden rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700"
            onClick={() => setMobileFiltersOpen(true)}
          >
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
        {/* Desktop filters */}
        <aside className="hidden md:block sticky top-20 self-start rounded-2xl p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="mb-3">
            <div className="text-sm font-semibold mb-1">Sort</div>
            <SortSelect value={filters.sort} onChange={setSort} />
          </div>

          <FilterSidebar
            value={filters}
            onChange={() => {}}
            onApply={(next) => applyFilters(next)}
            onClear={(cleared) => applyFilters(cleared)}
          />
        </aside>

        {/* Results */}
        <section className="space-y-3">
          {isLoading && <div className="text-sm opacity-80">Loading…</div>}
          {isError && (
            <div className="text-sm text-red-500">
              Failed to load: {String(error?.message || error)}
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <div className="text-sm opacity-80">No listings found for your filters.</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((it) => <ListingCard key={it.id} item={it} />)}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <button
              className="rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => goPage(page - 1)}
            >
              Prev
            </button>

            <div className="text-sm opacity-80">
              Page {page} / {totalPages}
            </div>

            <button
              className="rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => goPage(page + 1)}
            >
              Next
            </button>
          </div>
        </section>
      </div>

      {/* Mobile filters sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute left-0 right-0 bottom-0 rounded-t-3xl bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 max-h-[85vh] overflow-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Filters</div>
              <button
                className="rounded-xl px-3 py-1 border border-gray-200 dark:border-gray-700"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="mb-3">
              <div className="text-sm font-semibold mb-1">Sort</div>
              <SortSelect value={filters.sort} onChange={(v) => setSort(v)} />
            </div>

            <FilterSidebar
              value={filters}
              onChange={() => {}}
              onApply={(next) => {
                applyFilters(next);
                setMobileFiltersOpen(false);
              }}
              onClear={(cleared) => {
                applyFilters(cleared);
                setMobileFiltersOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
