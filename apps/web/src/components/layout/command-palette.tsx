'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from '@/i18n/routing';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Search, FileText, Users, Settings, BarChart3, GitBranch, Inbox, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SearchResult {
  id: string;
  type: 'document' | 'nav';
  label: string;
  description?: string;
  href?: string;
  icon?: React.ReactNode;
}

const navItems: SearchResult[] = [
  { id: 'nav-dashboard', type: 'nav', label: 'Dashboard', description: 'Go to dashboard', href: '/dashboard', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'nav-inbox', type: 'nav', label: 'Inbox', description: 'View pending reviews', href: '/inbox', icon: <Inbox className="h-4 w-4" /> },
  { id: 'nav-upload', type: 'nav', label: 'Upload Document', description: 'Upload a new document', href: '/documents/upload', icon: <FileText className="h-4 w-4" /> },
  { id: 'nav-documents', type: 'nav', label: 'Documents', description: 'All documents', href: '/documents', icon: <FileText className="h-4 w-4" /> },
  { id: 'nav-settings', type: 'nav', label: 'Settings', description: 'Account settings', href: '/settings', icon: <Settings className="h-4 w-4" /> },
  { id: 'nav-admin', type: 'nav', label: 'Admin Panel', description: 'Admin dashboard', href: '/admin/dashboard', icon: <Users className="h-4 w-4" /> },
  { id: 'nav-workflow', type: 'nav', label: 'Workflows', description: 'Admin workflow config', href: '/admin/workflow', icon: <GitBranch className="h-4 w-4" /> },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query_text, setQueryText] = useState('');
  const [documents, setDocuments] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filteredNav = query_text
    ? navItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query_text.toLowerCase()) ||
          item.description?.toLowerCase().includes(query_text.toLowerCase()),
      )
    : navItems;

  const results = [...filteredNav, ...documents];

  const fetchDocuments = useCallback(async (q: string) => {
    if (!q) {
      setDocuments([]);
      return;
    }
    try {
      const docsRef = collection(db, 'documents');
      const qLower = q.toLowerCase();
      const snap = await getDocs(query(docsRef, orderBy('createdAt', 'desc'), limit(10)));
      const docs: SearchResult[] = [];
      snap.forEach((d) => {
        const data = d.data();
        const name = (data.name || '').toLowerCase();
        if (name.includes(qLower) || (data.documentType || '').toLowerCase().includes(qLower)) {
          docs.push({
            id: d.id,
            type: 'document',
            label: data.name || 'Untitled',
            description: `${data.documentType || 'Document'} · ${data.status || 'draft'}`,
            href: `/documents/${d.id}`,
            icon: <FileText className="h-4 w-4" />,
          });
        }
      });
      setDocuments(docs);
    } catch {
      setDocuments([]);
    }
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    const handleTrigger = () => setOpen((prev) => !prev);
    document.addEventListener('keydown', handleKey);
    document.addEventListener('open-command-palette', handleTrigger);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('open-command-palette', handleTrigger);
    };
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setQueryText('');
      setDocuments([]);
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => fetchDocuments(query_text), 200);
    return () => clearTimeout(timer);
  }, [query_text, fetchDocuments]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query_text]);

  const onSelect = (item: SearchResult) => {
    if (item.href) {
      router.push(item.href);
    }
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      onSelect(results[selectedIndex]);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)} />
      <div className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            value={query_text}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search documents, pages..."
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
          />
          <kbd className="hidden rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400 sm:inline">
            ESC
          </kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              {query_text ? 'No results found' : 'Start typing to search...'}
            </p>
          ) : (
            results.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                  idx === selectedIndex
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50',
                )}
              >
                <span className="shrink-0 text-gray-400">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{item.label}</p>
                  {item.description && (
                    <p className="truncate text-xs text-gray-400">{item.description}</p>
                  )}
                </div>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-300" />
              </button>
            ))
          )}
        </div>
        <div className="border-t border-gray-100 px-4 py-2">
          <p className="text-[11px] text-gray-400">
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-[10px]">↑↓</kbd> Navigate{' '}
            <kbd className="ml-2 rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-[10px]">↵</kbd> Select{' '}
            <kbd className="ml-2 rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-[10px]">Esc</kbd> Close
          </p>
        </div>
      </div>
    </>
  );
}
