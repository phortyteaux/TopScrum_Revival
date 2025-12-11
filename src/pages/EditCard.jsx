import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function EditCard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [imageURL, setImageURL] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [starred, setStarred] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadCard() {
      const { data } = await supabase
        .from('cards')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setFront(data.front_text);
        setBack(data.back_text);
        setImageURL(data.image_url);
        setStarred(!!data.starred);
      }
    }

    loadCard();
  }, [id]);

  async function uploadImage(file) {
    if (!file) return null;

    const filePath = `${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('card-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('UPLOAD ERROR:', uploadError);
      setMessage('Upload failed: ' + uploadError.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('card-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  async function handleUpdate(e) {
    e.preventDefault();

    let finalImageURL = imageURL;

    if (newImage) {
      finalImageURL = await uploadImage(newImage);
    }

    const { error } = await supabase
      .from('cards')
      .update({
        front_text: front,
        back_text: back,
        image_url: finalImageURL,
        starred: starred,
      })
      .eq('id', id);

    if (error) setMessage(error.message);
    else {
      setMessage('Card updated!');
      setTimeout(() => {
        navigate(-1);
      }, 600);
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/60">
        <h2 className="text-xl font-semibold text-slate-50">Edit card</h2>

        <form onSubmit={handleUpdate} className="mt-6 space-y-4 text-left">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Front
            </label>
            <input
              type="text"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Front text"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Back
            </label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Back text"
              required
              rows={4}
              className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
            />
          </div>

          {imageURL && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-300">
                Current image
              </p>
              <img
                src={imageURL}
                alt="Current"
                className="max-h-40 rounded-xl border border-slate-700 object-cover"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Replace image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewImage(e.target.files[0])}
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
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-950 hover:bg-white/90"
          >
            Save changes
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
