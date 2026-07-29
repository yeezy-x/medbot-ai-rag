import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ExternalLink } from "lucide-react";
import { CodeBlock } from "./code-block";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  content: string;
  className?: string;
}

/**
 * Extract the raw string children of a react-markdown node — used to feed
 * the CodeBlock's copy button.
 */
function toPlainText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(toPlainText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return toPlainText(
      (children as { props?: { children?: React.ReactNode } }).props?.children
    );
  }
  return "";
}

const components: Components = {
  a: ({ href, children, ...props }) => {
    if (href?.startsWith("#citation-")) {
      const id = href.slice(1);
      return (
        <a
          href={href}
          className="inline-flex align-super text-[0.75em] font-semibold text-brand no-underline hover:underline"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(id)?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }}
          {...props}
        >
          {children}
        </a>
      );
    }
    return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-baseline gap-0.5"
      {...props}
    >
      {children}
      <ExternalLink className="size-3 translate-y-px opacity-60" />
    </a>
    );
  },
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    const isBlock =
      Boolean(match) ||
      // rehype-highlight also emits `hljs` class on block-level <code>
      (typeof className === "string" && className.includes("hljs"));

    if (!isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }

    const raw = toPlainText(children).replace(/\n$/, "");
    const language = match?.[1] ?? "text";

    return (
      <CodeBlock language={language} code={raw}>
        <code className={className} {...props}>
          {children}
        </code>
      </CodeBlock>
    );
  },
};

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn("prose-medbot", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
