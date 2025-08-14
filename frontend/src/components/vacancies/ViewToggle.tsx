'use client'

import
{ ViewMode } from '@/types/vacancy'
import { Button } from '@/components/ui/button'
import { Grid3X3, List } from 'lucide-react'

interface ViewToggleProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex rounded-lg border border-border bg-background-surface p-1">
      <Button
        variant={(currentView === 'table' ? 'default' : 'ghost') as any}
        size="sm"
        onClick={() => onViewChange('table')}
        className={`relative flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-all ${
          currentView === 'table' 
            ? 'bg-primary text-primary-foreground shadow-sm' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
      >
        <List className="h-4 w-4" />
        Table
      </Button>
      <Button
        variant={(currentView === 'cards' ? 'default' : 'ghost') as any}
        size="sm"
        onClick={() => onViewChange('cards')}
        className={`relative flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-all ${
          currentView === 'cards'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
      >
        <Grid3X3 className="h-4 w-4" />
        Cards
      </Button>
    </div>
  )
}