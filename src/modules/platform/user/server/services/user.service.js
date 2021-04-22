const path = require('path');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const { getPermissionsFromPermissionSet } = require(path.join(process.cwd(), "src/modules/platform/user/server/permission/permissions.js"));


function generateAccessToken(doc) {
    return jwt.sign({
        id: doc.id
    }, nodecache.getValue('CDP_TOKEN_SECRET'), {
        expiresIn: '1h',
        issuer: doc.id.toString()
    });
}

function generateRefreshToken(doc) {
    return jwt.sign({
        id: doc.id,
    }, nodecache.getValue('CDP_REFRESH_SECRET'), {
        expiresIn: '1d',
        issuer: doc.id.toString()
    });
}

async function getProfilePermissions(user) {
    let services = [];
    const permissionSets = [];
    const userProfile = user.userProfile;
    let applications = [];
    let countries = [];

    if (userProfile) {
        for (const userProPermSet of userProfile.up_ps) {
            const permissions = await getPermissionsFromPermissionSet(userProPermSet.ps);

            applications = permissions[0];
            countries = permissions[1];
            services = permissions[2];

            permissionSets.push({
                services: services.map(sc => ({ id: sc.id, title: sc.title, slug: sc.slug, parent_id: sc.parent_id })),
                application: applications.length > 0 ? applications : null,
                countries: countries
            });
        }

        const profile = {
            title: userProfile.title,
            slug: userProfile.slug,
            permissionSets: permissionSets
        }

        return profile;
    }
}

async function getRolePermissions(user) {
    let services = [];
    const permissionSets = [];
    let applications = [];
    let countries = [];
    const userRole = user.userRole;

    if (userRole) {
        for (const rolePermSet of userRole.role_ps) {
            const permissions = await getPermissionsFromPermissionSet(rolePermSet.ps);

            applications = permissions[0];
            countries = permissions[1];
            services = permissions[2];

            permissionSets.push({
                services: services.map(sc => ({ id: sc.id, title: sc.title, slug: sc.slug, parent_id: sc.parent_id })),
                application: applications.length > 0 ? applications : null,
                countries: countries
            });
        }

        return {
            title: userRole.title,
            permissionSets: permissionSets
        }
    }

    return null;
}

async function getCommaSeparatedAppCountryPermissions(user) {
    let all_applications = [];
    let all_countries = [];
    let role_applications = [];
    let profile_applications = [];
    let role_countries = [];
    let profile_countries = [];
    let profile_ps = [];
    let role_ps = [];
    let all_ps = [];

    if (user.userRole) {
        for (const rolePermSet of user.userRole.role_ps) {
            const applicationsCountries = await getPermissionsFromPermissionSet(rolePermSet.ps);
            role_applications = role_applications.concat(applicationsCountries[0]);
            role_countries = role_countries.concat(applicationsCountries[1])
            role_ps.push({
                id: rolePermSet.ps.id,
                title: rolePermSet.ps.title,
                type: rolePermSet.ps.type,
            });
        }
    }

    if (user.userProfile) {
        const profilePermissionSets = user.userProfile.up_ps;
        for (const userProPermSet of profilePermissionSets) {

            const applicationsCountries = await getPermissionsFromPermissionSet(userProPermSet.ps);
            profile_applications = profile_applications.concat(applicationsCountries[0]);
            profile_countries = profile_countries.concat(applicationsCountries[1]);
            profile_ps.push({
                id: userProPermSet.ps.id,
                title: userProPermSet.ps.title,
                type: userProPermSet.ps.type,
            });
        }
    }


    all_countries = [...new Set(role_countries.concat(profile_countries))];
    all_applications = role_applications.concat(profile_applications);
    all_ps = role_ps.concat(profile_ps);
    all_ps = _.uniqBy(all_ps, ps => ps.id);
    let apps = [...new Set(all_applications.length > 0 ? all_applications.map(app => app.name) : [])];

    apps = apps.join();

    return [apps, all_countries, all_ps];
}

async function formatProfile(user) {
    const data = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        // type: user.type,
        profile: await getProfilePermissions(user),
        role: await getRolePermissions(user),
        status: user.status,
        last_login: user.last_login,
        expiry_date: user.expiry_date,
    };
    return data;
}

async function formatProfileDetail(user) {
    const appCounPermissionFormatted = await getCommaSeparatedAppCountryPermissions(user);
    const profile = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        // type: user.type,
        status: user.status,
        phone: user.phone,
        last_login: user.last_login,
        expiry_date: user.expiry_date,
        profiles: { title: user.userProfile.title, slug: user.userProfile.slug },
        application: appCounPermissionFormatted[0],
        countries: appCounPermissionFormatted[1],
        role: user.userRole && { id: user.userRole.id, title: user.userRole.title },
        permissionSets: appCounPermissionFormatted[2]
    };

    return profile;
}

function ignoreCaseArray(str) {
    return [str.toLowerCase(), str.toUpperCase(), str.charAt(0).toLowerCase() + str.charAt(1).toUpperCase(), str.charAt(0).toUpperCase() + str.charAt(1).toLowerCase()];
}



exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.formatProfile = formatProfile;
exports.formatProfileDetail = formatProfileDetail;
exports.ignoreCaseArray = ignoreCaseArray;
