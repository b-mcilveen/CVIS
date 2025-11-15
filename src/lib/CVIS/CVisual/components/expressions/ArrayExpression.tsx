import * as AST from '@CParser/CAst.ts'
import {renderExpression} from "@CVisual/components/expressions/renderExpression.tsx"

export const ArrayExpression: React.FC<{ arrayAST: AST.ArrayExpression }> = ({arrayAST}) => {
    return (
        <div className="inline-flex items-center gap-1 bg-white rounded-2xl px-3 py-2 shadow-sm">
            {renderExpression(arrayAST.array)}
            <span className="text-teal-600 font-mono">[</span>
            {renderExpression(arrayAST.index)}
            <span className="text-teal-600 font-mono">]</span>
        </div>
    );
};