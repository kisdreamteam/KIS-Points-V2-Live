'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

const BELLS = [
  {
    id: 1,
    label: 'Bell 1',
    avatar: '/images/dashboard/tools/bell-icon-1.png',
    sound: '/sounds/bell-1.mp3',
  },
  {
    id: 2,
    label: 'Bell 2',
    avatar: '/images/dashboard/tools/bell-icon-2.png',
    sound: '/sounds/bell-2.mp3',
  },
  {
    id: 3,
    label: 'Bell 3',
    avatar: '/images/dashboard/tools/bell-icon-3.png',
    sound: '/sounds/bell-3.mp3',
  },
] as const;

const BASE_WIDTH = 560;
const BASE_HEIGHT = 260;
const MIN_SCALE = 0.5;

export default function Bells() {
  const audioMapRef = useRef<Map<number, HTMLAudioElement>>(new Map());
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentSize, setContentSize] = useState({ width: BASE_WIDTH, height: BASE_HEIGHT });

  useEffect(() => {
    const map = new Map<number, HTMLAudioElement>();
    for (const bell of BELLS) {
      const audio = new Audio(bell.sound);
      audio.volume = 0.75;
      map.set(bell.id, audio);
    }
    audioMapRef.current = map;

    return () => {
      for (const audio of map.values()) {
        audio.pause();
      }
      audioMapRef.current = new Map();
    };
  }, []);

  useEffect(() => {
    const node = contentRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setContentSize({ width, height });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const scale = useMemo(() => {
    const widthRatio = contentSize.width / BASE_WIDTH;
    const heightRatio = contentSize.height / BASE_HEIGHT;
    return Math.max(MIN_SCALE, Math.min(1, Math.min(widthRatio, heightRatio)));
  }, [contentSize.height, contentSize.width]);

  const playBell = (id: number) => {
    for (const audio of audioMapRef.current.values()) {
      audio.pause();
      audio.currentTime = 0;
    }
    const audio = audioMapRef.current.get(id);
    if (!audio) return;
    void audio.play().catch(() => { });
  };

  return (
    <div ref={contentRef} className="w-full h-full min-h-0 overflow-hidden">
      <div
        className="rounded-xl border border-white/30 bg-white/5 overflow-hidden"
        style={{
          width: `${BASE_WIDTH}px`,
          height: `${BASE_HEIGHT}px`,
        }}
      >
        <div
          style={{
            width: `${BASE_WIDTH}px`,
            height: `${BASE_HEIGHT}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <div className="w-full h-full p-2">
            <div className="flex flex-wrap items-stretch justify-center gap-4">
              {BELLS.map((bell) => (
                <button
                  key={bell.id}
                  type="button"
                  onClick={() => playBell(bell.id)}
                  className="flex flex-col items-center gap-3 rounded-2xl border-4 border-white bg-brand-pink p-4 md:p-6 min-w-[7rem] flex-1 max-w-[10rem] hover:opacity-90 transition-opacity shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2"
                >
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white bg-white shrink-0">
                    <Image
                      src={bell.avatar}
                      alt={bell.label}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <span className="text-white font-semibold text-lg">{bell.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
