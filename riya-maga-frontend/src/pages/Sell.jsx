import { useState } from "react";
import Step1Basics from "./PostListingWizard/Step1Basics";
import Step2Pricing from "./PostListingWizard/Step2Pricing";
import Step3Location from "./PostListingWizard/Step3Location";
import Step4Photos from "./PostListingWizard/Step4Photos";
import Step5Review from "./PostListingWizard/Step5Review";

const steps = ["Basics", "Pricing", "Location", "Photos", "Review"];

export default function Sell() {
  const [step, setStep] = useState(0);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Post an Ad</h1>
        <div className="text-sm opacity-80">
          Step {step + 1} of {steps.length}: {steps[step]}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        {step === 0 && <Step1Basics onNext={() => setStep(1)} />}
        {step === 1 && <Step2Pricing onBack={() => setStep(0)} onNext={() => setStep(2)} />}
        {step === 2 && <Step3Location onBack={() => setStep(1)} onNext={() => setStep(3)} />}
        {step === 3 && <Step4Photos onBack={() => setStep(2)} onNext={() => setStep(4)} />}
        {step === 4 && <Step5Review onBack={() => setStep(3)} />}
      </div>
    </div>
  );
}
