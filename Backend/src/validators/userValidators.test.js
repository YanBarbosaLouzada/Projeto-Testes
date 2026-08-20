import { senhasConferem, validarIdade, validarEmail } from './UserValidators.js';
//IMPORTANTE: PARA GERAR OS TESTES DE SENHA ESTAMOS UTILIZANDO O Padrão AAA (Arrange, Act, Assert)
describe('Testes de validação de usuário', () => {
    it("retorna true quando as senhas conferem", () => {
        // Organizar
        const senha1 = "123456";
        const senha2 = "123456";
        //agir 
        const resultado = senhasConferem(senha1, senha2);
        //verificar
        expect(resultado).toBe(true);
    });

    it("retorna false quando as senhas não conferem", () => {
        // Organizar
        const senha1 = "123456";
        const senha2 = "654321";
        //agir
        const resultado = senhasConferem(senha1, senha2);
        //verificar
        expect(resultado).toBe(false);
    });

    it.each([ [18, true], [25, true], [-1, false], [140, false] ])("retorna %s quando a idade é %i", (idade, resultadoEsperado) => {
        expect(validarIdade(idade)).toBe(resultadoEsperado);
    });

    it("retorna true quando o email é válido", () => {
        expect(validarEmail("douglasdomatogrosso@gmail.com")).toBe(true);
    });

    it("retorna false quando o email é inválido", () => {
        expect(validarEmail("douglasdomatogrossogmail")).toBe(false);
    });
});