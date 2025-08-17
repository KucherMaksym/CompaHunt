'use client'

import { useState } from 'react'
import { Interview, ViewMode } from '@/types/vacancy'
import { ViewToggle } from '../vacancies/ViewToggle'
import { InterviewsTable } from './InterviewsTable'
import { InterviewsCards } from './InterviewsCards'
import { Button } from '@/components/ui/button'
import { Plus, Filter, Search } from 'lucide-react'
import { Title } from "@/components/ui/Title"

interface InterviewsListProps {
  interviews: Interview[]
  onAddInterview?: () => void
  onEditInterview?: (interview: Interview) => void
  onDeleteInterview?: (interviewId: string) => void
  onViewInterview?: (interview: Interview) => void
}

export function InterviewsList({ interviews, onAddInterview, onEditInterview, onDeleteInterview, onViewInterview }: InterviewsListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter interviews based on search query
  const filteredInterviews = interviews.filter((interview) =>
    interview.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interview.interviewerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interview.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interview.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <Title level={4}>
            Interviews
          </Title>
          <p className="text-muted-foreground text-sm mt-1">
            {interviews.length === 0 
              ? 'No interviews scheduled yet' 
              : `${filteredInterviews.length} of ${interviews.length} interviews`
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {interviews.length > 0 && (
            <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
          )}
          <Button onClick={onAddInterview} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Interview
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      {interviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search interviews, interviewers, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 placeholder:text-muted-foreground"
            />
          </div>
          
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      )}

      {/* Empty State */}
      {interviews.length === 0 && (
        <div className="text-center py-16 bg-background-surface rounded-lg border border-border">
          <div className="text-muted-foreground mb-6">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 7a2 2 0 002 2h8a2 2 0 002-2l-2-7m-6 0V4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No interviews scheduled yet
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start organizing your interview process by scheduling your first interview. 
            Keep track of all your meetings and follow-ups in one place.
          </p>
          <Button onClick={onAddInterview} size="lg" className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Schedule Your First Interview
          </Button>
        </div>
      )}

      {/* Search No Results */}
      {interviews.length > 0 && filteredInterviews.length === 0 && (
        <div className="text-center py-12 bg-background-surface rounded-lg border border-border">
          <div className="text-muted-foreground mb-4">
            <Search className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No results found
          </h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or clearing the search to see all interviews.
          </p>
          <Button variant="outline" onClick={() => setSearchQuery('')}>
            Clear Search
          </Button>
        </div>
      )}

      {/* Content */}
      {filteredInterviews.length > 0 && (
        <div className="animate-in fade-in-50 duration-200">
          {viewMode === 'table' ? (
            <InterviewsTable 
              interviews={filteredInterviews} 
              onEditInterview={onEditInterview}
              onDeleteInterview={onDeleteInterview}
              onViewInterview={onViewInterview}
            />
          ) : (
            <InterviewsCards 
              interviews={filteredInterviews}
              onEditInterview={onEditInterview}
              onDeleteInterview={onDeleteInterview}
              onViewInterview={onViewInterview}
            />
          )}
        </div>
      )}

      {/* Summary Stats */}
      {interviews.length > 0 && (
        <div className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Showing {filteredInterviews.length} of {interviews.length} interviews
          </div>
        </div>
      )}
    </div>
  )
}