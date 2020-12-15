import { string, object, array } from 'yup';


function isNotEmpty(answer) {
    if (answer === '<p><br></p>') return false;
    if (answer.replace(/&nbsp;/g, '') === '<p></p>') return false;
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
        .max(1500, 'Maximum character limit has been exceeded.'),
    answer_plaintext: string()
        .transform(value => value.trim())
        .required('This field must not be empty.'),
    categories:
        array()
            .of(string())
            .min(1, 'Must select at least one category')
            .required('Must select at least one category')
});

export const FaqCategorySchema = object().shape({
    title: string()
        .max(60, 'This field must be at most 50 characters long.')
        .required('This field must not be empty.'),
});
