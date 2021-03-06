import Types from './hcp.types';

const initialState = {
    hcps: {},
    crdlpHcps: {},
    specialties: {},
    oklaHcpDetails: null,
    oklaHcoDetails: null,
    filterPresetsCdp: null,
    filterPresetsCrdlp: null
};

const tablePresetPathMap = {
    'hcp-profiles': 'filterPresetsCdp',
    'crdlp-hcp-profiles': 'filterPresetsCrdlp'
};

function sortItems(itms, val, type) {
    return itms.sort(function (a, b) {
        const count = a[val].length < b[val].length ? a[val].length : b[val].length;
        let flag = 0;

        for (let index = 0; index < count; index++) {
            const aVal = a[val][index];
            const bVal = b[val][index];

            if (aVal.toLowerCase() < bVal.toLowerCase()) {
                flag = -1 * type;
                break;
            } else if (aVal.toLowerCase() > bVal.toLowerCase()) {
                flag = 1 * type;
                break;
            } else if (aVal.toLowerCase() === bVal.toLowerCase()) {
                if (aVal < bVal) {
                    flag = -1 * type;
                    break;
                } else if (aVal > bVal) {
                    flag = 1 * type;
                    break;
                }
            }
        }

        return flag;
    });
}

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_HCPS_FULFILLED: {
            return {
                ...state,
                hcps: action.payload.data.data
            };
        }

        case Types.GET_CRDLP_HCPS_FULFILLED: {
            return {
                ...state,
                crdlpHcps: action.payload.data
            };
        }

        case Types.SORT_HCPS: {
            return {
                ...state,
                hcps: (action.payload.type === 'ASC') ? { ...state.hcps, users: sortItems(state.hcps['users'], action.payload.val, 1) } :
                    { ...state.hcps, users: sortItems(state.hcps['users'], action.payload.val, -1) }
            };
        }

        case Types.GET_HCP_SPECIALTIES_FULFILLED: {
            const newSpcialtyState = {
                [action.payload.country_locale_key]: action.payload.data
            };

            return {
                ...state,
                specialties: {
                    ...state.specialties,
                    ...newSpcialtyState
                }
            };
        }

        case Types.GET_OKLA_HCP_DETAILS_FULFILLED: {
            return {
                ...state,
                oklaHcpDetails: action.payload.data
            };
        }

        case Types.SET_OKLA_HCP_DETAILS: {
            return {
                ...state,
                oklaHcpDetails: action.payload
            };
        }

        case Types.GET_OKLA_HCO_DETAILS_FULFILLED: {
            return {
                ...state,
                oklaHcoDetails: action.payload.data
            };
        }

        case Types.SET_OKLA_HCO_DETAILS: {
            return {
                ...state,
                oklaHcoDetails: action.payload
            };
        }

        case Types.GET_HCP_FILTER_SETTINGS_FULFILLED: {
            const tableName = action.payload.tableName;
            const path = tablePresetPathMap[tableName];

            return {
                ...state,
                [path]: action.payload.data
            };
        }
    }

    return state;
}
