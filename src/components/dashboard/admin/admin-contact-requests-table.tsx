'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight, Trash2, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Confirmation } from '@/components/shared/confirmation/confirmation';

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  source?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

interface ContactRequestsResponse {
  requests: ContactRequest[];
  total: number;
  page: number;
  totalPages: number;
}

export function AdminContactRequestsTable() {
  const [data, setData] = useState<ContactRequestsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selected, setSelected] = useState<ContactRequest | null>(null);
  const { toast } = useToast();

  const fetchRequests = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(pageNum), limit: '10' });
      if (q.trim()) params.set('q', q.trim());
      const res = await fetch(`/api/admin/contact-requests?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch contact requests');
      const json = (await res.json()) as ContactRequestsResponse;
      setData(json);
      setPage(pageNum);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load contact requests' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const requestDelete = (id: string) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      setActionLoading(pendingDeleteId);
      const res = await fetch(`/api/admin/contact-requests?id=${pendingDeleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast({ title: 'Deleted', description: 'Contact request removed' });
      await fetchRequests(page);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete contact request' });
    } finally {
      setActionLoading(null);
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  const formatDateTime = (iso: string) => new Date(iso).toLocaleString();

  if (loading && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load contact requests</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Contact Requests ({data.total})</CardTitle>
              <CardDescription>Messages submitted via the public contact form</CardDescription>
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, subject, message, source"
              className="h-9 w-full max-w-xs rounded-md border px-3 text-sm focus:outline-none"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{r.name}</span>
                      <span className="text-xs text-muted-foreground">{r.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate">{r.subject || '-'}</TableCell>
                  <TableCell>
                    <div className="max-w-[420px] text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                      {r.message}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground max-w-[260px]">
                      {r.source && <div>Source: {r.source}</div>}
                      {r.ipAddress && <div>IP: {r.ipAddress}</div>}
                      {r.userAgent && <div className="truncate">UA: {r.userAgent}</div>}
                    </div>
                  </TableCell>
                  <TableCell>{formatDateTime(r.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelected(r);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => requestDelete(r.id)}
                        disabled={actionLoading === r.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchRequests(page - 1)}
                  disabled={page <= 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchRequests(page + 1)}
                  disabled={page >= data.totalPages || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.subject || 'Contact message'}</DialogTitle>
            <DialogDescription>
              <div className="text-xs text-muted-foreground">
                <div>
                  From: <span className="font-medium">{selected?.name}</span> &lt;{selected?.email}&gt;
                </div>
                <div>Received: {selected ? formatDateTime(selected.createdAt) : ''}</div>
                {selected?.source && <div>Source: {selected.source}</div>}
                {selected?.ipAddress && <div>IP: {selected.ipAddress}</div>}
                {selected?.userAgent && <div className="truncate">UA: {selected.userAgent}</div>}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 max-h-[60vh] overflow-auto whitespace-pre-wrap text-sm">{selected?.message}</div>
        </DialogContent>
      </Dialog>
      <Confirmation
        isOpen={confirmOpen}
        onClose={setConfirmOpen}
        title="Delete contact request?"
        description="This action cannot be undone. The message will be permanently removed."
        actionText="Delete"
        actionVariant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  );
}
