const AccessControl = require("accesscontrol");
const ac = new AccessControl();

exports.roles = (function(){
    ac.grant("member")
    .readOwn("profile")
    .readAny("education")
    .readAny("activity");

    ac.grant("admin")
    .extend("member")
    .createOwn("activity")
    .readAny("activity")
    .updateAny("activity")
    .deleteAny("activity")
    .createOwn("education")
    .readAny("education")
    .updateAny("education")
    .deleteAny("education");

    return ac;
})();