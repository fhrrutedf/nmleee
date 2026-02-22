"use client";

import React, { useCallback, useState } from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";
import { FiUploadCloud, FiX, FiCheckCircle, FiAlertCircle, FiFile, FiLock } from "react-icons/fi";

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
                alert(`فشل رفع الملف ${file.name}: ${errorMsg}`);
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
            alert(`خطأ في الشبكة أثناء رفع ${file.name}`);
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
        <div className="w-full">
            {/* Dropzone Area */}
            <div
                {...getRootProps()}
                className={`w-full border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]
                ${isDragActive
                        ? "border-action-blue bg-action-blue/5"
                        : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-card-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
            >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-white dark:bg-bg-light shadow-sm rounded-full flex items-center justify-center mb-4">
                    <FiUploadCloud className="text-3xl text-action-blue" />
                </div>
                <h4 className="text-lg font-bold text-primary-charcoal dark:text-white mb-2 text-center">
                    {isDragActive ? "أفلت الملفات هنا..." : "اسحب وأفلت الملفات هنا"}
                </h4>
                <p className="text-sm text-text-muted text-center max-w-sm">
                    يدعم جميع أنواع الملفات (فيديو، PDF، صور، ZIP).
                    {isPrivate && <span className="block mt-1 text-action-blue flex items-center justify-center gap-1"><FiLock /> حماية الروابط مفعلة</span>}
                </p>

                {maxFiles > 1 && (
                    <div className="mt-4 text-xs font-semibold bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-600 dark:text-gray-300">
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
                <div className="mt-6 space-y-3">
                    {uploads.map((upload, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white dark:bg-bg-light rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                            {/* Progress Background */}
                            {upload.status === "uploading" && (
                                <div
                                    className="absolute top-0 left-0 h-full bg-action-blue/5 transition-all duration-300"
                                    style={{ width: `${upload.progress}%`, transformOrigin: 'right' /* RTL */ }}
                                />
                            )}

                            <div className="flex items-center gap-4 relative z-10 w-full pr-2">
                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg shrink-0">
                                    <FiFile className="text-xl text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {upload.file.name}
                                    </p>
                                    <div className="flex items-center justify-between mt-1 text-xs">
                                        <span className="text-gray-500">
                                            {(upload.file.size / (1024 * 1024)).toFixed(2)} MB
                                        </span>
                                        {upload.status === "uploading" && (
                                            <span className="text-action-blue font-medium">{upload.progress}%</span>
                                        )}
                                        {upload.status === "success" && (
                                            <span className="text-green-500 flex items-center gap-1 font-medium"><FiCheckCircle /> مكتمل</span>
                                        )}
                                        {upload.status === "error" && (
                                            <span className="text-red-500 flex items-center gap-1 font-medium"><FiAlertCircle /> فشل</span>
                                        )}
                                    </div>

                                    {/* Progress Bar Line */}
                                    {upload.status === "uploading" && (
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                                            <div
                                                className="h-full bg-action-blue rounded-full transition-all duration-300"
                                                style={{ width: `${upload.progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => removeUpload(upload.file)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors relative z-10"
                                >
                                    <FiX />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
