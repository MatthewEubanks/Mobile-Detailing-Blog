exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/mobile-detail-app';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-mobile-detail-app';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET || 'Liam';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '5d';