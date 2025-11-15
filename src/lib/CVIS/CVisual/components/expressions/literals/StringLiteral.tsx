import * as AST from '@CParser/CAst.ts'
import {BaseLiteral} from "@CVisual/components/expressions/literals/BaseLiteral.tsx";

export const StringLiteral = ({stringAST}: { stringAST: AST.StringLiteral }) => (
    <BaseLiteral
        value={`"${stringAST.value}"`}
        type="string"
        valueClass="font-mono"
    />
);