import React, { useState, useEffect, useRef } from 'react';
import { LibraryArticle } from '../types';
import { FileIcon, DeleteIcon, ReminderIcon, ShareIcon } from './Icons';
import { StarRating } from './StarRating';

interface ArticleCardProps {
    article: LibraryArticle;
    onUpdate: (article: LibraryArticle) => void;
    onDelete: (articleId: string) => void;
    onLoad: (article: LibraryArticle) => void;
    onShare?: (articleId: string) => void; // Optional for library view
    isShared?: boolean; // Optional for library view
    onSelect?: (articleId: string) => void;
    isSelected?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onUpdate, onDelete, onLoad, onShare, isShared, onSelect, isSelected }) => {
    const [notes, setNotes] = useState(article.notes);
    const [tags, setTags] = useState(article.tags.join(', '));
    const [rating, setRating] = useState(article.rating);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [reminderDate, setReminderDate] = useState(article.reminderDate || '');
    const [reminderNote, setReminderNote] = useState(article.reminderNote || '');
    
    const notesRef = useRef<HTMLTextAreaElement>(null);
    const isInitialMount = useRef(true);

    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const handler = setTimeout(() => {
            handleSaveChanges();
        }, 1000); // Debounce time

        return () => {
            clearTimeout(handler);
        };
    }, [notes, tags, rating]);
    
    useEffect(() => {
        // Auto-resize textarea
        if (notesRef.current) {
            notesRef.current.style.height = 'auto';
            notesRef.current.style.height = `${notesRef.current.scrollHeight}px`;
        }
    }, [notes]);
    
    const handleSaveChanges = (reminderChanges: Partial<LibraryArticle> = {}) => {
        const updatedArticle: LibraryArticle = {
            ...article,
            notes,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
            rating,
            ...reminderChanges,
        };
        onUpdate(updatedArticle);
    };

    const handleDelete = () => {
        if (window.confirm(`Вы уверены, что хотите удалить "${article.fileName}" из своей библиотеки?`)) {
            onDelete(article.id);
        }
    };
    
    const handleReminderSave = (e: React.FormEvent) => {
        e.preventDefault();
        const reminderUpdate: Partial<LibraryArticle> = {
            reminderDate: reminderDate,
            reminderNote: reminderNote,
        };
        handleSaveChanges(reminderUpdate);
        setIsReminderModalOpen(false);
    };

    const handleReminderClear = () => {
        const updatedArticle = { ...article };
        delete updatedArticle.reminderDate;
        delete updatedArticle.reminderNote;
        onUpdate(updatedArticle);
        setReminderDate('');
        setReminderNote('');
        setIsReminderModalOpen(false);
    };


    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col relative ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}>
             {onSelect && (
                <div className="absolute top-2 right-2 z-10">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelect(article.id)}
                        className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                </div>
            )}
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                    <div className="flex items-center min-w-0 pr-8">
                        <FileIcon className="w-7 h-7 text-indigo-500 flex-shrink-0 mr-3" />
                        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 truncate" title={article.fileName}>
                            {article.fileName}
                        </h3>
                    </div>
                     <button onClick={handleDelete} className="p-1.5 ml-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors absolute top-2 right-9">
                        <DeleteIcon className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Добавлено: {new Date(article.dateAdded).toLocaleDateString()}</p>
            </div>
            
            <div className="p-5 flex-grow">
                 {article.reminderDate && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center text-yellow-800 dark:text-yellow-200">
                            <ReminderIcon className="w-5 h-5 mr-2"/>
                            <p className="text-sm font-semibold">Напоминание</p>
                        </div>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            {new Date(article.reminderDate).toLocaleString()}
                        </p>
                        {article.reminderNote && <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 italic">"{article.reminderNote}"</p>}
                    </div>
                )}
                <div className="mb-4">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Рейтинг</label>
                    <StarRating rating={rating} onRatingChange={setRating} />
                </div>
                <div className="mb-4">
                    <label htmlFor={`notes-${article.id}`} className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Заметки</label>
                    <textarea
                        id={`notes-${article.id}`}
                        ref={notesRef}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Добавьте ваши заметки..."
                        className="mt-1 w-full p-2 text-sm bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none overflow-hidden"
                        rows={2}
                    />
                </div>
                 <div>
                    <label htmlFor={`tags-${article.id}`} className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Теги</label>
                    <input
                        id={`tags-${article.id}`}
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="тег1, тег2, тег3..."
                        className="mt-1 w-full p-2 text-sm bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex items-center space-x-2">
                {onShare && (
                     <button 
                        onClick={() => onShare(article.id)}
                        disabled={isShared}
                        className="flex-grow flex items-center justify-center py-2 px-3 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShareIcon className="w-5 h-5 mr-2"/>
                        {isShared ? 'В общем доступе' : 'Поделиться'}
                    </button>
                )}
                 <button 
                    onClick={() => setIsReminderModalOpen(!isReminderModalOpen)}
                    className="flex items-center justify-center p-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors"
                >
                    <ReminderIcon className="w-5 h-5"/>
                </button>
                <button 
                    onClick={() => onLoad(article)}
                    className="flex-grow py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors"
                >
                    Загрузить
                </button>
            </div>
            
             {isReminderModalOpen && (
                <div className="p-5 border-t border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleReminderSave}>
                        <h4 className="text-sm font-semibold mb-2">Установить напоминание</h4>
                        <div>
                            <label htmlFor={`reminder-date-${article.id}`} className="text-xs font-medium text-gray-600 dark:text-gray-400">Дата и время</label>
                            <input
                                id={`reminder-date-${article.id}`}
                                type="datetime-local"
                                value={reminderDate}
                                onChange={e => setReminderDate(e.target.value)}
                                min={getMinDateTime()}
                                required
                                className="mt-1 w-full p-2 text-sm bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>
                        <div className="mt-2">
                            <label htmlFor={`reminder-note-${article.id}`} className="text-xs font-medium text-gray-600 dark:text-gray-400">Заметка (необязательно)</label>
                            <input
                                id={`reminder-note-${article.id}`}
                                type="text"
                                value={reminderNote}
                                onChange={e => setReminderNote(e.target.value)}
                                placeholder="Например, подготовить резюме..."
                                className="mt-1 w-full p-2 text-sm bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>
                        <div className="flex items-center justify-end space-x-2 mt-4">
                           {article.reminderDate && (
                                <button type="button" onClick={handleReminderClear} className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors">
                                    Удалить
                                </button>
                            )}
                            <button type="button" onClick={() => setIsReminderModalOpen(false)} className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md transition-colors">
                                Отмена
                            </button>
                            <button type="submit" className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors">
                                Сохранить
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};