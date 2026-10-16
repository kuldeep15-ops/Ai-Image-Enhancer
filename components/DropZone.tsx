"use client";

import { useCallback, useRef, useState } from "react";

type DropZoneProps = {
  onFile: (file: File) => void;
  disabled?: boolean;
};

export default function DropZone({ onFile, disabled }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);

  const takeFile = useCallback(
    (file?: File) => {
      if (!file || disabled) return;
      if (!file.type.startsWith("image/")) return;
      onFile(file);
    },
    [disabled, onFile],
  );

  return (
    <div
      className={`dropzone${active ? " active" : ""}`}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setActive(false);
        takeFile(event.dataTransfer.files[0]);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      <input
        ref={inputRef}
        className="hidden-input"
        type="file"
        accept="image/*"
        disabled={disabled}
        onChange={(event) => takeFile(event.target.files?.[0])}
      />
      <div>
        <strong>Drop a photo here</strong>
        <span>or click to choose a JPEG, PNG, or WebP file</span>
      </div>
    </div>
  );
}
