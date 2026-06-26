import React, { useState, useEffect, useRef } from "react";
import { VaultFile } from "@/lib/vault";
import { createSearchIndex } from "@/lib/search";
import { Search, File as FileIcon } from "lucide-react";

interface SearchPaletteProps {
  files: VaultFile[];
  onSelect: (file: VaultFile) => void;
}

export function SearchPalette({ files, onSelect }: SearchPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VaultFile[]>([]);
  const fuse = useRef(createSearchIndex(files));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fuse.current = createSearchIndex(files);
  }, [files]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleOpenSearch = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-search", handleOpenSearch);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-search", handleOpenSearch);
    };
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isOpen) {
      inputRef.current?.focus();
      if (query) {
        // Debounce the search operation
        // ⚡ Bolt: delays fuse.current.search by 300ms to avoid blocking main thread on every keystroke
        timeoutId = setTimeout(() => {
          const searchResults = fuse.current.search(query).map((r) => r.item);
          setResults(searchResults);
        }, 300);
      } else {
        timeoutId = setTimeout(() => {
          setResults([]);
        }, 0);
      }
    } else {
      timeoutId = setTimeout(() => {
        setQuery("");
        setResults([]);
      }, 0);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOpen, query]);

  const handleSelect = (file: VaultFile) => {
    onSelect(file);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
      <div className="w-full max-w-2xl bg-[#1e1e1e] border border-[#333] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[60vh] relative z-10">
        <div className="flex items-center px-4 border-b border-[#333]">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            ref={inputRef}
            type="text"
            className="w-full py-4 bg-transparent text-gray-200 placeholder-gray-500 outline-none"
            placeholder="Search files... (Ctrl+K to open)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {results.length > 0 && (
          <div className="overflow-y-auto p-2">
            {results.map((file, idx) => (
              <button
                key={file.path + idx}
                className="w-full flex items-center px-4 py-3 hover:bg-[#2a2a2a] rounded-md text-left transition-colors"
                onClick={() => handleSelect(file)}
              >
                <FileIcon className="w-4 h-4 text-gray-400 mr-3 shrink-0" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-gray-200 truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {file.folder}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
        {query && results.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">
            No files found matching &quot;{query}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
