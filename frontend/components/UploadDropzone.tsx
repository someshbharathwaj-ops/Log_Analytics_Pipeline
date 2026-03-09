"use client";

import { AnimatePresence, motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import { useAnalytics } from "@/hooks/use-analytics";

export function UploadDropzone() {
  const { uploadFile, uploading } = useAnalytics();
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    await uploadFile(file);
  };

  return (
    <div
      className={`glass rounded-2xl border-2 border-dashed p-6 transition ${
        dragActive ? "border-accent bg-accent/10" : "border-white/15"
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragActive(false);
        const file = event.dataTransfer.files?.[0];
        if (file) {
          void handleFile(file);
        }
      }}
    >
      <div className="flex flex-col items-center text-center">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="mb-3 rounded-full border border-white/15 p-3"
        >
          <UploadCloud className="h-6 w-6 text-accent" />
        </motion.div>
        <p className="text-base font-medium">Drop log file here</p>
        <p className="text-sm text-muted">or click to choose .txt/.log file</p>
        <button
          type="button"
          className="mt-4 rounded-lg bg-gradient-to-r from-accent to-accent2 px-4 py-2 text-sm font-medium text-bg"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Analyzing..." : "Choose File"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.log"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleFile(file);
            }
          }}
        />
        <AnimatePresence>
          {fileName ? (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="mt-3 text-xs text-muted"
            >
              Latest upload: {fileName}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}