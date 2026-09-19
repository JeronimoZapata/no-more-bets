import { useState, type FormEvent } from 'react'
import { Dices } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'
import { friendlyError } from '../lib/utils'
import { signIn } from '../services/auth.service'
import { isSupabaseConfigured } from '../services/supabase'
import { Button } from '../components/ui/Button'

export function LoginPage() {
  const { session, loading } = useAuth(); const navigate = useNavigate(); const location = useLocation()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false)
  const state = location.state as { from?: string; inactive?: boolean } | null
  if (!loading && session && !state?.inactive) return <Navigate to={state?.from || '/home'} replace />
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); try { await signIn(email, password); toast.success('¡Qué bueno verte!'); navigate(state?.from || '/home', { replace: true }) } catch (err) { toast.error(friendlyError(err)) } finally { setBusy(false) } }
  return <AuthShell title="Volvé al juego" subtitle="Hay decisiones pendientes.">
    {!isSupabaseConfigured && <div className="mb-4 rounded-xl border-2 border-coral bg-coral/15 p-3 text-sm font-bold">Falta configurar Supabase en <code>.env</code>.</div>}
    {state?.inactive && <div className="mb-4 rounded-xl border-2 border-coral bg-coral/15 p-3 text-sm font-bold">Tu cuenta está desactivada. Contactá a un administrador.</div>}
    <form onSubmit={submit} className="space-y-4"><label className="label">Email<input className="input mt-1" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label className="label">Contraseña<input className="input mt-1" type="password" autoComplete="current-password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} required /></label><Button className="w-full" size="lg" disabled={busy}>{busy ? 'Entrando...' : 'Entrar'}</Button></form>
    <p className="mt-6 text-center text-sm">¿Primera vez? <Link className="font-extrabold underline decoration-2" to="/register" state={state?.from ? { from: state.from } : undefined}>Creá tu cuenta</Link></p>
  </AuthShell>
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <main className="grid min-h-screen place-items-center px-4 py-10"><div className="w-full max-w-md"><Link to="/" className="mb-8 flex items-center justify-center gap-3 font-display text-2xl font-black uppercase"><span className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink bg-acid shadow-brutal"><Dices /></span>No More Bets</Link><section className="card"><h1 className="font-display text-3xl font-black uppercase leading-none">{title}</h1><p className="mb-6 mt-2 text-ink/60">{subtitle}</p>{children}</section></div></main>
}
