import {describe, it, expect} from 'vitest';
import { FormatarData } from './FormatDate';

describe('FormatarData', () => {
    it('Deve formatar a data corretamente ISO', () => {
        expect(FormatarData("2023-06-15T12:30:00Z")).toBe("15/06/2023 12:30");
    })
})
