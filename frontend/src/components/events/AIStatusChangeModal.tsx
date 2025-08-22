'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Brain, Mail, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { PendingEventDTO } from '@/lib/api/events';

interface AIStatusChangeModalProps {
  event: PendingEventDTO;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (eventId: number) => void;
  onConfirm: (eventId: number, confirmed: boolean, notes?: string) => void;
  eventIndex: number;
  totalEvents: number;
}

export const AIStatusChangeModal: React.FC<AIStatusChangeModalProps> = ({
  event,
  isOpen,
  onClose,
  onResolve,
  onConfirm,
  eventIndex,
  totalEvents,
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const metadata = event.metadata || {};
  const newStatus = metadata.newStatus || 'Unknown';
  const confidence = metadata.confidence || 0;
  const emailSubject = metadata.emailSubject || 'Unknown';
  const aiReasoning = metadata.aiReasoning || 'No reasoning provided';
  const requiresConfirmation = metadata.requiresConfirmation !== false;

  const handleConfirm = async (confirmed: boolean) => {
    setIsSubmitting(true);
    try {
      await onConfirm(event.id, confirmed, notes || undefined);
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error confirming status change:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onResolve(event.id);
    onClose();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return { color: 'bg-green-100 text-green-800', label: 'High Confidence' };
    if (confidence >= 0.7) return { color: 'bg-yellow-100 text-yellow-800', label: 'Medium Confidence' };
    return { color: 'bg-red-100 text-red-800', label: 'Low Confidence' };
  };

  const confidenceBadge = getConfidenceBadge(confidence);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span>AI Detected Status Change</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {eventIndex + 1} of {totalEvents}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Application Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{event.vacancyInfo?.title} at {event.vacancyInfo?.companyName}</span>
                <Badge className={confidenceBadge.color}>
                  {confidenceBadge.label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Current Status</Label>
                  <p className="font-medium">{event.vacancyInfo?.status?.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Suggested Status</Label>
                  <p className="font-medium text-blue-600">{newStatus.replace('_', ' ')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" />
                AI Analysis Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Email Subject</Label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded border">
                  {emailSubject}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground">AI Confidence Score</Label>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        confidence >= 0.9 ? 'bg-green-500' : 
                        confidence >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${confidence * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${getConfidenceColor(confidence)}`}>
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">AI Reasoning</Label>
                <p className="text-sm bg-blue-50 p-3 rounded border border-blue-200">
                  {aiReasoning}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation Alert */}
          {requiresConfirmation && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This status change requires your confirmation due to the AI confidence level. 
                Please review the details above and confirm if the suggested change is accurate.
              </AlertDescription>
            </Alert>
          )}

          {/* Optional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional context or corrections..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            Skip
          </Button>
          
          {requiresConfirmation ? (
            <>
              <Button 
                variant="destructive" 
                onClick={() => handleConfirm(false)}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject Change
              </Button>
              <Button 
                onClick={() => handleConfirm(true)}
                disabled={isSubmitting}
                className="flex items-center gap-2 min-w-[120px]"
              >
                <CheckCircle className="h-4 w-4" />
                {isSubmitting ? 'Confirming...' : 'Confirm Change'}
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => handleConfirm(true)}
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? 'Applying...' : 'Apply Change'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};