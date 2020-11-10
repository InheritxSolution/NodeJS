const constants = require('../config/constants');
const keys = require('../keys/keys');
const baseUrl = keys.BASE_URL + ':' + keys.PORT
const cmsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String
    },
    lang: {
        type: String,
        default : constants.DEFAULT_LANGUAGE
    },
    content: {
        type: String
    },
    staticPath: {
        type: String,
        default: constants.DEFAULT_VALUE,
        get: (v) => {
            return (!v) ? null : `${baseUrl}/${v}`;
        }
    },
    staticBackUpPath: {
        type: String,
        default: constants.DEFAULT_VALUE,
        get: (v) => {
            return (!v) ? null : `${baseUrl}/${v}`;
        }
    },
    createdAt: {
        type: Number
    },
    updatedAt: {
        type: Number
    },
    syncAt: {
        type: Number
    },
    deletedAt: {
        type: Number,
        default: null
    }
});

cmsSchema.index({"slug": 1});
cmsSchema.set('toJSON', { getters: true });

module.exports = mongoose.model('cms', cmsSchema);