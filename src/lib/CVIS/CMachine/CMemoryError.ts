/**
 * CVIS Visualisation suite: Memory constrcutrs - Ben McIlveen
 */


export class CMemoryError extends Error {
    constructor(
        type: string,
        message: string
    ) {
        super(`${type}: ${message}`);
        this.name = type;
    }
}