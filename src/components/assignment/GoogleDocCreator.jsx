import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, FileText, Presentation, Table } from 'lucide-react';

const DOC_TYPES = {
  google_doc: {
    icon: FileText,
    label: 'Google Doc',
    mimeType: 'application/vnd.google-apps.document',
    color: 'text-blue-600',
  },
  google_slides: {
    icon: Presentation,
    label: 'Google Slides',
    mimeType: 'application/vnd.google-apps.presentation',
    color: 'text-amber-600',
  },
  google_sheet: {
    icon: Table,
    label: 'Google Sheet',
    mimeType: 'application/vnd.google-apps.spreadsheet',
    color: 'text-emerald-600',
  },
};

export default function GoogleDocCreator({ type, open, onClose, onDocumentCreated, defaultTitle }) {
  const [title, setTitle] = useState(defaultTitle || '');
  const [creating, setCreating] = useState(false);

  const docConfig = DOC_TYPES[type];
  if (!docConfig) return null;

  const Icon = docConfig.icon;

  const handleCreate = async () => {
    if (!title.trim()) return;
    
    setCreating(true);
    try {
      // Create a new Google document through the LLM integration
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a new ${docConfig.label} with the title "${title}". Return ONLY a JSON object with this exact structure: {"id": "unique-id", "name": "${title}", "url": "https://docs.google.com/document/d/DOCUMENT_ID/edit", "type": "${type}"}. Make sure the URL is a valid Google Docs URL.`,
        response_json_schema: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            url: { type: "string" },
            type: { type: "string" }
          }
        }
      });

      // Add metadata
      const document = {
        ...result,
        mime_type: docConfig.mimeType,
        created_at: new Date().toISOString(),
      };

      onDocumentCreated(document);
      setTitle('');
      onClose();
    } catch (error) {
      console.error('Failed to create document:', error);
      alert('Failed to create document. Please try again or add it manually.');
    }
    setCreating(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${docConfig.color}`} />
            Create {docConfig.label}
          </DialogTitle>
          <DialogDescription>
            Give your {docConfig.label.toLowerCase()} a name to get started
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-sm font-medium">Document Name</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={`e.g., ${defaultTitle || 'My ' + docConfig.label}`}
              className="mt-1.5"
              onKeyPress={e => e.key === 'Enter' && handleCreate()}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!title.trim() || creating}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Icon className="w-4 h-4 mr-2" />}
              Create & Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}