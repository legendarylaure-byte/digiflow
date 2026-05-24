'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, X, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadDocumentPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [supportingDocs, setSupportingDocs] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    documentType: '',
    department: '',
    fiscalYear: '2026',
    isConfidential: false,
    recommender1: '',
    recommender2: '',
    recommender3: '',
    approver: '',
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a file to upload'); return; }
    setUploading(true);
    // TODO: Implement actual upload to Firebase Storage
    await new Promise((r) => setTimeout(r, 1500));
    toast.success('Document uploaded successfully');
    setUploading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Upload Document</h2>
        <p className="text-sm text-gray-500">Fill in the details and upload your document for approval</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Drop Zone */}
        <Card>
          <CardContent className="p-6">
            {!file ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
                  dragging ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'
                }`}
              >
                <Upload className="mb-3 h-10 w-10 text-gray-300" />
                <p className="font-medium text-gray-700">Drop your document here</p>
                <p className="mt-1 text-sm text-gray-500">or click to browse</p>
                <p className="mt-2 text-xs text-gray-400">Supports: PDF, DOCX, XLSX, PPTX, PNG, JPG, TXT (max 25MB)</p>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Browse Files
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-brand-600" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button type="button" onClick={() => setFile(null)} className="rounded-full p-1 hover:bg-gray-200">
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Supporting Documents */}
        <Card>
          <CardHeader><CardTitle className="text-base">Supporting Documents</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {supportingDocs.map((doc, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{doc.name}</span>
                </div>
                <button onClick={() => setSupportingDocs((prev) => prev.filter((_, j) => j !== i))}>
                  <X className="h-3 w-3 text-gray-400" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.onchange = (e: any) => {
                  if (e.target.files[0]) setSupportingDocs((prev) => [...prev, e.target.files[0]]);
                };
                input.click();
              }}
            >
              <Plus className="mr-1 h-3 w-3" /> Add Supporting Document
            </Button>
          </CardContent>
        </Card>

        {/* Document Details */}
        <Card>
          <CardHeader><CardTitle className="text-base">Document Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Document Name</Label>
                <Input
                  placeholder="e.g., IT Budget Proposal 2026"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Document Type</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  required
                >
                  <option value="">Select type...</option>
                  <option>Budget</option><option>Policy</option><option>Memo</option>
                  <option>Report</option><option>Invoice</option><option>Contract</option>
                  <option>HR</option><option>Technical</option><option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  placeholder="e.g., Finance"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Fiscal Year</Label>
                <Input
                  value={formData.fiscalYear}
                  onChange={(e) => setFormData({ ...formData, fiscalYear: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                className="min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Brief description of the document..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.isConfidential}
                onChange={(e) => setFormData({ ...formData, isConfidential: e.target.checked })}
                className="rounded border-gray-300"
              />
              Confidential document
            </label>
          </CardContent>
        </Card>

        {/* Approvers */}
        <Card>
          <CardHeader><CardTitle className="text-base">Approval Chain</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Recommender #1 (Primary)</Label>
              <Input placeholder="Search user..." value={formData.recommender1} onChange={(e) => setFormData({ ...formData, recommender1: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Recommender #2</Label>
              <Input placeholder="Search user..." value={formData.recommender2} onChange={(e) => setFormData({ ...formData, recommender2: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Recommender #3</Label>
              <Input placeholder="Search user..." value={formData.recommender3} onChange={(e) => setFormData({ ...formData, recommender3: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Approver (Final)</Label>
              <Input placeholder="Search user..." value={formData.approver} onChange={(e) => setFormData({ ...formData, approver: e.target.value })} required />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={uploading}>
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {uploading ? 'Uploading...' : 'Upload & Set Properties'}
        </Button>
      </form>
    </div>
  );
}
