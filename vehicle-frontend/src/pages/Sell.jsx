import { useMemo, useState } from "react";
import Step2Pricing from "./PostListingWizard/Step2Pricing";
import Step3Location from "./PostListingWizard/Step3Location";
import Step4Photos from "./PostListingWizard/Step4Photos";

const STEPS = [
  { key: "basics", label: "Basics" },
  { key: "pricing", label: "Pricing" },
  { key: "location", label: "Location" },
  { key: "photos", label: "Photos" },
  { key: "review", label: "Review" },
];

const VEHICLE_TYPES = [
  "CAR",
  "VAN",
  "SUV",
  "BIKE",
  "THREE_WHEEL",
  "BUS",
  "LORRY",
  "HEAVY",
  "TRACTOR",
  "BOAT",
  "OTHER",
];

export default function Sell() {
  const [stepIndex, setStepIndex] = useState(0);

  const [form, setForm] = useState({
    vehicle_type: "CAR",
    make: "",
    model: "",
    year: "",
    condition_type: "USED",

    price_lkr: "",
    mileage_km: "",
    fuel_type: "",
    transmission: "",

    district_id: "",
    district: "",
    city_id: "",
    city: "",

    images: [],
    description: "",
    title: "",
  });

  const step = STEPS[stepIndex];

  const canNext = useMemo(() => {
    if (step.key === "basics") {
      return (
        form.vehicle_type &&
        form.make.trim() &&
        form.model.trim() &&
        String(form.year).trim() &&
        form.condition_type
      );
    }

    if (step.key === "pricing") {
      return String(form.price_lkr).trim().length > 0;
    }

    if (step.key === "location") {
      return form.district_id && form.city_id;
    }

    if (step.key === "photos") {
      return (form.images || []).length >= 1;
    }

    return true;
  }, [step.key, form]);

  const next = () => {
    if (!canNext) return;
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const back = () => setStepIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="p-4 md:p-0 space-y-4 pb-28">
      {/* Header */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Post a Listing</h1>
              <p className="text-sm text-base-content/70">
                Step {stepIndex + 1} of {STEPS.length}: {step.label}
              </p>
            </div>
            <span className="badge badge-outline">{step.label}</span>
          </div>

          <WizardStepper steps={STEPS} activeIndex={stepIndex} />
        </div>
      </div>

      {/* Step content */}
      {step.key === "basics" ? (
        <StepBasics
          form={form}
          setForm={setForm}
          VEHICLE_TYPES={VEHICLE_TYPES}
        />
      ) : step.key === "pricing" ? (
        <Step2Pricing form={form} setForm={setForm} />
      ) : step.key === "location" ? (
        <Step3Location form={form} setForm={setForm} />
      ) : step.key === "photos" ? (
        <Step4Photos form={form} setForm={setForm} />
      ) : (
        <ComingSoonCard title={step.label} />
      )}

      {/* Unified Action Bar (mobile + web) */}
      <div className="fixed bottom-16 md:bottom-6 left-0 right-0 px-3 z-20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-base-100/90 backdrop-blur border border-base-300 shadow-lg rounded-2xl px-3 py-2 flex items-center gap-2">
            {/* Back icon */}
            <button
              className="btn btn-ghost btn-square"
              onClick={back}
              disabled={stepIndex === 0}
              aria-label="Back"
              title="Back"
            >
              ←
            </button>

            {/* Step dots */}
            <div className="flex items-center gap-1 px-1">
              {STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === stepIndex
                      ? "w-6 bg-primary"
                      : idx < stepIndex
                      ? "w-2 bg-primary/60"
                      : "w-2 bg-base-300"
                  }`}
                />
              ))}
            </div>

            <div className="flex-1" />

            {/* Secondary */}
            <button
              className="btn btn-ghost hidden sm:inline-flex"
              onClick={() => setStepIndex(0)}
            >
              Save draft
            </button>

            {/* Main CTA */}
            <button
              className={`btn rounded-xl px-6 ${
                canNext ? "btn-primary" : "btn-disabled"
              }`}
              onClick={next}
              disabled={!canNext}
            >
              {stepIndex === STEPS.length - 1 ? "Publish" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WizardStepper({ steps, activeIndex }) {
  return (
    <>
      {/* Web stepper */}
      <div className="hidden md:flex items-center gap-2 mt-3">
        {steps.map((s, idx) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                idx <= activeIndex
                  ? "bg-primary text-primary-content"
                  : "bg-base-200 text-base-content/60"
              }`}
            >
              {idx + 1}
            </div>
            <div
              className={`text-sm ${
                idx === activeIndex ? "font-semibold" : "text-base-content/60"
              }`}
            >
              {s.label}
            </div>
            {idx < steps.length - 1 && (
              <div className="w-8 h-[2px] bg-base-200" />
            )}
          </div>
        ))}
      </div>

      {/* Mobile stepper */}
      <div className="md:hidden mt-3">
        <progress
          className="progress progress-primary w-full"
          value={activeIndex + 1}
          max={steps.length}
        />
        <div className="flex justify-between text-xs text-base-content/60 mt-1">
          <span>{steps[0].label}</span>
          <span>{steps[steps.length - 1].label}</span>
        </div>
      </div>
    </>
  );
}

function StepBasics({ form, setForm, VEHICLE_TYPES }) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-base-content/60">
              Vehicle type *
            </label>
            <select
              className="select select-bordered w-full"
              value={form.vehicle_type}
              onChange={(e) =>
                setForm((p) => ({ ...p, vehicle_type: e.target.value }))
              }
            >
              {VEHICLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {prettyType(t)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-base-content/60">Condition *</label>
            <select
              className="select select-bordered w-full"
              value={form.condition_type}
              onChange={(e) =>
                setForm((p) => ({ ...p, condition_type: e.target.value }))
              }
            >
              <option value="NEW">New</option>
              <option value="USED">Used</option>
              <option value="RECONDITIONED">Reconditioned</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-base-content/60">Make *</label>
            <input
              className="input input-bordered w-full"
              placeholder="Toyota, Honda, Bajaj…"
              value={form.make}
              onChange={(e) => setForm((p) => ({ ...p, make: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs text-base-content/60">Model *</label>
            <input
              className="input input-bordered w-full"
              placeholder="Prius, Alto, Pulsar…"
              value={form.model}
              onChange={(e) =>
                setForm((p) => ({ ...p, model: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-xs text-base-content/60">Year *</label>
            <input
              className="input input-bordered w-full"
              type="number"
              placeholder="2017"
              value={form.year}
              onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs text-base-content/60">
              Title (optional)
            </label>
            <input
              className="input input-bordered w-full"
              placeholder="e.g. Toyota Prius 2017 S Touring"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-base-content/60">
            Description (optional)
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            rows={4}
            placeholder="Condition, service history, reason for selling, etc."
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
          />
        </div>

        <div className="text-xs text-base-content/50">
          * Required fields. We’ll add suggested make/model lists later.
        </div>
      </div>
    </div>
  );
}

function ComingSoonCard({ title }) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4">
        <h2 className="font-semibold text-lg">{title}</h2>
        <div className="divider my-2" />
        <p className="text-sm text-base-content/70">
          Next step UI will be added in the next message.
        </p>
      </div>
    </div>
  );
}

function prettyType(t) {
  if (t === "THREE_WHEEL") return "3-Wheeler";
  return t.charAt(0) + t.slice(1).toLowerCase();
}
