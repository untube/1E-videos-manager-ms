
var videoSchemaJSON = {
    user_id:Number,
    fieldname: String,
    originalname:String,
    encoding: String,
    mimetype: String,
    destination: String,
    filename: String,
    size: {type:Number,max:[50000000,"tamaño max superado"]},
    data:String
};


