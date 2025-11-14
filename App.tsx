import React, { useState, useCallback, useEffect } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { ControlPanel } from './components/ControlPanel';
import { LibraryPanel } from './components/LibraryPanel';
import { WorkspacePanel } from './components/WorkspacePanel';
import { GraphModal } from './components/GraphModal';
import { ComparisonModal } from './components/ComparisonModal';
import { extractTextFromPdf } from './services/pdfService';
import { generateResponse, generateGraphData, generateComparison } from './services/geminiService';
import { fileToDataUrl, dataUrlToBlob } from './services/fileService';
import { ChatMessage, AppState, LibraryArticle, GraphData, ComparisonArticle, Theme } from './types';
import { ThinkingIcon, LogoutIcon, LibraryIcon, BackIcon, WorkspaceIcon, SunIcon, MoonIcon, SystemIcon } from './components/Icons';
import { Login } from './components/Login';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [isThinkingMode, setIsThinkingMode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [library, setLibrary] = useState<LibraryArticle[]>([]);
  const [workspace, setWorkspace] = useState<LibraryArticle[]>([]);
  const [currentView, setCurrentView] = useState<'chat' | 'library' | 'workspace'>('chat');
  
  const [isGraphModalOpen, setIsGraphModalOpen] = useState<boolean>(false);
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState<boolean>(false);
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('scholarly-ai-theme');
    return (savedTheme as Theme) || Theme.SYSTEM;
  });

  // Effect to apply theme class and save preference
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === Theme.DARK ||
      (theme === Theme.SYSTEM &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
    
    localStorage.setItem('scholarly-ai-theme', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        if (theme === Theme.SYSTEM) {
            const newIsDark = mediaQuery.matches;
            root.classList.remove(newIsDark ? 'light' : 'dark');
            root.classList.add(newIsDark ? 'dark' : 'light');
        }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);


  const resetState = useCallback(() => {
      setPdfFile(null);
      setPdfText(null);
      setError(null);
      setMessages([
        {
          id: 'initial',
          text: 'Добро пожаловать! Вы можете задать мне любой вопрос или загрузить PDF-статью для анализа.',
          sender: 'bot'
        }
      ]);
      setAppState(AppState.IDLE);
      setIsThinkingMode(false);
  }, []);

  // Load library & workspace from localStorage on initial mount
  useEffect(() => {
    try {
      const savedLibrary = localStorage.getItem('scholarly-ai-library');
      if (savedLibrary) {
        setLibrary(JSON.parse(savedLibrary));
      }
      const savedWorkspace = localStorage.getItem('scholarly-ai-workspace');
      if (savedWorkspace) {
        setWorkspace(JSON.parse(savedWorkspace));
      }
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    }
    resetState();
  }, [resetState]);

  // Save library to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('scholarly-ai-library', JSON.stringify(library));
    } catch (e) {
      console.error("Failed to save library to localStorage", e);
    }
  }, [library]);
  
  // Save workspace to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('scholarly-ai-workspace', JSON.stringify(workspace));
    } catch (e) {
      console.error("Failed to save workspace to localStorage", e);
    }
  }, [workspace]);

  // Check for reminders periodically
  useEffect(() => {
    const checkReminders = () => {
        const now = new Date();
        library.forEach(article => {
            if (article.reminderDate && new Date(article.reminderDate) <= now) {
                // Trigger reminder
                alert(`Напоминание для "${article.fileName}":\n${article.reminderNote || 'Время просмотреть эту статью!'}`);
                
                // Clear the reminder after it has been triggered
                const updatedArticle: LibraryArticle = { ...article };
                delete updatedArticle.reminderDate;
                delete updatedArticle.reminderNote;
                handleUpdateLibraryArticle(updatedArticle);
            }
        });
    };

    const intervalId = setInterval(checkReminders, 60000); // Check every minute

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [library]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setIsAuthReady(true);
        if (!user) {
            setCurrentView('chat');
            resetState();
        }
    });

    return () => unsubscribe();
  }, [resetState]);

  const handleLogout = async () => {
    try {
        await signOut(auth);
    } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Неизвестная ошибка.';
        setError(`Не удалось выйти: ${errorMsg}`);
    }
  };

  const handleFileChange = useCallback(async (file: File | null) => {
    if (!file) {
      resetState();
      return;
    }

    setAppState(AppState.PROCESSING_PDF);
    setError(null);
    setPdfFile(file);
    setMessages([{ id: Date.now().toString(), text: `Обработка ${file.name}...`, sender: 'bot' }]);
    
    try {
      const text = await extractTextFromPdf(file);
      setPdfText(text);
      setAppState(AppState.READY);
      setMessages(prev => [...prev, { id: Date.now().toString() + '2', text: `"${file.name}" успешно проанализирован. Теперь вы можете задавать вопросы, использовать быстрые действия или сохранить статью в библиотеку.`, sender: 'bot' }]);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Произошла неизвестная ошибка при обработке PDF.';
      setError(errorMsg);
      setAppState(AppState.ERROR);
      setMessages(prev => [...prev, { id: Date.now().toString() + 'err', text: `Ошибка: ${errorMsg}`, sender: 'bot' }]);
      setPdfFile(null);
      setPdfText(null);
    }
  }, []);

  const handleSendMessage = useCallback(async (prompt: string, useGrounding: boolean = false, isContextFree: boolean = false) => {
    if ((!pdfText && !isContextFree) || appState === AppState.GENERATING) {
        // Allow context-free requests (like from writing tools) even if pdfText is null
        if (!isContextFree) return;
    }
    
    if (appState === AppState.GENERATING) return;

    setError(null);
    setAppState(AppState.GENERATING);
    const newUserMessage: ChatMessage = { id: Date.now().toString(), text: prompt, sender: 'user' };
    setMessages(prev => [...prev, newUserMessage]);
    
    try {
      const context = isContextFree ? null : pdfText;
      const responseText = await generateResponse(prompt, context, isThinkingMode, useGrounding);
      const botMessage: ChatMessage = { id: Date.now().toString() + 'bot', text: responseText, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Произошла неизвестная ошибка при обращении к ИИ.';
      setError(errorMsg);
      const botError: ChatMessage = { id: Date.now().toString() + 'boterr', text: `Извините, я столкнулся с ошибкой: ${errorMsg}`, sender: 'bot' };
      setMessages(prev => [...prev, botError]);
    } finally {
      setAppState(pdfText ? AppState.READY : AppState.IDLE);
    }
  }, [pdfText, appState, isThinkingMode]);

  const handleGenerateGraph = useCallback(async () => {
    if (!pdfText || appState === AppState.GENERATING) return;

    setError(null);
    setAppState(AppState.GENERATING);
    setMessages(prev => [...prev, { id: Date.now().toString() + 'graph-req', text: 'Запрос на построение графа знаний...', sender: 'user' }]);

    try {
        const data = await generateGraphData(pdfText);
        setGraphData(data);
        setIsGraphModalOpen(true);
        setMessages(prev => [...prev, { id: Date.now().toString() + 'graph-res', text: 'Граф знаний успешно создан и готов к просмотру.', sender: 'bot' }]);
    } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Произошла неизвестная ошибка при создании графа.';
        setError(errorMsg);
        setMessages(prev => [...prev, { id: Date.now().toString() + 'graph-err', text: `Ошибка: ${errorMsg}`, sender: 'bot' }]);
    } finally {
        setAppState(pdfText ? AppState.READY : AppState.IDLE);
    }
  }, [pdfText, appState]);


  const handleSaveToLibrary = async () => {
    if (!pdfFile || !pdfText) return;

    const articleId = `${pdfFile.name}-${pdfFile.size}`;
    if (library.some(article => article.id === articleId)) {
        return;
    }

    const dataUrl = await fileToDataUrl(pdfFile);
    const newArticle: LibraryArticle = {
        id: articleId,
        fileName: pdfFile.name,
        fileDataUrl: dataUrl,
        pdfText: pdfText,
        tags: [],
        rating: 0,
        notes: '',
        dateAdded: new Date().toISOString(),
        comments: [],
    };
    setLibrary(prev => [newArticle, ...prev]);
  };
  
  const handleUpdateLibraryArticle = (updatedArticle: LibraryArticle) => {
    setLibrary(prev => prev.map(article => article.id === updatedArticle.id ? updatedArticle : article));
  };
  
  const handleDeleteFromLibrary = (articleId: string) => {
    setLibrary(prev => prev.filter(article => article.id !== articleId));
  };

  const handleLoadFromLibrary = async (article: LibraryArticle) => {
    const blob = await dataUrlToBlob(article.fileDataUrl);
    const file = new File([blob], article.fileName, { type: blob.type });

    setPdfFile(file);
    setPdfText(article.pdfText);
    setError(null);
    setMessages([
        {
          id: 'initial-load',
          text: `Статья "${article.fileName}" загружена из вашей библиотеки. Вы можете продолжить анализ.`,
          sender: 'bot'
        }
    ]);
    setAppState(AppState.READY);
    setCurrentView('chat');
  };

  const handleShareToWorkspace = (articleId: string) => {
    if (workspace.some(a => a.id === articleId)) return;
    const articleToShare = library.find(a => a.id === articleId);
    if (articleToShare) {
      setWorkspace(prev => [articleToShare, ...prev]);
    }
  };

  const handleUpdateWorkspaceArticle = (updatedArticle: LibraryArticle) => {
    setWorkspace(prev => prev.map(article => article.id === updatedArticle.id ? updatedArticle : article));
  };

  const handleDeleteFromWorkspace = (articleId: string) => {
    setWorkspace(prev => prev.filter(article => article.id !== articleId));
  };

  const handleCompareArticles = async (articlesToCompare: LibraryArticle[]) => {
    if (articlesToCompare.length < 2) return;

    setIsComparing(true);
    setComparisonResult(null);
    setIsComparisonModalOpen(true);

    const comparisonData: ComparisonArticle[] = articlesToCompare.map(a => ({
        fileName: a.fileName,
        pdfText: a.pdfText,
    }));

    try {
        const result = await generateComparison(comparisonData);
        setComparisonResult(result);
    } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Произошла неизвестная ошибка при сравнении статей.';
        setComparisonResult(`**Ошибка:**\n\nНе удалось выполнить сравнение. ${errorMsg}`);
    } finally {
        setIsComparing(false);
    }
  };

  const handleThemeToggle = () => {
    setTheme(prev => {
        if (prev === Theme.SYSTEM) return Theme.LIGHT;
        if (prev === Theme.LIGHT) return Theme.DARK;
        return Theme.SYSTEM;
    });
  };

  const renderThemeIcon = () => {
    switch (theme) {
        case Theme.LIGHT:
            return <SunIcon className="w-6 h-6" />;
        case Theme.DARK:
            return <MoonIcon className="w-6 h-6" />;
        default:
            return <SystemIcon className="w-6 h-6" />;
    }
  };

  const getThemeTooltip = () => {
    switch (theme) {
        case Theme.LIGHT:
            return 'Светлая тема';
        case Theme.DARK:
            return 'Темная тема';
        default:
            return 'Системная тема';
    }
  }

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <ThinkingIcon className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-sm">Загружаем настройки...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  const isCurrentFileInLibrary = pdfFile ? library.some(a => a.id === `${pdfFile.name}-${pdfFile.size}`) : false;

  const renderHeaderTitle = () => {
    switch(currentView) {
      case 'library': return 'Моя библиотека';
      case 'workspace': return 'Общее пространство';
      default: return 'Научный ИИ-ассистент';
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center space-x-3">
          {currentView !== 'chat' ? (
              <button onClick={() => setCurrentView('chat')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <BackIcon className="w-6 h-6" />
              </button>
          ) : (
            <ThinkingIcon className="w-8 h-8 text-indigo-500" />
          )}
          <h1 className="text-xl font-bold">
            {renderHeaderTitle()}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
           <button onClick={handleThemeToggle} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors" title={getThemeTooltip()}>
            {renderThemeIcon()}
          </button>
          <button onClick={() => setCurrentView('library')} className={`p-2 rounded-full ${currentView === 'library' ? 'bg-gray-200 dark:bg-gray-700' : ''} text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors`} title='Открыть библиотеку'>
            <LibraryIcon className="w-6 h-6" />
          </button>
          <button onClick={() => setCurrentView('workspace')} className={`p-2 rounded-full ${currentView === 'workspace' ? 'bg-gray-200 dark:bg-gray-700' : ''} text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors`} title='Открыть общее пространство'>
            <WorkspaceIcon className="w-6 h-6" />
          </button>
          <button onClick={handleLogout} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors" title="Выйти">
            <LogoutIcon className="w-6 h-6" />
          </button>
        </div>
      </header>
      
      {currentView === 'chat' && (
        <div className="flex flex-1 overflow-hidden">
            <ControlPanel
              pdfFile={pdfFile}
              onFileChange={handleFileChange}
              onQuickAction={handleSendMessage}
              onGenerateGraph={handleGenerateGraph}
              isThinkingMode={isThinkingMode}
              onThinkingModeChange={setIsThinkingMode}
              appState={appState}
              onSaveToLibrary={handleSaveToLibrary}
              isCurrentFileInLibrary={isCurrentFileInLibrary}
            />
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              appState={appState}
              isPdfLoaded={!!pdfFile}
            />
        </div>
      )}
      {currentView === 'library' && (
        <LibraryPanel
            articles={library}
            workspaceArticles={workspace}
            onUpdateArticle={handleUpdateLibraryArticle}
            onDeleteArticle={handleDeleteFromLibrary}
            onLoadArticle={handleLoadFromLibrary}
            onShareArticle={handleShareToWorkspace}
            onCompare={handleCompareArticles}
        />
      )}
      {currentView === 'workspace' && (
        <WorkspacePanel
            articles={workspace}
            onUpdateArticle={handleUpdateWorkspaceArticle}
            onDeleteArticle={handleDeleteFromWorkspace}
            onLoadArticle={handleLoadFromLibrary}
        />
      )}
      <GraphModal 
        isOpen={isGraphModalOpen}
        onClose={() => setIsGraphModalOpen(false)}
        data={graphData}
      />
      <ComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        result={comparisonResult}
        isLoading={isComparing}
      />
    </div>
  );
};

export default App;
