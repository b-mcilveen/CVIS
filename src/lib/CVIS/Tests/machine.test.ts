import {describe, it, expect} from 'vitest';
import * as AST from "@CParser/CAst.ts";
import {ProgramStateMachine} from "@CMachine/CMachine.ts";
import {Scanner} from "@CParser/CScanner.ts";
import {Parser} from "@CParser/CParser.ts";

const anyLocation = {location: {line: expect.any(Number), column: expect.any(Number)}};

describe('Virtual Machine Integration Tests', () => {
    describe('Constructor', () => {
        it('should initialize with default values', () => {
            let output = '';
            const ast = {
                type: 'Program',
                globalDeclarations: [],
                statements: [],
                ...anyLocation
            } as AST.Program;

            const machine = new ProgramStateMachine(ast, (message: string) => {
                output += message;
            });

            expect(machine).toBeInstanceOf(ProgramStateMachine);
        });
    });

    describe('Basic Functionality', () => {
        it('should execute a simple program', () => {
            let output = "";
            const inputString = "int a = 3; char *b; int main() { char d = 'a'; double c = 2.0; b = &d; printf(\"%d\\n\", a); printf(\"%c\\n\", *b); printf(\"%f\\n\", c); printf(\"%d\\n\", sizeof(a)); printf(\"%d\\n\", sizeof(b)); printf(\"%d\\n\", sizeof(c)); printf(\"%d\\n\", sizeof(d)); }";
            const scanner = new Scanner(inputString);
            const parser = new Parser(scanner);
            const ast = parser.parse();
            const machine = new ProgramStateMachine(ast, (message: string) => output += message);

            machine.programSetup();
            machine.runProgram();

            expect(output).toEqual('3\na\n2.000000\n4\n4\n8\n1\n');
        });

        it('should handle if, while, do while and for statements', () => {
            let output = "";
            const inputString = "int main() { int a = 3; char b = 'a'; double c = 2.0; int i; if (a > 2) { printf(\"%d\\n\", a); } while (a < 5) { printf(\"%d\\n\", a); a++; } do { printf(\"%d\\n\", a); a--; } while (a > 1); for (i = 0; i < 5; i++) { printf(\"%d\\n\", i); } return 0; }";
            const scanner = new Scanner(inputString);
            const parser = new Parser(scanner);
            const ast = parser.parse();
            const machine = new ProgramStateMachine(ast, (message: string) => output += message);

            machine.programSetup();
            machine.runProgram();

            expect(output).toEqual('3\n3\n4\n5\n4\n3\n2\n1\n0\n1\n2\n3\n4\n');

        });

        it('should handle basic arrays', () => {
            let output = "";
            const inputString = "int main() { int arr[5] = {1, 2, 3, 4, 5}; int i; for (i = 0; i < 5; i++) { printf(\"%d\\n\", arr[i]); } return 0; }";
            const scanner = new Scanner(inputString);
            const parser = new Parser(scanner);
            const ast = parser.parse();
            const machine = new ProgramStateMachine(ast, (message: string) => output += message);

            machine.programSetup();
            machine.runProgram();

            expect(output).toEqual('1\n2\n3\n4\n5\n');
        });

        it('should handle multidimensional arrays', () => {
            let output = "";
            const inputString = "int main() { int arr[2][3] = {{1, 2, 3}, {4, 5, 6}}; int i, j; for (i = 0; i < 2; i++) { for (j = 0; j < 3; j++) { printf(\"%d\\n\", arr[i][j]); } } return 0; }";
            const scanner = new Scanner(inputString);
            const parser = new Parser(scanner);
            const ast = parser.parse();
            const machine = new ProgramStateMachine(ast, (message: string) => output += message);

            machine.programSetup();
            machine.runProgram();

            expect(output).toEqual('1\n2\n3\n4\n5\n6\n');
        });

        it('should handle structs', () => {
            let output = "";
            const inputString = " int main() { struct Point { int x; int y; }; struct Point p; p.x = 5; p.y = 10; printf(\"%d\\n\", p.x); printf(\"%d\\n\", p.y); return 0; }";
            const scanner = new Scanner(inputString);
            const parser = new Parser(scanner);
            const ast = parser.parse();
            const machine = new ProgramStateMachine(ast, (message: string) => output += message);

            machine.programSetup();
            machine.runProgram();

            expect(output).toEqual('5\n10\n');
        });

        it('should handle switch/case statements', () => {
            let output = "";
            const inputString = "int foo(char x) { switch(x) { case 'A': return 65; case 'B': return 66; case 'C': return 67; default: return 0; } } int main() { int c = foo('A'); c++; --c; printf(\"Ascii %d\\n\",c); return 0; }";
            const scanner = new Scanner(inputString);
            const parser = new Parser(scanner);
            const ast = parser.parse();
            const machine = new ProgramStateMachine(ast, (message: string) => output += message);

            machine.programSetup();
            machine.runProgram();
            expect(output).toEqual('Ascii 65\n');
        });

        it('should handle an array of strings', () => {
            let output = "";
            const inputString = "int main() { char *arr[3] = {\"Hello\", \"World\", \"!\"}; int i; for (i = 0; i < 3; i++) { printf(\"%s\\n\", arr[i]); } return 0; }";
            const scanner = new Scanner(inputString);
            const parser = new Parser(scanner);
            const ast = parser.parse();
            const machine = new ProgramStateMachine(ast, (message: string) => output += message);

            machine.programSetup();
            machine.runProgram();

            expect(output).toEqual('Hello\nWorld\n!\n');
        });

        it('should handle simple strings', () => {
            let output = "";
            const inputString = "int main() { char str[] = \"Hello World\"; printf(\"%s\\n\", str); return 0; }";
            const scanner = new Scanner(inputString);
            const parser = new Parser(scanner);
            const ast = parser.parse();
            const machine = new ProgramStateMachine(ast, (message: string) => output += message);

            machine.programSetup();
            machine.runProgram();

            expect(output).toEqual('Hello World\n');

        });

        it('should handle typecasting', () => {
            let output = "";
            const inputString = "int main() { int a = 5; double b = (double)a; printf(\"%f\\n\", b); return 0; }";
            const scanner = new Scanner(inputString);
            const parser = new Parser(scanner);
            const ast = parser.parse();
            const machine = new ProgramStateMachine(ast, (message: string) => output += message);

            machine.programSetup();
            machine.runProgram();

            expect(output).toEqual('5.000000\n');
        });


    });

    describe('Common Errors', () => {
        it('should throw an error for no main entry', () => {
            let output = "";
            const inputString = "int a = 3; char b = 'a';";
            const scanner = new Scanner(inputString);
            const parser = new Parser(scanner);
            const ast = parser.parse();
            const machine = new ProgramStateMachine(ast, (message: string) => output += message);

            expect(() => {
                machine.programSetup();
                machine.runProgram();
            }).toThrowError("Execution Error: Main function not found, entry invalid");
        });
    });
});
