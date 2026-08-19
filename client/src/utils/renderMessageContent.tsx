import DOMPurify from 'dompurify';

export const renderMessageContent = (content: string) => {
  if (!content) return null;

  const html = content
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>');

  const cleanHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'strong', 'em', 'br', 'div', 'span']
  });

  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
};
