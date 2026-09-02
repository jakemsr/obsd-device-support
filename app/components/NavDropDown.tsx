'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface NavItem {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Navigation',
    children: [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
];


export default function NavDropDown() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }

    // Close dropdown on Escape key press
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenDropdown(null);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <div className="flex space-x-8 items-center h-full" ref={containerRef}>
      {NAV_ITEMS.map((item) => (
        <div key={item.label} className="relative flex items-center h-full">
          {item.children ? (
            <>
              {/* Dropdown Trigger Button */}
              <button
                onClick={() => toggleDropdown(item.label)}
                aria-expanded={openDropdown === item.label}
                className="flex items-center"
              >
                <span className="text-link hover:underline">{item.label}</span>
                <svg
                  className={`ml-1.5 w-4 h-4 transition-transform duration-200 ${openDropdown === item.label ? 'rotate-180' : ''
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu Container */}
              {openDropdown === item.label && (
                <div className="absolute top-full left-0 mt-1 max-w-fit border bg-background rounded-md shadow-lg py-1 z-50 origin-top-left transition-all">
                  {item.children.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      onClick={() => setOpenDropdown(null)}
                      className="block px-4 py-2 text-sm text-link hover:underline"
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Regular Top-Level Link */
            <Link
              href={item.href || '#'}
              className="text-link hover:underline"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
