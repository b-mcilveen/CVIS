import * as AST from '@CParser/CAst.ts';

import {BooleanLiteral} from '@CVisual/components/expressions/literals/BooleanLiteral.tsx'
import {CharLiteral} from '@CVisual/components/expressions/literals/CharacterLiteral.tsx'
import {FloatLiteral} from '@CVisual/components/expressions/literals/FloatLiteral.tsx'
import {IntegerLiteral} from '@CVisual/components/expressions/literals/IntegerLiteral.tsx'
import {StringLiteral} from '@CVisual/components/expressions/literals/StringLiteral.tsx'
import {UnaryExpression} from '@CVisual/components/expressions/UnaryExpression.tsx'
import {BinaryExpression} from '@CVisual/components/expressions/BinaryExpression.tsx'
import {PostfixExpression} from '@CVisual/components/expressions/PostfixExpression.tsx'

export const renderExpression = (expression: AST.Expression) => {
    switch (expression.type) {
        case 'BooleanLiteral':
            return <BooleanLiteral boolAST={expression as AST.BooleanLiteral}/>;
        case 'CharLiteral':
            return <CharLiteral charAST={expression as AST.CharLiteral}/>;
        case 'FloatLiteral':
            return <FloatLiteral floatAST={expression as AST.FloatLiteral}/>;
        case 'IntegerLiteral':
            return <IntegerLiteral integerAST={expression as AST.IntegerLiteral} base={10}/>;
        case 'StringLiteral':
            return <StringLiteral stringAST={expression as AST.StringLiteral}/>;
        case 'UnaryExpression':
            return <UnaryExpression unaryAST={expression as AST.UnaryExpression}/>;
        case 'BinaryExpression':
            return <BinaryExpression binaryAST={expression as AST.BinaryExpression}/>;
        case 'PostfixExpression':
            return <PostfixExpression postfixAST={expression as AST.PostfixExpression}/>;
        default:
            return <div className="text-red-500">Unsupported expression type: {expression.type}</div>;
    }
};