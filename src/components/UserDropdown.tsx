import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export default function UserDropdown({ profile }) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex items-center gap-2 text-white font-medium hover:opacity-80">
        <span>{profile.full_name ?? 'User'}</span>
        <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
      </Menu.Button>
      
      <Menu.Items className="absolute right-0 z-10 mt-2 w-44 origin-top-right rounded-md bg-[#2b3640] shadow-lg ring-1 ring-black/5 focus:outline-none">
        <div className="py-1">
          <Menu.Item>
            {({ active }) => (
              <a
                href="/settings"
                className={`block px-4 py-2 text-sm text-white ${active ? 'bg-[#1f272e]' : ''}`}
              >
                Settings
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                href="/account"
                className={`block px-4 py-2 text-sm text-white ${active ? 'bg-[#1f272e]' : ''}`}
              >
                Account
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => {/* handle logout here */}}
                className={`block w-full text-left px-4 py-2 text-sm text-red-400 ${active ? 'bg-[#1f272e]' : ''}`}
              >
                Sign out
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
}
