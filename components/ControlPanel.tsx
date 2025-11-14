import React, { useRef, useState } from 'react';
import { AppState } from '../types';
import { UploadIcon, FileIcon, LoadingIcon, SummaryIcon, KeywordsIcon, PlanIcon, LightbulbIcon, CitationIcon, SaveIcon, ConceptMapIcon, CitationGraphIcon, GoogleIcon, KnowledgeGraphIcon, MetricsIcon, StyleCheckIcon, PlagiarismCheckIcon } from './Icons';

interface ControlPanelProps {
  pdfFile: File | null;
  onFileChange: (file: File | null) => void;
  onQuickAction: (prompt: string, useGrounding?: boolean, isContextFree?: boolean) => void;
  onGenerateGraph: () => void;
  isThinkingMode: boolean;
  onThinkingModeChange: (enabled: boolean) => void;
  appState: AppState;
  onSaveToLibrary: () => void;
  isCurrentFileInLibrary: boolean;
}

const ActionButton: React.FC<{ icon: React.ReactNode; text: string; onClick: () => void; disabled: boolean; }> = ({ icon, text, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-full flex items-center text-left p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
    >
        {icon}
        <span className="ml-3">{text}</span>
    </button>
);


export const ControlPanel: React.FC<ControlPanelProps> = ({
  pdfFile,
  onFileChange,
  onQuickAction,
  onGenerateGraph,
  isThinkingMode,
  onThinkingModeChange,
  appState,
  onSaveToLibrary,
  isCurrentFileInLibrary,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textToCheck, setTextToCheck] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const isActionDisabled = appState !== AppState.READY;
  const isWritingToolDisabled = !textToCheck.trim() || appState === AppState.GENERATING;

  return (
    <aside className="w-full md:w-96 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col space-y-6 overflow-y-auto">
      <div>
        <h2 className="text-lg font-semibold mb-3">Документ</h2>
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf"
            className="hidden"
            disabled={appState === AppState.PROCESSING_PDF}
        />
        <button
          onClick={handleUploadClick}
          disabled={appState === AppState.PROCESSING_PDF || appState === AppState.GENERATING}
          className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait"
        >
          {appState === AppState.PROCESSING_PDF ? (
              <LoadingIcon className="w-8 h-8 text-indigo-500 animate-spin mb-2"/>
          ) : (
              <UploadIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
          )}
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {appState === AppState.PROCESSING_PDF ? "Обработка..." : pdfFile ? "Загрузить другой PDF" : "Загрузить PDF"}
          </span>
          <span className="text-xs text-gray-500">Макс. 10 МБ</span>
        </button>

        {pdfFile && (
            <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center space-x-3">
                <FileIcon className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200 truncate" title={pdfFile.name}>{pdfFile.name}</p>
            </div>
        )}
      </div>
      
       <div>
        <h2 className="text-lg font-semibold mb-3">Инструменты для письма</h2>
        <textarea
            value={textToCheck}
            onChange={(e) => setTextToCheck(e.target.value)}
            placeholder="Вставьте сюда свой текст для проверки или перефразирования..."
            className="w-full p-2 text-sm bg-white dark:bg-gray-700/50 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition resize-y min-h-[100px]"
            rows={4}
        />
        <div className="space-y-2 mt-2">
             <ActionButton 
                icon={<StyleCheckIcon className="w-5 h-5"/>}
                text="Проверить научный стиль"
                onClick={() => onQuickAction(`Проверь следующий текст на соответствие научному стилю. Обрати внимание на пассивный залог, лишние слова (канцеляризмы) и общую ясность формулировок. Предоставь исправленную версию и краткие комментарии по каждому изменению. Текст для проверки: '${textToCheck}'`, false, true)}
                disabled={isWritingToolDisabled}
            />
             <ActionButton 
                icon={<PlagiarismCheckIcon className="w-5 h-5"/>}
                text="Перефразировать (антиплагиат)"
                onClick={() => onQuickAction(`Перефразируй следующий текст, чтобы избежать плагиата, но сохрани его первоначальный научный смысл. Представь только перефразированную версию. Текст для перефразирования: '${textToCheck}'`, false, true)}
                disabled={isWritingToolDisabled}
            />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Быстрые действия</h2>
        <div className="space-y-2">
            <ActionButton 
                icon={<SaveIcon className="w-5 h-5"/>}
                text={isCurrentFileInLibrary ? "Сохранено в библиотеке" : "Сохранить в библиотеку"}
                onClick={onSaveToLibrary}
                disabled={isActionDisabled || isCurrentFileInLibrary}
            />
            <ActionButton 
                icon={<SummaryIcon className="w-5 h-5"/>}
                text="Создать резюме"
                onClick={() => onQuickAction("Предоставь краткое резюме этого документа, включая его ключевые выводы.")}
                disabled={isActionDisabled}
            />
            <ActionButton 
                icon={<KeywordsIcon className="w-5 h-5"/>}
                text="Извлечь ключевые слова"
                onClick={() => onQuickAction("Извлеки основные ключевые слова и концепции из этой статьи.")}
                disabled={isActionDisabled}
            />
            <ActionButton 
                icon={<PlanIcon className="w-5 h-5"/>}
                text="Составить план презентации"
                onClick={() => onQuickAction("Создай пошаговый план презентации на основе этой статьи.")}
                disabled={isActionDisabled}
            />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Поиск в Интернете</h2>
        <div className="space-y-2">
            <ActionButton 
                icon={<GoogleIcon className="w-5 h-5"/>}
                text="Найти похожие статьи"
                onClick={() => onQuickAction("Используя поиск, найди новейшие научные статьи (из Scopus, Web of Science, ВАК и т.д.), похожие на предоставленный документ. Предоставь краткое описание для каждой.", true)}
                disabled={isActionDisabled}
            />
            <ActionButton 
                icon={<MetricsIcon className="w-5 h-5"/>}
                text="Определить ключевые метрики"
                onClick={() => onQuickAction("Используя поиск, определи ключевые метрики для этой статьи: импакт-фактор журнала, количество цитирований статьи и h-index основного автора. Если информация недоступна, укажи это.", true)}
                disabled={isActionDisabled}
            />
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-3">Инструменты цитирования</h2>
        <div className="space-y-2">
            <ActionButton 
                icon={<CitationIcon className="w-5 h-5"/>}
                text="Оформить по APA"
                onClick={() => onQuickAction("Извлеки библиографическую информацию из этой статьи и отформатируй ее в виде цитаты в стиле APA.")}
                disabled={isActionDisabled}
            />
            <ActionButton 
                icon={<CitationIcon className="w-5 h-5"/>}
                text="Оформить по MLA"
                onClick={() => onQuickAction("Извлеки библиографическую информацию из этой статьи и отформатируй ее в виде цитаты в стиле MLA.")}
                disabled={isActionDisabled}
            />
            <ActionButton 
                icon={<CitationIcon className="w-5 h-5"/>}
                text="Оформить по ГОСТ"
                onClick={() => onQuickAction("Извлеки библиографическую информацию из этой статьи и отформатируй ее в виде цитаты по ГОСТ (GOST).")}
                disabled={isActionDisabled}
            />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Инструменты визуализации</h2>
        <div className="space-y-2">
            <ActionButton 
                icon={<ConceptMapIcon className="w-5 h-5"/>}
                text="Создать карту понятий"
                onClick={() => onQuickAction("Проанализируй текст и создай карту ключевых понятий. Представь ее в виде иерархического списка (markdown), показывающего основные идеи и их взаимосвязи.")}
                disabled={isActionDisabled}
            />
            <ActionButton 
                icon={<CitationGraphIcon className="w-5 h-5"/>}
                text="Создать диаграмму цитирования"
                onClick={() => onQuickAction("Проанализируй библиографию или список литературы в этом документе. Извлеки список цитируемых работ и представь его в виде структурированного списка.")}
                disabled={isActionDisabled}
            />
            <ActionButton 
                icon={<KnowledgeGraphIcon className="w-5 h-5"/>}
                text="Построить граф знаний"
                onClick={onGenerateGraph}
                disabled={isActionDisabled}
            />
        </div>
      </div>

      <div className="mt-auto pt-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
            <LightbulbIcon className="w-5 h-5 mr-2 text-yellow-400"/>
            Расширенный режим
        </h2>
        <div className="flex items-center justify-between p-3 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <div>
                <p className="font-semibold text-sm">Сложные запросы</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Используйте более мощную модель для глубокого анализа.</p>
            </div>
            <label htmlFor="thinking-mode-toggle" className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="thinking-mode-toggle" className="sr-only peer" checked={isThinkingMode} onChange={(e) => onThinkingModeChange(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-indigo-600"></div>
            </label>
        </div>
      </div>
    </aside>
  );
};