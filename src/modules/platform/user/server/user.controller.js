const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const _ = require('lodash');
const User = require('./user.model');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const emailService = require(path.join(process.cwd(), 'src/config/server/lib/email-service/email.service'));
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));
const ResetPassword = require('./reset-password.model');
const UserProfile = require(path.join(process.cwd(), "src/modules/platform/profile/server/user-profile.model.js"));
const UserProfile_PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/userProfile-permissionSet.model"));
const User_Role = require(path.join(process.cwd(), "src/modules/platform/role/server/user-role.model"));
const Role_PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/role-permissionSet.model"));
const Role = require(path.join(process.cwd(), "src/modules/platform/role/server/role.model"));
const PermissionSet = require(path.join(process.cwd(), "src/modules/platform/permission-set/server/permission-set.model"));
const axios = require("axios");
const PasswordPolicies = require(path.join(process.cwd(), "src/modules/core/server/password/password-policies.js"));
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const { QueryTypes, Op, where, col, fn, literal } = require('sequelize');
const { getRequestingUserPermissions, getPermissionsFromPermissionSet, getUserWithPermissionRelations } = require(path.join(process.cwd(), "src/modules/platform/user/server/permission/permissions.js"));
const filterService = require(path.join(process.cwd(), 'src/modules/platform/user/server/filter.js'));

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
    let serviceCategories = [];
    const permissionSets = [];
    const userProfile = user.userProfile;
    let applications = [];
    let countries = [];

    if (userProfile) {
        for (const userProPermSet of userProfile.up_ps) {
            const permissions = await getPermissionsFromPermissionSet(userProPermSet.ps);

            applications = permissions[0];
            countries = permissions[1];
            serviceCategories = permissions[2];

            permissionSets.push({
                serviceCategories: serviceCategories.map(sc => ({ title: sc.title, slug: sc.slug })),
                application: applications.length > 0 ? applications : null,
                countries: countries
            });
        }

        const profile = {
            title: userProfile.title,
            permissionSets: permissionSets
        }

        return profile;
    }
}

async function getRolePermissions(user) {
    let serviceCategories = [];
    const permissionSets = [];
    let applications = [];
    let countries = [];
    const userRoles = user.userRoles;
    const roles = [];

    if (userRoles && userRoles.length) {
        for (const userRole of userRoles) {
            for (const rolePermSet of userRole.role.role_ps) {
                const permissions = await getPermissionsFromPermissionSet(rolePermSet.ps);

                applications = permissions[0];
                countries = permissions[1];
                serviceCategories = permissions[2];

                permissionSets.push({
                    serviceCategories: serviceCategories.map(sc => ({ title: sc.title, slug: sc.slug })),
                    application: applications.length > 0 ? applications : null,
                    countries: countries
                });
            }

            roles.push({
                title: userRole.role.title,
                permissionSets: permissionSets
            })
        }

    }
    return roles;
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

    for (const userRole of user.userRoles) {
        for (const rolePermSet of userRole.role.role_ps) {
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

function ignoreCaseArray(str) {
    return [str.toLowerCase(), str.toUpperCase(), str.charAt(0).toLowerCase() + str.charAt(1).toUpperCase(), str.charAt(0).toUpperCase() + str.charAt(1).toLowerCase()];
}

async function formatProfile(user) {
    const data = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        type: user.type,
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
        type: user.type,
        status: user.status,
        phone: user.phone,
        last_login: user.last_login,
        expiry_date: user.expiry_date,
        profiles: user.userProfile.title,
        application: appCounPermissionFormatted[0],
        countries: appCounPermissionFormatted[1],
        role: user.userRoles && user.userRoles.length && { id: user.userRoles[0].role.id, title: user.userRoles[0].role.title },
        permissionSets: appCounPermissionFormatted[2]
    };

    return profile;
}

var trimRequestBody = function(reqBody){
    Object.keys(reqBody).forEach(key => {
        if(typeof reqBody[key] === 'string')
            reqBody[key] = reqBody[key].trim();
    });
    return reqBody;
}

async function getSignedInUserProfile(req, res) {
    try {
        res.json(await formatProfile(req.user));
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function login(req, res) {
    try {
        let user;
        const { username, password, recaptchaToken, grant_type, recaptchaBypassKey } = req.body;

        const secretKey = recaptchaBypassKey === nodecache.getValue('RECAPTCHA_BYPASS_KEY')
            ? '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'
            : nodecache.getValue('RECAPTCHA_SECRET_KEY')
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`);
        if(!response.data.success) return res.status(400).send('reCAPTCHA validation failed! Please try again.');

        if(!grant_type) return res.status(400).send('Invalid grant_type.');

        if(grant_type && grant_type !== 'password') {
            return res.status(400).send('The requested grant_type is not supported.')
        }

        if(grant_type === 'password') {
            if(!username || !password || !recaptchaToken) return res.status(400).send('Invalid credentials.');

            user = await getUserWithPermissionRelations({
                email: {
                    [Op.iLike]: `${username}`
                }
            });

            if (user && user.status === 'inactive') return res.status(401).send('Account not active.');

            const userLockedMessage = 'Your account has been locked for consecutive failed auth attempts. Please use the Forgot Password link to unlock.';

            if (!user || !user.password || !user.validPassword(password)) {
                if (user && user.password) {
                    await logService.log({
                        event_type: 'LOGIN',
                        object_id: user.id,
                        table_name: 'users',
                        actor: user.id,
                        remarks: user.failed_auth_attempt >= 4 ? 'Login failed. Account locked.' : 'Login failed. Wrong password.'
                    });
                    await user.update({ failed_auth_attempt: user.dataValues.failed_auth_attempt + 1 });
                }

                const errorMessage = user && user.dataValues.failed_auth_attempt >= 5
                    ? userLockedMessage
                    : 'Invalid username or password.';

                return res.status(401).send(errorMessage);
            }

            if (user && user.dataValues.failed_auth_attempt >= 5) {
                return res.status(401).send(userLockedMessage);
            }

            if (user && user.password_expiry_date && user.password_expiry_date < Date.now()) {
                return res.status(401).send('Password has been expired. Please reset the password.');
            }

            await user.update({ refresh_token: generateRefreshToken(user) });
        }

        res.cookie('access_token', generateAccessToken(user), { httpOnly: true, sameSite: true, signed: true });
        res.cookie('refresh_token', user.refresh_token, { httpOnly: true, sameSite: true, signed: true });

        await user.update({
            last_login: Date(),
            failed_auth_attempt: 0
        });

        await logService.log({
            event_type: 'LOGIN',
            object_id: user.id,
            table_name: 'users',
            actor: user.id
        });

        res.json(await formatProfile(user));
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function logout(req, res) {
    await logService.log({
        event_type: 'LOGOUT',
        object_id: req.user.id,
        table_name: 'users',
        actor: req.user.id,
        remarks: 'CDP user logged out'
    });

    res.clearCookie('access_token');
    res.clearCookie('refresh_token').redirect('/');
}

async function createUser(req, res) {
    const {
        first_name,
        last_name,
        email,
        country_code,
        phone,
        profile,
        role,
    } = req.body;

    const phone_number = phone ? country_code + phone : '';
    const validForMonths = 6
    const currentDate = new Date()

    try {
        const [user, created] = await User.findOrCreate({
            where: { email: email.toLowerCase() },
            defaults: {
                first_name,
                last_name,
                phone: phone_number ? phone_number.replace(/\s+/g, '') : null,
                profileId: profile,
                created_by: req.user.id,
                updated_by: req.user.id,
                expiry_date: new Date(currentDate.setMonth(currentDate.getMonth() + validForMonths))
            }
        });

        if (!created) {
            return res.status(400).send('Email already exists.');
        }

        if (role) {
            await User_Role.create({
                userId: user.id,
                roleId: role,
            });
        }

        const logData = {
            event_type: 'CREATE',
            object_id: user.id,
            table_name: 'users',
            actor: req.user.id,
            remarks: 'Created new CDP user'
        };
        await logService.log(logData);

        const token = crypto.randomBytes(36).toString('hex');
        const expireAt = Date.now() + 3600000;

        const [resetRequest, reqCreated] = await ResetPassword.findOrCreate({
            where: { user_id: user.id },
            defaults: {
                token,
                expires_at: expireAt,
                type: 'set'
            }
        });

        if (!reqCreated && resetRequest) {
            await resetRequest.update({
                token,
                expires_at: expireAt,
                type: 'set'
            });
        }

        const link = `${req.protocol}://${req.headers.host}/reset-password?token=${token}`;

        const templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/cdp/password-set.html`);
        const options = {
            toAddresses: [user.email],
            templateUrl,
            subject: 'Setup password for your CDP account',
            data: {
                name: `${user.first_name} ${user.last_name}` || '',
                link,
                s3bucketUrl: nodecache.getValue('S3_BUCKET_URL')
            }
        };

        emailService.send(options);

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

function generateFilterOptions(currentFilter, defaultFilter, countries) {
    if (!currentFilter || !currentFilter.filters || currentFilter.filter === 0)
        return defaultFilter;

    const getFilterQuery = (filter) => {
        if(filter.fieldName === 'country') {
            const country_iso2_list_for_codbase = countries
                .filter(c => filter.value.some(f => f === c.codbase))
                .map(c => c.country_iso2);

            const countries_ignorecase_for_codbase = [].concat.apply([], country_iso2_list_for_codbase
                .map(i => ignoreCaseArray(i)));

            const countries_ignorecase_for_codbase_formatted = '{' + countries_ignorecase_for_codbase.join(", ") + '}';

            return {
                [Op.or]: [
                    { '$userRoles->role->role_ps->ps.countries$': { [Op.overlap]: countries_ignorecase_for_codbase_formatted } },
                    { '$userProfile->up_ps->ps.countries$': { [Op.overlap]: countries_ignorecase_for_codbase_formatted } }
                ]
            }
        }
        return filterService.getFilterQuery(filter, "users");
    }

    let customFilter = { ...defaultFilter };

    const nodes = currentFilter.logic
        ? currentFilter.logic.split(" ")
        : ['1'];

    let prevOperator;
    const groupedQueries = [];
    for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index];
        const prev = index > 0 ? nodes[index - 1] : null;
        const next = index < nodes.length - 1 ? nodes[index + 1] : null;

        const findFilter = (name) => {
            return currentFilter.filters.find(f => f.name === name);
        };

        if (node === "and" && prevOperator === "and") {
            const filter = findFilter(next);
            const query = getFilterQuery(filter);
            const currentParent = groupedQueries[groupedQueries.length - 1];
            currentParent.values.push(query);
        } else if (node === "and") {
            const leftFilter = findFilter(prev);
            const rightFilter = findFilter(next);
            const group = {
                operator: "and",
                values: [
                    getFilterQuery(leftFilter),
                    getFilterQuery(rightFilter)
                ]
            };
            groupedQueries.push(group);
        } else if (node !== "or" && prev !== "and" && next !== "and") {
            const filter = findFilter(node);
            const query = getFilterQuery(filter);
            groupedQueries.push(query);
        }

        prevOperator = node === "and" || node === "or" ? node : prevOperator;
    }

    if (groupedQueries.length > 1) {
        customFilter[Op.or] = groupedQueries.map(q => {
            if (q.operator === 'and') {
                return { [Op.and]: q.values };
            }
            return q;
        });
    } else {
        const query = groupedQueries[0];
        if (query.operator === 'and') {
            customFilter[Op.and] = query.values;
        } else {
            customFilter = { ...customFilter, ...query };
        }
    }

    return customFilter;
}

async function getUsers(req, res) {
    try {
        const page = req.query.page ? req.query.page - 1 : 0;
        if (page < 0) return res.status(404).send("page must be greater or equal 1");

        const limit = 15;
        const offset = page * limit;

        const codbase = req.query.codbase === 'null' ? null : req.query.codbase;

        const signedInId = (await formatProfile(req.user)).id;

        const [, userCountries,] = await getRequestingUserPermissions(req.user);

        const countries = await sequelize.datasyncConnector.query(`SELECT * FROM ciam.vwcountry`, { type: QueryTypes.SELECT });

        const country_iso2_list_for_codbase = countries.filter(c => c.codbase === codbase).map(c => c.country_iso2);

        const countries_ignorecase_for_codbase = [].concat.apply([], country_iso2_list_for_codbase
            .map(i => ignoreCaseArray(i)));

        const user_countries_ignorecase = [].concat.apply([], userCountries
            .map(i => ignoreCaseArray(i)));

        let countries_ignorecase_for_codbase_formatted = '{' + countries_ignorecase_for_codbase.join(", ") + '}';

        const user_countries_ignorecase_formatted = '{' + user_countries_ignorecase.join(", ") + '}';

        const orderBy = req.query.orderBy === 'null'
            ? null
            : req.query.orderBy;
        const orderType = req.query.orderType === 'asc' || req.query.orderType === 'desc'
            ? req.query.orderType
            : 'asc';

        const order = [
            ['created_at', 'DESC'],
            ['id', 'DESC']
        ];

        const sortableColumns = ['first_name', 'last_name', 'email', 'status', 'created_at', 'expiry_date'];

        if (orderBy && sortableColumns.includes(orderBy)) {
            order.splice(0, 0, [orderBy, orderType]);
        }

        if (orderBy === 'created_by') {
            order.splice(0, 0, [{ model: User, as: 'createdByUser' }, 'first_name', orderType]);
            order.splice(1, 0, [{ model: User, as: 'createdByUser' }, 'last_name', orderType]);
        }

        const defaultFilter = {
            id: { [Op.ne]: signedInId },
            type: 'basic'
        };

        const currentFilter = req.body;

        const filterOptions = generateFilterOptions(currentFilter, defaultFilter, countries);

        const {count: countByUser, rows: users} = await User.findAndCountAll({
            where: filterOptions,
            offset,
            limit,
            order: order,
            subQuery: false,
            include: [{
                model: User,
                as: 'createdByUser',
                attributes: [],
            },
            {
                model: UserProfile,
                as: 'userProfile',
                attributes: [],
                include: [{
                    model: UserProfile_PermissionSet,
                    as: 'up_ps',
                    attributes: [],
                    include: [{
                        model: PermissionSet,
                        as: 'ps',
                        attributes: []
                    }]
                }]
            },
            {
                model: User_Role,
                as: 'userRoles',
                attributes: [],
                include: [{
                    model: Role,
                    as: 'role',
                    attributes: [],
                    include: [{
                        model: Role_PermissionSet,
                        as: 'role_ps',
                        attributes: [],
                        include: [{
                            model: PermissionSet,
                            as: 'ps',
                            attributes: [],
                        }]
                    }]


                }]
            }],
            attributes: [
                'id',
                'email',
            ],
            group: ['users.id', 'createdByUser.first_name', 'createdByUser.last_name'],
            having: literal(
                `
                ARRAY_CONCAT_AGG("userRoles->role->role_ps->ps"."countries") && '${codbase ? countries_ignorecase_for_codbase_formatted : user_countries_ignorecase_formatted}'
                OR
                ARRAY_CONCAT_AGG("userProfile->up_ps->ps"."countries") && '${codbase ? countries_ignorecase_for_codbase_formatted : user_countries_ignorecase_formatted}'
                ${codbase ? '' :
                `
                OR
                (
                    (
                        ARRAY_CONCAT_AGG("userRoles->role->role_ps->ps"."countries") = '{}'
                        OR
                        ARRAY_CONCAT_AGG("userRoles->role->role_ps->ps"."countries") IS NULL
                    )
                    AND
                    (
                        ARRAY_CONCAT_AGG("userProfile->up_ps->ps"."countries") = '{}'
                        OR
                        ARRAY_CONCAT_AGG("userProfile->up_ps->ps"."countries") IS NULL
                    )
                )
                `
                }
                `
            )
        });

        const totalUser = countByUser.length;

        const filteredUserIds = users.map(u => u.dataValues.id);

        const filteredUserList = await User.findAll({
            where: {
                id: filteredUserIds
            },
            order: order,
            subQuery: false,
            include: [{
                model: User,
                as: 'createdByUser',
            },
            {
                model: UserProfile,
                as: 'userProfile',
                include: [{
                    model: UserProfile_PermissionSet,
                    as: 'up_ps',
                    include: [{
                        model: PermissionSet,
                        as: 'ps',
                    }]
                }]
            },
            {
                model: User_Role,
                as: 'userRoles',
                include: [{
                    model: Role,
                    as: 'role',
                    include: [{
                        model: Role_PermissionSet,
                        as: 'role_ps',
                        include: [{
                            model: PermissionSet,
                            as: 'ps',
                        }]
                    }]
                }]
            }]
        });

        const userViewModels = filteredUserList.map(u => {
            const createdBy = `${u.createdByUser.first_name} ${u.createdByUser.last_name}`
            delete u.dataValues.createdByUser;
            delete u.dataValues.created_by;
            delete u.dataValues.updated_by;
            return {
                ...u.dataValues,
                createdBy
            }
        });

        const data = {
            users: userViewModels,
            page: page + 1,
            limit: limit,
            total: totalUser,
            start: limit * page + 1,
            end: offset + limit > totalUser ? totalUser : offset + limit,
            codbase: codbase ? codbase : null
        };

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getUser(req, res) {
    try {
        const user = await getUserWithPermissionRelations({ id: req.params.id });

        if (!user) return res.status(404).send("User is not found or may be removed");

        const formattedUser = await formatProfileDetail(user);

        res.json(formattedUser);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function updateSignedInUserProfile(req, res) {
    const updatedProfileData = trimRequestBody(req.body);
    let { first_name, last_name, email, phone } = updatedProfileData;
    const signedInUser = req.user;
    const currentEmail = req.user.email;

    try {
        if(!first_name || !last_name || !email) return res.status(400).send("Missing required fields.");
        if(!validator.isEmail(email)) return res.status(400).send("Invalid email.");

        const doesEmailExist = await User.findOne({
            where: {
                id: { [Op.ne]: signedInUser.id },
                email: { [Op.iLike]: `${email}` } }
            }
        );

        if(doesEmailExist) return res.status(400).send("Email already exists.");

        await signedInUser.update({
            first_name,
            last_name,
            email: email.toLowerCase(),
            phone
        });

        await logService.log({
            event_type: 'UPDATE',
            object_id: signedInUser.id,
            table_name: 'users',
            actor: req.user.id,
            remarks: 'Updated Signed-in user'
        });

        const hasEmailChanged = currentEmail.toLowerCase() !== email.toLowerCase();

        if(hasEmailChanged) {
            const link = `${req.protocol}://${req.headers.host}/login`;
            const currentUserFullName = req.user.first_name + " " + req.user.last_name;

            const templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/cdp/email-change-success.html`);
            const options = {
                toAddresses: [currentEmail],
                templateUrl,
                subject: 'Your email has been changed',
                data: {
                    name: currentUserFullName || '',
                    link,
                    s3bucketUrl: nodecache.getValue('S3_BUCKET_URL')
                }
            };

            await emailService.send(options);
        }

        res.json(await formatProfile(signedInUser));
    }catch(err){
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function updateUserDetails(req, res) {
    const id = req.params.id;
    const { first_name, last_name, email, phone, type, status, roleId } = req.body;
    const partialUserData = { first_name, last_name, email, phone, type, status };
    const userRoles = roleId ? [roleId] : [];

    try {
        if([first_name, last_name, email].includes(null)) return res.sendStatus(400);

        if(req.user.id === id) return res.sendStatus(403);

        const user = await User.findOne({ where: { id } });

        if (!user) return res.status(404).send("User is not found or may be removed");

        const doesEmailExist = await User.findOne({
            where: {
                id: { [Op.ne]: id },
                email: { [Op.iLike]: `${email}` } }
            }
        );

        if(doesEmailExist) return res.status(400).send('Email already exists.');

        const previousStatus = user.status;

        await user.update(partialUserData);

        await user.setRoles(userRoles);

        let logMessage = status !== previousStatus
            ? status === 'active'
                ? 'User account activated'
                : 'User account deactivated'
            : 'Updated CDP User'

        await logService.log({
            event_type: 'UPDATE',
            object_id: user.id,
            table_name: 'users',
            actor: req.user.id,
            remarks: logMessage
        });

        res.json(formatProfile(user));
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function sendPasswordResetLink(req, res) {
    try {
        const { email } = req.body;

        const user = await User.findOne({
            where: where(fn('lower', col('email')), fn('lower', email))
        });

        if (!user) {
            return res.json({ message: 'An email has been sent to the provided email with further instructions.' });
        }

        const token = crypto.randomBytes(36).toString('hex');
        const expireAt = Date.now() + 3600000;

        const [doc, created] = await ResetPassword.findOrCreate({
            where: { user_id: user.id },
            defaults: {
                token,
                expires_at: expireAt
            }
        });

        if (!created && doc) {
            await doc.update({
                token,
                expires_at: expireAt
            });
        }

        const link = `${req.protocol}://${req.headers.host}/reset-password?token=${token}`;

        const templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/cdp/password-reset-instruction.html`);
        const options = {
            toAddresses: [user.email],
            templateUrl,
            subject: 'Password Reset Instructions',
            data: {
                name: user.first_name + " " + user.last_name || '',
                link,
                s3bucketUrl: nodecache.getValue('S3_BUCKET_URL')
            }
        };

        emailService.send(options);

        res.json({ message: 'An email has been sent to the provided email with further instructions.' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function changePassword(req, res) {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    try {
        const user = await User.findOne({ where: { id: req.user.id } });

        if (!user || !user.validPassword(currentPassword)) {
            return res.status(400).send('Current Password not valid');
        }

        if (await PasswordPolicies.minimumPasswordAge(user.password_updated_at)) {
            return res.status(400).send(`You cannot change password before 1 day`);
        }

        if (await PasswordPolicies.isOldPassword(newPassword, user)) return res.status(400).send('New password can not be your previously used password.');

        if (!PasswordPolicies.validatePassword(newPassword)) return res.status(400).send('Password must contain atleast a digit, an uppercase, a lowercase and a special character and must be 8 to 50 characters long.');

        if (!PasswordPolicies.hasValidCharacters(newPassword)) return res.status(400).send('Password has one or more invalid character.');

        if (newPassword !== confirmPassword) return res.status(400).send('Passwords should match');

        if (PasswordPolicies.isCommonPassword(newPassword, user)) return res.status(400).send('Password can not be commonly used passwords or personal info. Try a different one.');

        if (user.password) await PasswordPolicies.saveOldPassword(user);

        const currentDate = new Date();
        const expiryDate = newPassword.length >= 15
            ? new Date(currentDate.setFullYear(currentDate.getFullYear() + 1))
            : new Date(currentDate.setDate(currentDate.getDate() + 90));

        user.password_expiry_date = expiryDate;
        user.password = newPassword;
        user.password_updated_at = new Date(Date.now());
        await user.save();

        const templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/cdp/password-change-success.html`);
        const options = {
            toAddresses: [user.email],
            templateUrl,
            subject: 'Your password has been changed',
            data: {
                name: user.first_name + " " + user.last_name || '',
                link: `${req.protocol}://${req.headers.host}/login`,
                s3bucketUrl: nodecache.getValue('S3_BUCKET_URL')
            }
        };

        await emailService.send(options);

        await logService.log({
            event_type: 'UPDATE',
            object_id: user.id,
            table_name: 'users',
            actor: user.id,
            remarks: 'Change of password'
        });

        res.json(await formatProfile(user));
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function resetPassword(req, res) {
    async function log(object_id, req_user_id, message, event='BAD_REQUEST') {
        await logService.log({
            event_type: event,
            object_id,
            table_name: 'users',
            actor: req_user_id,
            remarks: message
        });
    }

    try {
        const { token } = req.query;

        if (!token) return res.status(400).send('Invalid password reset token');

        const resetRequest = await ResetPassword.findOne({ where: { token } });

        if (!resetRequest) return res.status(400).send("Invalid password reset token.");

        if (resetRequest.expires_at < Date.now()) {
            await resetRequest.destroy();
            return res.status(400).send("Password reset token has been expired. Please request again.");
        }

        const user = await User.findOne({ where: { id: resetRequest.user_id } });

        if (user.status === 'inactive') {
            await log(user.id, user.id, 'Password reset failed. Reason: User inactive.');
            return res.status(403).send('User inactive.');
        }

        if (await PasswordPolicies.minimumPasswordAge(user.password_updated_at)) {
            await log(user.id, user.id, 'Password reset failed. Reason: Tried to change password before 1 day.');
            return res.status(400).send(`You cannot change password before 1 day`);
        }

        if (await PasswordPolicies.isOldPassword(req.body.newPassword, user)) {
            await log(user.id, user.id, 'Password reset failed. Reason: Provided previously given password.');
            return res.status(400).send('New password can not be your previously used password.');
        }

        if (!PasswordPolicies.validatePassword(req.body.newPassword)) {
            await log(user.id, user.id, 'Password reset failed. Reason: Password does not satisfy requirements.');
            return res.status(400).send('Password must contain atleast a digit, an uppercase, a lowercase and a special character and must be 8 to 50 characters long.')
        }

        if (!PasswordPolicies.hasValidCharacters(req.body.newPassword)) {
            await log(user.id, user.id, 'Password reset failed. Reason: Password contains invalid characters.');
            return res.status(400).send('Password has one or more invalid character.');
        }

        if (PasswordPolicies.isCommonPassword(req.body.newPassword, user)) {
            await log(user.id, user.id, 'Password reset failed. Reason: Common Password.');
            return res.status(400).send('Password can not be commonly used passwords or personal info. Try a different one.');
        }

        if (req.body.newPassword !== req.body.confirmPassword) {
            await log(user.id, user.id, 'Password reset failed. Reason: Password and confirm password does not match.');
            return res.status(400).send("Password and confirm password doesn't match.");
        }

        if (user.password) await PasswordPolicies.saveOldPassword(user);

        const currentDate = new Date();
        const expiryDate = req.body.newPassword.length >= 15
            ? new Date(currentDate.setFullYear(currentDate.getFullYear() + 1))
            : new Date(currentDate.setDate(currentDate.getDate() + 90));

        const wasAccountLocked = user.failed_auth_attempt >= 5;

        await user.update({
            password: req.body.newPassword,
            failed_auth_attempt: 0,
            password_updated_at: new Date(Date.now()),
            password_expiry_date: expiryDate
        });

        const options = {
            toAddresses: [user.email],
            data: {
                name: user.first_name + " " + user.last_name,
                link: `${req.protocol}://${req.headers.host}/login`,
                s3bucketUrl: nodecache.getValue('S3_BUCKET_URL')
            }
        };

        if (resetRequest.type === 'set') {
            options.templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/cdp/registration-success.html`);
            options.subject = 'Registration Successful';
        }
        else {
            options.templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/cdp/password-reset.html`);
            options.subject = 'Your password has been reset'
        }

        emailService.send(options);

        await resetRequest.destroy();

        if(wasAccountLocked) await log(user.id, user.id, 'Password reset successful. Account unlocked.', 'UPDATE');
        else await log(user.id, user.id, 'Password reset successful', 'UPDATE');

        res.sendStatus(200);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.login = login;
exports.logout = logout;
exports.createUser = createUser;
exports.getSignedInUserProfile = getSignedInUserProfile;
exports.changePassword = changePassword;
exports.getUsers = getUsers;
exports.getUser = getUser;
exports.sendPasswordResetLink = sendPasswordResetLink;
exports.resetPassword = resetPassword;
exports.updateUserDetails = updateUserDetails;
exports.updateSignedInUserProfile = updateSignedInUserProfile;
exports.generateAccessToken = generateAccessToken;
