import * as AST from '@CParser/CAst.ts'
import {renderExpression} from "@CVisual/components/expressions/renderExpression.tsx";


export const BinaryExpression: React.FC<{ binaryAST: AST.BinaryExpression }> = ({binaryAST}) => {
    const operator = binaryAST.operator;

    return (
        <div className="inline-flex items-center gap-2 bg-white rounded-2xl px-3 py-2 shadow-sm">
            <div className="pr-2">
                {renderExpression(binaryAST.left)}
            </div>
            <span className="text-teal-600 font-mono font-bold">{operator}</span>
            <div className="pl-2">
                {renderExpression(binaryAST.right)}
            </div>
        </div>
    );
};