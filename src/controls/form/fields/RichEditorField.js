import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Label, Segment } from 'semantic-ui-react';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from './draftjs-to-html';
import './RichEditorField.css';  
import './react-draft-wysiwyg.css';  

const debug = require('debug')('controls.RichEditorField');

const isEmptyString = ({ blocks }) =>
  blocks.length === 1 && blocks[0].text === '';
const toMarkup = content => {
  const raw = convertToRaw(content);
  return isEmptyString(raw) ? '' : draftToHtml(raw);
};

export default function RichEditorField ({
  id,
  label,
  hint,
  error,
  required,
  value = '',
  onChange,
  onBlur,
  rows,
  disabled = false,
  toolbar = ['inline', 'blockType', 'list', 'link', 'remove', 'history'],
  toolbarDetails = {},
  schema: { min, max } = {},
  ...props
}) {
  debug('render(%s, %o)', value, { id, label, hint, error, required });

  const blocksFromHtml = htmlToDraft(value);
  const { contentBlocks, entityMap } = blocksFromHtml;
  const contentState = ContentState.createFromBlockArray(
    contentBlocks,
    entityMap
  );

  const [editorState, setEditorState] = useState(
    EditorState.createWithContent(contentState)
  );

  const removeRegex = /\n/ig;
  const currentContent = toMarkup(editorState.getCurrentContent())?.replaceAll(removeRegex, '');
  const [previousContent, setPreviousContent] = useState(currentContent);

  const handleChange = editorState => {
    setEditorState(editorState);
  };

  useEffect(() => {
    if (currentContent !== previousContent) {
      onChange(currentContent);
      setPreviousContent(currentContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentContent, previousContent]);

  return (
    <Form.Field required={required} error={Boolean(error)}>
      {label && <label htmlFor={id}>{label}</label>}
      {disabled ? (
        <Segment
          className={`rich-editor-${rows}-row  ${disabled? 'toolbar-disable':''}`}
          dangerouslySetInnerHTML={{ __html: currentContent }}
        />
      ) : (
        <Editor
          toolbar={{
            // tags allowed: a, b, blockquote, code, del, dd, dl, dt, em, h1, h2, h3, h4, h5, h6, i, kbd, li, ol, p, pre, s, span, sup, sub, strong, strike, ul, br, hr
            // only "a" tags allow attributes, and only for "title" and "href"
            options: [...toolbar],
            ...toolbarDetails
          }}
          wrapperClassName={
            disabled
              ? 'rich-editor-wrapper rdw-link-modal-buttonsection toolbar-disable'
              : 'rich-editor-wrapper rdw-link-modal-buttonsection'
          }
          editorClassName={`rich-editor-${rows}-row`}
          editorState={editorState}
          onEditorStateChange={handleChange}
          onBlur={onBlur}
          readOnly={disabled}
        />
      )}
      {hint && <small>{hint}</small>}
      {max && <small>{hint}</small>}
      {error && (
        <Label basic color='red' pointing>
          {error}
        </Label>
      )}
    </Form.Field>
  );
}

RichEditorField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  hint: PropTypes.string,
  rows: PropTypes.number,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  schema: PropTypes.shape({
    min: PropTypes.number,
    max: PropTypes.number
  })
};
