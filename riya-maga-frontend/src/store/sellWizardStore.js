import { create } from "zustand";

const initial = {
  vehicle_type: "",
  make: "",
  model: "",
  model_variant: "",
  year: "",
  condition_type: "",
  fuel_type: "",
  transmission: "",

  price_lkr: "",
  mileage_km: "",

  district_id: "",
  city_id: "",

  title: "",
  description: "",

  // Phase 1: store File objects for preview only
  photos: [], // [{ file, previewUrl }]
};

export const useSellWizardStore = create((set) => ({
  form: initial,
  setField: (k, v) => set((s) => ({ form: { ...s.form, [k]: v } })),
  setForm: (patch) => set((s) => ({ form: { ...s.form, ...patch } })),
  reset: () => set({ form: initial }),
}));
