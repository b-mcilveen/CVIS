# CVIS: C Interpreter and Visualisation System

An educational web-based C interpreter with real-time memory visualisation, designed to help students understand C programming concepts, memory management, and program execution flow.

## Features

- **Complete C Parser** - Supports modern C syntax including structs, pointers, arrays, and control flow
- **Virtual Machine** - Byte-level memory simulation with stack, heap, data, and BSS segments
- **Real-time Visualisation** - Interactive visualisations of call stack, heap allocations, and raw memory
- **Step-by-step Debugging** - Execute programs one statement at a time
- **Built-in Standard Library** - Includes printf, malloc, free, strlen, strcpy, and more
- **React Integration** - Easy-to-use hooks for embedding in web applications

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## Usage

```typescript
import { useCVirtualMachine } from './hooks/useCVirtualMachine';

function App() {
  const [
    runProgram,
    stepProgram,
    resetVirtualMachine,
    setInputCode,
    setConsoleOutput,
    setErrorOutput,
    virtualMachineMetadata,
  ] = useCVirtualMachine();

  return (
    <div>
      <Editor code={virtualMachineMetadata.inputCode} onChange={setInputCode} />
      <Toolbar
        onRun={runProgram}
        onStep={stepProgram}
        onReset={resetVirtualMachine}
      />
      <VisualisationWindow snapshot={virtualMachineMetadata.programSnapshot} />
    </div>
  );
}
```

## Architecture

CVIS consists of three main components:

- **CParser** (`/src/lib/CVIS/CParser`) - Lexical analysis and syntax parsing using Pratt parsing
- **CMachine** (`/src/lib/CVIS/CMachine`) - Tree-walking interpreter with virtual memory simulation
- **CVisual** (`/src/lib/CVIS/CVisual`) - React visualisation components for program state

## Supported C Features

### Data Types

- Primitive types: char, short, int, long, float, double
- Pointers and multi-dimensional arrays
- Structs, unions, enums, and typedefs

### Statements

- Control flow: if/else, while, do-while, for, switch
- Jump statements: break, continue, return
- Compound statements with local declarations

### Operators

- Arithmetic, logical, bitwise, comparison
- Assignment and compound assignment
- Pointer operations (address-of, dereference)
- Array indexing and struct member access
- Type casting and sizeof

### Standard Library

- I/O: printf
- Memory: malloc, calloc, realloc, free
- String: strlen, strcpy

## Known Limitations

- No preprocessor (no #include, #define, etc.)
- Limited standard library
- 32-bit architecture simulation with 512-byte default memory
- Single interpreter unit only
- No function pointers, goto, or variadic functions (except printf)

## Project Structure

```
src/
├── lib/CVIS/
│   ├── CParser/       # Scanner, parser, AST definitions
│   ├── CMachine/      # Virtual machine and memory simulation
│   └── CVisual/       # React visualisation components
├── hooks/             # React integration hooks
├── components/        # UI components
└── pages/             # Application pages
```

## Contributing

Contributions are welcome! Areas for improvement:

- Improving the interpreter to be more C-like
- On-the-go AST hot-reload (the whole tree doesn't re-parse for a tiny change)
- Additional standard library functions
- Language feature completion (ternary operator, function pointers)
- Enhanced visualisations
- Better error messages
- Documentation and examples

Please include tests with your contributions and ensure `npm test` passes.

## Educational Purpose

CVIS is designed as an educational tool for teaching C programming concepts. It prioritises clarity and visualisation over performance and completeness, making it ideal for:

- Learning pointer arithmetic and memory management
- Understanding stack frames and function calls
- Visualising program execution flow
- Debugging memory-related issues
- Teaching compiler and interpreter concepts
