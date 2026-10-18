import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";


export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "Read how CarpdiExpert handles information submitted through enquiries, inspection bookings and customer support.",
  path: "/info/privacy-policy",
});

const sections = [
  {
    title: "1. Information We Collect",
    body:
      "When you enquire about or book a CarPDIExpert service, we may collect your name, phone number, contact details, vehicle make and model, dealership or inspection location, preferred appointment date and time, and other information necessary to arrange your inspection.",
  },
  {
    title: "2. How We Use Your Information",
    body:
      "We use your information to respond to enquiries, schedule and manage vehicle inspections, coordinate with assigned inspectors, communicate booking confirmations and updates, prepare and deliver inspection reports, provide customer support, process payments where applicable, and maintain necessary business records.",
  },
  {
    title: "3. Information Sharing",
    body:
      "Your information may be shared with the inspector assigned to your booking and with service providers who help us operate our website, manage bookings, process payments, or provide customer support. We may also disclose information when required by applicable law. We do not sell your personal information to third parties for their marketing purposes.",
  },
  {
    title: "4. Data Security and Retention",
    body:
      "CarPDIExpert takes reasonable steps to protect personal information against unauthorised access, misuse, loss, or disclosure. Information is retained for as long as reasonably necessary to provide our services, maintain business and transaction records, resolve disputes, and meet applicable legal obligations. No method of online transmission or electronic storage can be guaranteed to be completely secure.",
  },
  {
    title: "5. Cookies and Website Usage",
    body:
      "Our website may use cookies or similar technologies where enabled to support website functionality, remember preferences, understand website usage, and improve the user experience. The information collected depends on the technologies and services actually enabled on our website and your browser settings.",
  },
  {
    title: "6. Your Privacy Rights",
    body:
      "You may contact CarPDIExpert to ask about personal information associated with you or to request access, correction, or deletion, subject to applicable law and legitimate business record-retention requirements. We may need to verify your identity before acting on a request.",
  },
  {
    title: "7. Third-Party Services and Links",
    body:
      "Our website or booking process may use third-party services for functions such as hosting, database storage, communications, maps, or payments. Those providers may process information under their own applicable privacy terms. We encourage you to review their policies when using their services.",
  },
  {
    title: "8. Children's Privacy",
    body:
      "Our vehicle inspection services are intended for people arranging vehicle-related services, not specifically for children. Please contact us if you believe a child has provided personal information to us and you would like us to review the matter.",
  },
  {
    title: "9. Changes to This Policy",
    body:
      "We may update this Privacy Policy when our services, data practices, or legal obligations change. Any revised version will be published on this page with an updated revision date.",
  },
  {
    title: "10. Contact Us",
    body:
      "For privacy-related questions or requests concerning your personal information, contact CarPDIExpert using the official contact details published on our website.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-[#0B1220] px-5 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">
            Legal Information
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            How CarPDIExpert collects, uses, shares, and protects information
            when you use our website or request our vehicle inspection services.
          </p>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 sm:py-16">
        <article className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm leading-7 text-slate-600">
            This policy describes how personal information may be handled in
            connection with CarPDIExpert services. It should reflect the
            technologies, service providers, and data practices actually used
            by the business.
          </p>

          <div className="mt-8 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-bold text-slate-900">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
