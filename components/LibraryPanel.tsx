import React, { useState } from 'react';
import { LibraryArticle } from '../types';
import { ArticleCard } from './ArticleCard';
import { LibraryIcon, CompareIcon } from './Icons';

interface LibraryPanelProps {
    articles: LibraryArticle[];
    workspaceArticles: LibraryArticle[];
    onUpdateArticle: (article: LibraryArticle) => void;
    onDeleteArticle: (articleId: string) => void;
    onLoadArticle: (article: LibraryArticle) => void;
    onShareArticle: (articleId: string) => void;
    onCompare: (articles: LibraryArticle[]) => void;
}

export const LibraryPanel: React.FC<LibraryPanelProps> = ({ 
    articles, 
    workspaceArticles, 
    onUpdateArticle, 
    onDeleteArticle, 
    onLoadArticle, 
    onShareArticle,
    onCompare
}) => {
    const [selectedArticleIds, setSelectedArticleIds] = useState<Set<string>>(new Set());

    const handleSelectArticle = (articleId: string) => {
        setSelectedArticleIds(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(articleId)) {
                newSelection.delete(articleId);
            } else {
                newSelection.add(articleId);
            }
            return newSelection;
        });
    };

    const handleCompareClick = () => {
        const selectedArticles = articles.filter(a => selectedArticleIds.has(a.id));
        if (selectedArticles.length >= 2) {
            onCompare(selectedArticles);
            setSelectedArticleIds(new Set()); // Deselect after comparing
        }
    };
    
    const sortedArticles = [...articles].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    const workspaceArticleIds = new Set(workspaceArticles.map(a => a.id));

    const numSelected = selectedArticleIds.size;

    return (
        <div className="flex flex-col h-full">
            {numSelected >= 2 && (
                <div className="sticky top-0 z-10 flex items-center justify-between p-3 bg-indigo-600 text-white shadow-lg animate-fade-in-down">
                    <span className="font-semibold">{numSelected} статей выбрано</span>
                    <button
                        onClick={handleCompareClick}
                        className="flex items-center px-4 py-2 bg-white text-indigo-600 font-bold rounded-md hover:bg-indigo-100 transition-colors"
                    >
                        <CompareIcon className="w-5 h-5 mr-2" />
                        Сравнить
                    </button>
                </div>
            )}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-100 dark:bg-gray-900">
                {sortedArticles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <LibraryIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Ваша библиотека пуста</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Проанализируйте документ и сохраните его, чтобы увидеть здесь.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {sortedArticles.map(article => (
                            <ArticleCard 
                                key={article.id}
                                article={article}
                                onUpdate={onUpdateArticle}
                                onDelete={onDeleteArticle}
                                onLoad={onLoadArticle}
                                onShare={onShareArticle}
                                isShared={workspaceArticleIds.has(article.id)}
                                onSelect={handleSelectArticle}
                                isSelected={selectedArticleIds.has(article.id)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};