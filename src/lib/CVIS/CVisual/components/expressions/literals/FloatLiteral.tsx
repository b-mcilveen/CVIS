import * as AST from '@CParser/CAst.ts'
import {BaseLiteral} from '@CVisual/components/expressions/literals/BaseLiteral.tsx'

export const FloatLiteral = ({floatAST}: { floatAST: AST.FloatLiteral }) => {
    const formatFloat = (value: number) => {
        const str = value.toString();
        return str.includes('.') ? str : str + '.0';
    };

    return (
        <BaseLiteral
            value={formatFloat(floatAST.value)}
            type="float"
            valueClass="font-mono"
        />
    );
};

