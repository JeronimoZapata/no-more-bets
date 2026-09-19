import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

export function friendlyError(error: unknown, fallback = 'Algo salió mal. Probá de nuevo.') {
  const message = error instanceof Error ? error.message : String(error ?? '')
  if (/invalid login credentials/i.test(message)) return 'Email o contraseña incorrectos.'
  if (/email not confirmed/i.test(message)) return 'Confirmá tu email antes de ingresar.'
  if (/user already registered|already been registered/i.test(message)) return 'Ya existe una cuenta con ese email.'
  if (/username|profiles_username_key/i.test(message) && /duplicate|unique/i.test(message)) return 'Ese username ya está en uso.'
  if (/permission|policy|row-level security|not authorized/i.test(message)) return 'No tenés permiso para hacer eso.'
  if (/invalid invite code/i.test(message)) return 'El código de invitación no existe.'
  if (/already a member/i.test(message)) return 'Ya sos parte de este grupo.'
  if (/user is inactive/i.test(message)) return 'Tu cuenta está desactivada.'
  return fallback
}

export function timeAgo(value: string) {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
  const ranges: [number, Intl.RelativeTimeFormatUnit][] = [[60, 'second'], [60, 'minute'], [24, 'hour'], [7, 'day'], [4.345, 'week'], [12, 'month'], [Infinity, 'year']]
  let duration = seconds
  for (const [amount, unit] of ranges) {
    if (Math.abs(duration) < amount) return formatter.format(Math.round(duration), unit)
    duration /= amount
  }
  return formatter.format(Math.round(duration), 'year')
}
