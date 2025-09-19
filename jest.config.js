module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '<rootDir>/app/javascript/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/app/javascript/**/*.{test,spec}.{js,jsx}'
  ],
  moduleDirectories: ['node_modules', '<rootDir>'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  collectCoverageFrom: [
    'app/javascript/**/*.{js,jsx}',
    '!app/javascript/**/*.d.ts',
    '!app/javascript/**/node_modules/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleFileExtensions: ['js', 'jsx', 'json'],
}