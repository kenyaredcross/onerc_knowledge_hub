import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFrappeFileUpload } from "frappe-react-sdk";
import {
  AlertCircle,
  CheckCircle2,
  CloudUpload,
  FileIcon,
  Upload,
  X,
} from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

interface FileUploadFieldProps {
  value?: string;
  onChange: (fileUrl: string | null, fileData?: any) => void;
  label?: string;
  disabled?: boolean;
  doctype?: string;
  docname?: string;
  fieldname?: string;
  folder?: string;
  isPrivate?: boolean;
  accept?: string;
  className?: string;
  buttonClassName?: string;
}

type UploadState = "idle" | "uploading" | "success" | "error";
const DEFAULT_ACCEPT = ".pdf,.png,.jpg,.jpeg";

function parseFrappeError(err: any): string {
  try {
    const msgs = JSON.parse(err._server_messages);
    const parsed = JSON.parse(msgs[0]);
    return parsed.message || "Upload failed.";
  } catch {
    return err?.message || err?.exception || "Upload failed.";
  }
}

export const FileUploadField = ({
  value,
  onChange,
  label,
  disabled,
  doctype,
  docname,
  fieldname,
  folder = "Home",
  isPrivate = false,
  accept = DEFAULT_ACCEPT,
  className,
  buttonClassName,
}: FileUploadFieldProps) => {
  const [uploadState, setUploadState] = React.useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { upload, progress, reset } = useFrappeFileUpload();

  const isValidFile = (file: File) => {
    const allowed = accept.split(",").map((x) => x.trim().toLowerCase());
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    return allowed.includes(ext);
  };

  const upload_file = async (file: File) => {
    if (!isValidFile(file)) {
      setErrorMessage(`Invalid file type. Allowed: ${accept}`);
      setUploadState("error");
      return;
    }
    setErrorMessage("");
    setUploadState("uploading");
    reset();
    try {
      const hasDocname = typeof docname === "string" && docname.trim() !== "";
      const fileArgs: Record<string, any> = { isPrivate, folder };
      if (doctype && hasDocname) {
        fileArgs.doctype = doctype;
        fileArgs.docname = docname!.trim();
      }
      if (fieldname) fileArgs.fieldname = fieldname;

      const res = await upload(file, fileArgs);
      if (res?.file_url) {
        setUploadState("success");
        onChange(res.file_url, res);
      } else {
        setErrorMessage("Upload succeeded but no file URL was returned.");
        setUploadState("error");
      }
    } catch (e: any) {
      setErrorMessage(parseFrappeError(e));
      setUploadState("error");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await upload_file(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await upload_file(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadState("idle");
    setErrorMessage("");
    reset();
    onChange(null);
  };

  const dismissModal = () => {
    if (uploadState === "error" || uploadState === "success")
      setUploadState("idle");
  };

  const UploadModal =
    uploadState !== "idle"
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={uploadState !== "uploading" ? dismissModal : undefined}
          >
            <div
              className="flex flex-col items-center gap-5 rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {uploadState === "uploading" && (
                <>
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg
                      className="absolute inset-0 h-20 w-20 -rotate-90"
                      viewBox="0 0 80 80"
                    >
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-gray-100"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        className="text-primary transition-all duration-300"
                        strokeDasharray={`${2 * Math.PI * 36}`}
                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - (progress ?? 0) / 100)}`}
                      />
                    </svg>
                    <CloudUpload className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900">
                      Uploading File
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {progress != null
                        ? `${Math.round(progress)}% completed`
                        : "Please wait..."}
                    </p>
                  </div>
                </>
              )}
              {uploadState === "success" && (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900">
                      Success!
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      File uploaded successfully.
                    </p>
                  </div>
                  <Button
                    onClick={dismissModal}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                  >
                    Done
                  </Button>
                </>
              )}
              {uploadState === "error" && (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="text-center w-full">
                    <h3 className="text-lg font-bold text-gray-900">
                      Upload Failed
                    </h3>
                    <p className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-left">
                      {errorMessage}
                    </p>
                  </div>
                  <div className="flex w-full gap-2">
                    <Button
                      variant="outline"
                      onClick={dismissModal}
                      className="flex-1 rounded-xl"
                    >
                      Dismiss
                    </Button>
                    <Button
                      onClick={() => {
                        dismissModal();
                        setTimeout(() => inputRef.current?.click(), 100);
                      }}
                      className="flex-1 rounded-xl bg-gray-900"
                    >
                      Retry
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <label className="text-sm font-semibold text-gray-700">{label}</label>
      )}

      {!value ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 transition-all cursor-pointer",
            "hover:border-primary/50 hover:bg-gray-50",
            isDragging && "border-primary bg-primary/5 scale-[1.02]",
            disabled && "opacity-50 pointer-events-none",
            buttonClassName,
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
            <Upload
              className={cn(
                "h-5 w-5",
                isDragging ? "text-primary" : "text-gray-400",
              )}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {isDragging
                ? "Drop your file here"
                : "Click or drag file to upload"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Supported: {accept.replace(/\./g, "").toUpperCase()}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/30 p-3 pr-2 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
              <FileIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-emerald-900">
                {value.split("/").pop()}
              </span>
              <span className="text-[10px] font-medium uppercase text-emerald-600/70">
                Uploaded
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="h-8 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
            >
              Replace
            </Button>
            <button
              onClick={clearFile}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
      {UploadModal}
    </div>
  );
};
