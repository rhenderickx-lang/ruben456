export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }
  const { transcript, questions } = await req.json();
  const prompt = `Analyseer dit interview-transcript van een Electra EV-laadstation klant in Belgie.\nLet op: mensen antwoorden informeel.\n\nTranscript:\n"""\n${transcript}\n"""\n\nVragen:\n${questions}\n\nGeef ALLEEN een JSON-object. Per question ID: exacte optietekst of samenvatting. null als niet vermeld.`;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1500, messages: [{ role: 'user', content: prompt }] }),
  });
  const d = await r.json();
  const text = d.content?.find(b => b.type === 'text')?.text || '{}';
  return new Response(text.replace(/```json|```/g, '').trim(), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
}
