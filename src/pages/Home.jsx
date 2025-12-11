// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { footerSections } from './footerData';

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-slate-950 text-slate-100">
      {/* Hero */}
      <main className="flex flex-1 items-center">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-4 py-10 text-center md:flex-row md:text-left">
          {/* Text side */}
          <section className="flex-1 space-y-6">
            <p className="inline-flex items-center rounded-full bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-slate-700">
              🚀 TopScrum Flashcards · Study like a pro
            </p>

            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-brand-400 via-emerald-300 to-sky-300 bg-clip-text text-transparent">
                TopScrum Flashcards
              </span>
            </h1>

            <p className="max-w-xl text-sm text-slate-300 sm:text-base">
              Your study companion — fast, clean, powerful. Create decks, review smarter,
              and track your progress in seconds.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Link
                to="/signup"
                className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Sign Up
              </Link>

              <Link
                to="/login"
                className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-brand-400 hover:text-brand-300"
              >
                Log In
              </Link>
            </div>
          </section>

          {/* Simple preview / feature card */}
          <section className="flex-1">
            <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-100">
                  Today&apos;s Sprint
                </h2>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  12 cards due
                </span>
              </div>

              <div className="space-y-3 text-left text-xs text-slate-300">
                <div className="flex items-center justify-between rounded-lg bg-slate-950/40 px-3 py-2">
                  <div>
                    <p className="font-medium text-slate-100">Big-O Notation</p>
                    <p className="text-[11px] text-slate-400">DSA · 8 cards</p>
                  </div>
                  <span className="text-[11px] text-emerald-300">On track</span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-slate-950/40 px-3 py-2">
                  <div>
                    <p className="font-medium text-slate-100">SQL Joins</p>
                    <p className="text-[11px] text-slate-400">Databases · 10 cards</p>
                  </div>
                  <span className="text-[11px] text-yellow-300">Due soon</span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-slate-950/40 px-3 py-2">
                  <div>
                    <p className="font-medium text-slate-100">Agile vs Waterfall</p>
                    <p className="text-[11px] text-slate-400">SE · 6 cards</p>
                  </div>
                  <span className="text-[11px] text-slate-400">New deck</span>
                </div>
              </div>

              <p className="mt-4 text-[11px] text-slate-500">
                Build decks for every class. Review in focused sprints. Ship better grades.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/95">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex flex-wrap items-start justify-center gap-8 md:justify-between">
          {footerSections.map((section) => (
            <div key={section.title} className="min-w-[140px] space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                {section.title}
              </h4>
              <ul className="space-y-1 text-xs text-slate-400">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.path.startsWith('http') ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noreferrer"
                        className="transition hover:text-brand-400"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="transition hover:text-brand-400"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-500">
          © {new Date().getFullYear()} TopScrum. Built for students who ship.
        </p>
      </div>
    </footer>
  );
};
