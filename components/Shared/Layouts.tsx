
import React from 'react';
import { PageContainer, PageHeader, HeaderContainer } from './UI';
import SubModuleNav from './SubModuleNav';
import { STYLES } from '../../styles/theme';

interface StandardPageProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  modules?: string[];
  activeModule?: string;
  onModuleChange?: (module: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const StandardPage: React.FC<StandardPageProps> = ({ 
  title, subtitle, actions, modules, activeModule, onModuleChange, children, className 
}) => {
  return (
    <PageContainer noPadding className={className}>
      <HeaderContainer>
        <PageHeader title={title} subtitle={subtitle} actions={actions} />
      </HeaderContainer>
      
      {modules && activeModule && onModuleChange && (
        <SubModuleNav modules={modules} activeModule={activeModule} onChange={onModuleChange} />
      )}
      
      {/* Main Content Area - Handles Scrolling & Padding */}
      <div className={`flex-1 min-h-0 flex flex-col overflow-y-auto custom-scrollbar ${STYLES.page_padding}`}>
        {children}
      </div>
    </PageContainer>
  );
};

interface MasterDetailLayoutProps {
  title: string;
  subtitle?: string;
  listContent: React.ReactNode;
  detailContent: React.ReactNode;
  isDetailOpen: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  modules?: string[];
  activeModule?: string;
  onModuleChange?: (module: string) => void;
}

export const MasterDetailLayout: React.FC<MasterDetailLayoutProps> = ({
  title, subtitle, listContent, detailContent, isDetailOpen, onBack, actions, modules, activeModule, onModuleChange
}) => {
  return (
    <PageContainer noPadding>
      <HeaderContainer>
         <PageHeader title={title} subtitle={subtitle} actions={actions} />
      </HeaderContainer>

      {modules && activeModule && onModuleChange && (
        <SubModuleNav modules={modules} activeModule={activeModule} onChange={onModuleChange} />
      )}
      
      <div className={`flex-1 flex gap-6 relative overflow-hidden min-h-0 ${STYLES.page_padding}`}>
        {/* List View - Fixed width on desktop, full on mobile if detail closed */}
        <div className={`w-full md:w-80 lg:w-96 flex flex-col h-full shrink-0 transition-all duration-300 ${isDetailOpen ? 'hidden md:flex' : 'flex'}`}>
          {listContent}
        </div>
        
        {/* Detail View - Full width on mobile, flexible on desktop */}
        <div className={`w-full md:flex-1 h-full flex flex-col min-w-0 transition-all duration-300 ${isDetailOpen ? 'flex' : 'hidden md:flex'}`}>
          {detailContent}
        </div>
      </div>
    </PageContainer>
  );
};

interface DetailViewHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  actions?: React.ReactNode;
  tags?: React.ReactNode;
}

export const DetailViewHeader: React.FC<DetailViewHeaderProps> = ({
  title, subtitle, onBack, actions, tags
}) => {
  return (
    <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex flex-col gap-3 shrink-0">
      <div className="flex justify-between items-start gap-4">
         <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
           <button onClick={onBack} className="md:hidden text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded shrink-0">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
           </button>
           <div className="min-w-0 flex-1">
             <h2 className="text-lg md:text-xl font-bold text-white truncate leading-tight tracking-tight">{title}</h2>
             {subtitle && <p className="text-xs text-slate-500 font-mono truncate mt-0.5">{subtitle}</p>}
           </div>
         </div>
         {actions && <div className="flex gap-2 shrink-0 ml-auto flex-wrap justify-end">{actions}</div>}
      </div>
      {tags && <div className="flex flex-wrap gap-2">{tags}</div>}
    </div>
  );
};
