import React, { useMemo, useState } from "react";
import { VaultFile } from "@/lib/vault";
import { Folder, FileText, ChevronRight, CornerLeftUp } from "lucide-react";

interface FileExplorerProps {
  files: VaultFile[];
  activeFolder: string;
  onFileSelect: (file: VaultFile) => void;
}

interface DirectoryItem {
  name: string;
  type: "file" | "folder";
  path: string; // The full path for this item
  file?: VaultFile; // Only present if type === "file"
}

export default function FileExplorer({
  files,
  activeFolder,
  onFileSelect,
}: FileExplorerProps) {
  const [prevActiveFolder, setPrevActiveFolder] = useState(activeFolder);
  const [currentPath, setCurrentPath] = useState(activeFolder);

  // Reset current path when active folder changes from sidebar
  if (activeFolder !== prevActiveFolder) {
    setPrevActiveFolder(activeFolder);
    setCurrentPath(activeFolder);
  }

  const items = useMemo(() => {
    if (!currentPath) return [];

    const folderMap = new Map<string, DirectoryItem>();
    const fileList: DirectoryItem[] = [];

    // Filter files to only those under currentPath
    const prefix = currentPath + "/";
    const exactMatch = currentPath;

    files.forEach((f) => {
      // Normalize path to use forward slashes and remove leading slash if any
      let normalized = f.path.replace(/\\/g, "/");
      if (normalized.startsWith("/")) normalized = normalized.slice(1);

      if (normalized.startsWith(prefix) || normalized === exactMatch) {
        const relative = normalized.startsWith(prefix)
          ? normalized.slice(prefix.length)
          : normalized.slice(exactMatch.length);

        if (!relative) return;

        const parts = relative.split("/");

        if (parts.length === 1) {
          // It's a direct file
          fileList.push({
            name: parts[0],
            type: "file",
            path: normalized,
            file: f,
          });
        } else {
          // It's in a subfolder
          const folderName = parts[0];
          if (!folderMap.has(folderName)) {
            folderMap.set(folderName, {
              name: folderName,
              type: "folder",
              path: prefix + folderName,
            });
          }
        }
      }
    });

    const folders = Array.from(folderMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const directFiles = fileList.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return [...folders, ...directFiles];
  }, [files, currentPath]);

  const breadcrumbs = currentPath.split("/").filter(Boolean);

  const getFakeDate = () => {
    const d = new Date();
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return `${months[d.getMonth()]} ${d.getDate().toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        backgroundColor: "#050505",
        color: "#e5e7eb",
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        padding: "24px",
        height: "100%",
        width: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Breadcrumb Header */}
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "0.95rem",
          flexWrap: "wrap",
        }}
      >
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          const crumbPath = breadcrumbs.slice(0, idx + 1).join("/");
          return (
            <React.Fragment key={crumbPath}>
              <span
                onClick={() => !isLast && setCurrentPath(crumbPath)}
                style={{
                  color: isLast ? "#e5e7eb" : "#3b82f6",
                  fontWeight: isLast ? "bold" : "normal",
                  cursor: isLast ? "default" : "pointer",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isLast) e.currentTarget.style.color = "#60a5fa";
                }}
                onMouseLeave={(e) => {
                  if (!isLast) e.currentTarget.style.color = "#3b82f6";
                }}
              >
                {crumb}
              </span>
              {!isLast && (
                <ChevronRight size={16} style={{ color: "#525252" }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* File Table */}
      <div
        style={{
          flex: 1,
          border: "1px solid #030303",
          borderRadius: "6px",
          overflow: "hidden",
          backgroundColor: "#000000",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "0.9rem",
          }}
        >
          <thead
            style={{
              backgroundColor: "#111",
              borderBottom: "1px solid #030303",
            }}
          >
            <tr>
              <th
                style={{
                  padding: "8px 16px",
                  fontWeight: "normal",
                  color: "#888",
                  width: "60%",
                }}
              >
                Name
              </th>
              <th
                style={{
                  padding: "8px 16px",
                  fontWeight: "normal",
                  color: "#888",
                  width: "20%",
                }}
              >
                Date Modified
              </th>
              <th
                style={{
                  padding: "8px 16px",
                  fontWeight: "normal",
                  color: "#888",
                  width: "20%",
                }}
              >
                Size
              </th>
            </tr>
          </thead>
          <tbody>
            {currentPath !== activeFolder && (
              <tr
                onClick={() => {
                  const parts = currentPath.split("/");
                  parts.pop();
                  setCurrentPath(parts.join("/"));
                }}
                style={{
                  cursor: "pointer",
                  borderBottom: "1px solid #030303",
                  transition: "background-color 0.1s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#030303")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <td
                  colSpan={3}
                  style={{
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "#3b82f6",
                  }}
                >
                  <CornerLeftUp size={16} />
                  <span style={{ fontWeight: 600 }}>..</span>
                </td>
              </tr>
            )}

            {items.map((item) => {
              const isFolder = item.type === "folder";
              const size = isFolder
                ? "-"
                : (item.file?.content?.length ||
                    ((item.path.length * 42) % 5000) + 100) + " B";

              return (
                <tr
                  key={item.path}
                  onClick={() => {
                    if (isFolder) {
                      setCurrentPath(item.path);
                    } else if (item.file) {
                      onFileSelect(item.file);
                    }
                  }}
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid #030303",
                    transition: "background-color 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isFolder
                      ? "rgba(59, 130, 246, 0.1)"
                      : "rgba(16, 185, 129, 0.1)";
                    const textSpan = e.currentTarget.querySelector(
                      ".item-name"
                    ) as HTMLElement;
                    if (textSpan)
                      textSpan.style.color = isFolder ? "#60a5fa" : "#34d399";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    const textSpan = e.currentTarget.querySelector(
                      ".item-name"
                    ) as HTMLElement;
                    if (textSpan) textSpan.style.color = "inherit";
                  }}
                >
                  <td style={{ padding: "8px 16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {isFolder ? (
                        <Folder
                          size={16}
                          style={{ color: "#3b82f6" }}
                          fill="#3b82f6"
                          fillOpacity={0.2}
                        />
                      ) : (
                        <FileText size={16} style={{ color: "#10b981" }} />
                      )}
                      <span
                        className="item-name"
                        style={{ transition: "color 0.1s" }}
                      >
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "8px 16px", color: "#888" }}>
                    {getFakeDate()}
                  </td>
                  <td style={{ padding: "8px 16px", color: "#888" }}>{size}</td>
                </tr>
              );
            })}

            {items.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  style={{
                    padding: "24px 16px",
                    textAlign: "center",
                    color: "#525252",
                  }}
                >
                  This folder is empty
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
