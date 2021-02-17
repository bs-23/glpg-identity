import Types from './user.types';
import _ from 'lodash';

const initialState = {
    loggedInUser: null,
    users: {}
};

const tablePresetPathMap = {
    'cdp-users': 'cdpUsersFilters'
}

const getPermissionsFromPermissionSet = (permissionSets) => {
    if(!permissionSets) return [];

    let countries = [];
    let applications = [];
    let services = [];

    permissionSets.map(ps => {
        ps.countries && (countries = countries.concat(ps.countries));
        ps.application && (applications = applications.concat(ps.application));
        ps.services && (services = services.concat(ps.services));
    })

    return [countries, applications, services];
}

const getUserPermissions = (loggedInUser) => {
    if(!loggedInUser) return [];

    const { profile, role } = loggedInUser;

    let profile_countries = [];
    let profile_applications = [];
    let profile_service_categories = [];

    let role_countries = [];
    let role_applications = [];
    let role_service_categories = [];

    if(profile && profile.permissionSets) {
        const profile_ps = profile.permissionSets;
        const [p_countries, p_app, p_services] = getPermissionsFromPermissionSet(profile_ps);
        profile_countries = profile_countries.concat(p_countries);
        profile_applications = profile_applications.concat(p_app);
        profile_service_categories = profile_service_categories.concat(p_services);
    }

    if(role && role.permissionSets) {
        const role_ps = role.permissionSets;
        const [r_countries, r_app, r_services] = getPermissionsFromPermissionSet(role_ps)
        role_countries = role_countries.concat(r_countries);
        role_applications = role_applications.concat(r_app);
        role_service_categories = role_service_categories.concat(r_services);
    }

    const userCountries = [...new Set([...profile_countries, ...role_countries])];
    const userApps = _.uniqBy([...profile_applications, ...role_applications], app => app.slug);
    const userServices = _.uniqBy([...profile_service_categories, ...role_service_categories], sc => sc.slug);

    return [userCountries, userApps, userServices];
}

function sortItems(items, propertyName, type) {
    if (!propertyName || propertyName === 'null') {
        return items;
    }
    return items.sort(function (a, b) {
        const count = a[propertyName].length < b[propertyName].length ? a[propertyName].length : b[propertyName].length;
        let flag = 0;
        for (let index = 0; index < count; index++) {
            const aVal = a[propertyName][index];
            const bVal = b[propertyName][index];
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
        case Types.LOGIN_FULFILLED:
        case Types.GET_PROFILE_FULFILLED: {
            const loggedInUser = action.payload.data;
            const [userCountires, userApps, userServices] = getUserPermissions(loggedInUser);

            loggedInUser.countries = userCountires;
            loggedInUser.applications = userApps;
            loggedInUser.services = userServices;

            return {
                ...state,
                loggedInUser
            };
        }
        case Types.UPDATE_PROFILE_FULFILLED: {
            const loggedInUser = action.payload.data;
            const [userCountires, userApps, userServices] = getUserPermissions(loggedInUser);

            loggedInUser.countries = userCountires;
            loggedInUser.applications = userApps;
            loggedInUser.services = userServices;

            return {
                ...state,
                loggedInUser: action.payload.data
            };
        }
        case Types.GET_USERS_FULFILLED: {
            return {
                ...state,
                users: action.payload.data
            };
        }
        case Types.GET_USERS_REJECTED: {
            return {
                ...state,
                hasError: true
            };
        }
        case Types.SORT_USERS: {
            return {
                ...state,
                users: (action.payload.type === 'ASC') ? { ...state.users, users: sortItems(state.users['users'], action.payload.val, 1) } :
                    { ...state.users, users: sortItems(state.users['users'], action.payload.val, -1) }
            }
        }
        case Types.GET_USER_FILTER_SETTINGS_FULFILLED: {
            const tableName = action.payload.tableName;
            const path = tablePresetPathMap[tableName];

            return {
                ...state,
                [path]: action.payload.data
            }
        }
    }
    return state;
}
