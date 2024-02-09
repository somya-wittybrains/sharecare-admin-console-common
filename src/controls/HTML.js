import React, { createElement } from 'react';

// Tags we don't want to show at all.
const hiddenTags = ['script', 'style', 'iframe', 'img'];

// Safe subset of tags.
// https://meta.stackexchange.com/questions/1777/what-html-tags-are-allowed-on-stack-exchange-sites
const allowedTags = [
  'a',
  'b',
  'blockquote',
  'code',
  'del',
  'dd',
  'dl',
  'dt',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'i',
  'kbd',
  'li',
  'ol',
  'p',
  'pre',
  's',
  'span',
  'sup',
  'sub',
  'strong',
  'strike',
  'ul',
  'br',
  'hr'
];

// Recursively convert DOM nodes into React elements.
function node2Element (node, key) {
  switch (node.nodeType) {
    case Node.TEXT_NODE:
      return node.nodeValue;

    case Node.ELEMENT_NODE:
      // Continued below.
      break;

    default:
      return null;
  }

  // Tag
  let tag = node.tagName.toLowerCase();

  if (hiddenTags.includes(tag)) {
    return null;
  } else if (!allowedTags.includes(tag)) {
    tag = 'div';
  }

  // Props
  const props = { key };

  if (tag === 'a') {
    props.href = node.getAttribute('href');
    props.title = node.getAttribute('title');
  }

  // Children.
  const children = Array.from(node.childNodes).map(node2Element);

  return createElement(tag, props, ...children);
}

// TODO: Implement shouldComponentUpdate?
export default function HTML ({ html, rootTag: Root = 'div' }) {
  if (!html) return null;

  // DOMParser is only available in browsers.
  if (!DOMParser) return <Root>{html}</Root>;

  const body = new DOMParser().parseFromString(html, 'text/html').body;

  // Body can be null (IE11 on Win7).
  if (!body) return <Root />;

  return <Root>{Array.from(body.childNodes).map(node2Element)}</Root>;
}
