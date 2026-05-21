'use client';

// Renders a single field for the schema-driven CMS editor.
// Pure controlled component: parent owns state.

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trash2, Plus, Upload } from 'lucide-react';
import type { FieldDef } from '@/lib/cms-schema';

type Value = unknown;

interface Props {
  field: FieldDef;
  value: Value;
  onChange: (next: Value) => void;
}

const inputBase =
  'w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500';

export default function FieldRenderer({ field, value, onChange }: Props) {
  switch (field.kind) {
    case 'text':
      return (
        <input
          type="text"
          className={inputBase}
          placeholder={field.placeholder}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'textarea':
      return (
        <textarea
          className={inputBase}
          rows={field.rows ?? 4}
          placeholder={field.placeholder}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'image':
      return <ImageField value={(value as string) ?? ''} onChange={(v) => onChange(v)} />;

    case 'link': {
      const link = (value as { label?: string; url?: string }) ?? {};
      return (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Label"
            className={inputBase}
            value={link.label ?? ''}
            onChange={(e) => onChange({ ...link, label: e.target.value })}
          />
          <input
            type="text"
            placeholder="URL"
            className={inputBase}
            value={link.url ?? ''}
            onChange={(e) => onChange({ ...link, url: e.target.value })}
          />
        </div>
      );
    }

    case 'repeater': {
      const items = Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];
      const update = (idx: number, key: string, v: unknown) => {
        const next = items.slice();
        next[idx] = { ...next[idx], [key]: v };
        onChange(next);
      };
      const remove = (idx: number) => {
        const next = items.slice();
        next.splice(idx, 1);
        onChange(next);
      };
      const add = () => {
        const blank: Record<string, unknown> = {};
        for (const f of field.fields) blank[f.key] = f.kind === 'link' ? { label: '', url: '' } : '';
        onChange([...items, blank]);
      };

      return (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="border border-gray-200 rounded-md p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {field.itemLabel} #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="text-red-600 hover:text-red-700 p-1"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {field.fields.map((sub) => (
                  <div key={sub.key}>
                    <label className="block text-xs text-gray-600 mb-1">{sub.label}</label>
                    <FieldRenderer
                      field={sub}
                      value={item[sub.key]}
                      onChange={(v) => update(idx, sub.key, v)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800"
          >
            <Plus className="w-4 h-4" /> Add {field.itemLabel.toLowerCase()}
          </button>
        </div>
      );
    }

    default:
      return null;
  }
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const inputId = React.useId();

  const handleFile = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Upload failed');
      onChange(body.url as string);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        className={inputBase}
        placeholder="https://… or /uploads/file.png"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex items-center gap-3">
        <label
          htmlFor={inputId}
          className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading…' : 'Upload image'}
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
        />
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-10 w-16 object-cover rounded border border-gray-200" />
        )}
      </div>
    </div>
  );
}
