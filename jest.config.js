const config = require('@yandex/ymaps3-cli/jest.config');

module.exports = {
    ...config,
    setupFiles: [require.resolve('./jest.globals'), ...config.setupFiles]
};
