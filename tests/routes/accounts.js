const { describe, it, before } = require('mocha');
const { assert } = require('chai');
const { ChaiRequest, randomHash } = require('spelwerk-service-utility');
const path = require('path');
const _ = require('lodash');
const { loginPath, administrator, keys } = require('../config');
const { getSecretFromFile } = require('../readFile');
const server = require('../../src/main/server');

describe('accounts', () => {
    const request = new ChaiRequest(8080, loginPath, administrator, keys);

    const hex = randomHash.hex(20);
    let email = `${hex}@fake.email`;
    let displayName = `displayName-${hex}`;
    let password = `password-${hex}`;
    let accountId;
    let refreshTokenId;
    let securityQuestionId;

    before(() => {
        const rootPath = path.join(__dirname, '../../');
        return server.init(rootPath);
    });

    describe('creation', () => {
        it('initiate account creation with email', async () => {
            const route = '/accounts';
            const response = await request.POST(201, route, { email });

            assert.isObject(response);
            assert.isNumber(response.id);

            accountId = response.id;
        });

        it('request verify', async () => {
            const route = '/verify/send';
            await request.POST(204, route, { email });
        });

        it('verify', async () => {
            const route = '/verify/secret';
            const secret = await getSecretFromFile();
            const response = await request.POST(200, route, { email, secret, displayName, password });

            assert.isObject(response);
            assert.isString(response.refreshToken);
            assert.isString(response.accessToken);
            assert.isObject(response.session);
            assert.isNumber(response.session.expiry);
            assert.isNumber(response.session.id);
            assert.isObject(response.session.roles);

            _.forEach(response.session.roles, (boolean, key) => {
                assert.isString(key);
                assert.isTrue(boolean);
            });
        });
    });

    describe('information', () => {
        it('get all', async () => {
            const route = '/accounts';
            const response = await request.GET(200, route);

            assert.isObject(response);
            assert.isArray(response.results);

            _.forEach(response.results, (item) => {
                assert.isNumber(item.id);
                assert.isString(item.displayName);
            });
        });

        it('get one', async () => {
            const route = `/accounts/${accountId}`;
            const response = await request.GET(200, route);

            assert.isObject(response);
            assert.isObject(response.result);
            assert.isNumber(response.result.id);
            assert.isString(response.result.displayName);
            assert.isString(response.result.created);
            assert.isString(response.result.updated);
        });
    });

    describe('exists', () => {
        it('displayName exists', async () => {
            const route = '/exists/display-name';
            const response = await request.GET(200, `${route}/${displayName}`);

            assert.isObject(response);
            assert.isTrue(response.exists);
        });

        it('displayName does not exist', async () => {
            const route = '/exists/display-name';
            const response = await request.GET(200, `${route}/this-should-not-work-at-all`);

            assert.isObject(response);
            assert.isFalse(response.exists);

        });

        it('email exists', async () => {
            const route = '/exists/email';
            const response = await request.GET(200, `${route}/${email}`);

            assert.isObject(response);
            assert.isTrue(response.exists);
        });

        it('email does not exist', async () => {
            const route = '/exists/email';
            const response = await request.GET(200, `${route}/this-should-not-work-at-all`);

            assert.isObject(response);
            assert.isFalse(response.exists);
        });
    });

    describe('login & sessions', () => {
        it('request login', async () => {
            const route = '/login/send';
            await request.POST(204, route, { email });
        });

        it('login', async () => {
            const route = '/login/secret';
            const secret = await getSecretFromFile();
            const response = await request.POST(200, route, { email, secret });

            assert.isObject(response);
            assert.isString(response.refreshToken);
            assert.isString(response.accessToken);
            assert.isObject(response.session);
            assert.isNumber(response.session.expiry);
            assert.isNumber(response.session.id);
            assert.isObject(response.session.roles);

            _.forEach(response.session.roles, (boolean, key) => {
                assert.isString(key);
                assert.isTrue(boolean);
            });
        });

        it('login with password', async () => {
            const route = '/login/password';
            await request.POST(200, route, { email, password });
        });

        it('get session', async () => {
            const route = '/sessions';
            await request.LOGIN(email, password);
            const response = await request.GET(200, route);

            assert.isString(response.accessToken);
            assert.isObject(response.session);
            assert.isNumber(response.session.expiry);
            assert.isNumber(response.session.id);
            assert.isObject(response.session.roles);
        });

        it('get session info', async () => {
            const route = '/sessions/info';
            await request.LOGIN(email, password);
            const response = await request.GET(200, route);

            assert.isObject(response.tokens.accessToken);
            assert.isObject(response.tokens.accessToken.account);
            assert.isNumber(response.tokens.accessToken.account.id);
            assert.isObject(response.tokens.accessToken.account.roles);

            _.forEach(response.tokens.accessToken.account.roles, (boolean, key) => {
                assert.isString(key);
                assert.isTrue(boolean);
            });

            assert.isString(response.tokens.accessToken.iss);
            assert.isNumber(response.tokens.accessToken.iat);
            assert.isNumber(response.tokens.accessToken.exp);

            assert.isObject(response.tokens.refreshToken);
            assert.isString(response.tokens.refreshToken.uuid);
            assert.isString(response.tokens.refreshToken.iss);
            assert.isNumber(response.tokens.refreshToken.iat);
            assert.isNumber(response.tokens.refreshToken.exp);
        });
    });

    describe('changing details', () => {
        it('request email change', async () => {
            const route = '/settings/change-email/send';
            await request.POST(204, route, { email });
        });

        it('email change', async () => {
            const route = '/settings/change-email/secret';
            const secret = await getSecretFromFile();
            const newEmail = `new-${email}`;
            await request.POST(204, route, { email, secret, newEmail });
            email = newEmail;
        });

        it('request password change', async () => {
            const route = '/settings/change-password/send';
            await request.POST(204, route, { email });
        });

        it('password change', async () => {
            const route = '/settings/change-password/secret';
            const secret = await getSecretFromFile();
            const newPassword = `new-${password}`;
            await request.POST(204, route, { email, secret, newPassword });
            password = newPassword;
        });

        it('edit normal account details', async () => {
            const route = `/settings/${accountId}`;
            await request.PUT(204, route, {
                nameFirst: `nameFirst-${hex}`,
                nameLast: `nameLast-${hex}`,
                country: `country-${hex}`,
                city: `city-${hex}`,
            });
        });

        it('edit display name', async () => {
            const route = `/settings/${accountId}/display-name`;
            displayName = `new-${displayName}`;
            await request.PUT(204, route, { displayName });
        });
    });

    describe('refresh tokens', () => {
        it('get', async () => {
            const route = '/tokens/refresh';
            const response = await request.GET(200, route);

            _.forEach(response.results, (token) => {
                assert.isString(token.uuid);
                assert.isNull(token.name);
            });

            refreshTokenId = response.results[0].uuid;
        });

        it('put', async () => {
            const route = `/tokens/refresh/${refreshTokenId}`;
            await request.PUT(204, route, { name: 'refreshTokenName' });
        });

        it('get with changed name', async () => {
            const route = '/tokens/refresh';
            const response = await request.GET(200, route);
            const result = response.results[0];

            assert.isString(result.uuid);
            assert.isString(result.name);
        });

        it('delete', async () => {
            const route = `/tokens/refresh/${refreshTokenId}`;
            await request.DELETE(204, route);
        });
    });

    describe('one time password', () => {
        it('set OTP', async () => {
            const route = `/settings/${accountId}/one-time-password`;
            const response = await request.POST(200, route, {});

            assert.isString(response.url);
            assert.isString(response.imageData);
        });

        // verify OTP cannot be tested

        it('delete OTP', async () => {
            const route = `/settings/${accountId}/one-time-password`;
            await request.DELETE(204, route);
        });
    });

    describe('security questions', () => {
        it('post security question', async () => {
            const route = `/settings/${accountId}/security-questions`;
            await request.POST(204, route, {
                securityQuestionId: 1,
                answer: 'answer',
            });
        });

        it('get security questions', async () => {
            const route = `/settings/${accountId}/security-questions`;
            const response = await request.GET(200, route);

            _.forEach(response, (item) => {
                assert.isNumber(item.id);
                assert.isString(item.text);
            });
        });

        it('get security question verify', async () => {
            const route = `/settings/${accountId}/security-questions/verify`;
            const response = await request.GET(200, route);

            assert.isNumber(response.id);
            assert.isString(response.text);

            securityQuestionId = response.id;
        });

        it('post security question verify', async () => {
            const route = `/settings/${accountId}/security-questions/verify`;
            await request.POST(204, route, {
                securityQuestionId,
                answer: 'answer',
            });
        });

        it('put security question item', async () => {
            const route = `/settings/${accountId}/security-questions/${securityQuestionId}`;
            await request.PUT(204, route, { answer: 'new-answer' });
        });

        it('delete security question item', async () => {
            const route = `/settings/${accountId}/security-questions/${securityQuestionId}`;
            await request.DELETE(204, route);
        });
    });

    describe('admin', () => {
        before(() => {
            return request.LOGIN();
        });

        it('change email as admin', async () => {
            const route = `/admin/${accountId}/email`;
            const newEmail = `adm-${email}`;
            await request.PUT(204, route, { newEmail });
            email = newEmail;
        });

        it('change password as admin', async () => {
            const route = `/admin/${accountId}/password`;
            const newPassword = `adm-${password}`;
            await request.PUT(204, route, { newPassword });
            password = newPassword;
        });

        it('get roles', async () => {
            const route = `/admin/${accountId}/roles`;
            const response = await request.GET(200, route);

            _.forEach(response.roles, (boolean, key) => {
                assert.isString(key);
                assert.isTrue(boolean);
            });
        });

        it('post roles', async () => {
            const route = `/admin/${accountId}/roles`;
            await request.POST(204, route, { roleId: 2 });
        });

        it('delete roles', async () => {
            const route = `/admin/${accountId}/roles/2`;
            await request.DELETE(204, route);
        });
    });

    describe('account deletion', () => {
        before(() => {
            return request.LOGIN(email, password);
        });

        it('delete account', async () => {
            const route = `/settings/${accountId}`;
            await request.DELETE(204, route);
        });
    });
});
