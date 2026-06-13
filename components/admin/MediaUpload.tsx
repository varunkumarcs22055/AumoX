"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X, Image as ImageIcon, Film } from "lucide-react";

type MediaType = "image" | "video";

type Props = {
  value?: string;
  /** Type of the existing value, for correct preview rendering. */
  valueType?: MediaType;
  /** What can be uploaded. */
  accept?: "image" | "video" | "both";
  /** Cloudinary folder bucket. */
  folder?: "aumoxo/insights" | "aumoxo/solutions" | "aumoxo/media";
  label?: string;
  className?: string;
  onChange: (url: string, type: MediaType) => void;
  onClear?: () => void;
};

export default function MediaUpload({
  value,
  valueType,
  accept = "image",
  folder = "aumoxo/media",
  label,
  className = "",
  onChange,
  onClear,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const acceptAttr =
    accept === "image" ? "image/*" : accept === "video" ? "video/*" : "image/*,video/*";

  async function handleFile(file: File) {
    setError("");
    setBusy(true);
    setProgress(0);
    try {
      const signRes = await fetch("/api/admin/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });
      if (!signRes.ok) {
        const d = await signRes.json().catch(() => ({}));
        setError(d.error || "Cloudinary not configured.");
        return;
      }
      const sig = await signRes.json();
      const isVideo = file.type.startsWith("video");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", sig.apiKey);
      fd.append("timestamp", String(sig.timestamp));
      fd.append("signature", sig.signature);
      fd.append("folder", sig.folder);

      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/${isVideo ? "video" : "image"}/upload`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText).secure_url); }
            catch { reject(new Error("bad response")); }
          } else reject(new Error("upload failed"));
        };
        xhr.onerror = () => reject(new Error("upload failed"));
        xhr.send(fd);
      });
      onChange(url, isVideo ? "video" : "image");
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setBusy(false);
      setProgress(0);
    }
  }

  const isVideoVal = value && (valueType === "video" || /\/video\/upload\/|\.(mp4|webm|mov|m4v)(\?|$)/i.test(value));

  return (
    <div className={className}>
      {label && <span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">{label}</span>}
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-line bg-bg-base group">
          {isVideoVal ? (
            <video src={value} className="w-full h-40 object-cover" muted playsInline controls />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-full h-40 object-cover" />
          )}
          <div className="absolute top-2 right-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="grid h-8 w-8 place-items-center rounded-lg bg-bg-base/80 backdrop-blur text-gold-300 hover:text-gold-200 border border-gold-400/30"
              title="Replace"
            >
              <Upload size={14} />
            </button>
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="grid h-8 w-8 place-items-center rounded-lg bg-bg-base/80 backdrop-blur text-red-400 hover:text-red-300 border border-red-400/30"
                title="Remove"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="w-full rounded-xl border border-dashed border-line hover:border-gold-400/50 bg-bg-base/40 p-6 grid place-items-center text-center transition-colors disabled:opacity-60"
        >
          {busy ? (
            <div className="w-full max-w-[200px]">
              <div className="flex items-center justify-center gap-2 text-sm text-gold-300">
                <Loader2 size={15} className="animate-spin" /> Uploading… {progress}%
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                <div className="h-full bg-gold-gradient transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="text-ink-400">
              <div className="flex items-center justify-center gap-2 text-gold-400">
                {accept === "video" ? <Film size={18} /> : <ImageIcon size={18} />}
                <Upload size={16} />
              </div>
              <div className="mt-2 text-sm font-light">
                Upload {accept === "both" ? "image or video" : accept}
              </div>
              <div className="text-[11px] text-ink-500 mt-0.5">Direct to Cloudinary · large files OK</div>
            </div>
          )}
        </button>
      )}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
