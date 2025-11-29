
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
    processedContent = processedContent.replace(/(\d+\.\s.*(?:\n\s{2,}.*)*)/g, (match) => {
        const items = match.split(/\n\d+\.\s/).map(item => item.replace(/^\d+\.\s/, ''));
        return '<ol class="list-decimal list-inside space-y-1 my-2">' + items.map(item => `<li>${item}</li>`).join('') + '</ol>';
    });

    // Process for bulleted lists
    processedContent = processedContent.replace(/(\-\s.*(?:\n\s{2,}.*)*)/g, (match) => {
        const items = match.split(/\n\-\s/).map(item => item.replace(/^\-\s/, ''));
        return '<ul class="list-disc list-inside space-y-1 my-2">' + items.map(item => `<li>${item}</li>`).join('') + '</ul>';
    });

    return { __html: processedContent.replace(/\n/g, '<br />') };
  };

  return <div className="whitespace-pre-wrap break-words" dangerouslySetInnerHTML={renderContent()} />;
};
