import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { VaultFile } from "@/lib/vault";

interface MarkdownReaderProps {
  file: VaultFile;
  renderBlockquote?: (props: { children?: React.ReactNode }) => React.ReactNode;
}

const staticRemarkPlugins = [remarkGfm, remarkMath];
const staticRehypePlugins = [rehypeKatex];

// Helper to extract Obsidian callouts from blockquotes
const defaultRenderBlockquote = (props: { children?: React.ReactNode }) => {
    const { children } = props;

    let isCallout = false;
    let calloutType = "note";
    let calloutTitle = "";

    const childrenArray = React.Children.toArray(children);

    const processChildren = (nodes: React.ReactNode[]): React.ReactNode[] => {
      let matched = false;
      return nodes.map((node) => {
        if (!React.isValidElement(node)) return node;

        if (node.type === "p" && !matched) {
          const pProps = node.props as { children?: React.ReactNode };
          const pChildren = React.Children.toArray(pProps.children);
          const firstChild = pChildren[0];

          if (typeof firstChild === "string") {
            const match = firstChild.match(
              /^\[!(note|warning|error|danger|success|example|info)\](.*)/i,
            );
            if (match) {
              matched = true;
              isCallout = true;
              calloutType = match[1].toLowerCase();
              calloutTitle =
                match[2].trim() ||
                calloutType.charAt(0).toUpperCase() + calloutType.slice(1);

              const newString = firstChild.replace(
                /^\[!(note|warning|error|danger|success|example|info)\](.*)/i,
                "",
              );

              if (!newString.trim() && pChildren.length === 1) {
                return null;
              }

              return React.cloneElement(node, { key: node.key }, [
                newString,
                ...pChildren.slice(1),
              ]);
            }
          }
        }
        return node;
      });
    };

    const processedChildren = processChildren(childrenArray).filter(Boolean);

    if (isCallout) {
      return (
        <div className="callout" data-type={calloutType}>
          <div className="callout-title">{calloutTitle}</div>
          <div className="callout-content">{processedChildren}</div>
        </div>
      );
    }

    return <blockquote>{children}</blockquote>;
};

export default function MarkdownReader({
  file,
  renderBlockquote,
}: MarkdownReaderProps) {
  const components = useMemo(
    () => ({
      blockquote: renderBlockquote || defaultRenderBlockquote,
    }),
    [renderBlockquote],
  );

  return (
    <div
      className="terminal-reader"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#0d1117",
        color: "#c9d1d9",
        fontFamily: "'Courier New', Courier, monospace",
        borderRadius: "8px",
        border: "1px solid #30363d",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      }}
    >
      {/* Nano-style Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: "#161b22",
          padding: "6px 12px",
          borderBottom: "1px solid #30363d",
          fontSize: "0.85rem",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        <span style={{ color: "#8b949e" }}>GNU nano 6.2</span>
        <span style={{ color: "#c9d1d9" }}>File: {file.name}</span>
        <span style={{ color: "#8b949e" }}>Read 100%</span>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 32px",
          backgroundColor: "#0d1117",
        }}
      >
        <div
          className="markdown-container markdown-body"
          style={{ color: "inherit" }}
        >
          <ReactMarkdown
            remarkPlugins={staticRemarkPlugins as any}
            rehypePlugins={staticRehypePlugins as any}
            components={components}
          >
            {file.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Nano-style Footer */}
      <div
        style={{
          backgroundColor: "#161b22",
          borderTop: "1px solid #30363d",
          padding: "8px 12px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "8px",
          fontSize: "0.8rem",
        }}
      >
        <span>
          <strong style={{ color: "#58a6ff" }}>^G</strong> Help
        </span>
        <span>
          <strong style={{ color: "#58a6ff" }}>^O</strong> Write Out
        </span>
        <span>
          <strong style={{ color: "#58a6ff" }}>^W</strong> Where Is
        </span>
        <span>
          <strong style={{ color: "#58a6ff" }}>^K</strong> Cut
        </span>
        <span>
          <strong style={{ color: "#58a6ff" }}>^T</strong> Execute
        </span>
        <span>
          <strong style={{ color: "#58a6ff" }}>^X</strong> Exit
        </span>
      </div>
    </div>
  );
}
