
export default function CancellationPolicy() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero */}
      <section className="bg-[#0B1220] px-5 pb-16 pt-24 text-white sm:px-8 sm:pb-20 sm:pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-sky-400">
            Cancellation Rules
          </p>

          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl">
            Cancellation{" "}
            <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            We understand that plans can change. Our cancellation and
            rescheduling policy is designed to keep the process simple,
            transparent, and fair.
          </p>
        </div>
      </section>

      {/* Policy Content */}
      <section className="px-5 py-12 sm:px-8 sm:py-16 lg:pb-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-sky-600">
              Cancellation Policy
            </p>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Cancellation &amp; Rescheduling
            </h2>

            <p className="mt-4 max-w-3xl leading-7 text-slate-600">
              Circumstances can change. Please review the following rules
              before cancelling or rescheduling your inspection appointment.
            </p>
          </div>

          {/* Policy Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Free Cancellation */}
            <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-slate-900/5">
              <div className="absolute left-0 top-0 h-1 w-full bg-sky-400 transition-all duration-300 group-hover:bg-blue-600" />

              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-2xl font-bold text-sky-600 transition-colors duration-300 group-hover:bg-sky-100">
                  <span aria-hidden="true">✓</span>
                </div>

                <span className="text-5xl font-black tracking-tight text-slate-100 transition-colors duration-300 group-hover:text-sky-100">
                  01
                </span>
              </div>

              <div className="mt-8">
                <span className="inline-flex rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-700">
                  No Cancellation Fee
                </span>

                <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
                  Free Cancellation
                </h3>

                <p className="mt-4 leading-7 text-slate-600">
                  Cancel or reschedule your inspection{" "}
                  <strong className="font-bold text-slate-900">
                    up to 2 hours before
                  </strong>{" "}
                  your scheduled appointment without a cancellation fee.
                </p>

                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  <p className="text-sm font-semibold text-slate-700">
                    At least 2 hours before your slot
                  </p>
                </div>
              </div>
            </article>

            {/* Late Cancellation */}
            <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-slate-900/5">
              <div className="absolute left-0 top-0 h-1 w-full bg-[#0B1220] transition-colors duration-300 group-hover:bg-blue-600" />

              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B1220] text-2xl font-bold text-sky-400 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
                  <span aria-hidden="true">!</span>
                </div>

                <span className="text-5xl font-black tracking-tight text-slate-100 transition-colors duration-300 group-hover:text-sky-100">
                  02
                </span>
              </div>

              <div className="mt-8">
                <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700">
                  Late Cancellation
                </span>

                <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
                  Late Cancellation Fee
                </h3>

                <p className="mt-4 leading-7 text-slate-600">
                  Cancellations requested{" "}
                  <strong className="font-bold text-slate-900">
                    within 2 hours
                  </strong>{" "}
                  of the scheduled inspection time will incur a cancellation
                  fee.
                </p>

                <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                  <p className="text-sm font-semibold text-slate-700">
                    Applicable fee
                  </p>

                  <p className="text-2xl font-black text-sky-600">
                    ₹399
                  </p>
                </div>
              </div>
            </article>
          </div>

          {/* Quick Summary */}
          <div className="relative mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-[#0B1220] p-8 text-white shadow-sm md:p-10">
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-sky-400 to-blue-600" />

            <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
                  Quick Summary
                </p>

                <h3 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Plans changed? No problem.
                </h3>

                <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                  Cancel or reschedule at least 2 hours before your appointment
                  to avoid the cancellation fee.
                </p>
              </div>

              <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-7 py-6 text-center">
                <p className="text-3xl font-black text-sky-400">
                  ₹399
                </p>

                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                  Within 2 Hours
                </p>
              </div>
            </div>
          </div>

          {/* Reminder */}
          <p className="mt-8 text-center text-sm leading-7 text-slate-500">
            To cancel or reschedule your inspection, please contact
            CarPDIExpert through your official booking communication channel.
          </p>
        </div>
      </section>
    </main>
  );
}
