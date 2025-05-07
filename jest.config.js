module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testMatch: ['**/__test__/**/*.(test|spec).(ts|tsx|js)'],
    transformIgnorePatterns: [
        'node_modules/(?!(@aws-sdk)/)'
    ]
};