var config = {
    port: 3000,
    cookie: {
        secret: 'translate',
        maxAge: 3600000 * 24 * 30
    },
    sign: {
        secret: 'xxxxx',
        maxAge: 3600000 * 24 * 30
    },
    db: 'mongodb://127.0.0.1/translate',
    db_name: 'translate'
};

module.exports = config;
module.exports.config = config;