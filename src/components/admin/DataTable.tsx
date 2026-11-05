import type { ReactNode } from 'react'
import { Pencil } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface Column<T> {
  header: string
  cell: (row: T) => ReactNode
  className?: string
  /** Hide on small screens (shown in the mobile card's secondary line instead). */
  hideOnMobile?: boolean
}

interface Props<T> {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  onEdit: (row: T) => void
  /** Content for each mobile card. */
  mobile: (row: T) => ReactNode
  dim?: (row: T) => boolean
}

export function DataTable<T>({ rows, columns, rowKey, onEdit, mobile, dim }: Props<T>) {
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-mint/50 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              {columns.map((c) => (
                <th key={c.header} className={cn('px-6 py-3 font-semibold', c.className)}>
                  {c.header}
                </th>
              ))}
              <th className="w-16 px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {rows.map((row) => (
              <tr key={rowKey(row)} className="transition hover:bg-mint/30">
                {columns.map((c) => (
                  <td key={c.header} className={cn('px-6 py-4', c.className, dim?.(row) && c.header !== 'Status' && 'opacity-55')}>
                    {c.cell(row)}
                  </td>
                ))}
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onEdit(row)}
                    className="rounded-md p-2 text-ink/40 transition hover:bg-mint hover:text-brand-dark"
                    aria-label="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-ink/5 lg:hidden">
        {rows.map((row) => (
          <li key={rowKey(row)} className="flex items-center gap-3 px-5 py-4">
            <div className={cn('min-w-0 flex-1', dim?.(row) && 'opacity-60')}>{mobile(row)}</div>
            <button
              onClick={() => onEdit(row)}
              className="rounded-md p-2 text-ink/40 transition hover:bg-mint hover:text-brand-dark"
              aria-label="Editar"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
