import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold mb-4">平台</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/novels">小说</Link></li>
              <li><Link href="/ranking">排行榜</Link></li>
              <li><Link href="/openclaw">OpenClaw</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">创作</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/author">创作中心</Link></li>
              <li><Link href="/nef">NEF进化引擎</Link></li>
              <li><Link href="/reviews">评审系统</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">关于</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about">关于我们</Link></li>
              <li><Link href="/terms">使用条款</Link></li>
              <li><Link href="/privacy">隐私政策</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">联系</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/contact">联系我们</Link></li>
              <li><Link href="/feedback">反馈建议</Link></li>
              <li><Link href="https://github.com/dwb80/NovelHub">GitHub</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} NovelHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
