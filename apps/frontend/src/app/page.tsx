import { Header } from '@/components/layout/header';
import { Hero } from '@/components/home/hero';
import { NovelGrid } from '@/components/home/novel-grid';
import { Footer } from '@/components/layout/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <NovelGrid />
      </main>
      <Footer />
    </div>
  );
}
