const bcrypt = require('bcryptjs');
const decode = require('jwt-decode');
const mongoose = require('mongoose');
const constants = require('../config/constants');
const jwt = require('jsonwebtoken');
const keys = require('../keys/keys');
const dateFormat = require('../helper/dateFormate.helper');

const allMultipleDeviceLogin = constants.MULTIPLE_DEVICE_LOGIN || false;
const singleDeviceOnLoginLogOutOtherDevice = false;
const tokenExpireTime = constants.TOKEN_EXPIRE_TIME || '365d';
const Lang = require('../helper/response.helper');

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		trim: true,
		default : null,
	},
	lastName: {
		type: String,
		trim: true,
		default : null,
	},
	userName: {
		type: String,
		trim: true,
		default : null,
	},
	password: {
		type: String,
		trim: true,
	},
	gender: {
		type: String,
		trim: true,
		default : null,
	},
	dob: {
		type: String,
		trim: true,
		default : null,
	},
	userType: {
		type: Number,
		trim: true,
	},
	countryCode: {
		type: String,
		trim: true,
		default:constants.COUNTRY_CODE,
	},
	mobileNumber: {
		type: String,
		trim: true,
		default: null,
	},
	isMobileVerified:{
		type: Number,
		trim: true,
		default: constants.USER.NOT_VERIFY,
	},
	email: {
		type: String,
		trim: true,
		lowercase: true,
	},
	isEmailVerified:{
		type: Number,
		trim: true,
		default: constants.USER.NOT_VERIFY,
	},
	profilePic: {
		type: String,
		default : null,
	},
	lat: {
		type: Number,
		trim: true,
	},
	long: {
		type: Number,
		trim: true,
	},
	resetPasswordToken: {
		type: String,
		default: null,
	},
	resetPasswordExpires: {
		type: Number,
		default: null,
	},
	status: {
		type: Number,
		default: constants.STATUS.INACTIVE,
	},
	deviceTokens: [{
		deviceToken: {
			type: String,
			required: true,
			default: null,
		},
		deviceType: {
			type: String,
			require: true,
			default: null,			
		},
		token: {
			type: String,
			default: null,
		}
	}],
	city:{
		type: String,
		default: null,
		lowercase: true,
	},
	state:{
		type: String,
		default: null,
		lowercase: true,
	},
	country:{
		type: String,
		default: null,
		lowercase: true,
	},
	tokens: [{
		token: {
			type: String,
			required: true,
		}
	}],
	createdAt: {
		type: Number,
	},
	updatedAt: {
		type: Number,
	},
	syncAt: {
		type: Number,
	},
	deletedAt: {
		type: Number,
		default : null,
	},
});

userSchema.index({"email" : 1});
userSchema.index({"userType" : 1});
userSchema.index({"userName" : 1});
userSchema.index({"mobileNumber" : 1});

//checking if password is valid
userSchema.methods.validPassword = function (password) {
	if(this.password && this.password != undefined && password != undefined){
		return bcrypt.compareSync(password, this.password);
	}else{
		return false;
	}
};

// find user by credentials 
userSchema.statics.findByCredential = async function (req, mobileNumber, email, password) {
	let user;
	if(mobileNumber){
		user = await User.findOne({mobileNumber, deletedAt:null });
	}else if(email){
		user = await User.findOne({ email, deletedAt:null });
	}
	
	if (!user) {
		throw new Error(Lang.responseIn("USER.INVALID_CREDENTIALS", req.headers.lang));
	}

	if (!user.validPassword(password)){
		throw new Error(Lang.responseIn("USER.INVALID_CREDENTIALS", req.headers.lang));
    }

	return user;
}

// for generating token
userSchema.methods.generateToken = async function () {
	const user = this;
	const token = await jwt.sign({ _id: user._id.toString() }, keys.JWT_SECRET,{
		expiresIn: tokenExpireTime
	  });
	//all multiple device to login with same credential
	if(allMultipleDeviceLogin){
		user.tokens = user.tokens.concat({ token });
		await user.save();
		return token;
	}else{
		//on device other device login logout from all other devices
		if(singleDeviceOnLoginLogOutOtherDevice){
			user.tokens = [];
			user.tokens = user.tokens.concat({ token });
			await user.save();
			return token;
		}else{
			//if token not exist then add token else same token will remain as it is.
			if(((user.tokens).length) == 0){
				user.tokens = user.tokens.concat({ token });
				await user.save();
				return token;
			}else if(user.tokens.length>0){
			const decoded = decode(user.tokens[0].token)
			currentTime = await dateFormat.setCurrentTimestampInSeconds();
			console.log(decoded.exp < currentTime);
			if(decoded.exp < currentTime){
				user.tokens = [];
				user.tokens = user.tokens.concat({ token });
				await user.save();
				return token;
			}else{
				//if token is not esxpired then it will come here
			}
			}
		}
	}
}

// to send minimal objects
userSchema.methods.toJSON = function () {
	const user = this;
	const userObj = user.toObject();
	return userObj;
}

var User = mongoose.model('users', userSchema);
module.exports = User;