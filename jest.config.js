/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // Informa ao Jest para tratar arquivos .ts como ES Modules
  extensionsToTreatAsEsm: ['.ts'],
  
  // Define o preset do ts-jest para configurar automaticamente o ambiente TypeScript
  preset: 'ts-jest/presets/default-esm',

  // Define o ambiente de teste que será usado
  testEnvironment: 'node',

  // Adiciona 'src' como um caminho base para a resolução de módulos
  modulePaths: ["<rootDir>/src"],

  // Mapeia os nomes dos módulos para resolver problemas de importação de arquivos
  // sem a extensão .js, comum em projetos ESM.
  moduleNameMapper: {
    // Mapeia importações absolutas (a partir de 'src') que terminam com .js
    // para que o Jest encontre os arquivos .ts correspondentes.
    '^(.*)/src/(.*)\\.js$': '$1/src/$2',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // Configura como os arquivos de código-fonte são transformados antes dos testes
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
};