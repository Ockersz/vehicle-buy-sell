import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { fetchListings } from "../services/listings";
import { mapApiListingToCard } from "../utils/listingMapper";
import { parseSearchParams, toSearchParamsObj } from "../utils/query";

import ListingCard from "../components/listing/ListingCard";
import FilterSidebar from "../components/filters/FilterSidebar";
import SortSelect from "../components/filters/SortSelect";
import FloatingFilterButton from "../components/ui/FloatingFilterButton";

import {
  ActiveFiltersBar,
  clearAllFiltersKeepBasics,
} from "../utils/activeFilterChips.jsx";

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-900 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-900 animate-pulse rounded" />
        <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-900 animate-pulse rounded" />
        <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-900 animate-pulse rounded" />
      </div>
    </div>
  );
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const filters = useMemo(() => parseSearchParams(searchParams), [searchParams]);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Switch layout: top-bar mode (no sidebar column) → scrolled mode (sidebar column)
  const markerRef = useRef(null);
  const [showSideFilters, setShowSideFilters] = useState(false);

  // Restore focus after sheet close (nice UX)
  const lastActiveElRef = useRef(null);

  useEffect(() => {
    if (!markerRef.current) return;

    const obs = new IntersectionObserver(
      ([entry]) => setShowSideFilters(!entry.isIntersecting),
      { threshold: 0 }
    );

    obs.observe(markerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!mobileFiltersOpen) return;

    lastActiveElRef.current = document.activeElement;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileFiltersOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileFiltersOpen]);

  useEffect(() => {
    if (!mobileFiltersOpen && lastActiveElRef.current?.focus) {
      lastActiveElRef.current.focus();
    }
  }, [mobileFiltersOpen]);

  const applyFilters = (next) => {
    setSearchParams(toSearchParamsObj(next));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["homeFeed", filters],
    queryFn: () => fetchListings(filters),
    keepPreviousData: true,
    staleTime: 15_000,
  });

  const items = useMemo(
    () => (data?.items || []).map(mapApiListingToCard),
    [data?.items]
  );

  const total = data?.total || 0;
  const page = data?.page || filters.page || 1;
  const pageSize = data?.page_size || filters.page_size || 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const goPage = (p) =>
    applyFilters({ ...filters, page: clamp(p, 1, totalPages) });

  const clearOneChip = (chip) => applyFilters(chip.clear(filters));
  const clearAllFilters = () =>
    applyFilters(clearAllFiltersKeepBasics(filters));

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-3 md:px-4 space-y-4">
        {/* Marker: when this scrolls out, sidebar mode starts on lg */}
        <div ref={markerRef} className="h-px w-full" />

        {/* WEB top bar */}
        <div className="hidden md:block">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold leading-tight">
                  Riya Maga
                </h1>
                <div className="text-sm opacity-80 flex items-center gap-2">
                  <span>{`${total.toLocaleString()} ${t('home.vehicles')}`}</span>
                  {isFetching && (
                    <span className="inline-flex items-center gap-1 text-xs opacity-70">
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      {t('home.updating')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <SortSelect
                  value={filters.sort}
                  onChange={(sort) =>
                    applyFilters({ ...filters, sort, page: 1 })
                  }
                />
                <button
                  className="rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  {t('home.filters')}
                </button>
              </div>
            </div>
          </div>

          {/* WEB pills under top bar */}
          <ActiveFiltersBar
            filters={filters}
            onClearOne={clearOneChip}
            onClearAll={clearAllFilters}
            className="mt-2"
          />
        </div>

        {/* MOBILE sticky header */}
        <div className="md:hidden sticky top-12 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
          <div className="py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-semibold leading-tight">
                  Riya Maga
                </h1>
                <div className="text-xs opacity-80">
                  {isFetching
                    ? t('home.updating')
                    : `${total.toLocaleString()} ${t('home.vehicles')}`}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <SortSelect
                  value={filters.sort}
                  onChange={(sort) =>
                    applyFilters({ ...filters, sort, page: 1 })
                  }
                />
                <button
                  className="rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  {t('home.filters')}
                </button>
              </div>
            </div>
          </div>

          <ActiveFiltersBar
            filters={filters}
            onClearOne={clearOneChip}
            onClearAll={clearAllFilters}
            className="pb-2"
          />
        </div>

        {/* Layout: NO left empty space at top; sidebar column only after scroll (lg) */}
        <div
          className={[
            "grid gap-4",
            "grid-cols-1",
            showSideFilters
              ? "lg:grid-cols-[360px_minmax(0,1fr)]"
              : "lg:grid-cols-1",
          ].join(" ")}
        >
          {/* Sidebar column only when showSideFilters = true */}
          {showSideFilters && (
            <aside className="hidden lg:block">
              <div className="sticky top-20">
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                  <div className="mb-3">
                    <div className="text-sm font-semibold mb-1">{t('home.sort')}</div>
                    <SortSelect
                      value={filters.sort}
                      onChange={(sort) =>
                        applyFilters({ ...filters, sort, page: 1 })
                      }
                    />
                  </div>

                  <FilterSidebar
                    value={filters}
                    onChange={() => {}}
                    onApply={(next) => applyFilters(next)}
                    onClear={(cleared) => applyFilters(cleared)}
                  />
                </div>
              </div>
            </aside>
          )}

          {/* FEED */}
          <section className="space-y-3 min-w-0">
            {isError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-300">
                Failed to load: {String(error?.message || error)}
              </div>
            )}

            {!isLoading && !isError && items.length === 0 && (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-sm opacity-80 bg-white dark:bg-gray-800">
                {t('home.noVehiclesFound')}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
              {isLoading
                ? Array.from({ length: 9 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))
                : items.map((it) => <ListingCard key={it.id} item={it} />)}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                className="rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                disabled={page <= 1 || isLoading}
                onClick={() => goPage(page - 1)}
              >
                {t('home.prev')}
              </button>

              <div className="text-sm opacity-80">
                {t('home.page')} {page} / {totalPages}
              </div>

              <button
                className="rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                disabled={page >= totalPages || isLoading}
                onClick={() => goPage(page + 1)}
              >
                {t('home.next')}
              </button>
            </div>
          </section>
        </div>

        {/* FAB always */}
        <FloatingFilterButton onClick={() => setMobileFiltersOpen(true)} />

        {/* Bottom Sheet */}
        {mobileFiltersOpen && (
          <div
            className="fixed inset-0 z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileFiltersOpen(false)}
            />

            <div
              className={[
                "absolute left-0 right-0 bottom-0 rounded-t-3xl",
                "bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700",
                "max-h-[88vh] overflow-auto",
                "animate-[slideUp_.18s_ease-out]",
              ].join(" ")}
            >
              <style>{`
                @keyframes slideUp {
                  from { transform: translateY(12px); opacity:.8 }
                  to { transform: translateY(0); opacity:1 }
                }
              `}</style>

              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold">{t('home.filters')}</div>
                  <button
                    className="rounded-xl px-3 py-1 border border-gray-200 dark:border-gray-700"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    {t('home.close')}
                  </button>
                </div>

                <div className="mb-3">
                  <div className="text-sm font-semibold mb-1">{t('home.sort')}</div>
                  <SortSelect
                    value={filters.sort}
                    onChange={(sort) =>
                      applyFilters({ ...filters, sort, page: 1 })
                    }
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
          </div>
        )}
      </div>
    </div>
  );
}
