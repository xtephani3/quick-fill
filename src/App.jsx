function App() {
  return (
    <main className="min-h-svh overflow-x-hidden bg-slate-50 text-slate-600">
      <header
        className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8 max-[520px]:flex-col max-[520px]:items-start"
        aria-label="Application header"
      >
        <a
          className="inline-flex items-center gap-2.5 font-bold text-slate-900 no-underline"
          href="/"
          aria-label="Quick Fill home"
        >
          <span
            className=" size-9 place-items-center hidden rounded-lg bg-teal-800 text-[13px] font-bold text-white"
            aria-hidden="true"
          >
            QF
          </span>
          <span>Quick Fill</span>
        </a>

        <nav
          className="flex gap-2 max-[520px]:w-full"
          aria-label="Primary navigation"
        >
          <a
            className="inline-flex min-h-10 items-center rounded-lg px-3.5 text-slate-600 no-underline hover:bg-teal-50 hover:text-slate-900 focus-visible:bg-teal-50 focus-visible:text-slate-900 max-[520px]:flex-1 max-[520px]:justify-center"
            href="#recent"
          >
            Recent
          </a>
          <a
            className="inline-flex min-h-10 items-center rounded-lg px-3.5 text-slate-600 no-underline hover:bg-teal-50 hover:text-slate-900 focus-visible:bg-teal-50 focus-visible:text-slate-900 max-[520px]:flex-1 max-[520px]:justify-center"
            href="#support"
          >
            Support
          </a>
        </nav>
      </header>

      <section
        className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] lg:gap-12 lg:px-8 lg:py-20"
        aria-labelledby="upload-title"
      >
        <div className="text-left">
          <p className="mb-3 text-[13px] font-extrabold uppercase tracking-widest text-orange-700">
            PDF workspace
          </p>
          <h1
            className="mb-4 max-w-2xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl sm:leading-none lg:text-7xl"
            id="upload-title"
          >
            Upload a PDF to get started
          </h1>
          <p className="max-w-xl text-lg leading-7 sm:text-lg sm:leading-8">
            Choose a document from your device.
          </p>
        </div>

        <section
          className="rounded-lg border border-slate-200 bg-white/90 p-3 shadow-[0_18px_50px_rgba(22,28,36,0.1)] sm:p-4 sm:shadow-[0_24px_70px_rgba(22,28,36,0.12)]"
          aria-label="PDF upload area"
        >
          <label
            className="grid min-h-64 cursor-pointer place-items-center content-center gap-4 rounded-lg border-2 border-dashed border-teal-300 bg-teal-50/40 p-5 text-slate-600 hover:border-teal-800 hover:bg-teal-50 sm:min-h-[300px] sm:gap-5 sm:p-6 lg:min-h-[340px] lg:p-8"
            htmlFor="pdf-upload"
          >
            <span
              className="grid size-16 place-items-center rounded-lg bg-teal-100 text-teal-800 sm:size-[76px]"
              aria-hidden="true"
            >
              <svg
                className="size-8 fill-none stroke-current stroke-[1.8] sm:size-[34px]"
                viewBox="0 0 24 24"
                role="presentation"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3v12" />
                <path d="m7 8 5-5 5 5" />
                <path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
              </svg>
            </span>

            <span className="grid gap-1.5 text-center">
              <strong className="text-xl text-slate-900 sm:text-2xl">
                Drop your PDF here
              </strong>
              <span>or browse files from your computer</span>
            </span>

            <span className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-teal-800 px-5 font-bold text-white sm:w-auto">
              Select PDF
            </span>
          </label>

          <input
            className="sr-only"
            id="pdf-upload"
            type="file"
            accept="application/pdf"
          />

          <div className="flex flex-col gap-2 px-1 pt-4 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-2.5">
            <span>PDF only</span>
            <span>Up to 25 MB</span>
            <span>No file selected</span>
          </div>
        </section>
      </section>

      <section
        className="mx-auto flex w-full max-w-6xl flex-col items-stretch gap-5 border-t border-slate-200 px-4 py-8 text-left sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-8 lg:pb-14"
        id="recent"
        aria-labelledby="recent-title"
      >
        <div>
          <p className="mb-3 text-[13px] font-extrabold uppercase tracking-widest text-orange-700">
            Recent documents
          </p>
          <h2
            className="m-0 text-2xl leading-tight text-slate-900 sm:text-3xl lg:text-[38px]"
            id="recent-title"
          >
            Your uploaded files will appear here
          </h2>
        </div>

        <div
          className="flex w-full min-w-0 items-center gap-3.5 rounded-lg border border-slate-200 bg-white p-4 lg:max-w-[420px]"
          aria-label="Empty recent file placeholder"
        >
          <span
            className="grid h-14 w-12 shrink-0 place-items-center rounded-md bg-red-700 text-xs font-extrabold text-white"
            aria-hidden="true"
          >
            PDF
          </span>
          <div>
            <strong className="text-slate-900">No PDF selected</strong>
            <p className="mt-0.5 text-[15px]">
              Upload a document to see its details.
            </p>
          </div>
        </div>
      </section>

      <section
        className="mx-auto flex w-full max-w-6xl flex-col items-stretch gap-5 border-t border-slate-200 px-4 py-8 pb-12 text-left sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-8 lg:pb-14"
        id="support"
        aria-labelledby="support-title"
      >
        <div>
          <p className="mb-3 text-[13px] font-extrabold uppercase tracking-widest text-orange-700">
            Support
          </p>
          <h2
            className="m-0 text-2xl leading-tight text-slate-900 sm:text-3xl lg:text-[38px]"
            id="support-title"
          >
            Need help with Quick Fill?
          </h2>
        </div>

        <a
          className="flex w-full min-w-0 items-center gap-3.5 rounded-lg border border-slate-200 bg-white p-4 text-slate-600 no-underline hover:border-teal-300 hover:bg-teal-50 focus-visible:border-teal-300 focus-visible:bg-teal-50 lg:max-w-[420px]"
          href="mailto:thequickfill@gmail.com"
          aria-label="Email Quick Fill support at thequickfill@gmail.com"
        >
          <span
            className="grid h-14 w-12 shrink-0 place-items-center rounded-md bg-teal-800 text-xs font-extrabold text-white"
            aria-hidden="true"
          >
            @
          </span>
          <div className="min-w-0">
            <strong className="text-slate-900">Email support</strong>
            <p className="mt-0.5 break-all text-[15px]">
              thequickfill@gmail.com
            </p>
          </div>
        </a>
      </section>
    </main>
  )
}

export default App
