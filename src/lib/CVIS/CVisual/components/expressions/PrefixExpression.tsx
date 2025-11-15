import * as AST from '@CParser/CAst.ts'
import {renderExpression} from "@CVisual/components/expressions/renderExpression.tsx"

export const PrefixExpression: React.FC<{ prefixAST: AST.PrefixExpression }> = ({prefixAST}) => {
    return (
        <div className="inline-flex items-center gap-1 bg-white rounded-2xl px-3 py-2 shadow-sm">
            <span className="text-teal-600 font-mono font-bold">{prefixAST.operator}</span>
            <div className=" pl-2">
                {renderExpression(prefixAST.argument)}
            </div>
        </div>
    );
};