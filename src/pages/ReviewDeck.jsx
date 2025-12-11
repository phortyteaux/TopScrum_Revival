import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function ReviewDeck() {
  const { id } = useParams();

  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [incorrectCardsList, setIncorrectCardsList] = useState([]);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    async function loadCards() {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('deck_id', id);

      if (!error && data) {
        let loaded = [...data];

        if (shuffle) {
          loaded = loaded.sort(() => Math.random() - 0.5);
        }

        setCards(loaded);
        setIndex(0);
        setShowBack(false);
        setFinished(false);
        setCorrectCount(0);
        setIncorrectCount(0);
        setIncorrectCardsList([]);
      }
    }

    loadCards();
  }, [id, shuffle]);

  useEffect(() => {
    if (!multipleChoice || cards.length === 0) {
      setOptions([]);
      return;
    }

    const card = cards[index];
    if (!card) return;

    const correctAnswer = card.back_text || '';

    const otherCards = cards.filter((c, idx) => idx !== index && c.back_text);
    const shuffledOthers = [...otherCards].sort(() => Math.random() - 0.5);
    const distractors = shuffledOthers.slice(0, 3).map((c) => c.back_text);

    const allOptions = [correctAnswer, ...distractors];
    const uniqueOptions = Array.from(new Set(allOptions));
    const shuffled = [...uniqueOptions].sort(() => Math.random() - 0.5);

    setOptions(shuffled);
  }, [cards, index, multipleChoice]);

  const progress = cards.length > 0 ? (index / cards.length) * 100 : 0;

  function nextCard() {
    setShowBack(false);

    if (index === cards.length - 1) {
      setFinished(true);
    } else {
      setIndex(index + 1);
    }
  }

  async function markCorrect(cardId) {
    const card = cards[index];
    setCorrectCount((prev) => prev + 1);

    await supabase
      .from('cards')
      .update({
        attempts: (card.attempts || 0) + 1,
        correct: (card.correct || 0) + 1,
      })
      .eq('id', cardId);

    nextCard();
  }

  async function markIncorrect(cardId) {
    const card = cards[index];
    setIncorrectCount((prev) => prev + 1);
    setIncorrectCardsList((prev) => [...prev, cards[index]]);

    await supabase
      .from('cards')
      .update({
        attempts: (card.attempts || 0) + 1,
        incorrect: (card.incorrect || 0) + 1,
      })
      .eq('id', cardId);

    nextCard();
  }

  async function toggleStarCurrent() {
    const card = cards[index];
    const newStarred = !card.starred;

    const { error } = await supabase
      .from('cards')
      .update({ starred: newStarred })
      .eq('id', card.id);

    if (!error) {
      setCards((prev) =>
        prev.map((c, idx) => (idx === index ? { ...c, starred: newStarred } : c)),
      );
    }
  }

  function handleChoiceClick(answer) {
    const card = cards[index];
    if (answer === card.back_text) {
      markCorrect(card.id);
    } else {
      markIncorrect(card.id);
    }
  }

  if (cards.length === 0) {
    return (
      <p className="text-center text-sm text-slate-400">
        No cards to review in this deck.
      </p>
    );
  }

  if (finished) {
    const totalAnswered = correctCount + incorrectCount;
    const score =
      totalAnswered > 0
        ? Math.round((correctCount / totalAnswered) * 100)
        : 0;

    return (
      <div className="mx-auto max-w-xl space-y-4 text-center">
        <h2 className="text-2xl font-semibold text-slate-50">
          Review complete! 🎉
        </h2>

        <div className="mx-auto h-3 w-4/5 overflow-hidden rounded-full bg-slate-800">
          <div className="h-3 w-full bg-gradient-to-r from-brand-500 to-emerald-400" />
        </div>

        {incorrectCardsList.length > 0 && (
          <button
            onClick={() => {
              setCards(incorrectCardsList);
              setIndex(0);
              setShowBack(false);
              setFinished(false);
              setCorrectCount(0);
              setIncorrectCount(0);
              setIncorrectCardsList([]);
            }}
            className="mt-2 inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-white/90"
          >
            Review incorrect only
          </button>
        )}

        <p className="text-sm text-slate-300">
          You got{' '}
          <span className="font-semibold text-emerald-300">
            {correctCount} correct
          </span>{' '}
          and{' '}
          <span className="font-semibold text-red-300">
            {incorrectCount} incorrect
          </span>
          .
        </p>

        <p className="text-3xl font-bold text-emerald-400">Score: {score}%</p>

        <button
          onClick={() => {
            setCorrectCount(0);
            setIncorrectCount(0);
            setIndex(0);
            setFinished(false);
            setShowBack(false);
            setIncorrectCardsList([]);
          }}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:from-brand-400 hover:to-emerald-300"
        >
          Restart review
        </button>

        <div className="pt-2">
          <Link
            to={`/deck/${id}`}
            className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-100 hover:border-slate-500"
          >
            Back to deck
          </Link>
        </div>
      </div>
    );
  }

  const card = cards[index];

  return (
    <div className="mx-auto max-w-xl space-y-4 text-center">
      <h2 className="text-xl font-semibold text-slate-50">Reviewing deck</h2>

      {/* Toggles */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
        <label className="flex items-center gap-2 text-slate-300">
          <input
            type="checkbox"
            checked={shuffle}
            onChange={(e) => setShuffle(e.target.checked)}
            className="h-4 w-4 rounded border-slate-600 bg-slate-950/80 text-brand-500 focus:ring-brand-500/40"
          />
          Shuffle cards
        </label>

        <label className="flex items-center gap-2 text-slate-300">
          <input
            type="checkbox"
            checked={multipleChoice}
            onChange={(e) => {
              setMultipleChoice(e.target.checked);
              setIndex(0);
              setFinished(false);
              setCorrectCount(0);
              setIncorrectCount(0);
              setShowBack(false);
            }}
            className="h-4 w-4 rounded border-slate-600 bg-slate-950/80 text-brand-500 focus:ring-brand-500/40"
          />
          Multiple choice mode
        </label>
      </div>

      {/* Progress bar */}
      <div className="mx-auto h-2 w-4/5 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-2 bg-gradient-to-r from-brand-500 to-emerald-400 transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-slate-400">
        Card {index + 1} of {cards.length}
      </p>

      {/* Star toggle */}
      <button
        onClick={toggleStarCurrent}
        className="text-2xl"
        title={card.starred ? 'Unstar' : 'Star'}
      >
        {card.starred ? '⭐' : '☆'}
      </button>

      {/* Multiple choice vs flip mode */}
      {multipleChoice ? (
        <>
          <div className="mx-auto mt-2 flex min-h-[140px] max-w-xs items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-6 text-lg font-semibold text-slate-50">
            {card.front_text}
          </div>

          <div className="mx-auto flex w-full max-w-xs flex-col gap-2">
            {options.length === 0 ? (
              <p className="text-xs text-slate-400">No options available.</p>
            ) : (
              options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleChoiceClick(opt)}
                  className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 hover:border-brand-500"
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <div
            className="mx-auto mt-2 flex min-h-[160px] max-w-xs cursor-pointer items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-6 text-lg font-semibold text-slate-50"
            onClick={() => setShowBack(!showBack)}
          >
            {showBack ? card.back_text : card.front_text}
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => markCorrect(card.id)}
              className="rounded-xl bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Correct
            </button>
            <button
              onClick={() => markIncorrect(card.id)}
              className="rounded-xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
            >
              Incorrect
            </button>
          </div>
        </>
      )}

      {card.image_url && (
        <div className="pt-4">
          <img
            src={card.image_url}
            alt="card"
            className="mx-auto max-h-48 rounded-xl border border-slate-700 object-contain"
          />
        </div>
      )}
    </div>
  );
}
