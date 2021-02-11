const path = require("path");
const _ = require('lodash');
const logService = require(path.join(process.cwd(), "src/modules/core/server/audit/audit.service.js"));
const { getUserWithPermissionRelations } = require(path.join(process.cwd(), "src/modules/platform/user/server/permission/permissions.js"));
const Service = require(path.join(process.cwd(), "src/modules/platform/user/server/permission/service.model.js"));

const evaluateAllowedServices = async (services) => {
    if (!Array.isArray(services) && !services.length) return [];

    let serviceCategoriesSlugs;

    if (_.isPlainObject(services[0])) serviceCategoriesSlugs = services.map(s => s.serviceCategory);
    else serviceCategoriesSlugs = services;

    const allowedServices = [];

    const serviceCategories = await Service.findAll({
        where: { slug: serviceCategoriesSlugs },
        include: {
            model: Service,
            as: 'childServices'
        }
    });

    if (_.isPlainObject(services[0])) {
        serviceCategories.forEach(sc => {
            const { services: servicesOptions } = services.find(ser => ser.serviceCategory === sc.slug) || {};

            if (sc.childServices) sc.childServices.forEach(s => {
                if (!servicesOptions) return allowedServices.push(s.slug);

                if (Array.isArray(servicesOptions) && servicesOptions.includes(s.slug)) return allowedServices.push(s.slug);

                if (_.isPlainObject(servicesOptions) && servicesOptions.exclude && !servicesOptions.exclude.includes(s.slug)) {
                    allowedServices.push(s.slug);
                }
            });
            else allowedServices.push(s.slug);
        });
    } else {
        serviceCategories.forEach(sc => {
            if (sc.childServices && sc.childServices.length) sc.childServices.forEach(s => allowedServices.push(s.slug));
            else allowedServices.push(sc.slug);
        });
    }

    return allowedServices;
};

const isPermitted = (userServices, allowedServices) => {
    if (userServices.some(p => allowedServices.includes(p.slug))) {
        return true;
    }
    return false;
};

async function getUserWithProfiles(id) {
    const userWithPermissions = await getUserWithPermissionRelations({ id });
    return userWithPermissions;
}

async function getProfilePermissions(profile) {
    const serviceCategories = [];
    if (profile) {
        for (const userProPermSet of profile.up_ps) {
            let permissionSet = userProPermSet.ps;
            for (const psc of permissionSet.ps_sc) {
                serviceCategories.push(psc.service);
            }

        }

        return serviceCategories;
    }
}

async function getRolePermissions(userRole) {
    if (!userRole) return [];

    const serviceCategories = [];

    for (const rolePermSet of userRole.role_ps) {
        let permissionSet = rolePermSet.ps;
        for (const psc of permissionSet.ps_sc) {
            serviceCategories.push(psc.service);
        }
    }

    return serviceCategories;
}

const ServiceGuard = (services) => {
    return async function (req, res, next) {
        const user = await getUserWithProfiles(req.user.id);
        const profileServices = await getProfilePermissions(user.userProfile);
        const roleServices = await getRolePermissions(user.userRole);
        let userServices = profileServices.concat(roleServices);

        const allowedServices = await evaluateAllowedServices(services);

        if (!isPermitted(userServices, allowedServices)) {
            await logService.log({
                event_type: 'UNAUTHORIZE',
                actor: req.user.id
            });
            return res
                .status(403)
                .send('Forbidden! You are not authorized to view this page');
        }
        next();
    }
};

exports.ServiceGuard = ServiceGuard;
