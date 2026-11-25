"use client";

import { useState, useEffect, useRef, ReactNode } from "react";

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
  isZeroGravity: boolean;
  onUpdateState: (id: string, updater: (prev: ScrollPhysicsState) => ScrollPhysicsState) => void;
  children: ReactNode;
}

export default function ScrollCard({
  id,
  state,
  isZeroGravity,
  onUpdateState,
  children,
}: ScrollCardProps) {
  const [dragMode, setDragMode] = useState<'none' | 'move' | 'resize-top' | 'resize-bottom'>('none');
  const lastPointer = useRef({ x: 0, y: 0, time: 0 });
  const startPointer = useRef({ x: 0, y: 0 });
  const startState = useRef({ x: 0, y: 0, height: 210 });
  const hasDragged = useRef(false);

  // ドラッグ開始
  const handlePointerDown = (
    e: React.PointerEvent,
    mode: 'move' | 'resize-top' | 'resize-bottom'
  ) => {
    // 無重力OFFのときは本体の位置移動ドラッグは行わない
    if (mode === 'move' && !isZeroGravity) return;

    e.stopPropagation();

    setDragMode(mode);
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

  // window全体でドラッグの移動と終了を監視
  useEffect(() => {
    if (dragMode === 'none') return;

    const handleWindowPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastPointer.current.time);
      const dxTotal = e.clientX - startPointer.current.x;
      const dyTotal = e.clientY - startPointer.current.y;

      if (Math.abs(dxTotal) > 6 || Math.abs(dyTotal) > 6) {
        hasDragged.current = true;
      }

      if (dragMode === 'move' && isZeroGravity) {
        const instantVx = ((e.clientX - lastPointer.current.x) / dt) * 16;
        const instantVy = ((e.clientY - lastPointer.current.y) / dt) * 16;

        onUpdateState(id, (prev) => ({
          ...prev,
          x: startState.current.x + dxTotal,
          y: startState.current.y + dyTotal,
          vx: Math.max(-25, Math.min(25, instantVx * 0.85)),
          vy: Math.max(-25, Math.min(25, instantVy * 0.85)),
        }));
      } else if (dragMode === 'resize-bottom') {
        const newHeight = Math.max(90, Math.min(450, startState.current.height + dyTotal));
        onUpdateState(id, (prev) => ({ ...prev, height: newHeight }));
      } else if (dragMode === 'resize-top') {
        const newHeight = Math.max(90, Math.min(450, startState.current.height - dyTotal));
        const actualDelta = newHeight - startState.current.height;
        onUpdateState(id, (prev) => ({
          ...prev,
          height: newHeight,
          y: isZeroGravity ? startState.current.y - actualDelta : 0,
        }));
      }

      lastPointer.current = { x: e.clientX, y: e.clientY, time: now };
    };

    const handleWindowPointerUp = () => {
      const isStopped = performance.now() - lastPointer.current.time > 60;

      onUpdateState(id, (prev) => ({
        ...prev,
        isDragging: false,
        vx: isZeroGravity ? (isStopped ? (Math.random() - 0.5) * 0.4 : prev.vx) : 0,
        vy: isZeroGravity ? (isStopped ? (Math.random() - 0.5) * 0.4 : prev.vy) : 0,
        vRot: isZeroGravity ? (isStopped ? (Math.random() - 0.5) * 0.05 : prev.vx * 0.03) : 0,
      }));

      setDragMode('none');
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
    };
  }, [dragMode, id, isZeroGravity, onUpdateState]);

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDragged.current = false;
    }
  };

  return (
    <div
      style={{
        transform: isZeroGravity
          ? `translate(${state.x}px, ${state.y}px) rotate(${state.rotation}deg)`
          : `translate(0px, 0px) rotate(0deg)`,
        zIndex: state.isDragging ? 50 : 10,
      }}
      className={`relative select-none touch-none will-change-transform ${
        !isZeroGravity ? "transition-transform duration-500 ease-out" : ""
      }`}
      onClickCapture={handleClickCapture}
    >
      {/* 上側の巻き軸（ドラッグで伸縮） */}
      <div
        onPointerDown={(e) => handlePointerDown(e, 'resize-top')}
        title="上下にドラッグして巻物を伸縮"
        className="h-5 bg-gradient-to-b from-amber-900 to-amber-950 rounded-t-md shadow-md cursor-ns-resize flex items-center justify-center border-b border-amber-800 hover:brightness-110"
      >
        <div className="w-12 h-1 bg-amber-700/60 rounded-full" />
      </div>

      {/* 巻物の紙本体 */}
      <div
        onPointerDown={(e) => handlePointerDown(e, 'move')}
        style={{ height: `${state.height}px` }}
        className={`bg-[#fffdfa] border-x-2 border-amber-900/30 shadow-2xl p-6 sm:p-8 overflow-y-auto transition-shadow ${
          !isZeroGravity
            ? "cursor-pointer hover:-translate-y-0.5"
            : state.isDragging
            ? "cursor-grabbing shadow-amber-950/30"
            : "cursor-grab"
        }`}
      >
        {children}
      </div>

      {/* 下側の巻き軸（ドラッグで伸縮） */}
      <div
        onPointerDown={(e) => handlePointerDown(e, 'resize-bottom')}
        title="上下にドラッグして巻物を伸縮"
        className="h-5 bg-gradient-to-t from-amber-900 to-amber-950 rounded-b-md shadow-md cursor-ns-resize flex items-center justify-center border-t border-amber-800 hover:brightness-110"
      >
        <div className="w-12 h-1 bg-amber-700/60 rounded-full" />
      </div>
    </div>
  );
}
