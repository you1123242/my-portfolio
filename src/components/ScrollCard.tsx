"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollCardProps {
  children: ReactNode;
}

export default function ScrollCard({ children }: ScrollCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // 画面内に30%以上入ったら巻物を開く
        if (entry.isIntersecting) {
          setIsOpen(true);
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative transition-all duration-1000 ease-out transform ${
        isOpen
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-12 scale-95"
      }`}
    >
      {/* 上側の巻き軸パーツ（開くときに上に移動） */}
      <div
        className={`absolute -top-3 left-0 right-0 h-4 bg-amber-950 rounded-t-md shadow-md z-10 transition-transform duration-1000 ease-out ${
          isOpen ? "-translate-y-1" : "translate-y-8"
        }`}
      />

      {/* 巻物の紙本体（clip-pathで上下に広がるアニメーション） */}
      <div
        style={{
          clipPath: isOpen
            ? "inset(0% 0% 0% 0%)"
            : "inset(50% 0% 50% 0%)",
          transition: "clip-path 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="bg-[#fffdfa] border-x-2 border-amber-900/30 shadow-2xl rounded-sm p-6 sm:p-8"
      >
        {children}
      </div>

      {/* 下側の巻き軸パーツ（開くときに下に移動） */}
      <div
        className={`absolute -bottom-3 left-0 right-0 h-4 bg-amber-950 rounded-b-md shadow-md z-10 transition-transform duration-1000 ease-out ${
          isOpen ? "translate-y-1" : "-translate-y-8"
        }`}
      />
    </div>
  );
}
