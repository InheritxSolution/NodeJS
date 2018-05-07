module.exports = {
    server: {
        host: 'http://localhost',
        port: 4300,        
        clientUrl : 'http://localhost:4200',
        filepath : '../dist/',
        filefolderpath : '../dist',
    },
    database: {
        host: 'localhost',
        user: 'root',
        password: 'inxdb#2015',
        database: 'zonke'
    },
    bcryptkey : {
        saltRounds : 10,
        myPlaintextPassword : 's0/\/\P4$$w0rD',
        someOtherPlaintextPassword : 'not_bacon'
    },
    key: {
        privateKey: '37LvDSm4XvjYOh9Y',
        tokenExpiry: 1 * 30 * 1000 * 60 //1 hour
    },
    s3 : {
        maxAsyncS3: 20,     // this is the default
        s3RetryCount: 3,    // this is the default
        s3RetryDelay: 1000, // this is the default
        multipartUploadThreshold: 20971520, // this is the default (20 MB)
        multipartUploadSize: 15728640, // this is the default (15 MB)
        s3Options: {
          accessKeyId: "",
          secretAccessKey: "",
          region: ""
        },
    },
    s3bucketurl : '',
    s3bucketname : 'zonked'
};,