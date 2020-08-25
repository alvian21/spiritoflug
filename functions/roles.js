const AccessControl = require("accesscontrol");
const ac = new AccessControl();

exports.roles = (function(){
    ac.grant("member")
    .readOwn("profile")
    .readAny("education")
    .readAny("activity")
    .readAny("food")
    .createOwn("chat")
    .readAny("chat")
    .createOwn("location")
    .createOwn("selfie");

    ac.grant("admin")
    .extend("member")
    .createOwn("activity")
    .readAny("activity")
    .updateAny("activity")
    .deleteAny("activity")
    .createOwn("education")
    .readAny("education")
    .updateAny("education")
    .deleteAny("education")
    .createOwn("food")
    .readAny("food")
    .updateAny("food")
    .deleteAny("food")
    .createOwn("chat")
    .readAny("chat")
    .readAny("location")
    .readAny("selfie");

    return ac;
})();