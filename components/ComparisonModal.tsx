import React from 'react';
import { CloseIcon, LoadingIcon, CompareIcon } from './Icons';
import { formatMarkdown } from '../utils/markdown';

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: string | null;
    isLoading: boolean;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({ isOpen, onClose, result, isLoading }) => {
    if (!isOpen) {
        return null;
    }

    const formattedHtml = result ? formatMarkdown(result) : '';

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-4xl h-full max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <CompareIcon className="w-6 h-6 text-indigo-500" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Сравнение статей</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 bg-transparent rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        aria-label="Закрыть"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-grow overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <LoadingIcon className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">ИИ анализирует документы...</h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">Это может занять некоторое время, особенно для больших статей.</p>
                        </div>
                    ) : (
                        result && (
                             <div 
                                className="prose prose-sm sm:prose-base dark:prose-invert max-w-none" 
                                dangerouslySetInnerHTML={{ __html: formattedHtml }} 
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
