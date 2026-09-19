import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null
  return <div className="fixed inset-0 z-50 grid place-items-end bg-ink/60 p-0 sm:place-items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div role="dialog" aria-modal="true" className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border-2 border-ink bg-paper p-5 shadow-brutal-lg sm:max-w-lg sm:rounded-3xl">
      <div className="mb-5 flex items-center justify-between"><h2 className="font-display text-2xl font-black uppercase">{title}</h2><Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar"><X /></Button></div>
      {children}
    </div>
  </div>
}
