import { createFileRoute } from "@tanstack/react-router";
import { GuidePage } from "@/components/docs/GuidePage";
export const Route=createFileRoute("/docs/$slug")({head:()=>({meta:[{title:"Stained Documentation"}]}),component:Page});
function Page(){return <GuidePage slug={Route.useParams().slug}/>;}
