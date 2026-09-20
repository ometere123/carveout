import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
export const metadata:Metadata={title:"CARVEOUT",description:"CARVEOUT on GenLayer"};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body><Header/><main>{children}</main><Footer/></body></html>}
