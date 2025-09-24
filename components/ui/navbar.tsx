'use client';
import Link from 'next/link';
import { use, useState, Suspense } from 'react';
import { Menu, X } from "lucide-react"
import { Button } from '@/components/ui/button';
import { CircleIcon, Home, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: user } = useSWR<User>('/api/user', fetcher);
    const router = useRouter();
  
    async function handleSignOut() {
      await signOut();
      mutate('/api/user');
      router.push('/');
    }
  
    if (!user) {
      return (
        <>      
            <Button asChild 
            className="bg-white text-[#FF00E0] hover:text-white hover:bg-[#FF00E0]/90 border border-[#FF00E0]/30 hover:border-[#FF00E0] transition-all duration-300 px-6 py-2 rounded-full font-medium backdrop-blur-sm">
            <Link href="/sign-in">Login</Link>
            </Button>
          <Button asChild 
          className="bg-[#FF00E0] hover:bg-[#FFE6FC] hover:text-[#FF00E0]  text-white hover:border hover:border-[#FF00E0] border-0 px-6 py-2 rounded-full shadow-lg hover:shadow-[#FF00E0]/30 transition-all duration-300 font-medium backdrop-blur-sm">
            <Link href="/sign-up">Sign Up</Link>
          </Button>
        </>
      );
    }
  
    return (
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger>
          <Avatar className="cursor-pointer size-9">
            <AvatarImage alt={user.name || ''} />
            <AvatarFallback>
              {user.email
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="flex flex-col gap-1">
          <DropdownMenuItem className="cursor-pointer">
            <Link href="/dashboard" className="flex w-full items-center">
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <form action={handleSignOut} className="w-full">
            <button type="submit" className="flex w-full">
              <DropdownMenuItem className="w-full flex-1 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-2xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-[#FF00E0]">
              MUNDI-AI
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-[#FF00E0] transition-colors font-medium">
                Product
              </Link>
              <Link href="#pricing" className="text-gray-700 hover:text-[#FF00E0] transition-colors font-medium">
                Pricing
              </Link>
              <Link href="#demo" className="text-gray-700 hover:text-[#FF00E0] transition-colors font-medium">
                Demo
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-[#FF00E0] transition-colors font-medium">
                Contact
              </Link>
            </div>
          </div>
         
          <div className="hidden md:flex items-center space-x-3">
          <UserMenu/>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/20 backdrop-blur-xl border-t border-white/10 rounded-b-lg">
              <Link
                href="#features"
                className="block px-3 py-2 text-gray-700 hover:text-[#FF00E0] transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Product
              </Link>
              <Link
                href="#pricing"
                className="block px-3 py-2 text-gray-700 hover:text-[#FF00E0] transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="#demo"
                className="block px-3 py-2 text-gray-700 hover:text-[#FF00E0] transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Demo
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-gray-700 hover:text-[#FF00E0] transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col space-y-3 px-3 pt-4">
                <UserMenu/>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
