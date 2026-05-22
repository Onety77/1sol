import { useState } from 'react';
import Modal from '../ui/Modal';
import { dreams as dreamsApi } from '../../services/api';

const MOODS = ['Serious', 'Funny', 'Delusional', 'Beautiful', 'Degenerate', 'Impossible', 'Unfinished'];
const MOOD_EMOJI = { Serious: '🎯', Funny: '😂', Delusional: '🌀', Beautiful: '✨', Degenerate: '🔥', Impossible: '🚀', Unfinished: '⏳' };

export default function PostDreamModal({ open, onClose, onPosted }) {
  const [form, setForm] = useState({ title: '', story: '', mood: '', proofImageUrl: '', proofLink: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const wordCount = form.title.trim() ? form.title.trim().split(/\s+/).length : 0;
  const charCount = form.story.length;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.mood) { setError('Pick a mood'); return; }
    setLoading(true); setError('');
    try {
      const result = await dreamsApi.post(form);
      onPosted?.(result.dream);
      onClose();
      setForm({ title: '', story: '', mood: '', proofImageUrl: '', proofLink: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post dream');
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Post Your Dream" maxWidth={560}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        <div>
          <label className="input-label">Dream Title <span style={{ color: 'var(--text-3)' }}>({wordCount}/20 words)</span></label>
          <input
            className="input"
            placeholder="What is your dream? Be specific."
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required maxLength={200}
          />
          <p className="input-hint">Locks after 30 minutes. Choose carefully.</p>
        </div>

        <div>
          <label className="input-label">Your Story <span style={{ color: charCount > 260 ? 'var(--coral)' : 'var(--text-3)' }}>({charCount}/280)</span></label>
          <textarea
            className="input"
            placeholder="Why this dream. Why you. Why now."
            value={form.story}
            onChange={e => setForm(f => ({ ...f, story: e.target.value }))}
            required maxLength={280}
            rows={4} style={{ resize: 'vertical', minHeight: 90 }}
          />
        </div>

        <div>
          <label className="input-label">Mood</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {MOODS.map(m => (
              <button
                key={m} type="button"
                onClick={() => setForm(f => ({ ...f, mood: m }))}
                style={{
                  padding: '7px 14px', borderRadius: 'var(--r-md)',
                  border: `1px solid ${form.mood === m ? 'var(--gold)' : 'var(--border)'}`,
                  background: form.mood === m ? 'var(--gold-glow)' : 'var(--elevated)',
                  color: form.mood === m ? 'var(--gold)' : 'var(--text-2)',
                  fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.15s',
                }}
              >
                {MOOD_EMOJI[m]} {m}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="input-label">Proof Image URL</label>
            <input className="input" placeholder="https://..." value={form.proofImageUrl} onChange={e => setForm(f => ({ ...f, proofImageUrl: e.target.value }))} />
          </div>
          <div>
            <label className="input-label">Proof Link</label>
            <input className="input" placeholder="https://..." value={form.proofLink} onChange={e => setForm(f => ({ ...f, proofLink: e.target.value }))} />
          </div>
        </div>

        {error && <p style={{ color: 'var(--coral)', fontSize: '0.85rem' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Posting...' : '🌟 Post My Dream'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
