export default {
  testEnvironment: "node",
  transform: {},
  testMatch: ["**/*.test.js"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/system-testes/",          // testes de sistema rodam à parte, com o servidor no ar (Aula 6)
  ],
  setupFiles: ["dotenv/config"],
  coverageProvider: "v8",      // mede a cobertura usando o próprio motor do Node (ver explicação abaixo)
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.test.js",       // o próprio teste não conta como código coberto
    "!src/server.js",          // não faz sentido medir cobertura do "boot" do servidor
    "!src/index.js",           // versão antiga, 100% comentada (Aula 1.2)
    "!src/test-utils/**",      // ferramentas de teste, não código de produção
    "!src/functions/**",       // exemplos didáticos da Aula 1 (opcional excluir)
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
};