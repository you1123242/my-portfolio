
"use client";

import { useRef, ReactNode } from "react";

export interface ScrollPhysicsState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  height: number;
  rotation: number;
  vRot: number;
  isDragging: boolean;
}

interface ScrollCardProps {
  id: string;
  state: ScrollPhysicsState;
  onUpdateState: (id: string, updater: (prev: ScrollPhysicsState) => ScrollPhysicsState) => void;
  children: ReactNode;
}

export default function ScrollCard({ id, state, onUpdateState, children }: ScrollCardProps) {
  const dragMode = useRef<'none' | 'move' | 'resize-top' | 'resize-bottom'>('none');
  const lastPointer = useRef({ x: 0, y: 0, time: 0 });
  const startPointer = useRef({ x: 0, y: 0 });
  const startState = useRef({ x: 0, y: 0, height: 210 });
  const hasDragged = useRef(false);

  // ドラッグ開始
  const handlePointerDown = (
    e: React.PointerEvent,
    mode: 'move' | 'resize-top' | 'resize-bottom'
  ) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    dragMode.current = mode;
    hasDragged.current = false;
    const now = performance.now();
    lastPointer.current = { x: e.clientX, y: e.clientY, time: now };
    startPointer.current = { x: e.clientX, y: e.clientY };
    startState.current = { x: state.x, y: state.y, height: state.height };

    onUpdateState(id, (prev) => ({
      ...prev,
      isDragging: true,
      vx: 0,
      vy: 0,
      vRot: 0,
    }));
  };

  // ドラッグ中の移動・伸縮・速度計算
  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragMode.current === 'none') return;

    const now = performance.now();
    const dt = Math.max(1, now - lastPointer.current.time);
    const dxTotal = e.clientX - startPointer.current.x;
    const dyTotal = e.clientY - startPointer.current.y;

    if (Math.abs(dxTotal) > 5 || Math.abs(dyTotal) > 5) {
      hasDragged.current = true;
    }

    if (dragMode.current === 'move') {
      // 瞬間のドラッグ速度を計算（弾いたときの慣性用）
      const instantVx = ((e.clientX - lastPointer.current.x) / dt) * 16;
      const instantVy = ((e.clientY - lastPointer.current.y) / dt) * 16;

      onUpdateState(id, (prev) => ({
        ...prev,
        x: startState.current.x + dxTotal,
        y: startState.current.y + dyTotal,
        // 急激すぎる飛び出しを抑えつつ慣性速度を保存
        vx: Math.max(-25, Math.min(25, instantVx * 0.85)),
        vy: Math.max(-25, Math.min(25, instantVy * 0.85)),
      }));
    } else if (dragMode.current === 'resize-bottom') {
      const newHeight = Math.max(90, Math.min(450, startState.current.height + dyTotal));
      onUpdateState(id, (prev) => ({ ...prev, height: newHeight }));
    } else if (dragMode.current === 'resize-top') {
      const newHeight = Math.max(90, Math.min(450, startState.current.height - dyTotal));
      const actualDelta = newHeight - startState.current.height;
      onUpdateState(id, (prev) => ({
        ...prev,
        height: newHeight,
        y: startState.current.y - actualDelta,
      }));
    }

    lastPointer.current = { x: e.clientX, y: e.clientY, time: now };
  };

  // ドラッグ終了（慣性スタート）
  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragMode.current === 'none') return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    // 離してから少し時間が経っていたら速度をゼロにする（ピタッと止めて離した場合）
    const isStopped = performance.now() - lastPointer.current.time > 60;

    onUpdateState(id, (prev) => ({
      ...prev,
      isDragging: false,
      vx: isStopped ? (Math.random() - 0.5) * 0.4 : prev.vx,
      vy: isStopped ? (Math.random() - 0.5) * 0.4 : prev.vy,
      vRot: isStopped ? (Math.random() - 0.5) * 0.05 : prev.vx * 0.03,
    }));

    dragMode.current = 'none';
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      style={{
        transform: `translate(${state.x}px, ${state.y}px) rotate(${state.rotation}deg)`,
        zIndex: state.isDragging ? 50 : 10,
      }}
      className="relative select-none touch-none will-change-transform"
      onClickCapture={handleClickCapture}
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

      {/* 巻物の紙本体（ドラッグで移動＆弾き飛ばし） */}
      <div
        onPointerDown={(e) => handlePointerDown(e, 'move')}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ height: `${state.height}px` }}
        className={`bg-[#fffdfa] border-x-2 border-amber-900/30 shadow-2xl p-6 sm:p-8 overflow-y-auto ${
          state.isDragging ? 'cursor-grabbing shadow-amber-950/30' : 'cursor-grab'
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
  );
}
