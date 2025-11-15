import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import {cn} from "@lib/utils.ts";

const MemoryIndicator = React.forwardRef<
    React.ElementRef<typeof ProgressPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    dataValue: number,
    bssValue: number,
    unallocatedValue: number,
    heapValue: number,
    stackValue: number,
    memorySize: number
}
>(({className, dataValue, bssValue, heapValue, stackValue, unallocatedValue, memorySize, ...props}, ref) => {
    // Calculate total and ensure it does not exceed 100
    let dataRatio = (dataValue / 8) / memorySize;
    const dataValuePercentage = isNaN(dataRatio) ? 0 : dataRatio * 100;
    let bssRatio = (bssValue / 8) / memorySize;
    const bssValuePercentage = isNaN(bssRatio) ? 0 : dataValuePercentage + (((bssValue - dataValue) / 8) / memorySize * 100);
    let heapRatio = (heapValue / 8) / memorySize;
    const heapValuePercentage = isNaN(heapRatio) ? 0 : bssValuePercentage + (((heapValue - bssValue) / 8) / memorySize * 100);
    const stackValuePercentage = isNaN((memorySize - stackValue) / memorySize * 100) ? 0 : (memorySize - stackValue) / memorySize * 100;


    return (
        <ProgressPrimitive.Root
            ref={ref}
            className={cn(
                "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
                className
            )}
            {...props}
        >

            {/*Heap Indicator*/}
            <ProgressPrimitive.Indicator
                className="h-full w-full flex-1 bg-purple-500 transition-all"
                style={{width: `${heapValuePercentage}%`, position: 'absolute', left: 0}}
            />

            {/*BSS Indicator*/}
            <ProgressPrimitive.Indicator
                className="h-full w-full flex-1 bg-orange-500 transition-all"
                style={{width: `${bssValuePercentage}%`, position: 'absolute', left: 0}}
            />

            {/*Data Indicator*/}
            <ProgressPrimitive.Indicator
                className="h-full w-full flex-1 bg-red-500 transition-all"
                style={{width: `${dataValuePercentage}%`, position: 'absolute', left: 0}}
            />

            {/*Stack Indicator*/}
            <ProgressPrimitive.Indicator
                className="h-full w-full flex-1 bg-blue-500 transition-all"
                style={{width: `${stackValuePercentage}%`, position: 'absolute', right: 0}}
            />
        </ProgressPrimitive.Root>
    );
});

MemoryIndicator.displayName = ProgressPrimitive.Root.displayName;
export {MemoryIndicator};