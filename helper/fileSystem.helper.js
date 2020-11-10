const fs = require('fs');
const _ = require('lodash');

let deleteDirData = async(dir) => {
    return new Promise((resolve, reject) => {
        fs.rmdirSync(dir, { recursive: true }, (err) => {
            if (err) {
                resolve(null)     
            }
            console.log(`${dir} is deleted!`);
            resolve(true)        
        });
    })
}

module.exports = {
    deleteDirData
}