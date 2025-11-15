import * as AST from '@CParser/CAst.ts'
import {BaseLiteral} from "@CVisual/components/expressions/literals/BaseLiteral.tsx";

export const BooleanLiteral = ({boolAST}: { boolAST: AST.BooleanLiteral }) => (
    <BaseLiteral
        value={boolAST.value ? 'true' : 'false'}
        type="bool"
        valueClass={`px-1 rounded ${
            boolAST.value ? 'text-green-600' : 'text-red-600'
        }`}
    />
);
