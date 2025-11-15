export class CMachineError extends Error {
    constructor(
        type: string,
        message: string
    ) {
        super(`${type}: ${message}`);
        this.name = type;
    }
}