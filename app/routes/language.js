'use strict';

//https://github.com/dachev/node-cld
var cld = require('cld');


// Return a translation detection result based on a post request.
exports.postLanguage = function(req, res, next) {

  var text = req.body.text;

  console.log(text);

  var result = cld.detect(text, function(err, result){

      if(err){
        res.send(err)
      }else{

         res.send(result);        
      }
  })

};

