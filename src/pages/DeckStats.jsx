import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

function StatBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-slate-950/40">
      <div className="text-xl font-semibold text-slate-900 dark:text-slate-50">
        {value}
      </div>
      <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        {label}
      </div>
    </div>
  );
}

const cell =
  'border border-slate-200 px-3 py-2 text-xs text-left align-top text-slate-900 dark:border-slate-800 dark:text-slate-100';

export default function DeckStats() {
  const { id } = useParams();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);

      const { data: deckData } = await supabase
        .from('decks')
        .select('*')
        .eq('id', id)
        .single();

      const { data: cardData } = await supabase
        .from('cards')
        .select('*')
        .eq('deck_id', id);

      setDeck(deckData || null);
      setCards(cardData || []);
      setLoading(false);
    }

    loadStats();
  }, [id]);

  if (loading) {
    return (
      <p className="text-sm text-slate-700 dark:text-slate-400">
        Loading stats...
      </p>
    );
  }
  if (!deck) {
    return (
      <p className="text-sm text-slate-700 dark:text-slate-400">
        Deck not found.
      </p>
    );
  }

  const totalCards = cards.length;
  const starredCount = cards.filter((c) => c.starred === true).length;
  const totalAttempts = cards.reduce((sum, c) => sum + (c.attempts || 0), 0);
  const totalCorrect = cards.reduce((sum, c) => sum + (c.correct || 0), 0);
  const totalIncorrect = cards.reduce(
    (sum, c) => sum + (c.incorrect || 0),
    0,
  );

  const accuracy =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const hardestCards = [...cards]
    .map((c) => {
      const attempts = c.attempts || 0;
      const correct = c.correct || 0;
      const acc = attempts > 0 ? correct / attempts : 0;
      return { ...c, attempts, accuracy: acc };
    })
    .filter((c) => c.attempts >= 3)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          {deck.title} – stats
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {deck.description || 'No description'}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <StatBox label="Total cards" value={totalCards} />
        <StatBox label="Starred cards" value={starredCount} />
        <StatBox label="Total attempts" value={totalAttempts} />
        <StatBox label="Correct answers" value={totalCorrect} />
        <StatBox label="Incorrect answers" value={totalIncorrect} />
        <StatBox label="Overall accuracy" value={`${accuracy}%`} />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Hardest cards
        </h2>
        {hardestCards.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No difficult cards yet. Keep reviewing!
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-100 text-xs text-slate-700 dark:bg-slate-950/60 dark:text-slate-300">
                <tr>
                  <th className={cell}>Front</th>
                  <th className={cell}>Back</th>
                  <th className={cell}>Attempts</th>
                  <th className={cell}>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {hardestCards.map((card) => (
                  <tr key={card.id} className="odd:bg-slate-50 dark:odd:bg-slate-900/80">
                    <td className={cell}>{card.front_text}</td>
                    <td className={cell}>{card.back_text}</td>
                    <td className={cell}>{card.attempts}</td>
                    <td className={cell}>
                      {Math.round(card.accuracy * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <Link
          to={`/deck/${id}`}
          className="inline-flex items-center rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-slate-500"
        >
          Back to deck
        </Link>
      </div>
    </div>
  );
}
