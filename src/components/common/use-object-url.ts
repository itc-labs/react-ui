'use client';
import { useEffect, useState } from 'react';

export function useObjectUrl(file: File | null | undefined) {
  const [entry, setEntry] = useState<{ file: File; url: string } | null>(null);

  useEffect(() => {
    if (!file) {
      setEntry(null);

      return;
    }
    const url = URL.createObjectURL(file);
    setEntry({ file, url });

    return () => URL.revokeObjectURL(url);
  }, [file]);

  return entry && entry.file === file ? entry.url : undefined;
}
