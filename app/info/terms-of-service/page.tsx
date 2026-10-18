import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";


export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description: "Review the terms and limitations that apply to CarpdiExpert vehicle inspection services and bookings.",
  path: "/info/terms-of-service",
});

export default function Terms() {
  const sections = [
    {
      title: "1. Scope of Service",
      body:
        "CarPDIExpert provides vehicle inspection services that may include visual checks and electronic diagnostic checks, depending on the selected inspection package and vehicle accessibility. Our service is advisory in nature and does not constitute a mechanical warranty, guarantee, or assurance that the vehicle is free from defects.",
    },
    {
      title: "2. Customer Responsibility",
      body:
        "The customer is responsible for ensuring that the vehicle is available for inspection and that the inspector has the necessary access and permission to carry out the agreed checks. Cleanliness, adequate lighting, vehicle accessibility, and dealership or seller restrictions may affect the scope and accuracy of the inspection.",
    },
    {
      title: "3. Surface Conditions and Minor Imperfections",
      body:
        "Minor scratches, swirl marks, dust particles, paint imperfections, or other superficial concerns may not always be visible during an inspection. Environmental conditions, vehicle cleanliness, protective coverings, and dealership preparation may affect visibility. Findings are recorded within the agreed inspection scope and the conditions present at the time.",
    },
    {
      title: "4. Lighting and Environmental Limitations",
      body:
        "Inspection results may be affected by sunlight, reflections, shadows, artificial lighting, weather, dust, and the inspection environment. Certain defects may only be visible under specific conditions and may not be detected if those conditions are unavailable during the inspection.",
    },
    {
      title: "5. Human and Technical Limitations",
      body:
        "CarPDIExpert aims to provide careful and thorough inspections. However, inspections involve human assessment and may use tools or diagnostic equipment with technical limitations. Unintentional oversights can occur, and not every defect or fault can necessarily be identified during an inspection.",
    },
    {
      title: "6. Liability and Inspection Limitations",
      body:
        "The inspection report reflects observations made within the agreed scope and under the conditions present at the time. An inspection is not a guarantee of vehicle condition, future reliability, or freedom from hidden defects. CarPDIExpert cannot warrant the absence of issues that standard inspection procedures are not reasonably capable of detecting. Nothing in these terms excludes or limits liability where such exclusion or limitation is prohibited by applicable law.",
    },
    {
      title: "7. Post-Inspection Changes",
      body:
        "The inspection reflects the vehicle's observed condition at the time of inspection. CarPDIExpert is not responsible for changes, damage, replacements, or other issues arising after the inspection has been completed, including during storage, handling, cleaning, transportation, or delivery by a dealership, seller, or other third party, subject to applicable law.",
    },
    {
      title: "8. Reporting Discrepancies",
      body:
        "If you identify a discrepancy in the inspection report, please contact CarPDIExpert as soon as reasonably possible and provide the relevant details and supporting evidence. Any specific reporting deadline or claim-handling process communicated with your booking will apply, subject to applicable law and your statutory rights.",
    },
    {
      title: "9. Evidence and Verification",
      body:
        "Inspection findings may be based on visual observations, photographs, diagnostic readings, and other information recorded during the inspection. If you raise a concern about a report, CarPDIExpert may review available inspection records and supporting evidence to assess the matter.",
    },
    {
      title: "10. Dealership and Third-Party Handling",
      body:
        "CarPDIExpert does not control a dealership's, seller's, or other third party's handling of a vehicle before or after an inspection. We are not responsible for changes or damage caused by third-party cleaning, polishing, movement, test drives, storage, repairs, or delivery processes, except where responsibility cannot lawfully be excluded.",
    },
    {
      title: "11. Non-Visible and Inaccessible Defects",
      body:
        "Certain defects may not be detectable without dismantling components, invasive procedures, specialised equipment, manufacturer-level access, or testing outside the agreed inspection scope. Hidden internal faults, intermittent issues, and defects in inaccessible areas may therefore remain unidentified. Additional specialist assessment may be recommended where appropriate.",
    },
    {
      title: "12. Customer Acknowledgement",
      body:
        "By booking or proceeding with a CarPDIExpert inspection, the customer acknowledges that the service is an assessment of the vehicle within the agreed scope and at a particular point in time. The report is intended to support an informed decision and should not be treated as a guarantee of vehicle condition or a substitute for any additional professional assessment that may be necessary.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-[#0B1220] px-5 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">
            Legal Information
          </p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Terms of Service
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Please review the terms and limitations that apply when using
            CarPDIExpert's vehicle inspection services.
          </p>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 sm:py-16">
        <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-900">
                  {section.title}
                </h2>

                <p className="text-justify text-sm font-medium leading-8 text-slate-600 sm:text-base">
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
