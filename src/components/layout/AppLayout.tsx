import { Dices, House, LogOut, Shield, UserRound } from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../services/auth.service'
import { Button } from '../ui/Button'

export function AppLayout() {
  const { profile } = useAuth(); const navigate = useNavigate()
  async function logout() { try { await signOut(); navigate('/login') } catch { toast.error('No pudimos cerrar la sesión.') } }
  const navClass = ({ isActive }: { isActive: boolean }) => `flex min-w-16 flex-col items-center gap-1 rounded-xl p-2 text-xs font-bold sm:min-w-0 sm:flex-row sm:px-3 ${isActive ? 'bg-acid' : 'hover:bg-ink/5'}`
  return <div className="min-h-screen pb-24 sm:pb-0">
    <header className="border-b-2 border-ink bg-paper/95 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"><Link to="/home" className="flex items-center gap-2 font-display text-xl font-black uppercase"><span className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-acid"><Dices size={20}/></span><span className="hidden min-[390px]:inline">No More Bets</span></Link><div className="flex items-center gap-2"><span className="hidden text-sm font-bold md:inline">{profile?.display_name}</span><Button variant="ghost" size="icon" onClick={logout} aria-label="Cerrar sesión"><LogOut size={20}/></Button></div></div></header>
    <main><Outlet /></main>
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center gap-1 border-t-2 border-ink bg-paper p-2 sm:static sm:mx-auto sm:mt-8 sm:w-fit sm:rounded-t-2xl sm:border-2 sm:border-b-0">
      <NavLink to="/home" className={navClass}><House size={19}/>Inicio</NavLink>
      <NavLink to="/profile" className={navClass}><UserRound size={19}/>Perfil</NavLink>
      {profile?.role === 'ADMIN' && <NavLink to="/admin" className={navClass}><Shield size={19}/>Admin</NavLink>}
    </nav>
  </div>
}
