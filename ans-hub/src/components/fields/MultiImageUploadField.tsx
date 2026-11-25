import { cn } from "../../lib/utils";
import { useFrappeFileUpload } from "frappe-react-sdk";
import { AlertCircle, ImagePlus, Loader2, X } from "lucide-react";
import * as React from "react";

export type UploadedPhoto = {
  image: string;
  caption: string;
  credit: string;
};

interface MultiImageUploadFieldProps {
  value: UploadedPhoto[];
  onChange: (photos: UploadedPhoto[]) => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
  accept?: string;
  folder?: string;
  captionPlaceholder?: string;
  creditPlaceholder?: string;
  className?: string;
}

const DEFAULT_ACCEPT = ".png,.jpg,.jpeg,.webp,.gif";

function parseFrappeError(err: any): string {
  try {
    const msgs = JSON.parse(err._server_messages);
    const parsed = JSON.parse(msgs[0]);
    return parsed.message || "Upload failed.";
  } catch {
    return err?.message || err?.exception || "Upload failed.";
  }
}

/**
 * Uploads several images in one go and keeps a caption and credit against each
 * one, so a member can assemble a whole album in a single pass.
 */
export const MultiImageUploadField = ({
  value,
  onChange,
  label,
  hint,
  disabled,
  accept = DEFAULT_ACCEPT,
  folder = "Home",
  captionPlaceholder = "Add a caption",
  creditPlaceholder = "Photographer or source",
  className,
}: MultiImageUploadFieldProps) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [progressLabel, setProgressLabel] = React.useState("");
  const [errors, setErrors] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { upload, reset } = useFrappeFileUpload();

  const allowed = React.useMemo(
    () => accept.split(",").map((x) => x.trim().toLowerCase()),
    [accept],
  );

  const isValidFile = (file: File) => {
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    return allowed.includes(ext);
  };

  const uploadFiles = async (files: File[]) => {
    if (!files.length) return;

    setErrors([]);
    setBusy(true);

    const uploaded: UploadedPhoto[] = [];
    const failed: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgressLabel(`${i + 1} / ${files.length}`);

      if (!isValidFile(file)) {
        failed.push(`${file.name}: unsupported file type`);
        continue;
      }

      try {
        reset();
        const res = await upload(file, { isPrivate: false, folder });
        if (res?.file_url) {
          uploaded.push({ image: res.file_url, caption: "", credit: "" });
        } else {
          failed.push(`${file.name}: no file URL returned`);
        }
      } catch (e: any) {
        failed.push(`${file.name}: ${parseFrappeError(e)}`);
      }
    }

    setBusy(false);
    setProgressLabel("");
    setErrors(failed);

    if (uploaded.length) onChange([...value, ...uploaded]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await uploadFiles(files);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    await uploadFiles(Array.from(e.dataTransfer.files || []));
  };

  const updatePhoto = (index: number, patch: Partial<UploadedPhoto>) => {
    onChange(value.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };

  const removePhoto = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {label && (
        <div>
          <label className="text-sm font-bold text-gray-800">{label}</label>
          {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !busy && inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 transition-all",
          !busy && "cursor-pointer hover:border-dash-red/50 hover:bg-gray-50",
          isDragging && "border-dash-red bg-dash-red/5",
          (disabled || busy) && "pointer-events-none opacity-70",
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm">
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin text-dash-red" />
          ) : (
            <ImagePlus
              className={cn("h-5 w-5", isDragging ? "text-dash-red" : "text-gray-400")}
            />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            {busy
              ? `Uploading photos ${progressLabel}`
              : isDragging
                ? "Drop your photos here"
                : "Click or drag photos to upload"}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            You can select several at once &middot;{" "}
            {accept.replace(/\./g, "").toUpperCase()}
          </p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="space-y-1 rounded-xl border border-red-100 bg-red-50 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-red-700">
            <AlertCircle className="h-3.5 w-3.5" />
            Some photos could not be uploaded
          </div>
          {errors.map((message) => (
            <p key={message} className="pl-5 text-xs text-red-600">
              {message}
            </p>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {value.map((photo, index) => (
            <div
              key={`${photo.image}-${index}`}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={photo.image}
                  alt={photo.caption || `Photo ${index + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  aria-label={`Remove photo ${index + 1}`}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white transition-colors hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2 p-3">
                <input
                  type="text"
                  value={photo.caption}
                  onChange={(e) => updatePhoto(index, { caption: e.target.value })}
                  placeholder={captionPlaceholder}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs focus:border-dash-red focus:bg-white focus:outline-none"
                />
                <input
                  type="text"
                  value={photo.credit}
                  onChange={(e) => updatePhoto(index, { credit: e.target.value })}
                  placeholder={creditPlaceholder}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs focus:border-dash-red focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
