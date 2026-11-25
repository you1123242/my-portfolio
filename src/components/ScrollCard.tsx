"use client";

import { useState, useRef, ReactNode } from "react";

interface ScrollCardProps {
  children: ReactNode;
  floatDelay?: number; // 浮遊タイミングをカードごとにずらすための秒数
}

export default function ScrollCard({ children, floatDelay = 0 }: ScrollCardProps) {
  // 巻物の高さ（px）
  const [height, setHeight] = useState<number>(210);
  // 無重力空間での移動位置（x, y）
  const [position, setPosition] = useState({ x: 0, y: 0 });
  // 操作状態（'none' | 'move' | 'resize-top' | 'resize-bottom'）
  const [dragMode, setDragMode] = useState<'none' | 'move' | 'resize-top' | 'resize-bottom'>('none');

  const startPointer = useRef({ x: 0, y: 0 });
  const startState = useRef({ x: 0, y: 0, height: 210 });
  const hasDragged = useRef(false);

  // ドラッグ開始（本体移動 / 上軸伸縮 / 下軸伸縮）
  const handlePointerDown = (
    e: React.PointerEvent,
    mode: 'move' | 'resize-top' | 'resize-bottom'
  ) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    setDragMode(mode);
    hasDragged.current = false;
    startPointer.current = { x: e.clientX, y: e.clientY };
    startState.current = { x: position.x, y: position.y, height };
  };

  // ドラッグ中の計算
  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragMode === 'none') return;

    const dx = e.clientX - startPointer.current.x;
    const dy = e.clientY - startPointer.current.y;

    // 5px以上動かしたら「クリックではなくドラッグ操作」と判定
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasDragged.current = true;
    }

    if (dragMode === 'move') {
      // 巻物全体の移動
      setPosition({
        x: startState.current.x + dx,
        y: startState.current.y + dy,
      });
    } else if (dragMode === 'resize-bottom') {
      // 下の軸を引っ張って伸縮（最小90px 〜 最大450px）
      const newHeight = Math.max(90, Math.min(450, startState.current.height + dy));
      setHeight(newHeight);
    } else if (dragMode === 'resize-top') {
      // 上の軸を引っ張って伸縮（上方向に広げた分、位置も調整）
      const newHeight = Math.max(90, Math.min(450, startState.current.height - dy));
      const actualDelta = newHeight - startState.current.height;
      setHeight(newHeight);
      setPosition({
        x: startState.current.x,
        y: startState.current.y - actualDelta,
      });
    }
  };

  // ドラッグ終了
  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragMode === 'none') return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    setDragMode('none');
  };

  // ドラッグ直後のリンク遷移（誤クリック）を防止
  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex: dragMode !== 'none' ? 50 : 10,
      }}
      className="relative select-none touch-none transition-shadow"
      onClickCapture={handleClickCapture}
    >
      {/* 無重力でゆらゆら浮くラッパー（ドラッグ中だけ一時停止して掴みやすくする） */}
      <div
        style={{
          animationDelay: `${floatDelay}s`,
          animationPlayState: dragMode !== 'none' ? 'paused' : 'running',
        }}
        className="animate-zero-gravity"
      >
        {/* 上側の巻き軸（ドラッグで伸縮） */}
        <div
          onPointerDown={(e) => handlePointerDown(e, 'resize-top')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          title="上下にドラッグして巻物を伸縮"
          className="h-5 bg-gradient-to-b from-amber-900 to-amber-950 rounded-t-md shadow-md cursor-ns-resize flex items-center justify-center border-b border-amber-800 hover:brightness-110"
        >
          <div className="w-12 h-1 bg-amber-700/60 rounded-full" />
        </div>

        {/* 巻物の紙本体（ドラッグで無重力空間を移動） */}
        <div
          onPointerDown={(e) => handlePointerDown(e, 'move')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ height: `${height}px` }}
          className={`bg-[#fffdfa] border-x-2 border-amber-900/30 shadow-2xl p-6 sm:p-8 overflow-y-auto ${
            dragMode === 'move' ? 'cursor-grabbing shadow-amber-950/20' : 'cursor-grab'
          }`}
        >
          {children}
        </div>

        {/* 下側の巻き軸（ドラッグで伸縮） */}
        <div
          onPointerDown={(e) => handlePointerDown(e, 'resize-bottom')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          title="上下にドラッグして巻物を伸縮"
          className="h-5 bg-gradient-to-t from-amber-900 to-amber-950 rounded-b-md shadow-md cursor-ns-resize flex items-center justify-center border-t border-amber-800 hover:brightness-110"
        >
          <div className="w-12 h-1 bg-amber-700/60 rounded-full" />
        </div>
      </div>
    </div>
  );
}
