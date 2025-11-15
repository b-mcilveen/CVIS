import {Card, CardContent, CardHeader} from "@/components/ui/card.tsx";
import {Trash} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {VisualisationWindow} from "@CVIS/CVisual/components/VisualisationWindow.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {useCVirtualMachine} from "@/hooks/useCVirtualMachine.ts";
import {useSearchParams} from "react-router-dom";
import {useEffect} from "react";
import {Editor} from "@CVIS/CVisual/components/Editor.tsx";


export const Tool = () => {
    const [
        runProgram,
        stepProgram,
        resetVirtualMachine,
        setInputCode,
        setConsoleOutput,
        setErrorOutput,
        virtualMachineMetadata
    ] = useCVirtualMachine(false);

    // Get the code from the URL from snippets library
    const [searchParams, setSearchParams] = useSearchParams();
    const code = searchParams.get("code");

    useEffect(() => {
        if (code) {
            setInputCode(code);
            setSearchParams({});
        }
    }, [code, setInputCode, setSearchParams]);


    const jsonStringify = (obj: any) => {
        return JSON.stringify(obj, (_, value) => {
            if (value instanceof Map) {
                return Object.fromEntries(value);
            }
            return value;
        }, 2);
    };

    return (
        <div className='p-6 space-y-6'>
            <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] gap-6">
                <Editor
                    virtualMachineMetadata={virtualMachineMetadata}
                    runProgram={runProgram}
                    stepProgram={stepProgram}
                    resetVirtualMachine={resetVirtualMachine}
                    setInputCode={setInputCode}
                />

                <Card className="w-full">
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Visualisation Suite</h3>
                    </CardHeader>
                    <CardContent>
                        <VisualisationWindow
                            state={jsonStringify(virtualMachineMetadata.programSnapshot)}
                            ast={virtualMachineMetadata.parsedProgram}
                            snapshot={virtualMachineMetadata.programSnapshot}
                            executionStack={virtualMachineMetadata.executionStack}
                        />
                    </CardContent>
                </Card>

            </div>
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Terminal</h3>
                    <div className={"flex space-x-2"}>
                        <Button variant="outline" onClick={() => {
                            setConsoleOutput("");
                            setErrorOutput("");
                        }}>
                            <Trash/>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue={'output'} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="output">Output</TabsTrigger>
                            <TabsTrigger value="errors">Errors</TabsTrigger>
                        </TabsList>
                        <TabsContent value="output" className="mt-4">
                            <ScrollArea
                                className="h-[600px] rounded-md border overflow-y-scroll">
                                <div className="p-4">
                                                        <pre className="whitespace-pre-wrap break-words w-full">
                                                            <code>{virtualMachineMetadata.consoleOutput}</code>
                                                        </pre>
                                </div>
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="errors" className="mt-4">
                            <ScrollArea
                                className="h-[600px] rounded-md border overflow-y-scroll">
                                <div className="p-4">
                                                        <pre className="whitespace-pre-wrap break-words w-full">
                                                            <code>{virtualMachineMetadata.errorOutput}</code>
                                                        </pre>
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}