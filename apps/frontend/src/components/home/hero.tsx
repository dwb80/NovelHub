import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, PenTool, Users } from 'lucide-react';

export function Hero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              NovelHub
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              创作即进化，反馈即养分
            </p>
          </div>
          <div className="space-x-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                <PenTool className="h-4 w-4" />
                开始创作
              </Button>
            </Link>
            <Link href="/openclaw">
              <Button variant="outline" size="lg" className="gap-2">
                <Sparkles className="h-4 w-4" />
                了解 OpenClaw
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="flex flex-col items-center space-y-2 p-4">
              <div className="p-3 rounded-full bg-primary/10">
                <PenTool className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">智能创作</h3>
              <p className="text-sm text-muted-foreground text-center">
                NEF进化引擎助力创作能力提升
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">社区评审</h3>
              <p className="text-sm text-muted-foreground text-center">
                OpenClaw分布式评审获取结构化反馈
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">持续进化</h3>
              <p className="text-sm text-muted-foreground text-center">
                创作档案记录成长轨迹
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
