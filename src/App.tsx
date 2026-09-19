import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { Loading } from './components/ui/States'
import { useAuth } from './hooks/useAuth'
import { AdminPage } from './pages/AdminPage'
import { GroupPage } from './pages/GroupPage'
import { HomePage } from './pages/HomePage'
import { JoinGroupPage } from './pages/JoinGroupPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { WheelPage } from './pages/WheelPage'

function RootRedirect() { const { session, loading } = useAuth(); if (loading) return <Loading label="Preparando todo..." />; return <Navigate to={session ? '/home' : '/login'} replace /> }
export default function App() { return <Routes><Route path="/" element={<RootRedirect/>}/><Route path="/login" element={<LoginPage/>}/><Route path="/register" element={<RegisterPage/>}/><Route element={<ProtectedRoute/>}><Route element={<AppLayout/>}><Route path="/home" element={<HomePage/>}/><Route path="/groups/:groupId" element={<GroupPage/>}/><Route path="/join/:inviteCode" element={<JoinGroupPage/>}/><Route path="/wheel/:wheelId" element={<WheelPage/>}/><Route path="/profile" element={<ProfilePage/>}/><Route element={<ProtectedRoute admin/>}><Route path="/admin" element={<AdminPage/>}/></Route></Route></Route><Route path="*" element={<NotFoundPage/>}/></Routes> }
