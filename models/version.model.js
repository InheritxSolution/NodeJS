var versionSchema = new mongoose.Schema({
    versionNumber: {
        type: String,
        default: null,
        trim: true,
    },
    deviceType: {
        type: String,
        default: null,
        trim: true,
    },
    isForceUpdate: {
        type: Number,
        default: null,
        trim: true,
    },
    createdAt: {
        type: Number,
    },
    updatedAt: {
        type: Number,
    },
    syncAt:{
        type: Number,
    },
    deletedAt:{
        type: Number,
        default:null
    }
});

versionSchema.index({"deviceType" : 1, "createdAt" : -1});

module.exports = mongoose.model('versionNumbers', versionSchema);