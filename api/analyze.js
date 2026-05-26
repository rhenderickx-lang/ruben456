export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  const { transcript, questions } = await req.json();

  const prompt = `Je analyseert een interview-transcript van een klant aan een Electra EV-laadstation in Belgie. Mensen praten informeel en onnauwkeurig. Wees royaal in interpretatie.

Transcript:
"""
${transcript}
"""

Vragen en opties:
${questions}

Geef ALLEEN een JSON-object terug. Per question ID: kies de best passende optie op basis van context, of geef een korte samenvatting voor open vragen. Gebruik null als iets echt niet vermeld werd. Geen uitleg, enkel JSON.`;

  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const d = await r.json();
  const text = d.choices?.[0]?.message?.content || '{}';

  return new Response(text.replace(/```json|```/g, '').trim(), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
