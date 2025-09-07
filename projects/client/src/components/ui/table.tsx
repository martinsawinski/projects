export function Table({ children }:any){ return <table className="table">{children}</table>; }
export function THead({ children }:any){ return <thead className="text-sm text-zinc-500">{children}</thead>; }
export function TBody({ children }:any){ return <tbody>{children}</tbody>; }
export function TR({ children }:any){ return <tr>{children}</tr>; }
export function TH({ children }:any){ return <th>{children}</th>; }
export function TD({ children, className='' }:any){ return <td className={className}>{children}</td>; }
