import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function HomePage() {
  const t = useTranslations();

  const features = [
    {
      key: 'baziCalculate',
      href: '/workspace/bazi-calculate',
      emoji: '🏯',
    },
    { key: 'baziDaily', href: '/workspace/bazi-daily', emoji: '📅' },
    { key: 'baziMarriage', href: '/workspace/bazi-marriage', emoji: '💑' },
    { key: 'meihua', href: '/workspace/meihua/daily-decision', emoji: '🌸' },
    { key: 'liuyao', href: '/workspace/liuyao', emoji: '☰' },
    { key: 'ziwei', href: '/workspace/ziwei-doushu', emoji: '⭐' },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <h1 className="text-xl font-bold">{t('common.appName')}</h1>
          <nav className="flex items-center gap-6">
            <Link
              href="/workspace"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {t('common.workspace')}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight">
            {t('home.title')}
          </h2>
          <p className="mb-8 text-lg text-gray-600">{t('home.subtitle')}</p>
          <Link
            href="/workspace/bazi-calculate"
            className="inline-block rounded-lg bg-gray-900 px-8 py-3 text-white hover:bg-gray-800"
          >
            {t('home.cta')}
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ key, href, emoji }) => (
            <Link
              key={key}
              href={href}
              className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-gray-300 hover:shadow-sm"
            >
              <div className="mb-3 text-3xl">{emoji}</div>
              <h3 className="mb-1 font-semibold">
                {t(`home.features.${key}`)}
              </h3>
              <p className="text-sm text-gray-500">
                {t(`home.features.${key}Desc`)}
              </p>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          <p className="mb-2">{t('footer.description')}</p>
          <p>{t('footer.disclaimer')}</p>
        </div>
      </footer>
    </div>
  );
}
