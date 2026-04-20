'use client';

import './ContentEditor.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Typography from '@tiptap/extension-typography';
import CharacterCount from '@tiptap/extension-character-count';
import TextAlign from '@tiptap/extension-text-align';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
    FiBold, FiItalic, FiLink, FiX, FiCode,
    FiType, FiAlignLeft, FiSave, FiChevronRight,
    FiChevronLeft, FiZap, FiCheck, FiClock,
    FiBarChart2, FiMessageSquare, FiImage, FiVideo,
    FiList, FiMic
} from 'react-icons/fi';
import { RiDoubleQuotesL, RiHeading, RiH2, RiH3 } from 'react-icons/ri';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SlashCommand {
    icon: React.ReactNode;
    label: string;
    description: string;
    action: () => void;
}

interface ContentEditorProps {
    initialContent?: string;
    onSave?: (html: string) => void | Promise<void>;
    placeholder?: string;
    title?: string;
}

// ─── Save Status ──────────────────────────────────────────────────────────────
type SaveStatus = 'idle' | 'saving' | 'saved';

// ─── SEO Score ────────────────────────────────────────────────────────────────
function calcSeoScore(text: string, title: string): number {
    let score = 0;
    if (title.length >= 30 && title.length <= 60) score += 25;
    else if (title.length > 0) score += 10;
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 300) score += 25;
    else if (words.length >= 100) score += 10;
    if (text.includes('##') || text.includes('<h2')) score += 15;
    if (words.length > 0) score += 15;
    if (text.match(/[.!?]/g)?.length ?? 0 > 3) score += 20;
    return Math.min(score, 100);
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────
function ToolbarBtn({
    onClick, active, children, title
}: { onClick: () => void; active?: boolean; children: React.ReactNode; title?: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded-md transition-all duration-150 text-sm ${
                active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
        >
            {children}
        </button>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ContentEditor({
    initialContent = '',
    onSave,
    title: initialTitle = '',
}: ContentEditorProps) {
    const [title, setTitle] = useState(initialTitle);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [slashMenu, setSlashMenu] = useState<{ open: boolean; x: number; y: number }>({ open: false, x: 0, y: 0 });
    const [linkDialog, setLinkDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [tone, setTone] = useState('احترافي');
    const [charCount, setCharCount] = useState(0);
    const [wordCount, setWordCount] = useState(0);
    const [seoScore, setSeoScore] = useState(0);
    const [bubblePos, setBubblePos] = useState<{ top: number; left: number } | null>(null);
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);

    // ── Editor ────────────────────────────────────────────────────────────────
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Placeholder.configure({
                placeholder: 'اكتب "/" لإدراج محتوى، أو ابدأ رحلتك الإبداعية هنا...',
                considerAnyAsEmpty: true,
            }),
            Highlight.configure({ multicolor: true }),
            Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-indigo-600 underline underline-offset-2' } }),
            Typography,
            CharacterCount,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        content: initialContent,
        editorProps: {
            attributes: {
                class: 'prose prose-slate prose-lg max-w-none focus:outline-none min-h-[500px] leading-8',
                dir: 'rtl',
            },
            handleKeyDown(_, event) {
                if (event.key === '/') {
                    setTimeout(() => {
                        const sel = window.getSelection();
                        if (sel && sel.rangeCount > 0) {
                            const range = sel.getRangeAt(0);
                            const rect = range.getBoundingClientRect();
                            const canvasEl = editorRef.current;
                            const canvasRect = canvasEl?.getBoundingClientRect();
                            if (canvasRect) {
                                setSlashMenu({
                                    open: true,
                                    x: rect.left - canvasRect.left,
                                    y: rect.bottom - canvasRect.top + 8,
                                });
                            }
                        }
                    }, 50);
                }
                return false;
            },
        },
        onUpdate({ editor }) {
            const text = editor.getText();
            const words = text.trim().split(/\s+/).filter(Boolean);
            setCharCount(editor.storage.characterCount.characters());
            setWordCount(words.length);
            setSeoScore(calcSeoScore(text, title));
            // auto-save
            if (saveTimer.current) clearTimeout(saveTimer.current);
            setSaveStatus('saving');
            saveTimer.current = setTimeout(async () => {
                if (onSave) await onSave(editor.getHTML());
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            }, 1500);
        },
        onSelectionUpdate({ editor }) {
            const { from, to } = editor.state.selection;
            if (from === to) { setBubblePos(null); return; }
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                const canvasRect = editorRef.current?.getBoundingClientRect();
                if (canvasRect && rect.width > 0) {
                    setBubblePos({
                        top: rect.top - canvasRect.top - 48,
                        left: Math.max(0, rect.left - canvasRect.left + rect.width / 2 - 120),
                    });
                } else {
                    setBubblePos(null);
                }
            }
        },
    });

    // Recalc SEO when title changes
    useEffect(() => {
        if (editor) setSeoScore(calcSeoScore(editor.getText(), title));
    }, [title, editor]);

    // ── Slash Commands ────────────────────────────────────────────────────────
    const slashCommands: SlashCommand[] = [
        {
            icon: <FiImage size={16} />, label: 'صورة', description: 'أدرج صورة من رابط',
            action: () => { editor?.chain().focus().run(); closeSlash(); }
        },
        {
            icon: <FiVideo size={16} />, label: 'فيديو', description: 'فيديو YouTube أو Vimeo',
            action: () => { editor?.chain().focus().run(); closeSlash(); }
        },
        {
            icon: <FiCode size={16} />, label: 'كود', description: 'كتلة كود برمجي',
            action: () => { editor?.chain().focus().toggleCodeBlock().run(); closeSlash(); }
        },
        {
            icon: <FiList size={16} />, label: 'قائمة', description: 'قائمة نقطية',
            action: () => { editor?.chain().focus().toggleBulletList().run(); closeSlash(); }
        },
        {
            icon: <RiDoubleQuotesL size={16} />, label: 'اقتباس', description: 'نص اقتباس مميز',
            action: () => { editor?.chain().focus().toggleBlockquote().run(); closeSlash(); }
        },
        {
            icon: <FiZap size={16} className="text-indigo-500" />, label: 'قسم AI', description: 'توليد محتوى بالذكاء الاصطناعي',
            action: () => { editor?.chain().focus().run(); closeSlash(); }
        },
    ];

    const closeSlash = () => setSlashMenu({ open: false, x: 0, y: 0 });

    // ── Link Dialog ───────────────────────────────────────────────────────────
    const applyLink = () => {
        if (linkUrl) {
            editor?.chain().focus().setLink({ href: linkUrl }).run();
        } else {
            editor?.chain().focus().unsetLink().run();
        }
        setLinkDialog(false);
        setLinkUrl('');
    };

    // ── SEO Score Color ───────────────────────────────────────────────────────
    const seoColor = seoScore >= 70 ? '#10B981' : seoScore >= 40 ? '#F59E0B' : '#EF4444';
    const seoLabel = seoScore >= 70 ? 'ممتاز' : seoScore >= 40 ? 'متوسط' : 'ضعيف';

    const tones = ['احترافي', 'ودّي', 'أكاديمي', 'تسويقي', 'إبداعي'];

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="editor-root" dir="rtl">
            {/* ── Top Bar ─────────────────────────────────────────────────── */}
            <div className="editor-topbar">
                <div className="editor-topbar-left">
                    <span className="editor-brand">منصتي الرقمية</span>
                    <span className="editor-divider" />
                    <span className="editor-stat">{wordCount} كلمة</span>
                    <span className="editor-stat">{charCount} حرف</span>
                </div>

                <div className="editor-topbar-right">
                    {/* Save indicator */}
                    <AnimatePresence mode="wait">
                        {saveStatus === 'saving' && (
                            <motion.div key="saving"
                                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="save-badge saving"
                            >
                                <FiClock size={12} className="animate-spin" /> حفظ...
                            </motion.div>
                        )}
                        {saveStatus === 'saved' && (
                            <motion.div key="saved"
                                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="save-badge saved"
                            >
                                <FiCheck size={12} /> تم الحفظ
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        className="sidebar-toggle-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        title="AI Co-pilot"
                    >
                        <FiZap size={16} />
                        <span>AI Co-pilot</span>
                        {sidebarOpen ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
                    </button>
                </div>
            </div>

            {/* ── Content Area + Sidebar ───────────────────────────────────── */}
            <div className="editor-body">

                {/* ── Canvas ────────────────────────────────────────────── */}
                <div className="editor-canvas-wrapper">
                    <div className="editor-canvas" ref={editorRef}>

                        {/* Title input */}
                        <textarea
                            className="editor-title"
                            placeholder="عنوان المقال..."
                            value={title}
                            dir="rtl"
                            rows={1}
                            onChange={e => {
                                setTitle(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                        />

                        {/* Floating Bubble Toolbar */}
                        <AnimatePresence>
                            {editor && bubblePos && (
                                <motion.div
                                    key="bubble"
                                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                    transition={{ duration: 0.12 }}
                                    className="bubble-menu"
                                    style={{ position: 'absolute', top: bubblePos.top, left: bubblePos.left, zIndex: 50 }}
                                    onMouseDown={e => e.preventDefault()}
                                >
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="عريض">
                                        <FiBold size={14} />
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="مائل">
                                        <FiItalic size={14} />
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="تظليل">
                                        <FiType size={14} />
                                    </ToolbarBtn>
                                    <div className="bubble-sep" />
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="عنوان 1">
                                        <RiHeading size={14} />
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="عنوان 2">
                                        <RiH2 size={14} />
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="اقتباس">
                                        <RiDoubleQuotesL size={14} />
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="كود">
                                        <FiCode size={14} />
                                    </ToolbarBtn>
                                    <div className="bubble-sep" />
                                    <ToolbarBtn onClick={() => setLinkDialog(true)} active={editor.isActive('link')} title="رابط">
                                        <FiLink size={14} />
                                    </ToolbarBtn>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* TipTap Editor */}
                        <EditorContent editor={editor} className="tiptap-content" />

                        {/* Slash Command Menu */}
                        <AnimatePresence>
                            {slashMenu.open && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                    transition={{ duration: 0.15 }}
                                    className="slash-menu"
                                    style={{ top: slashMenu.y, left: slashMenu.x }}
                                >
                                    <p className="slash-menu-heading">أدرج محتوى</p>
                                    {slashCommands.map((cmd, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            className="slash-item"
                                            onClick={cmd.action}
                                        >
                                            <span className="slash-item-icon">{cmd.icon}</span>
                                            <span>
                                                <span className="slash-item-label">{cmd.label}</span>
                                                <span className="slash-item-desc">{cmd.description}</span>
                                            </span>
                                        </button>
                                    ))}
                                    <button className="slash-close" onClick={closeSlash}><FiX size={12} /></button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Link Dialog */}
                        <AnimatePresence>
                            {linkDialog && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="link-dialog-overlay"
                                    onClick={() => setLinkDialog(false)}
                                >
                                    <div className="link-dialog" onClick={e => e.stopPropagation()}>
                                        <p className="link-dialog-title">إدراج رابط</p>
                                        <input
                                            autoFocus
                                            type="url"
                                            dir="ltr"
                                            placeholder="https://..."
                                            className="link-dialog-input"
                                            value={linkUrl}
                                            onChange={e => setLinkUrl(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && applyLink()}
                                        />
                                        <div className="link-dialog-actions">
                                            <button className="btn-primary" onClick={applyLink}>تطبيق</button>
                                            <button className="btn-ghost" onClick={() => setLinkDialog(false)}>إلغاء</button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── AI Sidebar ────────────────────────────────────────── */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.aside
                            key="sidebar"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="ai-sidebar"
                        >
                            <div className="ai-sidebar-inner">
                                {/* Header */}
                                <div className="ai-sidebar-header">
                                    <span className="ai-sidebar-title">
                                        <FiZap size={16} className="text-indigo-500" />
                                        AI Co-pilot
                                    </span>
                                    <button onClick={() => setSidebarOpen(false)} className="ai-close-btn">
                                        <FiX size={16} />
                                    </button>
                                </div>

                                {/* SEO Score */}
                                <div className="ai-card">
                                    <div className="ai-card-header">
                                        <FiBarChart2 size={15} />
                                        <span>تقييم SEO</span>
                                    </div>
                                    <div className="seo-score-ring-wrapper">
                                        <svg viewBox="0 0 80 80" className="seo-ring">
                                            <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="7" />
                                            <circle
                                                cx="40" cy="40" r="34" fill="none"
                                                stroke={seoColor} strokeWidth="7"
                                                strokeLinecap="round"
                                                strokeDasharray={`${(seoScore / 100) * 213.6} 213.6`}
                                                transform="rotate(-90 40 40)"
                                                style={{ transition: 'stroke-dasharray 0.5s ease' }}
                                            />
                                            <text x="50%" y="50%" textAnchor="middle" dy="0.4em" fontSize="17" fontWeight="700" fill={seoColor}>{seoScore}</text>
                                        </svg>
                                        <span className="seo-label" style={{ color: seoColor }}>{seoLabel}</span>
                                    </div>
                                    <ul className="seo-hints">
                                        <SeoHint ok={title.length >= 30} label="العنوان: 30-60 حرف" />
                                        <SeoHint ok={wordCount >= 300} label="المحتوى: +300 كلمة" />
                                        <SeoHint ok={editor?.isActive('heading') || false} label="وجود عناوين فرعية" />
                                    </ul>
                                </div>

                                {/* Tone Switcher */}
                                <div className="ai-card">
                                    <div className="ai-card-header">
                                        <FiMic size={15} />
                                        <span>نبرة الكتابة</span>
                                    </div>
                                    <div className="tone-grid">
                                        {tones.map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                className={`tone-btn ${tone === t ? 'active' : ''}`}
                                                onClick={() => setTone(t)}
                                            >{t}</button>
                                        ))}
                                    </div>
                                </div>

                                {/* Grammar */}
                                <div className="ai-card">
                                    <div className="ai-card-header">
                                        <FiMessageSquare size={15} />
                                        <span>تصحيح لغوي</span>
                                    </div>
                                    <p className="ai-note">ميزة التصحيح اللغوي المتخصص بالعربية قيد التطوير. قريباً!</p>
                                    <button className="btn-primary w-full" disabled>
                                        تصحيح النص <span className="opacity-50 text-xs">(قريباً)</span>
                                    </button>
                                </div>

                                {/* Stats */}
                                <div className="ai-card">
                                    <div className="ai-card-header">
                                        <FiAlignLeft size={15} />
                                        <span>إحصائيات</span>
                                    </div>
                                    <div className="stats-grid">
                                        <Stat label="كلمة" value={wordCount} />
                                        <Stat label="حرف" value={charCount} />
                                        <Stat label="وقت القراءة" value={`${Math.max(1, Math.ceil(wordCount / 200))} د`} />
                                        <Stat label="SEO" value={`${seoScore}%`} />
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ─── Helper components ────────────────────────────────────────────────────────
function SeoHint({ ok, label }: { ok: boolean; label: string }) {
    return (
        <li className={`seo-hint ${ok ? 'ok' : ''}`}>
            <span className="seo-hint-dot" />
            {label}
        </li>
    );
}

function Stat({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="stat-item">
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
        </div>
    );
}

function FiAlignLeft({ size }: { size?: number }) {
    return <FiBarChart2 size={size} />;
}
