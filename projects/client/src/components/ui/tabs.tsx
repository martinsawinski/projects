import * as React from 'react';
export function Tabs({ value, onValueChange, children }:{ value:string, onValueChange:(v:string)=>void, children:any }){
  return <div>{children({ value, onValueChange })}</div> as any;
}
export function TabsList({ children }:{ children:any }){ return <div className="flex gap-2 mb-3">{children}</div>; }
export function TabsTrigger({ value, cur, onClick, children }:{ value:string, cur?:string, onClick:()=>void, children:any }){
  const active = cur===value; return <button className={`btn ${active?'bg-zinc-100 dark:bg-zinc-900':''}`} onClick={onClick}>{children}</button>;
}
export function TabsContent({ when, cur, children }:{ when:string, cur:string, children:any }){ return cur===when? <div>{children}</div>: null; }
