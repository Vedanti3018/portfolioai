'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouter()

  const toggleMenu = () => setMenuOpen(!menuOpen)
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen)

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', user.id)
        .single()
      if (!error && data) setProfile(data)
    } else {
      setProfile(null)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setDropdownOpen(false)
    router.push('/')
  }

  useEffect(() => {
    fetchProfile()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile()
      } else {
        setProfile(null)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <nav className="bg-zinc-900 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-white text-xl font-bold">
            Portfolio<span className="text-blue-500">ai</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white">Home</Link>
            <Link href="#features" className="text-gray-300 hover:text-white">Features</Link>
            <Link href="/pricing" className="text-sm hover:text-gray-400 transition">Pricing</Link>
            <Link href="#faq" className="text-gray-300 hover:text-white">FAQ</Link>
            <Link href="#contact" className="text-gray-300 hover:text-white">Contact</Link>
          </div>

          {/* Right Side Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {profile ? (
              <div className="relative">
                <div onClick={toggleDropdown} className="flex items-center gap-2 cursor-pointer">
                  <div
                    className="w-9 h-9 rounded-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${profile.avatar_url ?? '/default-avatar.png'}')`
                    }}
                  />
                  <span className="text-white text-sm font-medium">{profile.full_name ?? 'User'}</span>
                </div>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-zinc-800 rounded shadow z-10">
                    <ul className="text-sm text-white">
                      <li className="px-4 py-2 hover:bg-zinc-700 cursor-pointer">Settings</li>
                      <li className="px-4 py-2 hover:bg-zinc-700 cursor-pointer">Account</li>
                      <li className="px-4 py-2 hover:bg-zinc-700 cursor-pointer" onClick={handleLogout}>
                        Sign Out
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 border border-black-600 text-white-600 rounded-xl hover:bg-black-600 hover:text-white transition">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 border border-black-600 text-white-600 rounded-xl hover:bg-black-600 hover:text-white transition">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-gray-300 hover:text-white">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <Link href="/" className="block text-gray-300 hover:text-white">Home</Link>
          <Link href="#features" className="block text-gray-300 hover:text-white">Features</Link>
          <Link href="/pricing" className="block text-gray-300 hover:text-white">Pricing</Link>
          <Link href="#faq" className="block text-gray-300 hover:text-white">FAQ</Link>
          <Link href="#contact" className="block text-gray-300 hover:text-white">Contact</Link>

          {profile ? (
            <>
              <div className="border-t border-zinc-700 pt-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${profile.avatar_url ?? '/default-avatar.png'}')`
                    }}
                  />
                  <span className="text-white">{profile.full_name ?? 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-2 text-sm text-red-400 hover:text-red-600"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-gray-300 hover:text-white">Login</Link>
              <Link
                href="/signup"
                className="block bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-500 transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
