import Link from 'next/link';

const worksData: Record<string, {
  title: string;
  category: string;
  date: string;
  desc: string;
  details: string[];
  techStack: string[];
  demoUrl?: string;
  githubUrl?: string;
}> = {
  "calendar": {
    title: "カレンダーアプリ",
    category: "Next.js / TypeScript",
    date: "2026.07",
    desc: "シンプルな操作で予定を管理・確認できるWebベースの統合カレンダーアプリケーション。",
    details: [
      "Local Storageを活用したブラウザ内データ永続化機能の実装",
      "モーダルダイアログによる直感的なスケジュール作成・編集UI",
      "URLパラメーターによる設定およびカレンダー状態の共有機能"
    ],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Local Storage"],
    githubUrl: "https://github.com"
  },
  "tetris": {
    title: "ブラウザテトリスゲーム",
    category: "JavaScript / Canvas",
    date: "2026.09",
    desc: "ホールド機能やドロップ予測、スコア計算機能を備えたWebベースのテトリスゲーム。",
    details: [
      "HTML5 Canvas APIとJavaScriptによる高速かつ軽量な2D描画処理",
      "カスタム行列回転アルゴリズムによる正確なミノ操作と判定実装",
      "ゴーストブロック（落下予測）表示およびHOLD機能の完全サポート"
    ],
    techStack: ["JavaScript (ES6+)", "HTML5 Canvas", "CSS3"],
    demoUrl: "https://you1123242.github.io/js-tetris/",
    githubUrl: "https://github.com"
  },
  "portfolio": {
    title: "ポートフォリオWebサイト",
    category: "Next.js / Tailwind CSS",
    date: "2026.10",
    desc: "Next.jsとCloudflare Pagesを活用した高速表示のポートフォリオサイト。",
    details: [
      "Next.js 15とTailwind CSS v4を使用したレスポンシブな和風・巻物UIデザイン",
      "Cloudflare Pagesによる静的サイトエクスポートと高速グローバル配信",
      "GitHubとのCI/CD自動連携によるビルド・デプロイパイプラインの構築"
    ],
    techStack: ["Next.js", "Tailwind CSS", "TypeScript", "Cloudflare Pages"],
    githubUrl: "https://github.com"
  }
};

export function generateStaticParams() {
  return Object.keys(worksData).map((id) => ({ id }));
}

export default async function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = worksData[id];

  if (!work) {
    return (
      <main className="min-h-screen bg-amber-50/40 py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-stone-800 mb-4">作品が見つかりませんでした</h1>
        <Link href="/" className="text-amber-900 underline font-bold">トップページへ戻る</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-amber-50/40 py-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-block text-amber-900 font-bold hover:underline mb-8">
          ← 制作実績一覧へ戻る
        </Link>

        <article className="relative bg-[#fffdfa] border-y-4 border-amber-900/70 shadow-xl rounded-sm p-6 sm:p-10">
          <div className="absolute top-0 -left-3 bottom-0 w-3 bg-amber-950 rounded-l-md shadow-md border-r border-amber-800"></div>
          <div className="absolute top-0 -right-3 bottom-0 w-3 bg-amber-950 rounded-r-md shadow-md border-l border-amber-800"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full w-fit">
              {work.category}
            </span>
            <span className="text-sm text-stone-500 font-mono">{work.date}</span>
          </div>

          <h1 className="text-3xl font-bold text-stone-800 mb-4">{work.title}</h1>
          <p className="text-stone-700 text-lg leading-relaxed mb-8 border-b border-amber-900/20 pb-6">
            {work.desc}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-stone-800 mb-4 border-l-4 border-amber-900 pl-3">
              開発のポイント・特徴
            </h2>
            <ul className="list-disc list-inside space-y-2 text-stone-700">
              {work.details.map((point, index) => (
                <li key={index} className="leading-relaxed">{point}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-stone-800 mb-4 border-l-4 border-amber-900 pl-3">
              使用技術
            </h2>
            <div className="flex flex-wrap gap-2">
              {work.techStack.map((tech, index) => (
                <span key={index} className="text-sm bg-stone-100 text-stone-800 px-3 py-1 rounded border border-stone-300">
                  {tech}
                </span>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-amber-900/20">
            {work.demoUrl && (
              <a
                href={work.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-amber-900 text-white font-bold px-6 py-2.5 rounded hover:bg-amber-800 transition-colors"
              >
                デモを見る ↗
              </a>
            )}
            {work.githubUrl && (
              <a
                href={work.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-stone-800 text-white font-bold px-6 py-2.5 rounded hover:bg-stone-700 transition-colors"
              >
                GitHubリポジトリ ↗
              </a>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
