'use client';

// Generic, schema-driven editor for any page in cms-schema.ts.
// Loads /api/page-content/[slug] on mount, lets the user edit each section,
// and PUTs the whole page back on save.

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { ChevronDown, ChevronRight, Eye, EyeOff, Save } from 'lucide-react';
import type { PageDef, SectionDef } from '@/lib/cms-schema';
import FieldRenderer from './FieldRenderer';

type SectionState = { data: Record<string, unknown>; visible: boolean };
type PageState = Record<string, SectionState>;

interface Props {
  page: PageDef;
}

export default function PageEditor({ page }: Props) {
  const [state, setState] = useState<PageState | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(page.sections.map((s, i) => [s.key, i === 0])),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/page-content/${page.slug}`);
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          const detail = (body as { error?: string })?.error ?? `HTTP ${res.status}`;
          throw new Error(`Failed to load page content: ${detail}`);
        }
        if (!cancelled) setState(body.sections as PageState);
      } catch (err) {
        toast.error((err as Error).message);
        // eslint-disable-next-line no-console
        console.error('[PageEditor] load failed', err);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [page.slug]);

  if (!state) {
    return <div className="p-6 text-gray-500">Loading…</div>;
  }

  const updateField = (sectionKey: string, fieldKey: string, value: unknown) => {
    setState((prev) =>
      prev
        ? {
            ...prev,
            [sectionKey]: {
              ...prev[sectionKey],
              data: { ...prev[sectionKey].data, [fieldKey]: value },
            },
          }
        : prev,
    );
  };

  const toggleVisible = (sectionKey: string) => {
    setState((prev) =>
      prev
        ? { ...prev, [sectionKey]: { ...prev[sectionKey], visible: !prev[sectionKey].visible } }
        : prev,
    );
  };

  const toggleOpen = (sectionKey: string) => {
    setOpenSections((p) => ({ ...p, [sectionKey]: !p[sectionKey] }));
  };

  const save = async () => {
    setSaving(true);
    const t = toast.loading('Saving…');
    try {
      const res = await fetch(`/api/page-content/${page.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: state }),
      });
      if (!res.ok) throw new Error((await res.json())?.error || 'Save failed');
      toast.success('Saved', { id: t });
    } catch (err) {
      toast.error((err as Error).message, { id: t });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{page.title}</h1>
          <p className="text-sm text-gray-500">Edit page content. Changes go live on save.</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="space-y-3">
        {page.sections.map((s) => (
          <SectionPanel
            key={s.key}
            section={s}
            value={state[s.key]}
            isOpen={!!openSections[s.key]}
            onToggleOpen={() => toggleOpen(s.key)}
            onToggleVisible={() => toggleVisible(s.key)}
            onChangeField={(fieldKey, value) => updateField(s.key, fieldKey, value)}
          />
        ))}
      </div>
    </div>
  );
}

function SectionPanel({
  section,
  value,
  isOpen,
  onToggleOpen,
  onToggleVisible,
  onChangeField,
}: {
  section: SectionDef;
  value: SectionState;
  isOpen: boolean;
  onToggleOpen: () => void;
  onToggleVisible: () => void;
  onChangeField: (fieldKey: string, value: unknown) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={onToggleOpen}
          className="flex items-center gap-2 text-left text-gray-900 font-semibold"
        >
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {section.title}
        </button>
        <button
          type="button"
          onClick={onToggleVisible}
          title={value.visible ? 'Visible — click to hide' : 'Hidden — click to show'}
          className={`inline-flex items-center gap-1 text-sm px-2 py-1 rounded ${
            value.visible ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100'
          }`}
        >
          {value.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {value.visible ? 'Visible' : 'Hidden'}
        </button>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
          {section.description && <p className="text-xs text-gray-500">{section.description}</p>}
          {section.fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <FieldRenderer
                field={f}
                value={value.data[f.key]}
                onChange={(v) => onChangeField(f.key, v)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
