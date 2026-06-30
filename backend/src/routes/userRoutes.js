const express = require('express');
const router = express.Router();

const onboardingController = require('../controllers/onboardingController');
const securityController = require('../controllers/securityController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireEmailVerified, requireActiveAccount, statusGuard, STATUSES } = require('../middleware/authStatusMiddleware');


router.use(authenticate);

router.get('/profile', onboardingController.getProfile);
router.get('/onboarding-status', onboardingController.getOnboardingStatus);
router.put('/complete-profile', requireEmailVerified, onboardingController.completeProfile);

router.get('/bank-accounts', requireEmailVerified, onboardingController.listBankAccounts);
router.post('/bank-accounts', requireEmailVerified, onboardingController.addBankAccount);
router.put('/bank-accounts/:id', requireEmailVerified, onboardingController.updateBankAccount);
router.delete('/bank-accounts/:id', requireEmailVerified, onboardingController.deleteBankAccount);

router.get('/kyc', requireEmailVerified, onboardingController.getKyc);
// upload step (multipart) + create/update step (json)
const kycRoutes = require('./kycRoutes');
router.use(kycRoutes);

router.post('/kyc', requireEmailVerified, onboardingController.submitKyc);



router.get('/security/overview', requireEmailVerified, securityController.getOverview);
router.post('/security/transaction-pin', requireEmailVerified, securityController.createPin);
router.put('/security/transaction-pin', requireEmailVerified, securityController.updatePin);
router.post('/security/transaction-pin/verify', requireEmailVerified, securityController.verifyPin);
router.post('/security/transaction-pin/forgot', requireEmailVerified, securityController.forgotPin);
router.post('/security/transaction-pin/reset', requireEmailVerified, securityController.resetPin);
router.get('/security/login-history', requireEmailVerified, securityController.getLoginHistory);
router.get('/security/logs', requireEmailVerified, securityController.getSecurityLogs);
router.get('/security/devices', requireEmailVerified, securityController.getDevices);
router.put('/security/devices/:sessionId/logout', requireEmailVerified, securityController.logoutDevice);

// Financial services require full onboarding: ACTIVE (KYC approved + bank verified)
router.get('/beneficiaries', statusGuard([STATUSES.ACTIVE]), onboardingController.listBeneficiaries);
router.post('/beneficiaries', statusGuard([STATUSES.ACTIVE]), onboardingController.createBeneficiary);
router.put('/beneficiaries/:id', statusGuard([STATUSES.ACTIVE]), onboardingController.updateBeneficiary);
router.delete('/beneficiaries/:id', statusGuard([STATUSES.ACTIVE]), onboardingController.deleteBeneficiary);

router.get('/money-requests', statusGuard([STATUSES.ACTIVE]), onboardingController.listMoneyRequests);
router.post('/money-requests', statusGuard([STATUSES.ACTIVE]), onboardingController.createMoneyRequest);
router.put('/money-requests/:id/respond', statusGuard([STATUSES.ACTIVE]), onboardingController.respondMoneyRequest);


router.get('/support-tickets', requireEmailVerified, onboardingController.listSupportTickets);
router.post('/support-tickets', requireEmailVerified, onboardingController.createSupportTicket);
router.get('/support-tickets/:id', requireEmailVerified, onboardingController.getSupportTicket);
router.post('/support-tickets/:id/replies', requireEmailVerified, onboardingController.replySupportTicket);

router.get('/nominees', requireEmailVerified, onboardingController.listNominees);
router.post('/nominees', requireEmailVerified, onboardingController.createNominee);
router.put('/nominees/:id', requireEmailVerified, onboardingController.updateNominee);
router.delete('/nominees/:id', requireEmailVerified, onboardingController.deleteNominee);

router.get('/emergency-contacts', requireEmailVerified, onboardingController.listEmergencyContacts);
router.post('/emergency-contacts', requireEmailVerified, onboardingController.createEmergencyContact);
router.put('/emergency-contacts/:id', requireEmailVerified, onboardingController.updateEmergencyContact);
router.delete('/emergency-contacts/:id', requireEmailVerified, onboardingController.deleteEmergencyContact);

module.exports = router;
