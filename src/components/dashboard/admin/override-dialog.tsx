'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (expiresAt: string | null) => Promise<void> | void;
}

export function OverrideDialog({ open, onOpenChange, onConfirm }: OverrideDialogProps) {
  const [date, setDate] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      const expiresAt = date
        ? new Date(
            Date.UTC(new Date(date).getFullYear(), new Date(date).getMonth(), new Date(date).getDate()),
          ).toISOString()
        : null;
      await onConfirm(expiresAt);
      onOpenChange(false);
      setDate('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set override expiry</DialogTitle>
          <DialogDescription>
            Choose an optional expiry date for this override. Leave empty for no expiry.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="override-expiry" className="text-right">
              Expiry
            </Label>
            <Input
              id="override-expiry"
              type="date"
              className="col-span-3"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={submitting}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
