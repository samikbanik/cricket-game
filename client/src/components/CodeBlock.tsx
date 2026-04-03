import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export default function CodeBlock({ code, language = "tsx", title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-white/[0.06] bg-[#0d1117]">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/[0.06]">
          <span className="text-xs font-medium text-gray-400" style={{ fontFamily: "var(--font-mono)" }}>
            {title}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
              {language}
            </span>
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              aria-label="Copy code"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed">
        <code className="text-gray-300" style={{ fontFamily: "var(--font-mono)" }}>
          {code}
        </code>
      </pre>
    </div>
  );
}
