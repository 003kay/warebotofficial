import { createFileRoute } from "@tanstack/react-router";
import { GuidePage } from "@/components/docs/GuidePage";
export const Route=createFileRoute("/docs/introduction")({head:()=>({meta:[{title:"Stained Documentation"}]}),component:Page});
function Page(){return <GuidePage slug="introduction"/>;}
