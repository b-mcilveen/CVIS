import * as AST from '@CParser/CAst.ts'
import {BaseLiteral} from '@CVisual/components/expressions/literals/BaseLiteral.tsx'

export const CharLiteral = ({charAST}: { charAST: AST.CharLiteral }) => (
    <BaseLiteral
        value={`'${charAST.value}'`}
        type="char"
        valueClass="font-mono"
    />
);