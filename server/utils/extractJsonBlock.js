export function extractJsonBlock(text) {
  const pattern = /```json([\s\S]*?)```/;
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
}
