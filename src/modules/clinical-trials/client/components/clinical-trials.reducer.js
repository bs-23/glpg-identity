import Types from './clinical-trials.types';
const initialState = {
    clinialTrial_item: {
        title : 'Inital trial title',
        age : 0,
        gender: 'none'
    },
    clinialTrial_items: {}
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
       
        case Types.GET_TRIAL_ITEM: {
            return { ...state, clinialTrial_item: action.payload };
        }

        
    }

    return state;
}
