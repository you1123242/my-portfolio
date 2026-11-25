"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import ScrollCard, { ScrollPhysicsState } from '@/components/ScrollCard';

const PROJECTS = [
  {
    id: "calendar",
    title: "カレンダーアプリ",
    category: "JavaScript / HTML / CSS",
    desc: "直感的な操作で予定の登録・時間管理・一括コピー・URL共有までが行えるWebベースのカレンダーアプリケーション。",
    date: "2026.11"
  },
  {
    id: "tetris",
    title: "ブラウザテトリスゲーム",
    category: "JavaScript / Canvas",
    desc: "ホールド機能やドロップ予測、スコア計算機能を備えたWebベースのテトリスゲーム。",
    date: "2026.09"
  },
  {
    id: "portfolio",
    title: "ポートフォリオWebサイト",
    category: "Next.js / Tailwind CSS",
    desc: "Next.jsとCloudflare Pagesを活用した高速表示のポートフォリオサイト。",
    date: "2026.10"
  }
];

const createInitialStates = (): Record<string, ScrollPhysicsState> => {
  const initial: Record<string, ScrollPhysicsState> = {};
  PROJECTS.forEach((p, idx) => {
    initial[p.id] = {
      id: p.id,
      x: 0,
      y: 0,
      // 最初は無重力空間をゆっくり漂う微速を与える
      vx: (idx % 2 === 0 ? 1 : -1) * 0.25,
      vy: (idx === 1 ? -1 : 1) * 0.2,
      height: 210,
      rotation: 0,
      vRot: (idx % 2 === 0 ? 1 : -1) * 0.02,
      isDragging: false,
    };
  });
  return initial;
};

export default function Home() {
  const [physics, setPhysics] = useState<Record<string, ScrollPhysicsState>>(createInitialStates);
  const physicsRef = useRef(physics);
  physicsRef.current = physics;

  const containerRef = useRef<HTMLDivElement>(null);

  const handleUpdateState = useCallback(
    (id: string, updater: (prev: ScrollPhysicsState) => ScrollPhysicsState) => {
      setPhysics((prev) => ({
        ...prev,
        [id]: updater(prev[id]),
      }));
    },
    []
  );

  const handleResetPositions = () => {
    setPhysics(createInitialStates());
  };

  // 60fps 物理演算ループ（慣性・壁バウンド・巻物同士の衝突）
  useEffect(() => {
    let animationFrameId: number;

    const updatePhysics = () => {
      const current = { ...physicsRef.current };
      const ids = PROJECTS.map((p) => p.id);
      const containerWidth = containerRef.current?.clientWidth || 800;

      // 1. 慣性移動と減衰・回転の更新
      ids.forEach((id) => {
        const item = { ...current[id] };
        if (!item.isDragging) {
          item.x += item.vx;
          item.y += item.vy;
          item.rotation += item.vRot;

          // 空気抵抗（無重力なのでごく弱い減衰にとどめ、微速漂流は維持する）
          const speed = Math.hypot(item.vx, item.vy);
          if (speed > 0.35) {
            item.vx *= 0.985;
            item.vy *= 0.985;
          }
          item.vRot *= 0.98;
          // 傾きすぎたらゆっくり水平に戻ろうとする復元力
          item.vRot -= item.rotation * 0.0015;

          // 左右の画面端（コンテナ基準）での跳ね返り
          const maxOffsetX = Math.max(40, (window.innerWidth - containerWidth) / 2 + 20);
          if (item.x < -maxOffsetX) {
            item.x = -maxOffsetX;
            item.vx = Math.abs(item.vx) * 0.85;
          } else if (item.x > maxOffsetX) {
            item.x = maxOffsetX;
            item.vx = -Math.abs(item.vx) * 0.85;
          }

          // 上下の移動限界での跳ね返り
          if (item.y < -120) {
            item.y = -120;
            item.vy = Math.abs(item.vy) * 0.85;
          } else if (item.y > 260) {
            item.y = 260;
            item.vy = -Math.abs(item.vy) * 0.85;
          }
        }
        current[id] = item;
      });

      // 2. 巻物同士の衝突判定（AABB矩形衝突 ＋ 運動量交換）
      // 各カードの初期基準Y座標を累積高さ＋gap(48px)から算出
      const basePositionsY: Record<string, number> = {};
      let accY = 0;
      ids.forEach((id) => {
        basePositionsY[id] = accY;
        accY += current[id].height + 40 + 48; // 紙高さ + 上下軸40px + gap48px
      });

      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const a = { ...current[ids[i]] };
          const b = { ...current[ids[j]] };

          const w = containerWidth;
          const hA = a.height + 40;
          const hB = b.height + 40;

          const centerAx = a.x + w / 2;
          const centerAy = basePositionsY[a.id] + a.y + hA / 2;
          const centerBx = b.x + w / 2;
          const centerBy = basePositionsY[b.id] + b.y + hB / 2;

          const dx = centerBx - centerAx;
          const dy = centerBy - centerAy;
          const overlapX = w - Math.abs(dx);
          const overlapY = (hA + hB) / 2 - Math.abs(dy);

          // 縦横ともに重なっていたら衝突発生！
          if (overlapX > 0 && overlapY > 0) {
            const restitution = 0.85; // 反発係数

            if (overlapX < overlapY) {
              // 横方向の衝突
              const sign = dx >= 0 ? 1 : -1;
              const push = overlapX / 2;
              if (!a.isDragging) a.x -= sign * push;
              if (!b.isDragging) b.x += sign * push;

              const tempVx = a.vx;
              if (!a.isDragging) a.vx = (b.isDragging ? -tempVx : b.vx) * restitution;
              if (!b.isDragging) b.vx = (a.isDragging ? tempVx * 1.2 : tempVx) * restitution;
            } else {
              // 縦方向の衝突
              const sign = dy >= 0 ? 1 : -1;
              const push = overlapY / 2;
              if (!a.isDragging) a.y -= sign * push;
              if (!b.isDragging) b.y += sign * push;

              const tempVy = a.vy;
              if (!a.isDragging) a.vy = (b.isDragging ? -tempVy : b.vy) * restitution;
              if (!b.isDragging) b.vy = (a.isDragging ? tempVy * 1.2 : tempVy) * restitution;

              // ぶつかった衝撃で少し回転を与える
              if (!a.isDragging) a.vRot += (Math.random() - 0.5) * 0.4;
              if (!b.isDragging) b.vRot += (Math.random() - 0.5) * 0.4;
            }

            current[ids[i]] = a;
            current[ids[j]] = b;
          }
        }
      }

      setPhysics(current);
      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <main className="min-h-screen bg-amber-50/40 py-16 px-4 sm:px-8 overflow-x-clip">
      <div ref={containerRef} className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-widest text-stone-800 mb-3">
            ようたのポートフォリオ
          </h1>
          <p className="text-stone-600 font-medium mb-4">滋賀大学 データサイエンス学部</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <p className="text-xs text-amber-900/80 bg-amber-100/80 px-4 py-1.5 rounded-full font-medium">
              💡 軸をドラッグで伸縮 ／ 紙を弾いて無重力衝突
            </p>
            <button
              onClick={handleResetPositions}
              className="text-xs bg-stone-800 text-white px-3.5 py-1.5 rounded-full font-bold hover:bg-stone-700 transition-colors cursor-pointer"
            >
              ↺ 配置をリセット
            </button>
          </div>
        </header>

        <section>
          <h2 className="text-2xl font-bold text-stone-800 mb-10 border-b-2 border-amber-800/30 pb-2 inline-block">
            制作実績一覧
          </h2>

          <div className="flex flex-col gap-12 pb-32">
            {PROJECTS.map((project) => (
              <ScrollCard
                key={project.id}
                id={project.id}
                state={physics[project.id]}
                onUpdateState={handleUpdateState}
              >
                <Link
                  href={`/works/${project.id}`}
                  className="group block"
                  draggable={false}
                >
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
                    <span className="text-stone-400 text-lg group-hover:translate-x-1 transition-transform">詳細を見る →</span>
                  </h3>
                  <p className="text-stone-700 leading-relaxed">
                    {project.desc}
                  </p>
                </Link>
              </ScrollCard>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
