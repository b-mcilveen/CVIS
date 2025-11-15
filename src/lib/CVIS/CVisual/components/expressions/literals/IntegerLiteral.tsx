import * as AST from '@CParser/CAst.ts'
import {BaseLiteral} from "@CVisual/components/expressions/literals/BaseLiteral.tsx";

export const IntegerLiteral = ({integerAST}: { integerAST: AST.IntegerLiteral }) => (
    <BaseLiteral
        value={integerAST.value}
        type="int"
        valueClass="font-mono"
    />
);
