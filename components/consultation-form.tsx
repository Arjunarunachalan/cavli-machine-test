
"use client";

import { useState, type FormEvent } from "react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

interface ConsultationData {
  id: number;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  scheduledAt?: string | null;
  calendarEventId?: string | null;
  meetLink?: string | null;
}

interface ApiResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
  data?: ConsultationData;
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

  const [bookingConfirmation, setBookingConfirmation] =
    useState<ConsultationData | null>(null);

  const [copySuccess, setCopySuccess] = useState(false);

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
    setBookingConfirmation(null);
    setConsultationId(null);
    setSelectedSlot("");
    setSlots([]);

    try {
      // 1. Save consultation details.
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

      // 2. Store consultation ID.
      setConsultationId(result.data.id);

      // 3. Retrieve available appointment slots.
      setSlotsLoading(true);

      const slotsResponse = await fetch("/api/consult", {
        method: "GET",
        cache: "no-store",
      });

      const slotsResult: SlotsResponse = await slotsResponse.json();

      if (!slotsResponse.ok || !slotsResult.success) {
        throw new Error(
          "Your request was saved, but available slots could not be loaded. Please try again."
        );
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

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success || !result.data) {
        if (response.status === 409) {
          const slotsResponse = await fetch("/api/consult", {
            cache: "no-store",
          });

          const slotsResult: SlotsResponse = await slotsResponse.json();

          if (slotsResponse.ok && slotsResult.success) {
            setSlots(slotsResult.slots);
          }

          setSelectedSlot("");
        }

        throw new Error(
          result.message || "Unable to book this appointment."
        );
      }

      // Save the complete booking response.
      setBookingConfirmation(result.data);

      setFeedback({
        type: "success",
        message: "Your consultation has been successfully booked!",
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

  async function handleCopyMeetLink() {
    if (!bookingConfirmation?.meetLink) return;

    try {
      await navigator.clipboard.writeText(bookingConfirmation.meetLink);
      setCopySuccess(true);

      window.setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch {
      setFeedback({
        type: "error",
        message: "Unable to copy the meeting link. Please copy it manually.",
      });
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

  const appointmentDate = bookingConfirmation?.scheduledAt
    ? new Date(bookingConfirmation.scheduledAt)
    : selectedSlot
      ? new Date(selectedSlot)
      : null;

  const formattedAppointment = appointmentDate
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      }).format(appointmentDate)
    : "";

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
          Share your requirements and we&apos;ll help you find the right IoT
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
            disabled={bookingConfirmation !== null}
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
            disabled={bookingConfirmation !== null}
          />

          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700"
            >
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
              disabled={bookingConfirmation !== null}
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
              disabled={bookingConfirmation !== null}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="message"
            className="text-sm font-medium text-gray-700"
          >
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
            disabled={bookingConfirmation !== null}
          />

          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message}</p>
          )}
        </div>

        {consultationId !== null && !bookingConfirmation && (
          <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                Choose an appointment time
              </h4>

              <p className="mt-1 text-sm text-gray-500">
                Select a convenient 30-minute slot. All times are in Indian
                Standard Time (IST).
              </p>
            </div>

            {slotsLoading ? (
              <p className="text-sm text-gray-500">
                Loading available slots...
              </p>
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
              disabled={
                !selectedSlot ||
                bookingLoading ||
                slotsLoading
              }
              className="w-full rounded-full bg-gray-950 px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {bookingLoading
                ? "Confirming appointment..."
                : "Confirm appointment"}
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

        {bookingConfirmation && (
          <div className="space-y-5 rounded-2xl border border-green-200 bg-green-50 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-green-900">
                  Appointment confirmed!
                </h4>

                <p className="text-sm text-green-700">
                  Your consultation has been successfully scheduled.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-green-200 bg-white p-4">
              <p className="text-sm font-medium text-gray-500">
                Appointment date and time
              </p>

              <p className="mt-2 font-semibold text-gray-900">
                {formattedAppointment}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Duration: 30 minutes · Indian Standard Time
              </p>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-500">
                  Confirmation status
                </p>

                <p className="mt-1 font-semibold text-green-700">
                  {bookingConfirmation.status}
                </p>
              </div>
            </div>

            {bookingConfirmation.meetLink ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">
                  Your Google Meet link
                </p>

                <div className="break-all rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
                  {bookingConfirmation.meetLink}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <a
                    href={bookingConfirmation.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
                  >
                    Join Google Meet
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyMeetLink}
                    className="rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                  >
                    {copySuccess ? "Link copied!" : "Copy meeting link"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">
                Your appointment is confirmed. The Google Meet link is not
                available yet. Please check your calendar invitation.
              </p>
            )}

            <p className="text-center text-sm text-green-800">
              A calendar invitation has been sent to {bookingConfirmation.email}.
            </p>
          </div>
        )}

        {!bookingConfirmation && (
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-orange-600 px-7 py-4 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit consultation request"}
          </button>
        )}
      </form>
    </div>
  );
}
