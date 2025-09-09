/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // Informa ao Jest para tratar arquivos .ts como ES Modules
  extensionsToTreatAsEsm: ['.ts'],
  
  // Define o preset do ts-jest para configurar automaticamente o ambiente TypeScript
  preset: 'ts-jest/presets/default-esm',

  // Define o ambiente de teste que será usado
  testEnvironment: 'node',

  // Informa ao Jest para procurar módulos na pasta 'src' também
  moduleDirectories: ["node_modules", "src"],

  // Mapeia os nomes dos módulos para resolver problemas de importação de arquivos
  // sem a extensão .js, comum em projetos ESM.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // Configura como os arquivos de código-fonte são transformados antes dos testes
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
};