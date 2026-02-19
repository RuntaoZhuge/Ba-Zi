'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  labelKey: string;
  href: string;
  disabled?: boolean;
}

interface NavSection {
  titleKey: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    titleKey: 'workspace.sidebar.baziSection',
    items: [
      {
        labelKey: 'workspace.sidebar.baziCalculate',
        href: '/workspace/bazi-calculate',
      },
      {
        labelKey: 'workspace.sidebar.baziDaily',
        href: '/workspace/bazi-daily',
        disabled: true,
      },
      {
        labelKey: 'workspace.sidebar.baziMarriage',
        href: '/workspace/bazi-marriage',
        disabled: true,
      },
      {
        labelKey: 'workspace.sidebar.baziBusiness',
        href: '/workspace/bazi-business',
        disabled: true,
      },
    ],
  },
  {
    titleKey: 'workspace.sidebar.divinationSection',
    items: [
      { labelKey: 'workspace.sidebar.meihua', href: '/workspace/meihua/daily-decision' },
      { labelKey: 'workspace.sidebar.liuyao', href: '/workspace/liuyao' },
    ],
  },
  {
    titleKey: 'workspace.sidebar.otherSection',
    items: [
      { labelKey: 'workspace.sidebar.ziwei', href: '/workspace/ziwei-doushu' },
      { labelKey: 'workspace.sidebar.qimen', href: '/workspace/qimen' },
      { labelKey: 'workspace.sidebar.liuren', href: '/workspace/liuren' },
      { labelKey: 'workspace.sidebar.huangli', href: '/workspace/huangli', disabled: true },
    ],
  },
];

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile sidebar toggle */}
      <button
        className="fixed top-4 left-4 z-50 rounded-md bg-white p-2 shadow-md lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
          />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/" className="text-lg font-bold">
            {t('common.appName')}
          </Link>
        </div>
        <nav className="p-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.titleKey} className="mb-6">
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {t(section.titleKey)}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname.endsWith(item.href);
                  if (item.disabled) {
                    return (
                      <li key={item.href}>
                        <span className="block cursor-not-allowed rounded-md px-3 py-2 text-sm text-gray-300">
                          {t(item.labelKey)}
                        </span>
                      </li>
                    );
                  }
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`block rounded-md px-3 py-2 text-sm transition ${
                          isActive
                            ? 'bg-gray-100 font-medium text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {t(item.labelKey)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
