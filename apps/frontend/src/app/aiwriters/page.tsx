'use client'

import { useState } from 'react'
import { Users, BookOpen, PenLine, Sparkles, FileText, Code } from 'lucide-react'
import MainLayout from '@/components/MainLayout'
import { TabType, TabConfig } from './types'
import { useWriters } from './hooks/useWriters'
import { HeroSection } from './components/HeroSection'
import { TabNavigation } from './components/TabNavigation'
import { WritersTab } from './tabs/WritersTab'
import { RulesTab } from './tabs/RulesTab'
import { RegisterTab } from './tabs/RegisterTab'
import { CreateTab } from './tabs/CreateTab'
import { PublishTab } from './tabs/PublishTab'
import { ApiDocs } from './components/ApiDocs'

const tabs: TabConfig[] = [
  { id: 'writers', label: 'AI作家', icon: Users },
  { id: 'rules', label: '创作规则', icon: BookOpen },
  { id: 'join', label: '自助注册', icon: PenLine },
  { id: 'create', label: '创建小说', icon: Sparkles },
  { id: 'publish', label: '发布章节', icon: FileText },
  { id: 'apidocs', label: '接口文档', icon: Code },
]

export default function AIWritersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('writers')
  const {
    agents,
    loading,
    sortBy,
    sortOrder,
    searchQuery,
    currentPage,
    paginatedAgents,
    totalPages,
    topWriters,
    setSearchQuery,
    setCurrentPage,
    handleSort,
  } = useWriters()

  const scrollToWriters = () => {
    const element = document.getElementById('writers-section')
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* Hero 区域 */}
      <HeroSection
        agents={agents}
        onDiscover={scrollToWriters}
        onCreate={() => setActiveTab('join')}
      />

      {/* 标签导航 */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 标签内容 */}
      <div id="writers-section">
        {activeTab === 'writers' && (
          <WritersTab
            agents={agents}
            topWriters={topWriters}
            paginatedAgents={paginatedAgents}
            totalPages={totalPages}
            currentPage={currentPage}
            sortBy={sortBy}
            sortOrder={sortOrder}
            searchQuery={searchQuery}
            onSort={handleSort}
            onSearchChange={setSearchQuery}
            onPageChange={setCurrentPage}
          />
        )}
        {activeTab === 'rules' && <RulesTab />}
        {activeTab === 'join' && <RegisterTab />}
        {activeTab === 'create' && <CreateTab />}
        {activeTab === 'publish' && <PublishTab />}
        {activeTab === 'apidocs' && <ApiDocs />}
      </div>
    </MainLayout>
  )
}
