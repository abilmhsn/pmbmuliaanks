'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
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
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});
  const isUpdatingRef = useRef(false);

  // Sinkronisasi value & pastikan konten tetap terisi saat pindah kembali ke tab 'editor'
  useEffect(() => {
    const incoming = value || '';
    if (!isUpdatingRef.current) {
      setHtmlCode(incoming);
    }
    if (viewMode === 'editor' && editorRef.current) {
      if (editorRef.current.innerHTML !== incoming) {
        editorRef.current.innerHTML = incoming;
      }
    }
  }, [value, viewMode]);

  const updateActiveFormats = useCallback(() => {
    if (typeof document === 'undefined' || viewMode !== 'editor') return;
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
      });
    } catch {
      // Abaikan jika selection belum tersedia
    }
  }, [viewMode]);

  const handleInput = () => {
    if (!editorRef.current) return;
    isUpdatingRef.current = true;
    const content = editorRef.current.innerHTML;
    setHtmlCode(content);
    onChange(content);
    updateActiveFormats();
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);
  };

  const executeCommand = (command: string, arg?: string) => {
    if (viewMode !== 'editor') setViewMode('editor');
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    handleInput();
  };

  // Simpan posisi seleksi teks sebelum membuka prompt() agar tidak hilang
  const saveSelection = (): Range | null => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      return sel.getRangeAt(0);
    }
    return null;
  };

  const restoreSelection = (range: Range | null) => {
    if (!range) return;
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  const handleInsertLink = () => {
    if (viewMode !== 'editor') setViewMode('editor');
    const savedRange = saveSelection();
    const url = prompt('Masukkan URL tautan (contoh: https://example.com):');

    if (url && url.trim() !== '') {
      const cleanUrl = url.trim();
      if (editorRef.current) editorRef.current.focus();
      restoreSelection(savedRange);

      const sel = window.getSelection();
      if (sel && sel.toString().trim() === '') {
        // Jika tidak ada teks yang diblok, sisipkan URL langsung sebagai teks tautan
        document.execCommand(
          'insertHTML',
          false,
          `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>`
        );
      } else {
        document.execCommand('createLink', false, cleanUrl);
      }
      handleInput();
    }
  };

  const handleInsertImage = () => {
    if (viewMode !== 'editor') setViewMode('editor');
    const savedRange = saveSelection();
    const url = prompt('Masukkan URL gambar (atau upload cover di bagian atas form):');

    if (url && url.trim() !== '') {
      if (editorRef.current) editorRef.current.focus();
      restoreSelection(savedRange);
      document.execCommand('insertImage', false, url.trim());
      handleInput();
    }
  };

  const handleHtmlCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setHtmlCode(newHtml);
    onChange(newHtml);
  };

  const isEditorEmpty =
    !htmlCode ||
    htmlCode.trim() === '' ||
    htmlCode.trim() === '<br>' ||
    htmlCode.trim() === '<p><br></p>';

  const getToolBtnClass = (isActive = false) => {
    if (isActive) {
      return isDark
        ? 'p-1.5 rounded-lg bg-sky-500/25 text-sky-300 transition-colors active:scale-95'
        : 'p-1.5 rounded-lg bg-[#0f172a] text-white transition-colors active:scale-95';
    }
    return `p-1.5 rounded-lg transition-colors active:scale-95 ${isDark
        ? 'hover:bg-sky-500/20 hover:text-sky-400 text-slate-200'
        : 'hover:bg-[#0f172a]/10 hover:text-[#0f172a] text-slate-700'
      }`;
  };

  const headingBtnClass = `px-2 py-1 text-xs rounded-lg transition-colors active:scale-95 ${isDark
      ? 'hover:bg-sky-500/20 hover:text-sky-400 text-slate-200'
      : 'hover:bg-[#0f172a]/10 hover:text-[#0f172a] text-slate-700'
    }`;

  const dividerClass = `flex items-center gap-0.5 px-1.5 border-r ${isDark ? 'border-slate-700' : 'border-slate-300'
    }`;

  const getTabClass = (mode: 'editor' | 'preview' | 'html') => {
    if (viewMode === mode) {
      return isDark
        ? 'bg-sky-600 text-white shadow-sm'
        : 'bg-[#0f172a] text-white shadow-sm';
    }
    return isDark
      ? 'text-slate-400 hover:text-white hover:bg-slate-700/60'
      : 'text-slate-600 hover:text-[#0f172a] hover:bg-slate-200/70';
  };

  // Styling eksplisit agar H2, H3, List, Quote, dan Link tetap terlihat rapi tanpa bergantung plugin
  const richContentStyle = `
    prose max-w-none outline-none focus:outline-none min-h-full
    [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:mt-4 [&_h2]:mb-2
    [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-1.5
    [&_p]:my-2 [&_p]:leading-relaxed
    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2
    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2
    [&_li]:my-1
    [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:my-3 [&_blockquote]:italic
    [&_img]:rounded-xl [&_img]:max-h-80 [&_img]:my-3
    ${isDark
      ? 'prose-invert text-slate-100 [&_blockquote]:border-sky-500 [&_blockquote]:text-slate-300 [&_a]:text-sky-400 [&_a]:underline'
      : 'text-[#0f172a] [&_blockquote]:border-[#0f172a] [&_blockquote]:text-slate-600 [&_a]:text-sky-600 [&_a]:underline'
    }
  `;

  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden flex flex-col ${isDark
          ? 'bg-slate-950 border-slate-800 text-slate-100 shadow-inner'
          : 'bg-white border-slate-200 text-[#0f172a] shadow-sm'
        }`}
    >
      {/* Toolbar */}
      <div
        className={`p-2.5 border-b flex flex-wrap items-center gap-1 select-none sticky top-0 z-10 backdrop-blur-md ${isDark
            ? 'bg-slate-900/90 border-slate-800 text-slate-200'
            : 'bg-slate-50 border-slate-200 text-[#0f172a]'
          }`}
      >
        {/* Text Formatting */}
        <div
          className={`flex items-center gap-0.5 pr-1.5 border-r ${isDark ? 'border-slate-700' : 'border-slate-300'
            }`}
        >
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('bold')}
            title="Tebal (Ctrl+B)"
            className={getToolBtnClass(activeFormats.bold)}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('italic')}
            title="Miring (Ctrl+I)"
            className={getToolBtnClass(activeFormats.italic)}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('underline')}
            title="Garis Bawah (Ctrl+U)"
            className={getToolBtnClass(activeFormats.underline)}
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>

        {/* Headings & Paragraph */}
        <div className={dividerClass}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('formatBlock', '<h2>')}
            title="Heading 2"
            className={`${headingBtnClass} font-bold`}
          >
            H2
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('formatBlock', '<h3>')}
            title="Heading 3"
            className={`${headingBtnClass} font-bold`}
          >
            H3
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('formatBlock', '<p>')}
            title="Paragraf Normal"
            className={`${headingBtnClass} font-medium`}
          >
            P
          </button>
        </div>

        {/* Lists & Quote */}
        <div className={dividerClass}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('insertUnorderedList')}
            title="Bullet List"
            className={getToolBtnClass(activeFormats.insertUnorderedList)}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('insertOrderedList')}
            title="Numbered List"
            className={getToolBtnClass(activeFormats.insertOrderedList)}
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('formatBlock', '<blockquote>')}
            title="Kutipan / Blockquote"
            className={getToolBtnClass(false)}
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        {/* Links, Image & Clear Format */}
        <div className={dividerClass}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleInsertLink}
            title="Sisipkan Tautan Web"
            className={getToolBtnClass(false)}
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleInsertImage}
            title="Sisipkan URL Gambar"
            className={getToolBtnClass(false)}
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('removeFormat')}
            title="Hapus Format Tulisan"
            className="p-1.5 rounded-lg transition-colors hover:bg-rose-500/15 hover:text-rose-500 active:scale-95"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>

        {/* Undo & Redo */}
        <div className={dividerClass}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('undo')}
            title="Undo"
            className={getToolBtnClass(false)}
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('redo')}
            title="Redo"
            className={getToolBtnClass(false)}
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Switches */}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode('editor')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${getTabClass('editor')}`}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${getTabClass('preview')}`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Pratinjau</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('html')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${getTabClass('html')}`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>HTML</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="relative flex-1 p-4 overflow-y-auto" style={{ minHeight }}>
        {viewMode === 'editor' && (
          <>
            {isEditorEmpty && (
              <span
                className={`pointer-events-none absolute top-4 left-4 text-sm select-none ${isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
              >
                {placeholder}
              </span>
            )}
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              onBlur={handleInput}
              onKeyUp={updateActiveFormats}
              onMouseUp={updateActiveFormats}
              className={richContentStyle}
              style={{ minHeight: '300px' }}
            />
          </>
        )}

        {viewMode === 'preview' && (
          <div
            className={richContentStyle}
            dangerouslySetInnerHTML={{
              __html: !isEditorEmpty
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
            className={`w-full h-full font-mono text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 ${isDark
                ? 'bg-slate-900 border-slate-800 text-sky-200 focus:ring-sky-500'
                : 'bg-slate-50 border-slate-200 text-[#0f172a] focus:ring-[#0f172a]'
              }`}
            placeholder="Kode HTML konten berita..."
          />
        )}
      </div>
    </div>
  );
}