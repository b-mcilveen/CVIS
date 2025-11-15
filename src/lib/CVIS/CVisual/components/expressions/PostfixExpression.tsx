import * as AST from '@CParser/CAst.ts'
import {renderExpression} from "@CVisual/components/expressions/renderExpression.tsx";


export const PostfixExpression: React.FC<{ postfixAST: AST.PostfixExpression }> = ({postfixAST}) => {
    const operator = postfixAST.operator;

    return (
        <div className="inline-flex items-center gap-1 bg-white rounded-2xl px-3 py-2 shadow-sm">
            <div className="pr-2">
                {renderExpression(postfixAST.argument)}
            </div>
            <span className="text-teal-600 font-mono font-bold">{operator}</span>
        </div>
    );
};