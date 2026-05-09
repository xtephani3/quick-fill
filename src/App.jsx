import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const MAX_PDF_SIZE = 25 * 1024 * 1024
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? ''
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? ''

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatUploadedTime(date) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
  }).format(date)
}

function getUploadErrorMessage(error) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Upload failed. Try again with another PDF.'
}

function isPdfFile(file) {
  const name = file.name.toLowerCase()

  return file.type === 'application/pdf' || name.endsWith('.pdf')
}

function uploadPdfToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()

    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

    xhr.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    )

    xhr.upload.addEventListener('progress', (event) => {
      if (!event.lengthComputable) {
        return
      }

      const progress = Math.round((event.loaded / event.total) * 100)
      onProgress(progress)
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText))
        return
      }

      try {
        const response = JSON.parse(xhr.responseText)
        reject(new Error(response.error?.message ?? 'Cloudinary upload failed.'))
      } catch {
        reject(new Error('Cloudinary upload failed.'))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Network error while uploading to Cloudinary.'))
    })

    xhr.send(formData)
  })
}

function App() {
  const [dragActive, setDragActive] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [previewPage, setPreviewPage] = useState(1)
  const [previewError, setPreviewError] = useState('')
  const [recentDocuments, setRecentDocuments] = useState([])
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [uploadState, setUploadState] = useState({
    error: '',
    progress: 0,
    status: 'idle',
  })

  const fileInputRef = useRef(null)
  const previewCloseButtonRef = useRef(null)
  const objectUrlRef = useRef(null)
  const uploadRequestRef = useRef(0)

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isPreviewOpen) {
      document.body.style.overflow = ''
      return undefined
    }

    document.body.style.overflow = 'hidden'
    previewCloseButtonRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsPreviewOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPreviewOpen])

  const cloudinaryConfigured = Boolean(
    CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET,
  )
  const previewFile = selectedDocument?.localUrl ?? null

  function updateRecentDocuments(nextDocument) {
    setRecentDocuments((currentDocuments) => {
      const remainingDocuments = currentDocuments.filter(({ id }) => id !== nextDocument.id)
      return [nextDocument, ...remainingDocuments].slice(0, 4)
    })
  }

  function resetInput() {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function prepareDocument(file) {
    if (!isPdfFile(file)) {
      setUploadState({
        error: 'Only PDF files are supported.',
        progress: 0,
        status: 'error',
      })
      resetInput()
      return
    }

    if (file.size > MAX_PDF_SIZE) {
      setUploadState({
        error: 'The selected file is larger than 25 MB.',
        progress: 0,
        status: 'error',
      })
      resetInput()
      return
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
    }

    const nextObjectUrl = URL.createObjectURL(file)
    objectUrlRef.current = nextObjectUrl

    const documentId = crypto.randomUUID()
    const documentDate = new Date()
    const nextDocument = {
      hostedUrl: '',
      id: documentId,
      localUrl: nextObjectUrl,
      name: file.name,
      pages: 0,
      sizeLabel: formatFileSize(file.size),
      statusLabel: cloudinaryConfigured ? 'Uploading to Cloudinary' : 'Preview only',
      uploadedAt: formatUploadedTime(documentDate),
    }

    uploadRequestRef.current += 1
    const requestId = uploadRequestRef.current

    setPageCount(0)
    setIsPreviewOpen(true)
    setPreviewError('')
    setPreviewPage(1)
    setSelectedDocument(nextDocument)

    if (!cloudinaryConfigured) {
      setUploadState({
        error: 'Your PDF is ready for preview.',
        progress: 0,
        status: 'needs-config',
      })
      updateRecentDocuments(nextDocument)
      resetInput()
      return
    }

    setUploadState({
      error: '',
      progress: 0,
      status: 'uploading',
    })

    try {
      const uploadResponse = await uploadPdfToCloudinary(file, (progress) => {
        if (uploadRequestRef.current !== requestId) {
          return
        }

        setUploadState({
          error: '',
          progress,
          status: 'uploading',
        })
      })

      if (uploadRequestRef.current !== requestId) {
        return
      }

      const uploadedDocument = {
        ...nextDocument,
        hostedUrl: uploadResponse.secure_url,
        pages: uploadResponse.pages ?? 0,
        publicId: uploadResponse.public_id,
        statusLabel: 'Hosted on Cloudinary',
      }

      setSelectedDocument(uploadedDocument)
      updateRecentDocuments(uploadedDocument)
      setUploadState({
        error: '',
        progress: 100,
        status: 'success',
      })
    } catch (error) {
      if (uploadRequestRef.current !== requestId) {
        return
      }

      setUploadState({
        error: getUploadErrorMessage(error),
        progress: 0,
        status: 'error',
      })
      updateRecentDocuments({
        ...nextDocument,
        statusLabel: 'Preview ready, upload failed',
      })
    } finally {
      resetInput()
    }
  }

  function handleInputChange(event) {
    const [file] = Array.from(event.target.files ?? [])

    if (!file) {
      return
    }

    void prepareDocument(file)
  }

  function handleDragEnter(event) {
    event.preventDefault()
    setDragActive(true)
  }

  function handleDragLeave(event) {
    event.preventDefault()
    setDragActive(false)
  }

  function handleDragOver(event) {
    event.preventDefault()
    setDragActive(true)
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragActive(false)

    const [file] = Array.from(event.dataTransfer.files ?? [])

    if (!file) {
      return
    }

    void prepareDocument(file)
  }

  function handleDocumentLoadSuccess({ numPages }) {
    setPageCount(numPages)
    setPreviewPage(1)
    setPreviewError('')

    setSelectedDocument((currentDocument) => {
      if (!currentDocument) {
        return currentDocument
      }

      return {
        ...currentDocument,
        pages: currentDocument.pages || numPages,
      }
    })
  }

  function handleDocumentLoadError(error) {
    setPreviewError(getUploadErrorMessage(error))
  }

  function showPreviousPage() {
    setPreviewPage((currentPage) => Math.max(1, currentPage - 1))
  }

  function showNextPage() {
    setPreviewPage((currentPage) => Math.min(pageCount, currentPage + 1))
  }

  function openPreview(documentItem = selectedDocument) {
    if (!documentItem?.localUrl) {
      return
    }

    setSelectedDocument(documentItem)
    setPreviewError('')
    setPreviewPage(1)
    setIsPreviewOpen(true)
  }

  function closePreview() {
    setIsPreviewOpen(false)
  }

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
        className="mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,0.88fr)_minmax(360px,1.12fr)] lg:gap-12 lg:px-8 lg:py-20"
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
          <p className="max-w-xl text-base leading-7 sm:text-[19px] sm:leading-8">
            Drop in a document, host it in Cloudinary, and move straight into a
            clean preview view without leaving the workspace.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-slate-500 sm:mt-10">
            <div className="flex flex-col items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center">
              <span
                className={`inline-flex min-h-8 shrink-0 items-center rounded-full px-3 font-semibold ${
                  cloudinaryConfigured
                    ? 'bg-teal-100 text-teal-900'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                {cloudinaryConfigured ? 'Uploads enabled' : 'Preview mode'}
              </span>
              <span>
                {cloudinaryConfigured
                  ? 'Your PDF can be uploaded and previewed here.'
                  : 'You can preview PDFs in this workspace.'}
              </span>
            </div>

            <div className="grid gap-2 rounded-lg border border-slate-200 bg-white p-4">
              <strong className="text-slate-900">Workspace rules</strong>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1">PDF only</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">25 MB max</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  One-page preview navigation
                </span>
              </div>
            </div>
          </div>
        </div>

        <section
          className="rounded-lg border border-slate-200 bg-white/90 p-3 shadow-[0_18px_50px_rgba(22,28,36,0.1)] sm:p-4 sm:shadow-[0_24px_70px_rgba(22,28,36,0.12)]"
          aria-label="PDF upload area"
        >
          <div
            className={`grid gap-4 rounded-lg border-2 border-dashed p-3 transition-colors sm:p-4 ${
              dragActive
                ? 'border-teal-800 bg-teal-50'
                : 'border-slate-200 bg-slate-50/80'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <label
              className={`grid min-h-[220px] cursor-pointer place-items-center content-center gap-4 rounded-lg border border-transparent p-5 text-slate-600 sm:min-h-[240px] sm:gap-5 sm:p-8 ${
                dragActive ? 'bg-white' : 'bg-teal-50/40'
              }`}
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
                  {dragActive ? 'Release to upload your PDF' : 'Drop your PDF here'}
                </strong>
                <span>or browse files from your computer</span>
              </span>

              <span className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-teal-800 px-5 font-bold text-white sm:w-auto">
                Select PDF
              </span>
            </label>

            <input
              ref={fileInputRef}
              className="sr-only"
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              onChange={handleInputChange}
            />

            <div className="flex flex-col gap-2 px-1 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-2.5">
              <span>PDF only</span>
              <span>Up to 25 MB</span>
              <span className="break-all">{selectedDocument?.name ?? 'No file selected'}</span>
            </div>

            {uploadState.status === 'uploading' ? (
              <div
                className="grid gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm"
                aria-live="polite"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <strong className="text-slate-900">Uploading to Cloudinary</strong>
                  <span className="font-semibold text-teal-900">
                    {uploadState.progress}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-teal-100">
                  <div
                    className="h-full rounded-full bg-teal-800 transition-[width] duration-200"
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>
              </div>
            ) : null}

            {uploadState.error ? (
              <p
                className={`rounded-lg px-4 py-3 text-sm ${
                  uploadState.status === 'needs-config'
                    ? 'bg-teal-50 text-teal-900'
                    : 'bg-red-50 text-red-800'
                }`}
                aria-live="polite"
              >
                {uploadState.error}
              </p>
            ) : null}
          </div>

          {selectedDocument ? (
            <div className="mt-4 grid gap-4 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.2em] text-orange-700">
                    Ready
                  </p>
                  <h2 className="break-all text-lg font-bold text-slate-900 sm:text-xl">
                    {selectedDocument.name}
                  </h2>
                </div>

                <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  {selectedDocument.statusLabel}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  {selectedDocument.sizeLabel}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  {selectedDocument.pages ? `${selectedDocument.pages} pages` : 'Reading pages'}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  {selectedDocument.uploadedAt}
                </span>
              </div>

              <div className="grid gap-3 sm:flex sm:flex-wrap">
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-teal-800 px-4 font-semibold text-white"
                  type="button"
                  onClick={() => openPreview(selectedDocument)}
                >
                  Open preview
                </button>

                {selectedDocument.hostedUrl ? (
                  <a
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 font-semibold text-slate-700 no-underline"
                    href={selectedDocument.hostedUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open hosted PDF
                  </a>
                ) : null}

                <label
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 font-semibold text-slate-700"
                  htmlFor="pdf-upload"
                >
                  Choose another file
                </label>
              </div>
            </div>
          ) : null}
        </section>
      </section>

      <section
        className="mx-auto flex w-full max-w-6xl flex-col items-stretch gap-5 border-t border-slate-200 px-4 py-8 text-left sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:gap-6 lg:px-8 lg:pb-14"
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
            Your latest PDF activity appears here
          </h2>
        </div>

        <div className="grid w-full min-w-0 gap-3 lg:max-w-[470px]">
          {recentDocuments.length ? (
            recentDocuments.map((documentItem) => (
              <article
                key={documentItem.id}
                className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex sm:items-center sm:gap-3.5"
              >
                <span
                  className="grid h-14 w-12 shrink-0 place-items-center rounded-md bg-red-700 text-xs font-extrabold text-white"
                  aria-hidden="true"
                >
                  PDF
                </span>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-slate-900">
                    {documentItem.name}
                  </strong>
                  <p className="mt-0.5 text-[15px]">
                    {documentItem.pages
                      ? `${documentItem.pages} pages`
                      : 'Pages loading'}{' '}
                    • {documentItem.sizeLabel} • {documentItem.statusLabel}
                  </p>
                </div>
                <button
                  className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-700"
                  type="button"
                  onClick={() => openPreview(documentItem)}
                >
                  Preview
                </button>
              </article>
            ))
          ) : (
            <div
              className="flex items-center gap-3.5 rounded-lg border border-slate-200 bg-white p-4"
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
          )}
        </div>
      </section>

      <section
        className="mx-auto flex w-full max-w-6xl flex-col items-stretch gap-5 border-t border-slate-200 px-4 py-8 pb-12 text-left sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:gap-6 lg:px-8 lg:pb-14"
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
          className="flex w-full min-w-0 items-center gap-3.5 rounded-lg border border-slate-200 bg-white p-4 text-slate-600 no-underline hover:border-teal-300 hover:bg-teal-50 focus-visible:border-teal-300 focus-visible:bg-teal-50 lg:max-w-[470px]"
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

      {isPreviewOpen && selectedDocument ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-2 backdrop-blur-[2px] sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-modal-title"
          onClick={closePreview}
        >
          <div
            className="flex max-h-[calc(100dvh-16px)] w-full max-w-[980px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-[0_32px_90px_rgba(15,23,42,0.28)] sm:max-h-[min(92dvh,980px)] sm:rounded-[20px]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:px-5">
              <div className="min-w-0">
                <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.2em] text-orange-700">
                  Preview
                </p>
                <h2
                  className="break-all text-lg font-bold text-slate-900 sm:text-xl"
                  id="preview-modal-title"
                >
                  {selectedDocument.name}
                </h2>
              </div>

              <div className="grid gap-2 sm:flex sm:items-center">
                {selectedDocument.hostedUrl ? (
                  <a
                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 no-underline"
                    href={selectedDocument.hostedUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open hosted PDF
                  </a>
                ) : null}
                <button
                  ref={previewCloseButtonRef}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg bg-slate-900 px-3.5 text-sm font-semibold text-white"
                  type="button"
                  onClick={closePreview}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5 lg:flex lg:flex-wrap lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                <span className="rounded-full bg-white px-3 py-1">
                  {selectedDocument.sizeLabel}
                </span>
                <span className="rounded-full bg-white px-3 py-1">
                  {selectedDocument.pages ? `${selectedDocument.pages} pages` : 'Reading pages'}
                </span>
                <span className="rounded-full bg-white px-3 py-1">
                  {selectedDocument.statusLabel}
                </span>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  onClick={showPreviousPage}
                  disabled={previewPage <= 1}
                >
                  Previous
                </button>
                <span className="whitespace-nowrap text-center text-sm font-medium text-slate-500">
                  Page {previewPage}
                  {pageCount ? ` of ${pageCount}` : ''}
                </span>
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  onClick={showNextPage}
                  disabled={!pageCount || previewPage >= pageCount}
                >
                  Next
                </button>
              </div>
            </div>

            <div className="overflow-auto p-3 sm:p-5">
              <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)] sm:rounded-2xl sm:p-3">
                <Document
                  file={previewFile}
                  loading={
                    <div className="grid min-h-[420px] place-items-center text-sm text-slate-500">
                      Loading PDF preview…
                    </div>
                  }
                  onLoadSuccess={handleDocumentLoadSuccess}
                  onLoadError={handleDocumentLoadError}
                >
                  <Page
                    pageNumber={previewPage}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    width={820}
                  />
                </Document>
              </div>

              {previewError ? (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
                  {previewError}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default App
