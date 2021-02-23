const safeGet = (object, property) => {
    const propData = (object || {})[property];
    return (prop) => prop ? safeGet(propData, prop) : propData;
};

const flatten = (array) => {
    return Array.isArray(array) ? [].concat(...array.map(flatten)) : array;
}

const union = (a, b) => [...new Set([...a, ...b])];

function extractLoggedInUserCountries(data) {
    const profile_permission_sets = safeGet(data, 'profile')('permissionSets')();
    const profile_countries = profile_permission_sets ? profile_permission_sets.map(pps => safeGet(pps, 'countries')() || []) : [];

    const userRoles = safeGet(data, 'role')();
    const roles_countries = userRoles ? userRoles.map(role => {
        const role_permission_sets = safeGet(role, 'permissionSets')();
        return role_permission_sets.map(rps => safeGet(rps, 'countries')() || []);
    }) : [];

    const userCountries = union(flatten(profile_countries), flatten(roles_countries)).filter(e => e);

    return userCountries;
}

function fetchUserCountries(args, allCountries) {
    const countryList = [];
    args.forEach(element => {
        countryList.push(allCountries.find(x => x.country_iso2 == element));
    });
    return countryList.filter(c => c);
}

export function getUserPermittedCountries(userProfile, countries) {
    const userCountries = extractLoggedInUserCountries(userProfile);
    return fetchUserCountries(userCountries, countries);
}

export function getCountryDetailsFromISO(country_iso2, countries) {
    if (!countries || !country_iso2) return [];

    return countries.filter(c => country_iso2.includes(c.country_iso2));
}
