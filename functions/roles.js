const AccessControl = require("accesscontrol");
const ac = new AccessControl();

exports.roles = (function(){
    ac.grant("member")
    .readOwn("profile")
    .readAny("activity");

    ac.grant("admin")
    .extend("member")
    .createOwn("activity")
    .readAny("activity")
    .updateAny("activity")
    .deleteAny("activity");

    return ac;
})();