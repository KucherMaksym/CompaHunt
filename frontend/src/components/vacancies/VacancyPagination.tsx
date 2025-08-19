'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export interface PaginationData {
  currentPage: number
  totalPages: number
  totalElements: number
  size: number
  hasNext: boolean
  hasPrevious: boolean
  isFirst: boolean
  isLast: boolean
}

interface VacancyPaginationProps {
  pagination: PaginationData
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  isLoading?: boolean
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export function VacancyPagination({ 
  pagination, 
  onPageChange, 
  onPageSizeChange,
  isLoading = false 
}: VacancyPaginationProps) {
  const { currentPage, totalPages, totalElements, size, hasNext, hasPrevious } = pagination

  if (totalElements === 0) return null

  const startItem = (currentPage * size) + 1
  const endItem = Math.min((currentPage + 1) * size, totalElements)

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: number[] = []
    const maxPagesToShow = 5
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show pages around current page
      const startPage = Math.max(0, currentPage - 2)
      const endPage = Math.min(totalPages - 1, currentPage + 2)
      
      // Always show first page
      if (startPage > 0) {
        pages.push(0)
        if (startPage > 1) pages.push(-1) // Placeholder for ellipsis
      }
      
      // Add pages around current
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      // Always show last page
      if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) pages.push(-1) // Placeholder for ellipsis
        pages.push(totalPages - 1)
      }
    }
    
    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-background-surface rounded-lg border border-border">
      {/* Results Info */}
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {totalElements.toLocaleString()} results
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Page Size Selector */}
        <div className="flex items-center gap-2 mr-4">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select
            value={size.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
            disabled={isLoading}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* First Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(0)}
          disabled={isLoading || !hasPrevious}
          className="hidden sm:flex"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isLoading || !hasPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Previous</span>
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageNum, index) => {
            if (pageNum === -1) {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              )
            }
            
            const isCurrentPage = pageNum === currentPage
            
            return (
              <Button
                key={pageNum}
                variant={isCurrentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                disabled={isLoading}
                className={`min-w-8 ${isCurrentPage ? '' : 'hover:bg-accent'}`}
              >
                {pageNum + 1}
              </Button>
            )
          })}
        </div>

        {/* Next Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLoading || !hasNext}
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={isLoading || !hasNext}
          className="hidden sm:flex"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}