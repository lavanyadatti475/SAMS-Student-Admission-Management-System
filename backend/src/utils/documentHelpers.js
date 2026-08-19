const mime = require("mime-types");

const { v4: uuid } = require("uuid");

function generateFileName(file){

const extension = mime.extension(file.mimetype);

return `${uuid()}.${extension}`;

}

function isImage(type){

return type.startsWith("image");

}

function isPDF(type){

return type==="application/pdf";

}

module.exports={

generateFileName,

isImage,

isPDF

};