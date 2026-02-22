"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill/dist/quill.snow.css";

// Dynamic import with no SSR to avoid 'document is not defined' error
const ReactQuill = dynamic(() => import("react-quill"), {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-50 flex animate-pulse rounded-2xl border border-gray-200"></div>,
});

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'direction': 'rtl' }],                         // text direction
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['clean']                                         // remove formatting button
        ],
    }), []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'blockquote', 'code-block',
        'list', 'bullet',
        'direction', 'align',
        'link', 'image', 'video'
    ];

    return (
        <div className="rich-text-editor-wrapper bg-white rounded-2xl border border-gray-200 overflow-hidden dark:bg-card-white dark:border-gray-800">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder || 'اكتب هنا...'}
                className="h-64"
            />
            {/* Adding global styles for ReactQuill to support dark mode nicely */}
            <style jsx global>{`
                .ql-toolbar.ql-snow {
                    border: none;
                    border-bottom: 1px solid #e5e7eb;
                    background-color: #f9fafb;
                    border-radius: 1rem 1rem 0 0;
                    padding: 12px;
                }
                .dark .ql-toolbar.ql-snow {
                    background-color: #1a1e26;
                    border-bottom-color: #2b303b;
                }
                .ql-container.ql-snow {
                    border: none;
                    font-family: inherit;
                    font-size: 1rem;
                }
                .ql-editor {
                    min-height: 14rem;
                    padding: 1.5rem;
                }
                .dark .ql-editor {
                    color: #fff;
                }
                .dark .ql-snow .ql-stroke {
                    stroke: #9ca3af;
                }
                .dark .ql-snow .ql-fill, .dark .ql-snow .ql-stroke.ql-fill {
                    fill: #9ca3af;
                }
                .dark .ql-picker {
                    color: #9ca3af;
                }
                .ql-editor.ql-blank::before {
                    color: #9ca3af;
                    font-style: italic;
                    right: 1.5rem; /* for RTL pseudo element placeholder */
                    left: auto;
                }
            `}</style>
        </div>
    );
}
