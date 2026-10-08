import { hello } from './hello';

describe('Testando função hello do arquivo hello.js', () => {
  it('Testando se retorna o texto que o user digita', () => {
    const text = "Olá eu venho da função hello!, porém este texto depois dos pontos esta vindo do meu pai: ";
    expect(hello('Olá mundo1')).toBe(text + 'Olá mundo1');
  });
});
