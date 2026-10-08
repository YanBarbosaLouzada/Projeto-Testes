import {ola} from './ola.js';

describe('Testando função ola do arquivo ola.js', () => {
  it('Testando se retorna o texto que o user digita', () => {
    const text = "Olá mundo, esta é a função ola! e vem do arquivo oi.js: ";
    expect(ola('PAO DE FORMA')).toBe(text + 'PAO DE FORMA');
  });
});