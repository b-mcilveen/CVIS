import {MemoryAllocationProposal, VirtualMemoryMachine} from '@CMachine/CMemory.ts';
import * as AST from '@CParser/CAst.ts';
import {
    CaseStatement,
    Declarator,
    DefaultStatement,
    TypeSpecifier,
    VariableDeclarator
} from '@CParser/CAst.ts';
import {CMachineError} from '@CMachine/CMachineError.ts';
import {
    EvalResult,
    Field,
    Function,
    getPrimitiveTypeSize,
    getTypeSize,
    implicitConversion,
    Parameter,
    PrimitiveType,
    ProgramSnapshot,
    StackFrame,
    StructDefinition,
    Type,
    typeSpecifierToType,
    Variable,
    Location
} from "@CMachine/CMachineTypes.ts";

/**
 * CVIS Visualisation suite: Execution Machine - Ben McIlveen
 * Steps through AST nodes, executing one a time with virtual memory
 */

const MAX_LOOP_STEPS = 10000;

export class ProgramStateMachine {
    private memoryMachine: VirtualMemoryMachine;
    private globalScope: Map<string, Variable>;
    private functionTable: Map<string, Function>;
    private structTable: Map<string, StructDefinition>;
    private callStack: StackFrame[];
    private currentScope: number;
    private programAST: AST.Program;
    private returnRegister: any;
    private virtualLog: (message: string) => void;
    private debug: boolean;
    private executionStack: AST.Statement[] = [];
    private mallocCounter: number = 0;

    constructor(ast: AST.Program, virtualLog: (message: string) => void, debug: boolean = false) {
        this.memoryMachine = new VirtualMemoryMachine();
        this.globalScope = new Map<string, Variable>();
        this.functionTable = new Map<string, Function>();
        this.structTable = new Map<string, StructDefinition>();
        this.callStack = [];
        this.currentScope = 0;
        this.programAST = ast;
        this.virtualLog = virtualLog;
        this.debug = debug;
    }

    // Reset the machine
    resetMachine() {

        console.log("[MACHINE] Resetting machine");
        this.memoryMachine.resetMemory();
        this.globalScope = new Map<string, Variable>();
        this.structTable = new Map<string, StructDefinition>();
        this.functionTable = new Map<string, Function>();
        this.executionStack = [];
        this.callStack = [];
        this.currentScope = 0;
    }

    // Setup the program for execution
    programSetup() {
        // Reset the machine
        this.resetMachine();

        // Initialize the global scope
        this.initializeGlobalScope();
        this.initializeGlobalFunctions();

        // Find Main as the entry point
        let mainEntry = this.functionTable.get('main');
        if (!mainEntry) {
            throw new CMachineError(
                'Execution Error',
                'Main function not found, entry invalid'
            );
        }

        // Main frame
        const mainFrame: StackFrame = {
            name: 'main',
            variables: new Map<string, Variable>(),
            returnType: {primitiveType: PrimitiveType.INT, pointerLevel: 0},
            scope: this.currentScope,
        }


        // Execute the main function
        this.pushStackFrame(mainFrame);

        if (mainEntry.body)
            this.pushExecutionStack(mainEntry.body);
        console.log('Main entry added to execution stack');
    }

    // Run the program from the current entry point
    runProgram(): number {
        if (this.executionStack.length === 0) {
            // At end of execution stack - restart
            return this.returnRegister;
        }

        // Execute the full execution stack
        while (this.executionStack.length > 0) {
            this.stepProgram();
            if (this.debug)
                console.log('Current step line', this.getCurrentStepLine());
        }
        console.log('Program finished', this.returnRegister);
        return this.returnRegister;
    }

    // Step through the program to the next statement
    stepProgram(): any {
        if (this.executionStack.length === 0) {
            // At end of execution stack - restart
            return this.returnRegister;
        }

        // Get the next statement
        let statement = this.executionStack.pop();
        while (statement && statement.type === 'LoopBreakOutMarker')
            statement = this.executionStack.pop();

        // Execute the statement
        if (statement) {
            this.executeStatement(statement, true);

            if (this.executionStack.length === 0) {
                return this.returnRegister;
            } else {
                return null;
            }
        } else {
            return this.returnRegister; // Program has finished give the return register
        }

    }

    // Push a new statement to the execution stack
    private pushExecutionStack(statement: AST.Statement) {
        this.executionStack.push(statement);
    }

    // Get the line of the current statement
    private getCurrentStepLine(): number | null {
        if (this.executionStack.length === 0) {
            return null;
        }

        let statement = this.executionStack[this.executionStack.length - 1];
        return statement.location ? statement.location.line : null;
    }

    // Recursively execute a statement
    private executeStatement(
        statement: AST.Statement,
        step: boolean = false
    ): any {
        switch (statement.type) {
            case 'LoopBreakOutMarker':
                return;
            case 'ExpressionStatement':
                return this.evaluateExpression(
                    (statement as AST.ExpressionStatement).expression,
                    step
                );
            case 'ReturnAssignment':
                this.executeReturnAssignment(statement as AST.ReturnAssignment);
                break;
            case 'StructDeclaration':
                this.evaluateStructDefinition(statement as AST.StructDeclaration);
                break;
            case 'FunctionCall':
                this.executeFunctionCall(statement as AST.FunctionCall, step);
                break;
            case 'CompoundStatement':
                this.executeCompoundStatement(statement as AST.CompoundStatement, step);
                break;
            case 'IfStatement':
                this.executeIfStatement(statement as AST.IfStatement, step);
                break;
            case 'SwitchStatement':
                this.executeSwitchStatement(statement as AST.SwitchStatement, step);
                break;
            case 'CaseStatement':
            case 'DefaultStatement':
                this.executeCaseOrDefaultStatement(statement as AST.CaseStatement | AST.DefaultStatement, step);
                break;
            case 'ForStatementNoInit':
                this.executeForStatement(statement as AST.ForStatement, step, true); // Skip the assignment (for step through)
                break;
            case 'ForStatement':
                this.executeForStatement(statement as AST.ForStatement, step);
                break;
            case 'WhileStatement':
                this.executeWhileStatement(statement as AST.WhileStatement, step);
                break;
            case 'DoWhileStatement':
                this.executeDoWhileStatement(statement as AST.DoWhileStatement, step);
                break;
            case 'BreakStatement':
                this.executeBreakStatement();
                break;
            case 'ReturnStatement':
                return this.executeReturnStatement(
                    statement as AST.ReturnStatement,
                    step
                );
            case 'VariableDeclaration':
                this.executeVariableDeclaration(
                    statement as AST.VariableDeclaration,
                    step
                );
                break;
            default:
                throw new CMachineError(
                    'Execution Error',
                    `Unrecognised statement ${statement.type}`
                );
        }
    }

    // Execute a return assignment
    // Sets the return register to the value of the expression if present
    private executeReturnAssignment(
        statement: AST.ReturnAssignment
    ): void {
        if (this.debug)
            console.log('Executing Return Assignment', statement);

        // Get the return assignment statement
        let returnRegister = statement as AST.ReturnAssignment;

        // Return value is the statement
        let returnValue = this.returnRegister;

        // Get the current stack frame
        let frame = this.getCurrentStackFrame();

        // get the variable to the return value (ie int a = foo() <- a is returned)
        let variable = frame.variables.get(returnRegister.variableName);

        // If there was a variable assigned, write the return value to memory
        if (variable) {
            this.memoryMachine.writeMemory(variable.address, frame.returnType, returnValue);
        }
    }

    // Execute a break statement
    private executeBreakStatement(): void {

        // Pop until the loop marker
        // Check loop marker is present otherwise nothing break out of
        if (this.executionStack.reduce((acc, statement) => acc || statement.type === 'LoopBreakOutMarker', false)) {
            let statement = this.executionStack.pop();
            while (statement && statement.type !== 'LoopBreakOutMarker') {
                statement = this.executionStack.pop();
            }
        }

    }

    // Recursively execute a return statement
    private executeReturnStatement(
        statement: AST.ReturnStatement,
        step: boolean = false
    ): any {
        if (this.debug)
            console.log('Executing Return Statement', statement);

        // is there a LoopBreakOutMarker
        let isLoopBreakOutMarker = this.executionStack.reduce((acc, statement) => acc || statement.type === 'LoopBreakOutMarker', false);
        if (isLoopBreakOutMarker)
            this.executeBreakStatement();

        // Set the return register to the value of the expression if present
        if (statement.argument) {
            let returnValue = this.evaluateExpression(statement.argument, step).value;
            this.returnRegister = returnValue;
            this.popStackFrame();
            return returnValue;
        }

        // Pop off the stack frame
        this.popStackFrame();
        return;
    }


    // Recursively execute a case or default statement
    private executeCaseOrDefaultStatement(
        statement: AST.CaseStatement | AST.DefaultStatement,
        step: boolean = false
    ) {
        if (step) {
            this.pushExecutionStack(statement.consequent);
        } else {
            this.executeStatement(statement.consequent);
        }
    }

    // Recursively execute a switch statement
    private executeSwitchStatement(
        statement: AST.SwitchStatement,
        step: boolean = false
    ): void {

        // Add loop marker for breakout
        this.executionStack.push({type: 'LoopBreakOutMarker', location: statement.location});

        // Evaluate the switch expression
        let switchValue = this.evaluateExpression(statement.expression);

        // Extract the cases from the switch statement
        let cases: (CaseStatement | DefaultStatement)[] = [];
        if (statement.body.type === "CompoundStatement") {
            let compoundStatement = statement.body as AST.CompoundStatement;
            cases = compoundStatement.body.filter((statement) => statement.type === "CaseStatement") as CaseStatement[];

            // If there is a default statement, add it to the cases
            if (compoundStatement.body.find((statement) => statement.type === "DefaultStatement"))
                cases.push(compoundStatement.body.find((statement) => statement.type === "DefaultStatement") as DefaultStatement);
            else {
                // If no default statement, add a default statement with empty body <- not perfect but stops bug
                cases.push({
                    type: "DefaultStatement",
                    location: statement.location,
                    consequent: {
                        type: "CompoundStatement",
                        location: statement.location,
                        body: [],
                    },
                } as DefaultStatement);
            }
        }


        // Find index of matching case or default (execute everything after, breaks will release this)
        let caseIndex = 0;
        for (let i = 0; i < cases.length; i++) {
            let caseStatement: CaseStatement | DefaultStatement = cases[i];

            // Check if it is a case statement
            if (caseStatement.type === "CaseStatement") {
                // Evaluate the case expression at set index if it matches
                let caseValue = this.evaluateExpression(caseStatement.test);
                if (caseValue.value === switchValue.value) {
                    caseIndex = i;
                    break;
                }
            } else {
                caseIndex = i;
                break;
            }
        }

        // Slice everything from i to end
        cases = cases.slice(caseIndex);

        // Execute the cases
        if (step) {
            // Reverse the cases to push to the stack in order
            for (let i = cases.length - 1; i >= 0; i--) {
                this.pushExecutionStack(cases[i]);
            }
        } else {
            for (let caseStatement of cases) {
                this.executeStatement(caseStatement.consequent);
            }
        }

    }

    // Recursively execute If Statement
    private executeIfStatement(
        statement: AST.IfStatement,
        step: boolean = false
    ): void {
        // Evaluate the condition
        let condition = this.evaluateExpression(statement.condition).value != 0;

        // statement is true
        if (condition) {
            if (step) this.pushExecutionStack(statement.consequent);
            else this.executeStatement(statement.consequent);
            return;
        }

        // Statement is false check for else
        if (statement.alternate) {
            if (step) this.pushExecutionStack(statement.alternate);
            else this.executeStatement(statement.alternate);
        }
    }

    // Recursively execute Do While Statement
    private executeDoWhileStatement(
        statement: AST.DoWhileStatement,
        step: boolean = false
    ): void {
        // Add loop marker for breakout
        this.executionStack.push({type: 'LoopBreakOutMarker', location: statement.location});

        // Evaluate the condition
        let condition = this.evaluateExpression(statement.condition).value != 0;

        if (step) {
            if (condition) {
                this.pushExecutionStack(statement);
            }
            this.pushExecutionStack(statement.body);
        } else {
            let loopCount = 0;
            do {
                this.executeStatement(statement.body);
                condition = this.evaluateExpression(statement.condition).value != 0;
                loopCount++;
            } while (condition && loopCount < MAX_LOOP_STEPS);

            if (loopCount >= MAX_LOOP_STEPS) {
                throw new CMachineError('Execution Error', 'Loop exceeded maximum steps (either infinite or too large)');
            }
        }
    }


    // Recursively execute While Statement
    private executeWhileStatement(
        statement: AST.WhileStatement,
        step: boolean = false
    ): void {
        /*
            FIX: when a while loop is being written in full execute mode the typign of say while(a ...) will
            stop at A and continue to execute it.
            */

        // Add loop marker for breakout
        this.executionStack.push({type: 'LoopBreakOutMarker', location: statement.location});

        // Evaluate condition
        let condition = this.evaluateExpression(statement.condition).value != 0;

        if (step) {
            if (condition) {
                this.pushExecutionStack(statement);
                this.pushExecutionStack(statement.body);
            }
        } else {
            let loopCount = 0;
            while (condition && loopCount < MAX_LOOP_STEPS) {
                this.executeStatement(statement.body);
                condition = this.evaluateExpression(statement.condition).value != 0;
                loopCount++;
            }

            if (loopCount >= MAX_LOOP_STEPS) {
                this.virtualLog("[CMACHINE]Error: Loop exceeded maximum steps (either infinite or too large)");
                throw new CMachineError('Execution Error', 'Loop exceeded maximum steps (either infinite or too large)');
            }
        }
    }

    // Recursively execute For Statement
    private executeForStatement(
        statement: AST.ForStatement,
        step: boolean = false,
        skipAssignment: boolean = false
    ): void {
        // Add loop marker for breakout
        this.executionStack.push({type: 'LoopBreakOutMarker', location: statement.location});

        // ANSI C doesn't have declarations in loop - this would need to be changed a fair bit if ever expanded for later versions.
        let varAssignment = statement.init as AST.Expression;
        let testCondition = statement.test;
        let update = statement.update;


        let body = statement.body as AST.Statement;


        // Step through (note: step through is pushed to the stack backwards)
        if (step) {
            // Execute the variable assignment (for simplicity no step through)
            if (!skipAssignment)
                this.evaluateExpression(varAssignment, false);

            // Check the testCondition
            let conditionResult: boolean = this.evaluateExpression(testCondition).value != 0;

            // Add the body to the execution stack
            if (conditionResult) {

                // Keep the for statement on the stack
                this.pushExecutionStack({...statement, type: 'ForStatementNoInit'});

                // Execute the update
                this.pushExecutionStack({type: 'ExpressionStatement', expression: update} as AST.ExpressionStatement);
                this.pushExecutionStack(body);

                // TODO: CONDITION NEEDS TO BE A STATEMENT TO AN EXPRESSION
            }

        } else {

            // Execute the variable assignment
            this.evaluateExpression(varAssignment, false);

            // Check the testCondition
            let conditionResult: boolean = this.evaluateExpression(testCondition).value != 0;

            let loopCount = 0;
            // Execute the body
            while (conditionResult && loopCount < MAX_LOOP_STEPS) {
                this.executeStatement(body, false);
                this.evaluateExpression(update, false);
                conditionResult = this.evaluateExpression(testCondition).value != 0;
                loopCount++;
            }

            if (loopCount >= MAX_LOOP_STEPS) {
                throw new CMachineError('Execution Error', 'Loop exceeded maximum steps (either infinite or too large)');
            }
        }


    }

    // Calculate the size of a variable before it is declared
    private calculateExactVariableSize(variable: AST.VariableDeclarator): number {
        let typeSpecifier: TypeSpecifier = variable.typeSpecifier;
        let type: Type = typeSpecifierToType(typeSpecifier);
        let size = getTypeSize(type);
        let isStruct = type.primitiveType === PrimitiveType.STRUCT;
        let isArray = variable.arrayDimensions && variable.arrayDimensions.length > 0;
        let isArrayOfPointers = isArray && type.pointerLevel && type.pointerLevel > 0;

        // Handle string literals
        if (variable.init && variable.init.type == 'StringLiteral') {
            return ((variable.init as AST.StringLiteral).value.length + 1) * getPrimitiveTypeSize(PrimitiveType.CHAR);
        }

        // Handle arrays
        if (isArray && !isArrayOfPointers) {
            let elements = variable.arrayDimensions?.reduce((acc, dim) => acc * dim, 1) || 1;
            return elements * getTypeSize(type);
        }

        // Handle array of pointers
        if (isArrayOfPointers) {
            let elements = variable.arrayDimensions?.reduce((acc, dim) => acc * dim, 1) || 1;
            return elements * getPrimitiveTypeSize(PrimitiveType.INT);
        }

        // Handle structs
        if (isStruct) {
            let structName = typeSpecifier.name.substring(7);
            let struct = this.structTable.get(structName);
            console.log('Struct table', this.structTable);
            if (!struct) {
                throw new CMachineError('Execution Error', `Struct ${structName} not found`);
            }

            if (variable.init)
                return struct.size;
            else
                return Array.from(struct.members.values()).reduce((acc, member) => acc + getTypeSize(member.type), 0);
        }

        // Return base type size for simple variables
        return size;
    }

    // Initialize a variable and write it to memory
    private initializeVariable(variable: AST.VariableDeclarator, address: number, step: boolean): void {
        const typeSpecifier = variable.typeSpecifier;
        const type = typeSpecifierToType(typeSpecifier);
        const isArray = variable.arrayDimensions && variable.arrayDimensions.length > 0;
        const isStruct = type.primitiveType === PrimitiveType.STRUCT;

        if (isStruct)
            this.initializeStruct(typeSpecifier.name.substring(7), address, variable.init as AST.ArrayInitializer, variable.location);

        // Handle initialization
        if (variable.init) {
            if (step && variable.init.type === 'FunctionCall') {
                this.pushExecutionStack({
                    type: 'ReturnAssignment',
                    variableName: variable.id.name,
                    address: address,
                    initializer: variable.init
                } as AST.ReturnAssignment);
                this.pushExecutionStack(variable.init as AST.FunctionCall);
            } else if ((isArray && variable.init.type === 'ArrayInitializer') || variable.init.type === 'StringLiteral') {

                this.initializeArray(variable.id.name, address, variable.init as AST.ArrayInitializer, type, variable.arrayDimensions || []);
                const varAss = this.getCurrentStackFrame().variables.get(variable.id.name);

                if (!varAss)
                    throw new CMachineError('Memory Error', 'Variable not declared');
            } else {
                const initialization: EvalResult = this.evaluateExpression(variable.init as AST.Expression);
                this.memoryMachine.writeMemory(address, type, initialization.value);
            }
        } else {
            if (isArray) {
                // Fill with 0s
                this.zeroInitializeArray(variable.id.name, address, variable.arrayDimensions || [], type, variable.location);
            } else {
                // Zero initialize
                this.memoryMachine.writeMemory(address, type, 0);
            }
        }
    }

    // Recursively execute a Variable statement
    private executeVariableDeclaration(
        declaration: AST.VariableDeclaration,
        step: boolean = false
    ): void {

        if (this.debug)
            console.log("Executing Variable Declaration", declaration);
        // Get the declarators
        let declarators: AST.Declarator[] = declaration.declarators;
        // Per declarator
        for (let declarator of declarators) {
            // Get the variable
            let variable: AST.VariableDeclarator = declarator as AST.VariableDeclarator;
            const name = variable.id.name;
            const typeSpecifier = variable.typeSpecifier;
            const type = typeSpecifierToType(typeSpecifier);
            const size = this.calculateExactVariableSize(variable);

            if (variable.init && variable.init.type == 'StringLiteral') {
                variable = {...variable, arrayDimensions: [1]};
            }

            if (type.primitiveType === PrimitiveType.STRUCT) {
                const structName = typeSpecifier.name.substring(7);
                const struct = this.structTable.get(structName);
                if (!struct) {
                    throw new CMachineError('Execution Error', `Struct ${structName} does not exist`);
                }
                type.customTypeName = structName;
            }

            // Declare the declared variable on the stack
            let variableDeclared = this.declareVariable(name, type, false, undefined, size, variable.location)

            const address = variableDeclared.address;
            if (!address)
                throw new CMachineError('Memory Error', 'Variable not declared');

            // Add it to the virtual stack frame
            this.getCurrentStackFrame().variables.set(name, {
                name,
                address,
                size,
                arrayDimensions: variable.arrayDimensions,
                pointerLevel: typeSpecifier.pointerLevel,
                type
            });


            // Initialize the variablet
            this.initializeVariable(variable, address, step);

        }
    }

    // Initialize a struct in memory
    private initializeStruct(
        identifier: string,
        baseAddress: number,
        initializer: AST.ArrayInitializer | undefined = undefined,
        location: Location
    ): void {
        let structName = identifier;
        let struct = this.structTable.get(structName);
        if (!struct) {
            throw new CMachineError('Execution Error', `Struct ${structName} not found when initializing`);
        }


        // If there is an initializer, initialize the struct
        let flatValues: number[] = initializer ? this.flattenArrayInitializer(initializer) : new Array(struct.size).fill(0);

        let offset = 0;

        for (let member of struct.members.values()) {

            let memberAddress = baseAddress + member.offset;
            let memberType = member.type;

            if (memberType.primitiveType == PrimitiveType.STRUCT && (memberType.pointerLevel && memberType.pointerLevel < 1)) {
                this.initializeStruct(member.name, memberAddress, initializer, location);
            } else {
                let value = flatValues[offset];
                this.memoryMachine.allocateOnStack(getTypeSize(memberType), `${identifier}_${member.name}`, value, memberType, location, memberAddress);
            }

            offset++;
        }
    }

    // Initialize an array in memory
    private initializeArray(
        identifier: string,
        baseAddress: number,
        initializer: AST.ArrayInitializer | AST.StringLiteral,
        type: Type,
        dimensions: number[]
    ): EvalResult {

        if (initializer.type === 'StringLiteral') {

            let string: EvalResult = this.evaluateStringLiteral(initializer);
            const charArray: string[] = string.value;
            const result = this.memoryMachine.allocateOnStack(charArray.length, identifier, charArray, type, initializer.location, baseAddress, true);

            return {
                isLValue: true,
                address: result,
                value: result,
                type: {
                    primitiveType: PrimitiveType.CHAR,
                    pointerLevel: 0
                }
            }
        }

        if (type.pointerLevel && type.pointerLevel > 0) {
            const pointerSize = getPrimitiveTypeSize(PrimitiveType.INT);
            const arraySize = dimensions[0] * pointerSize;

            // Allocate the array of pointers
            const pointerArray = Array(dimensions[0]).fill(0);
            const result = this.memoryMachine.allocateOnStack(arraySize, identifier, pointerArray, type, initializer.location, baseAddress, true);

            const elements = initializer.values;
            for (let i = 0; i < Math.min(dimensions[0], elements.length); i++) {
                const element = elements[i];

                if (element.type === 'StringLiteral') {
                    const stringValue = (element as AST.StringLiteral).value;
                    const charCodes = Array.from(stringValue).map(c => c.charCodeAt(0));
                    charCodes.push(0); // null terminator

                    // Allocate each string on the heap
                    const stringAddress = this.memoryMachine.allocateOnHeap(charCodes.length, `${identifier}_${i}`, charCodes, {
                        primitiveType: PrimitiveType.CHAR,
                        pointerLevel: 0
                    }, element.location);

                    // Store the pointer to the string in the array
                    this.memoryMachine.writeMemory(baseAddress + i * pointerSize, type, stringAddress);
                } else {
                    const evalResult = this.evaluateExpression(element as AST.Expression);
                    this.memoryMachine.writeMemory(baseAddress + i * pointerSize, evalResult.type, evalResult.value);
                }
            }

            return {
                isLValue: true,
                value: result,
                address: baseAddress,
                type
            };
        }

        const flatValues = this.flattenArrayInitializer(initializer);
        const flatDimensions = dimensions.reduce((acc, dim) => acc * dim, 1);

        if (flatDimensions < flatValues.length) {
            throw new CMachineError('Memory Error', `Initializer size ${flatValues.length} exceeds array dimensions ${flatDimensions}`);
        }

        if (flatDimensions > flatValues.length) {
            const missingElements = flatDimensions - flatValues.length;
            for (let i = 0; i < missingElements; i++) {
                flatValues.push(0);
            }
        }

        if (this.debug)
            console.log('Allocating array', flatValues, flatDimensions * getTypeSize(type));

        this.memoryMachine.allocateOnStack(flatDimensions * getTypeSize(type), identifier, flatValues, type, initializer.location, baseAddress);

        return {
            isLValue: true,
            value: baseAddress,
            address: baseAddress,
            type: type
        }
    }

    // Flatten an array initializer (large dimension to single dimension)
    private flattenArrayInitializer(initializer: AST.ArrayInitializer): number[] {
        let result: number[] = [];

        for (let element of initializer.values) {
            if (element.type === 'ArrayInitializer') {
                // Recursively flatten nested array initializers
                const nestedValues = this.flattenArrayInitializer(element as AST.ArrayInitializer);
                result.push(...nestedValues);
            } else {
                // Evaluate the expression and add it to the result
                const item: EvalResult = this.evaluateExpression(element as AST.Expression);
                result.push(item.value as number);
            }
        }

        return result;
    }

    // Initialize a zeroed array in memory (for uninitialized arrays)
    private zeroInitializeArray(identifier: string, baseAddress: number, dimensions: number[], type: Type, location: Location): void {
        let flatDimensions = dimensions.reduce((acc, dim) => acc * dim, 1);
        let values = new Array(flatDimensions).fill(0);
        this.memoryMachine.allocateOnStack(flatDimensions * getTypeSize(type), identifier, values, type, location, baseAddress);
    }

    // Recursively execute a Compound statement
    private executeCompoundStatement(
        statement: AST.CompoundStatement,
        step: boolean = false
    ): void {
        if (this.debug)
            console.log('Executing Compound Statement', statement);

        let localDeclarations = statement.localDeclarations;
        let body = statement.body;


        // Add body to the execution stack first as they will be last out
        // Reverse the body to maintain order
        if (step) {

            // Add all the body statements to the execution stack up until the return statement
            let compoundStack = [];
            for (let statement of body) {
                compoundStack.push(statement);
                if (statement.type === 'ReturnStatement') {
                    break;
                }
            }
            for (let statement of compoundStack.reverse()) {
                this.pushExecutionStack(statement);
            }
        } else {

            for (let declaration of localDeclarations) {
                if (declaration.type === 'VariableDeclaration') {
                    const varDeclaration: AST.VariableDeclaration = declaration as AST.VariableDeclaration;
                    const declarators: AST.Declarator[] = varDeclaration.declarators;

                    for (let declarator of declarators) {
                        const variable: AST.VariableDeclarator =
                            declarator as AST.VariableDeclarator;
                        const name = variable.id.name;
                        const typeSpecifier = variable.typeSpecifier;
                        const type = typeSpecifierToType(typeSpecifier);
                        const size = getTypeSize(type);

                        let init = null;
                        if (variable.init) {
                            init = this.evaluateExpression(variable.init as AST.Expression);
                        }
                        const declaredVariable = this.declareVariable(name, type, false, init, variable.location);
                        const address = declaredVariable.address;
                        if (!address)
                            throw new CMachineError('Memory Error', 'Variable not declared');
                        this.getCurrentStackFrame().variables.set(name, {
                            name,
                            address,
                            size,
                            type,
                        });
                    }
                }
            }

            for (let statement of body) {
                this.executeStatement(statement);
                if (statement.type === 'ReturnStatement') {
                    return;
                }
            }
        }

        if (step) {
            // Push the declarations in reverse order to the execution stack
            if (localDeclarations)
                for (let i = localDeclarations.length - 1; i >= 0; i--) {
                    this.pushExecutionStack(localDeclarations[i]);
                }
            else
                return;
        }


    }

    // Recursively execute a function call
    private executeFunctionCall(
        statement: AST.FunctionCall,
        step: boolean = false
    ): EvalResult {
        let funcName = statement.functionIdentity.name;
        let func = this.functionTable.get(funcName);

        if (this.isStandardLibFunction(funcName)) {
            return this.executeStandardLibFunction(funcName, statement.arguments, statement.location);
        }

        if (!func) {
            throw new CMachineError(
                'Execution Error',
                `Function ${funcName} not found`
            );
        }

        if (this.debug)
            console.log(`Executing function: ${func.name}`);

        // Evaluate the arguments
        let args = statement.arguments.map((arg) => this.evaluateExpression(arg));

        let variableMap: Map<string, Variable> = new Map<string, Variable>();

        for (let i = 0; i < func.parameters.length; i++) {
            let param = func.parameters[i];
            let arg = args[i];

            if (arg) {
                // const declaredVariable = this.declareVariable(param.name, param.type, false, arg);
                const address: number = this.memoryMachine.allocateOnStack(
                    getTypeSize(param.type),
                    `${func.name}_${param.name}`,
                    arg.value,
                    param.type,
                    statement.location
                );
                // const address = declaredVariable.address;
                if (!address)
                    throw new CMachineError('Memory Error', 'Variable not declared');

                variableMap.set(param.name, {
                    name: param.name,
                    address: address,
                    size: getTypeSize(param.type),
                    type: param.type
                })
            } else {
                throw new CMachineError('Execution Error', `Argument ${param.name} not found`);
            }
        }

        // Push a new stack frame
        this.pushStackFrame({
                name: func.name,
                variables: variableMap,
                returnType: func.returnType,
                scope: this.currentScope,
            }
        );

        // Execute the function body
        if (func.body) {
            if (step) {
                this.pushExecutionStack(func.body);
                return {
                    value: this.returnRegister,
                    isLValue: false,
                    type: {primitiveType: PrimitiveType.INT, pointerLevel: 0}

                };
            } else
                this.executeStatement(func.body);
        }
        // Pop the stack frame

        this.popStackFrame();

        const result: EvalResult = {
            isLValue: false,
            value: this.returnRegister,
            type: {primitiveType: PrimitiveType.INT, pointerLevel: 0}
        }

        return result;
    }

    // Evaluate an expression
    private evaluateExpression(
        expression: AST.Expression,
        step: boolean = false
    ): EvalResult {

        if (this.debug)
            console.log('Evaluating Expression', expression);

        switch (expression.type) {
            case 'FunctionCall':
                return this.executeFunctionCall(expression as AST.FunctionCall, step);
            case 'SizeofExpression':
                return this.executeSizeOfExpression(expression as AST.SizeofExpression);
            case 'BinaryExpression':
                return this.evaluateBinaryExpression(
                    expression as AST.BinaryExpression
                );
            case 'UnaryExpression':
                return this.evaluateUnaryExpression(expression as AST.UnaryExpression);
            case 'PostfixExpression':
                return this.evaluatePostfixExpression(expression as AST.PostfixExpression);
            case 'PrefixExpression':
                return this.evaluatePrefixExpression(expression as AST.PrefixExpression);
            case 'Identifier':
                return this.evaluateIdentifier(expression as AST.Identifier);
            case 'IntegerLiteral':
                return {
                    isLValue: false,
                    value: (expression as AST.IntegerLiteral).value,
                    type: {primitiveType: PrimitiveType.INT, pointerLevel: 0}
                };
            case 'FloatLiteral':
                return {
                    isLValue: false,
                    value: (expression as AST.FloatLiteral).value,
                    type: {primitiveType: PrimitiveType.FLOAT, pointerLevel: 0}
                };
            case 'StringLiteral':
                return {
                    isLValue: false,
                    value: this.evaluateStringLiteral(expression as AST.StringLiteral).value,
                    type: {primitiveType: PrimitiveType.CHAR, pointerLevel: 0}
                };
            case 'CharLiteral':
                return {
                    isLValue: false,
                    value: (expression as AST.CharLiteral).value.charCodeAt(0),
                    type: {primitiveType: PrimitiveType.CHAR, pointerLevel: 0}
                };
            case 'BooleanLiteral':
                return {
                    isLValue: false,
                    value: (expression as AST.BooleanLiteral).value ? 1 : 0,
                    type: {primitiveType: PrimitiveType.INT, pointerLevel: 0}
                };
            case 'ArrayExpression':
                return this.evaluateArrayExpression(expression as AST.ArrayExpression)
            case 'ArrayLiteral':
                return this.evaluateArrayLiteral(expression as AST.ArrayLiteral);
            case 'ArrayInitializer':
                return this.evaluateArrayInitializer(expression as AST.ArrayInitializer);
            case 'MemberExpression':
                return this.evaluateMemberExpression(expression as AST.MemberExpression);
            default:
                throw new CMachineError(
                    'Evaluation Error',
                    `Expression type not supported ${expression.type}`
                );
        }
    }

    // Execute a sizeof expression
    private executeSizeOfExpression(expression: AST.SizeofExpression): EvalResult {
        let size = 0;

        if (expression.expression.type === 'TypeSpecifier') {
            const typeSpecifier = expression.expression as AST.TypeSpecifier;
            const type = typeSpecifierToType(typeSpecifier);

            if (type.primitiveType === PrimitiveType.STRUCT) {
                const structName = typeSpecifier.name.substring(7);
                const struct = this.structTable.get(structName);
                if (!struct) {
                    throw new CMachineError('Execution Error', `Struct ${structName} not found`);
                }
                size = struct.size;
            }

            size = getTypeSize(type);
        } else {
            let evalResult = this.evaluateExpression(expression.expression as AST.Expression);

            if (expression.expression.type == 'Identifier') {
                if (evalResult.address != undefined) {
                    let allocated = this.memoryMachine.getMemoryInfo(evalResult.address);
                    console.log(allocated);
                    size = allocated?.size || 0;
                }
            } else
                throw new CMachineError('Execution Error', 'Sizeof expression not supported');
        }


        return {
            isLValue: false,
            value: size,
            type: {primitiveType: PrimitiveType.INT, pointerLevel: 0}
        }
    }

    // Evaluate a member expression
    private evaluateMemberExpression(expression: AST.MemberExpression): EvalResult {
        let variableName = expression.object.name;
        let memberName = expression.property.name;

        // Find variable
        let variable = this.lookupVariable(variableName);
        if (!variable) {
            throw new CMachineError('Machine Error', `Variable ${variableName} not found`);
        }

        if (variable.type.customTypeName === undefined) {
            throw new CMachineError('Machine Error', `Variable ${variableName} is not a struct`);
        }

        let struct = this.structTable.get(variable.type.customTypeName);

        if (!struct) {
            throw new CMachineError('Machine Error', `Struct ${variable.type.customTypeName} not found while evaluating members`);
        }

        let member = struct.members.get(memberName);
        if (!member) {
            throw new CMachineError('Machine Error', `Member ${memberName} not found in struct ${variable.type.customTypeName}`);
        }

        let offset = member.offset;

        // Get the address of the member
        let memberAddress = variable.address + offset;

        // Read the value from memory
        return {
            isLValue: true,
            value: this.memoryMachine.readMemory(memberAddress, member.type),
            address: memberAddress,
            type: member.type
        }

    }

    // Evaluate a Struct Definition
    private evaluateStructDefinition(expression: AST.StructDeclaration): void {
        let structName: string = expression.id.name;
        let members: Map<string, Field> = new Map<string, Field>();
        let offset: number = 0;

        for (let member of expression.fields) {
            let declarators: Declarator[] = member.declarators;
            for (let declarator of declarators) {
                if (this.debug)
                    console.log('Declarator', declarator);
                const field: VariableDeclarator = declarator as AST.VariableDeclarator;
                const typeSpecifier: TypeSpecifier = field.typeSpecifier;
                const type = typeSpecifierToType(typeSpecifier);
                const size: number = getTypeSize(type);
                const name: string = field.id.name;

                members.set(name, {name, type, offset});
                offset += size;
            }
        }

        let structSize = offset;

        if (this.debug)
            console.log('Declaring struct', structName, members, structSize);

        this.structTable.set(structName, {name: structName, members, size: structSize});
    }

    // Evaluate an array expression ie: a[i]
    private evaluateArrayExpression(expression: AST.ArrayExpression): EvalResult {
        const array = this.evaluateExpression(expression.array);
        const index = this.evaluateExpression(expression.index);

        const baseTypeSize = getTypeSize({
            primitiveType: array.type.primitiveType,
            pointerLevel: array.type.pointerLevel
        });

        let stride = baseTypeSize;
        if (array.remainingDims && array.remainingDims.length > 1) {
            const product = array.remainingDims.slice(1).reduce((acc, dim) => acc * dim, 1);
            stride *= product;
        }

        const offset = index.value * stride;
        const newAddress = array.value + offset;

        const newRemainingDims: number[] = array.remainingDims ? array.remainingDims.slice(1) : [];

        const newType = {
            primitiveType: array.type.primitiveType,
            pointerLevel: (newRemainingDims && newRemainingDims.length > 0) ? 1 : 0
        };

        const memory = (newType.pointerLevel === 0)
            ? this.memoryMachine.readMemory(newAddress, newType)
            : newAddress;

        console.log("value", memory, newAddress,);
        return {
            isLValue: true,
            value: memory,
            address: newAddress,
            type: newType,
            remainingDims: newRemainingDims
        };
    }

    // Assign a value to an array element
    private assignArrayElement(address: number, value: number): void {

        // Get Memory info
        let memoryInfo = this.memoryMachine.getMemoryInfo(address);
        if (!memoryInfo)
            throw new CMachineError('Memory Error', 'Memory not found');

        // Get type
        const type = memoryInfo.type;

        // Write to memory
        this.memoryMachine.writeMemory(address, type, value);

    }

    // Evaluate a binary expression
    private evaluateBinaryExpression(expression: AST.BinaryExpression): EvalResult {
        let left: EvalResult = this.evaluateExpression(expression.left);
        let right: EvalResult = this.evaluateExpression(expression.right);

        if (expression.operator === '+' || expression.operator === '-' && (left.type?.pointerLevel > 0 || right.type?.pointerLevel > 0)) {
            if (left.type.pointerLevel > 0 && right.type.pointerLevel > 0) {
                throw new CMachineError('Evaluation Error', 'Cannot add or subtract pointers');
            }
            if (left.type.pointerLevel > 0) {
                right.value = right.value * getTypeSize(left.type);
            }
            if (right.type.pointerLevel > 0) {

            }

        }

        if (this.debug)
            console.log('Evaluating Binary Expression', expression, left, right);


        switch (expression.operator) {
            case '+':
                console.log('Adding', left, right);
                return {
                    isLValue: false,
                    value: left.value + right.value,
                    type: implicitConversion(left.type, right.type)
                }
            case '-':
                return {
                    isLValue: false,
                    value: left.value - right.value,
                    type: implicitConversion(left.type, right.type)
                }
            case '*':
                return {
                    isLValue: false,
                    value: left.value * right.value,
                    type: implicitConversion(left.type, right.type)
                }
            case '/':
                return {
                    isLValue: false,
                    value: left.value / right.value,
                    type: implicitConversion(left.type, right.type)
                }
            case '%':
                return {
                    isLValue: false,
                    value: left.value % right.value,
                    type: implicitConversion(left.type, right.type)

                }
            case '=':
                if (expression.left.type === "ArrayExpression") {
                    this.assignArrayElement(left.address || 0, right.value);
                    return {
                        isLValue: false,
                        value: right.value,
                        type: right.type
                    };
                }
                this.handleAssignment(expression.left, right);
                return {
                    isLValue: false,
                    value: right.value,
                    type: right.type
                };
            case '+=':
                if (expression.left.type === "ArrayExpression") {
                    this.assignArrayElement(left.address || 0, left.value + right.value);
                    return {
                        isLValue: false,
                        value: left.value + right.value,
                        type: right.type
                    };
                }
                this.handleAssignment(expression.left, {
                    isLValue: false,
                    value: left.value + right.value,
                    type: right.type
                });
                return {
                    isLValue: false,
                    value: left.value + right.value,
                    type: right.type
                };
            case '-=':
                if (expression.left.type === "ArrayExpression") {
                    this.assignArrayElement(left.address || 0, left.value - right.value);
                    return {
                        isLValue: false,
                        value: left.value - right.value,
                        type: right.type
                    };
                }
                this.handleAssignment(expression.left, {
                    isLValue: false,
                    value: left.value - right.value,
                    type: right.type
                });
                return {
                    isLValue: false,
                    value: left.value - right.value,
                    type: right.type
                };
            case '*=':
                if (expression.left.type === "ArrayExpression") {
                    this.assignArrayElement(left.address || 0, left.value * right.value);
                    return {
                        isLValue: false,
                        value: left.value * right.value,
                        type: right.type
                    };
                }
                this.handleAssignment(expression.left, {
                    isLValue: false,
                    value: left.value * right.value,
                    type: right.type
                });
                return {
                    isLValue: false,
                    value: left.value * right.value,
                    type: right.type
                };
            case '/=':
                if (expression.left.type === "ArrayExpression") {
                    this.assignArrayElement(left.address || 0, left.value / right.value);
                    return {
                        isLValue: false,
                        value: left.value / right.value,
                        type: right.type
                    };
                }
                this.handleAssignment(expression.left, {
                    isLValue: false,
                    value: left.value / right.value,
                    type: right.type
                });
                return {
                    isLValue: false,
                    value: left.value / right.value,
                    type: right.type
                };
            case '%=':
                if (expression.left.type === "ArrayExpression") {
                    this.assignArrayElement(left.address || 0, left.value % right.value);
                    return {
                        isLValue: false,
                        value: left.value % right.value,
                        type: right.type
                    };
                }
                this.handleAssignment(expression.left, {
                    isLValue: false,
                    value: left.value % right.value,
                    type: right.type
                });
                return {
                    isLValue: false,
                    value: left.value % right.value,
                    type: right.type
                };
            case '<<':
                return {
                    isLValue: false,
                    value: left.value << right.value,
                    type: implicitConversion(left.type, right.type)
                }
            case '>>':
                return {
                    isLValue: false,
                    value: left.value >> right.value,
                    type: implicitConversion(left.type, right.type)
                }

            case '==':
                return {
                    isLValue: false,
                    value: left.value === right.value ? 1 : 0,
                    type: {primitiveType: PrimitiveType.INT, pointerLevel: 0}
                }
            case '!=':
                return {
                    isLValue: false,
                    value: left.value !== right.value ? 1 : 0,
                    type: {primitiveType: PrimitiveType.INT, pointerLevel: 0}
                }
            case '<':
                return {
                    isLValue: false,
                    value: left.value < right.value ? 1 : 0,
                    type: {primitiveType: PrimitiveType.INT, pointerLevel: 0}
                }
            case '<=':
                return {
                    isLValue: false,
                    value: left.value <= right.value ? 1 : 0,
                    type: {primitiveType: PrimitiveType.INT, pointerLevel: 0}
                }
            case '>':
                return {
                    isLValue: false,
                    value: left.value > right.value ? 1 : 0,
                    type: {primitiveType: PrimitiveType.INT, pointerLevel: 0}
                }
            case '>=':
                return {
                    isLValue: false,
                    value: left.value >= right.value ? 1 : 0,
                    type: {primitiveType: PrimitiveType.INT, pointerLevel: 0}
                }
            case '&&':
                return {
                    isLValue: false,
                    value: left.value && right.value ? 1 : 0,
                    type: {primitiveType: PrimitiveType.INT, pointerLevel: 0}
                }
            case '||':
                return {
                    isLValue: false,
                    value: left.value || right.value ? 1 : 0,
                    type: {primitiveType: PrimitiveType.INT, pointerLevel: 0}
                }
            default:
                throw new CMachineError(
                    'Evaluation Error',
                    `Binary operator ${expression.operator} not supported`
                );
        }
    }

    // Handle variable assignemtn
    private handleAssignment(left: AST.Expression, right: EvalResult): void {
        if (left.type === 'Identifier') {
            // Get the variable
            let variable = this.lookupVariable((left as AST.Identifier).name);

            // Check if the variable exists
            if (!variable) {
                throw new CMachineError('Evaluation Error', `Variable not found ${(left as AST.Identifier).name}`);
            }

            // Write the value to memory
            this.memoryMachine.writeMemory(variable.address, variable.type, right.value);
            return
        }
        // Else handle member expression struct-> or struct. or array[index] or *ptr

        const leftEval: EvalResult = this.evaluateExpression(left);

        console.log('Left eval', leftEval, right);
        if (!leftEval.isLValue) {
            throw new CMachineError('Evaluation Error', 'Cannot assign to rvalue');
        }

        if (!(leftEval.type.primitiveType === right.type.primitiveType && leftEval.type.pointerLevel === right.type.pointerLevel))
            throw new CMachineError('Evaluation Error', `Type mismatch in assignment, trying to assign ${right.type.primitiveType} to ${leftEval.type.primitiveType}`);

        if (leftEval.address === undefined) {
            throw new CMachineError('Evaluation Error', 'Cannot assign to rvalue');
        }

        console.log('Writing to memory', leftEval.address, leftEval.type, right.value);
        this.memoryMachine.writeMemory(leftEval.address, leftEval.type, right.value);


    }

    // Gets increment size based on the type for pointer arithmetic
    private getPointerIncrementSize(type: Type): number {
        if (type.pointerLevel > 0) {
            return getTypeSize({
                primitiveType: type.primitiveType,
                pointerLevel: type.pointerLevel - 1
            });
        }
        return 1;
    }

    // Evaluate a prefix expression
    private evaluatePrefixExpression(expression: AST.PrefixExpression): EvalResult {
        let argument: EvalResult = this.evaluateExpression(expression.argument);

        switch (expression.operator) {
            case '++':
                if (expression.argument.type === 'Identifier') {
                    let variable = this.lookupVariable((expression.argument as AST.Identifier).name);
                    if (variable) {
                        let variableObject = this.getVariableValue(variable);
                        let incrementSize = this.getPointerIncrementSize(variableObject.type);
                        let variableCurrentValue = variableObject.value + incrementSize;
                        this.setVariableValue(variable, variableCurrentValue, variable.type);
                        return {
                            isLValue: false,
                            value: variableCurrentValue,
                            type: variableObject.type
                        }
                    }
                }
            
                if (argument.isLValue && argument.address !== undefined) {
                    let incrementSize = this.getPointerIncrementSize(argument.type);
                    let newValue = argument.value + incrementSize;
                    this.memoryMachine.writeMemory(argument.address, argument.type, newValue);
                    return {
                        isLValue: false,
                        value: newValue,
                        type: argument.type
                    };
                }
                return {
                    isLValue: false,
                    value: ++argument.value,
                    type: argument.type
                }
            case '--':
                if (expression.argument.type === 'Identifier') {
                    let variable = this.lookupVariable((expression.argument as AST.Identifier).name);
                    if (variable) {
                        let variableObject = this.getVariableValue(variable);
                        let incrementSize = this.getPointerIncrementSize(variableObject.type);
                        let variableCurrentValue = variableObject.value - incrementSize;
                        this.setVariableValue(variable, variableCurrentValue, variable.type);
                        return {
                            isLValue: false,
                            value: variableCurrentValue,
                            type: variableObject.type
                        }
                    }
                }
                
                if (argument.isLValue && argument.address !== undefined) {
                    let incrementSize = this.getPointerIncrementSize(argument.type);
                    let newValue = argument.value - incrementSize;
                    this.memoryMachine.writeMemory(argument.address, argument.type, newValue);
                    return {
                        isLValue: false,
                        value: newValue,
                        type: argument.type
                    };
                }
                return {
                    isLValue: false,
                    value: --argument.value,
                    type: argument.type

                }
            default:
                throw new CMachineError('Evaluation Error', `Prefix operator ${expression.operator} not supported`);
        }
    }

    // Evaluate a postfix expression
    private evaluatePostfixExpression(expression: AST.PostfixExpression): EvalResult {
        let argument: EvalResult = this.evaluateExpression(expression.argument);

        switch (expression.operator) {
            case '++':
                if (expression.argument.type === 'Identifier') {
                    let variable = this.lookupVariable((expression.argument as AST.Identifier).name);
                    if (variable) {
                        let variableObject = this.getVariableValue(variable);
                        let old = variableObject.value;
                        let incrementSize = this.getPointerIncrementSize(variableObject.type);
                        let variableCurrentValue = old + incrementSize;
                        this.setVariableValue(variable, variableCurrentValue, variable.type);
                        return {
                            isLValue: false,
                            value: old,
                            type: variableObject.type
                        }
                    }
                }
                if (argument.isLValue && argument.address !== undefined) {
                    let old = argument.value;
                    let incrementSize = this.getPointerIncrementSize(argument.type);
                    this.memoryMachine.writeMemory(argument.address, argument.type, old + incrementSize);
                    return {
                        isLValue: false,
                        value: old,
                        type: argument.type
                    };
                }
                return {
                    isLValue: false,
                    value: argument.value++,
                    type: argument.type
                };
            case '--':
                if (expression.argument.type === 'Identifier') {
                    let variable = this.lookupVariable((expression.argument as AST.Identifier).name);
                    if (variable) {
                        let variableObject = this.getVariableValue(variable);
                        let old = variableObject.value;
                        let incrementSize = this.getPointerIncrementSize(variableObject.type);
                        let variableCurrentValue = old - incrementSize;
                        this.setVariableValue(variable, variableCurrentValue, variable.type);
                        return {
                            isLValue: false,
                            value: old,
                            type: variableObject.type
                        }
                    }
                }
                if (argument.isLValue && argument.address !== undefined) {
                    let old = argument.value;
                    let incrementSize = this.getPointerIncrementSize(argument.type);
                    this.memoryMachine.writeMemory(argument.address, argument.type, old - incrementSize);
                    return {
                        isLValue: false,
                        value: old,
                        type: argument.type
                    };
                }
                return {
                    isLValue: false,
                    value: argument.value--,
                    type: argument.type
                };
            default:
                throw new CMachineError('Evaluation Error', `Postfix operator ${expression.operator} not supported`);
        }
    }

    // Evaluate a unary expression
    private evaluateUnaryExpression(expression: AST.UnaryExpression): EvalResult {
        const argument: EvalResult = this.evaluateExpression(expression.argument);

        switch (expression.operator) {
            case '&':
                if (!argument.address) {
                    throw new CMachineError('Evaluation Error', 'Cannot take address of rvalue');
                }
                return {
                    isLValue: true,
                    value: argument.address,
                    address: argument.address,
                    type: {
                        primitiveType: argument.type.primitiveType,
                        pointerLevel: argument.type.pointerLevel + 1
                    }
                }
            case '*':
                return this.handleDereference(expression);
            case '+':
                return argument;
            case '-':
                return {
                    isLValue: false,
                    value: -argument,
                    type: argument.type,
                }
            case '!':
                return {
                    isLValue: false,
                    value: argument ? 0 : 1,
                    type: argument.type,
                }
            default:
                throw new CMachineError(
                    'Evaluation Error',
                    `Unary ${expression.operator} operator not supported`
                );
        }
    }

    // Handle dereference operator
    private handleDereference(expression: AST.UnaryExpression): EvalResult {
        const argument: EvalResult = this.evaluateExpression(expression.argument);


        const variable = this.lookupVariable((expression.argument as AST.Identifier).name);
        if (variable) {
            if (variable.arrayDimensions && variable.arrayDimensions.length > 0) {
                // Calculate the new pointer level.
                const newPointerLevel = argument.type.pointerLevel - 1;

                // If after decrementing we still have a pointer
                if (newPointerLevel >= 1) {
                    // console.log('Dereference diff', argument.value);
                    return {
                        isLValue: true,
                        value: argument.value,
                        address: argument.value,
                        type: {
                            primitiveType: variable.type.primitiveType,
                            pointerLevel: newPointerLevel,
                        }
                    };
                } else {
                    const baseType = {
                        primitiveType: variable.type.primitiveType,
                        pointerLevel: 0
                    };
                    const memoryVal = this.memoryMachine.readMemory(argument.value, baseType);

                    return {
                        isLValue: false,
                        value: memoryVal,
                        address: argument.value,
                        type: baseType
                    };
                }
            }
        }

        // Standard dereference
        const type = this.memoryMachine.getMemoryInfo(argument.value)?.type || {
            primitiveType: PrimitiveType.INT,
            pointerLevel: 0
        };
        return {
            isLValue: true,
            value: this.memoryMachine.readMemory(argument.value || 0, type),
            address: argument.value,
            type
        };


    }

    // Evaluate an identifier
    private evaluateIdentifier(expression: AST.Identifier): EvalResult {
        // Get the address of the variable
        let variable = this.lookupVariable(expression.name);
        // Check if the variable exists
        if (!variable) {
            this.virtualLog("Variable not found");
            throw new CMachineError('Evaluation Error', `Variable not found ${expression.name}`);
        }

        // If this is an array - decay into a pointer
        if (variable.arrayDimensions && variable.arrayDimensions.length > 0) {
            // Return the pointer to the first element/sub-array.
            return {
                isLValue: false,
                value: variable.address,
                address: variable.address,
                type: {
                    primitiveType: variable.type.primitiveType,
                    pointerLevel: variable.arrayDimensions.length
                },
                remainingDims: variable.arrayDimensions
            }
        } else {
            let memoryValue = this.memoryMachine.readMemory(variable.address, variable.type);

            return {
                isLValue: true,
                value: memoryValue,
                address: variable.address,
                type: variable.type
            }
        }

    }

    // Evaluate an array literal
    private evaluateArrayLiteral(expression: AST.ArrayLiteral): EvalResult {

        const elementCount = expression.value.length;

        // Evaluate first element to determine type
        const firstElement = this.evaluateExpression(expression.value[0]);
        const elementType = firstElement.type;
        const totalSize = elementCount * getPrimitiveTypeSize(elementType.primitiveType);

        // Allocate memory for the array
        const address = this.allocateMemory(totalSize, 'array', elementType, expression);

        // Complete the first element
        const result = this.evaluateExpression(expression.value[0]);
        this.memoryMachine.writeMemory(address, elementType, result);


        // Write each element to memory
        for (let i = 1; i < elementCount; i++) {
            const element = this.evaluateExpression(expression.value[i]);
            if (element.type !== elementType) {
                throw new CMachineError('Evaluation Error', `Array element type mismatch, array is ${elementType} and element is ${element.type}`);
            }
            const result = element.value
            this.memoryMachine.writeMemory(address + i * getTypeSize(elementType), elementType, result);
        }

        return {
            isLValue: true,
            value: address,
            address: address,
            type: {
                primitiveType: PrimitiveType.INT,
                pointerLevel: 1
            }
        };
    }

    // Evaluate a string literal (char array)
    private evaluateStringLiteral(expression: AST.StringLiteral): EvalResult {
        return {
            isLValue: false,
            value: [...expression.value.split('').map((char) => char.charCodeAt(0)), 0],
            type: {
                primitiveType: PrimitiveType.CHAR,
                pointerLevel: 0
            }
        }
    }

    // Evaluate an array initializer
    private evaluateArrayInitializer(expression: AST.ArrayInitializer): EvalResult {
        let value: { value: number, type: Type }[] = [];

        for (let element of expression.values) {
            if (element.type === 'ArrayInitializer') {
                const nestedValue: EvalResult = this.evaluateArrayInitializer(element as AST.ArrayInitializer);
                value.push(
                    {
                        value: nestedValue.value,
                        type: nestedValue.type
                    }
                );
            } else {
                const item: EvalResult = this.evaluateExpression(element as AST.Expression);
                value.push({
                    value: item.value,
                    type: item.type
                });
            }
        }

        return {
            isLValue: false,
            value: value[0],
            type: value[0].type

        }
    }

    // Mock C standard library functions
    private executeStandardLibFunction(name: string, args: any[], location: Location): any {
        if (this.debug)
            console.log('Executing Standard Lib Function', name, args);

        switch (name) {
            case 'printf':
                return this.handlePrintf(args);
            case 'strcpy':
                return this.handleStringCopy(args);
            case 'strlen':
                return this.handleStringLen(args);
            case 'malloc':
                return this.handleMalloc(args, location);
            case 'free':
                return this.handleFree(args);
            // case 'realloc':
            // return this.handleRealloc(args);
            // case 'calloc':
            // return this.handleCalloc(args);
            default:
                throw new CMachineError(
                    'Execution Error',
                    `Standard library function ${name} not found`
                );
        }
    }

    // Handle free function
    private handleFree(args: any[]): any {
        if (args.length === 0) return;
        const argument = this.evaluateExpression(args[0]);
        const address = argument.value;
        this.memoryMachine.freeMemory(address);
        return;
    }

    // STDLIB: Handle string length function
    private handleStringLen(args: any[]): any {
        if (args.length < 1) {
            throw new CMachineError('Execution Error', 'strlen requires 1 argument');
        }

        const str = this.evaluateExpression(args[0]);
        if (!str.address) {
            throw new CMachineError('Execution Error', 'strlen requires a string argument');
        }
        let address = str.address;
        let length = 0;
        let char = this.memoryMachine.readMemory(address, {primitiveType: PrimitiveType.CHAR, pointerLevel: 0});
        while (char !== 0) {
            length++;
            char = this.memoryMachine.readMemory(++address, {primitiveType: PrimitiveType.CHAR, pointerLevel: 0});
        }

        this.returnRegister = length;
        return {
            isLValue: false,
            value: length,
            type: {primitiveType: PrimitiveType.INT, pointerLevel: 0}

        };
    }

    // STRING: Handle string copy function
    private handleStringCopy(args: any[]): any {
        if (args.length < 2) {
            throw new CMachineError('Execution Error', 'strcpy requires 2 arguments');
        }

        const dest = this.evaluateExpression(args[0]);
        const src = this.evaluateExpression(args[1]);

        let address = dest.value;
        let srcAddress = src.value;

        let char = this.memoryMachine.readMemory(srcAddress, {primitiveType: PrimitiveType.CHAR, pointerLevel: 0});
        while (char !== 0) {
            this.memoryMachine.writeMemory(address, {primitiveType: PrimitiveType.CHAR, pointerLevel: 0}, char);
            char = this.memoryMachine.readMemory(++srcAddress, {primitiveType: PrimitiveType.CHAR, pointerLevel: 0});
            address++;
        }

        this.memoryMachine.writeMemory(address, {primitiveType: PrimitiveType.CHAR, pointerLevel: 0}, 0);

        this.returnRegister = dest.value;
        return dest.value;
    }

    // Check if a function is a standard library function
    private isStandardLibFunction(name: string): boolean {
        switch (name) {
            case 'printf':
            case 'malloc':
            case 'realloc':
            case 'strlen':
            case 'strcpy':
            case 'free':
            case 'calloc':
                return true;
            default:
                return false;
        }
    }

    // Support malloc function (mocked in js)
    private handleMalloc(args: any[], location: Location): any {
        if (args.length === 0) return 0;
        const argument = this.evaluateExpression(args[0]);
        const size = argument.value;
        let address = this.allocateMemory(size, `malloc_${this.mallocCounter++}`, {
            primitiveType: PrimitiveType.INT,
            pointerLevel: 0
        }, location);
        this.returnRegister = address;
        return {
            isLValue: false,
            value: address,
            address: address,
        }
    }

    // Support printf function (mocked in js)
    private handlePrintf(args: any[]): void {
        if (args.length === 0) return;
        const formatString = args[0] as AST.StringLiteral;
        if (formatString.type !== 'StringLiteral') {
            throw new CMachineError('Execution Error', 'Format string not provided');
        }

        formatString.value = formatString.value.replace(/\\(n|t|\\|")/g, (match, p1) => p1 === 'n' ? '\n' : p1 === 't' ? '\t' : p1);

        let output = '';
        let argIndex = 1;

        for (let i = 0; i < formatString.value.length; i++) {
            if (formatString.value[i] === '%' && i + 1 < formatString.value.length) {
                i++;
                switch (formatString.value[i]) {
                    case 'd':
                    case 'i':
                        output += this.evaluateExpression(args[argIndex++]).value;
                        break;
                    case 'f':
                        output += this.evaluateExpression(args[argIndex++]).value.toFixed(6);
                        break;
                    case 's':
                        let string = '';
                        let address = this.evaluateExpression(args[argIndex++]).value;
                        let char = this.memoryMachine.readMemory(address, {
                            primitiveType: PrimitiveType.CHAR,
                            pointerLevel: 0
                        });
                        while (char !== 0) {
                            string += String.fromCharCode(char);
                            char = this.memoryMachine.readMemory(++address, {
                                primitiveType: PrimitiveType.CHAR,
                                pointerLevel: 0
                            });

                        }
                        output += string;
                        break;
                    case 'p':
                        output += '0x' + this.evaluateExpression(args[argIndex++]).value.toString(16).toUpperCase();
                        break;
                    case 'c':
                        output += String.fromCharCode(
                            this.evaluateExpression(args[argIndex++]).value
                        );
                        break;
                    default:
                        output += '%' + formatString.value[i];
                        break;
                }
            } else {
                output += formatString.value[i];
            }
        }

        this.virtualLog(output);

    }

    // Map top level functions to the function table
    initializeGlobalFunctions(): void {
        if (this.debug)
            console.log('Initializing global functions');

        const program = this.programAST;

        // Extract global declarations
        const globalDeclarations: AST.Declaration[] = program.globalDeclarations;

        // Filter out function declarations
        const functionDeclarations: AST.Declaration[] = globalDeclarations.filter(
            (declaration) => declaration.type === 'FunctionDeclaration'
        );

        // Process global functions
        for (let declaration of functionDeclarations) {
            const funcDeclaration: AST.FunctionDeclaration =
                declaration as AST.FunctionDeclaration;
            const name = funcDeclaration.id.name;
            const returnTypeSpecifier = funcDeclaration.typeSpecifier;
            const returnType = typeSpecifierToType(returnTypeSpecifier);
            const parameters: Parameter[] = [];

            for (let parameter of funcDeclaration.parameters) {
                let paramTypeSpecifier = parameter.typeSpecifier;
                let paramType = typeSpecifierToType(paramTypeSpecifier);
                let name = parameter.id.name;
                parameters.push({name, type: paramType});
            }

            let body = funcDeclaration.body;

            this.functionTable.set(name, {name, returnType, parameters, body});
        }

    }

    // Map top level variables to the global scope
    initializeGlobalScope(): void {
        if (this.debug)
            console.log('Initializing global scope');

        const program = this.programAST;

        // Extract global declarations
        const globalDeclarations: AST.Declaration[] = program.globalDeclarations;

        // Filter out variable declarations
        const variableDeclarations: AST.Declaration[] = globalDeclarations.filter(
            (declaration) => declaration.type === 'VariableDeclaration'
        );


        let proposals: MemoryAllocationProposal[] = [];

        // Process global variables
        for (let declaration of variableDeclarations) {
            let varDeclaration: AST.VariableDeclaration =
                declaration as AST.VariableDeclaration;
            const declarators: AST.Declarator[] = varDeclaration.declarators;

            for (let declarator of declarators) {
                const variable: AST.VariableDeclarator =
                    declarator as AST.VariableDeclarator;
                const name = variable.id.name;
                const typeSpecifier = variable.typeSpecifier;
                const type = typeSpecifierToType(typeSpecifier);
                const size = getTypeSize(type);

                let initValue;
                if (variable.init)
                    initValue = this.evaluateExpression(variable.init as AST.Expression);

                proposals.push({
                    size,
                    identifier: name,
                    type: typeSpecifierToType(typeSpecifier),
                    location: variable.location,
                    value: initValue?.value
                });
            }
        }

        // Sort proposals by initialisation or uninitialized
        proposals = proposals.sort((a, b) => {
            if (a.value) {
                return -1;
            }
            return 1;
        });

        let addresses: number[] = this.memoryMachine.processGlobalDeclaration(proposals);

        for (let i = 0; i < proposals.length; i++) {
            let proposal = proposals[i];
            this.globalScope.set(
                proposal.identifier,
                {
                    name: proposal.identifier,
                    address: addresses[i],
                    size: proposal.size,
                    type: proposal.type
                }
            );
        }

    }

    // Push a new stack frame to the call stack
    pushStackFrame(frame: StackFrame): void {
        if (this.debug)
            console.log('Pushing stack frame', frame);
        this.callStack.push(frame);
        this.currentScope++;
    }

    // Pop the top stack frame from the call stack
    popStackFrame(): void {
        // Check if stack is empty
        if (this.callStack.length == 0) {
            throw new CMachineError('Stack Error', 'Stack is empty');
        }

        // Pop stack frame
        let frame = this.callStack.pop();
        if (this.debug)
            console.log('Popping stack frame', frame);
        if (frame) {
            // Free the parameter memory
            for (let variable of frame.variables.values()) {
                if (this.debug)
                    console.log('Freeing memory', variable);
                this.memoryMachine.freeMemory(variable.address);
            }
        }

        // Decrease the current scope
        this.currentScope--;
    }


    // Declare a variable in the current stack frame
    declareVariable(
        name: string,
        type: Type,
        isGlobal: boolean,
        value: any = null,
        forceSize: number | undefined = undefined,
        location: Location
    ): EvalResult {
        let size = getTypeSize(type);

        if (forceSize) {
            size = forceSize;
        }


        let address = 0;

        if (isGlobal) {
            address = this.memoryMachine.allocateOnHeap(size, `global_${name}`, value, type, location);
            this.globalScope.set(name, {
                name,
                address,
                size,
                type,
            });
        } else {
            let currentFrame = this.getCurrentStackFrame();
            address = this.memoryMachine.allocateOnStack(
                size,
                `${currentFrame.name}_${name}`,
                value,
                type,
                location
            );
            currentFrame.variables.set(name, {name, type, address, size});
        }

        return {
            isLValue: true,
            value: address,
            address: address,
            type
        }
    }

    // Lookup a variable in the current stack frame or global scope
    lookupVariable(name: string): Variable | undefined {
        let variable = null;


        // Check if variable is in the current stack frame
        if (this.callStack.length > 0) {
            let currentFrame = this.getCurrentStackFrame();
            variable = currentFrame.variables.get(name);
        }

        // Check if variable is in the global scope
        if (!variable) {
            variable = this.globalScope.get(name);
        }
        return variable;
    }

    // Get the value of a tracked variable
    getVariableValue(variable: Variable): EvalResult {
        let allocation = this.memoryMachine.getMemoryInfo(variable.address);
        if (!allocation) {
            throw new CMachineError('Memory Error', 'Variable not found');
        }

        const value = this.memoryMachine.readMemory(variable.address, allocation.type);
        return {
            isLValue: true,
            value: value,
            address: variable.address,
            type: allocation.type
        }
    }

    // Get the value of at a given memory address of a given size
    getHeapSection(address: number, size: number): number[] {
        let allocation = this.memoryMachine.getMemoryInfo(address);
        if (!allocation) {
            throw new CMachineError('Memory Error', 'Variable not found');
        }
        return this.memoryMachine.readMemorySegment(address, size);
    }

    // Set the value of a tracked variable
    setVariableValue(variable: Variable, value: number, type: Type): void {
        let allocation = this.memoryMachine.getMemoryInfo(variable.address);
        if (!allocation) {
            throw new CMachineError('Memory Error', 'Variable not found');
        }
        this.memoryMachine.writeMemory(variable.address, type, value);
    }

    // Get the address of a variable in the current stack frame or global scope
    allocateMemory(size: number, identifier: string, type: Type, location: Location): number {
        return this.memoryMachine.allocateOnHeap(size, identifier, 0, type, location);
    }

    // Get the current stack frame
    getCurrentStackFrame(): StackFrame {
        // Check if stack is empty
        if (this.callStack.length == 0) {
            throw new CMachineError('Stack Error', 'Stack is empty');
        }

        return this.callStack[this.callStack.length - 1];
    }

    // Current program snapshot
    getProgramSnapshot()
        :
        ProgramSnapshot {
        return {
            memory: this.memoryMachine,
            callStack: this.callStack,
            globalScope: this.globalScope,
            functionTable: this.functionTable,
            currentLine: this.getCurrentStepLine(),
            executionStack: this.executionStack,
            machine: this
        };
    }

}





