'use client'

import {Interview, InterviewStatus, InterviewType} from '@/types/vacancy'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Calendar,
    Clock,
    User,
    Video,
    MoreHorizontal,
    Edit,
    Trash2,
    ExternalLink
} from 'lucide-react'
import {formatDistanceToNow, format} from 'date-fns'
import {formatShortLink} from "@/utils/url-utils";
import {getInterviewStatusColor, getInterviewStatusLabel, getInterviewTypeLabel} from "@/utils/interview-utils";

interface InterviewsTableProps {
    interviews: Interview[]
    onEditInterview?: (interview: Interview) => void
    onDeleteInterview?: (interviewId: string) => void
    onViewInterview?: (interview: Interview) => void
}

function truncateText(text: string | undefined, maxLength: number): string {
    if (!text) return ''
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}

export function InterviewsTable({
                                    interviews,
                                    onEditInterview,
                                    onDeleteInterview,
                                    onViewInterview
                                }: InterviewsTableProps) {
    if (interviews.length === 0) {
        return (
            <div className="text-center py-12 bg-background-surface rounded-lg border border-border">
                <div className="text-muted-foreground mb-4">
                    <Calendar className="mx-auto h-12 w-12"/>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">No interviews yet</h3>
                <p className="text-muted-foreground">Start by scheduling your first interview!</p>
            </div>
        )
    }

    return (
        <div className="bg-background-surface rounded-lg border border-border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">Position & Company</TableHead>
                        <TableHead className="font-semibold">Type & Interviewer</TableHead>
                        <TableHead className="font-semibold">Date & Time</TableHead>
                        <TableHead className="font-semibold">Duration</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Meeting</TableHead>
                        <TableHead className="font-semibold w-12">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {interviews.map((interview) => (
                        <TableRow
                            key={interview.id}
                            className="group cursor-pointer hover:bg-muted/30"
                            onClick={() => onViewInterview?.(interview)}
                        >
                            <TableCell className="min-w-[240px]">
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-foreground text-sm leading-tight">
                                        {interview.vacancy?.title || 'Position not specified'}
                                    </h3>
                                    <div className="text-muted-foreground text-xs">
                                        {interview.vacancy?.company?.name || 'Company not specified'}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="min-w-[200px]">
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-foreground text-sm leading-tight">
                                        {getInterviewTypeLabel(interview.type)}
                                    </h3>
                                    {interview.interviewerName && (
                                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                            <User className="h-3 w-3 flex-shrink-0"/>
                                            <span>{truncateText(interview.interviewerName, 30)}</span>
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-foreground text-sm font-medium">
                                        <Calendar className="h-3 w-3"/>
                                        <span>{format(new Date(interview.scheduledAt), 'MMM d')}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                        <Clock className="h-3 w-3"/>
                                        <span>{format(new Date(interview.scheduledAt), 'HH:mm')}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                {interview.duration ? (
                                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                        <Clock className="h-3 w-3"/>
                                        <span>{interview.duration}m</span>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground/50 text-sm">—</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={`text-xs font-medium ${getInterviewStatusColor(interview.status)}`}
                                >
                                    {getInterviewStatusLabel(interview.status)}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {interview.meetingLink ? (
                                    <a
                                        href={formatShortLink(interview.meetingLink)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-primary hover:text-primary-dark text-sm transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Video className="h-3 w-3"/>
                                        Join
                                        <ExternalLink className="h-2 w-2"/>
                                    </a>
                                ) : interview.location ? (
                                    <span
                                        className="text-muted-foreground text-sm">{truncateText(interview.location, 20)}</span>
                                ) : (
                                    <span className="text-muted-foreground/50 text-sm">—</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1">
                                    {interview.meetingLink && (
                                        <a
                                            href={formatShortLink(interview.meetingLink)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-1"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Video className="h-4 w-4"/>
                                        </a>
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreHorizontal className="h-4 w-4"/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {onEditInterview && (
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditInterview(interview);
                                                }}>
                                                    <Edit className="mr-2 h-4 w-4"/>
                                                    Edit
                                                </DropdownMenuItem>
                                            )}
                                            {onDeleteInterview && (
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteInterview(interview.id);
                                                    }}
                                                    className="text-error/70 focus:text-error/100"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4"/>
                                                    Delete
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}