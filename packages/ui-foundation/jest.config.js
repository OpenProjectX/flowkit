module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.json'
            }
        ]
    },
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.js',
        '\\.svg$': '<rootDir>/src/__mocks__/styleMock.js',
        '^@/(.*)$': '<rootDir>/src/$1'
    }
}
