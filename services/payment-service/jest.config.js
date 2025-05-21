module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      'controllers/**/*.js',
      'models/**/*.js',
      'routes/**/*.js',
      'services/**/*.js',
      'utils/**/*.js',
      '!**/node_modules/**'
    ],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    testMatch: [
      '**/tests/unit/**/*.test.js',
      '**/tests/integration/**/*.test.js'
    ],
    testPathIgnorePatterns: [
      '/node_modules/'
    ],
    setupFilesAfterEnv: [
      '<rootDir>/tests/setup.js'
    ],
    verbose: true,
    testTimeout: 10000
  };