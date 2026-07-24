import React from 'react';
import {
  DecoratorNode,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { PreviewComponent } from './preview-component';

export type SerializedMediaBlockNode = Spread<
  {
    mediaType: 'image' | 'video' | 'reference';
    url: string;
    title?: string;
  },
  SerializedLexicalNode
>;

export class MediaBlockNode extends DecoratorNode<React.ReactNode> {
  __mediaType: 'image' | 'video' | 'reference';
  __url: string;
  __title?: string;

  static getType(): string {
    return 'media-block';
  }

  static clone(node: MediaBlockNode): MediaBlockNode {
    return new MediaBlockNode(node.__mediaType, node.__url, node.__title, node.__key);
  }

  constructor(
    mediaType: 'image' | 'video' | 'reference',
    url: string,
    title?: string,
    key?: NodeKey
  ) {
    super(key);
    this.__mediaType = mediaType;
    this.__url = url;
    this.__title = title;
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'my-6 select-none';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(serializedNode: SerializedMediaBlockNode): MediaBlockNode {
    return $createMediaBlockNode(
      serializedNode.mediaType,
      serializedNode.url,
      serializedNode.title
    );
  }

  exportJSON(): SerializedMediaBlockNode {
    return {
      type: 'media-block',
      version: 1,
      mediaType: this.__mediaType,
      url: this.__url,
      title: this.__title,
    };
  }

  exportDOM(): DOMExportOutput {
    const div = document.createElement('div');
    div.className = 'my-6';
    if (this.__mediaType === 'image') {
      const titleText = this.__title ? this.__title : 'Story image';
      div.innerHTML = `<figure class="my-6"><img src="${this.__url}" alt="${titleText}" class="w-full max-h-[500px] object-cover rounded-2xl border border-zinc-800 shadow-xl" /><figcaption class="text-xs text-zinc-500 text-center mt-2 italic">${titleText}</figcaption></figure>`;
    } else if (this.__mediaType === 'video') {
      let embedUrl = this.__url;
      const ytMatch = this.__url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (ytMatch && ytMatch[1]) {
        embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
      }
      if (embedUrl.includes('youtube.com/embed') || embedUrl.includes('player.vimeo.com')) {
        div.innerHTML = `<div class="my-6 aspect-video w-full overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl"><iframe src="${embedUrl}" class="w-full h-full border-0 rounded-2xl" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      } else {
        div.innerHTML = `<div class="my-6 w-full overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl"><video src="${embedUrl}" controls class="w-full h-auto rounded-2xl"></video></div>`;
      }
    } else if (this.__mediaType === 'reference') {
      const refTitle = this.__title || 'Source Reference Link';
      div.innerHTML = `<blockquote class="my-6 border-l-4 border-amber-500 bg-zinc-900/80 p-4 rounded-r-2xl border-t border-r border-b border-zinc-800/80"><p class="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">🔗 ${refTitle}</p><a href="${this.__url}" target="_blank" rel="noopener noreferrer" class="text-sm font-semibold text-zinc-200 hover:text-white underline break-all">${this.__url}</a></blockquote>`;
    }
    return { element: div };
  }

  decorate(): React.ReactNode {
    return (
      <div className="my-6">
        <PreviewComponent
          type={this.__mediaType}
          url={this.__url}
          title={this.__title}
        />
      </div>
    );
  }
}

export function $createMediaBlockNode(
  mediaType: 'image' | 'video' | 'reference',
  url: string,
  title?: string
): MediaBlockNode {
  return new MediaBlockNode(mediaType, url, title);
}

export function $isMediaBlockNode(node: LexicalNode | null | undefined): node is MediaBlockNode {
  return node instanceof MediaBlockNode;
}
