export default function Home() {
  const projects = [
    {
      title: "カレンダーアプリ",
      category: "Next.js / TypeScript",
      desc: "シンプルな操作で予定を管理・確認できるWebベースの統合カレンダーアプリケーション。",
      date: "2026.07",
      link: "https://github.com"
    },
    {
      title: "ブラウザテトリスゲーム",
      category: "JavaScript / Canvas",
      desc: "ホールド機能やドロップ予測、スコア計算機能を備えたWebベースのテトリスゲーム。",
      date: "2026.09",
      link: "https://you1123242.github.io/js-tetris/"
    },
    {
      title: "ポートフォリオWebサイト",
      category: "Next.js / Tailwind CSS",
      desc: "Next.jsとCloudflare Pagesを活用した高速表示のポートフォリオサイト。",
      date: "2026.10",
      link: "https://github.com"
    }
  ];

  return (
    <main className="min-h-screen bg-amber-50/40 py-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-widest text-stone-800 mb-2">
            ようたのポートフォリオ
          </h1>
          <p className="text-stone-600 font-medium">滋賀大学 データサイエンス学部</p>
        </header>

        {/* 制作実績一覧（巻物風カードデザイン） */}
        <section>
          <h2 className="text-2xl font-bold text-stone-800 mb-8 border-b-2 border-amber-800/30 pb-2 inline-block">
            制作実績一覧
          </h2>

          <div className="flex flex-col gap-8">
            {projects.map((project, index) => (
              <a
                key={index}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block relative bg-[#fffdfa] border-y-4 border-amber-900/70 shadow-lg rounded-sm p-6 sm:p-8 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                {/* 巻物の左端の軸（木パーツ風） */}
                <div className="absolute top-0 -left-3 bottom-0 w-3 bg-amber-950 rounded-l-md shadow-md border-r border-amber-800"></div>
                {/* 巻物の右端の軸（木パーツ風） */}
                <div className="absolute top-0 -right-3 bottom-0 w-3 bg-amber-950 rounded-r-md shadow-md border-l border-amber-800"></div>

                {/* カード内部コンテンツ */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full w-fit">
                    {project.category}
                  </span>
                  <span className="text-sm text-stone-500 font-mono">
                    {project.date}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-stone-800 mb-2 group-hover:text-amber-900 transition-colors flex items-center justify-between">
                  <span>{project.title}</span>
                  <span className="text-stone-400 text-lg group-hover:translate-x-1 transition-transform">↗</span>
                </h3>
                <p className="text-stone-700 leading-relaxed">
                  {project.desc}
                </p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
