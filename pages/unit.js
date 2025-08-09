import { useState, useEffect } from 'react';

export default function Home() {
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [chapterText, setChapterText] = useState('');
  const [userGoals, setUserGoals] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/.netlify/functions/list-chapters')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.chapters)) {
          setChapters(data.chapters);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const loadChapter = async (key) => {
    if (!key) return;
    setSelectedChapter(key);
    try {
      const url = '/.netlify/functions/load-chapter?key=' + encodeURIComponent(key);
      const res = await fetch(url);
      const text = await res.text();
      setChapterText(text);
    } catch (err) {
      console.error(err);
    }
  };

  const generateUnitPlan = async () => {
    setLoading(true);
    try {
      const body = {
        user_goals: userGoals,
        textbook_content: chapterText,
        user_notes: userNotes,
        temperature: 0.7,
        max_tokens: 1024,
      };
      const res = await fetch('/.netlify/functions/generate-unit-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setPlan(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>PimpMyTextbook on Netlify</h1>
      <p>Select a textbook chapter and enter your goals to generate a lesson plan.</p>
      <div>
        <label>Select chapter:</label>{' '}
        <select value={selectedChapter} onChange={(e) => loadChapter(e.target.value)}>
          <option value=''>--Select--</option>
          {chapters.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      {chapterText && (
        <div>
          <h3>Chapter Preview</h3>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              maxHeight: '200px',
              overflowY: 'scroll',
              background: '#f0f0f0',
              padding: '1rem',
            }}
          >
            {chapterText.slice(0, 2000)}
          </pre>
        </div>
      )}
      <div>
        <label>Your goals:</label>
        <br />
        <textarea
          value={userGoals}
          onChange={(e) => setUserGoals(e.target.value)}
          rows={3}
          cols={60}
        />
      </div>
      <div>
        <label>Notes / Comments:</label>
        <br />
        <textarea
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          rows={3}
          cols={60}
        />
      </div>
      <button
        onClick={generateUnitPlan}
        disabled={loading || !chapterText || !userGoals}
        style={{ marginTop: '1rem' }}
      >
        Generate Unit Plan
      </button>
      {loading && <p>Generating...</p>}
      {plan && (
        <div>
          <h2>Generated Unit Plan</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(plan, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
