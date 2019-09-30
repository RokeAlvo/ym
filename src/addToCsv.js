const fsSync = require('fs');
const file='output.csv';


exports.addRowToCsv = function(data){
    fsSync.appendFileSync(file, data+'\n', 'utf8');
};
