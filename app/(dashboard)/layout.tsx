'use client';

import { Navbar } from "@/components/ui/navbar"


function Header() {
  return (
    <header className="border-b border-gray-200">
      <Navbar />
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <Header />
      {children}
    </section>
  );
}
