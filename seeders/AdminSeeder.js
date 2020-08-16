const environment = require('../app.json').env;
require("env2")('../.env.' + environment);
const User = require("../models/user");
const mongoose = require("mongoose");
const crypto = require("crypto");
var mykey = crypto.createCipher("aes-128-cbc", "mypassword");
var mystr = mykey.update("Hello@321", "utf8", "hex");
mystr += mykey.final("hex");
var password = mystr;
const uri = process.env.MONGO_HOST;
mongoose.connect(uri);

const user = [
  new User(  {
    username: "admin",
    fullname: "admin",
    email: "admin@gmail.com",
    password: password,
    token: "Not Set Token",
    phoneNumber: "Not Set Phone Number",
    gender: "Not Set",
    age: "Not Set",
    indication: "Not Set",
    role: "admin"
  })
];

var done = 0;
for (let index = 0; index < user.length; index++) {
  user[index].save(function(err, result){
    done++;
    if(done == user.length){
      console.log("Success seed Admin Seeder");
      exit();
    }
  });
  
}

function exit(){
  mongoose.disconnect();
}
