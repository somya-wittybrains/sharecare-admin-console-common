import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { t } from 'translate';
import { formatDateTime } from 'model/formatters';
import LongStringField from '../form/fields/LongStringField';
import ProfileTag from '../ProfileTag';
import {
  Header,
  Form,
  Button,
  Icon,
  List,
  Divider,
  Message,
  Modal
} from 'semantic-ui-react';

const NotesComponent = observer(
  ({
    modalMode,
    readOnly,
    onClose,
    showNoteIcon,
    memberName,
    subject,
    noteHeaderText,
    handleSaveNote,
    sortOrder = 'descending',
    hideCancelButton,
    notes= [],
    loading,
    error,
    onDismissError
  }) => {
    const [note, setNote] = useState();
    const [hasError, setHasError] = useState(!!error);

    const notesSortedByCreatedDate = [...notes].sort((a, b) => {
      const dateA = new Date(a.createdOn)
      const dateB = new Date(b.createdOn)
      return sortOrder === 'descending' ? dateB - dateA : dateA - dateB
    })

    return (
      <>
        {hasError && (
          <Message
            negative
            messageWidth='100%'
            content={error}
            onDismiss={() => {
              setHasError(false)
              onDismissError && onDismissError()
            }}
          />
        )}
        <div style={{ fontSize: 12, backgroundColor: '#FEFEFB' }}>
            <Header size='medium' style={{ marginBottom: '.5rem' }}>
              {showNoteIcon && <Icon color='yellow' name='sticky note' />}
              {t(`({notesCount})  {noteHeaderText} Notes:  {subject}`, {
                noteHeaderText: noteHeaderText || '',
                subject: subject || '',
                notesCount: notes.length || 0
              })}
            </Header>
          {!!memberName && (
            <Header
              size='medium'
              style={{ marginLeft: showNoteIcon ? '2.8rem' : '1.8rem', marginTop: 0, marginBottom: 0 }}
            >
              {`Member: ${memberName}`}
            </Header>
          )}

          {!readOnly && (
            <>
              <Form>
                <LongStringField
                  placeholder='Enter new note'
                  maxLength='1020'
                  value={note}
                  disabled={loading}
                  onChange={data => setNote(data)}
                  style={{
                    width: '93%',
                    height: 73,
                    margin: '17px 0px 8px 20px',
                    padding: '8px 28px 44px 10px',
                    borderRadius: 5,
                    border: 'solid 1px #dfe3e9',
                    maxHeight: 150,
                    resize: 'none'
                  }}
                />
              </Form>
              <div style={{ marginLeft: '.7rem', marginRight: onClose ? '1rem' : '.5rem' }}>
                {onClose && !hideCancelButton && (
                  <Button
                    style={{ margin: '0 0 0 12px' }}
                    floated='left'
                    type='button'
                    size='mini'
                    onClick={onClose}
                  >
                    {t('Cancel')}
                  </Button>
                )}
                <div style={{ textAlign: 'right', margin: 20 }}>
                  <Button
                    style={{ backgroundColor: note?.length > 0 ? '#2987cd' : '#CED2DB', color: '#FFFFFF' }}
                    size='mini'
                    loading={loading}
                    disabled={!note}
                    onClick={() => {
                      handleSaveNote(note);
                      setNote('')
                    }}
                  >
                    <Icon name='sticky note' />
                    {t('Add Note')}
                  </Button>
                </div>
              </div>
            </>
          )}
          <Divider />
          <List
            size='medium'
            divided
            selection
            relaxed='huge'
            style={{ overflow: 'auto', maxHeight: 230, border: 0, minHeight: 230 }}
          >
            {notesSortedByCreatedDate?.map((note, index) => (
              <List.Item style={{ cursor: 'default', backgroundColor: index % 2 === 0 ? '#f0f5f8' : '' }}>
                <List.Content>
                  <List.Header as='h6' style={{ marginBottom: 10 }}>
                    {`${formatDateTime(note?.createdOn, true)}`}
                    <span style={{ color: 'dark-grey', marginLeft: 5 }}>
                      {`${note?.createdByName || t('N/A')} `}{`  `}
                      {note?.createdByName && note?.profileName &&
                        <ProfileTag profileName={note?.profileName} size={'mini'} />}
                    </span>
                  </List.Header>
                  <List.Description style={{ fontSize: 12, overflow: 'auto', wordWrap: 'break-word' }}>
                    {note?.note}
                  </List.Description>
                </List.Content>
              </List.Item>
            ))}
          </List>
        </div>
      </>
    );
  }
);
const ModalComponent = ({ children }) => {
  return (
    <Modal dimmer='blurring' open>
      <Modal.Content>{children}</Modal.Content>
    </Modal>
  );
};
const NotesWarapper = observer(({ modalMode, ...props }) => {
  const Component = modalMode ? ModalComponent : React.Fragment;
  return (
    <Component>
      <NotesComponent {...props} />
    </Component>
  );
});

export default NotesWarapper;
