import {useEffect, useState} from "react";
import * as AST from "@CVIS/CParser/CAst.ts";
import {ProgramSnapshot} from "@CVIS/CMachine/CMachineTypes.ts";
import {ProgramStateMachine} from "@CVIS/CMachine/CMachine.ts";
import {Scanner} from "@CVIS/CParser/CScanner.ts";
import {Parser} from "@CVIS/CParser/CParser.ts";


export interface VirtualMachineMetadata {
    virtualMachine: ProgramStateMachine | null;
    inputCode: string;
    parsedProgram: AST.Program | null;
    programSnapshot: ProgramSnapshot | null;
    executionStack: AST.Statement[];
    hasParseFailed: boolean;
    currentLine: number | null;
    consoleOutput: string;
    errorOutput: string;
}


export interface VirtualMachineHook {
    (debug: boolean): [
        () => void,
        () => void,
        () => void,
        (code: string) => void,
        React.Dispatch<React.SetStateAction<string>>,
        React.Dispatch<React.SetStateAction<string>>,
        VirtualMachineMetadata
    ]
}

export const useCVirtualMachine: VirtualMachineHook = (debug: boolean = false) => {
    const [inputCode, setInputCode] = useState("int main()\n" +
        "{\n" +
        "    \n" +
        "}");
    const [parsedProgram, setParsedProgram] = useState<AST.Program | null>(null);
    const [programSnapshot, setProgramSnapshot] = useState<ProgramSnapshot | null>(null);

    const [machine, setMachine] = useState<ProgramStateMachine | null>(null);

    const [hasParseFailed, setHasParseFailed] = useState(false);

    const [currentLine, setCurrentLine] = useState<number | null>(null);
    const [consoleOutput, setConsoleOutput] = useState("");
    const [errorOutput, setErrorOutput] = useState("");

    useEffect(() => {
        try {
            const scanner = new Scanner(inputCode);
            const parser = new Parser(scanner, debug);
            const parsed = parser.parse();
            setParsedProgram(parsed);
            setHasParseFailed(false);
        } catch (e) {
            setHasParseFailed(true);
            virtualError((e as Error).message);
            setParsedProgram(null);
            setProgramSnapshot(null);
        }
    }, [inputCode]);

    useEffect(() => {
        try {
            if (!parsedProgram) return;

            const newMachine = new ProgramStateMachine(parsedProgram, virtualLog, false);
            newMachine.programSetup();
            setMachine(newMachine);

            updateSnapshot();
            setHasParseFailed(false);
        } catch (e) {

            setHasParseFailed(true);
            virtualError((e as Error).message)
            setParsedProgram(null);
            setProgramSnapshot(null);
        }
    }, [parsedProgram]);

    const virtualLog = (message: string) => {
        setConsoleOutput((prev) => prev + message);
    }

    const virtualError = (message: string) => {
        setErrorOutput((prev) => prev + getTime() + " - " + message + "\n");
    }


    const updateSnapshot = () => {
        if (!machine) return;
        let machineSnap: ProgramSnapshot = machine.getProgramSnapshot();
        setProgramSnapshot(machineSnap);
        if (machineSnap.currentLine)
            setCurrentLine(machineSnap.currentLine);
        else
            setCurrentLine(null);
    }

    const getTime = () => {
        let now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();
        return `[${hours}:${minutes}:${seconds}]`;
    }

    const resetVirtualMachine = () => {
        if (!machine) return;
        machine.programSetup();
        updateSnapshot();
    }

    const runProgram = () => {
        if (!machine) return;
        let exitCode = machine.runProgram();

        updateSnapshot();

        setCurrentLine(null);

        if (exitCode !== null) {
            virtualLog(`Program exited with code ${exitCode}\n`);
        }

        resetVirtualMachine();
    }


    const stepProgram = () => {
        if (!machine) return;
        let returnResult = null;
        try {
            returnResult = machine.stepProgram();
            updateSnapshot();
        } catch (e) {
            console.error(e);
            virtualLog(`Step error: ${(e as Error).message}\n`);
        }

        // console.log(returnResult);
        if (returnResult !== null) {
            virtualLog(`Program exited with code ${returnResult}\n`);
        }
    }

    useEffect(() => {
        resetVirtualMachine();
    }, [machine]);


    const virtualMachineMetadata: VirtualMachineMetadata = {
        virtualMachine: machine,
        inputCode,
        parsedProgram,
        programSnapshot,
        executionStack: programSnapshot?.executionStack || [],
        hasParseFailed,
        currentLine,
        consoleOutput,
        errorOutput,
    }

    return [
        runProgram,
        stepProgram,
        resetVirtualMachine,
        setInputCode,
        setConsoleOutput,
        setErrorOutput,
        virtualMachineMetadata
    ]
}


