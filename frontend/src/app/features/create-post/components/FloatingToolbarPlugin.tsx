'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  $createParagraphNode,
} from 'lexical';
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType,
} from '@lexical/rich-text';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from '@lexical/list';
import { $setBlocksType } from '@lexical/selection';
import { $getNearestNodeOfType } from '@lexical/utils';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Quote,
  List,
  ListOrdered,
} from 'lucide-react';

export function FloatingToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef<HTMLDivElement>(null);

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [blockType, setBlockType] = useState<string>('paragraph');
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    const nativeSelection = window.getSelection();

    if (
      $isRangeSelection(selection) &&
      !selection.isCollapsed() &&
      nativeSelection &&
      !nativeSelection.isCollapsed &&
      editor.getRootElement()?.contains(nativeSelection.anchorNode)
    ) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));

      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
        const type = parentList ? parentList.getTag() : element.getTag();
        setBlockType(type);
      } else {
        const type = element.getType();
        setBlockType(type);
      }

      // Calculate selection position relative to viewport
      const range = nativeSelection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Position toolbar centered directly above the text selection
      setPosition({
        top: Math.max(10, rect.top - 54),
        left: Math.max(10, rect.left + rect.width / 2),
      });
    } else {
      setPosition(null);
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    const handleScrollOrResize = () => {
      editor.getEditorState().read(() => {
        updateToolbar();
      });
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [editor, updateToolbar]);

  const formatHeading = (headingTag: HeadingTagType) => {
    if (blockType !== headingTag) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingTag));
        }
      });
    } else {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      });
    }
  };

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    } else {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== 'ul') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== 'ol') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  if (typeof window === 'undefined' || !position) return null;

  return createPortal(
    <div
      ref={toolbarRef}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
      className="fixed z-50 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-full px-3 py-1.5 flex items-center gap-1 shadow-2xl animate-in fade-in zoom-in-95 duration-150 select-none"
    >
      {/* Headings */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          formatHeading('h1');
        }}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          blockType === 'h1' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:text-white'
        }`}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          formatHeading('h2');
        }}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          blockType === 'h2' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:text-white'
        }`}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>

      <div className="w-[1px] h-4 bg-zinc-700 mx-0.5" />

      {/* Formatting */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          isBold ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:text-white'
        }`}
        title="Bold"
      >
        <Bold size={16} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          isItalic ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:text-white'
        }`}
        title="Italic"
      >
        <Italic size={16} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        }}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          isUnderline ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:text-white'
        }`}
        title="Underline"
      >
        <Underline size={16} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
        }}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          isStrikethrough ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:text-white'
        }`}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
        }}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          isCode ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:text-white'
        }`}
        title="Code"
      >
        <Code size={16} />
      </button>

      <div className="w-[1px] h-4 bg-zinc-700 mx-0.5" />

      {/* Quote / Lists */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          formatQuote();
        }}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          blockType === 'quote' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:text-white'
        }`}
        title="Quote"
      >
        <Quote size={16} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          formatBulletList();
        }}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          blockType === 'ul' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:text-white'
        }`}
        title="Bullet List"
      >
        <List size={16} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          formatNumberedList();
        }}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          blockType === 'ol' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:text-white'
        }`}
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </button>
    </div>,
    document.body
  );
}
