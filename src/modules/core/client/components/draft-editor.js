import React, { useEffect, useState } from 'react';
import {Editor, ContentState, EditorState, RichUtils, CompositeDecorator, convertFromHTML} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';
import 'draft-js/dist/Draft.css';

const styles = {
    link: {
      color: 'rgb(69, 153, 213)',
      cursor: 'pointer'
    },
};

const Link = (props) => {
    const {url} = props.contentState.getEntity(props.entityKey).getData();
    return (
      <a href={url} style={styles.link}>
        {props.children}
      </a>
    );
};

function findLinkEntities(contentBlock, callback, contentState) {
    contentBlock.findEntityRanges(
      (character) => {
        const entityKey = character.getEntity();
        return (
          entityKey !== null &&
          contentState.getEntity(entityKey).getType() === 'LINK'
        );
      },
      callback
    );
}

const decorator = new CompositeDecorator([
    {
      strategy: findLinkEntities,
      component: Link,
    },
]);

export default function DraftEditor({ onChangeHTML, htmlContent }) {
    const [editorState, setEditorState] = React.useState(() => EditorState.createEmpty(decorator));
    const [showAddUrlBar, setShowAddUrlBar] = useState(false);
    const [urlInputValue, setUrlInputValue] = useState('http://');

    const handleKeyCommand = (command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
          setEditorState(newState);
          return 'handled';
        }
        return 'not-handled';
    }

    const handleURLInputChange = (e) => {
        setUrlInputValue(e.target.value);
    }

    const convertContentToHtml = () => {
        const editorContentInHTML = stateToHTML(editorState.getCurrentContent());
        return editorContentInHTML;
    }

    const handleAddUrl = () => {
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity('LINK', 'SEGMENTED', { url: urlInputValue });
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });

        setEditorState(RichUtils.toggleLink(
            newEditorState,
            newEditorState.getSelection(),
            entityKey
        ));

        setShowAddUrlBar(false);
        setUrlInputValue('http://');
    }

    const onBoldClick = () => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
    }

    const onUnderlineClick = () => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, 'UNDERLINE'));
    }

    const onItalicClick = () => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, 'ITALIC'));
    }

    const onAddUrlClick = () => {
        setShowAddUrlBar(true);
    }

    useEffect(() => {
        if(onChangeHTML) {
            const editorContentInHTML = convertContentToHtml();
            onChangeHTML(editorContentInHTML);
        }
    }, [editorState]);

    useEffect(() => {
        if(htmlContent) {
            const blocksFromHTML = convertFromHTML(htmlContent);
            const state = ContentState.createFromBlockArray(
                blocksFromHTML.contentBlocks,
                blocksFromHTML.entityMap,
            );
            setEditorState(EditorState.createWithContent(state, decorator));
        }
    }, []);

    return <div className="border border-secondary">
        <div className="p-2" style={{ background: '#d6d6d6' }}>
            <span className="btn btn-info btn-sm mr-1" onClick={onBoldClick}>Bold</span>
            <span className="btn btn-info btn-sm mr-1" onClick={onUnderlineClick}>Underline</span>
            <span className="btn btn-info btn-sm mr-1" onClick={onItalicClick}>Italic</span>
            <span className="btn btn-info btn-sm mr-1" onClick={onAddUrlClick}>Add Url</span>
        </div>

        {showAddUrlBar && <div class="input-group">
            <input type="text" class="form-control" value={urlInputValue} onChange={e => handleURLInputChange(e)}/>
            <div class="input-group-append">
                <span class="btn btn-outline-secondary" type="span" onClick={handleAddUrl}>Add Url</span>
            </div>
        </div>}

        <div className="p-2">
            <Editor
                decorator={decorator}
                editorState={editorState}
                onChange={setEditorState}
                handleKeyCommand={handleKeyCommand}
            />
        </div>
    </div>;
}
