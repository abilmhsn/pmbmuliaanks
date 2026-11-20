'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  RemoveFormatting,
  Eye,
  Code2,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  isDark?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Tulis isi artikel berita di sini...',
  minHeight = '360px',
  isDark = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'html'>('editor');
  const [htmlCode, setHtmlCode] = useState(value || '');
  const isUpdatingRef = useRef(false);

  // Sinkronisasi value dari parent ke editor jika berubah dari luar
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
      setHtmlCode(value || '');
    }
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current) return;
    isUpdatingRef.current = true;
    const content = editorRef.current.innerHTML;
    setHtmlCode(content);
    onChange(content);
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);
  };

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (viewMode !== 'editor') setViewMode('editor');
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleInsertLink = () => {
    const url = prompt('Masukkan URL tautan (contoh: https://example.com):');
    if (url && url.trim() !== '') {
      executeCommand('createLink', url.trim());
    }
  };

  const handleInsertImage = () => {
    const url = prompt('Masukkan URL gambar (atau upload cover di bagian atas form):');
    if (url && url.trim() !== '') {
      executeCommand('insertImage', url.trim());
    }
  };

  const handleHtmlCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setHtmlCode(newHtml);
    onChange(newHtml);
    if (editorRef.current) {
      editorRef.current.innerHTML = newHtml;
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden flex flex-col ${
        isDark
          ? 'bg-slate-900/90 border-slate-700/80 text-slate-100 shadow-inner'
          : 'bg-white border-slate-200 text-slate-800 shadow-sm'
      }`}
    >
      {/* Toolbar */}
      <div
        className={`p-2.5 border-b flex flex-wrap items-center gap-1 select-none sticky top-0 z-10 backdrop-blur-md ${
          isDark
            ? 'bg-slate-800/80 border-slate-700 text-slate-200'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-300 dark:border-slate-700">
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            title="Tebal (Ctrl+B)"
            className={`p-1.5 rounded-lg transition-colors hover:bg-purple-500/20 hover:text-purple-400 active:scale-95`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            title="Miring (Ctrl+I)"
            className={`p-1.5 rounded-lg transition-colors hover:bg-purple-500/20 hover:text-purple-400 active:scale-95`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            title="Garis Bawah (Ctrl+U)"
            className={`p-1.5 rounded-lg transition-colors hover:bg-purple-500/20 hover:text-purple-400 active:scale-95`}
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-300 dark:border-slate-700">
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h2>')}
            title="Heading 2"
            className="px-2 py-1 text-xs font-bold rounded-lg hover:bg-purple-500/20 hover:text-purple-400 active:scale-95"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h3>')}
            title="Heading 3"
            className="px-2 py-1 text-xs font-bold rounded-lg hover:bg-purple-500/20 hover:text-purple-400 active:scale-95"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<p>')}
            title="Paragraf Normal"
            className="px-2 py-1 text-xs font-medium rounded-lg hover:bg-purple-500/20 hover:text-purple-400 active:scale-95"
          >
            P
          </button>
        </div>

        <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-300 dark:border-slate-700">
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            title="Bullet List"
            className="p-1.5 rounded-lg transition-colors hover:bg-purple-500/20 hover:text-purple-400 active:scale-95"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            title="Numbered List"
            className="p-1.5 rounded-lg transition-colors hover:bg-purple-500/20 hover:text-purple-400 active:scale-95"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<blockquote>')}
            title="Kutipan / Blockquote"
            className="p-1.5 rounded-lg transition-colors hover:bg-purple-500/20 hover:text-purple-400 active:scale-95"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-300 dark:border-slate-700">
          <button
            type="button"
            onClick={handleInsertLink}
            title="Sisipkan Tautan Web"
            className="p-1.5 rounded-lg transition-colors hover:bg-purple-500/20 hover:text-purple-400 active:scale-95"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleInsertImage}
            title="Sisipkan URL Gambar"
            className="p-1.5 rounded-lg transition-colors hover:bg-purple-500/20 hover:text-purple-400 active:scale-95"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('removeFormat')}
            title="Hapus Format Tulisan"
            className="p-1.5 rounded-lg transition-colors hover:bg-rose-500/20 hover:text-rose-400 active:scale-95"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-300 dark:border-slate-700">
          <button
            type="button"
            onClick={() => executeCommand('undo')}
            title="Undo"
            className="p-1.5 rounded-lg transition-colors hover:bg-purple-500/20 hover:text-purple-400 active:scale-95"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('redo')}
            title="Redo"
            className="p-1.5 rounded-lg transition-colors hover:bg-purple-500/20 hover:text-purple-400 active:scale-95"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Switches */}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode('editor')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'editor'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
              viewMode === 'preview'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Pratinjau</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('html')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
              viewMode === 'html'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>HTML</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="relative flex-1 p-4 overflow-y-auto" style={{ minHeight }}>
        {viewMode === 'editor' && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            className={`prose max-w-none outline-none focus:outline-none min-h-full ${
              isDark ? 'prose-invert text-slate-100' : 'text-slate-900'
            }`}
            data-placeholder={placeholder}
            style={{ minHeight: '300px' }}
          />
        )}

        {viewMode === 'preview' && (
          <div
            className={`prose max-w-none min-h-full ${
              isDark ? 'prose-invert text-slate-200' : 'text-slate-800'
            }`}
            dangerouslySetInnerHTML={{
              __html:
                htmlCode.trim() !== ''
                  ? htmlCode
                  : `<p class="italic text-slate-400">Belum ada konten yang ditulis untuk dipratinjau.</p>`,
            }}
          />
        )}

        {viewMode === 'html' && (
          <textarea
            value={htmlCode}
            onChange={handleHtmlCodeChange}
            rows={12}
            className={`w-full h-full font-mono text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-purple-200'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
            placeholder="Kode HTML konten berita..."
          />
        )}
      </div>
    </div>
  );
}
