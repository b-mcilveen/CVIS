import {describe, it, expect} from 'vitest';
import {Parser} from "@CParser/CParser.ts";
import {Scanner} from "@CParser/CScanner.ts";
import * as AST from "@CParser/CAst.ts";
import {Token, TokenType} from "@CParser/CTokens.ts";

const anyLocation = {location: {line: expect.any(Number), column: expect.any(Number)}};

describe('Parsing Tests', () => {

    it('should ', () => {
        const input = 'int main () {  printf  (  "  Hello world\\n  "  )  ; return  0  ;  }';
        const scanner = new Scanner(input);
        const parser = new Parser(scanner);
        const ast = parser.parse();
        console.log(ast);
    });

    // Checks the parser construction occurs correctly
    describe('Constructor', () => {
        it('should initialise at the start with correct tokens', () => {
            const inputString = 'int main() { return 0; }';
            const scanner = new Scanner(inputString);
            const parser = new Parser(scanner);

            expect(parser).toBeDefined();

            // Filter out line and column numbers
            let tokensList: Token[] = parser.tokens.tokens;
            let reducedList: {
                type: TokenType,
                precedence: number,
                value?: string
            }[] = tokensList.map(({line, column, ...rest}) => rest);

            const expectedOutput = [
                {
                    type: TokenType.KEYWORD_INT,
                    precedence: 0,

                },
                {
                    type: TokenType.IDENTIFIER,
                    precedence: 15,
                    value: 'main'
                },
                {
                    type: TokenType.PUNCT_LPAREN,
                    "precedence": 15,


                },
                {
                    type: TokenType.PUNCT_RPAREN,
                    "precedence": 15,

                },
                {
                    type: TokenType.PUNCT_LBRACE,
                    "precedence": 0,

                },
                {
                    type: TokenType.KEYWORD_RETURN,
                    "precedence": 0,

                },
                {
                    type: TokenType.LITERAL_INTEGER,
                    value: '0',
                    "precedence": 15,
                },
                {
                    type: TokenType.PUNCT_SEMICOLON,
                    "precedence": 0,


                },
                {
                    type: TokenType.PUNCT_RBRACE,
                    "precedence": 0,


                },
                {
                    type: TokenType.EOF,
                    precedence: -1,
                }
            ];

            expect(reducedList).toEqual(expectedOutput);
        });
    });

    // Tests for each of the parse functions
    describe('Parse Functions', () => {
        describe('Literals and Identifier', () => {
            it('should parse int literals', () => {
                const inputString = '3;';
                const scanner = new Scanner(inputString);
                const parser = new Parser(scanner);

                const ast: AST.Statement = parser.parseStatement();

                const expectedOutput: AST.ExpressionStatement = {
                    type: 'ExpressionStatement',
                    expression: ({
                        type: 'IntegerLiteral',
                        value: 3,
                        ...anyLocation
                    } as AST.IntegerLiteral),
                    ...anyLocation
                }

                expect(ast).toEqual(expectedOutput);
            });

            it('should parse float literals', () => {
                const inputString = '3.0;';
                const scanner = new Scanner(inputString);
                const parser = new Parser(scanner);

                const ast: AST.Statement = parser.parseStatement();

                const expectedOutput: AST.ExpressionStatement = {
                    type: 'ExpressionStatement',
                    expression: ({
                        type: 'FloatLiteral',
                        value: 3.0,
                        ...anyLocation
                    } as AST.FloatLiteral),
                    ...anyLocation
                }

                expect(ast).toEqual(expectedOutput);
            });

            it('should parse string literals', () => {
                const inputString = '"Hello World";';
                const scanner = new Scanner(inputString);
                const parser = new Parser(scanner);

                const ast: AST.Statement = parser.parseStatement();

                const expectedOutput: AST.ExpressionStatement = {
                    type: 'ExpressionStatement',
                    expression: ({
                        type: 'StringLiteral',
                        value: 'Hello World',
                        ...anyLocation
                    } as AST.StringLiteral),
                    ...anyLocation
                }

                expect(ast).toEqual(expectedOutput);
            });

            it('should parse char literals', () => {
                const inputString = "'c';";
                const scanner = new Scanner(inputString);
                const parser = new Parser(scanner);

                const ast: AST.Statement = parser.parseStatement();

                const expectedOutput: AST.ExpressionStatement = {
                    type: 'ExpressionStatement',
                    expression: ({
                        type: 'CharLiteral',
                        value: 'c',
                        ...anyLocation
                    } as AST.CharLiteral),
                    ...anyLocation
                }

                expect(ast).toEqual(expectedOutput);
            });

            it('should parse an identifier', () => {
                const inputString = 'foo;';
                const scanner = new Scanner(inputString);
                const parser = new Parser(scanner);

                const ast: AST.Statement = parser.parseStatement();

                const expectedOutput: AST.ExpressionStatement = {
                    type: 'ExpressionStatement',
                    expression: ({
                        type: 'Identifier',
                        name: 'foo',
                        ...anyLocation
                    } as AST.Identifier),
                    ...anyLocation
                }

                expect(ast).toEqual(expectedOutput);
            });
        });

        describe('Expressions', () => {
            describe('Prefix Expressions', () => {
                it('should parse negatives', () => {
                    const inputString = '-3;';
                    const scanner = new Scanner(inputString);
                    const parser = new Parser(scanner);

                    const ast: AST.Statement = parser.parseStatement();

                    const expectedOutput: AST.ExpressionStatement = {
                        type: 'ExpressionStatement',
                        expression: ({
                            type: 'UnaryExpression',
                            operator: '-',
                            argument: {
                                type: 'IntegerLiteral',
                                value: 3,
                                ...anyLocation
                            },
                            ...anyLocation
                        } as AST.UnaryExpression),
                        ...anyLocation
                    }

                    expect(ast).toEqual(expectedOutput);

                });

                it('should parse increment', () => {
                    const inputString = '++foo;';
                    const scanner = new Scanner(inputString);
                    const parser = new Parser(scanner);

                    const ast: AST.Statement = parser.parseStatement();

                    const expectedOutput: AST.ExpressionStatement = {
                        type: 'ExpressionStatement',
                        expression: ({
                            type: 'PrefixExpression',
                            operator: '++',
                            argument: {
                                type: 'Identifier',
                                name: 'foo',
                                ...anyLocation
                            },
                            ...anyLocation
                        } as AST.PrefixExpression),
                        ...anyLocation
                    }

                    expect(ast).toEqual(expectedOutput);
                });

                it('should parse decrement', () => {
                    const inputString = '--foo;';
                    const scanner = new Scanner(inputString);
                    const parser = new Parser(scanner);

                    const ast: AST.Statement = parser.parseStatement();

                    const expectedOutput: AST.ExpressionStatement = {
                        type: 'ExpressionStatement',
                        expression: ({
                            type: 'PrefixExpression',
                            operator: '--',
                            argument: {
                                type: 'Identifier',
                                name: 'foo',
                                ...anyLocation
                            },
                            ...anyLocation
                        } as AST.PrefixExpression),
                        ...anyLocation
                    }

                    expect(ast).toEqual(expectedOutput);
                });

                it('should parse logical not', () => {
                    const inputString = '!foo;';
                    const scanner = new Scanner(inputString);
                    const parser = new Parser(scanner);

                    const ast: AST.Statement = parser.parseStatement();

                    const expectedOutput: AST.ExpressionStatement = {
                        type: 'ExpressionStatement',
                        expression: ({
                            type: 'UnaryExpression',
                            operator: '!',
                            argument: {
                                type: 'Identifier',
                                name: 'foo',
                                ...anyLocation
                            },
                            ...anyLocation
                        } as AST.UnaryExpression),
                        ...anyLocation
                    }

                    expect(ast).toEqual(expectedOutput);
                });

                it('should parse bitwise not', () => {
                    const inputString = '~foo;';
                    const scanner = new Scanner(inputString);
                    const parser = new Parser(scanner);

                    const ast: AST.Statement = parser.parseStatement();

                    const expectedOutput: AST.ExpressionStatement = {
                        type: 'ExpressionStatement',
                        expression: ({
                            type: 'UnaryExpression',
                            operator: '~',
                            argument: {
                                type: 'Identifier',
                                name: 'foo',
                                ...anyLocation
                            },
                            ...anyLocation
                        } as AST.UnaryExpression),
                        ...anyLocation
                    }

                    expect(ast).toEqual(expectedOutput);
                });

                it('should parse typecast', () => {
                    const inputString = '(int)foo;';
                    const scanner = new Scanner(inputString);
                    const parser = new Parser(scanner);

                    const ast: AST.Statement = parser.parseStatement();

                    const expectedOutput: AST.ExpressionStatement = {
                        type: 'ExpressionStatement',
                        expression: ({
                            type: 'CastExpression',
                            typeSpecifier: {
                                type: 'TypeSpecifier',
                                name: 'int',
                                ...anyLocation
                            },
                            expression: {
                                type: 'Identifier',
                                name: 'foo',
                                ...anyLocation
                            },
                            ...anyLocation
                        } as AST.CastExpression),
                        ...anyLocation
                    }

                    expect(ast).toEqual(expectedOutput);
                });
            });

            describe('Infix Expressions', () => {
                it('should parse binary expressions', () => {
                    const inputString = '1+2;';
                    const scanner = new Scanner(inputString);
                    const parser = new Parser(scanner);

                    const ast: AST.Statement = parser.parseStatement();

                    const expectedOutput: AST.ExpressionStatement = {
                        type: 'ExpressionStatement',
                        expression: ({
                            type: 'BinaryExpression',
                            operator: '+',
                            left: {
                                type: 'IntegerLiteral',
                                value: 1,
                                ...anyLocation
                            },
                            right: {
                                type: 'IntegerLiteral',
                                value: 2,
                                ...anyLocation
                            },
                            ...anyLocation
                        } as AST.BinaryExpression),
                        ...anyLocation
                    }

                    expect(ast).toEqual(expectedOutput);
                });

                it('should parse member access', () => {
                    const inputString = 'foo.bar;';
                    const scanner = new Scanner(inputString);
                    const parser = new Parser(scanner);

                    const ast: AST.Statement = parser.parseStatement();

                    const expectedOutput: AST.ExpressionStatement = {
                        type: 'ExpressionStatement',
                        expression: ({
                            type: 'MemberExpression',
                            isPointer: false,
                            object: {
                                type: 'Identifier',
                                name: 'foo',
                                ...anyLocation
                            },
                            property: {
                                type: 'Identifier',
                                name: 'bar',
                                ...anyLocation
                            },
                            ...anyLocation
                        } as AST.MemberExpression),
                        ...anyLocation
                    }

                    expect(ast).toEqual(expectedOutput);
                });

                it('should parse member access as pointer', () => {
                    const inputString = 'foo->bar;';
                    const scanner = new Scanner(inputString);
                    const parser = new Parser(scanner);

                    const ast: AST.Statement = parser.parseStatement();

                    const expectedOutput: AST.ExpressionStatement = {
                        type: 'ExpressionStatement',
                        expression: ({
                            type: 'MemberExpression',
                            isPointer: true,
                            object: {
                                type: 'Identifier',
                                name: 'foo',
                                ...anyLocation
                            },
                            property: {
                                type: 'Identifier',
                                name: 'bar',
                                ...anyLocation
                            },
                            ...anyLocation
                        } as AST.MemberExpression),
                        ...anyLocation
                    }

                    expect(ast).toEqual(expectedOutput);
                });

                it('should parse binary expressions with precedence', () => {
                    const inputString = '1+2*3;';
                    const scanner = new Scanner(inputString);
                    const parser = new Parser(scanner);

                    const ast: AST.Statement = parser.parseStatement();

                    const expectedOutput: AST.ExpressionStatement = {
                        type: 'ExpressionStatement',
                        expression: ({
                            type: 'BinaryExpression',
                            operator: '+',
                            left: {
                                type: 'IntegerLiteral',
                                value: 1,
                                ...anyLocation
                            },
                            right: {
                                type: 'BinaryExpression',
                                operator: '*',
                                left: {
                                    type: 'IntegerLiteral',
                                    value: 2,
                                    ...anyLocation
                                },
                                right: {
                                    type: 'IntegerLiteral',
                                    value: 3,
                                    ...anyLocation
                                },
                                ...anyLocation
                            },
                            ...anyLocation
                        } as AST.BinaryExpression),
                        ...anyLocation
                    }

                    expect(ast).toEqual(expectedOutput);
                });

                it('should parse binary expressions with parenthesis precedence', () => {
                    const inputString = '(1+2)*3;';
                    const scanner = new Scanner(inputString);
                    const parser = new Parser(scanner);

                    const ast: AST.Statement = parser.parseStatement();

                    const expectedOutput: AST.ExpressionStatement = {
                        type: 'ExpressionStatement',
                        expression: ({
                            type: 'BinaryExpression',
                            operator: '*',
                            left: {
                                type: 'BinaryExpression',
                                operator: '+',
                                left: {
                                    type: 'IntegerLiteral',
                                    value: 1,
                                    ...anyLocation
                                },
                                right: {
                                    type: 'IntegerLiteral',
                                    value: 2,
                                    ...anyLocation
                                },
                                ...anyLocation

                            },
                            right: {
                                type: 'IntegerLiteral',
                                value: 3,
                                ...anyLocation
                            },
                            ...anyLocation
                        } as AST.BinaryExpression),
                        ...anyLocation
                    }

                    expect(ast).toEqual(expectedOutput);
                });
            });

            describe('Postfix Expressions', () => {
                it('should parse increment', () => {
                    const inputString = 'foo++;';
                    const scanner = new Scanner(inputString);
                    const parser = new Parser(scanner);

                    const ast: AST.Statement = parser.parseStatement();

                    const expectedOutput: AST.ExpressionStatement = {
                        type: 'ExpressionStatement',
                        expression: ({
                            type: 'PostfixExpression',
                            operator: '++',
                            argument: {
                                type: 'Identifier',
                                name: 'foo',
                                ...anyLocation
                            },
                            ...anyLocation
                        } as AST.PostfixExpression),
                        ...anyLocation
                    }

                    expect(ast).toEqual(expectedOutput);
                });

                it('should parse decrement', () => {
                    const inputString = 'foo--;';
                    const scanner = new Scanner(inputString);
                    const parser = new Parser(scanner);

                    const ast: AST.Statement = parser.parseStatement();

                    const expectedOutput: AST.ExpressionStatement = {
                        type: 'ExpressionStatement',
                        expression: ({
                            type: 'PostfixExpression',
                            operator: '--',
                            argument: {
                                type: 'Identifier',
                                name: 'foo',
                                ...anyLocation
                            },
                            ...anyLocation
                        } as AST.PostfixExpression),
                        ...anyLocation
                    }

                    expect(ast).toEqual(expectedOutput);
                });

                it('should parse function calls', () => {
                    const inputString = 'foo();';
                    const scanner = new Scanner(inputString);
                    const parser = new Parser(scanner);

                    const ast: AST.Statement = parser.parseStatement();

                    const expectedOutput: AST.ExpressionStatement = {
                        type: 'ExpressionStatement',
                        expression: ({
                            type: 'FunctionCall',
                            functionIdentity: {
                                type: 'Identifier',
                                name: 'foo',
                                ...anyLocation
                            },
                            arguments: [],
                            ...anyLocation
                        } as AST.FunctionCall),
                        ...anyLocation
                    }

                    expect(ast).toEqual(expectedOutput);

                });

                it('should parse function calls with arguments', () => {
                    const inputString = 'foo(1,2);';
                    const scanner = new Scanner(inputString);
                    const parser = new Parser(scanner);

                    const ast: AST.Statement = parser.parseStatement();

                    const expectedOutput: AST.ExpressionStatement = {
                        type: 'ExpressionStatement',
                        expression: ({
                            type: 'FunctionCall',
                            functionIdentity: {
                                type: 'Identifier',
                                name: 'foo',
                                ...anyLocation
                            },
                            arguments: [
                                ({
                                    type: 'IntegerLiteral',
                                    value: 1,
                                    ...anyLocation
                                } as AST.IntegerLiteral),
                                ({
                                    type: 'IntegerLiteral',
                                    value: 2,
                                    ...anyLocation
                                } as AST.IntegerLiteral)
                            ],
                            ...anyLocation
                        } as AST.FunctionCall),
                        ...anyLocation
                    }

                    expect(ast).toEqual(expectedOutput);

                });

                it('should parse array subscript', () => {
                    const inputString = 'foo[1];';
                    const scanner = new Scanner(inputString);
                    const parser = new Parser(scanner);

                    const ast: AST.Statement = parser.parseStatement();

                    const expectedOutput: AST.ExpressionStatement = {
                        type: 'ExpressionStatement',
                        expression: ({
                            type: 'ArrayExpression',
                            array: {
                                type: 'Identifier',
                                name: 'foo',
                                ...anyLocation
                            },
                            index: {
                                type: 'IntegerLiteral',
                                value: 1,
                                ...anyLocation
                            },
                            ...anyLocation
                        } as AST.ArrayExpression),
                        ...anyLocation
                    }

                    expect(ast).toEqual(expectedOutput);

                });
            });

        });

        describe('Statements', () => {
            it('should parse if statements', () => {
                const inputString = 'if (1) { return 0; }';
                const scanner = new Scanner(inputString);
                const parser = new Parser(scanner);

                const ast: AST.Statement = parser.parseStatement();

                const expectedOutput: AST.IfStatement = ({
                    type: 'IfStatement',
                    condition: {
                        type: 'IntegerLiteral',
                        value: 1,
                        ...anyLocation
                    },
                    consequent: {
                        type: 'CompoundStatement',
                        localDeclarations: [],
                        body: [
                            {
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'IntegerLiteral',
                                    value: 0,
                                    ...anyLocation
                                },
                                ...anyLocation
                            }
                        ],
                        ...anyLocation
                    },
                    alternate: undefined,
                    ...anyLocation
                } as AST.IfStatement);


                expect(ast).toEqual(expectedOutput);

            });

            it('should parse while statements', () => {
                const inputString = 'while (1) { break; }';
                const scanner = new Scanner(inputString);
                const parser = new Parser(scanner);

                const ast: AST.Statement = parser.parseStatement();

                const expectedOutput: AST.WhileStatement = ({
                    type: 'WhileStatement',
                    condition: {
                        type: 'IntegerLiteral',
                        value: 1,
                        ...anyLocation
                    },
                    body: {
                        type: 'CompoundStatement',
                        localDeclarations: [],
                        body: [
                            {
                                type: 'BreakStatement',
                                ...anyLocation
                            }
                        ],
                        ...anyLocation
                    },
                    ...anyLocation
                } as AST.WhileStatement);

                expect(ast).toEqual(expectedOutput);
            });

            it('should parse do while statements', () => {
                const inputString = 'do { break; } while (1);';
                const scanner = new Scanner(inputString);
                const parser = new Parser(scanner);

                const ast: AST.Statement = parser.parseStatement();

                const expectedOutput: AST.DoWhileStatement = ({
                    type: 'DoWhileStatement',
                    condition: {
                        type: 'IntegerLiteral',
                        value: 1,
                        ...anyLocation
                    },
                    body: {
                        type: 'CompoundStatement',
                        localDeclarations: [],
                        body: [
                            {
                                type: 'BreakStatement',
                                ...anyLocation
                            }
                        ],
                        ...anyLocation
                    },
                    ...anyLocation
                } as AST.DoWhileStatement);

                expect(ast).toEqual(expectedOutput);
            });

            it('should parse for statements', () => {
                const inputString = 'for(i = 0; i < 1; i++){ continue; };';
                const scanner = new Scanner(inputString);
                const parser = new Parser(scanner);

                const ast: AST.Statement = parser.parseStatement();

                const expectedOutput: AST.ForStatement = ({
                    type: 'ForStatement',
                    init: {
                        type: 'BinaryExpression',
                        operator: '=',
                        left: {
                            type: 'Identifier',
                            name: 'i',
                            ...anyLocation
                        },
                        right: {
                            type: 'IntegerLiteral',
                            value: 0,
                            ...anyLocation
                        },
                        ...anyLocation

                    },
                    test: {
                        type: 'BinaryExpression',
                        operator: '<',
                        left: {
                            type: 'Identifier',
                            name: 'i',
                            ...anyLocation
                        },
                        right: {
                            type: 'IntegerLiteral',
                            value: 1,
                            ...anyLocation
                        },
                        ...anyLocation
                    },
                    update: {
                        type: 'PostfixExpression',
                        operator: '++',
                        argument: {
                            type: 'Identifier',
                            name: 'i',
                            ...anyLocation
                        },
                        ...anyLocation
                    },
                    body: {
                        type: 'CompoundStatement',
                        localDeclarations: [],
                        body: [
                            {
                                type: 'ContinueStatement',
                                ...anyLocation
                            }
                        ],
                        ...anyLocation
                    },
                    ...anyLocation
                } as AST.ForStatement);

                expect(ast).toEqual(expectedOutput);
            });

            it('should parse switch/case statements', () => {
                const inputString = 'switch(1){ case 0: return 0; default: return 1; }';
                const scanner = new Scanner(inputString);
                const parser = new Parser(scanner);

                const ast: AST.Statement = parser.parseStatement();

                const expectedOutput: AST.SwitchStatement = ({
                    type: 'SwitchStatement',
                    expression: {
                        type: 'IntegerLiteral',
                        value: 1,
                        ...anyLocation
                    },
                    body: {
                        type: "CompoundStatement",
                        localDeclarations: [],
                        body: [
                            {
                                type: 'CaseStatement',
                                test: {
                                    type: 'IntegerLiteral',
                                    value: 0,
                                    ...anyLocation
                                },
                                consequent: {
                                    type: "CompoundStatement",
                                    localDeclarations: [],
                                    body: [
                                        {
                                            type: 'ReturnStatement',
                                            argument: {
                                                type: 'IntegerLiteral',
                                                value: 0,
                                                ...anyLocation
                                            },
                                            ...anyLocation
                                        }
                                    ],
                                    ...anyLocation

                                },
                                ...anyLocation
                            },
                            {
                                type: 'DefaultStatement',
                                consequent: {
                                    type: "CompoundStatement",
                                    localDeclarations: [],
                                    body: [{
                                        type: 'ReturnStatement',
                                        argument: {
                                            type: 'IntegerLiteral',
                                            value: 1,
                                            ...anyLocation
                                        },
                                        ...anyLocation
                                    }],
                                    ...anyLocation
                                },
                                ...anyLocation
                            }],
                        ...anyLocation

                    },
                    ...anyLocation
                } as AST.SwitchStatement);

                expect(ast).toEqual(expectedOutput);
            });
        });

        describe('Declarations', () => {
            it('should parse variable declarations', () => {
                const inputString = 'int a = 3;';
                const scanner = new Scanner(inputString);
                const parser = new Parser(scanner);

                const ast: AST.Statement = parser.parseDeclaration();

                const expectedOutput: AST.VariableDeclaration = ({
                    type: 'VariableDeclaration',
                    declarators: [
                        ({
                            type: 'VariableDeclarator',
                            id: {
                                type: 'Identifier',
                                name: 'a',
                                ...anyLocation
                            },
                            init: {
                                type: 'IntegerLiteral',
                                value: 3,
                                ...anyLocation
                            },
                            typeSpecifier: {
                                type: 'TypeSpecifier',
                                name: 'int',
                                pointerLevel: 0,
                                ...anyLocation
                            },
                            ...anyLocation
                        } as AST.VariableDeclarator),
                    ],
                    ...anyLocation
                } as AST.VariableDeclaration);

                expect(ast).toEqual(expectedOutput);
            });

            it('should parser array declaration', () => {
                const inputString = 'int a[5] = {1,2,3,4,5};';
                const scanner = new Scanner(inputString);
                const parser = new Parser(scanner);

                const ast: AST.Statement = parser.parseDeclaration();

                const expectedOutput: AST.VariableDeclaration = ({
                    type: 'VariableDeclaration',
                    declarators: [
                        ({
                            type: 'VariableDeclarator',
                            id: {
                                type: 'Identifier',
                                name: 'a',
                                ...anyLocation
                            },
                            init: ({
                                type: 'ArrayInitializer',
                                values: [
                                    ({
                                        type: 'IntegerLiteral',
                                        value: 1,
                                        ...anyLocation
                                    } as AST.IntegerLiteral),
                                    ({
                                        type: 'IntegerLiteral',
                                        value: 2,
                                        ...anyLocation
                                    } as AST.IntegerLiteral),
                                    ({
                                        type: 'IntegerLiteral',
                                        value: 3,
                                        ...anyLocation
                                    } as AST.IntegerLiteral),
                                    ({
                                        type: 'IntegerLiteral',
                                        value: 4,
                                        ...anyLocation
                                    } as AST.IntegerLiteral),
                                    ({
                                        type: 'IntegerLiteral',
                                        value: 5,
                                        ...anyLocation
                                    } as AST.IntegerLiteral)
                                ],
                                ...anyLocation
                            } as AST.ArrayInitializer),
                            arrayDimensions: [5],
                            typeSpecifier: {
                                type: 'TypeSpecifier',
                                name: 'int',
                                pointerLevel: 0,
                                ...anyLocation
                            },
                            ...anyLocation
                        } as AST.VariableDeclarator),
                    ],
                    ...anyLocation
                } as AST.VariableDeclaration);

                expect(ast).toEqual(expectedOutput);

            });

            it('should parse variable pointer declarations', () => {
                const inputString = 'int *a = 3;';
                const scanner = new Scanner(inputString);
                const parser = new Parser(scanner);

                const ast: AST.Statement = parser.parseDeclaration();

                const expectedOutput: AST.VariableDeclaration = ({
                    type: 'VariableDeclaration',
                    declarators: [
                        ({
                            type: 'VariableDeclarator',
                            id: {
                                type: 'Identifier',
                                name: 'a',
                                ...anyLocation
                            },
                            init: {
                                type: 'IntegerLiteral',
                                value: 3,
                                ...anyLocation
                            },
                            typeSpecifier: {
                                type: 'TypeSpecifier',
                                name: 'int',
                                pointerLevel: 1,
                                ...anyLocation
                            },
                            ...anyLocation
                        } as AST.VariableDeclarator),
                    ],
                    ...anyLocation
                } as AST.VariableDeclaration);

                expect(ast).toEqual(expectedOutput);
            });

            it('should parse multi variable declarations', () => {
                const inputString = 'int a = 1, b, c = 2;';
                const scanner = new Scanner(inputString);
                const parser = new Parser(scanner);

                const ast: AST.Statement = parser.parseDeclaration();

                const expectedOutput: AST.VariableDeclaration = ({
                    type: 'VariableDeclaration',
                    declarators: [
                        ({
                            type: 'VariableDeclarator',
                            id: {
                                type: 'Identifier',
                                name: 'a',
                                ...anyLocation
                            },
                            init: {
                                type: 'IntegerLiteral',
                                value: 1,
                                ...anyLocation
                            },
                            typeSpecifier: {
                                type: 'TypeSpecifier',
                                name: 'int',
                                pointerLevel: 0,
                                ...anyLocation
                            },
                            ...anyLocation
                        } as AST.VariableDeclarator),
                        ({
                            type: 'VariableDeclarator',
                            id: {
                                type: 'Identifier',
                                name: 'b',
                                ...anyLocation
                            },
                            typeSpecifier: {
                                type: 'TypeSpecifier',
                                name: 'int',
                                pointerLevel: 0,
                                ...anyLocation
                            },
                            ...anyLocation
                        } as AST.VariableDeclarator),
                        ({
                            type: 'VariableDeclarator',
                            id: {
                                type: 'Identifier',
                                name: 'c',
                                ...anyLocation
                            },
                            init: {
                                type: 'IntegerLiteral',
                                value: 2,
                                ...anyLocation
                            },
                            typeSpecifier: {
                                type: 'TypeSpecifier',
                                name: 'int',
                                pointerLevel: 0,
                                ...anyLocation
                            },
                            ...anyLocation
                        } as AST.VariableDeclarator),
                    ],
                    ...anyLocation
                } as AST.VariableDeclaration);

                expect(ast).toEqual(expectedOutput);
            });

            it('should parse function declarations', () => {
                const inputString = 'int foo() { return 0; }';
                const scanner = new Scanner(inputString);
                const parser = new Parser(scanner);

                const ast: AST.Statement = parser.parseDeclaration();

                const expectedOutput: AST.FunctionDeclaration = ({
                    type: 'FunctionDeclaration',
                    typeSpecifier: {
                        type: 'TypeSpecifier',
                        name: 'int',
                        pointerLevel: 0,
                        ...anyLocation
                    },
                    id: {
                        type: 'Identifier',
                        name: 'foo',
                        ...anyLocation
                    },
                    parameters: [],
                    body: {
                        type: 'CompoundStatement',
                        localDeclarations: [],
                        body: [
                            {
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'IntegerLiteral',
                                    value: 0,
                                    ...anyLocation
                                },
                                ...anyLocation
                            }
                        ],
                        ...anyLocation
                    },
                    ...anyLocation
                } as AST.FunctionDeclaration);

                expect(ast).toEqual(expectedOutput);
            });

            it('should parse struct declarations', () => {
                const inputString = 'struct foo { int a; };';
                const scanner = new Scanner(inputString);
                const parser = new Parser(scanner);

                const ast: AST.Statement = parser.parseDeclaration();

                const expectedOutput: AST.StructDeclaration = ({
                    type: 'StructDeclaration',
                    id: {
                        type: 'Identifier',
                        name: 'foo',
                        ...anyLocation
                    },
                    typeSpecifier: {
                        type: 'TypeSpecifier',
                        name: 'struct',
                        ...anyLocation
                    },
                    fields: [
                        ({
                            type: "VariableDeclaration",
                            declarators: [({
                                type: 'VariableDeclarator',
                                id: {
                                    type: 'Identifier',
                                    name: 'a',
                                    ...anyLocation
                                },
                                typeSpecifier: {
                                    type: 'TypeSpecifier',
                                    name: 'int',
                                    pointerLevel: 0,
                                    ...anyLocation
                                },
                                ...anyLocation
                            } as AST.VariableDeclarator)],
                            ...anyLocation
                        } as AST.VariableDeclaration)
                    ],
                    ...anyLocation
                } as AST.StructDeclaration);

                expect(ast).toEqual(expectedOutput);
            })

            it('should parse enum declarations', () => {
                const inputString = 'enum foo { a, b };';
                const scanner = new Scanner(inputString);
                const parser = new Parser(scanner);

                const ast: AST.Statement = parser.parseDeclaration();

                const expectedOutput: AST.EnumDeclaration = ({
                    type: "EnumDeclaration",
                    typeSpecifier: {
                        type: 'TypeSpecifier',
                        name: 'enum',
                        ...anyLocation
                    },
                    id: {
                        type: 'Identifier',
                        name: 'foo',
                        ...anyLocation
                    },
                    body: [
                        {
                            type: 'Identifier',
                            name: 'a',
                            ...anyLocation
                        },
                        {
                            type: 'Identifier',
                            name: 'b',
                            ...anyLocation
                        }
                    ],
                    ...anyLocation
                } as AST.EnumDeclaration);

                expect(ast).toEqual(expectedOutput);
            })

            it('should parse typedef declarations', () => {
                const inputString = 'typedef int foo;';
                const scanner = new Scanner(inputString);
                const parser = new Parser(scanner);

                const ast: AST.Statement = parser.parseDeclaration();

                const expectedOutput: AST.TypedefDeclaration = ({
                    type: 'TypedefDeclaration',
                    typeSpecifier: {
                        type: 'TypeSpecifier',
                        name: 'int',
                        ...anyLocation
                    },
                    id: {
                        type: 'Identifier',
                        name: 'foo',
                        ...anyLocation
                    },
                    ...anyLocation
                } as AST.TypedefDeclaration);

                expect(ast).toEqual(expectedOutput);
            })

            it('should parse union declarations', () => {
                const inputString = 'union foo { int a; };';
                const scanner = new Scanner(inputString);
                const parser = new Parser(scanner);

                const ast: AST.Statement = parser.parseDeclaration();

                const expectedOutput: AST.UnionDeclaration = ({
                    type: 'UnionDeclaration',
                    id: {
                        type: 'Identifier',
                        name: 'foo',
                        ...anyLocation
                    },
                    typeSpecifier: {
                        type: 'TypeSpecifier',
                        isUnion: true,
                        name: 'union',
                        ...anyLocation
                    },
                    body: [
                        ({
                            type: "VariableDeclaration",
                            declarators: [({
                                type: 'VariableDeclarator',
                                id: {
                                    type: 'Identifier',
                                    name: 'a',
                                    ...anyLocation
                                },
                                typeSpecifier: {
                                    type: 'TypeSpecifier',
                                    name: 'int',
                                    pointerLevel: 0,
                                    ...anyLocation
                                },
                                ...anyLocation
                            } as AST.VariableDeclarator)],
                            ...anyLocation
                        } as AST.VariableDeclaration)
                    ],
                    ...anyLocation
                } as AST.UnionDeclaration);

                expect(ast).toEqual(expectedOutput);

            });
        });
    });

    // Tests for type specifier modifiers
    describe('Parser type specifier', () => {
        it('should parse basic types', () => {
            const inputString = 'int a;';
            const scanner = new Scanner(inputString);
            const parser = new Parser(scanner);

            const ast: AST.Statement = parser.parseDeclaration();

            const expectedOutput: AST.VariableDeclaration = ({
                type: 'VariableDeclaration',
                declarators: [
                    ({
                        type: 'VariableDeclarator',
                        id: {
                            type: 'Identifier',
                            name: 'a',
                            ...anyLocation
                        },
                        typeSpecifier: {
                            type: 'TypeSpecifier',
                            name: 'int',
                            pointerLevel: 0,
                            ...anyLocation
                        },
                        ...anyLocation
                    } as AST.VariableDeclarator),
                ],
                ...anyLocation
            } as AST.VariableDeclaration);

            expect(ast).toEqual(expectedOutput);
        });

        it('should parse modified types', () => {
            const inputString = 'const long int a;';
            const scanner = new Scanner(inputString);
            const parser = new Parser(scanner);

            const ast: AST.Statement = parser.parseDeclaration();

            const expectedOutput: AST.VariableDeclaration = ({
                type: 'VariableDeclaration',
                declarators: [
                    ({
                        type: 'VariableDeclarator',
                        id: {
                            type: 'Identifier',
                            name: 'a',
                            ...anyLocation
                        },
                        typeSpecifier: {
                            type: 'TypeSpecifier',
                            name: 'int',
                            pointerLevel: 0,
                            isConst: true,
                            isLong: true,
                            ...anyLocation
                        },
                        ...anyLocation
                    } as AST.VariableDeclarator),
                ],
                ...anyLocation
            } as AST.VariableDeclaration);

            expect(ast).toEqual(expectedOutput);
        })
    });

    // Tests for basic error throwing
    describe('Parser Errors', () => {
        it('should throw an error on unexpected tokens', () => {
            const inputString = 'int a = 3 +;';
            const scanner = new Scanner(inputString);
            const parser = new Parser(scanner);

            expect(() => parser.parseStatement()).toThrowError();
        });

        it('should throw an error on unexpected end of input', () => {
            const inputString = 'int a = 3';
            const scanner = new Scanner(inputString);
            const parser = new Parser(scanner);

            expect(() => parser.parseStatement()).toThrowError();
        });

        it('should throw an error on unexpected end of input in opened block statement', () => {
            const inputString = 'int foo() {';
            const scanner = new Scanner(inputString);
            const parser = new Parser(scanner);

            expect(() => parser.parseStatement()).toThrowError();
        });

    });

});