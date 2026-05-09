function App() {
  return (
    <main className="min-h-svh bg-slate-50 text-slate-600">
      <header
        className="mx-auto flex w-[min(1120px,calc(100%-40px))] items-center justify-between gap-5 py-6 max-[520px]:w-[calc(100%-32px)] max-[520px]:flex-col max-[520px]:items-start md:w-[min(1120px,calc(100%-40px))]"
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
        className="mx-auto grid w-[min(1120px,calc(100%-40px))] grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] items-center gap-12 py-20 max-[820px]:w-[calc(100%-32px)] max-[820px]:grid-cols-1 max-[820px]:gap-7 max-[820px]:py-12"
        aria-labelledby="upload-title"
      >
        <div className="text-left">
          <p className="mb-3 text-[13px] font-extrabold uppercase tracking-widest text-orange-700">
            PDF workspace
          </p>
          <h1
            className="mb-5 max-w-2xl text-[clamp(42px,7vw,76px)] font-bold leading-none text-slate-900"
            id="upload-title"
          >
            Upload a PDF to get started
          </h1>
          <p className="max-w-xl text-[19px] leading-8">
            Choose a document from your device and prepare it for viewing,
            editing, and downloading.
          </p>
        </div>

        <section
          className="rounded-lg border border-slate-200 bg-white/90 p-4 shadow-[0_24px_70px_rgba(22,28,36,0.12)]"
          aria-label="PDF upload area"
        >
          <label
            className="grid min-h-[340px] cursor-pointer place-items-center content-center gap-5 rounded-lg border-2 border-dashed border-teal-300 bg-teal-50/40 p-8 text-slate-600 hover:border-teal-800 hover:bg-teal-50 max-[820px]:min-h-[300px] max-[820px]:p-6"
            htmlFor="pdf-upload"
          >
            <span
              className="grid size-[76px] place-items-center rounded-lg bg-teal-100 text-teal-800"
              aria-hidden="true"
            >
              <svg
                className="size-[34px] fill-none stroke-current stroke-[1.8]"
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
              <strong className="text-2xl text-slate-900 max-[520px]:text-[21px]">
                Drop your PDF here
              </strong>
              <span>or browse files from your computer</span>
            </span>

            <span className="inline-flex min-h-11 items-center justify-center rounded-lg bg-teal-800 px-5 font-bold text-white">
              Select PDF
            </span>
          </label>

          <input
            className="sr-only"
            id="pdf-upload"
            type="file"
            accept="application/pdf"
          />

          <div className="flex flex-wrap justify-between gap-2.5 px-1 pt-4 text-sm text-slate-500 max-[520px]:flex-col">
            <span>PDF only</span>
            <span>Up to 25 MB</span>
            <span>No file selected</span>
          </div>
        </section>
      </section>

      <section
        className="mx-auto flex w-[min(1120px,calc(100%-40px))] items-center justify-between gap-6 border-t border-slate-200 py-8 pb-14 text-left max-[820px]:w-[calc(100%-32px)] max-[820px]:flex-col max-[820px]:items-stretch"
        id="recent"
        aria-labelledby="recent-title"
      >
        <div>
          <p className="mb-3 text-[13px] font-extrabold uppercase tracking-widest text-orange-700">
            Recent documents
          </p>
          <h2
            className="m-0 text-[clamp(26px,4vw,38px)] leading-tight text-slate-900"
            id="recent-title"
          >
            Your uploaded files will appear here
          </h2>
        </div>

        <div
          className="flex min-w-[min(420px,100%)] items-center gap-3.5 rounded-lg border border-slate-200 bg-white p-4"
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
    </main>
  )
}

export default App
