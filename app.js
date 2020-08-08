const environment = require('./app.json');

require('env2')('.env.' + environment);
