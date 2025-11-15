import {Token, TokenType} from "./CTokens.ts";

/**
 * CVIS Visualisation suite: Error constructors for scanner - Ben McIlveen
 */


export class ScannerError extends Error {
    constructor(
        message: string,
        public line: number,
        public column: number,
        public snippet: string,
    ) {
        super(`${message} at line ${line}, column ${column}: "${snippet}"`);
        this.name = "ScannerError";
    }
}

export class ParserError extends Error {
    constructor(
        message: string,
        public token: Token,
        public expectedType?: TokenType
    ) {
        super(
            `${message} at line ${token.line}, column ${token.column}` +
            (expectedType ? `, expected ${TokenType[expectedType]}` : '')
        );
        this.name = 'ParserError';
    }
}
