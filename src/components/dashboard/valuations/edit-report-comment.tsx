'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';

interface EditReportCommentProps {
  valuationId: string;
  initialComment?: string | null;
}

export function EditReportComment({ valuationId, initialComment }: EditReportCommentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState(initialComment || '');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/valuations/${valuationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportComment: comment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save comment');
      }

      toast({
        title: 'Comment saved',
        description: 'Your report comment has been updated.',
      });

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error saving comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to save comment',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" size="sm">
        <Pencil className="h-4 w-4 mr-2" />
        {initialComment ? 'Edit Comment' : 'Add Comment'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Commentary</DialogTitle>
            <DialogDescription>
              Add a comment or note that will appear at the top of your published report. This is helpful for providing
              context, key highlights, or executive summary information.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your report commentary here..."
              className="w-full min-h-[150px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-2">{comment.length} / 1000 characters</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Comment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
