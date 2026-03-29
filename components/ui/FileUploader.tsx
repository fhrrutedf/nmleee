"use client";

import React, { useCallback, useState } from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";
import { FiUploadCloud, FiX, FiCheckCircle, FiAlertCircle, FiFile, FiLock } from "react-icons/fi";
import toast from "react-hot-toast";

export interface FileUploaderProps {
    onUploadSuccess: (urls: string[], fileNames?: string[]) => void;
    maxFiles?: number;
    accept?: DropzoneOptions["accept"];
    maxSize?: number; // bytes
    isPrivate?: boolean; // Secure upload concept vs public (default false = public product-images / files)
}

export default function FileUploader({
    onUploadSuccess,
    maxFiles = 1,
    accept,
    maxSize = 100 * 1024 * 1024, // default 100MB
    isPrivate = false,
}: FileUploaderProps) {

    // Truncates long filenames while preserving extension
    const truncateFilename = (name: string, maxLen = 20): string => {
        if (name.length <= maxLen) return name;
        const dotIndex = name.lastIndexOf('.');
        const ext = dotIndex > 0 ? name.substring(dotIndex) : '';
        const base = name.substring(0, maxLen - ext.length - 3);
        return base + '...' + ext;
    };

    const [uploads, setUploads] = useState<
        {
            file: File;
            progress: number;
            status: "uploading" | "success" | "error";
            url?: string;
        }[]
    >([]);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 0) return;

            // Trim array to maxFiles
            const filesToUpload = acceptedFiles.slice(0, maxFiles);

            const newUploads = filesToUpload.map((file) => ({
                file,
                progress: 0,
                status: "uploading" as const,
            }));

            setUploads((prev) => {
                if (maxFiles === 1) return newUploads;
                return [...prev, ...newUploads];
            });

            filesToUpload.forEach((file) => {
                uploadFile(file);
            });
        },
        [maxFiles]
    );

    const uploadFile = (file: File) => {
        // Removed global toast loading to prevent UI overlap on mobile
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", file.type.startsWith("image/") ? "image" : "file");
        // isPrivate could be sent to endpoint if implemented

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload", true);

        // Progress event
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                setUploads((prev) =>
                    prev.map((upload) =>
                        upload.file === file
                            ? { ...upload, progress: percentComplete }
                            : upload
                    )
                );
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                setUploads((prev) => {
                    const newArray = prev.map((upload) =>
                        upload.file === file
                            ? { ...upload, status: "success" as const, progress: 100, url: response.url }
                            : upload
                    );

                    // Call onUploadSuccess with all successful URLs
                    const successfulUrls = newArray
                        .filter((u) => u.status === "success" && u.url)
                        .map((u) => u.url!);
                    const fileNames = newArray
                        .filter((u) => u.status === "success" && u.url)
                        .map((u) => u.file.name);

                    // Only trigger if we've uploaded everything recently pushed, for simplicity we trigger on every success
                    onUploadSuccess(successfulUrls, fileNames);

                    return newArray;
                });
            } else {
                let errorMsg = "Upload failed";
                try {
                    const errorResponse = JSON.parse(xhr.responseText);
                    errorMsg = errorResponse.error || errorMsg;
                } catch (e) { }

                setUploads((prev) =>
                    prev.map((upload) =>
                        upload.file === file
                            ? { ...upload, status: "error" as const, progress: 0 }
                            : upload
                    )
                );
                toast.error(`فشل رفع الملف ${file.name}: ${errorMsg}`);
            }
        };

        xhr.onerror = () => {
            setUploads((prev) =>
                prev.map((upload) =>
                    upload.file === file
                        ? { ...upload, status: "error" as const, progress: 0 }
                        : upload
                )
            );
            toast.error(`خطأ في الشبكة أثناء رفع ${file.name}`);
        };

        xhr.send(formData);
    };

    const removeUpload = (fileToRemove: File) => {
        setUploads((prev) => {
            const newArray = prev.filter((u) => u.file !== fileToRemove);

            // Trigger update with remaining successful URLs
            const successfulUrls = newArray
                .filter((u) => u.status === "success" && u.url)
                .map((u) => u.url!);
            onUploadSuccess(successfulUrls);

            return newArray;
        });
    };

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept,
        maxSize,
        maxFiles,
    });

    return (
        <div className="w-full overflow-hidden">
            {/* Dropzone Area */}
            <div
                {...getRootProps()}
                className={`w-full border-2 border-dashed rounded-xl p-4 sm:p-8 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[140px] sm:min-h-[180px] overflow-hidden
                ${isDragActive
                        ? "border-emerald-600 bg-emerald-700/5"
                        : "border-gray-300 dark:border-gray-700 bg-[#111111] dark:bg-card-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
            >
                <input {...getInputProps()} />
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#0A0A0A] dark:bg-bg-light shadow-lg shadow-[#10B981]/20 rounded-xl flex items-center justify-center mb-2 sm:mb-3 shrink-0">
                    <FiUploadCloud className="text-xl sm:text-2xl text-[#10B981]" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-[#10B981] dark:text-white mb-1 text-center w-full">
                    {isDragActive ? "أفلت الملفات هنا..." : "اسحب وأفلت أو اضغط للاختيار"}
                </h4>
                <p className="text-xs sm:text-sm text-text-muted text-center w-full px-2">
                    PDF، صور، فيديو، ZIP
                    {isPrivate && <span className="block mt-1 text-[#10B981] flex items-center justify-center gap-1"><FiLock size={12} /> حماية الروابط مفعلة</span>}
                </p>

                {maxFiles > 1 && (
                    <div className="mt-3 text-xs font-semibold bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-xl text-gray-600 dark:text-gray-300">
                        الحد الأقصى {maxFiles} ملفات
                    </div>
                )}
            </div>

            {/* Error Messages for rejections */}
            {fileRejections.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 text-sm">
                    <ul>
                        {fileRejections.map(({ file, errors }) => (
                            <li key={file.name} className="flex items-center gap-2">
                                <FiAlertCircle />
                                {file.name}: {errors.map(e => e.message).join(", ")}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Upload List & Progress Bars */}
            {uploads.length > 0 && (
                <div className="mt-4 space-y-2" style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
                    {uploads.map((upload, index) => (
                        <div
                            key={index}
                            dir="rtl"
                            style={{ position: 'relative', overflow: 'hidden', width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'var(--card-white)', borderRadius: '12px', border: '1px solid #f3f4f6' }}
                            className="shadow-lg shadow-[#10B981]/20 dark:border-gray-800"
                        >
                            {/* Progress Background */}
                            {upload.status === "uploading" && (
                                <div
                                    style={{
                                        position: 'absolute', inset: 0, zIndex: 0,
                                        background: 'rgba(0,82,255,0.04)',
                                        width: `${upload.progress}%`,
                                        pointerEvents: 'none',
                                        transition: 'width 0.3s ease',
                                    }}
                                />
                            )}

                            {/* File Icon — rightmost in RTL */}
                            <div className="flex-shrink-0 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg" style={{ position: 'relative', zIndex: 1 }}>
                                <FiFile className="text-base text-gray-500" />
                            </div>

                            {/* File Info — hard-constrained */}
                            <div style={{ flex: '1 1 0%', minWidth: 0, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
                                {/* Filename: JS truncation + CSS truncation = 100% safe */}
                                <div
                                    dir="ltr"
                                    title={upload.file.name}
                                    style={{
                                        display: 'block',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '100%',
                                        width: '100%',
                                        fontSize: '0.8125rem',
                                        fontWeight: 600,
                                    }}
                                    className="text-white dark:text-white"
                                >
                                    {truncateFilename(upload.file.name)}
                                </div>

                                {/* Size + Status */}
                                <div className="flex items-center justify-between text-xs mt-0.5 gap-1">
                                    <span className="text-gray-400 flex-shrink-0">
                                        {(upload.file.size / (1024 * 1024)).toFixed(1)} MB
                                    </span>
                                    {upload.status === "uploading" && (
                                        <span className="text-[#10B981] font-bold flex-shrink-0">{upload.progress}%</span>
                                    )}
                                    {upload.status === "success" && (
                                        <span className="text-green-500 flex items-center gap-1 font-medium flex-shrink-0">
                                            <FiCheckCircle size={11} /><span>مكتمل</span>
                                        </span>
                                    )}
                                    {upload.status === "error" && (
                                        <span className="text-red-500 flex items-center gap-1 font-medium flex-shrink-0">
                                            <FiAlertCircle size={11} /><span>فشل</span>
                                        </span>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                {upload.status === "uploading" && (
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-xl mt-1.5 overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-700 rounded-xl"
                                            style={{ width: `${upload.progress}%`, transition: 'width 0.3s ease' }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Delete button — leftmost in RTL */}
                            <button
                                type="button"
                                onClick={() => removeUpload(upload.file)}
                                className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                style={{ position: 'relative', zIndex: 1 }}
                                title="حذف"
                            >
                                <FiX size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
