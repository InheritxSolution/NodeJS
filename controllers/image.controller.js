var express = require('express');
var router = express();
var multer = require('multer');
var path = require('path');
var imageService = require('services/image.service');
const Config = require('../config/config');
const Jwt = require('jsonwebtoken');  
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var s3 = require('s3');
var client = s3.createClient(Config.s3);
var datetimestamp = '';
router.use(express.static(path.join(__dirname,  Config.server.filefolderpath)));

router.post('/getImagetAll', getImagetAll);
router.get('/getImagedetail/:id',getImagedetail);
router.delete('/deleteImage/:id', deleteImage);
router.post('/uploadImage',multipartMiddleware,uploadImage);
router.post('/updateImage',multipartMiddleware,updateImage);
module.exports = router;

/**
 * get all images
 */
function getImagetAll(req,res){
    // get needed data from request
    var data = {
        startPage: req.body.startPage,
        pageLimit: req.body.pageLimit
    };
    // send data to services
    imageService.getImagetAll(data)
        .then(function(images) {
            if (images) {
                res.status(200).send(images)
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function(err) {
            res.status(400).send(err);
        })
}
/**
 * get a singel image using image id
 */
function getImagedetail(req,res){
    // send data to services
    imageService.getImagedetail(req.params.id)
    .then(function(image) {
        if (image.status) {
            res.status(200).send(image)
        } else {
            res.sendStatus(404);
        }
    })
    .catch(function(err) {
        res.status(400).send(err);
    });
}
/**
 * image delete using image id
 */
function deleteImage(req,res){
    // send data to services
    imageService.deleteImage(req.params.id)
    .then(function(image) {
        if (image.status) {
            res.status(200).send(image)
        } else {
            res.sendStatus(404);
        }
    })
    .catch(function(err) {
        res.status(400).send(err);
    });
}

/**
 * upload image on aws s3 bucket
 */
function uploadImage(req,res){
    var filename='';
    datetimestamp = Date.now(); 
    // get file name
    filename = datetimestamp + '.' + req.files.uploads.originalFilename.split('.')[req.files.uploads.originalFilename.split('.').length -1];
    // validation rules for upload images    
    var errors = checkvalidation([{
            'key' : 'title',
            'value':req.body.title,
            'validate':['notempty']
        },
        {
            'key' : 'description',
            'value':req.body.description,
            'validate':['notempty']
        },
        {
            'key':'Image',
            'value':filename,
            'validate':['notempty']
        }
    ]);
    
    // check validation has error or not
    if(errors.length<=0){
        // get needed data from request
        var data = {
            title: req.body.title,
            description: req.body.description,
            image_url	: filename,
            created_at:new Date(),
            updated_at:new Date()
        };
        // send data to services
        imageService.uploadImage(data)
        .then(function(image) {
            if (image) {
                // create prams for s3 bucket using config file
                var params = {
                    localFile: req.files.uploads.path,
                    s3Params: {
                        Bucket: Config.s3bucketname,
                        Key: "images/"+filename,
                        ACL:  'public-read-write'
                    },
                };
                // upload image on s3 bucket
                var uploader = client.uploadFile(params);
                uploader.on('error', function(err) {
                    res.status(200).send(image);
                    console.error("unable to upload:", err.stack);
                });
                uploader.on('progress', function() {
                    console.log("progress", uploader.progressMd5Amount,
                    uploader.progressAmount, uploader.progressTotal);
                });
                uploader.on('end', function() {
                    console.log("done uploading");
                    res.status(200).send(image);
                });
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function(err) {
            res.status(400).send(err);
        })
    }
    else{
        res.send(errors);
    }
}

/**
 * update images
 */
function updateImage(req,res){
    datetimestamp = Date.now();
    var filename ="";
    if(req.files.uploads!==undefined){
        // get file name
        filename = datetimestamp + '.' + req.files.uploads.originalFilename.split('.')[req.files.uploads.originalFilename.split('.').length -1];
    }
    // validation rules for upload images
    var errors = checkvalidation([
        {
            'key' : 'title',
            'value':req.body.title,
            'validate':['notempty']
        },
        {
            'key' : 'description',
            'value':req.body.description,
            'validate':['notempty']
        }
    ]);
    // check validation has error or not
    if(errors.length<=0){
        // get needed data from request
        var data = {
            id : req.body.id, 
            title: req.body.title,
            description: req.body.description,
            image_url : filename,
            updated_at:new Date()
        };
        // send data to services
        imageService.updateImage(data)
        .then(function(image) {
            if (image) {

                // create prams for s3 bucket using config file
                if(req.files.uploads!==undefined){
                    var params = {
                        localFile: req.files.uploads.path,
                        s3Params: {
                            Bucket: Config.s3bucketname,
                            Key: "images/"+filename,
                            ACL:  'public-read-write'
                        },
                    };
                    // upload image on s3 bucket
                    var uploader = client.uploadFile(params);
                    uploader.on('error', function(err) {
                        console.error("unable to upload:", err.stack);
                        res.status(200).send(image);
                    });
                    uploader.on('progress', function() {
                        console.log("progress", uploader.progressMd5Amount,
                        uploader.progressAmount, uploader.progressTotal);
                    });
                    uploader.on('end', function() {
                        console.log("done uploading");
                        res.status(200).send(image);
                    });
                }
                else{
                    res.status(200).send(image);
                }
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function(err) {
            res.status(400).send(err);
        })
    }
    else{
        res.send(errors);
    }
}