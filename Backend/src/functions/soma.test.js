import {soma} from './soma.js'

describe("Vou testar a função soma", () => {
  it("deve somar dois numeros positivos", () => {
    expect(soma(2,3)).toBe(5)
  })
  it("deve somar dois numeros negativos", () => {
    expect(soma(-2,-3)).toBe(-5)
  })
})