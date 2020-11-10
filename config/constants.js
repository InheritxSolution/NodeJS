module.exports = {
	'ENCRYPT_STRING' : {
		'START_SYMBOL' : '{!!!{',
		'END_SYMBOL' : '}!!!}'
	},
	'DEFAULT_VALUE' : null,
	'DEFAULT_NUMBER' : 0,
	'DEFAULT_LANGUAGE' : 'en',
	'APP_LANGUAGE' : ['en','hn'],
	'STATUS_CODE' : { 
		'SUCCESS' : '1',
		'FAIL' : '0',
		'VALIDATION' : '2',
		'UNAUTHENTICATED' : '-1',
		'NOT_FOUND' : '-2'
	},
	'USER_TYPE' : {
		'ADMIN' : 1,
		'SUB_ADMIN' : 2,
		'USER' : 3,
		'ACCOUNTANT' : 4
	},
	'STATUS' : {
		'INACTIVE' : 0,
		'ACTIVE' : 1,
		'DEFAULT' : 2,
		'BLOCKED' : 3,
	},
	'MULTIPLE_DEVICE_LOGIN' : true,
	'TOKEN_EXPIRE_TIME' : '365d',
	'EMAIL_TEMPLATE' : {
		'WELCOME_MAIL' : 'WELCOME_MAIL'
	},
	'PATH' : {
		'APK_PATH' : 'public/files/apk',
		'CMS_UPLOAD_PATH' : 'public/cms/upload',
		'CMS_BACKUP_PATH' : 'public/cms/backup'
	}
}