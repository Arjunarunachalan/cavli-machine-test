
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Hubble",
  description:
    "Learn how Hubble collects, uses, and protects your personal information.",
};

const sections = [
  {
    title: "1. Information We Collect",
    content: (
      <>
        <p>When you use our consultation booking service, we may collect:</p>
        <ul>
          <li>Full name</li>
          <li>Email address</li>
          <li>Phone number, if provided</li>
          <li>Company name, if provided</li>
          <li>Project details and messages submitted through our form</li>
          <li>Your selected consultation date and time</li>
        </ul>
      </>
    ),
  },
  {
    title: "2. How We Use Your Information",
    content: (
      <>
        <p>We use the information collected to:</p>
        <ul>
          <li>Respond to consultation requests.</li>
          <li>Schedule and manage consultation appointments.</li>
          <li>Create calendar events for confirmed appointments.</li>
          <li>Generate Google Meet links when supported and authorized.</li>
          <li>Send appointment confirmations and related communications.</li>
          <li>Maintain and improve our services.</li>
        </ul>
      </>
    ),
  },
  {
    title: "3. Google Calendar and Google Meet",
    content: (
      <>
        <p>
          If you authorize our application through Google OAuth, we may use
          the Google Calendar API to create and manage calendar events
          associated with your consultation.
        </p>
        <p>
          Our application requests the Google Calendar events permission.
          Access is subject to the authorization you grant through your
          Google account.
        </p>
        <p>
          Google Calendar data is used only for the appointment-related
          functionality described in this policy. We do not sell Google
          user data or use it for advertising.
        </p>
        <p>
          You can revoke the application's Google account access through
          your Google Account security settings.
        </p>
        <p>
          Google services are also subject to Google's own privacy policy:
          {" "}
          <a href="https://policies.google.com/privacy" target="_blank"
             rel="noopener noreferrer">
            Google Privacy Policy
          </a>.
        </p>
      </>
    ),
  },
  {
    title: "4. Data Sharing",
    content: (
      <>
        <p>
          We do not sell personal information. Information may be processed
          by service providers necessary to operate the application, such as
          database hosting, application hosting, and Google Calendar.
        </p>
        <p>
          Information may also be disclosed where required by applicable law
          or to protect the security and integrity of our services.
        </p>
      </>
    ),
  },
  {
    title: "5. Data Storage and Security",
    content: (
      <>
        <p>
          Consultation details and appointment information are stored in
          our application database. We use reasonable technical and
          organisational measures to protect stored information against
          unauthorized access, alteration, disclosure, or destruction.
        </p>
        <p>
          No internet-based service can guarantee absolute security.
        </p>
      </>
    ),
  },
  {
    title: "6. Data Retention",
    content: (
      <p>
        We retain personal information only for as long as reasonably
        necessary to manage consultation requests, appointments, business
        records, and applicable legal obligations. Information that is no
        longer required should be securely deleted or anonymised.
      </p>
    ),
  },
  {
    title: "7. Your Privacy Rights",
    content: (
      <>
        <p>
          Subject to applicable law, you may request access to, correction
          of, or deletion of your personal information. You may also request
          information about how your data is processed.
        </p>
        <p>
          To submit a privacy-related request, contact us using the details
          provided below.
        </p>
      </>
    ),
  },
  {
    title: "8. Children's Privacy",
    content: (
      <p>
        This service is intended for business and professional use and is
        not directed at children. We do not knowingly collect personal
        information from children through this service.
      </p>
    ),
  },
  {
    title: "9. Changes to This Policy",
    content: (
      <p>
        We may update this Privacy Policy when our services or data
        processing practices change. Updated versions will be published
        on this page with a revised effective date.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <a href="/" className="text-2xl font-bold tracking-tight">
            HUBBLE<span className="text-orange-600">.</span>
          </a>
          <a
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-orange-600"
          >
            Back to home
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
          Legal information
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Privacy Policy
        </h1>

        <p className="mt-4 text-sm text-gray-500">
          Effective date: November 3, 2026
        </p>

        <p className="mt-8 leading-7 text-gray-600">
          This Privacy Policy explains how Hubble Consultation Booking
          collects, uses, stores, and protects information when you use
          our website and consultation booking service.
        </p>

        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold">
                {section.title}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-gray-600 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_a]:text-orange-600 [&_a]:underline">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-12 rounded-2xl bg-gray-50 p-6">
          <h2 className="text-xl font-semibold">10. Contact Us</h2>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            If you have questions about this Privacy Policy or how your
            personal information is handled, please contact the application
            operator.
          </p>
          <p className="mt-3 text-sm font-medium text-gray-900">
            Contact email: [ADD YOUR OFFICIAL CONTACT EMAIL]
          </p>
        </section>
      </section>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        © 2026 Hubble. All rights reserved.
      </footer>
    </main>
  );
}
