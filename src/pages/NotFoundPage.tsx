import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
export function NotFoundPage() { return <main className="grid min-h-screen place-items-center p-4 text-center"><div><p className="font-display text-8xl font-black">404</p><h1 className="text-2xl font-black">Esta opción no estaba en la ruleta.</h1><Link to="/home"><Button className="mt-6">Volver al inicio</Button></Link></div></main> }
