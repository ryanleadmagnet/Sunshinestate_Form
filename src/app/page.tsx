"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, MapPin, Mail, Phone, User, Home, Sun, Battery, Settings, Zap, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Data from form_logic.md
const STEPS = [
  {
    id: "residency",
    question: "Do you own your home?",
    caption: "Please select the option that best describes your situation:",
    type: "choice",
    options: [
      { label: "Yes, I Own", value: "own" },
      { label: "No, I Rent", value: "rent" },
    ],
  },
  {
    id: "age",
    question: "What's the age of your home?",
    caption: "Please select the estimated age of your home:",
    type: "choice",
    options: [
      { label: "0 - 10 years", value: "0-10" },
      { label: "10 - 20 years", value: "10-20" },
      { label: "20+ years", value: "20+" },
    ],
  },
  {
    id: "existing_solar",
    question: "Do you have an existing solar system installed?",
    caption: "Please indicate whether you already have a solar system installed:",
    type: "choice",
    options: [
      { label: "No, I don't", value: "no" },
      { label: "Yes, I do", value: "yes" },
    ],
  },
  {
    id: "shading",
    question: "Do you have any shading issues over the roof?",
    caption: "Property shading that affects sunlight exposure:",
    type: "choice",
    options: [
      { label: "No shading issues", value: "none" },
      { label: "Minor shading issues", value: "minor" },
      { label: "Major shading issues", value: "major" },
      { label: "Not sure", value: "not_sure" },
    ],
  },
  {
    id: "usage",
    question: "When do you use most of your power?",
    caption: "Time of day when consumption is highest:",
    type: "choice",
    options: [
      { label: "Mostly day time", value: "day" },
      { label: "Mostly night time", value: "night" },
      { label: "A mixture of both", value: "mixture" },
    ],
  },
  {
    id: "bill",
    question: "How much is your power bill?",
    caption: "Average quarterly power bill cost:",
    type: "choice",
    options: [
      { label: "$0 - $300", value: "0-300" },
      { label: "$300 - $600", value: "300-600" },
      { label: "$600+", value: "600+" },
    ],
  },
  {
    id: "size",
    question: "Which solar system size are you considering?",
    caption: "System size you are interested in:",
    type: "choice",
    options: [
      { label: "6.6kW", value: "6.6kw" },
      { label: "10.5kW", value: "10.5kw" },
      { label: "13.2kW", value: "13.2kw" },
      { label: "15.4kW", value: "15.4kw" },
      { label: "Not sure", value: "not_sure" },
    ],
  },
  {
    id: "battery",
    question: "Would you like to add a solar battery to your system?",
    caption: "Select if you'd like a solar/battery package:",
    type: "choice",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "Not sure", value: "not_sure" },
    ],
  },
  {
    id: "postcode",
    question: "Please enter your postcode:",
    caption: "We need this to localise your incentives & quote.",
    type: "text",
    placeholder: "Your Postcode",
    inputMode: "numeric",
    maxLength: 4,
    validate: (val: string) => /^\d{4}$/.test(val) ? null : "Please enter a valid 4-digit postcode.",
  },
  {
    id: "name",
    question: "What is your name?",
    caption: "Please enter your first and last name.",
    type: "composite",
    fields: [
      { id: "firstName", placeholder: "First Name" },
      { id: "lastName", placeholder: "Last Name" },
    ],
  },
  {
    id: "email",
    question: "What's your best email?",
    caption: "Where should we send your detailed quote?",
    type: "text",
    placeholder: "Your Email Address",
    inputMode: "email",
    validate: (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? null : "Please enter a valid email address.",
  },
  {
    id: "phone",
    question: "What's your best contact number?",
    caption: "To finalise your savings & quote calculation.",
    type: "text",
    placeholder: "04XXXXXXXX",
    inputMode: "tel",
    maxLength: 10,
    buttonLabel: "Submit",
    validate: (val: string) => /^04\d{8}$/.test(val) ? null : "Phone must be 10 digits and start with 04.",
  },
];

export default function SolarForm() {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isDeadEnd, setIsDeadEnd] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [platform, setPlatform] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    // Capture "platform" UTM parameter from URL
    const params = new URLSearchParams(window.location.search);
    const plat = params.get("platform");
    if (plat) setPlatform(plat);
  }, []);

  const currentStep = STEPS[currentStepIdx];
  const progressPercent = useMemo(() => ((currentStepIdx + 1) / STEPS.length) * 100, [currentStepIdx]);

  const handleNext = (value: any) => {
    setErrorMsg(null);

    // Validate if applicable
    if (currentStep.validate && typeof value === "string") {
      const error = currentStep.validate(value);
      if (error) {
        setErrorMsg(error);
        return;
      }
    }

    let updatedData: Record<string, any> = { ...formData, platform };
    if (typeof value === "object" && value !== null) {
      updatedData = { ...updatedData, ...value };
    } else {
      updatedData = { ...updatedData, [currentStep.id]: value };
    }
    setFormData(updatedData);

    // Conditional Logic: Dead End for Non-Owners
    if (currentStep.id === "residency" && (value === "rent" || updatedData["residency"] === "rent")) {
      setIsDeadEnd(true);
      return;
    }

    if (currentStepIdx < STEPS.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      // Final submit
      setIsSubmitting(true);
      fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Spreadsheet connection failed");
          }
          setIsSubmitting(false);
          setIsFinished(true);
        })
        .catch((err) => {
          console.error("Submission error:", err);
          setIsSubmitting(false);
          setErrorMsg(err.message || "Something went wrong. Please try again.");
          // IMPORTANT: Do not set isFinished to true so it doesn't redirect on failure.
        });
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
      setErrorMsg(null);
    }
  };

  // Prevent Hydration Mismatch by only rendering content after mounting
  if (!mounted) return null;

  if (isDeadEnd) {
    return (
      <div className="flex flex-col items-center text-center p-6 animate-step max-w-[500px] mx-auto">
        <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-8 border border-neutral-800">
          <ArrowLeft className="w-10 h-10 text-neutral-500" />
        </div>
        <h1 className="text-4xl font-bold mb-6 text-white tracking-tight">Sorry!</h1>
        <p className="text-xl text-neutral-400 leading-relaxed">
          We can't help you any further as the owner of the property must make the decision to go solar.
        </p>
        <button
          onClick={() => { setIsDeadEnd(false); setCurrentStepIdx(0); }}
          className="btn btn-outline h-14 px-8 mt-12 rounded-xl text-lg w-full max-w-[300px]"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (isFinished) {
    // Redirect Parent Page
    if (typeof window !== "undefined") {
      window.parent.location.href = "https://sunshinestatesolar.com.au/thank-you-2/";
    }
    return (
      <div className="flex flex-col items-center text-center p-6 animate-step max-w-[500px] mx-auto">
        <div className="w-20 h-20 bg-[#fdb236]/20 rounded-full flex items-center justify-center mb-8 border border-[#fdb236]/40">
          <Check className="w-10 h-10 text-[#fdb236]" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Redirecting...</h1>
      </div>
    );
  }

  return (
    <div className="relative min-h-[500px] flex flex-col pt-4">
      {/* Progress Header */}
      <div className="px-1 mb-10 w-full">
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex-1 flex flex-col items-center text-center"
        >
          {/* Question Section */}
          <div className="mb-10 w-full">
            <h2 className="text-3xl font-bold tracking-tight mb-4 leading-snug">
              {currentStep.question}
            </h2>
            {currentStep.caption && (
              <p className="text-lg text-neutral-500 leading-relaxed font-light">
                {currentStep.caption}
              </p>
            )}
          </div>

          {/* Input Section */}
          <div className="w-full">
            {currentStep.type === "choice" && (
              <div className="space-y-3">
                {currentStep.options?.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleNext(opt.value)}
                    className="card-option w-full"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {currentStep.type === "text" && (
              <form
                autoComplete="off"
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = (e.currentTarget.elements.namedItem("val") as HTMLInputElement).value;
                  handleNext(val);
                }}
                className="space-y-4"
              >
                <div className="relative">
                  <input
                    name="val"
                    type={currentStep.inputMode === "email" ? "email" : "text"}
                    autoFocus
                    autoComplete="off"
                    placeholder={currentStep.placeholder}
                    inputMode={currentStep.inputMode as any}
                    maxLength={currentStep.maxLength}
                    className={cn(
                      "input-field text-center px-4",
                      errorMsg && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  {errorMsg && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-2 flex items-center justify-center gap-1 font-medium"
                    >
                      <AlertCircle className="w-4 h-4" /> {errorMsg}
                    </motion.p>
                  )}
                </div>
                <button type="submit" className="btn btn-primary h-16 w-full rounded-xl text-xl font-bold mt-4">
                  {currentStep.buttonLabel || "Continue"}
                </button>
              </form>
            )}

            {currentStep.type === "composite" && (
              <form
                autoComplete="off"
                onSubmit={(e) => {
                  e.preventDefault();
                  const results: Record<string, string> = {};
                  currentStep.fields?.forEach(f => {
                    results[f.id] = (e.currentTarget.elements.namedItem(f.id) as HTMLInputElement).value;
                  });
                  if (Object.values(results).every(v => v)) {
                    handleNext(results);
                  } else {
                    setErrorMsg("Please fill in all fields.");
                  }
                }}
                className="space-y-4"
              >
                {currentStep.fields?.map((f) => (
                  <input
                    key={f.id}
                    name={f.id}
                    autoComplete="off"
                    placeholder={f.placeholder}
                    className="input-field text-center px-4"
                  />
                ))}
                {errorMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm flex items-center justify-center gap-1 font-medium"
                  >
                    <AlertCircle className="w-4 h-4" /> {errorMsg}
                  </motion.p>
                )}
                <button type="submit" className="btn btn-primary h-16 w-full rounded-xl text-xl font-bold mt-4">
                  Continue
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-8 animate-step rounded-3xl">
          <Loader2 className="w-12 h-12 text-[#fdb236] animate-spin mb-6" />
          <h3 className="text-2xl font-bold mb-2">Submitting the form</h3>
          <p className="text-neutral-400">Please wait...</p>
        </div>
      )}
    </div>
  );
}
