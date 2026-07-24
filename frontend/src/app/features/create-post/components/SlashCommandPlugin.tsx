'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $getRoot,
  TextNode,
} from 'lexical';
import { Image as ImageIcon, Video, Link as LinkIcon, CornerDownLeft, X } from 'lucide-react';
import { $createMediaBlockNode } from './MediaBlockNode';

class SlashMenuOption extends MenuOption {
  title: string;
  type: 'image' | 'video' | 'reference';

  constructor(title: string, type: 'image' | 'video' | 'reference') {
    super(title);
    this.title = title;
    this.type = type;
  }
}

export function SlashCommandPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeType, setActiveType] = useState<'image' | 'video' | 'reference' | null>(null);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [inputPosition, setInputPosition] = useState<{ top: number; left: number } | null>(null);

  const checkForSlashTrigger = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
  });

  const options = useMemo(
    () => [
      new SlashMenuOption('Add image URL', 'image'),
      new SlashMenuOption('Add video URL', 'video'),
      new SlashMenuOption('Add blog reference', 'reference'),
    ],
    []
  );

  const handleSelectOption = useCallback(
    (option: SlashMenuOption, textNodeContainingQuery: TextNode | null, closeMenu: () => void) => {
      editor.update(() => {
        if (textNodeContainingQuery && textNodeContainingQuery.isAttached()) {
          textNodeContainingQuery.setTextContent('');
          textNodeContainingQuery.select(0, 0);
        }
      });
      closeMenu();

      const nativeSelection = window.getSelection();
      if (nativeSelection && nativeSelection.rangeCount > 0) {
        const rect = nativeSelection.getRangeAt(0).getBoundingClientRect();
        setInputPosition({
          top: Math.min(window.innerHeight - 180, rect.bottom + 6),
          left: Math.min(window.innerWidth - 340, Math.max(16, rect.left)),
        });
      } else {
        setInputPosition({ top: 200, left: 200 });
      }

      setActiveType(option.type);
      setUrl('');
      setTitle('');
    },
    [editor]
  );

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeType || !url.trim()) return;

    editor.focus(() => {
      editor.update(() => {
        let selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          const root = $getRoot();
          root.selectEnd();
          selection = $getSelection();
        }

        const mediaNode = $createMediaBlockNode(activeType, url.trim(), title.trim());
        const p = $createParagraphNode();

        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const topLevelElement = anchorNode.getTopLevelElementOrThrow();

          if (topLevelElement.getTextContent().trim() === '' || topLevelElement.getTextContent().trim() === '/') {
            topLevelElement.replace(mediaNode);
            mediaNode.insertAfter(p);
          } else {
            selection.insertNodes([mediaNode, p]);
          }
          p.select();
        } else {
          const root = $getRoot();
          root.append(mediaNode);
          root.append(p);
          p.select();
        }
      });
    });

    setActiveType(null);
    setUrl('');
    setTitle('');
    setInputPosition(null);
  };

  const [, setQueryString] = useState<string | null>(null);

  return (
    <>
      <LexicalTypeaheadMenuPlugin
        onQueryChange={setQueryString}
        onSelectOption={handleSelectOption}
        triggerFn={checkForSlashTrigger}
        options={options}
        menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp }) =>
          anchorElementRef.current
            ? createPortal(
                <div className="fixed z-50 min-w-[260px] bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-2xl p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-100 select-none text-white">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Insert Block
                  </div>
                  {options.map((option, index) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => selectOptionAndCleanUp(option)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer ${
                        index === selectedIndex ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
                      }`}
                    >
                      {option.type === 'image' && <ImageIcon size={16} className="text-blue-400" />}
                      {option.type === 'video' && <Video size={16} className="text-red-400" />}
                      {option.type === 'reference' && <LinkIcon size={16} className="text-amber-400" />}
                      <span>{option.title}</span>
                    </button>
                  ))}
                </div>,
                anchorElementRef.current
              )
            : null
        }
      />

      {activeType && inputPosition &&
        createPortal(
          <div
            style={{ top: `${inputPosition.top}px`, left: `${inputPosition.left}px` }}
            className="fixed z-50 min-w-[280px] max-w-[340px] bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-2xl p-2.5 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-100"
          >
            <form onSubmit={handleSubmitUrl} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400 px-1">
                <span className="capitalize flex items-center gap-1.5">
                  {activeType === 'image' && <ImageIcon size={14} />}
                  {activeType === 'video' && <Video size={14} />}
                  {activeType === 'reference' && <LinkIcon size={14} />}
                  Add {activeType}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveType(null);
                    setInputPosition(null);
                  }}
                  className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {activeType === 'reference' && (
                <input
                  type="text"
                  placeholder="Source Title (e.g. ESPN Analysis)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg py-1.5 px-2.5 text-xs outline-none focus:border-amber-500"
                />
              )}

              <div className="flex items-center gap-1.5">
                <input
                  type="url"
                  placeholder={
                    activeType === 'image'
                      ? 'Paste image URL...'
                      : activeType === 'video'
                      ? 'Paste YouTube/video URL...'
                      : 'Paste reference link...'
                  }
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  autoFocus
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg py-1.5 px-2.5 text-xs outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-black font-bold p-2 rounded-lg text-xs transition-colors cursor-pointer shrink-0"
                >
                  <CornerDownLeft size={14} />
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}
    </>
  );
}
