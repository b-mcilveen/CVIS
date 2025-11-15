import {IntegerLiteral} from "@CVIS/CVisual/components/expressions/literals/IntegerLiteral.tsx";
import {StringLiteral} from "@CVIS/CVisual/components/expressions/literals/StringLiteral.tsx";
import {CharLiteral} from "@CVIS/CVisual/components/expressions/literals/CharacterLiteral.tsx";
import {BooleanLiteral} from "@CVIS/CVisual/components/expressions/literals/BooleanLiteral.tsx";
import * as AST from '@CVIS/CParser/CAst'
import {FloatLiteral} from "@CVIS/CVisual/components/expressions/literals/FloatLiteral.tsx";
import {UnaryExpression} from "@CVIS/CVisual/components/expressions/UnaryExpression.tsx";
import {BinaryExpression} from "@CVIS/CVisual/components/expressions/BinaryExpression.tsx";
import {PostfixExpression} from "@CVIS/CVisual/components/expressions/PostfixExpression.tsx";
import {PrefixExpression} from "@CVIS/CVisual/components/expressions/PrefixExpression.tsx";
import {MemberExpression} from "@CVIS/CVisual/components/expressions/MemberExpression.tsx";
import {ArrayExpression} from "@CVIS/CVisual/components/expressions/ArrayExpression.tsx";
import {Identifier} from "@CVIS/CVisual/components/expressions/literals/Indentifier.tsx";

const test_int: AST.IntegerLiteral = {
    type: "IntegerLiteral",
    value: 42,
}

const test_string: AST.StringLiteral = {
    type: "StringLiteral",
    value: "Hello, World!",
}

const test_indentifier: AST.Identifier = {
    type: "Identifier",
    name: "x",
}

const test_char: AST.CharLiteral = {
    type: "CharLiteral",
    value: "a",
}

const test_bool: AST.BooleanLiteral = {
    type: "BooleanLiteral",
    value: true,
}

const test_float: AST.FloatLiteral = {
    type: "FloatLiteral",
    value: 3.14,
}
const test_array: AST.ArrayExpression = {
    type: "ArrayExpression",
    array: test_int,
    index: test_int,
}

const test_unary: AST.UnaryExpression = {
    type: "UnaryExpression",
    operator: "-",
    argument: test_int,
}

const test_binary: AST.BinaryExpression = {
    type: "BinaryExpression",
    operator: "+",
    left: test_int,
    right: test_int,
}

const test_postfix: AST.PostfixExpression = {
    type: "PostfixExpression",
    operator: "++",
    argument: test_int,
}

const test_prefix: AST.PrefixExpression = {
    type: "PrefixExpression",
    operator: "++",
    argument: test_int,
}

const test_member_expression: AST.MemberExpression = {
    type: "MemberExpression",
    object: test_int,
    property: test_indentifier,
}

function VisualPlayground() {
    return (
        <div>
            <h1 className="text-2xl font-semibold">Visual Playground</h1>
            <br/>
            <h2 className={"text-lg font-semibold"}>Number</h2>
            <IntegerLiteral integerAST={test_int}/>

            <h2 className={"text-lg font-semibold"}>String</h2>
            <StringLiteral stringAST={test_string}/>

            <h2 className={"text-lg font-semibold"}>Character</h2>
            <CharLiteral charAST={test_char}/>

            <h2 className={"text-lg font-semibold"}>Boolean</h2>
            <BooleanLiteral boolAST={test_bool}/>

            <h2 className={"text-lg font-semibold"}>Float</h2>
            <FloatLiteral floatAST={test_float}/>

            <h2 className={"text-lg font-semibold"}>Identifier</h2>
            <Identifier identifierAST={test_indentifier}/>

            <h2 className={"text-lg font-semibold"}>Unary Expression</h2>
            <UnaryExpression unaryAST={test_unary}/>

            <h2 className={"text-lg font-semibold"}>Binary Expression</h2>
            <BinaryExpression binaryAST={test_binary}/>

            <h2 className={"text-lg font-semibold"}>Postfix Expression</h2>
            <PostfixExpression postfixAST={test_postfix}/>

            <h2 className={"text-lg font-semibold"}>Prefix Expression</h2>
            <PrefixExpression prefixAST={test_prefix}/>

            <h2 className={"text-lg font-semibold"}>Member Expression</h2>
            <MemberExpression memberAST={test_member_expression}/>

            <h2 className={"text-lg font-semibold"}>Array Expression</h2>
            <ArrayExpression arrayAST={test_array}/>


        </div>
    );
}

export default VisualPlayground;