import type React from "react"
import {useState} from "react"
import {Badge} from "@/components/ui/badge.tsx"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx"
import {HardDrive, Info} from "lucide-react"
import {MemoryAllocation} from "@CMachine/CMemory.ts";
import {ColourPicker} from "@lib/utils.ts";

const DEFAULT_BYTES_PER_ROW = 16

interface MemoryDumpProps {
    memoryData: Uint8Array
    heapPointer: number,
    stackPointer: number,
    allocations?: MemoryAllocation[],
    title?: string
    bytesPerRow?: number
}

export const MemoryDump: React.FC<MemoryDumpProps> = ({
                                                          memoryData,
                                                          title = "Memory Dump",
                                                          bytesPerRow = DEFAULT_BYTES_PER_ROW,
                                                          allocations,
                                                          heapPointer,
                                                          stackPointer,
                                                      }) => {
    const [activeView, setActiveView] = useState<"ascii" | "decimal">("ascii")
    if (!memoryData || memoryData.length === 0) return null

    const colourPicker: ColourPicker = ColourPicker.Instance

    // Precompute a mapping from allocation identifier to a given colour using randomColour()
    const allocationColours: { [identifier: string]: string } = {}
    allocations?.forEach((alloc) => {
        allocationColours[alloc.identifier] = colourPicker.randomColour()
    })

    bytesPerRow = activeView === "ascii" ? bytesPerRow : bytesPerRow / 2;

    // Build rows from the memoryData into chunks of bytesPerRow
    const rows = []
    for (let i = 0; i < memoryData.length; i += bytesPerRow) {
        rows.push({
            address: i,
            bytes: Array.from(memoryData.slice(i, i + bytesPerRow)),
        })
    }

    // Group bytes within a row into segments based on allocation boundaries.
    // This function is defined outside the return so that our grouping logic is precomputed.
    const groupRowBytes = (row: { address: number; bytes: number[] }) => {
        type Group = {
            isAllocated: boolean
            bytes: number[]
            allocation?: typeof allocations[number]
        }
        const groups: Group[] = []
        let currentGroup: Group | null = null

        row.bytes.forEach((byte, idx) => {
            const byteAddress = row.address + idx
            // Look for an allocation covering this byte:
            const alloc = allocations?.find(
                (a) => byteAddress >= a.start && byteAddress < a.start + a.size
            )
            const isAlloc = !!alloc

            if (currentGroup === null) {
                // start a new group
                currentGroup = {isAllocated: isAlloc, bytes: [byte], allocation: alloc}
            } else {
                // start new group if the allocation state has changed OR if we switched allocation.
                if (
                    currentGroup.isAllocated !== isAlloc ||
                    (isAlloc && currentGroup.allocation!.identifier !== alloc!.identifier)
                ) {
                    groups.push(currentGroup)
                    currentGroup = {isAllocated: isAlloc, bytes: [byte], allocation: alloc}
                } else {
                    currentGroup.bytes.push(byte)
                }
            }
        })
        if (currentGroup) groups.push(currentGroup)
        return groups
    }

    return (
        <Card className="w-full shadow-md">
            <TooltipProvider>
                <CardHeader className="bg-muted/30 pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <HardDrive className="h-5 w-5"/>
                        {title}
                        <Badge variant="outline" className="ml-2">
                            {memoryData.length} bytes
                        </Badge>
                    </CardTitle>

                    <Tabs
                        defaultValue="ascii"
                        onValueChange={(value) => {
                            setActiveView(value as "ascii" | "decimal")
                            console.log('change');
                        }}
                    >
                        <div className="mb-3 flex items-center gap-5">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">View Mode:</span>
                            </div>
                            <TabsList>
                                <TabsTrigger value="ascii">ASCII</TabsTrigger>
                                <TabsTrigger value="decimal">Decimal</TabsTrigger>
                            </TabsList>
                        </div>
                    </Tabs>
                </CardHeader>
                <CardContent className="px-3">


                    <div className="rounded-md border">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="bg-muted/50">
                                    <th className="border-r px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                                        Address
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                                        Hexadecimal
                                    </th>
                                    <th className="border-l px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                                        ASCII
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {rows.map((row, rowIndex) => {
                                    const groups = groupRowBytes(row)
                                    return (
                                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-muted/20" : ""}>
                                            <td className="border-r px-3 py-2 font-mono text-xs text-muted-foreground">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                  <span
                                      className={
                                          row.address <= stackPointer &&
                                          stackPointer <= row.address + bytesPerRow
                                              ? "text-red-600"
                                              : (row.address <= heapPointer &&
                                              heapPointer < row.address + bytesPerRow
                                                  ? "text-blue-600"
                                                  : "")
                                      }
                                  >
                                    0x{row.address.toString(16).toUpperCase().padStart(4, "0")}
                                  </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="text-xs">
                                                        {row.address <= stackPointer && stackPointer < row.address + bytesPerRow
                                                            ? `Stack Pointer 0x${stackPointer
                                                                .toString(16)
                                                                .toUpperCase()
                                                                .padStart(8, "0")}`
                                                            : row.address <= heapPointer && heapPointer < row.address + bytesPerRow
                                                                ? `Heap Pointer 0x${heapPointer
                                                                    .toString(16)
                                                                    .toUpperCase()
                                                                    .padStart(8, "0")}`
                                                                : ""}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </td>
                                            <td className="px-3 py-2 font-mono text-xs">
                                                <div className="flex flex-wrap">
                                                    {groups.map((group, groupIndex) => (
                                                        <Tooltip key={groupIndex}>
                                                            <TooltipTrigger asChild>
                                      <span
                                          className={`rounded px-1 ${group.isAllocated && group.allocation ? allocationColours[group.allocation.identifier] : ''}`}

                                      >
                                        {group.bytes
                                            .map((byte) =>
                                                byte.toString(16).toUpperCase().padStart(2, "0")
                                            )
                                            .join(" ")}
                                      </span>
                                                            </TooltipTrigger>
                                                            {group.isAllocated && group.allocation && (
                                                                <TooltipContent side="top" className="text-xs">
                                                                    <div className="grid grid-cols-2 gap-x-2">
                                                                        <span>Identifier:</span>
                                                                        <span>{group.allocation.identifier}</span>
                                                                        <span>Type:</span>
                                                                        <span>{group.allocation.type.primitiveType}</span>
                                                                        <span>Start:</span>
                                                                        <span> 0x
                                                                            {group.allocation.start
                                                                                .toString(16)
                                                                                .toUpperCase()
                                                                                .padStart(8, "0")}
                                                                        </span>
                                                                        <span>Size:</span>
                                                                        <span>{group.allocation.size} bytes</span>
                                                                    </div>
                                                                </TooltipContent>
                                                            )}
                                                        </Tooltip>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="border-l px-3 py-2 font-mono text-xs">
                                                {activeView === "ascii" ? row.bytes.map((byte) => (byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ".")).join("") : row.bytes.map((byte) => byte.toString(10).padStart(3, "0")).join(" ")}
                                            </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Info className="h-3.5 w-3.5"/>
                        <span>Invalid ascii is display as (.)</span>
                    </div>
                </CardContent>
            </TooltipProvider>
        </Card>
    )
}