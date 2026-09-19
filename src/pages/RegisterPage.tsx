import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../components/ui/Button'
import { friendlyError } from '../lib/utils'
import { signUp } from '../services/auth.service'
import { AuthShell } from './LoginPage'

export function RegisterPage() {
  const navigate = useNavigate(); const location = useLocation(); const from = (location.state as { from?: string } | null)?.from
  const [form, setForm] = useState({ email: '', password: '', username: '', displayName: '' }); const [busy, setBusy] = useState(false)
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(v => ({ ...v, [key]: e.target.value }))
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); try { const data = await signUp(form.email, form.password, form.username, form.displayName); if (data.session) { toast.success('¡Cuenta creada!'); navigate(from || '/home') } else { toast.success('Cuenta creada. Revisá tu email para confirmarla.'); navigate('/login', { state: from ? { from } : undefined }) } } catch (err) { toast.error(friendlyError(err)) } finally { setBusy(false) } }
  return <AuthShell title="Sumate" subtitle="Dos minutos y nunca más “no sé, elegí vos”."><form onSubmit={submit} className="space-y-4"><label className="label">Nombre visible<input className="input mt-1" maxLength={50} value={form.displayName} onChange={set('displayName')} placeholder="Jero" required /></label><label className="label">Username<input className="input mt-1" pattern="[a-zA-Z0-9_]{3,24}" title="3 a 24 letras, números o guiones bajos" value={form.username} onChange={set('username')} placeholder="jero_99" required /></label><label className="label">Email<input className="input mt-1" type="email" autoComplete="email" value={form.email} onChange={set('email')} required /></label><label className="label">Contraseña<input className="input mt-1" type="password" autoComplete="new-password" minLength={6} value={form.password} onChange={set('password')} required /></label><Button className="w-full" size="lg" disabled={busy}>{busy ? 'Creando...' : 'Crear cuenta'}</Button></form><p className="mt-6 text-center text-sm">¿Ya tenés cuenta? <Link className="font-extrabold underline decoration-2" to="/login" state={from ? { from } : undefined}>Ingresá</Link></p></AuthShell>
}
