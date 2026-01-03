import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { fetchListings } from "../services/listings";
import { mapApiListingToCard } from "../utils/listingMapper";
import { parseSearchParams, toSearchParamsObj } from "../utils/query";

import ListingCard from "../components/listing/ListingCard";
import FilterSidebar from "../components/filters/FilterSidebar";
import SortSelect from "../components/filters/SortSelect";
import FloatingFilterButton from "../components/ui/FloatingFilterButton";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseSearchParams(searchParams), [searchParams]);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // used to switch “top filters” → “sticky side filters” on web
  const topBarRef = useRef(null);
  const [showSideFilters, setShowSideFilters] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (!topBarRef.current) return;
      const rect = topBarRef.current.getBoundingClientRect();
      // when top bar scrolls out of view, show sidebar filters
      setShowSideFilters(rect.bottom < 0);
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const applyFilters = (next) => {
    setSearchParams(toSearchParamsObj(next));
  };

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["homeFeed", filters],
    queryFn: () => fetchListings(filters),
    keepPreviousData: true,
  });

  const items = (data?.items || []).map(mapApiListingToCard);
  const total = data?.total || 0;
  const page = data?.page || filters.page || 1;
  const pageSize = data?.page_size || filters.page_size || 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const goPage = (p) =>
    applyFilters({ ...filters, page: Math.min(Math.max(1, p), totalPages) });

  return (
    <div className="space-y-4">
      {/* WEB: top filter bar (hidden on mobile) */}
      <div ref={topBarRef} className="hidden md:block">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold">Riya Maga</h1>
              <div className="text-sm opacity-80">
                {isFetching ? "Updating…" : `${total.toLocaleString()} vehicles`}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SortSelect
                value={filters.sort}
                onChange={(sort) => applyFilters({ ...filters, sort, page: 1 })}
              />
              <button
                className="rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                onClick={() => setMobileFiltersOpen(true)} // works for web too
              >
                Open Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Layout: sidebar only in web, list always */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        {/* WEB: side filters appear only after scrolling past the top bar */}
        <aside className="hidden lg:block">
          <div
            className={[
              "rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4",
              showSideFilters ? "sticky top-20" : "",
              showSideFilters ? "opacity-100" : "opacity-0 pointer-events-none",
              "transition-opacity",
            ].join(" ")}
          >
            <div className="mb-3">
              <div className="text-sm font-semibold mb-1">Sort</div>
              <SortSelect
                value={filters.sort}
                onChange={(sort) => applyFilters({ ...filters, sort, page: 1 })}
              />
            </div>

            <FilterSidebar
              value={filters}
              onChange={() => {}}
              onApply={(next) => applyFilters(next)}
              onClear={(cleared) => applyFilters(cleared)}
            />
          </div>
        </aside>

        {/* FEED */}
        <section className="space-y-3">
          {/* MOBILE: compact heading only */}
          <div className="md:hidden">
            <h1 className="text-lg font-semibold">Riya Maga</h1>
            <div className="text-sm opacity-80">
              {isFetching ? "Updating…" : `${total.toLocaleString()} vehicles`}
            </div>
          </div>

          {isLoading && <div className="text-sm opacity-80">Loading…</div>}
          {isError && (
            <div className="text-sm text-red-500">
              Failed to load: {String(error?.message || error)}
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <div className="text-sm opacity-80">No vehicles found for your filters.</div>
          )}

          {/* dense grid on mobile to “see more at once” */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
            {items.map((it) => (
              <ListingCard key={it.id} item={it} />
            ))}
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

      {/* FAB: BOTH mobile + web (always available) */}
      <FloatingFilterButton onClick={() => setMobileFiltersOpen(true)} />

      {/* Filter sheet (mobile primary, also works on web when clicking Open Filters / FAB) */}
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

            {/* Sort inside sheet too (nice on mobile) */}
            <div className="mb-3">
              <div className="text-sm font-semibold mb-1">Sort</div>
              <SortSelect
                value={filters.sort}
                onChange={(sort) => applyFilters({ ...filters, sort, page: 1 })}
              />
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
