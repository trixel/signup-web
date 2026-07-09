"use client";

import { useRef, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";

interface FileUploadProps {
  label: string;
  description: string;
  accept: string;
  documentNumber: string;
  nameSuffix: string;
  value?: string;
  onChange: (url: string) => void;
  onClear: () => void;
}

export function FileUpload({
  label,
  description,
  accept,
  documentNumber,
  nameSuffix,
  value,
  onChange,
  onClear,
}: FileUploadProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_number", documentNumber);
    formData.append("name_suffix", nameSuffix);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.message || t("validation.uploadError"));
      }

      setFileName(file.name);
      onChange(data.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-black">{label}</p>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`cursor-pointer border border-dashed px-4 py-4 transition ${
          value
            ? "border-black bg-neutral-50"
            : "border-neutral-300 bg-white hover:border-black"
        } ${uploading ? "pointer-events-none opacity-50" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleInputChange}
        />

        {uploading ? (
          <p className="text-sm text-neutral-600">{t("common.uploading")}</p>
        ) : value ? (
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm text-black">
              {fileName || t("common.fileLoaded")}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFileName(null);
                onClear();
              }}
              className="shrink-0 text-xs text-neutral-600 underline-offset-2 hover:text-black hover:underline"
            >
              {t("common.change")}
            </button>
          </div>
        ) : (
          <p className="text-sm text-neutral-600">{t("common.selectFile")}</p>
        )}
      </div>

      {error && <p className="text-xs text-black">{error}</p>}
    </div>
  );
}
