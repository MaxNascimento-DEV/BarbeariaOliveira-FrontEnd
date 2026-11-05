import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border border-ink/10 bg-white shadow-soft', className)} {...rest} />
}

export function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 px-5 py-4 sm:px-6', className)}
      {...rest}
    />
  )
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 sm:p-6', className)} {...rest} />
}
