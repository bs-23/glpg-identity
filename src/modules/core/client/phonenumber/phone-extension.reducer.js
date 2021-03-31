import Types from './phone-extension.types';

const initialState = {
    phone_extensions: require('./phone-extensions.json')
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_PHONE_NUMBER_EXTENSIONS_FULFILLED: {
            return {
                ...state
            };
        }
    }

    return state;
}
