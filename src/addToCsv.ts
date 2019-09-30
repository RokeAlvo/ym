
exports.addRowToCsv = function(data){
    const fsSync = require('fs');
    fsSync.appendFileSync(file, data+'\n', 'utf8');
};
