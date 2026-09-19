import { useEffect, useState } from 'react'
import { ArrowLeft, UsersRound } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../components/ui/Button'
import { ErrorState, Loading } from '../components/ui/States'
import { friendlyError } from '../lib/utils'
import { getInvitePreview, joinGroup } from '../services/groups.service'
import type { InvitePreview } from '../types'

export function JoinGroupPage() {
  const { inviteCode = '' } = useParams(); const navigate = useNavigate(); const [preview, setPreview] = useState<InvitePreview | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  useEffect(() => { let live = true; getInvitePreview(inviteCode).then(v => { if (live) setPreview(v) }).catch(e => { if (live) setError(friendlyError(e, 'Ese código no lleva a ningún grupo.')) }).finally(() => { if (live) setLoading(false) }); return () => { live = false } }, [inviteCode])
  async function join() { if (!preview) return; if (preview.already_member) { navigate(`/groups/${preview.id}`); return } setBusy(true); try { const id = await joinGroup(inviteCode); toast.success('¡Ya sos parte del grupo!'); navigate(`/groups/${id}`) } catch (e) { toast.error(friendlyError(e)) } finally { setBusy(false) } }
  if (loading) return <div className="page"><Loading label="Revisando el código..." /></div>
  if (!preview || error) return <div className="page"><ErrorState message={error} action={<Link to="/home"><Button>Volver al inicio</Button></Link>} /></div>
  return <div className="page"><Link to="/home" className="mb-8 inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={18}/> Volver</Link><div className="card mx-auto max-w-lg text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full border-2 border-ink bg-lilac shadow-brutal"><UsersRound size={38}/></div><p className="mt-7 text-xs font-black uppercase tracking-widest">Te invitaron a</p><h1 className="mt-2 font-display text-4xl font-black uppercase">{preview.name}</h1><p className="mx-auto mt-3 max-w-sm text-ink/60">{preview.description || 'Un grupo listo para dejar de discutir y empezar a hacer.'}</p><p className="mt-5 text-sm">Creado por <strong>{preview.owner_name}</strong></p><Button className="mt-7 w-full" size="lg" onClick={join} disabled={busy}>{busy ? 'Entrando...' : preview.already_member ? 'Ir al grupo' : 'Unirme'}</Button></div></div>
}
