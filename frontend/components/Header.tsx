import Link from "next/link";
import { WalletButton } from "./WalletButton";
export function Header(){return <header className="site-head"><Link className="brand" href="/"><span className="brand-mark"></span><b>CARVEOUT</b></Link><nav><Link href="/agreements">agreements</Link><Link href="/open">open</Link><Link href="/account">account</Link><Link href="/protocol">protocol</Link></nav><WalletButton/></header>}
