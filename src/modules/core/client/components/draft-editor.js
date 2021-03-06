import React, { useEffect } from 'react';
import validator from 'validator';
import {stateToHTML} from 'draft-js-export-html';
import { ContentState, EditorState, convertFromHTML } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'draft-js/dist/Draft.css';

String.prototype.escapedHtmlLength = function() {
    return this ? validator.escape(this).length : 0;
}

const toolbarOptions = {
    options: ['inline', 'link'],
    inline: {
        options: ['bold', 'italic', 'underline']
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
    },
    entityStyleFn: (entity) => {
        const entityType = entity.get('type').toLowerCase();
        if (entityType === 'link') {
            const data = entity.getData();
            return {
                element: 'a',
                attributes: {
                    href: data.url,
                    target: data.targetOption
                }
            };
        }
    }
}

export default function DraftEditor({ onChangeHTML, htmlContent }) {
    const [editorState, setEditorState] = React.useState(() => EditorState.createEmpty());

    const convertContentToHtml = (state) => {
        const editorContentInHTML = stateToHTML(state.getCurrentContent(), draftJsToHTMLOptions);
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

    const cleanupEmptyHtmlTags = (html) => {
        let cleanedupHtml = html;

        while(true) {
            cleanedupHtml = html
                .replace(/<p[^>]*>(\s|&nbsp;)*<\/p>/g, '')
                .replace(/<u[^>]*>(\s|&nbsp;)*<\/u>/g, '')
                .replace(/<strong[^>]*>(\s|&nbsp;)*<\/strong>/g, '')
                .replace(/<em[^>]*>(\s|&nbsp;)*<\/em>/g, '')
                // .replace(/(?<=<p>)(&nbsp;)*/g, '')
                .replace(/(&nbsp;)*(?=<\/p>)/g, '')
                // .replace(/(?<=<p>(<strong>|<u>|<em>))&nbsp;/g, '')
                .replace(/(\s)*(?=<\/[^>]*>)/g, '')
                .replace(/&nbsp;/g, '');

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
