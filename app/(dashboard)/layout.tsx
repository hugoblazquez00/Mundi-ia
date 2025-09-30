'use client';
import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';



export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      {/* <Header /> */}
      {/* <Navbar/> */}
      {children}
    </section>
  );
}
