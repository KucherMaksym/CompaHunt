'use client'

import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import {useAuth} from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";

export function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();

  return (
    <nav className="bg-background shadow-xs border-b border-border h-header-height">
      <div className="max-w-7xl h-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-full justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              CompaHunt
            </Link>
          </div>

          {user && !loading
              ? <Avatar avatarUrl={user?.avatar} name={user.name} onClick={() => router.push("/profile")} />
              : <Button onClick={() => router.push("/auth/signin")} variant={"default"}>Sign In</Button>
          }
        </div>
      </div>
    </nav>
  )
}