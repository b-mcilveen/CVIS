import type React from "react";

interface MemoryDisplayProps {
    memory: number[]
    format: "hex" | "decimal" | "text"
    bytesPerRow: number
    highlightAddress: number | undefined
}

export const MemoryDisplay: React.FC<MemoryDisplayProps> = ({memory, format, bytesPerRow, highlightAddress}) => {
    // Create rows of memory bytes
    const rows = []
    for (let i = 0; i < memory.length; i += bytesPerRow) {
        rows.push(memory.slice(i, i + bytesPerRow))
    }
    // console.log(highlightAddress);
    const formatByte = (byte: number): string => {
        switch (format) {
            case "hex":
                return byte.toString(16).toUpperCase().padStart(2, "0")
            case "decimal":
                return byte.toString(10).padStart(3, " ")
            case "text":
                return byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : "."
            default:
                return ""
        }
    }

    return (
        <div className="overflow-x-auto rounded-md border">
            <table className="w-full">
                <thead>
                <tr className="bg-muted/50">
                    <th className="border-r px-2 py-1 text-left text-xs font-medium text-muted-foreground">Offset</th>
                    {Array.from({length: bytesPerRow}).map((_, i) => (
                        <th key={i} className="px-2 py-1 text-center text-xs font-medium text-muted-foreground">
                            +{i.toString(16).toUpperCase()}
                        </th>
                    ))}
                    {format === "text" && (
                        <th className="border-l px-2 py-1 text-left text-xs font-medium text-muted-foreground">ASCII</th>
                    )}
                </tr>
                </thead>
                <tbody>
                {rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-muted/20" : ""}>
                        <td className="border-r px-2 py-1 text-xs font-mono text-muted-foreground">
                            {(rowIndex * bytesPerRow).toString(16).toUpperCase().padStart(4, "0")}
                        </td>

                        {row.map((byte, byteIndex) => {
                            const byteAddress = rowIndex * bytesPerRow + byteIndex;
                            const byteContent = formatByte(byte);
                            return (
                                <td
                                    key={byteIndex}
                                    className={`px-2 py-1 text-center font-mono text-xs ${
                                        format === "hex" ? "text-amber-600 dark:text-amber-400" : ""
                                    }`}
                                >
                                    {byteAddress === highlightAddress ? (
                                        <span
                                            className="inline-block p-1 bg-blue-500 text-white font-weight-bold rounded">
                                            {byteContent}
                                        </span>
                                    ) : (
                                        byteContent
                                    )}
                                </td>
                            );
                        })}
                        {Array.from({length: bytesPerRow - row.length}).map((_, i) => (
                            <td key={`empty-${i}`} className="px-2 py-1 text-center font-mono text-xs">
                                {format === "text" ? "" : "—"}
                            </td>
                        ))}

                        {format === "text" && (
                            <td className="border-l px-2 py-1 font-mono text-xs">
                                {row.map((byte) => (byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ".")).join("")}
                            </td>
                        )}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}