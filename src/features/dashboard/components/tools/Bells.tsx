'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

/** Fixed movable panel size (height aligned with Timer / Happy Meter small panels). */
export const BELLS_PANEL_WIDTH = 403;
export const BELLS_PANEL_HEIGHT = 280;

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

export default function Bells() {
  const audioMapRef = useRef<Map<number, HTMLAudioElement>>(new Map());

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

  const playBell = (id: number) => {
    for (const audio of audioMapRef.current.values()) {
      audio.pause();
      audio.currentTime = 0;
    }
    const audio = audioMapRef.current.get(id);
    if (!audio) return;
    void audio.play().catch(() => {});
  };

  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center">
      <div className="flex w-full flex-nowrap items-stretch justify-center gap-3 px-1 py-2">
        {BELLS.map((bell) => (
          <button
            key={bell.id}
            type="button"
            onClick={() => playBell(bell.id)}
            className="flex min-w-0 flex-1 basis-0 flex-col items-center gap-2 rounded-2xl border-4 border-white bg-brand-pink p-4 shadow-lg transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-white">
              <Image
                src={bell.avatar}
                alt={bell.label}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <span className="text-lg font-semibold text-white">{bell.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
