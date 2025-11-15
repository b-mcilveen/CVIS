import type React from "react"
import {useState} from "react"
import type {MemoryAllocation} from "@CMachine/CMemory.ts"
import type {ProgramStateMachine} from "@CMachine/CMachine.ts"
import {Badge} from "@/components/ui/badge.tsx"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx"
import {ChevronDown, ChevronUp, Database, HardDrive, Info, MemoryStick} from "lucide-react"
import {MemoryDisplay} from "@CVisual/components/MemoryDisplay.tsx"
import {Button} from "@/components/ui/button.tsx";


interface HeapCardProps {
    heap: MemoryAllocation[]
    cMachine: ProgramStateMachine
}

const HeapCard: React.FC<HeapCardProps> = ({heap, cMachine}) => {
    const [expandedAllocations, setExpandedAllocations] = useState<Record<number, boolean>>(
        Object.fromEntries(heap.map((_, i) => [i, i === 0])),
    )

    const toggleAllocation = (index: number) => {
        setExpandedAllocations((prev) => ({
            ...prev,
            [index]: !prev[index],
        }))
    }

    if (heap.length === 0) {
        return null
    }

    return (
        <Card className="w-full shadow-md">
            <CardHeader className="bg-muted/30 pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <MemoryStick className="h-5 w-5"/>
                    Heap Memory
                    <Badge variant="outline" className="ml-2">
                        {heap.length} allocation{heap.length !== 1 ? "s" : ""}
                    </Badge>
                    {heap.reduce((acc, allocation) => acc + allocation.size, 0) > 0 && (
                        <Badge variant="destructive" className="ml-2">
                            {heap.reduce((acc, allocation) => acc + allocation.size, 0)} bytes unfreed
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y">
                    {heap.map((allocation: MemoryAllocation, index: number) => {
                        const isExpanded = expandedAllocations[index] ?? false
                        const memory = cMachine.getHeapSection(allocation.start, allocation.size)

                        return (
                            <div key={index} className="transition-colors">
                                <div
                                    className="flex cursor-pointer items-center justify-between p-3 hover:bg-muted/30"
                                    onClick={() => toggleAllocation(index)}
                                >
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="h-6 min-w-6 justify-center px-1.5">
                                            {index + 1}
                                        </Badge>
                                        <span className="font-mono font-medium">{allocation.identifier}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isExpanded ? <ChevronUp className="h-4 w-4"/> :
                                            <ChevronDown className="h-4 w-4"/>}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-3 pb-3">
                                        <div className="rounded-md border bg-card p-3">
                                            <div className="mb-3 flex flex-wrap items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <HardDrive className="h-4 w-4 text-muted-foreground"/>
                                                    <span className="text-sm text-muted-foreground">Address:</span>
                                                    <span
                                                        className="font-mono text-sm text-amber-600 dark:text-amber-400">
                            0x{allocation.start.toString(16).toUpperCase().padStart(8, "0")}
                          </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Database className="h-4 w-4 text-muted-foreground"/>
                                                    <span className="text-sm text-muted-foreground">Size:</span>
                                                    <span className="font-mono text-sm">{allocation.size} bytes</span>
                                                </div>

                                                <div className={"flex items-center gap-2"}>
                                                    <span
                                                        className="text-sm text-muted-foreground">Location:</span>
                                                    <Badge variant={"outline"}>
                                                        Line {allocation.location.line}
                                                    </Badge>
                                                    <Badge variant={"outline"}>
                                                        Column {allocation.location.line}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <h4 className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                                                    <Info className="h-4 w-4"/>
                                                    Memory Content
                                                </h4>

                                                <Tabs defaultValue="hex" className="w-full">
                                                    <TabsList className="mb-2 grid w-full grid-cols-3">
                                                        <TabsTrigger value="hex">Hexadecimal</TabsTrigger>
                                                        <TabsTrigger value="decimal">Decimal</TabsTrigger>
                                                        <TabsTrigger value="text">ASCII Text</TabsTrigger>
                                                    </TabsList>

                                                    <TabsContent value="hex" className="mt-0">
                                                        <MemoryDisplay memory={memory} format="hex" bytesPerRow={8}/>
                                                    </TabsContent>

                                                    <TabsContent value="decimal" className="mt-0">
                                                        <MemoryDisplay memory={memory} format="decimal"
                                                                       bytesPerRow={8}/>
                                                    </TabsContent>

                                                    <TabsContent value="text" className="mt-0">
                                                        <MemoryDisplay memory={memory} format="text" bytesPerRow={8}/>
                                                    </TabsContent>
                                                </Tabs>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}


export default HeapCard

