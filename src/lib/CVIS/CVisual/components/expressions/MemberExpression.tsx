import * as AST from '@CParser/CAst.ts'
import {renderExpression} from "@CVisual/components/expressions/renderExpression.tsx"

export const MemberExpression: React.FC<{ memberAST: AST.MemberExpression }> = ({memberAST}) => {
    return (
        <div className="inline-flex items-center gap-1 bg-white rounded-2xl px-3 py-2 shadow-sm">
            {renderExpression(memberAST.object)}
            <span className="text-teal-600 font-mono">
                {memberAST.isPointer ? '->' : '.'}
            </span>
            <span className="text-teal-600 font-mono">
                {memberAST.property.name}
            </span>
        </div>
    );
};