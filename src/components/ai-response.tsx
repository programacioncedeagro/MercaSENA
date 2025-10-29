'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Users, Wrench, Package, Leaf, Phone } from 'lucide-react';

interface AIResponseProps {
  content: string;
  timestamp?: Date;
  cropType: string;
  location: string;
}

export function AIResponse({ content, timestamp, cropType, location }: AIResponseProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Leaf className="w-3 h-3" />
          {cropType}
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          📍 {location}
        </Badge>
        {timestamp && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {timestamp.toLocaleDateString('es-CO')}
          </Badge>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="prose prose-sm max-w-none p-6">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
                    🌾 {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold text-green-700 mb-3 mt-6 pb-2 border-b border-green-200">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-medium text-green-600 mb-2 mt-4">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 leading-relaxed mb-3">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-2 ml-4 mb-4">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="space-y-2 ml-4 mb-4 list-decimal">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700 flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{children}</span>
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-green-800">
                    {children}
                  </strong>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-green-50">
                    {children}
                  </thead>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left font-semibold text-green-800 border-b border-gray-200">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-gray-700 border-b border-gray-100">
                    {children}
                  </td>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-green-300 pl-4 py-2 bg-green-50 rounded-r-lg my-4">
                    <div className="text-green-800 font-medium">
                      💡 Recomendación:
                    </div>
                    <div className="text-green-700 mt-1">
                      {children}
                    </div>
                  </blockquote>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto my-4">
                      <code>{children}</code>
                    </pre>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground text-center">
        💾 Esta consulta se ha guardado en tu historial
      </div>
    </div>
  );
}