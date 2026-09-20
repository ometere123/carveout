"use client";
import { useState } from "react";
import Link from "next/link";
import { WalletButton } from "./WalletButton";

const links = [
  ["Agreements", "/agreements"],
  ["New Agreement", "/open"],
  ["Account", "/account"],
  ["Protocol", "/protocol"],
];

export function Header(){
  const [menuOpen,setMenuOpen]=useState(false);
  return <header className="site-head">
    <Link className="brand" href="/" aria-label="CARVEOUT home" onClick={()=>setMenuOpen(false)}><span className="brand-mark" aria-hidden="true"></span><b>CARVEOUT</b></Link>
    <nav id="primary-navigation" className={menuOpen?"nav-open":""} aria-label="Main navigation">
      {links.map(([label,href])=><Link key={href} href={href} onClick={()=>setMenuOpen(false)}>{label}</Link>)}
    </nav>
    <div className="head-actions"><WalletButton/><button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={()=>setMenuOpen(v=>!v)}>{menuOpen?"Close":"Menu"}</button></div>
  </header>
}
