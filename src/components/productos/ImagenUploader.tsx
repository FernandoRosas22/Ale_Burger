// ============================================================
// ImagenUploader.tsx — Subida de imagen con preview y compresión
// ============================================================

import { useRef, useState } from "react";
import { subirImagen, validarImagen } from "@/services/storage.service";

interface ImagenUploaderProps {
  imageUrl: string;
  imageRef: string;
  onChange: (url: string, ref: string) => void;
  disabled?: boolean;
}

export default function ImagenUploader({ imageUrl, onChange, disabled }: ImagenUploaderProps) {
  const inputRef          = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error,    setError]    = useState("");
  const [preview,  setPreview]  = useState<string>("");

  const handleFile = async (file: File) => {
    const err = validarImagen(file);
    if (err) { setError(err); return; }
    setError("");

    // Preview inmediato
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setSubiendo(true);

    try {
      const { url, ref } = await subirImagen(file, "products");
      onChange(url, ref);
    } catch (e: any) {
      setError("Error al subir la imagen. Revisá la configuración de Firebase Storage.");
      setPreview("");
    } finally {
      setSubiendo(false);
      URL.revokeObjectURL(localUrl);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const src = preview || imageUrl;

  return (
    <div className="iu-wrap">
      <div
        className={`iu-zone${subiendo ? " iu-zone--loading" : ""}${disabled ? " iu-zone--disabled" : ""}`}
        onClick={() => !disabled && !subiendo && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Subir imagen"
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        {src ? (
          <div className="iu-preview">
            <img src={src} alt="Preview" className="iu-img" />
            {!subiendo && !disabled && (
              <div className="iu-overlay">
                <span>📷 Cambiar imagen</span>
              </div>
            )}
            {subiendo && (
              <div className="iu-overlay iu-overlay--loading">
                <div className="iu-spinner" />
                <span>Subiendo...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="iu-placeholder">
            {subiendo ? (
              <>
                <div className="iu-spinner" />
                <span>Subiendo imagen...</span>
              </>
            ) : (
              <>
                <span className="iu-icon">📷</span>
                <span className="iu-label">Subir imagen</span>
                <span className="iu-hint">JPG, PNG o WebP · Máx. 5MB</span>
                <span className="iu-hint">Se comprime automáticamente a 800px</span>
              </>
            )}
          </div>
        )}
      </div>
      {error && <p className="iu-error">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
        disabled={disabled || subiendo}
      />
    </div>
  );
}
