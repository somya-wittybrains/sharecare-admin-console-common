/* global Node, DOMParser */
import React, { createElement } from 'react';

// Tags we don't want to show at all.
const hiddenTags = ['script', 'style', 'iframe', 'img'];

// Safe subset of tags.
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
  'sup',
  'sub',
  'strong',
  'strike',
  'ul',
  'br',
  'hr',
  'span'
];

// Recursively convert DOM nodes into React elements.
function node2Element (node) {
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
  const props = {};

  if (tag === 'a') {
    props.href = '#';
    props.title = node.getAttribute('title');
  }

  // Children.
  const children = [];

  for (let i = 0; i < node.childNodes.length; ++i) {
    children.push(node2Element(node.childNodes[i]));
  }

  return createElement(tag, props, ...children);
}

// TODO: Implement shouldComponentUpdate?
export default function JailedHTML ({ html }) {
  if (!html) return null;

  // DOMParser is only available in browsers.
  if (!DOMParser) return <div>{html}</div>;

  return node2Element(new DOMParser().parseFromString(html, 'text/html').body);
}
