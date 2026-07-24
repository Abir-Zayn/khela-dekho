'use client';

import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
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
import { $generateHtmlFromNodes } from '@lexical/html';
import { EditorState, LexicalEditor as LexicalEditorType } from 'lexical';
import { FloatingToolbarPlugin } from './FloatingToolbarPlugin';
import { SlashCommandPlugin } from './SlashCommandPlugin';
import { MediaBlockNode } from './MediaBlockNode';

interface LexicalEditorProps {
  onChange: (htmlContent: string) => void;
  placeholder?: string;
}

const theme = {
  paragraph: 'mb-4 text-zinc-300 leading-relaxed text-lg',
  heading: {
    h1: 'text-3xl font-extrabold text-white mt-8 mb-4 tracking-tight',
    h2: 'text-2xl font-bold text-white mt-6 mb-3 tracking-tight',
    h3: 'text-xl font-semibold text-white mt-4 mb-2',
  },
  quote: 'border-l-4 border-red-500 pl-4 py-2 italic text-zinc-400 bg-zinc-900/40 rounded-r-lg my-4 text-xl font-serif',
  list: {
    ul: 'list-disc list-inside mb-4 space-y-1 text-zinc-300 text-lg',
    ol: 'list-decimal list-inside mb-4 space-y-1 text-zinc-300 text-lg',
    listitem: 'pl-2',
  },
  text: {
    bold: 'font-bold text-white',
    italic: 'italic',
    underline: 'underline decoration-amber-500 underline-offset-4',
    strikethrough: 'line-through text-zinc-500',
    code: 'bg-zinc-800 text-amber-400 px-2 py-0.5 rounded text-sm font-mono',
  },
  link: 'text-red-400 hover:text-red-300 underline font-medium cursor-pointer',
};

export function LexicalEditor({ onChange, placeholder = "Type / for actions, or tell your story..." }: LexicalEditorProps) {
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
              <ContentEditable className="min-h-[400px] outline-none text-zinc-200 text-lg leading-relaxed focus:outline-none py-2 [&_img]:rounded-2xl [&_img]:border [&_img]:border-zinc-800 [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-2xl [&_iframe]:border [&_iframe]:border-zinc-800 [&_video]:w-full [&_video]:rounded-2xl [&_blockquote]:border-l-4 [&_blockquote]:border-amber-500 [&_blockquote]:bg-zinc-900/80 [&_blockquote]:p-4 [&_blockquote]:rounded-r-2xl" />
            }
            placeholder={
              <div className="absolute top-2 left-0 text-zinc-600 text-lg pointer-events-none select-none italic font-serif">
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
      </div>
    </LexicalComposer>
  );
}
