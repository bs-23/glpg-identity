import React, { useEffect, useState } from 'react';
import {Editor, ContentState, EditorState, RichUtils, Entity, convertFromHTML} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';
import 'draft-js/dist/Draft.css';

export default function DraftEditor({ onChangeHTML, htmlContent }) {
    const [editorState, setEditorState] = React.useState(() => EditorState.createEmpty());
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
        const entityKey = Entity.create('LINK', 'SEGMENTED', {url: urlInputValue});

        setEditorState(RichUtils.toggleLink(editorState, editorState.getSelection(), entityKey));

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
            setEditorState(EditorState.createWithContent(state));
        }
    }, []);

    return <div className="border border-secondary">
        <div className="p-2" style={{ background: '#d6d6d6' }}>
            <span className="btn btn-info btn-sm mr-1" onClick={onBoldClick}>Bold</span>
            <span className="btn btn-info btn-sm mr-1" onClick={onUnderlineClick}>Underline</span>
            <span className="btn btn-info btn-sm mr-1" onClick={onItalicClick}>Italic</span>
            <span className="btn btn-info btn-sm mr-1" onClick={onAddUrlClick}>Add Url</span>
        </div>

        {showAddUrlBar && <div class="input-group mb-3">
            <input type="text" class="form-control" placeholder="Recipient's username" value={urlInputValue} onChange={e => handleURLInputChange(e)}/>
            <div class="input-group-append">
                <span class="btn btn-outline-secondary" type="span" onClick={handleAddUrl}>Add Url</span>
            </div>
        </div>}

        <div className="px-2 pt-1 pb-4">
            <Editor
                editorState={editorState}
                onChange={setEditorState}
                handleKeyCommand={handleKeyCommand}
            />
        </div>
    </div>;
}
