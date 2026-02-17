/** Stream helper — shared by analysis components */
export async function streamFetch(
  url: string,
  body: Record<string, unknown>,
  onChunk: (accumulated: string) => void,
): Promise<{ ok: boolean; errorCode?: string }> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    return { ok: false, errorCode: data.error };
  }

  const reader = response.body?.getReader();
  if (!reader) return { ok: false };

  const decoder = new TextDecoder();
  let accumulated = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    accumulated += decoder.decode(value, { stream: true });
    onChunk(accumulated);
  }
  return { ok: true };
}
