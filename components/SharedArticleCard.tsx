import React, { useState } from 'react';
import { LibraryArticle, Comment } from '../types';
import { FileIcon, DeleteIcon, SendIcon, UserIcon } from './Icons';
import { StarRating } from './StarRating';

interface SharedArticleCardProps {
    article: LibraryArticle;
    onUpdate: (article: LibraryArticle) => void;
    onDelete: (articleId: string) => void;
    onLoad: (article: LibraryArticle) => void;
}

export const SharedArticleCard: React.FC<SharedArticleCardProps> = ({ article, onUpdate, onDelete, onLoad }) => {
    const [newComment, setNewComment] = useState('');
    const [authorName, setAuthorName] = useState(localStorage.getItem('scholarly-ai-author') || '');

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !authorName.trim()) {
            alert('Пожалуйста, введите ваше имя и комментарий.');
            return;
        }

        const comment: Comment = {
            id: Date.now().toString(),
            author: authorName.trim(),
            text: newComment.trim(),
            timestamp: new Date().toISOString(),
        };

        const updatedArticle = {
            ...article,
            comments: [...(article.comments || []), comment],
        };
        onUpdate(updatedArticle);
        setNewComment('');
        localStorage.setItem('scholarly-ai-author', authorName.trim());
    };
    
     const handleDelete = () => {
        if (window.confirm(`Вы уверены, что хотите удалить "${article.fileName}" из общего пространства?`)) {
            onDelete(article.id);
        }
    };


    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                     <div className="flex items-center min-w-0">
                        <FileIcon className="w-7 h-7 text-indigo-500 flex-shrink-0 mr-3" />
                        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 truncate" title={article.fileName}>
                            {article.fileName}
                        </h3>
                    </div>
                     <button onClick={handleDelete} className="p-1.5 ml-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <DeleteIcon className="w-5 h-5" />
                    </button>
                </div>
                 <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Добавлено: {new Date(article.dateAdded).toLocaleDateString()}</p>
            </div>
            
            <div className="p-5 flex-grow">
                 <div className="mb-4">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Рейтинг</label>
                    <StarRating rating={article.rating} onRatingChange={() => {}} />
                </div>
                <div className="mb-4">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Заметки</label>
                    <div className="mt-1 w-full p-2 text-sm bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600 min-h-[4rem]">
                        {article.notes || <span className="text-gray-400">Нет заметок</span>}
                    </div>
                </div>
                 <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Теги</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {article.tags.length > 0 ? article.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full">{tag}</span>
                        )) : <span className="text-xs text-gray-400">Нет тегов</span>}
                    </div>
                </div>
            </div>
            
             {/* Comments Section */}
            <div className="p-5 border-t border-gray-200 dark:border-gray-700">
                 <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Комментарии</h4>
                 <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                     {(article.comments || []).slice().sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map(comment => (
                        <div key={comment.id} className="flex items-start space-x-3">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300">
                                <UserIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{comment.author}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(comment.timestamp).toLocaleTimeString()}</p>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                    {(article.comments || []).length === 0 && <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">Комментариев пока нет.</p>}
                 </div>
                 <form onSubmit={handleCommentSubmit} className="mt-4 space-y-2">
                     <input
                        type="text"
                        value={authorName}
                        onChange={e => setAuthorName(e.target.value)}
                        placeholder="Ваше имя"
                        required
                        className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                     />
                    <div className="flex items-center space-x-2">
                         <input
                            type="text"
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            placeholder="Добавить комментарий..."
                            required
                            className="flex-1 p-2 text-sm bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                        <button type="submit" className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors">
                            <SendIcon className="w-5 h-5"/>
                        </button>
                    </div>
                 </form>
            </div>

            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
                <button 
                    onClick={() => onLoad(article)}
                    className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors"
                >
                    Загрузить для анализа
                </button>
            </div>
        </div>
    );
};