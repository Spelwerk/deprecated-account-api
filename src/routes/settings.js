const changeEmailResponse = require('../components/changeEmail/changeEmailResponse');
const changePasswordResponse = require('../components/changePassword/changePasswordResponse');
const accountResponse = require('../components/account/accountResponse');
const otpResponse = require('../components/otp/otpResponse');
const securityQuestionResponse = require('../components/securityQuestion/securityQuestionResponse');

module.exports = (router) => {
    router.route('/change-email/send')
        .post(async (req, res, next) => {
            await changeEmailResponse.sendEmail(req, res, next);
        });

    router.route('/change-email/secret')
        .post(async (req, res, next) => {
            await changeEmailResponse.setNewEmail(req, res, next);
        });

    router.route('/change-password/send')
        .post(async (req, res, next) => {
            await changePasswordResponse.sendEmail(req, res, next);
        });

    router.route('/change-password/secret')
        .post(async (req, res, next) => {
            await changePasswordResponse.setNewPassword(req, res, next);
        });

    router.route('/:id')
        .put(async (req, res, next) => {
            await accountResponse.putAccount(req, res, next, req.params.id);
        })
        .delete(async (req, res, next) => {
            await accountResponse.deleteAccount(req, res, next, req.params.id);
        });

    router.route('/:id/display-name')
        .put(async (req, res, next) => {
            await accountResponse.setDisplayName(req, res, next, req.params.id);
        });

    router.route('/:id/one-time-password')
        .post(async (req, res, next) => {
            await otpResponse.postOTP(req, res, next, req.params.id);
        })
        .delete(async (req, res, next) => {
            await otpResponse.deleteOTP(req, res, next, req.params.id);
        });

    router.route('/:id/one-time-password/verify')
        .post(async (req, res, next) => {
            await otpResponse.verifyOTP(req, res, next, req.params.id);
        });

    router.route('/:id/security-questions')
        .get(async (req, res, next) => {
            await securityQuestionResponse.getQuestions(req, res, next, req.params.id);
        })
        .post(async (req, res, next) => {
            await securityQuestionResponse.postQuestion(req, res, next, req.params.id);
        });

    router.route('/:id/security-questions/verify')
        .get(async (req, res, next) => {
            await securityQuestionResponse.getValidation(req, res, next, req.params.id);
        })
        .post(async (req, res, next) => {
            await securityQuestionResponse.tryValidation(req, res, next, req.params.id);
        });

    router.route('/:id/security-questions/:item')
        .put(async (req, res, next) => {
            await securityQuestionResponse.putQuestion(req, res, next, req.params.id, req.params.item);
        })
        .delete(async (req, res, next) => {
            await securityQuestionResponse.deleteQuestion(req, res, next, req.params.id, req.params.item);
        });
};
