import React, { useEffect } from 'react';
import validator from 'validator';
// import {stateToHTML} from 'draft-js-export-html';
import { ContentState, EditorState, convertFromHTML, convertToRaw } from 'draft-js';
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

// const jsToInlineStyleMapping = {
//     'color': 'color',
//     'bgcolor': 'background-color',
//     'fontfamily': 'fontFamily',
//     'fontsize': 'font-size'
// }

// const htmlToDraftCallback = (nodeName, node) => {
//     console.log(nodeName, node);
// }

// let draftJsToHTMLOptions = {
//     inlineStyleFn: (styles) => {
//         const inlineStyles = {};
//         styles.map((value) => {
//             const styleKey = value.split('-')[0];
//             const styleValue = value.split('-')[1];
//             console.log(styleKey, styleValue)
//             const inlineStyleKey = jsToInlineStyleMapping[styleKey];
//             if(inlineStyleKey) {
//                 inlineStyles[inlineStyleKey] = styleValue;
//             }
//         });

//         if(Object.keys(inlineStyles).length > 0) {
//             return {
//                 element: 'span',
//                 style: inlineStyles
//             }
//         }
//     },
//     entityStyleFn: (entity) => {
//         const entityType = entity.get('type').toLowerCase();
//         console.log(entityType)
//         if (entityType === 'link') {
//             const data = entity.getData();
//             return {
//                 element: 'a',
//                 attributes: {
//                     href: data.url,
//                     target: data.targetOption
//                 }
//             };
//         }
//     }
// }

export default function DraftEditor({ onChangeHTML, htmlContent }) {
    const [editorState, setEditorState] = React.useState(() => EditorState.createEmpty());

    const convertContentToHtml = (state) => {
        // const editorContentInHTML = stateToHTML(state.getCurrentContent(), draftJsToHTMLOptions);
        // return editorContentInHTML;
        const html = draftToHtml(convertToRaw(state.getCurrentContent()));
        console.log(html);
        console.log(cleanupEmptyHtmlTags(html));
        return html;
    }

    const convertHTMLtoState = (html) => {
        // const blocksFromHTML = convertFromHTML(html);

        // const state = ContentState.createFromBlockArray(
        //     blocksFromHTML.contentBlocks,
        //     blocksFromHTML.entityMap,
        // );

        // return EditorState.createWithContent(state);

        const blocksFromHtml = htmlToDraft(html);
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
        return EditorState.createWithContent(contentState);
    }

    const cleanupEmptyHtmlTags = (html) => {
        let cleanedupHtml = html;

        while(true) {
            cleanedupHtml = html
                // .replace(/<p[^>]*>(\s|&nbsp;)*<\/p>/g, '')
                // .replace(/<u[^>]*>(\s|&nbsp;)*<\/u>/g, '')
                // .replace(/<strong[^>]*>(\s|&nbsp;)*<\/strong>/g, '')
                // .replace(/<em[^>]*>(\s|&nbsp;)*<\/em>/g, '')
                // .replace(/<ins[^>]*>(\s|&nbsp;)*<\/ins>/g, '')
                // .replace(/\s{2,}/g, ' ') // replace more than two spaces with one space
                // .replace(/&nbsp;/g, '')  // remove &nbps
                // .replace(/(\s)*(?=<\/[^>]*>)/g, '') // remove spaces before closing tag
                // .replace(/(?<=<p>)(&nbsp;)*/g, '')
                // .replace(/(?<=<p>(<strong>|<u>|<em>))&nbsp;/g, '')
                // .replace(/((<[^/>]*>)\s+)/g, '$2') // replace spaces between opening tag (<>) and text
                .replace(/<[^/>]*>(\s*)<\/[^>]*>/g, "$1")
                .replace(/(&nbsp;)*(?=<\/p>)/g, '')
                .replace(/\s+((<\/[^>]*>)*<\/p>)/g, '$1')
                .replace(/(<p>(<[^\/>]*>)*)(\s|&nbsp;)+/g, '$1')

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
