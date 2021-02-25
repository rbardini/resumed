const { defaults } = require('jest-config')

module.exports = {
  clearMocks: true,
  coverageReporters: [...defaults.coverageReporters, 'text-summary'],
}
