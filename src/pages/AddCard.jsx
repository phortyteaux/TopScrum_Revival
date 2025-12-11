import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function AddCard() {
  const { id: deck_id } = useParams();
  const navigate = useNavigate();

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [starred, setStarred] = useState(false);
  const [message, setMessage] = useState('');

  async function uploadImage(file) {
    if (!file) return null;

    const filePath = `${deck_id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('card-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);
      return null;
    }

    const { data: publicURL } = supabase.storage
      .from('card-images')
      .getPublicUrl(filePath);

    return publicURL.publicUrl;
  }

  const handleCreate = async (e) => {
    e.preventDefault();

    let image_url = null;

    if (imageFile) {
      image_url = await uploadImage(imageFile);
    }

    const { error } = await supabase.from('cards').insert({
      deck_id,
      front_text: front,
      back_text: back,
      image_url,
      starred: starred,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Card added!');
      setFront('');
      setBack('');
      setImageFile(null);
      setStarred(false);

      setTimeout(() => navigate(`/deck/${deck_id}`), 600);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/60">
        <h2 className="text-xl font-semibold text-slate-50">Add card</h2>
        <p className="mt-1 text-sm text-slate-400">
          Keep the front concise; back can include details or steps.
        </p>

        <form onSubmit={handleCreate} className="mt-6 space-y-4 text-left">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Front
            </label>
            <input
              type="text"
              placeholder="What is a B+ tree?"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Back
            </label>
            <textarea
              placeholder="Definition, fanout, leaf properties, etc."
              value={back}
              onChange={(e) => setBack(e.target.value)}
              required
              rows={4}
              className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Optional image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="block w-full text-xs text-slate-300 file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-950 hover:file:bg-white/90"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={starred}
              onChange={(e) => setStarred(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-950/80 text-brand-500 focus:ring-brand-500/40"
            />
            Star / favorite this card
          </label>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 px-3 py-2.5 text-sm font-semibold text-slate-950 hover:from-brand-400 hover:to-emerald-300"
          >
            Add card
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-xl bg-slate-950/60 px-3 py-2 text-xs text-slate-200">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
