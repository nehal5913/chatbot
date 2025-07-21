import React from 'react';
import { useSettings } from '../context/SettingsContext';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const { fontSize } = useSettings();

  const fontSizeClasses = {
    small: {
      base: 'text-sm',
      h1: 'text-lg',
      h2: 'text-base',
      h3: 'text-sm',
      code: 'text-xs',
      table: 'text-xs'
    },
    medium: {
      base: 'text-base',
      h1: 'text-xl',
      h2: 'text-lg',
      h3: 'text-base',
      code: 'text-sm',
      table: 'text-sm'
    },
    large: {
      base: 'text-lg',
      h1: 'text-2xl',
      h2: 'text-xl',
      h3: 'text-lg',
      code: 'text-base',
      table: 'text-base'
    }
  };

  const classes = fontSizeClasses[fontSize];

  const parseMarkdown = (text: string) => {
    const elements: JSX.Element[] = [];
    const lines = text.split('\n');
    let i = 0;
    let listItems: string[] = [];
    let tableRows: string[] = [];
    let inCodeBlock = false;
    let codeContent: string[] = [];
    let codeLanguage = '';

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc pl-6 space-y-1 mb-4">
            {listItems.map((item, idx) => (
              <li key={idx} className={`${classes.base} text-neutral-700 dark:text-neutral-200`}>
                {parseInline(item)}
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const flushTable = () => {
      if (tableRows.length > 0) {
        const headerRow = tableRows[0];
        const dataRows = tableRows.slice(2); // Skip separator row
        
        elements.push(
          <div key={`table-${elements.length}`} className="mb-4 overflow-x-auto">
            <table className={`min-w-full border border-neutral-200 dark:border-neutral-700 rounded-lg ${classes.table}`}>
              <thead className="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  {headerRow.split('|').filter(cell => cell.trim()).map((header, idx) => (
                    <th key={idx} className="px-4 py-2 text-left font-semibold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-700">
                      {header.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-neutral-200 dark:border-neutral-700 last:border-b-0">
                    {row.split('|').filter(cell => cell.trim()).map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-2 text-neutral-700 dark:text-neutral-200">
                        {parseInline(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
    };

    const flushCodeBlock = () => {
      if (codeContent.length > 0) {
        elements.push(
          <pre key={`code-${elements.length}`} className="mb-4 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-x-auto">
            <code className={`${classes.code} text-neutral-800 dark:text-neutral-200 font-mono`}>
              {codeContent.join('\n')}
            </code>
          </pre>
        );
        codeContent = [];
      }
    };

    while (i < lines.length) {
      const line = lines[i].trim();

      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          flushList();
          flushTable();
          codeLanguage = line.slice(3);
          inCodeBlock = true;
        }
        i++;
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(lines[i]);
        i++;
        continue;
      }

      // Handle headers
      if (line.startsWith('# ')) {
        flushList();
        flushTable();
        elements.push(
          <h1 key={`h1-${elements.length}`} className={`${classes.h1} font-bold text-neutral-900 dark:text-white mb-4 mt-6`}>
            {parseInline(line.slice(2))}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        flushList();
        flushTable();
        elements.push(
          <h2 key={`h2-${elements.length}`} className={`${classes.h2} font-bold text-neutral-900 dark:text-white mb-3 mt-5`}>
            {parseInline(line.slice(3))}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        flushList();
        flushTable();
        elements.push(
          <h3 key={`h3-${elements.length}`} className={`${classes.h3} font-semibold text-neutral-900 dark:text-white mb-2 mt-4`}>
            {parseInline(line.slice(4))}
          </h3>
        );
      }
      // Handle lists
      else if (line.match(/^[-*+]\s/)) {
        flushTable();
        listItems.push(line.slice(2));
      }
      // Handle tables
      else if (line.includes('|')) {
        flushList();
        tableRows.push(line);
      }
      // Handle empty lines
      else if (line === '') {
        flushList();
        flushTable();
        if (elements.length > 0) {
          elements.push(<div key={`space-${elements.length}`} className="mb-2" />);
        }
      }
      // Handle regular paragraphs
      else {
        flushList();
        flushTable();
        elements.push(
          <p key={`p-${elements.length}`} className={`${classes.base} text-neutral-700 dark:text-neutral-200 mb-4 leading-relaxed`}>
            {parseInline(line)}
          </p>
        );
      }
      i++;
    }

    flushList();
    flushTable();
    flushCodeBlock();

    return elements;
  };

  const parseInline = (text: string): JSX.Element => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/);
    
    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
          } else if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={index} className="italic">{part.slice(1, -1)}</em>;
          } else if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <code key={index} className={`${classes.code} bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded font-mono text-neutral-800 dark:text-neutral-200`}>
                {part.slice(1, -1)}
              </code>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

  return <div className="markdown-content">{parseMarkdown(content)}</div>;
};

export default MarkdownRenderer;