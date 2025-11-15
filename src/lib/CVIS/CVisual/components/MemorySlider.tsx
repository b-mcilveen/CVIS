import {MemoryIndicator} from "@CVisual/components/MemoryIndicator.tsx"
import {CProgramLayout} from "@CMachine/CMemory.ts";

interface MemorySliderProps {
    memSize: number,
    stackPointer: number,
    heapPointer: number,
    dataPointer: number,
    bssPointer: number,
}

const MemorySlider: React.FC<MemorySliderProps> = ({
                                                       memSize,
                                                       stackPointer,
                                                       heapPointer,
                                                       dataPointer,
                                                       bssPointer
                                                   }) => {

    return (
        <div className="w-full max-w-md mx-auto p-4">
            <h2 className="text-lg font-semibold mb-2">Memory Usage</h2>

            <div className="relative h-8">
                <MemoryIndicator
                    bssValue={bssPointer}
                    dataValue={dataPointer}
                    heapValue={heapPointer}
                    stackValue={stackPointer}
                    unallocatedValue={stackPointer - heapPointer}
                    memorySize={memSize}
                    className="h-8"/>
            </div>


            <div className="flex justify-between mt-2 text-sm">
                <span>0 Byte</span>
                <span>{memSize} Byte</span>
            </div>
            <div className="flex flex-col justify-between mt-4 text-sm">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 mr-1 rounded-sm"></div>
                    <span>Data ({dataPointer} Bytes Allocated)</span>

                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 mr-1 rounded-sm"></div>
                    <span>BSS ({bssPointer - dataPointer} Bytes Allocated)</span>

                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 mr-1 rounded-sm"></div>
                    <span>Heap ({(heapPointer - bssPointer) / 8} Bytes Allocated)</span>

                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-400 mr-1 rounded-sm"></div>
                    <span>Stack ({(memSize - stackPointer) / 8} Bytes Allocated)</span>
                </div>
            </div>
        </div>
    )
}

export default MemorySlider

