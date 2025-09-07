import * as React from 'react';
export function Button({ className='', ...props }:{ className?:string } & React.ButtonHTMLAttributes<HTMLButtonElement>){
  return <button className={`btn ${className}`} {...props} />;
}
