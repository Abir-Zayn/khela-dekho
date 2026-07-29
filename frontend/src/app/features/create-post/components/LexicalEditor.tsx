'use client';

import React, { useEffect, useRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { TRANSFORMERS } from '@lexical/markdown';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes, EditorState, LexicalEditor as LexicalEditorType } from 'lexical';
import { FloatingToolbarPlugin } from './FloatingToolbarPlugin';
import { SlashCommandPlugin } from './SlashCommandPlugin';
import { MediaBlockNode } from './MediaBlockNode';

interface LexicalEditorProps {
  onChange: (htmlContent: string) => void;
  placeholder?: string;
  // HTML to seed the editor with once on mount (restoring a saved draft).
  initialHtml?: string;
}

// Seeds the editor from saved draft HTML exactly once. Runs after the composer
// mounts so the parsed nodes replace the empty root; the OnChangePlugin then
// re-emits the HTML back to the parent, keeping state in sync.
function InitialHtmlPlugin({ html }: { html?: string }) {
  const [editor] = useLexicalComposerContext();
  const seeded = useRef(false);

  useEffect(() => {
    if (!html || seeded.current) return;
    seeded.current = true;
    editor.update(() => {
      const dom = new DOMParser().parseFromString(html, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      root.select();
      $insertNodes(nodes);
    });
  }, [editor, html]);

  return null;
}

const theme = {
  paragraph: 'mb-4 leading-relaxed text-lg',
  heading: {
    h1: 'text-3xl font-extrabold mt-8 mb-4 tracking-tight',
    h2: 'text-2xl font-bold mt-6 mb-3 tracking-tight',
    h3: 'text-xl font-semibold mt-4 mb-2',
  },
  quote: 'border-l-4 border-amber-500 pl-4 py-2 italic opacity-90 rounded-r-lg my-4 text-xl font-serif',
  list: {
    ul: 'list-disc list-inside mb-4 space-y-1 text-lg',
    ol: 'list-decimal list-inside mb-4 space-y-1 text-lg',
    listitem: 'pl-2',
  },
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline decoration-amber-500 underline-offset-4',
    strikethrough: 'line-through opacity-60',
    code: 'bg-muted text-amber-500 px-2 py-0.5 rounded text-sm font-mono',
  },
  link: 'text-red-500 hover:text-red-400 underline font-medium cursor-pointer',
};


export function LexicalEditor({ onChange, placeholder = "Type / for actions, or tell your story...", initialHtml }: LexicalEditorProps) {
  const initialConfig = {
    namespace: 'MediumKhelaDekhoEditor',
    theme,
    onError(error: Error) {
      console.error('Lexical Error:', error);
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      AutoLinkNode,
      LinkNode,
      MediaBlockNode,
    ],
  };

  const handleEditorChange = (editorState: EditorState, editor: LexicalEditorType) => {
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor, null);
      onChange(html);
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative min-h-[400px]">
        <FloatingToolbarPlugin />
        <SlashCommandPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[400px] outline-none text-foreground text-lg leading-relaxed focus:outline-none py-2 [&_img]:rounded-2xl [&_img]:border [&_img]:border-border [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-2xl [&_iframe]:border [&_iframe]:border-border [&_video]:w-full [&_video]:rounded-2xl [&_blockquote]:border-l-4 [&_blockquote]:border-terracotta-primary [&_blockquote]:bg-muted [&_blockquote]:p-4 [&_blockquote]:rounded-r-2xl" />
            }
            placeholder={
              <div className="absolute top-2 left-0 text-muted-foreground/50 text-lg pointer-events-none select-none italic font-serif">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <OnChangePlugin onChange={handleEditorChange} />
        <InitialHtmlPlugin html={initialHtml} />
      </div>
    </LexicalComposer>
  );
}
