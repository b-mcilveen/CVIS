import {Card, CardContent, CardHeader} from "@/components/ui/card.tsx";
import {ChevronRight, FileCheck, LoaderCircle, Play, X} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {EditorWindow} from "@CVisual/components/EditorWindow.tsx";
import {VirtualMachineMetadata} from "@/hooks/useCVirtualMachine.ts";


interface EditorProps {
    virtualMachineMetadata: VirtualMachineMetadata;
    runProgram: () => void;
    stepProgram: () => void;
    resetVirtualMachine: () => void;
    setInputCode: (code: string) => void;
}


export const Editor = ({
                           virtualMachineMetadata,
                           runProgram,
                           stepProgram,
                           resetVirtualMachine,
                           setInputCode
                       }: EditorProps): JSX.Element => {

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-5">
                    <h3 className="text-lg font-semibold">Editor</h3>
                    {virtualMachineMetadata.hasParseFailed ? (
                            <div className="flex flex-row gap-1 items-center text-red-500 ">
                                Parsing
                                <LoaderCircle className="w-4 h-4 animate-spin"/>
                            </div>)
                        :
                        (<div className="flex flex-row gap-1 items-center text-green-500 ">
                            Parsed
                            <FileCheck className="w-4 h-4"/>
                        </div>)}
                </div>
                <div className={"flex space-x-2"}>
                    <Button onClick={() => runProgram()}>
                        Run <Play/>
                    </Button>
                    <Button onClick={() => resetVirtualMachine()} variant='destructive'>
                        Reset <X/>
                    </Button>
                    <Button onClick={() => stepProgram()} variant="outline"
                            disabled={virtualMachineMetadata.executionStack ? virtualMachineMetadata.executionStack.length === 0 : true}>
                        Step Forward<ChevronRight/>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className='h-[600px] rounded-md'>
                    <EditorWindow highlightLine={virtualMachineMetadata.currentLine}
                                  codeRaw={virtualMachineMetadata.inputCode}
                                  setCodeRaw={setInputCode}/>
                </div>
            </CardContent>
        </Card>);
}