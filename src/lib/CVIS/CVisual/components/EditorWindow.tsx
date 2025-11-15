import {FC, useEffect, useState} from "react";
import {Editor, useMonaco} from "@monaco-editor/react";

interface OwnProps {
    setCodeRaw: Function;
    codeRaw: string;
    highlightLine: number | null;
}

type Props = OwnProps;

export const EditorWindow: FC<Props> = (props) => {
    const [editorInstance, setEditorInstance] = useState<any>(null);
    const [decoration, setDecoration] = useState<string[]>(null);

    const monaco = useMonaco();

    const handleEditorDidMount = (editor: any, monaco: any) => {
        setEditorInstance(editor);
    }

    useEffect(() => {
        // console.log("Highlight line: ", props.highlightLine);
        if (!editorInstance || !monaco || props.highlightLine === null)
            return;

        try {
            const alterDecoration = editorInstance.deltaDecorations(decoration || [], [
                {
                    range: new monaco.Range(props.highlightLine, 1, props.highlightLine, 1),
                    options: {
                        isWholeLine: true,
                        className: 'highlight-line',
                    },
                },
            ]);

            setDecoration(alterDecoration);
        } catch (e) {
            console.error(e);
        }


    }, [props.highlightLine, editorInstance, monaco]);

    const handleChange = (value: string | undefined, e: any) => {
        props.setCodeRaw(value || "");
    };

    return (
        <div className="h-full w-full">
            {/*[DEBUG]: Line of execution: {props.highlightLine}*/}
            <Editor
                defaultLanguage="c"
                height="100%"
                theme="vs-light"
                defaultValue={props.codeRaw}
                onChange={handleChange}
                onMount={handleEditorDidMount}
            />
        </div>
    );
};
