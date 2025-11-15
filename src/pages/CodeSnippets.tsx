import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Link} from 'react-router-dom'

interface CodeSnippet {
    id: number;
    title: string;
    description: string;
    code: string;
    tags?: string[];
}

const codeSnippets = [
    {
        id: 1,
        title: "Hello World",
        description: "A simple hello world program in Python.",
        code:
            `int main() {
    printf("Hello, World!");
    return 0;
}`,
        tags: ["beginner"],
    },
    {
        id: 2,
        title: "Factorial Function",
        description: "A recursive function to calculate factorial in Python.",
        code:
            `int factorial(int n) {
    if (n == 0) {
        return 1;
    }
    return n * factorial(n - 1);
}
            
int main() {
    int result = factorial(5);
    printf("Factorial of 5 is %d", result);
    return 0;
}`,
        tags: ["intermediate", 'recursion'],
    },
    {
        id: 3,
        title: "Basic Pointers",
        description: "A simple pointers program in C.",
        code:
            `int main() {
    int a = 5;
    int *ptr = &a;
    printf("Pointer value: %d", *ptr);
    *ptr = 1;
    printf("Pointer dereferenced value: %d", *ptr);
    return 0;
}`,
        tags: ["beginner", "pointers"],
    },
    {
        id: 4,
        title: "Simple multidimensional array",
        description: "A simple multidimensional array in C.",
        code:
            `int main() {
    int arr[3][4] = {{1, 2, 3, 4}, {5, 6, 7, 8}, {9, 10, 11, 12}};
    int *ptr = &arr[0][0];
    int *offset = ptr + 7;
    printf("Pointer offset value: %d", *offset);
    return 0;
}`,
        tags: ["intermediate", "pointers", "arrays"],
    },

]


export const CodeSnippets = () => {

    const isDifficulty = (tag: string) => {
        return ['beginner', 'intermediate', 'advanced'].includes(tag);
    }

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold">Code Snippets</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {codeSnippets.map((snippet: CodeSnippet) => (
                    <Card key={snippet.id}>
                        <CardHeader className={"flex flex-row justify-between"}>
                            <div>
                                <CardTitle>
                                    {snippet.title}
                                </CardTitle>
                                <CardDescription>
                                    <p className="text-sm text-gray-500">{snippet.description}</p>
                                </CardDescription>
                            </div>

                            <Link to={`/tool?code=${encodeURIComponent(snippet.code)}`}>
                                <Button variant="outline" className="ml-2">
                                    Use
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <small>Preview</small>
                            <div className="mt-2 bg-gray-100 rounded-md p-4 min-h-[175px]">
                                <div
                                    className="overflow-hidden line-clamp-5 whitespace-pre-wrap">
                                    <code lang='c' className="p-0">
                                        {snippet.code}
                                    </code>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            {snippet.tags && (
                                <div className="flex space-x-2">
                                    {snippet.tags?.map((tag, index) => (
                                        <Badge variant={isDifficulty(tag) ? "default" : "outline"} key={index}>
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardFooter>

                    </Card>
                ))}
            </div>
        </div>
    )
}