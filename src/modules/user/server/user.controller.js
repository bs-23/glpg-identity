const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('./user.model');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const emailService = require(path.join(process.cwd(), 'src/config/server/lib/email-service/email.service'));
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));
const ResetPassword = require('./reset-password.model');
const UserRole = require(path.join(process.cwd(), "src/modules/user/server/user-role.model"));
const Role = require(path.join(process.cwd(), "src/modules/user/server/role/role.model"));
const RolePermission = require(path.join(process.cwd(), "src/modules/user/server/role/role-permission.model"));
const Permission = require(path.join(process.cwd(), "src/modules/user/server/permission/permission.model"));
const axios = require("axios");
const Application = require(path.join(process.cwd(), "src/modules/application/server/application.model"));
const PasswordPolicies = require(path.join(process.cwd(), "src/modules/core/server/password/password-policies.js"));
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const { QueryTypes, Op, where, col, fn } = require('sequelize');
const Filter = require(path.join(process.cwd(), "src/modules/core/server/filter/filter.model.js"));
const filterService = require(path.join(process.cwd(), 'src/modules/user/server/filter.js'));

function generateAccessToken(user) {
    return jwt.sign({
        id: user.id
    }, nodecache.getValue('CDP_TOKEN_SECRET'), {
        expiresIn: '1d',
        issuer: user.id.toString()
    });
}

function getRolesPermissions(userrole) {
    const roles = [];

    if (userrole) {
        userrole.forEach(ur => {
            roles.push({
                title: ur.role.name,
                permissions: ur.role.rolePermission.map(rp => rp.permission.module)
            });
        });

        return roles;
    }
}

function getCommaSeparatedRoles(userrole) {
    if (userrole) {
        const roles = userrole.map(ur => ur.role.name);
        return roles.join();
    }
}

function ignoreCaseArray(str) {
    return [str.toLowerCase(), str.toUpperCase(), str.charAt(0).toLowerCase() + str.charAt(1).toUpperCase(), str.charAt(0).toUpperCase() + str.charAt(1).toLowerCase()];
}

function formatProfile(user) {
    const profile = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        type: user.type,
        status: user.status,
        roles: getRolesPermissions(user.userrole),
        application: user.application,
        countries: user.countries,
        last_login: user.last_login,
        expiry_date: user.expiry_date,
    };
    return profile;
}

function formatProfileDetail(user) {
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
        roles: getCommaSeparatedRoles(user.userrole),
        application: user.application_name,
        countries: user.countries
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

async function attachApplicationInfoToUser(user) {
    const userApplication = await Application.findOne({ where: { id: user.application_id } });
    user.application = userApplication ? {
        name: userApplication.name,
        slug: userApplication.slug,
        logo_link: userApplication.logo_link
    } : null;
    return user;
}

async function getSignedInUserProfile(req, res) {
    try {
        const user = await attachApplicationInfoToUser(req.user);
        res.json(formatProfile(user));
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function login(req, res) {
    try {
        const { email, password, recaptchaToken } = req.body;

        if (!recaptchaToken) {
            return res.status(400).send('Captcha verification required.');
        }

        const user = await User.findOne({
            where: {
                email: {
                    [Op.iLike]: `${email}`
                }
            },
            include: [{
                model: UserRole,
                as: 'userrole',
                include: [{
                    model: Role,
                    as: 'role',
                    include: [{
                        model: RolePermission,
                        as: 'rolePermission',
                        include: [{
                            model: Permission,
                            as: 'permission',
                        }]

                    }]
                }]
            }]
        });

        const userLockedMessage = 'Your account has been locked for consecutive failed auth attempts. Please use the Forgot Password link to unlock.';

        if (user && user.status === 'inactive') return res.status(401).send('Account not active.');

        if (user && user.dataValues.failed_auth_attempt >= 5) {
            return res.status(401).send(userLockedMessage);
        }

        if (user && user.password_expiry_date && user.password_expiry_date < Date.now()) {
            return res.status(401).send("Password has been expired. Please reset the password.");
        }

        if (!user || !user.password || !user.validPassword(password)) {
            if (user && user.password) {
                await user.update(
                    { failed_auth_attempt: parseInt(user.dataValues.failed_auth_attempt ? user.dataValues.failed_auth_attempt : '0') + 1 }
                );
            }

            const errorMessage = user && user.dataValues.failed_auth_attempt >= 5
                ? userLockedMessage
                : 'Invalid email or password.';

            return res.status(401).send(errorMessage);
        }

        const isSiteVerified = await verifySite(recaptchaToken);

        if (!isSiteVerified) {
            return res.status(400).send('Failed captcha verification.');
        }

        res.cookie('access_token', generateAccessToken(user), {
            expires: new Date(Date.now() + 8.64e7),
            httpOnly: true
        });

        await user.update({
            last_login: Date(),
            failed_auth_attempt: 0
        });

        const userWithApplication = await attachApplicationInfoToUser(user);

        res.json(formatProfile(userWithApplication));
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function logout(req, res) {
    res.clearCookie('access_token').redirect('/');
}

async function createUser(req, res) {
    const {
        first_name,
        last_name,
        email,
        country_code,
        phone,
        countries,
        roles,
        application_id,
    } = req.body;
    const phone_number = phone ? country_code + phone : '';
    const validForMonths = 6
    const currentDate = new Date()

    try {
        const [doc, created] = await User.findOrCreate({
            where: { email: email.toLowerCase() },
            defaults: {
                first_name,
                last_name,
                phone: phone_number ? phone_number.replace(/\s+/g, '') : null,
                countries,
                application_id,
                created_by: req.user.id,
                updated_by: req.user.id,
                expiry_date: new Date(currentDate.setMonth(currentDate.getMonth() + validForMonths))
            }
        });

        if (!created) {
            return res.status(400).send('Email already exists.');
        }

        roles && roles.forEach(async function (roleId) {
            await UserRole.create({
                roleId: roleId,
                userId: doc.id,
            });
        });

        const logData = {
            event_type: 'CREATE',
            object_id: doc.id,
            table_name: 'users',
            created_by: req.user.id,
            description: 'Created new CDP user',
        }
        await logService.log(logData)

        const token = crypto.randomBytes(36).toString('hex');
        const expireAt = Date.now() + 3600000;

        const [resetRequest, reqCreated] = await ResetPassword.findOrCreate({
            where: { user_id: doc.id },
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
            toAddresses: [doc.email],
            templateUrl,
            subject: 'Setup password for your CDP account',
            data: {
                name: `${doc.first_name} ${doc.last_name}` || '',
                link,
                s3bucketUrl: nodecache.getValue('S3_BUCKET_URL')
            }
        };

        emailService.send(options);

        res.json(doc);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

function generateFilterOptions(currentFilter, defaultFilter) {
    if (!currentFilter || !currentFilter.option || !currentFilter.option.filters || currentFilter.option.filter === 0)
        return defaultFilter;

    // if (currentFilter.option.filters.length === 1 || !currentFilter.option.logic) {
    //     const filter = currentFilter.option.filters[0];
    //     defaultFilter[filter.fieldName] = filterService.getValueOptions(filter);

    //     return defaultFilter;
    // }

    console.log('Default filter: ', defaultFilter);
    let customFilter = { ...defaultFilter };

    const nodes = currentFilter.option.logic
        ? currentFilter.option.logic.split(" ")
        : ['1'];
    console.log('Logic nodes: ', nodes.join());

    let prevOperator;
    const groupedQueries = [];
    for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index];
        const prev = index > 0 ? nodes[index - 1] : null;
        const next = index < nodes.length - 1 ? nodes[index + 1] : null;

        const findFilter = (name) => {
            return currentFilter.option.filters.find(f => f.name === name);
        };

        if (node === "and" && prevOperator === "and") {
            const filter = findFilter(next);
            const query = { [filter.fieldName]: filterService.getValueOptions(filter) };
            const currentParent = groupedQueries[groupedQueries.length - 1];
            currentParent.values.push(query);
        } else if (node === "and") {
            const leftFilter = findFilter(prev);
            const rightFilter = findFilter(next);
            const group = {
                operator: "and",
                values: [
                    { [leftFilter.fieldName]: filterService.getValueOptions(leftFilter) },
                    { [rightFilter.fieldName]: filterService.getValueOptions(rightFilter) }
                ]
            };
            groupedQueries.push(group);
        } else if (node !== "or" && prev !== "and" && next !== "and") {
            const filter = findFilter(node);
            const query = { [filter.fieldName]: filterService.getValueOptions(filter) };
            groupedQueries.push(query);
        }

        prevOperator = node === "and" || node === "or" ? node : prevOperator;
    }

    console.log('Grouped queries: ', groupedQueries.map((a) => JSON.stringify(a)));

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
    console.log('Custom filter: ', customFilter);

    return customFilter;
}

async function getUsers(req, res) {
    try {
        const page = req.query.page ? req.query.page - 1 : 0;
        if (page < 0) return res.status(404).send("page must be greater or equal 1");

        const limit = 15;
        const offset = page * limit;

        const codbase = req.query.codbase === 'null' ? null : req.query.codbase;

        const signedInId = (formatProfile(req.user)).id;

        const orderBy = req.query.orderBy === 'null'
            ? null
            : req.query.orderBy;
        const orderType = req.query.orderType === 'asc' || req.query.orderType === 'desc'
            ? req.query.orderType
            : 'asc';

        const country_iso2_list_for_codbase = (await sequelize.datasyncConnector.query(`
            SELECT * FROM ciam.vwcountry
            WHERE codbase = $codbase
            `, {
            bind: {
                codbase: codbase || ''
            },
            type: QueryTypes.SELECT
        })).map(c => c.country_iso2);

        const countries_ignorecase_for_codbase = [].concat.apply([], country_iso2_list_for_codbase
            .map(i => ignoreCaseArray(i)));

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
            type: 'basic',
            countries: codbase ? { [Op.overlap]: [countries_ignorecase_for_codbase] } : { [Op.ne]: ["undefined"] }
        };

        const currentFilter = await Filter.findOne({
            where: { user_id: req.user.id, list_name: 'cdp-users' }
        });

        const filterOptions = generateFilterOptions(currentFilter, defaultFilter);

        const inclusions = [{
            model: User,
            as: 'createdByUser',
            attributes: ['id', 'first_name', 'last_name'],
        }];

        const users = await User.findAll({
            where: filterOptions,
            offset,
            limit,
            order: order,
            include: inclusions,
            attributes: { exclude: ['password'] },
        });

        const totalUser = await User.count({
            where: filterOptions,
            include: inclusions
        });

        const data = {
            users: users,
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
        const user = await User.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                model: UserRole,
                as: 'userrole',
                include: [{
                    model: Role,
                    as: 'role',
                }]
            }],
        });

        if (!user) return res.status(404).send("User is not found or may be removed");

        const userApplication = await Application.findOne({ where: { id: user.application_id } });
        user.application_name = userApplication ? userApplication.name : null;

        const formattedUser = formatProfileDetail(user);

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

        const signedInUserWithApplicationDetails = await attachApplicationInfoToUser(signedInUser);
        res.json(formatProfile(signedInUserWithApplicationDetails));
    }catch(err){
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function partialUpdateUser(req, res) {
    const id = req.params.id;
    const { first_name, last_name, email, phone, type, status } = req.body;
    const partialUserData = { first_name, last_name, email, phone, type, status };

    try {
        if ([first_name, last_name, email].includes(null)) return res.sendStatus(400);

        const user = await User.findOne({ where: { id } });

        if (!user) return res.status(404).send("User is not found or may be removed");

        const doesEmailExist = await User.findOne({
            where: {
                id: { [Op.ne]: id },
                email: { [Op.iLike]: `${email}` } }
            }
        );

        if(doesEmailExist) return res.status(400).send("Email already exists.");

        await user.update(partialUserData);

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

        res.json(formatProfile(user));
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function resetPassword(req, res) {
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
            return res.status(403).send('User inactive.');
        }

        if (await PasswordPolicies.minimumPasswordAge(user.password_updated_at)) {
            return res.status(400).send(`You cannot change password before 1 day`);
        }

        if (await PasswordPolicies.isOldPassword(req.body.newPassword, user)) return res.status(400).send('New password can not be your previously used password.');

        if (!PasswordPolicies.validatePassword(req.body.newPassword)) return res.status(400).send('Password must contain atleast a digit, an uppercase, a lowercase and a special character and must be 8 to 50 characters long.');

        if (!PasswordPolicies.hasValidCharacters(req.body.newPassword)) return res.status(400).send('Password has one or more invalid character.');

        if (PasswordPolicies.isCommonPassword(req.body.newPassword, user)) return res.status(400).send('Password can not be commonly used passwords or personal info. Try a different one.');

        if (req.body.newPassword !== req.body.confirmPassword) return res.status(400).send("Password and confirm password doesn't match.");

        if (user.password) await PasswordPolicies.saveOldPassword(user);

        const currentDate = new Date();
        const expiryDate = req.body.newPassword.length >= 15
            ? new Date(currentDate.setFullYear(currentDate.getFullYear() + 1))
            : new Date(currentDate.setDate(currentDate.getDate() + 90));

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

        res.sendStatus(200);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function verifySite(captchaResponseToken) {
    return true;
    try {
        const secretKey = nodecache.getValue('RECAPTCHA_SECRET_KEY');

        const siteverifyResponse = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaResponseToken}`,
            null,
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
                }
            }
        );

        if (!siteverifyResponse || !siteverifyResponse.data || !siteverifyResponse.data.success) {
            console.error(siteverifyResponse.data);
        }

        return siteverifyResponse.data.success;
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function getFilterOptions(req, res) {
    try {
        const filterOptions = await filterService.getFilterOptions(req.user);

        const [currentFilter,] = await Filter.findOrCreate({
            where: { user_id: req.user.id, list_name: 'cdp-users' },
            defaults: {
                option: {}
            }
        });

        const data = {
            filterOptions,
            currentFilter: currentFilter.option
        }
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function updateFilterOptions(req, res) {
    try {
        const filters = req.body;

        const currentFilter = await Filter.findOne({
            where: { user_id: req.user.id, list_name: 'cdp-users' }
        });

        if (currentFilter) {
            await currentFilter.update({
                option: filters
            });
        }

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
exports.partialUpdateUser = partialUpdateUser;
exports.getFilterOptions = getFilterOptions;
exports.updateFilterOptions = updateFilterOptions;
exports.updateSignedInUserProfile = updateSignedInUserProfile;
