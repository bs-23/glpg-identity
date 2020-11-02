import React, { useEffect, useRef } from 'react';
import {stateToHTML} from 'draft-js-export-html';
import { ContentState, EditorState, convertFromHTML } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'draft-js/dist/Draft.css';

const toolbarOptions = {
    options: ['inline', 'blockType', 'list', 'link'],
    inline: {
        options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace']
    },
    list: {
        options: ['unordered', 'ordered']
    }
}

const jsToInlineStyleMapping = {
    'color': 'color',
    'bgcolor': 'background-color',
    'fontfamily': 'fontFamily',
    'fontsize': 'font-size'
}

let draftJsToHTMLOptions = {
    inlineStyleFn: (styles) => {
        const inlineStyles = {};

        styles.map((value) => {
            const styleKey = value.split('-')[0];
            const styleValue = value.split('-')[1];
            const inlineStyleKey = jsToInlineStyleMapping[styleKey];
            if(inlineStyleKey) {
                inlineStyles[inlineStyleKey] = styleValue;
            }
        });

        if(Object.keys(inlineStyles).length > 0) {
            return {
                element: 'span',
                style: inlineStyles
            }
        }
    }
}

export default function DraftEditor({ onChangeHTML, htmlContent }) {
    const [editorState, setEditorState] = React.useState(() => EditorState.createEmpty());

    const convertContentToHtml = () => {
        const editorContentInHTML = stateToHTML(editorState.getCurrentContent(), draftJsToHTMLOptions);
        return editorContentInHTML;
    }

    const convertHTMLtoState = (html) => {
        const blocksFromHTML = convertFromHTML(html);

        const state = ContentState.createFromBlockArray(
            blocksFromHTML.contentBlocks,
            blocksFromHTML.entityMap,
        );

        return EditorState.createWithContent(state);
    }

    useEffect(() => {
        if (onChangeHTML) {
            const editorContentInHTML = convertContentToHtml();
            onChangeHTML(editorContentInHTML);
        }
    }, [editorState]);

    useEffect(() => {
        if(htmlContent) {
            const editorState = convertHTMLtoState(htmlContent);
            setEditorState(editorState);
        }
    }, []);

    return <Editor
        editorState={editorState}
        onEditorStateChange={setEditorState}
        toolbar={toolbarOptions}
    />
}
