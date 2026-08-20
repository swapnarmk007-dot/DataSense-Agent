import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { UploadView } from './components/UploadView';
import { ChatView } from './components/ChatView';
import { ProfileView } from './components/ProfileView';
import { CleaningView } from './components/CleaningView';
import { VisualAnalyticsView } from './components/VisualAnalyticsView';
import { AnomalyView } from './components/AnomalyView';
import { ForecastingView } from './components/ForecastingView';
import { InsightsView } from './components/InsightsView';
import { ReportView } from './components/ReportView';
import { CodebaseView } from './components/CodebaseView';

import { NavTab, DatasetProfile, ChatMessage, DataCleaningLog } from './types';
import { sampleSalesDataset } from './data/sampleData';
import { profileDataset, cleanDataset } from './utils/dataEngine';
import { executeAgentWorkflow } from './utils/agentOrchestrator';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [data, setData] = useState<Record<string, any>[]>(sampleSalesDataset);
  const [datasetName, setDatasetName] = useState<string>('sample_sales.csv');
  const [profile, setProfile] = useState<DatasetProfile | null>(null);
  const [cleaningLogs, setCleaningLogs] = useState<DataCleaningLog[]>([]);
  const [isCleaned, setIsCleaned] = useState<boolean>(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Hello! I am **DataSense Agent**, your autonomous AI Data Analyst developed by **Swapna V (Agentic AI Engineer)**.\n\nI have loaded the **Enterprise Sales Dataset** with 61 transactions across North, South, East, and West territories. Ask me anything about revenue, top products, outliers, or future forecasts!',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [activePlan, setActivePlan] = useState<string[]>([]);

  // Compute profile on dataset changes
  useEffect(() => {
    if (data && data.length > 0) {
      const p = profileDataset(data, datasetName);
      setProfile(p);
    } else {
      setProfile(null);
    }
  }, [data, datasetName]);

  const handleDatasetLoaded = (newData: Record<string, any>[], filename: string) => {
    setData(newData);
    setDatasetName(filename);
    setIsCleaned(false);
    setCleaningLogs([]);
    setActiveTab('dashboard');

    // Notify in chat
    const p = profileDataset(newData, filename);
    setMessages((prev) => [
      ...prev,
      {
        id: `upload-${Date.now()}`,
        role: 'assistant',
        content: `📁 **Dataset Successfully Loaded: ${filename}**\n\n- Total Records: **${p.rowCount.toLocaleString()}**\n- Total Features: **${p.columnCount}**\n- Initial Data Quality Score: **${p.dataQualityScore}%**\n\nYou can now run autonomous natural language queries or explore the analytical views.`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleResetToDemo = () => {
    setData(sampleSalesDataset);
    setDatasetName('sample_sales.csv');
    setIsCleaned(false);
    setCleaningLogs([]);
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    try {
      // 1. Run local agentic workflow
      const result = executeAgentWorkflow(data, text, datasetName);
      setActivePlan(result.plan);

      // 2. Try Gemini server-side proxy endpoint
      let serverGeminiInsight = '';
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: text,
            dataset: data.slice(0, 30),
            datasetName,
          }),
        });
        if (response.ok) {
          const jsonRes = await response.json();
          if (jsonRes.geminiInsight) {
            serverGeminiInsight = jsonRes.geminiInsight;
          }
        }
      } catch (err) {
        console.warn('API endpoint fallback to local deterministic insight:', err);
      }

      const finalContent = serverGeminiInsight
        ? `${result.answer}\n\n### 🧠 Gemini LLM Strategic Synthesis\n${serverGeminiInsight}`
        : result.answer;

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: finalContent,
        timestamp: new Date().toISOString(),
        steps: result.steps,
        chart: result.chart,
        insights: result.insights,
        recommendations: result.recommendations,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Analysis encounter notice: ${err.message || 'An error occurred during multi-agent execution.'}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setChatLoading(false);
      setActivePlan([]);
    }
  };

  const handleApplyCleaning = (options: {
    standardizeText: boolean;
    removeDuplicates: boolean;
    imputeMissing: boolean;
    clipOutliers: boolean;
  }) => {
    const { cleanedData, logs } = cleanDataset(data, options);
    setData(cleanedData);
    setCleaningLogs(logs);
    setIsCleaned(true);
  };

  const handleAskQuestionFromAnywhere = (q: string) => {
    setActiveTab('chat');
    handleSendMessage(q);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        datasetProfile={profile}
        datasetName={datasetName}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            datasetName={datasetName}
            data={data}
            setActiveTab={setActiveTab}
            onAskQuestion={handleAskQuestionFromAnywhere}
          />
        )}

        {activeTab === 'upload' && (
          <UploadView
            onDatasetLoaded={handleDatasetLoaded}
            onResetToDemo={handleResetToDemo}
            currentFilename={datasetName}
            totalRows={data.length}
          />
        )}

        {activeTab === 'chat' && (
          <ChatView
            messages={messages}
            onSendMessage={handleSendMessage}
            loading={chatLoading}
            activePlan={activePlan}
          />
        )}

        {activeTab === 'profile' && <ProfileView profile={profile} />}

        {activeTab === 'clean' && (
          <CleaningView
            data={data}
            profile={profile}
            onApplyCleaning={handleApplyCleaning}
            cleaningLogs={cleaningLogs}
            isCleaned={isCleaned}
          />
        )}

        {activeTab === 'visualize' && <VisualAnalyticsView data={data} profile={profile} />}

        {activeTab === 'anomalies' && <AnomalyView data={data} profile={profile} />}

        {activeTab === 'forecast' && <ForecastingView data={data} profile={profile} />}

        {activeTab === 'insights' && (
          <InsightsView
            profile={profile}
            data={data}
            onAskQuestion={handleAskQuestionFromAnywhere}
          />
        )}

        {activeTab === 'report' && (
          <ReportView profile={profile} data={data} datasetName={datasetName} />
        )}

        {activeTab === 'codebase' && <CodebaseView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-800">DataSense Agent</span> &bull; Production Agentic AI Platform
          </div>
          <div>
            Developed with excellence by <span className="font-semibold text-slate-800">Swapna V</span> (Agentic AI Engineer | IPEC Solutions)
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
