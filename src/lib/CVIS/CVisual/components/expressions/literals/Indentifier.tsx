import * as AST from '@CParser/CAst.ts'
import {BaseLiteral} from "@CVisual/components/expressions/literals/BaseLiteral.tsx";

export const Identifier = ({identifierAST}: {
    identifierAST: AST.Identifier
}) => (
    <BaseLiteral
        value={identifierAST.name}
        type="id"
        valueClass="font-mono"
    />
);