import type {ProgramStateMachine} from "@CMachine/CMachine.ts";
import type {Variable} from "@CMachine/CMachineTypes.ts";
import {HardDrive, Link} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {MemoryDisplay} from "@CVisual/components/MemoryDisplay.tsx";
import React from "react";

interface PointerWindowProps {
    cMachine: ProgramStateMachine,
    variable: Variable
}

export const PointerWindow = ({cMachine, variable}: PointerWindowProps) => {

    const variableValue = cMachine.getVariableValue(variable).value;

    const allocation = cMachine.memoryMachine.MemoryAllocated?.find(
        allocation => variableValue >= allocation.start && variableValue < allocation.start + allocation.size
    );

    if (!allocation) return <p>Error no link</p>;
    const memory = cMachine.getHeapSection(allocation.start, allocation.size);

    return (
        <div className="absolute top-[-0.20rem] h-full w-full right-[calc(-100%-0.75rem)]">
            <div className="absolute top-[50%] h-1 w-[50px] bg-blue-500 text-center flex flex-col items-center">
                <Link className="absolute top-[-0.5rem] h-4 w-4 px-1 py-1 box-content bg-white text-blue-500"/>
            </div>

            {/*    */}
            <div className="absolute left-[50px]">
                <div className="rounded-md border bg-card p-3">
                    <div className="mb-3 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-muted-foreground"/>
                            <span className="text-sm text-muted-foreground">Memory:</span>
                            <span
                                className="font-mono text-sm text-amber-600 dark:text-amber-400">
                            0x{allocation.start.toString(16).toUpperCase().padStart(8, "0")}
                          </span>
                            <span className="font-mono text-sm">({allocation.size} bytes)</span>
                        </div>
                    </div>

                    <div className="mt-4">

                        <Tabs defaultValue="hex" className="w-full">
                            <TabsList className="mb-2 grid w-full grid-cols-3">
                                <TabsTrigger value="hex">Hexadecimal</TabsTrigger>
                                <TabsTrigger value="decimal">Decimal</TabsTrigger>
                                <TabsTrigger value="text">ASCII Text</TabsTrigger>
                            </TabsList>

                            <TabsContent value="hex" className="mt-0">
                                <MemoryDisplay memory={memory} format="hex" bytesPerRow={8}
                                               highlightAddress={variableValue - allocation.start}/>
                            </TabsContent>

                            <TabsContent value="decimal" className="mt-0">
                                <MemoryDisplay memory={memory} format="decimal"
                                               bytesPerRow={8} highlightAddress={variableValue - allocation.start}/>
                            </TabsContent>

                            <TabsContent value="text" className="mt-0">
                                <MemoryDisplay memory={memory} format="text" bytesPerRow={8}
                                               highlightAddress={variableValue - allocation.start}/>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>

    )
}