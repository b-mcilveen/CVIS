import {describe, it, expect} from 'vitest';
import {Scanner} from '@lib/CVIS/CParser/CScanner.ts';
import {Token, TokenType} from "@CVIS/CParser/CTokens.ts";

describe('Basic Scanner Tests', () => {
    
    describe('Constructor', () => {
        it('should initialise at the start', () => {
            const inputString = 'a';
            const scanner = new Scanner(inputString);

            expect(scanner).toBeDefined();
            expect(scanner.currentChar).toBe('a');
            expect(scanner.position).toBe(0);
            expect(scanner.line).toBe(1);
            expect(scanner.column).toBe(1);

        });
    });

    describe('Move', () => {
        it('should read the next character via move', () => {
            const inputString = 'ab';
            const scanner = new Scanner(inputString);

            expect(scanner.currentChar).toBe('a');
            scanner.move();
            expect(scanner.currentChar).toBe('b');
        });
        it('should stop at the end of the string', () => {
            const inputString = 'a';
            const scanner = new Scanner(inputString);

            expect(scanner.currentChar).toBe('a');
            scanner.move();
            expect(scanner.currentChar).toBe('');
            scanner.move();
            expect(scanner.currentChar).toBe('');
        });
    });

    describe('ScanAhead', () => {
        it('should scan ahead with not argument', () => {
            const inputString = 'abc';
            const scanner = new Scanner(inputString);

            expect(scanner.currentChar).toBe('a');
            const scannedNoArg: string = scanner.scanAhead();
            expect(scannedNoArg).toBe('b');
        });

        it('should scan ahead given an argument', () => {
            const inputString = 'abc';
            const scanner = new Scanner(inputString);

            expect(scanner.currentChar).toBe('a');
            const scanned: string = scanner.scanAhead(2);
            expect(scanned).toBe('c');
        });

        it('should should scan ahead and stop if end', () => {
            const inputString = 'a';
            const scanner = new Scanner(inputString);

            expect(scanner.currentChar).toBe('a');
            const scanned: string = scanner.scanAhead(2);
            expect(scanned).toBe('');
        });
    });

    describe('SkipWhiteSpace', () => {
        it('should skip single comments', () => {
            const inputString = '// comment\na';
            const scanner = new Scanner(inputString);

            expect(scanner.currentChar).toBe('/');
            scanner.skipWhitespace();
            expect(scanner.currentChar).toBe('a');
        });

        it('should skip double comments', () => {
            const inputString = '/* comment */a';
            const scanner = new Scanner(inputString);

            expect(scanner.currentChar).toBe('/');
            scanner.skipWhitespace();
            expect(scanner.currentChar).toBe('a');
        });

        it('should skip newlines', () => {
            const inputString = '\n\na';
            const scanner = new Scanner(inputString);

            expect(scanner.currentChar).toBe('\n');
            scanner.skipWhitespace();
            expect(scanner.currentChar).toBe('a');

        });

        it('should skip spaces', () => {
            const inputString = '   a';
            const scanner = new Scanner(inputString);

            expect(scanner.currentChar).toBe(' ');
            scanner.skipWhitespace();
            expect(scanner.currentChar).toBe('a');
        });

        it('should skip tab', () => {
            const inputString = '\ta';
            const scanner = new Scanner(inputString);

            expect(scanner.currentChar).toBe('\t');
            scanner.skipWhitespace();
            expect(scanner.currentChar).toBe('a');
        });

    });

    describe('Collection Methods', () => {
        it('should collect punctuation', () => {
            const inputString = '()[][';
            const scanner = new Scanner(inputString);

            const collected: string = scanner.collectPunctuation();
            expect(collected).toBe('(');
        });

        it('should collect operators', () => {
            const inputString = '&&';
            const scanner = new Scanner(inputString);

            const collected: string = scanner.collectOperator();
            expect(collected).toBe('&&');
        });

        it('should collect identifiers', () => {
            const inputString = 'foo';
            const scanner = new Scanner(inputString);

            const collected: string = scanner.collectIdentifier();
            expect(collected).toBe('foo');
        });

        it('should collect hex number', () => {
            const inputString = '0x0003';
            const scanner = new Scanner(inputString);

            const collected: string = scanner.collectHexDecimal();
            expect(collected).toBe('0x0003');
        });

        it('should collect decimal', () => {
            const inputString = '12345.3';
            const scanner = new Scanner(inputString);

            const collected: string = scanner.collectDecimalOrScientific();
            expect(collected).toBe('12345.3');
        });

        it('should collect scientific', () => {
            const inputString = '1.1234e-3';
            const scanner = new Scanner(inputString);

            const collected: string = scanner.collectDecimalOrScientific();
            expect(collected).toBe('1.1234e-3');
        });

        it('should collect octal numbers', () => {
            const inputString = '0123';
            const scanner = new Scanner(inputString);

            const collected: string = scanner.collectOctal();
            expect(collected).toBe('0123');

        });

        it('should collect punctuation', () => {
            const inputString = ',./';
            const scanner = new Scanner(inputString);

            const collected: string = scanner.collectPunctuation();
            expect(collected).toBe(',');

        });

        it('should collect string', () => {
            const inputString = '"hello world"';
            const scanner = new Scanner(inputString);

            const collected: string = scanner.collectString();
            expect(collected).toBe('hello world');

        });

        it('should collect char', () => {
            const inputString = "'a'";
            const scanner = new Scanner(inputString);

            const collected: string = scanner.collectChar();
            expect(collected).toBe('a');

        });

        it('should throw an error for expecting different values', () => {
            const inputString = 'a(foo)';
            const scanner = new Scanner(inputString);

            expect(() => scanner.collectPunctuation()).toThrow();
            expect(() => scanner.collectOperator()).toThrow();
            expect(() => scanner.collectHexDecimal()).toThrow();
            expect(() => scanner.collectDecimalOrScientific()).toThrow();
            expect(() => scanner.collectOctal()).toThrow();
            expect(() => scanner.collectPunctuation()).toThrow();
            expect(() => scanner.collectString()).toThrow();
            expect(() => scanner.collectChar()).toThrow();

            scanner.move();

            expect(() => scanner.collectIdentifier()).toThrow();

        });


    });

    describe('Process Methods', () => {
        it('should process numbers', () => {
            const inputString = '0x1234 1234 1.234 1.234e-3 01234';
            const scanner = new Scanner(inputString);

            const hex: Token = scanner.processNumber();
            expect(hex.type).toBe(TokenType.LITERAL_INTEGER);

            scanner.skipWhitespace();

            const decimal: Token = scanner.processNumber();
            expect(decimal.type).toBe(TokenType.LITERAL_INTEGER);

            scanner.skipWhitespace();

            const float: Token = scanner.processNumber();
            expect(float.type).toBe(TokenType.LITERAL_FLOAT);

            scanner.skipWhitespace();

            const scientific: Token = scanner.processNumber();
            expect(scientific.type).toBe(TokenType.LITERAL_FLOAT);

            scanner.skipWhitespace();

            const octal: Token = scanner.processNumber();
            expect(octal.type).toBe(TokenType.LITERAL_INTEGER);

        });

        it('should process punctuation', () => {
            const inputString = '(){}[];,:.->?';
            const scanner = new Scanner(inputString);

            const lparen: Token = scanner.processPunctuation();
            expect(lparen.type).toBe(TokenType.PUNCT_LPAREN);

            scanner.skipWhitespace();

            const rparen: Token = scanner.processPunctuation();
            expect(rparen.type).toBe(TokenType.PUNCT_RPAREN);

            scanner.skipWhitespace();

            const lbrace: Token = scanner.processPunctuation();
            expect(lbrace.type).toBe(TokenType.PUNCT_LBRACE);

            scanner.skipWhitespace();

            const rbrace: Token = scanner.processPunctuation();
            expect(rbrace.type).toBe(TokenType.PUNCT_RBRACE);

            scanner.skipWhitespace();

            const lbracket: Token = scanner.processPunctuation();
            expect(lbracket.type).toBe(TokenType.PUNCT_LBRACKET);

            scanner.skipWhitespace();

            const rbracket: Token = scanner.processPunctuation();
            expect(rbracket.type).toBe(TokenType.PUNCT_RBRACKET);

            scanner.skipWhitespace();

            const semicolon: Token = scanner.processPunctuation();
            expect(semicolon.type).toBe(TokenType.PUNCT_SEMICOLON);

            scanner.skipWhitespace();

            const comma: Token = scanner.processPunctuation();
            expect(comma.type).toBe(TokenType.PUNCT_COMMA);

            scanner.skipWhitespace();

            const colon: Token = scanner.processPunctuation();
            expect(colon.type).toBe(TokenType.PUNCT_COLON);

            const dot: Token = scanner.processPunctuation();
            expect(dot.type).toBe(TokenType.PUNCT_DOT);

            scanner.skipWhitespace();

            const arrow: Token = scanner.processPunctuation();
            expect(arrow.type).toBe(TokenType.PUNCT_ARROW);

            scanner.skipWhitespace();

            const question: Token = scanner.processPunctuation();
            expect(question.type).toBe(TokenType.PUNCT_QUESTION);
        });

        it('should process operators', () => {
            const inputString = '+ - * / % ++ -- = += -= *= /= %= <<= >>= &= ^= |= == != > < >= <= && || ! & | ^ ~ << >>';
            const scanner = new Scanner(inputString);

            const plus: Token = scanner.processOperators();
            expect(plus.type).toBe(TokenType.OP_PLUS);

            scanner.skipWhitespace();

            const minus: Token = scanner.processOperators();
            expect(minus.type).toBe(TokenType.OP_MINUS);

            scanner.skipWhitespace();

            const multiply: Token = scanner.processOperators();
            expect(multiply.type).toBe(TokenType.OP_MULTIPLY);

            scanner.skipWhitespace();

            const divide: Token = scanner.processOperators();
            expect(divide.type).toBe(TokenType.OP_DIVIDE);

            scanner.skipWhitespace();

            const modulo: Token = scanner.processOperators();
            expect(modulo.type).toBe(TokenType.OP_MODULO);

            scanner.skipWhitespace();

            const increment: Token = scanner.processOperators();
            expect(increment.type).toBe(TokenType.OP_INCREMENT);

            scanner.skipWhitespace();

            const decrement: Token = scanner.processOperators();
            expect(decrement.type).toBe(TokenType.OP_DECREMENT);

            scanner.skipWhitespace();

            const assign: Token = scanner.processOperators();
            expect(assign.type).toBe(TokenType.OP_ASSIGN);

            scanner.skipWhitespace();

            const plusAssign: Token = scanner.processOperators();
            expect(plusAssign.type).toBe(TokenType.OP_PLUS_ASSIGN);

            scanner.skipWhitespace();

            const minusAssign: Token = scanner.processOperators();
            expect(minusAssign.type).toBe(TokenType.OP_MINUS_ASSIGN);

            scanner.skipWhitespace();

            const multAssign: Token = scanner.processOperators();
            expect(multAssign.type).toBe(TokenType.OP_MULT_ASSIGN);

            scanner.skipWhitespace();

            const divAssign: Token = scanner.processOperators();
            expect(divAssign.type).toBe(TokenType.OP_DIV_ASSIGN);

            scanner.skipWhitespace();

            const modAssign: Token = scanner.processOperators();
            expect(modAssign.type).toBe(TokenType.OP_MOD_ASSIGN);

            scanner.skipWhitespace();

            const lshiftAssign: Token = scanner.processOperators();
            expect(lshiftAssign.type).toBe(TokenType.OP_LSHIFT_ASSIGN);

            scanner.skipWhitespace();

            const rshiftAssign: Token = scanner.processOperators();
            expect(rshiftAssign.type).toBe(TokenType.OP_RSHIFT_ASSIGN);

            scanner.skipWhitespace();

            const andAssign: Token = scanner.processOperators();
            expect(andAssign.type).toBe(TokenType.OP_AND_ASSIGN);

            scanner.skipWhitespace();

            const xorAssign: Token = scanner.processOperators();
            expect(xorAssign.type).toBe(TokenType.OP_XOR_ASSIGN);

            scanner.skipWhitespace();

            const orAssign: Token = scanner.processOperators();
            expect(orAssign.type).toBe(TokenType.OP_OR_ASSIGN);

            scanner.skipWhitespace();

            const equal: Token = scanner.processOperators();
            expect(equal.type).toBe(TokenType.OP_EQUAL);

            scanner.skipWhitespace();

            const notEqual: Token = scanner.processOperators();
            expect(notEqual.type).toBe(TokenType.OP_NOT_EQUAL);

            scanner.skipWhitespace();

            const greaterThan: Token = scanner.processOperators();
            expect(greaterThan.type).toBe(TokenType.OP_GREATER);

            scanner.skipWhitespace();

            const lessThan: Token = scanner.processOperators();
            expect(lessThan.type).toBe(TokenType.OP_LESS);

            scanner.skipWhitespace();

            const greaterEqual: Token = scanner.processOperators();
            expect(greaterEqual.type).toBe(TokenType.OP_GREATER_EQUAL);

            scanner.skipWhitespace();

            const lessEqual: Token = scanner.processOperators();
            expect(lessEqual.type).toBe(TokenType.OP_LESS_EQUAL);

            scanner.skipWhitespace();

            const logicalAnd: Token = scanner.processOperators();
            expect(logicalAnd.type).toBe(TokenType.OP_LOGICAL_AND);

            scanner.skipWhitespace();

            const logicalOr: Token = scanner.processOperators();
            expect(logicalOr.type).toBe(TokenType.OP_LOGICAL_OR);

            scanner.skipWhitespace();

            const logicalNot: Token = scanner.processOperators();
            expect(logicalNot.type).toBe(TokenType.OP_LOGICAL_NOT);

            scanner.skipWhitespace();

            const bitwiseAnd: Token = scanner.processOperators();
            expect(bitwiseAnd.type).toBe(TokenType.OP_BITWISE_AND);

            scanner.skipWhitespace();

            const bitwiseOr: Token = scanner.processOperators();
            expect(bitwiseOr.type).toBe(TokenType.OP_BITWISE_OR);

            scanner.skipWhitespace();

            const bitwiseXor: Token = scanner.processOperators();
            expect(bitwiseXor.type).toBe(TokenType.OP_BITWISE_XOR);

            scanner.skipWhitespace();

            const bitwiseNot: Token = scanner.processOperators();
            expect(bitwiseNot.type).toBe(TokenType.OP_BITWISE_NOT);

            scanner.skipWhitespace();

            const lshift: Token = scanner.processOperators();
            expect(lshift.type).toBe(TokenType.OP_LSHIFT);

            scanner.skipWhitespace();

            const rshift: Token = scanner.processOperators();
            expect(rshift.type).toBe(TokenType.OP_RSHIFT);

        });

        it('should process keywords and identifiers', () => {
            const inputString = 'int float char double void foo';
            const scanner = new Scanner(inputString);

            const int: Token = scanner.processIdentifierAndKeywords();
            expect(int.type).toBe(TokenType.KEYWORD_INT);

            scanner.skipWhitespace();

            const float: Token = scanner.processIdentifierAndKeywords();
            expect(float.type).toBe(TokenType.KEYWORD_FLOAT);

            scanner.skipWhitespace();

            const char: Token = scanner.processIdentifierAndKeywords();
            expect(char.type).toBe(TokenType.KEYWORD_CHAR);

            scanner.skipWhitespace();

            const double: Token = scanner.processIdentifierAndKeywords();
            expect(double.type).toBe(TokenType.KEYWORD_DOUBLE);

            scanner.skipWhitespace();

            const voidToken: Token = scanner.processIdentifierAndKeywords();
            expect(voidToken.type).toBe(TokenType.KEYWORD_VOID);

            scanner.skipWhitespace();

            const identifier: Token = scanner.processIdentifierAndKeywords();
            expect(identifier.type).toBe(TokenType.IDENTIFIER);


        });
    });

    describe('Basic Code', () => {
        it('should process basic C code example', () => {
            const inputString = 'int main() { return 0; }';
            const scanner = new Scanner(inputString);

            let tokenList: Token[] = scanner.getAllTokens();
            let reducedList: {
                type: TokenType,
                precedence: number,
                value?: string
            }[] = tokenList.map(({line, column, ...rest}) => rest);

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
        it('should process expressions', () => {
            const inputString = 'int main() { int a = (3 + 4) / 2 - 1 * 10; char string[] = "some text"; return 0; }';
            const scanner = new Scanner(inputString);

            let tokenList: Token[] = scanner.getAllTokens();
            let reducedList: {
                type: TokenType,
                precedence: number,
                value?: string
            }[] = tokenList.map(({line, column, ...rest}) => rest);

            const expectedOutput = [
                {type: TokenType.KEYWORD_INT, precedence: 0},
                {type: TokenType.IDENTIFIER, precedence: 15, value: 'main'},
                {type: TokenType.PUNCT_LPAREN, precedence: 15},
                {type: TokenType.PUNCT_RPAREN, precedence: 15},
                {type: TokenType.PUNCT_LBRACE, precedence: 0},
                {type: TokenType.KEYWORD_INT, precedence: 0},
                {type: TokenType.IDENTIFIER, precedence: 15, value: 'a'},
                {type: TokenType.OP_ASSIGN, precedence: 2, value: '='},
                {type: TokenType.PUNCT_LPAREN, precedence: 15},
                {type: TokenType.LITERAL_INTEGER, precedence: 15, value: '3'},
                {type: TokenType.OP_PLUS, precedence: 12, value: '+'},
                {type: TokenType.LITERAL_INTEGER, precedence: 15, value: '4'},
                {type: TokenType.PUNCT_RPAREN, precedence: 15},
                {type: TokenType.OP_DIVIDE, precedence: 13, value: '/'},
                {type: TokenType.LITERAL_INTEGER, precedence: 15, value: '2'},
                {type: TokenType.OP_MINUS, precedence: 12, value: '-'},
                {type: TokenType.LITERAL_INTEGER, precedence: 15, value: '1'},
                {type: TokenType.OP_MULTIPLY, precedence: 13, value: '*'},
                {type: TokenType.LITERAL_INTEGER, precedence: 15, value: '10'},
                {type: TokenType.PUNCT_SEMICOLON, precedence: 0},
                {type: TokenType.KEYWORD_CHAR, precedence: 0},
                {type: TokenType.IDENTIFIER, precedence: 15, value: 'string'},
                {type: TokenType.PUNCT_LBRACKET, precedence: 14},
                {type: TokenType.PUNCT_RBRACKET, precedence: 14},
                {type: TokenType.OP_ASSIGN, precedence: 2, value: '='},
                {type: TokenType.LITERAL_STRING, precedence: 15, value: 'some text'},
                {type: TokenType.PUNCT_SEMICOLON, precedence: 0},
                {type: TokenType.KEYWORD_RETURN, precedence: 0},
                {type: TokenType.LITERAL_INTEGER, precedence: 15, value: '0'},
                {type: TokenType.PUNCT_SEMICOLON, precedence: 0},
                {type: TokenType.PUNCT_RBRACE, precedence: 0},
                {type: TokenType.EOF, precedence: -1}
            ];

            expect(reducedList).toEqual(expectedOutput);
        });
    });

});

