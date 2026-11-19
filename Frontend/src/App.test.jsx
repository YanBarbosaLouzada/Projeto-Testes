import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import App from './App';

describe('App', () => {
    it("Renderiza sem erros o app", async () => {
        render(<App />);
        expect(await screen.findByText("Home")).toBeInTheDocument();
    });
})

// describe = Descreve um conjunto de testes relacionados
// a um componente ou funcionalidade específica.

// it = Define um caso de teste individual, descrevendo o que está sendo testado.

//render = Renderiza o componente React em um ambiente de teste,
//  permitindo que você interaja com ele e faça asserções.

// screen = Fornece métodos para consultar elementos renderizados no DOM

// expect = Fornece uma maneira de fazer asserções sobre
// o comportamento esperado do código.