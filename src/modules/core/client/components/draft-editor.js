import React, { useEffect } from 'react';
import validator from 'validator';
import { ContentState, EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'draft-js/dist/Draft.css';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';

String.prototype.escapedHtmlLength = function() {
    return this ? validator.escape(this).length : 0;
}

const toolbarOptions = {
    options: ['inline', 'link'],
    inline: {
        options: ['bold', 'italic', 'underline']
    }
}

export default function DraftEditor({ onChangeHTML, htmlContent }) {
    const [editorState, setEditorState] = React.useState(() => EditorState.createEmpty());

    const convertContentToHtml = (state) => {
        const html = draftToHtml(convertToRaw(state.getCurrentContent()));
        console.log(html);
        console.log(cleanupEmptyHtmlTags(html));
        return html;
    }

    const convertHTMLtoState = (html) => {
        const blocksFromHtml = htmlToDraft(html);
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
        return EditorState.createWithContent(contentState);
    }

    const cleanupEmptyHtmlTags = (html) => {
        let cleanedupHtml = html;

        while(true) {
            cleanedupHtml = html
                .replace(/<[^/>]*>(\s*)<\/[^>]*>/g, "$1") // remove tags with whitespace children but keep the whitespace
                .replace(/(\s|&nbsp;)+((<\/[^>]*>)*<\/p>)/g, '$2') // remove whitespace at the end
                .replace(/(<p>(<[^\/>]*>)*)(\s|&nbsp;)+/g, '$1') // remove whitespace at the beginning
                .replace(/<a[^>]*>(\s|&nbsp;)*<\/a>/g, '') // remove empty anchor
                .replace(/(\s|&nbsp;){2,}/g, ' ') // replace more than one spaces with one space

            if(cleanedupHtml.length === html.length) break;
            html = cleanedupHtml;
        }

        return cleanedupHtml;
    }

    const handleEditorChange = (state) => {
        if (onChangeHTML) {
            const editorContentInHTML = convertContentToHtml(state);
            const plainText = state.getCurrentContent().getPlainText();

            const props = {
                plainText,
                cleanupEmptyHtmlTags
            }

            onChangeHTML(editorContentInHTML, props);
        }

        setEditorState(state);
    }

    useEffect(() => {
        if(htmlContent) {
            const state = convertHTMLtoState(htmlContent);
            setEditorState(state);
        }
    }, []);

    return <Editor
        editorState={editorState}
        onEditorStateChange={handleEditorChange}
        toolbar={toolbarOptions}
    />
}
