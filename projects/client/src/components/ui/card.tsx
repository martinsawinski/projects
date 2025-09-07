import * as React from 'react';
export function Card({ className='', ...props }:{ className?:string } & React.HTMLAttributes<HTMLDivElement>){
  return <div className={`card ${className}`} {...props} />;
}
export function CardHeader(props:any){ return <div className="p-4 border-b border-zinc-100 dark:border-zinc-800" {...props}/> }
export function CardContent(props:any){ return <div className="p-4" {...props}/> }
