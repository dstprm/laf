'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Edit, Plus } from 'lucide-react';

type LocalScenario = {
  name: string;
  description?: string;
  minValue: number;
  maxValue: number;
};

interface ScenarioListLocalProps {
  scenarios: LocalScenario[];
  onChange: (scenarios: LocalScenario[]) => void;
}

export function ScenarioListLocal({ scenarios, onChange }: ScenarioListLocalProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<LocalScenario>({
    name: '',
    description: '',
    minValue: 0,
    maxValue: 0,
  });
  const [validationError, setValidationError] = useState<string>('');

  const handleDelete = (index: number) => {
    setDeletingIndex(index);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingIndex !== null) {
      const updated = scenarios.filter((_, i) => i !== deletingIndex);
      onChange(updated);
    }
    setIsDeleteDialogOpen(false);
    setDeletingIndex(null);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setFormData(scenarios[index]);
    setValidationError('');
    setIsCreateDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingIndex(null);
    setFormData({
      name: '',
      description: '',
      minValue: 0,
      maxValue: 0,
    });
    setValidationError('');
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.name.trim()) {
      setValidationError('Please enter a scenario name');
      return;
    }

    if (formData.minValue >= formData.maxValue) {
      setValidationError('Min value must be less than max value');
      return;
    }

    const updated = [...scenarios];
    if (editingIndex !== null) {
      // Edit existing
      updated[editingIndex] = formData;
    } else {
      // Add new
      updated.push(formData);
    }

    onChange(updated);
    setIsCreateDialogOpen(false);
    setValidationError('');
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatRange = (min: number, max: number) => {
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Scenarios</CardTitle>
              <CardDescription>Create and manage scenarios before saving (changes are not saved yet)</CardDescription>
            </div>
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Scenario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {scenarios.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No scenarios created yet.</p>
              <p className="text-sm mt-2">Add a scenario to see different valuation ranges.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scenarios.map((scenario, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                    {scenario.description && <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>}
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="text-gray-700">
                        Range: <span className="font-medium">{formatRange(scenario.minValue, scenario.maxValue)}</span>
                      </span>
                      <span className="text-gray-500">
                        Spread: {formatCurrency(scenario.maxValue - scenario.minValue)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(index)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? 'Edit Scenario' : 'Add Scenario'}</DialogTitle>
            <DialogDescription>
              {editingIndex !== null
                ? 'Update the scenario details below.'
                : 'Create a new scenario by entering a name and value range.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{validationError}</p>
              </div>
            )}

            <div>
              <Label htmlFor="name">Scenario Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Optimistic Case, Conservative Case"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this scenario"
                className="mt-1"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minValue">Min Value *</Label>
                <Input
                  id="minValue"
                  type="number"
                  step="0.01"
                  value={formData.minValue}
                  onChange={(e) => setFormData({ ...formData, minValue: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 5000000"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="maxValue">Max Value *</Label>
                <Input
                  id="maxValue"
                  type="number"
                  step="0.01"
                  value={formData.maxValue}
                  onChange={(e) => setFormData({ ...formData, maxValue: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 15000000"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingIndex !== null ? 'Update' : 'Add'} Scenario</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Scenario</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this scenario? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
