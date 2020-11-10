const router = express.Router();
const {registerValidator, updateUserProfileValidator, updateUserPasswordValidator, updateUserMobileNumberValidator, updateUserEmailValidator, profileCompletionValidator, addBeneficiaryValidator} = require('../../middleware/validation/register.validator');
const {validatorFunc} = require('../../helper/commonFunction.helper');
const userController = require('../controllers/user.controller');
const auth = require('../../middleware/auth.middleware');
const profileUpload = require('../../middleware/uploadProfileImage');
const versionUpgrade = require('../../middleware/versionUpgrade.middleware');
const userAccess = require('../../middleware/userAccess.middleware');

//User routes
router.post('/register', versionUpgrade, profileUpload, registerValidator, validatorFunc, userController.register);
router.post('/user-login', versionUpgrade, userController.userLogin);
router.get('/logout', auth, userController.logoutSingleDevice);
router.get('/logout-all', auth, userController.logoutAllDevice);

module.exports = router;