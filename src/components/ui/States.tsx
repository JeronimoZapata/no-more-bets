import { LoaderCircle, PartyPopper } from 'lucide-react'
import type { ReactNode } from 'react'

export function Loading({ label = 'Cargando...' }: { label?: string }) { return <div className="grid min-h-56 place-items-center"><div className="flex items-center gap-3 font-bold"><LoaderCircle className="animate-spin" /> {label}</div></div> }
export function ErrorState({ message = 'No pudimos cargar esto.', action }: { message?: string; action?: ReactNode }) { return <div className="card mx-auto max-w-lg text-center"><div className="text-4xl">😵</div><p className="my-3 font-bold">{message}</p>{action}</div> }
export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) { return <div className="card grid min-h-64 place-items-center text-center"><div><PartyPopper className="mx-auto mb-3 h-10 w-10"/><h2 className="font-display text-2xl font-black uppercase">{title}</h2><p className="mx-auto my-3 max-w-md text-ink/65">{children}</p>{action}</div></div> }
