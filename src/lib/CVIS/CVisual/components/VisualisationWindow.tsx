import * as AST from '@CParser/CAst.ts';
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx"
import {Separator} from "@/components/ui/separator.tsx";
import {ScrollArea} from "@radix-ui/react-scroll-area";
import CallStackCards from "@CVIS/CVisual/components/CallStackCards.tsx";
import {ProgramSnapshot} from "@CMachine/CMachine.ts";
import MemorySlider from "@CVisual/components/MemorySlider.tsx";
import HeapCard from "@CVisual/components/HeapCard.tsx";
import {MemoryDump} from "@CVisual/components/MemoryDump.tsx";
import {useEffect, useState} from "react";
import {ByteMemory} from "@CMachine/CMemory.ts";
import {Statement} from "@CParser/CAst.ts";
import {Callstack} from "@CVisual/components/Callstack.tsx";


export const VisualisationWindow = ({state, ast, snapshot, executionStack}: {
    state: string,
    ast: AST.Program | null,
    snapshot: ProgramSnapshot,
    executionStack: Statement[]
}) => {

    const [memory, setMemory] = useState<Uint8Array>();
    const [updateCounter, setUpdateCounter] = useState(0); // Forces dump update for silly react issues
    const [executionStackNames, setExecutionStackNames] = useState<string[]>();


    useEffect(() => {
        if (snapshot) {
            const memoryObj: ByteMemory = snapshot.memory.getMemory();
            const rawMemory: Uint8Array = memoryObj.getMemory();
            setMemory(rawMemory);
            setUpdateCounter(p => p + 1);
            // console.log(memory);
        }
        if (!executionStack) return;
        setExecutionStackNames(executionStack.map((statement) => {
            return statement.type;
        }));

    }, [snapshot, executionStack]);


    return (
        <div className="w-full">
            <Tabs defaultValue="stack" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="stack">Stack</TabsTrigger>
                    <TabsTrigger value="heap">Heap</TabsTrigger>
                    <TabsTrigger value="raw">Dump</TabsTrigger>
                    {/*<TabsTrigger value="breakdown">Breakdown</TabsTrigger>*/}
                    {/*<TabsTrigger value="parser">Parser</TabsTrigger>*/}
                </TabsList>
                <TabsContent value="raw" className="mt-4">
                    {memory && snapshot &&
                        <MemoryDump key={updateCounter}
                                    memoryData={memory}
                                    stackPointer={snapshot.memory.StackPointer}
                                    heapPointer={snapshot.memory.HeapPointer}
                                    allocations={snapshot.memory.getAllocations()}/>

                    }
                </TabsContent>

                {/* For parser debugging*/}
                {/*<TabsContent value="parser" className="mt-4">*/}
                {/*    <h3 className="text-lg font-semibold mb-2">Raw Parser Output:</h3>*/}
                {/*    <ScrollArea className="h-[600px] rounded-md border overflow-y-scroll">*/}
                {/*        <div className="p-4">*/}
                {/*          <pre className="whitespace-pre-wrap break-words w-full">*/}
                {/*            <code>{JSON.stringify(ast, null, 2)}</code>*/}
                {/*          </pre>*/}
                {/*        </div>*/}
                {/*    </ScrollArea>*/}

                {/*</TabsContent>*/}

                {/*<TabsContent value="breakdown" className="mt-4">*/}
                {/*    {snapshot &&*/}
                {/*        <MemorySlider*/}
                {/*            memSize={snapshot.memory.MemorySize}*/}
                {/*            stackPointer={snapshot.memory.StackPointer}*/}
                {/*            heapPointer={snapshot.memory.HeapPointer}*/}
                {/*            bssPointer={snapshot.memory.BSSPointer}*/}
                {/*            dataPointer={snapshot.memory.DataPointer}*/}
                {/*        />}*/}
                {/*</TabsContent>*/}
                <TabsContent value='heap' className={'mt-4'}>
                    {snapshot &&
                        <HeapCard heap={snapshot.memory.getHeapDump()} cMachine={snapshot.machine}/>
                    }
                </TabsContent>
                <TabsContent value="stack" className="mt-4">
                    {snapshot && (
                        <Callstack snapshot={snapshot}/>
                    )
                    }
                </TabsContent>
            </Tabs>
        </div>
    )
}
