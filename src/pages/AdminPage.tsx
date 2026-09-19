import { useCallback, useEffect, useState } from 'react'
import { Shield, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../components/ui/Button'
import { ErrorState, Loading } from '../components/ui/States'
import { useAuth } from '../hooks/useAuth'
import { friendlyError } from '../lib/utils'
import { adminUpdateUser, listUsers } from '../services/users.service'
import type { GlobalRole, Profile } from '../types'

export function AdminPage() {
  const { session } = useAuth(); const [users, setUsers] = useState<Profile[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const load = useCallback(async () => { setLoading(true); try { setUsers(await listUsers()); setError('') } catch (e) { setError(friendlyError(e, 'No pudimos cargar los usuarios.')) } finally { setLoading(false) } }, [])
  useEffect(() => { void load() }, [load])
  async function update(user: Profile, role: GlobalRole, active: boolean) { try { await adminUpdateUser(user.id, role, active); toast.success('Usuario actualizado'); await load() } catch (e) { toast.error(friendlyError(e)) } }
  return <div className="page"><header className="mb-7"><div className="mb-3 flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-xl border-2 border-ink bg-coral shadow-brutal"><Shield/></span><div><p className="text-xs font-black uppercase tracking-widest">Acceso restringido</p><h1 className="font-display text-4xl font-black uppercase">Administración</h1></div></div><p className="max-w-2xl text-sm text-ink/60">Gestioná roles y acceso. Los emails viven en Supabase Auth y no se exponen al navegador por seguridad.</p></header>{loading ? <Loading /> : error ? <ErrorState message={error} action={<Button onClick={load}>Reintentar</Button>} /> : <div className="card overflow-hidden p-0"><div className="hidden grid-cols-[1.4fr_1fr_130px_110px_120px] gap-3 border-b-2 border-ink bg-ink px-4 py-3 text-xs font-black uppercase text-white md:grid"><span>Usuario</span><span>Username</span><span>Rol</span><span>Estado</span><span>Alta</span></div>{users.map(user => { const self = user.id === session?.user.id; return <div key={user.id} className="grid gap-3 border-b-2 border-ink/15 p-4 last:border-0 md:grid-cols-[1.4fr_1fr_130px_110px_120px] md:items-center"><div className="flex min-w-0 items-center gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink bg-paper"><UserRound size={17}/></span><strong className="truncate">{user.display_name}</strong>{self && <small>(vos)</small>}</div><span className="truncate text-sm text-ink/60">@{user.username}</span><select className="input min-h-9 py-1 text-sm" value={user.role} disabled={self} onChange={e => update(user, e.target.value as GlobalRole, user.active)} aria-label={`Rol de ${user.display_name}`}><option>USER</option><option>ADMIN</option></select><button className={`rounded-full border-2 border-ink px-3 py-1 text-xs font-black ${user.active ? 'bg-mint' : 'bg-coral'}`} disabled={self} onClick={() => update(user, user.role, !user.active)}>{user.active ? 'ACTIVO' : 'INACTIVO'}</button><time className="text-xs text-ink/50">{new Intl.DateTimeFormat('es', { dateStyle: 'medium' }).format(new Date(user.created_at))}</time></div>})}</div>}</div>
}
