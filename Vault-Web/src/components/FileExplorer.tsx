import React, { useMemo } from "react";
import { VaultFile } from "@/lib/vault";

interface FileExplorerProps {
  files: VaultFile[];
  activeFolder: string;
  onFileSelect: (file: VaultFile) => void;
}

export default function FileExplorer({
  files,
  activeFolder,
  onFileSelect,
}: FileExplorerProps) {
  const displayedFiles = useMemo(() => {
    if (!activeFolder) return [];
    return files.filter((f) => f.folder === activeFolder);
  }, [files, activeFolder]);

  const getFakeDate = () => {
    const d = new Date();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[d.getMonth()]} ${d.getDate().toString().padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        backgroundColor: "#050505",
        color: "#a3a3a3",
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        padding: "24px",
        height: "100%",
        width: "100%",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ color: "#ef4444", fontWeight: "bold" }}>root@kali</span>
        <span style={{ color: "#e5e7eb" }}>:</span>
        <span style={{ color: "#3b82f6", fontWeight: "bold" }}>
          ~/{activeFolder}
        </span>
        <span style={{ color: "#e5e7eb" }}># ls -la</span>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
          fontSize: "0.9rem",
        }}
      >
        <tbody>
          <tr>
            <td style={{ padding: "4px 16px 4px 0", whiteSpace: "nowrap" }}>
              drwxr-xr-x
            </td>
            <td style={{ padding: "4px 16px 4px 0", textAlign: "right" }}>2</td>
            <td style={{ padding: "4px 16px 4px 0" }}>root</td>
            <td style={{ padding: "4px 16px 4px 0" }}>root</td>
            <td style={{ padding: "4px 16px 4px 0", textAlign: "right" }}>
              4096
            </td>
            <td style={{ padding: "4px 16px 4px 0", whiteSpace: "nowrap" }}>
              {getFakeDate()}
            </td>
            <td style={{ padding: "4px 0", color: "#3b82f6", fontWeight: 600 }}>
              .
            </td>
          </tr>
          <tr>
            <td style={{ padding: "4px 16px 4px 0", whiteSpace: "nowrap" }}>
              drwxr-xr-x
            </td>
            <td style={{ padding: "4px 16px 4px 0", textAlign: "right" }}>2</td>
            <td style={{ padding: "4px 16px 4px 0" }}>root</td>
            <td style={{ padding: "4px 16px 4px 0" }}>root</td>
            <td style={{ padding: "4px 16px 4px 0", textAlign: "right" }}>
              4096
            </td>
            <td style={{ padding: "4px 16px 4px 0", whiteSpace: "nowrap" }}>
              {getFakeDate()}
            </td>
            <td style={{ padding: "4px 0", color: "#3b82f6", fontWeight: 600 }}>
              ..
            </td>
          </tr>

          {displayedFiles.map((file) => {
            const size =
              file.content?.length || ((file.path.length * 42) % 5000) + 100;
            return (
              <tr
                key={file.path}
                onClick={() => onFileSelect(file)}
                style={{
                  cursor: "pointer",
                  transition: "background-color 0.1s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(16, 185, 129, 0.1)";
                  e.currentTarget.style.color = "#10b981";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "inherit";
                }}
              >
                <td style={{ padding: "4px 16px 4px 0", whiteSpace: "nowrap" }}>
                  -rw-r--r--
                </td>
                <td style={{ padding: "4px 16px 4px 0", textAlign: "right" }}>
                  1
                </td>
                <td style={{ padding: "4px 16px 4px 0" }}>root</td>
                <td style={{ padding: "4px 16px 4px 0" }}>root</td>
                <td style={{ padding: "4px 16px 4px 0", textAlign: "right" }}>
                  {size}
                </td>
                <td style={{ padding: "4px 16px 4px 0", whiteSpace: "nowrap" }}>
                  {getFakeDate()}
                </td>
                <td style={{ padding: "4px 0", color: "#e5e7eb" }}>
                  {file.name}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {displayedFiles.length === 0 && (
        <div style={{ marginTop: "16px", color: "#525252" }}>total 0</div>
      )}
    </div>
  );
}
