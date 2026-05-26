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

  const prompt = `Analyseer dit interview-transcript van een Electra EV-laadstation klant in Belgie.
Let op: mensen antwoorden informeel. "Ik betaal per keer" = pay-as-you-go. "Van de zaak" = bedrijfswagen. Wees royaal in herkenning.

Transcript:
"""
${transcript}
"""

Vragen:
${questions}

Geef ALLEEN een JSON-object. Per question ID: exacte optietekst of korte samenvatting voor open vragen. null als niet vermeld.`;

  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://electra-interview.vercel.app',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
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
