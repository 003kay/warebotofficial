import type { LucideIcon } from "lucide-react";
import { BookOpen, Terminal } from "lucide-react";
import { stainedGuides } from "@/lib/stainedGuides";
import { canonicalCommandCategories } from "@/lib/canonicalCommands";
export interface DocItem { label:string; slug:string; icon?:LucideIcon }
export interface DocSection { title:string; items:DocItem[] }
export const docSections: DocSection[] = [...new Set(stainedGuides.map(guide=>guide.group))].map(group=>({title:group,items:stainedGuides.filter(guide=>guide.group===group).map(guide=>({label:guide.title,slug:guide.slug,icon:BookOpen}))}));
docSections.push({title:"Command reference",items:canonicalCommandCategories.map(category=>({label:category.name,slug:`commands-${category.slug}`,icon:Terminal}))});
