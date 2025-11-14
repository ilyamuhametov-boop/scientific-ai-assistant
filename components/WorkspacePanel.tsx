import React from 'react';
import { LibraryArticle } from '../types';
import { SharedArticleCard } from './SharedArticleCard';
import { WorkspaceIcon } from './Icons';

interface WorkspacePanelProps {
    articles: LibraryArticle[];
    onUpdateArticle: (article: LibraryArticle) => void;
    onDeleteArticle: (articleId: string) => void;
    onLoadArticle: (article: LibraryArticle) => void;
}

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({ articles, onUpdateArticle, onDeleteArticle, onLoadArticle }) => {
    
    const sortedArticles = [...articles].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    
    return (
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-100 dark:bg-gray-900">
            {sortedArticles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <WorkspaceIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Общее пространство пусто</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Поделитесь статьей из вашей библиотеки, чтобы начать совместную работу.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {sortedArticles.map(article => (
                        <SharedArticleCard 
                            key={article.id}
                            article={article}
                            onUpdate={onUpdateArticle}
                            onDelete={onDeleteArticle}
                            onLoad={onLoadArticle}
                        />
                    ))}
                </div>
            )}
        </main>
    );
};