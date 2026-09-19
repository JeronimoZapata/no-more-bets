import type { ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva('inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink font-extrabold transition active:translate-x-0.5 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50', {
  variants: {
    variant: { primary: 'bg-acid shadow-brutal hover:bg-acid/80', secondary: 'bg-white shadow-brutal hover:bg-lilac/20', ghost: 'border-transparent bg-transparent hover:bg-ink/5', danger: 'bg-coral text-ink shadow-brutal hover:bg-coral/80' },
    size: { default: 'min-h-11 px-4 py-2', lg: 'min-h-14 px-7 text-lg', icon: 'h-11 w-11' },
  },
  defaultVariants: { variant: 'primary', size: 'default' },
})

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>
export function Button({ className, variant, size, ...props }: Props) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
