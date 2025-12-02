
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderContent = () => {
    // Process for bold, italics
    let processedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
      
    // Process for numbered lists
    processedContent = processedContent.replace(/(\n\d+\.\s.*(?:\n\s{2,}.*)*)/g, (match) => {
        const items = match.trim().split(/\n\d+\.\s/).map(item => item.replace(/^\d+\.\s/, ''));
        return '<ol class="list-decimal list-inside space-y-1 my-2">' + items.map(item => `<li>${item.trim()}</li>`).join('') + '</ol>';
    });

    // Process for bulleted lists
    processedContent = processedContent.replace(/(\n\-\s.*(?:\n\s{2,}.*)*)/g, (match) => {
        const items = match.trim().split(/\n\-\s/).map(item => item.replace(/^\-\s/, ''));
        return '<ul class="list-disc list-inside space-y-1 my-2">' + items.map(item => `<li>${item.trim()}</li>`).join('') + '</ul>';
    });
    
    // Process paragraphs (double newlines) and then single newlines
    processedContent = processedContent
      .split('\n\n')
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
      .join('');

    return { __html: processedContent };
  };

  return <div className="whitespace-pre-wrap break-words space-y-2" dangerouslySetInnerHTML={renderContent()} />;
};
