
"use client";

import { useState, type FormEvent } from "react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
  data?: {
    id: number;
    name: string;
    email: string;
    status: string;
    createdAt: string;
  };
}

interface AvailableSlot {
  start: string;
  label: string;
}

interface SlotsResponse {
  success: boolean;
  timezone: string;
  durationMinutes: number;
  slots: AvailableSlot[];
}

const initialForm: FormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  message: "",
};

export default function ConsultationForm() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [consultationId, setConsultationId] = useState<number | null>(null);
const [slots, setSlots] = useState<AvailableSlot[]>([]);
const [selectedSlot, setSelectedSlot] = useState("");
const [slotsLoading, setSlotsLoading] = useState(false);
const [bookingLoading, setBookingLoading] = useState(false);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  }

 async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setErrors({});
  setFeedback(null);

  const nextErrors: Record<string, string> = {};

  if (form.name.trim().length < 2) {
    nextErrors.name = "Please enter your name.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    nextErrors.email = "Please enter a valid email address.";
  }

  if (!form.message.trim()) {
    nextErrors.message = "Please enter your message.";
  }

  if (Object.keys(nextErrors).length > 0) {
    setErrors(nextErrors);
    return;
  }

  setLoading(true);

  try {
    // 1. Save the consultation details.
    const response = await fetch("/api/consult", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const result: ApiResponse = await response.json();

    if (!response.ok || !result.success || !result.data?.id) {
      if (result.errors) {
        const serverErrors: Record<string, string> = {};

        Object.entries(result.errors).forEach(([field, messages]) => {
          if (messages?.[0]) {
            serverErrors[field] = messages[0];
          }
        });

        setErrors(serverErrors);
      }

      throw new Error(result.message || "Submission failed.");
    }

    // 2. Store the consultation ID for booking.
    setConsultationId(result.data.id);

    // 3. Retrieve available appointment slots.
    setSlotsLoading(true);

    const slotsResponse = await fetch("/api/consult", {
      method: "GET",
      cache: "no-store",
    });

    const slotsResult: SlotsResponse = await slotsResponse.json();

    if (!slotsResponse.ok || !slotsResult.success) {
      throw new Error("Your request was saved, but available slots could not be loaded. Please try again.");
    }

    setSlots(slotsResult.slots);

    setFeedback({
      type: "success",
      message: "Your details have been saved. Please select an appointment time.",
    });
  } catch (error) {
    setFeedback({
      type: "error",
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
    });
  } finally {
    setLoading(false);
    setSlotsLoading(false);
  }
}

async function handleBooking() {
  if (!consultationId || !selectedSlot) {
    setFeedback({
      type: "error",
      message: "Please select an appointment time.",
    });
    return;
  }

  setBookingLoading(true);
  setFeedback(null);

  try {
    const response = await fetch("/api/consult", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        consultationId,
        scheduledAt: selectedSlot,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      if (response.status === 409) {
        const slotsResponse = await fetch("/api/consult", {
          cache: "no-store",
        });
        const slotsResult: SlotsResponse = await slotsResponse.json();

        if (slotsResponse.ok && slotsResult.success) {
          setSlots(slotsResult.slots);
        }
      }

      throw new Error(result.message || "Unable to book this appointment.");
    }

    setFeedback({
      type: "success",
      message: `Your appointment is reserved for ${new Intl.DateTimeFormat(
        "en-IN",
        {
          dateStyle: "full",
          timeStyle: "short",
          timeZone: "Asia/Kolkata",
        }
      ).format(new Date(selectedSlot))}.`,
    });
  } catch (error) {
    setFeedback({
      type: "error",
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
    });
  } finally {
    setBookingLoading(false);
  }
}

  const inputClass =
    "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

  return (
    <div className="mx-auto w-full max-w-2xl rounded-3xl border border-gray-200 bg-white p-6 shadow-xl sm:p-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
          Consult our team
        </p>
        <h3 className="mt-3 text-3xl font-semibold text-gray-950">
          Tell us about your project.
        </h3>
        <p className="mt-3 text-gray-500">
          Share your requirements and we'll help you find the right IoT
          connectivity solution.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Full name *
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={inputClass}
            placeholder="Your name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={inputClass}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Phone number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              className={inputClass}
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label
              htmlFor="company"
              className="text-sm font-medium text-gray-700"
            >
              Company
            </label>
            <input
              id="company"
              name="company"
              value={form.company}
              onChange={handleChange}
              className={inputClass}
              placeholder="Company name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="message" className="text-sm font-medium text-gray-700">
            Tell us about your project *
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={form.message}
            onChange={handleChange}
            className={inputClass}
            placeholder="Describe your IoT requirements..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message}</p>
          )}
        </div>
        
        {consultationId !== null && (
  <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
    <div>
      <h4 className="text-lg font-semibold text-gray-900">
        Choose an appointment time
      </h4>
      <p className="mt-1 text-sm text-gray-500">
        Select a convenient 30-minute slot. All times are in Indian Standard Time (IST).
      </p>
    </div>

    {slotsLoading ? (
      <p className="text-sm text-gray-500">Loading available slots...</p>
    ) : slots.length === 0 ? (
      <p className="text-sm text-gray-500">
        No available slots found. Please try again later.
      </p>
    ) : (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {slots.map((slot) => (
          <button
            key={slot.start}
            type="button"
            onClick={() => setSelectedSlot(slot.start)}
            className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
              selectedSlot === slot.start
                ? "border-orange-600 bg-orange-600 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-orange-400"
            }`}
          >
            {slot.label}
          </button>
        ))}
      </div>
    )}

    <button
      type="button"
      onClick={handleBooking}
      disabled={!selectedSlot || bookingLoading || slotsLoading}
      className="w-full rounded-full bg-gray-950 px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {bookingLoading ? "Confirming appointment..." : "Confirm appointment"}
    </button>
  </div>
)}

        {feedback && (
          <div
            role="status"
            aria-live="polite"
            className={`rounded-xl p-4 text-sm ${
              feedback.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-orange-600 px-7 py-4 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit consultation request"}
        </button>
      </form>
    </div>
  );
}
