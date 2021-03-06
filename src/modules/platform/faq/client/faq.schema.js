import { string, object, array } from 'yup';
const validator = require('validator');

function isNotEmpty(answer) {
    if (answer === '<p><br></p>') return false;
    if (answer && answer.replace(/&nbsp;/g, '') === '<p></p>') return false;
    return true;
}
function isExceeded(answer) {
    if (answer && validator.escape(answer).length > 1500) {
        return false;
    }
    return true;
}

function hasEmoji(str) {

    if (str) {
        const arr = str.match(/\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]/g);
        if (arr && arr.length > 0) return false;
    }
    return true;
}

function hasSpace(str) {
    if (str) {
        const checkHasSpace = (str.trim() === '');
        if (checkHasSpace) return false;
    }
    return true;
}

export const faqSchema = object().shape({
    question: string()
        .transform(value => value.trim())
        .max(60, 'This field must be at most 60 characters long.')
        .required('This field must not be empty.')
        .test('has-emoji', 'Emoji is not allowed',
            question => hasEmoji(question))
        .test('has-special-charecters', 'Only space is not allowed',
            question => hasSpace(question)),
    answer: string()
        .required('This field must not be empty.')
        .test('is-empty', 'This field must not be empty.',
            answer => isNotEmpty(answer))
        .test('is-exceeded', 'Maximum character limit has been exceeded(This limit includes HTML tags and styles)',
            answer => isExceeded(answer)),
    answer_plaintext: string()
        .transform(value => value.trim()),
    topics:
        array()
            .of(string())
            .min(1, 'Must select at least one topic')
            .required('Must select at least one topic')
});
