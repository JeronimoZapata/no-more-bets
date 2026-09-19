import { useEffect, useState, type FormEvent } from 'react'
import { Save, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { friendlyError } from '../lib/utils'
import { updateOwnProfile } from '../services/users.service'

export function ProfilePage() {
  const { profile, session, refreshProfile } = useAuth(); const [displayName, setDisplayName] = useState(''); const [username, setUsername] = useState(''); const [busy, setBusy] = useState(false)
  useEffect(() => { setDisplayName(profile?.display_name || ''); setUsername(profile?.username || '') }, [profile])
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); try { await updateOwnProfile(displayName, username); await refreshProfile(); toast.success('Perfil actualizado') } catch (err) { toast.error(friendlyError(err)) } finally { setBusy(false) } }
  return <div className="page"><div className="mx-auto max-w-xl"><header className="mb-7 text-center"><div className="mx-auto grid h-24 w-24 place-items-center rounded-full border-2 border-ink bg-mint shadow-brutal"><UserRound size={46}/></div><h1 className="mt-5 font-display text-4xl font-black uppercase">Tu perfil</h1><p className="text-ink/50">Cambiá cómo te ve la banda.</p></header><form onSubmit={submit} className="card space-y-5"><label className="label">Nombre visible<input className="input mt-1" maxLength={50} value={displayName} onChange={e => setDisplayName(e.target.value)} required /></label><label className="label">Username<input className="input mt-1" pattern="[a-zA-Z0-9_]{3,24}" value={username} onChange={e => setUsername(e.target.value)} required /></label><label className="label">Email<input className="input mt-1 bg-ink/5 text-ink/55" value={session?.user.email || ''} disabled /></label><div className="flex items-center justify-between text-xs font-bold"><span>Rol global</span><span className="rounded-full border border-ink bg-lilac/30 px-3 py-1">{profile?.role}</span></div><Button className="w-full" size="lg" disabled={busy}><Save size={19}/>{busy ? 'Guardando...' : 'Guardar cambios'}</Button></form></div></div>
}
