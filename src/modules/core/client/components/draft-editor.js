import React, { useEffect } from 'react';
import {ContentState, EditorState, convertFromHTML} from 'draft-js';
import {stateToHTML} from 'draft-js-export-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'draft-js/dist/Draft.css';

export default function DraftEditor({ onChangeHTML, htmlContent }) {
    const [editorState, setEditorState] = React.useState(() => EditorState.createEmpty());

    const convertContentToHtml = () => {
        const editorContentInHTML = stateToHTML(editorState.getCurrentContent());
        return editorContentInHTML;
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
            setEditorState(EditorState.createWithContent(state,));
        }
    }, []);

    return <Editor
                editorState={editorState}
                onEditorStateChange={setEditorState}
            />
}
