module.exports = {
  preset: 'jest-expo',
  testTimeout: 30000,
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
