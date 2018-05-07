const Config = require('../config/config');
var _ = require('lodash');
const Jwt = require('jsonwebtoken');
var Q = require('q');
var mysql = require('mysql');
var imagepool  = mysql.createPool(Config.database);
// var connection = mysql.createConnection(Config.database);
var path = require('path');
var fs = require('fs');
const fulldir = path.join(__dirname,Config.server.filepath+ 'assets/'); 
const dir = path.join('assets/'); 
var s3 = require('s3');
var client = s3.createClient(Config.s3);

// export services
var service = {};
service.getImagetAll = getImagetAll;
service.getImagedetail=getImagedetail;
service.deleteImage=deleteImage;
service.uploadImage=uploadImage;
service.updateImage=updateImage;
module.exports = service;

/**
 * get all images
 */
function getImagetAll(data){
    var deferred = Q.defer();
    imagepool.getConnection(function(err, connection) {
        if(err) { 
          console.log(err); 
          callback(true); 
          return; 
        }
        // get images using page number and limit
        var query = connection.query('SELECT id,title,description,status,CONCAT("'+Config.s3bucketurl+'images/",image_url) as image FROM images where status=1 AND is_deleted=0  order by id DESC LIMIT '+data.pageLimit+' OFFSET '+data.startPage, function (err, results, fields) {
            if (err) {
                deferred.reject(err);
            }else{
                if(results.length >0){  
                    // get total images count
                    var totquery = connection.query('SELECT COUNT(*) as total FROM images WHERE status=1 AND is_deleted=0', function (toterr, totresults, totfields) {
                        connection.release();
                        if (toterr) {
                            deferred.reject(toterr);
                        }else{
                            var resultrow = {
                                status:true,
                                data: results,
                                total : totresults[0]
                            };
                            deferred.resolve(resultrow);
                        }
                    });
                }
                else{
                    connection.release();
                    var result = {
                        status:false,
                        message:"Not Images Found."
                    };
                    deferred.resolve(result);
                }
            }
        });
    });
    return deferred.promise;
}
/**
 * get image detail
 * @param {*} id 
 */
function getImagedetail(id){
    var deferred = Q.defer();
    imagepool.getConnection(function(err, connection) {
        if(err) { 
          console.log(err); 
          callback(true); 
          return; 
        }
        // get a image using image id
        var query = connection.query('SELECT id,title,description,status,CONCAT("'+Config.s3bucketurl+'images/",image_url) as image FROM images where status=1 AND is_deleted=0 AND id =?',[id], function (err, results, fields) {
            connection.release();
            if (err) {
                deferred.reject(err);
            }else{
                if(results.length >0){  
                    var result = {
                        status:true,
                        results: results[0]
                    };
                    deferred.resolve(result);
                }
                else{
                    var result = {
                        status:false,
                        message:"Image does not exits"
                    };
                    deferred.resolve(result);
                }
            }
        });
    });
    return deferred.promise;
}

/**
 * delete image
 */
function deleteImage(id){
    var deferred = Q.defer();
    imagepool.getConnection(function(err, connection) {
        if(err) { 
          console.log(err); 
          callback(true); 
          return; 
        }
        //soft delete image entry from database using id
        var query = connection.query('UPDATE images SET is_deleted=1 WHERE id=?',[id], function (err, results, fields) {
            connection.release();
            if (err) {
                deferred.reject(err);
            }else{
                var resultrow = {
                    status:true,
                    message: "Image Deleted Successfully."
                };
                deferred.resolve(resultrow);
            }
        });
    });
    return deferred.promise;
}

/**
 * upload image
 */

function uploadImage(data){
    var deferred = Q.defer();
    imagepool.getConnection(function(err, connection) {
        if(err) { 
          console.log(err); 
          callback(true); 
          return; 
        }
        // insert image details into database
        var query = connection.query('INSERT INTO images SET ?',data, function (error, results, fields) {
            connection.release();
            if (error) {
                deferred.reject(error);
            }else{
                if(results){
                    if (fs.existsSync(path.join(__dirname, Config.server.filepath)+data.image_url)) {
                        fs.chmodSync(path.join(__dirname, Config.server.filepath)+data.image_url, 0777); 
                    }
                    
                    var result = {
                        status:true,
                        message:"Image add successfully."
                    };
                }else{
                    var result = {
                        status:false,
                        message:"Image add Error."
                    };
                }
            }
            deferred.resolve(result);
        });
    });
    
    return deferred.promise;
}
/**
 * update image details
 * @param {*} data 
 */
function updateImage(data){
    var deferred = Q.defer();
    var query = '';
    var description = data.description.replace(/"/g, '\'');
    var title = data.title.replace(/"/g, '\'');
    updateData= {
        title:title,
        description:description
    }
    // if iamge is changed than update its data too
    if(data.image_url!=''){
        updateData.image_url=data.image_url;
    }
    imagepool.getConnection(function(err, connection) {
        if(err) { 
          console.log(err); 
          callback(true); 
          return; 
        }
        var sql = connection.query('UPDATE images SET ? where id= ?',[updateData,data.id], function (error, results, fields) {
            connection.release();
            if (error) {
                deferred.reject(error);
            }else{
                if(results){
                    // if image change than first delete image
                    if(data.image_url!=''){
                        var deleteparams = {
                            Bucket: Config.s3bucketname, 
                            Delete: {
                                Objects: [
                                    {
                                        Key: "images/"+data.image_url
                                    }
                                ], 
                                Quiet: false
                            }
                        };
                        // delete image from s3 bucket
                        client.deleteObjects(deleteparams, function(err, data) {
                            if (err) console.log(err, err.stack); // an error occurred
                            else     console.log(data);           // successful response
                        });
                    }
                    var result = {
                        status:true,
                        message:"Image updated successfully."
                    };
                }else{
                    var result = {
                        status:false,
                        message:"Image update Error."
                    };
                }
            }
            deferred.resolve(result);
        });
    });
    return deferred.promise;
}
