module.exports = {

  clearMocks: true,

  collectCoverage: true,

  coverageDirectory: "coverage",

  testEnvironment: "jsdom",

  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!**/*config.{js,jsx}',
    '!**/coverage/**',
    '!**/dist/**'
  ],
};
