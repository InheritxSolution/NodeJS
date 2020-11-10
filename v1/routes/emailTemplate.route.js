const router = express.Router();
const emailFormatController = require('../controllers/emailTemplate.controller');
const {emailTemplateValidator} = require('../../middleware/validation/emailTemplate.validator');
const {validatorFunc} = require('../../helper/commonFunction.helper');
const auth = require('../../middleware/auth.middleware');
const adminSubAdminAccess = require('../../middleware/adminSubAdminAccess.middleware');

router.post('/createEmailTemplate', auth, adminSubAdminAccess, emailTemplateValidator, validatorFunc, emailFormatController.createEmailTemplate);
router.post('/updateEmailTemplate/:id', auth, adminSubAdminAccess, emailTemplateValidator, validatorFunc, emailFormatController.updateEmailTemplate);
router.get('/getAllEmailTemplate',auth, adminSubAdminAccess, emailFormatController.getAllEmailTemplate);

module.exports = router;