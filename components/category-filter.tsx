'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORIES } from '@/lib/types'
import { cn } from '@/lib/utils'

export function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('category') ?? 'all'

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('category')
    } else {
      params.set('category', value)
    }
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        onClick={() => handleSelect('all')}
        className={cn(
          'flex-shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-all',
          active === 'all'
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-secondary text-muted-foreground hover:border-primary hover:text-foreground',
        )}
      >
        All
      </button>
      {CATEGORIES.map(cat => (
        <button
          key={cat.value}
          onClick={() => handleSelect(cat.value)}
          className={cn(
            'flex-shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-all',
            active === cat.value
              ? `border-transparent text-white ${cat.color}`
              : 'border-border bg-secondary text-muted-foreground hover:border-primary hover:text-foreground',
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
