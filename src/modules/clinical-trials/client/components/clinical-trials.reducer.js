import Types from './clinical-trials.types';
const initialState = {
    clinialTrial_item: {
        title : 'Inital trial title',
        age : 0,
        gender: 'none'
    },
    clinialTrial_items: {
        data:{
            search_result:[]
        }
    },
    trialDetails: null,
    trialConditions: {
        data: []
    },
    multipleTrailDetails: []
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
       
        case Types.GET_TRIAL_ITEM: {
            return { ...state, clinialTrial_item: action.payload };
        }
        case Types.GET_TRIAL_ITEMS_FULFILLED: {
            return { ...state, clinialTrial_items: action.payload.data };
        }

        case Types.GET_TRIAL_DETAILS_FULFILLED: {
            return {...state, trialDetails: action.payload.data };
        }
        case Types.GET_TRIAL_CONDITIONS_FULFILLED: {
            return {...state, trialConditions: action.payload.data };
        }
        case Types.GET_MULTIPLE_TRIAL_DETAILS: {
            return {...state, multipleTrailDetails: action.payload };
        }
    }

    return state;
}
