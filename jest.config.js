/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  testEnvironment: 'node',

  // Tratamento de arquivos .ts e .tsx como ESM
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // Mapeamento de imports .js para .ts (necessário para ESM + TS)
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // Transformação de TS e ESM
  transform: {
    // Use ts-jest para arquivos .ts, .tsx e .js
    '^.+\\.[tj]sx?$': ['ts-jest', {
      useESM: true,
    }],
  },

  // Transforma a biblioteca ESM antes do Jest rodar
  transformIgnorePatterns: [
    '/node_modules/(?!geometric-props)'
  ],
};