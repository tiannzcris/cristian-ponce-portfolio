import { useEffect, useRef } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import type { Certificate } from '../content'

type Props = { certificate: Certificate; onClose: () => void }

export default function CertificateDialog({ certificate, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current!
    const previous = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    element.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
      previous?.focus({ preventScroll: true })
    }
  }, [])

  return (
    <dialog
      className="certificate-dialog"
      ref={dialog}
      aria-labelledby="certificate-title"
      aria-describedby="certificate-detail"
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]'),
        )
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="dialog-content">
        <div className="dialog-header">
          <div>
            <span className="eyebrow">{certificate.category}</span>
            <h2 id="certificate-title">{certificate.title}</h2>
            <p id="certificate-detail">{certificate.dateLabel}</p>
          </div>
          <button
            className="icon-button"
            aria-label="Close certificate"
            autoFocus
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        <div className="certificate-full">
          <img src={certificate.image} alt={certificate.alt} />
        </div>
        <div className="dialog-footer">
          <span>Certificate preview</span>
          <a href={certificate.image} target="_blank" rel="noopener noreferrer">
            Open full resolution <ArrowUpRight size={16} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </dialog>
  )
}
