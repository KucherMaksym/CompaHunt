'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { FileText, Plus, MoreHorizontal, Trash2 } from 'lucide-react'
import { VacancyNote, NoteType, NotePriority } from '@/types/vacancy'
import { notesApi } from '@/lib/api/notes'

const getPriorityColor = (priority: NotePriority) => {
  switch (priority) {
    case NotePriority.LOW: return 'text-blue-600 border-blue-600 bg-blue-600/10'
    case NotePriority.MEDIUM: return 'text-yellow-600 border-yellow-600 bg-yellow-600/10'
    case NotePriority.HIGH: return 'text-orange-600 border-orange-600 bg-orange-600/10'
    case NotePriority.URGENT: return 'text-red-600 border-red-600 bg-red-600/10'
    default: return 'text-gray-600 border-gray-600 bg-gray-600/10'
  }
}

const getTypeColor = (type: NoteType) => {
  switch (type) {
    case NoteType.OFFER_RECEIVED: return 'text-green-600 border-green-600 bg-green-600/10'
    case NoteType.REJECTION_RECEIVED: return 'text-red-600 border-red-600 bg-red-600/10'
    case NoteType.INTERVIEW_FEEDBACK: return 'text-purple-600 border-purple-600 bg-purple-600/10'
    case NoteType.FOLLOW_UP: return 'text-blue-600 border-blue-600 bg-blue-600/10'
    case NoteType.SALARY_NEGOTIATION: return 'text-yellow-600 border-yellow-600 bg-yellow-600/10'
    case NoteType.NEXT_STEPS: return 'text-indigo-600 border-indigo-600 bg-indigo-600/10'
    default: return 'text-gray-600 border-gray-600 bg-gray-600/10'
  }
}

interface NoteListProps {
  notes: VacancyNote[]
  vacancyId: string
  onAddNew: () => void
}

export function NoteList({ notes, vacancyId, onAddNew }: NoteListProps) {
  const queryClient = useQueryClient()

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      return await notesApi.delete(noteId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', vacancyId] })
    }
  })

  const onDelete = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNoteMutation.mutateAsync(noteId)
      } catch (error) {
        console.error('An error occurred while deleting:', error)
      }
    }
  }

  if (notes.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No notes yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first note to get started
          </p>
          <Button 
            onClick={onAddNew}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {notes.map((note: VacancyNote) => (
        <Card key={note.id} className="hover:shadow-md transition-shadow">
          <CardContent>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-xs ${getTypeColor(note.type)}`}>
                  {note.type.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className={`text-xs ${getPriorityColor(note.priority)}`}>
                  {note.priority}
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onDelete(note.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <p className="text-sm text-foreground mb-3 whitespace-pre-wrap">
              {note.content}
            </p>
            
            <div className="text-xs text-muted-foreground">
              {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}