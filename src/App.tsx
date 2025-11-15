import {Toolbar} from "@CVisual/components/Toolbar.tsx";
import {SidebarProvider, SidebarInset, SidebarTrigger} from "@/components/ui/sidebar";
import {Navigate, Route, Routes, useLocation} from "react-router-dom";

import {CodeSnippets} from "@/pages/CodeSnippets.tsx";
import {Tool} from "@/pages/Tool.tsx";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb.tsx";
import {Slash} from "lucide-react";

export const pageData = [
    {
        path: '/tool',
        name: 'Visualisation Playground',
    },
    {
        path: '/snippets',
        name: 'Code Snippets',
    },
];


export default function App() {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter(Boolean);

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full overflow-hidden">
                <Toolbar/>
                <SidebarInset className="flex-1 overflow-auto">
                    <main className="">
                        <div className="flex h-14 items-center gap-5 p-3 bg-white border-b border-gray-300">
                            <SidebarTrigger/>
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>CVIS</BreadcrumbItem>
                                    {pathnames.map((item, index) => {
                                            const isLast = index === pathnames.length - 1;
                                            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                                            const name = pageData.find((item) => item.path === to)?.name || item;
                                            return (<>
                                                <BreadcrumbSeparator> <Slash/> </BreadcrumbSeparator>
                                                <BreadcrumbItem key={index}>
                                                    {isLast ? (
                                                        <span className="text-gray-500">{name}</span>
                                                    ) : (
                                                        <a
                                                            href={to}
                                                            className="text-blue-500 hover:text-blue-700"
                                                        >
                                                            {name}
                                                        </a>
                                                    )}
                                                </BreadcrumbItem>
                                            </>)
                                        }
                                    )}
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                        <Routes>
                            <Route path="/tool" element={<Tool/>}/>
                            <Route path="/snippets" element={<CodeSnippets/>}/>
                            {/*<Route path="/help" element={<Help/>}/>*/}
                            <Route path="/" element={
                                <Navigate to="/tool"/>}
                            />
                        </Routes>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>

    );
}
