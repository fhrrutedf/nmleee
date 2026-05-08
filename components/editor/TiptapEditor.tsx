"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import Youtube from '@tiptap/extension-youtube';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useEffect } from 'react';
import { 
    FiBold, FiItalic, FiUnderline, FiAlignRight, FiAlignCenter, 
    FiAlignLeft, FiAlignJustify, FiList, FiImage, FiLink, 
    FiYoutube, FiType, FiDroplet, FiGrid, FiRotateCcw, FiRotateCw 
} from 'react-icons/fi';

interface TiptapEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const addImage = useCallback(() => {
        const url = window.prompt('أدخل رابط الصورة');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const addYoutubeVideo = useCallback(() => {
        const url = window.prompt('أدخل رابط فيديو يوتيوب');
        if (url) {
            editor.commands.setYoutubeVideo({ src: url });
        }
    }, [editor]);

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('أدخل الرابط', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    return (
        <div className="sticky top-0 z-50 bg-[#0A0A0A] border-b border-emerald-500/20 p-2 flex flex-wrap gap-2 items-center rounded-t-xl">
            {/* History */}
            <div className="flex gap-1 bg-[#111111] p-1 rounded-lg">
                <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-2 rounded hover:bg-emerald-800 disabled:opacity-50 text-slate-300"><FiRotateCcw /></button>
                <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-2 rounded hover:bg-emerald-800 disabled:opacity-50 text-slate-300"><FiRotateCw /></button>
            </div>

            <div className="w-px h-6 bg-slate-700 mx-1"></div>

            {/* Text Formats */}
            <div className="flex gap-1 bg-[#111111] p-1 rounded-lg">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded ${editor.isActive('bold') ? 'bg-emerald-700 text-white' : 'hover:bg-emerald-800 text-slate-300'}`}><FiBold /></button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded ${editor.isActive('italic') ? 'bg-emerald-700 text-white' : 'hover:bg-emerald-800 text-slate-300'}`}><FiItalic /></button>
                <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-2 rounded ${editor.isActive('underline') ? 'bg-emerald-700 text-white' : 'hover:bg-emerald-800 text-slate-300'}`}><FiUnderline /></button>
                <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={`p-2 rounded ${editor.isActive('highlight') ? 'bg-amber-600 text-white' : 'hover:bg-emerald-800 text-slate-300'}`}><FiDroplet /></button>
            </div>

            <div className="w-px h-6 bg-slate-700 mx-1"></div>

            {/* Headers */}
            <div className="flex gap-1 bg-[#111111] p-1 rounded-lg">
                {[1, 2, 3].map((level) => (
                    <button 
                        key={level}
                        onClick={() => editor.chain().focus().toggleHeading({ level: level as any }).run()} 
                        className={`p-2 rounded text-xs font-bold ${editor.isActive('heading', { level }) ? 'bg-emerald-700 text-white' : 'hover:bg-emerald-800 text-slate-300'}`}
                    >
                        H{level}
                    </button>
                ))}
            </div>

            <div className="w-px h-6 bg-slate-700 mx-1"></div>

            {/* Alignment */}
            <div className="flex gap-1 bg-[#111111] p-1 rounded-lg">
                <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-2 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-emerald-700 text-white' : 'hover:bg-emerald-800 text-slate-300'}`}><FiAlignRight /></button>
                <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-2 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-emerald-700 text-white' : 'hover:bg-emerald-800 text-slate-300'}`}><FiAlignCenter /></button>
                <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-2 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-emerald-700 text-white' : 'hover:bg-emerald-800 text-slate-300'}`}><FiAlignLeft /></button>
                <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`p-2 rounded ${editor.isActive({ textAlign: 'justify' }) ? 'bg-emerald-700 text-white' : 'hover:bg-emerald-800 text-slate-300'}`}><FiAlignJustify /></button>
            </div>

            <div className="w-px h-6 bg-slate-700 mx-1"></div>

            {/* Lists & Media */}
            <div className="flex gap-1 bg-[#111111] p-1 rounded-lg">
                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-emerald-700 text-white' : 'hover:bg-emerald-800 text-slate-300'}`}><FiList /></button>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-emerald-700 text-white' : 'hover:bg-emerald-800 text-slate-300'}`}><span className="font-bold text-xs">1.</span></button>
                <button onClick={setLink} className={`p-2 rounded ${editor.isActive('link') ? 'bg-emerald-700 text-white' : 'hover:bg-emerald-800 text-slate-300'}`}><FiLink /></button>
                <button onClick={addImage} className="p-2 rounded hover:bg-emerald-800 text-slate-300"><FiImage /></button>
                <button onClick={addYoutubeVideo} className="p-2 rounded hover:bg-emerald-800 text-slate-300"><FiYoutube /></button>
            </div>

            <div className="w-px h-6 bg-slate-700 mx-1"></div>

            {/* Table */}
            <div className="flex gap-1 bg-[#111111] p-1 rounded-lg">
                <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="p-2 rounded hover:bg-emerald-800 text-slate-300" title="إدراج جدول"><FiGrid /></button>
                {editor.isActive('table') && (
                    <>
                        <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="p-1 px-2 text-xs rounded hover:bg-emerald-800 text-slate-300">+ عمود</button>
                        <button onClick={() => editor.chain().focus().addRowAfter().run()} className="p-1 px-2 text-xs rounded hover:bg-emerald-800 text-slate-300">+ صف</button>
                        <button onClick={() => editor.chain().focus().deleteTable().run()} className="p-1 px-2 text-xs rounded hover:bg-red-900/50 text-red-400">حذف جدول</button>
                    </>
                )}
            </div>
            
            <div className="w-px h-6 bg-slate-700 mx-1"></div>
            
            {/* Custom Blocks (Callouts) */}
            <div className="flex gap-1 bg-[#111111] p-1 rounded-lg">
                <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded ${editor.isActive('blockquote') ? 'bg-emerald-700 text-white' : 'hover:bg-emerald-800 text-slate-300'}`} title="اقتباس">" "</button>
            </div>
        </div>
    );
};

export default function TiptapEditor({ value, onChange, placeholder }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                defaultAlignment: 'right',
            }),
            Underline,
            TextStyle,
            Color,
            Highlight,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
            }),
            Youtube.configure({
                controls: true,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({
                placeholder: placeholder || 'اكتب مقالتك الرائعة هنا...',
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[500px] w-full max-w-none p-6 text-slate-300',
                dir: 'rtl',
            },
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value, false);
        }
    }, [value, editor]);

    return (
        <div className="bg-[#111111] rounded-xl border border-emerald-500/20 shadow-lg shadow-[#10B981]/10 flex flex-col w-full relative group">
            <MenuBar editor={editor} />
            <div className="flex-1 w-full overflow-y-auto" style={{ maxHeight: '800px' }}>
                <EditorContent editor={editor} />
            </div>
            
            <style jsx global>{`
                /* Tiptap Custom Styling based on user requirements */
                .ProseMirror p {
                    font-size: 18px;
                    line-height: 1.8;
                    color: #94a3b8;
                    margin-bottom: 24px;
                    text-align: justify;
                }
                .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
                    color: #ffffff;
                    margin-top: 32px;
                    margin-bottom: 16px;
                    font-weight: 900;
                }
                .ProseMirror h2 {
                    font-size: 28px;
                    border-right: 4px solid #10b981;
                    padding-right: 16px;
                }
                .ProseMirror blockquote {
                    background-color: rgba(16, 185, 129, 0.05);
                    border-right: 4px solid #10b981;
                    border-left: none;
                    color: #cbd5e1;
                    font-style: italic;
                    padding: 24px;
                    margin-bottom: 32px;
                    border-radius: 4px 16px 16px 4px;
                    font-size: 1.1rem;
                }
                .ProseMirror table {
                    border-collapse: collapse;
                    table-layout: fixed;
                    width: 100%;
                    margin: 2rem 0;
                    overflow: hidden;
                    border-radius: 1rem;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .ProseMirror table td,
                .ProseMirror table th {
                    min-width: 1em;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 12px;
                    vertical-align: top;
                    box-sizing: border-box;
                    position: relative;
                    color: #94a3b8;
                }
                .ProseMirror table th {
                    font-weight: bold;
                    text-align: right;
                    background-color: rgba(16, 185, 129, 0.1);
                    color: #10b981;
                }
                .ProseMirror pre {
                    background: #000000;
                    color: #e2e8f0;
                    font-family: 'Fira Code', monospace;
                    padding: 20px;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    margin: 2rem 0;
                }
                .ProseMirror img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
                    margin: 2rem 0;
                }
                .ProseMirror .is-empty::before {
                    color: #475569;
                    content: attr(data-placeholder);
                    float: right;
                    pointer-events: none;
                    height: 0;
                }
            `}</style>
        </div>
    );
}
