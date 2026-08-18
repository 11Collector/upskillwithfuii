"use client";

import Link from "next/link";

interface FooterProps {
  footerText: string;
  onOpenStory: () => void;
}

export default function Footer({ footerText, onOpenStory }: FooterProps) {
  return (
    <footer className="mx-auto mt-12 flex max-w-5xl flex-col items-center pb-12 sm:pb-16">
      <div className="mb-5 flex items-center justify-center gap-7 text-slate-500 sm:gap-8">
        <Link
          href="https://x.com/FuiiThanawat"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X"
          className="group grid h-11 w-11 place-items-center rounded-full transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900 hover:text-white hover:shadow-xl"
        >
          <svg viewBox="0 0 1200 1227" className="h-6 w-6" aria-hidden="true">
            <path
              fill="currentColor"
              d="M714.16 519.28 1160.89 0h-105.86L667.14 450.89 357.33 0H0l468.49 681.82L0 1226.37h105.87l409.62-476.15 327.18 476.15H1200L714.16 519.28Zm-144.99 168.55-47.47-67.9L144.01 79.69h162.6l304.8 435.99 47.47 67.9 396.2 566.72h-162.6L569.17 687.83Z"
            />
          </svg>
        </Link>

        <Link
          href="https://www.instagram.com/upskillwithfuii/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="group grid h-11 w-11 place-items-center rounded-full transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-br hover:from-fuchsia-500 hover:via-rose-500 hover:to-amber-400 hover:text-white hover:shadow-xl"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z"
            />
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z"
            />
            <path fill="currentColor" d="M17.5 6.5h.01" />
          </svg>
        </Link>

        <Link
          href="https://www.tiktok.com/@upskillwithfuii"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
          className="group grid h-11 w-11 place-items-center rounded-full transition-all duration-300 hover:-translate-y-1 hover:bg-slate-950 hover:text-white hover:shadow-xl"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
            <path
              fill="currentColor"
              d="M16.6 3c.35 2.03 1.55 3.45 3.4 3.64v3.12a7.3 7.3 0 0 1-3.34-.9v5.86c0 3.1-2.3 5.28-5.32 5.28C8.56 20 6 18.08 6 15.18c0-3.28 2.88-5.36 6.15-4.78v3.17c-1.3-.42-2.73.2-2.73 1.6 0 .98.82 1.62 1.85 1.62 1.12 0 1.9-.72 1.9-2.1V3h3.43Z"
            />
          </svg>
        </Link>
      </div>

      <button
        type="button"
        onClick={onOpenStory}
        className="cursor-pointer text-center text-xs font-bold tracking-wide text-slate-400 transition-colors hover:text-indigo-600"
      >
        {footerText}
      </button>
    </footer>
  );
}
