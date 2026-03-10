import { useMemo, useRef, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Divider,
  Select,
  SelectItem,
  Text,
  TextInput,
  Title,
} from '@tremor/react'
import {
  AlignLeft,
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Check,
  Clock,
  Copy,
  Database,
  Download,
  ExternalLink,
  FileEdit,
  FileText,
  FolderPlus,
  FolderOpen,
  GitCompare,
  HelpCircle,
  Home,
  Map,
  Paperclip,
  Plus,
  Search,
  Settings,
  Share2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Upload,
  X,
  Zap,
} from 'lucide-react'
import './App.css'

const PROPERTIES = [
  {
    id: 'londale',
    name: '25 Londale St',
    address: '25 Londale St, London EC1A 1BB',
    status: 'Leasehold · Commercial',
    expiry: '2087',
    footprint: 'L',
  },
  {
    id: 'greenlock',
    name: 'Greenlock House',
    address: 'Greenlock House, London EC2N 2DB',
    status: 'Freehold · Mixed Use',
    expiry: 'N/A',
    footprint: 'T',
  },
  {
    id: 'abc',
    name: 'ABC Portfolio',
    address: 'ABC Portfolio, London W1J 6BD',
    status: 'Portfolio · Multi-asset',
    expiry: 'Multiple',
    footprint: 'U',
  },
]

const SAMPLE_DOCS = [
  { name: 'Lease_25Londale.pdf', type: 'Lease', pages: 47 },
  { name: 'TitleRegister_25Londale.pdf', type: 'Title Register', pages: 12 },
]

const REQUIRED_DOCS = [
  { id: 'title-register', label: 'Title Register', required: true },
  { id: 'title-plan', label: 'Title Plan', required: true },
  { id: 'lease', label: 'Lease', required: true },
]

const BLUEPRINTS = [
  {
    name: 'Certificate of Title – Schedule 5',
    desc: 'Full title certificate with title guarantee analysis.',
    docs: ['Title Register', 'Title Plan', 'Lease'],
    eta: '~8 min',
  },
  {
    name: 'Lease Report – Standard',
    desc: 'Extract key commercial terms and risk flags from a lease.',
    docs: ['Lease'],
    eta: '~5 min',
  },
  {
    name: 'Title & Survey Review',
    desc: 'Review title commitments and cross-reference with survey.',
    docs: ['Title Register', 'Survey', 'Lease'],
    eta: '~12 min',
  },
  {
    name: 'Portfolio Summary',
    desc: 'Aggregate analysis across multiple properties.',
    docs: ['Multiple Title Registers'],
    eta: '~20 min',
  },
]

const QUICK_START = [
  {
    title: 'Report',
    text: 'Generate reports, highlight exceptions, verify compliance.',
    icon: FileText,
    accent: 'orange',
    action: 'blueprint',
  },
  { title: 'Research', text: 'Query on key real estate concepts.', icon: Search, accent: 'yellow' },
  {
    title: 'Compare',
    text: 'Compare two documents and summarize key differences.',
    icon: GitCompare,
    accent: 'red',
  },
  {
    title: 'Restore',
    text: 'Convert hard-to-read documents into editable Word files.',
    icon: FileEdit,
    accent: 'purple',
  },
  {
    title: 'Summarize',
    text: 'Condense documents or clauses into key points.',
    icon: AlignLeft,
    accent: 'teal',
  },
  {
    title: 'Property Visualizer',
    text: 'Access the map to view legal descriptions and overlay plans.',
    icon: Map,
    accent: 'green',
  },
]

const EXISTING_MESSAGES = [
  { id: 'session-pill', role: 'meta', label: 'Session resumed · 2h ago' },
  { id: 'user-1', role: 'user', text: 'What are the rent review provisions in the lease?' },
  {
    id: 'ai-1',
    role: 'assistant',
    sections: [
      {
        heading: 'Rent Review Provisions',
        bullets: [
          'Rent is reviewed every 5 years on an upward-only open market basis.',
          'The next scheduled review date is **15 March 2026**.',
          'The lease requires formal written notice to commence valuation steps.',
        ],
      },
    ],
    sources: [{ doc: 'Lease_25Londale.pdf', label: 'p.18, Clause 8.1', ref: 'clause-8-1' }],
    followUps: ['Draft rent review notice', 'What happens if notice is missed?', 'Show review history'],
  },
  { id: 'user-2', role: 'user', text: 'When is the next review date?' },
  {
    id: 'ai-2',
    role: 'assistant',
    text:
      'The next rent review date is **15 March 2026**, approximately 3 weeks from today. Notice must be served no later than **1 March 2026** to trigger the review.',
    sources: [{ doc: 'Lease_25Londale.pdf', label: 'p.19, Clause 8.3', ref: 'clause-8-3' }],
    followUps: ['Draft rent review notice', 'What happens if notice is missed?', 'Show review history'],
  },
]

const PROJECT_SESSIONS = [
  {
    id: 's1',
    title: 'Lease rent review analysis',
    time: '2h ago',
    preview: 'The next rent review date is 15 March 2026...',
  },
  {
    id: 's2',
    title: 'Title restrictions check',
    time: 'Yesterday',
    preview: '1 high risk flag: restrictive covenant at Entry 4...',
  },
  {
    id: 's3',
    title: 'Initial lease summary',
    time: 'Jan 28',
    preview: 'Key tenant obligations: repair, no assignment without...',
  },
]

const INITIAL_PROJECT_ISSUES = [
  {
    id: 'i1',
    severity: 'High',
    title: 'Restrictive covenant — residential use only',
    description: 'Entry 4 prohibits commercial use.',
    source: { doc: 'TitleRegister', label: 'Entry 4', ref: 'entry-4' },
    status: 'Open',
  },
  {
    id: 'i2',
    severity: 'High',
    title: 'Rent review notice deadline in 18 days',
    description: 'Notice must be served by 1 Mar 2026 or right is lost.',
    source: { doc: 'Lease', label: 'Clause 8.3', ref: 'clause-8-3' },
    status: 'Open',
  },
  {
    id: 'i3',
    severity: 'Medium',
    title: 'Overage clause — 20 year trigger',
    description: 'Seller retains 30% uplift on planning permission.',
    source: { doc: 'TitleRegister', label: 'Entry 7', ref: 'entry-4' },
    status: 'Open',
  },
  {
    id: 'i4',
    severity: 'Medium',
    title: 'Assignment restriction',
    description: 'Landlord consent required for any assignment or subletting.',
    source: { doc: 'Lease', label: 'Clause 5.1', ref: 'clause-8-1' },
    status: 'Open',
  },
  {
    id: 'i5',
    severity: 'Medium',
    title: 'Missing Title Plan',
    description: 'Title Plan not yet uploaded — boundary analysis incomplete.',
    source: null,
    status: 'Open',
  },
  {
    id: 'i6',
    severity: 'Low',
    title: 'Standard mortgage charge — NatWest',
    description: 'Expected to be released on completion.',
    source: { doc: 'TitleRegister', label: 'Entry 2', ref: 'entry-4' },
    status: 'Open',
  },
]

function App() {
  const captureParams = new URLSearchParams(window.location.search)
  const captureScreen = captureParams.get('screen')
  const capturePropertyId = captureParams.get('property') || 'londale'
  const initialProperty = PROPERTIES.find((p) => p.id === capturePropertyId) || PROPERTIES[0]
  const initialScreen = (() => {
    if (captureScreen === 'existing-conversation-right') return 'existing-conversation'
    if (captureScreen === 'blueprint-launch') return 'new-conversation'
    if (
      captureScreen === 'home' ||
      captureScreen === 'project-detail' ||
      captureScreen === 'new-conversation' ||
      captureScreen === 'existing-conversation' ||
      captureScreen === 'blueprint-drawer' ||
      captureScreen === 'standalone-chat'
    ) {
      return captureScreen
    }
    return 'home'
  })()
  const startsExistingThread =
    captureScreen === 'existing-conversation' || captureScreen === 'existing-conversation-right'
  const startsBlueprintLaunch = captureScreen === 'blueprint-launch'

  const [screen, setScreen] = useState(initialScreen)
  const [rightPanelOpen, setRightPanelOpen] = useState(captureScreen === 'existing-conversation-right')
  const [activeDocument, setActiveDocument] = useState(
    captureScreen === 'existing-conversation-right' ? 'Lease_25Londale.pdf' : null,
  )
  const [activeReference, setActiveReference] = useState('clause-4-2')
  const [blueprintActive, setBlueprintActive] = useState(startsBlueprintLaunch)
  const [blueprintName, setBlueprintName] = useState(
    startsBlueprintLaunch ? 'Certificate of Title – Schedule 5' : '',
  )
  const [documents, setDocuments] = useState(startsExistingThread ? SAMPLE_DOCS : [])
  const [messages, setMessages] = useState(startsExistingThread ? EXISTING_MESSAGES : [])
  const [inputValue, setInputValue] = useState('')
  const [checklist, setChecklist] = useState({})
  const [analyzing, setAnalyzing] = useState(false)
  const [portfolioView, setPortfolioView] = useState(false)
  const [activeProperty, setActiveProperty] = useState(initialProperty)
  const [projectIssues, setProjectIssues] = useState(INITIAL_PROJECT_ISSUES)
  const [issueFilter, setIssueFilter] = useState('All')
  const [workspaceAttachments, setWorkspaceAttachments] = useState([])
  const [standaloneMessages, setStandaloneMessages] = useState([])
  const [standaloneInput, setStandaloneInput] = useState('')
  const [standaloneAttachments, setStandaloneAttachments] = useState([])
  const [standaloneTitle, setStandaloneTitle] = useState('New conversation')
  const [standaloneBlueprintActive, setStandaloneBlueprintActive] = useState(false)
  const [standaloneChecklist, setStandaloneChecklist] = useState({})
  const [standaloneAnalyzing, setStandaloneAnalyzing] = useState(false)

  const composerRef = useRef(null)

  const inWorkspace = screen === 'new-conversation' || screen === 'existing-conversation'
  const inStandalone = screen === 'standalone-chat'
  const allRequiredChecked = useMemo(
    () => REQUIRED_DOCS.every((doc) => checklist[doc.id]),
    [checklist],
  )

  const goHome = () => {
    setScreen('home')
    setRightPanelOpen(false)
  }

  const openNewConversation = () => {
    setScreen('new-conversation')
    setMessages([])
    setRightPanelOpen(false)
    setActiveDocument(null)
    setInputValue('')
    if (!blueprintActive) setDocuments([])
  }

  const openStandaloneChat = (initialMessage = '') => {
    setScreen('standalone-chat')
    const seed = initialMessage.trim()
    setStandaloneTitle('New conversation')
    setStandaloneMessages([])
    setStandaloneAttachments([])
    setStandaloneInput('')
    setStandaloneBlueprintActive(false)
    setStandaloneChecklist({})
    setStandaloneAnalyzing(false)
    if (seed) {
      setTimeout(() => {
        sendStandalonePrompt(seed, [])
      }, 0)
    }
  }

  const openStandaloneChatWithUpload = (file) => {
    if (!file) return
    setScreen('standalone-chat')
    setStandaloneTitle('New conversation')
    setStandaloneMessages([])
    setStandaloneInput('')
    setStandaloneBlueprintActive(false)
    setStandaloneChecklist({})
    setStandaloneAnalyzing(false)
    setStandaloneAttachments([
      {
        id: `att-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      },
    ])
  }

  const openNewConversationWithPrompt = (prompt) => {
    setScreen('new-conversation')
    setMessages([])
    setRightPanelOpen(false)
    setActiveDocument(null)
    setInputValue(prompt)
    if (!blueprintActive) setDocuments([])
  }

  const openExistingConversation = () => {
    setScreen('existing-conversation')
    setBlueprintActive(false)
    setBlueprintName('')
    setDocuments(SAMPLE_DOCS)
    setMessages(EXISTING_MESSAGES)
    setRightPanelOpen(false)
    setInputValue('')
  }

  const openProjectDetail = () => {
    setScreen('project-detail')
    setRightPanelOpen(false)
  }

  const sendStandalonePrompt = (prompt, attachments = []) => {
    const trimmed = prompt.trim()
    if (!trimmed) return
    const userMsg = {
      id: `su-${Date.now()}`,
      role: 'user',
      text: trimmed,
      attachments,
    }
    const typingId = `st-${Date.now()}`
    setStandaloneMessages((prev) => [...prev, userMsg, { id: typingId, role: 'typing' }])

    setTimeout(() => {
      const response = getResponseForPrompt(trimmed, attachments.length > 0)
      setStandaloneMessages((prev) => [
        ...prev.filter((msg) => msg.id !== typingId),
        { id: `sa-${Date.now()}`, role: 'assistant', ...response },
      ])
    }, 1500)
  }

  const sendStandaloneInput = () => {
    const trimmed = standaloneInput.trim()
    if (!trimmed) return
    const currentAttachments = standaloneAttachments
    setStandaloneInput('')
    setStandaloneAttachments([])
    sendStandalonePrompt(trimmed, currentAttachments)
  }

  const toggleStandaloneChecklist = (id) =>
    setStandaloneChecklist((prev) => ({ ...prev, [id]: !prev[id] }))

  const allStandaloneRequiredChecked = useMemo(
    () => REQUIRED_DOCS.every((doc) => standaloneChecklist[doc.id]),
    [standaloneChecklist],
  )

  const simulateStandaloneRequiredDocs = () => {
    REQUIRED_DOCS.forEach((doc, idx) => {
      setTimeout(() => {
        setStandaloneChecklist((prev) => ({ ...prev, [doc.id]: true }))
      }, idx * 300)
    })
  }

  const runStandaloneReport = () => {
    setStandaloneAnalyzing(true)
    setTimeout(() => {
      setStandaloneAnalyzing(false)
      setStandaloneMessages((prev) => [
        ...prev,
        {
          id: `sa-report-${Date.now()}`,
          role: 'assistant',
          sections: [
            {
              heading: 'Lease Report Summary',
              bullets: [
                'Commercial lease detected with 125-year term from 15 March 1987.',
                'Ground rent set at **£250 per annum** with review mechanism in Schedule 3.',
                'Assignment and repair covenants require landlord-consent checks before disposal.',
              ],
            },
          ],
          sources: [{ doc: 'Lease_Excerpt.pdf', label: 'Detected clauses', ref: 'clause-4-2' }],
          followUps: ['Summarize tenant obligations', 'Are there unusual clauses?', 'Draft a report cover note'],
        },
      ])
    }, 2500)
  }

  const openBlueprintDrawer = () => setScreen('blueprint-drawer')

  const selectBlueprint = (name) => {
    setBlueprintActive(true)
    setBlueprintName(name)
    setChecklist({})
    setMessages([])
    setDocuments([])
    setInputValue('')
    setRightPanelOpen(false)
    setScreen('new-conversation')
  }

  const activateBlueprint = (name) => {
    setBlueprintActive(true)
    setBlueprintName(name)
    setScreen('new-conversation')
  }

  const addSampleDocs = () => setDocuments(SAMPLE_DOCS)

  const toggleChecklist = (id) => setChecklist((prev) => ({ ...prev, [id]: !prev[id] }))

  const simulateRequiredDocs = () => {
    setDocuments((prev) => {
      const map = new Map(prev.map((d) => [d.name, d]))
      map.set('TitleRegister_25Londale.pdf', { name: 'TitleRegister_25Londale.pdf', type: 'Title Register', pages: 12 })
      map.set('TitlePlan_25Londale.pdf', { name: 'TitlePlan_25Londale.pdf', type: 'Title Plan', pages: 6 })
      map.set('Lease_25Londale.pdf', { name: 'Lease_25Londale.pdf', type: 'Lease', pages: 47 })
      return [...map.values()]
    })

    REQUIRED_DOCS.forEach((doc, idx) => {
      setTimeout(() => {
        setChecklist((prev) => ({ ...prev, [doc.id]: true }))
      }, idx * 300)
    })
  }

  const focusComposer = () => {
    const input = composerRef.current?.querySelector('input')
    input?.focus()
  }

  const openCitation = (source) => {
    setRightPanelOpen(true)
    setActiveDocument(source.doc)
    setActiveReference(source.ref)
  }

  const appendPromptAndRespond = (prompt, attachments = []) => {
    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: prompt }
    const typingId = `t-${Date.now()}`
    const enhancedUserMsg = { ...userMsg, attachments }
    setMessages((prev) => [...prev, enhancedUserMsg, { id: typingId, role: 'typing' }])

    setTimeout(() => {
      const response = getResponseForPrompt(prompt, attachments.length > 0)
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== typingId),
        { id: `a-${Date.now()}`, role: 'assistant', ...response },
      ])
    }, 1500)
  }

  const sendInput = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    const currentAttachments = workspaceAttachments
    setInputValue('')
    setWorkspaceAttachments([])
    appendPromptAndRespond(trimmed, currentAttachments)
  }

  const runReport = () => {
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      setMessages((prev) => [
        ...prev,
        {
          id: `report-${Date.now()}`,
          role: 'assistant',
          sections: [
            {
              heading: 'Title Summary',
              bullets: [
                'Leasehold title reviewed against submitted register, plan and lease.',
                'Term expires in **2087** with no break rights identified.',
                'Use covenant requires review against intended commercial operation.',
              ],
            },
          ],
          issueList: [
            {
              id: 'risk-1',
              severity: 'High',
              title: 'Restrictive covenant — residential use only',
              description:
                'Entry 4 prohibits commercial use. Conflicts with proposed development.',
              source: { doc: 'TitleRegister_25Londale.pdf', label: 'Entry 4', ref: 'entry-4' },
            },
          ],
          sources: [
            { doc: 'TitleRegister_25Londale.pdf', label: 'Entry 4, Charges Register', ref: 'entry-4' },
            { doc: 'Lease_25Londale.pdf', label: 'p.12, Clause 4.2', ref: 'clause-4-2' },
          ],
          followUps: ['Draft a title objection letter', 'Check all entries for similar covenants'],
        },
      ])
    }, 2500)
  }

  return (
    <div className="orbital-root dark">
      <div className="app-shell">
        <Sidebar
          screen={screen}
          onHome={goHome}
          onWorkspace={openNewConversation}
          onBlueprint={openBlueprintDrawer}
        />

        <div className="main-column">
          {(screen === 'home' || screen === 'blueprint-drawer') && (
            <HomeScreen
              disabled={screen === 'blueprint-drawer'}
              onUploadDocs={openStandaloneChatWithUpload}
              onHeroSubmit={openStandaloneChat}
              onProject={openProjectDetail}
              onBlueprint={openBlueprintDrawer}
              inputValue={inputValue}
              setInputValue={setInputValue}
            />
          )}

          {screen === 'project-detail' && (
            <ProjectDetail
              activeProperty={activeProperty}
              issues={projectIssues}
              issueFilter={issueFilter}
              setIssueFilter={setIssueFilter}
              onResolveIssue={(id) => {
                setProjectIssues((prev) =>
                  prev.map((issue) =>
                    issue.id === id ? { ...issue, status: 'Resolved' } : issue,
                  ),
                )
              }}
              onOpenInCopilot={openNewConversation}
              onOpenExisting={openExistingConversation}
              onOpenCitation={openCitation}
              onAskCopilot={(issueTitle) => openNewConversationWithPrompt(issueTitle)}
            />
          )}

          {inWorkspace && (
            <Workspace
              screen={screen}
              activeProperty={activeProperty}
              setActiveProperty={setActiveProperty}
              portfolioView={portfolioView}
              setPortfolioView={setPortfolioView}
              rightPanelOpen={rightPanelOpen}
              setRightPanelOpen={setRightPanelOpen}
              activeDocument={activeDocument}
              activeReference={activeReference}
              blueprintActive={blueprintActive}
              blueprintName={blueprintName}
              documents={documents}
              setDocuments={setDocuments}
              messages={messages}
              inputValue={inputValue}
              setInputValue={setInputValue}
              attachments={workspaceAttachments}
              setAttachments={setWorkspaceAttachments}
              sendInput={sendInput}
              onPrompt={appendPromptAndRespond}
              onOpenCitation={openCitation}
              goHome={goHome}
              addSampleDocs={addSampleDocs}
              checklist={checklist}
              toggleChecklist={toggleChecklist}
              simulateRequiredDocs={simulateRequiredDocs}
              allRequiredChecked={allRequiredChecked}
              analyzing={analyzing}
              runReport={runReport}
              focusComposer={focusComposer}
              composerRef={composerRef}
              onNewConversation={openNewConversation}
              onActivateBlueprint={activateBlueprint}
            />
          )}

          {inStandalone && (
            <StandaloneChat
              title={standaloneTitle}
              setTitle={setStandaloneTitle}
              messages={standaloneMessages}
              inputValue={standaloneInput}
              setInputValue={setStandaloneInput}
              attachments={standaloneAttachments}
              setAttachments={setStandaloneAttachments}
              sendInput={sendStandaloneInput}
              onPrompt={(prompt) => sendStandalonePrompt(prompt)}
              onOpenCitation={openCitation}
              standaloneBlueprintActive={standaloneBlueprintActive}
              setStandaloneBlueprintActive={setStandaloneBlueprintActive}
              standaloneChecklist={standaloneChecklist}
              toggleStandaloneChecklist={toggleStandaloneChecklist}
              simulateStandaloneRequiredDocs={simulateStandaloneRequiredDocs}
              allStandaloneRequiredChecked={allStandaloneRequiredChecked}
              standaloneAnalyzing={standaloneAnalyzing}
              runStandaloneReport={runStandaloneReport}
              onBrowseBlueprints={() => setScreen('blueprint-drawer')}
              rightPanelOpen={rightPanelOpen}
              setRightPanelOpen={setRightPanelOpen}
              activeDocument={activeDocument}
              activeReference={activeReference}
              onViewProject={() => setScreen('project-detail')}
              onAttachToProject={(projectName) => {
                const target = PROPERTIES.find((p) => p.name === projectName) || PROPERTIES[0]
                setActiveProperty(target)
                setMessages(standaloneMessages.filter((m) => m.role !== 'typing'))
                if (standaloneAttachments.length) {
                  setDocuments(
                    standaloneAttachments.map((a, idx) => ({
                      name: a.name,
                      type: idx === 0 ? 'Uploaded' : 'Attachment',
                      pages: 1,
                    })),
                  )
                }
                setScreen('new-conversation')
              }}
            />
          )}
        </div>
      </div>

      {screen === 'blueprint-drawer' && (
        <BlueprintDrawer onClose={goHome} onSelectBlueprint={selectBlueprint} />
      )}
    </div>
  )
}

function Sidebar({ screen, onHome, onWorkspace, onBlueprint }) {
  const top = [
    { key: 'home', icon: Home, action: onHome, active: screen === 'home' || screen === 'blueprint-drawer' },
    { key: 'workspace', icon: FolderOpen, action: onWorkspace, active: screen === 'new-conversation' || screen === 'existing-conversation' || screen === 'project-detail' },
    { key: 'blueprints', icon: BookOpen, action: onBlueprint, active: false },
    { key: 'resources', icon: Database, active: false },
  ]

  const bottom = [Settings, Clock, HelpCircle]

  return (
    <aside className="icon-sidebar">
      <div className="sidebar-top">
        {top.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.key}
              type="button"
              title={item.key}
              onClick={item.action}
              className={`icon-nav-btn ${item.active ? 'active' : ''}`}
            >
              <Icon size={17} />
            </button>
          )
        })}
      </div>

      <div className="sidebar-bottom">
        {bottom.map((Icon, idx) => (
          <button key={idx} type="button" className="icon-nav-btn" title="utility">
            <Icon size={16} />
          </button>
        ))}
        <div className="avatar-mini">TR</div>
      </div>
    </aside>
  )
}

function HomeScreen({
  disabled,
  onUploadDocs,
  onHeroSubmit,
  onProject,
  onBlueprint,
  inputValue,
  setInputValue,
}) {
  const fileInputRef = useRef(null)

  const triggerFilePick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`home-screen ${disabled ? 'disabled' : ''}`}>
      <header className="top-navbar">
        <div className="brand-wrap">
          <div className="cube-mark" />
          <span>Orbital</span>
        </div>
        <div className="avatar-mini">TR</div>
      </header>

      <main className="home-content">
        <Card className="hero-card tremor-surface">
          <Title className="hero-title">Good morning, Tommy</Title>
          <Text className="hero-subtitle">What would you like to work on today?</Text>
          <div className="hero-input-row">
            <TextInput
              className="hero-input"
              placeholder="Ask a property law question, or upload documents..."
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onHeroSubmit(inputValue)
              }}
            />
            <button
              type="button"
              className="hero-send"
              onClick={() => onHeroSubmit(inputValue)}
              aria-label="Send"
            >
              <span>Ask AI</span>
              <ArrowUp size={13} />
            </button>
          </div>
          <div className="hero-actions">
            <Button variant="secondary" icon={Paperclip} className="btn-secondary" onClick={triggerFilePick}>Upload Documents</Button>
            <Button variant="secondary" icon={BookOpen} className="btn-secondary" onClick={onBlueprint}>Select a Blueprint</Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden-file-input"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onUploadDocs(file)
              e.target.value = ''
            }}
          />
        </Card>

        <section className="home-section">
          <div className="section-head">
            <Title>Recent Projects</Title>
            <button type="button" className="see-link">See all →</button>
          </div>
          <div className="recent-grid">
            <ProjectCard name="ABC" color="slate" onProject={onProject} />
            <ProjectCard name="Greenlock" color="emerald" onProject={onProject} />
            <ProjectCard name="25 Londale St" color="blue" onProject={onProject} />
            <Card className="create-project tremor-surface"><Plus size={18} /><Text>Create a new project</Text></Card>
          </div>
        </section>

        <section className="home-section">
          <div className="section-head"><Title>Quick Start</Title></div>
          <div className="quick-grid-home">
            <Card className="featured-card tremor-surface">
              <BookOpen size={28} />
              <Title>Review Title &amp; Survey</Title>
              <Text>
                Report on commitments, analyze exceptions, visualize on survey, prepare issues list,
                and draft title memo with objection letter.
              </Text>
              <Button className="btn-primary start-btn" icon={ArrowRight}>Start</Button>
            </Card>
            {QUICK_START.map((item) => {
              const Icon = item.icon
              return (
                <Card
                  key={item.title}
                  className={`quick-card-home tremor-surface accent-${item.accent}`}
                  onClick={item.action === 'blueprint' ? onBlueprint : undefined}
                >
                  <div className="quick-title-row"><Icon size={14} /><Title>{item.title}</Title></div>
                  <Text>{item.text}</Text>
                </Card>
              )
            })}
          </div>
        </section>

      </main>
    </div>
  )
}

function ProjectCard({ name, color, onProject }) {
  return (
    <Card className="project-card-home tremor-surface" onClick={onProject}>
      <div className={`project-banner ${color}`} />
      <div className="project-body-home">
        <Title>{name}</Title>
        <button type="button" className="project-sub-link" onClick={onProject}>
          ↩ Lease rent review analysis · 2h ago
        </button>
        <div className="project-foot">
          <div className="project-date"><Clock size={11} /><Text>Jan 28</Text></div>
          <div className="avatar-dot">TR</div>
        </div>
      </div>
    </Card>
  )
}

function ProjectDetail({
  activeProperty,
  issues,
  issueFilter,
  setIssueFilter,
  onResolveIssue,
  onOpenInCopilot,
  onOpenExisting,
  onOpenCitation,
  onAskCopilot,
}) {
  const issuesRef = useRef(null)
  const openCount = issues.filter((i) => i.status !== 'Resolved').length

  const filteredIssues = issues.filter((issue) => {
    if (issueFilter === 'All') return true
    if (issueFilter === 'Resolved') return issue.status === 'Resolved'
    return issue.severity === issueFilter && issue.status !== 'Resolved'
  })

  const scrollToIssues = () => {
    issuesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="project-page">
      <header className="top-navbar">
        <div className="brand-wrap">
          <div className="cube-mark" />
          <span>Orbital</span>
        </div>
        <div className="avatar-mini">TR</div>
      </header>

      <main className="project-content">
        <div className="project-header">
          <div>
            <Title className="project-title">{activeProperty.name}</Title>
            <Text className="project-meta-line">
              Leasehold · Commercial · Client: Blackstone LLP · Assigned to:
              <span className="assign-pill">
                <span className="avatar-dot">TR</span>
                Tommy R
              </span>
            </Text>
          </div>
          <div className="project-header-actions">
            <Badge color="green">Active</Badge>
            <Button className="btn-primary" onClick={onOpenInCopilot}>Open in Copilot</Button>
          </div>
        </div>

        <section className="status-grid">
          <Card className="tremor-surface status-card">
            <Title>Risk Summary</Title>
            <button type="button" className="risk-row-btn btn-ghost-inline" onClick={scrollToIssues}>
              <Badge color="red">2 High</Badge>
            </button>
            <button type="button" className="risk-row-btn btn-ghost-inline" onClick={scrollToIssues}>
              <Badge color="amber">3 Medium</Badge>
            </button>
            <button type="button" className="risk-row-btn btn-ghost-inline" onClick={scrollToIssues}>
              <Badge color="green">1 Low</Badge>
            </button>
          </Card>

          <Card className="tremor-surface status-card">
            <Title>Key Dates</Title>
            <div className="date-row urgent">
              <AlertTriangle size={13} />
              <span>Rent review notice due</span>
              <strong>18 Mar 2026</strong>
            </div>
            <div className="date-row">
              <Clock size={13} />
              <span>Lease expiry</span>
              <strong>2087</strong>
            </div>
            <div className="date-row">
              <Clock size={13} />
              <span>Next inspection</span>
              <strong>Jun 2026</strong>
            </div>
          </Card>

          <Card className="tremor-surface status-card">
            <Title>Documents</Title>
            <Text>4 of 5 uploaded</Text>
            <div className="doc-progress">
              <div style={{ width: '80%' }} />
            </div>
            <div className="missing-row">
              <Badge color="amber">Missing: Title Plan</Badge>
              <Button variant="secondary" size="xs" className="btn-secondary">+ Upload</Button>
            </div>
          </Card>
        </section>

        <section className="project-two-col">
          <Card className="tremor-surface sessions-card">
            <div className="section-head">
              <Title>Copilot Sessions</Title>
            </div>
            <Button className="btn-primary new-session-btn" onClick={onOpenInCopilot}>New Conversation</Button>
            <div className="session-list">
              {PROJECT_SESSIONS.map((s) => (
                <Card key={s.id} className="tremor-surface session-item" onClick={onOpenExisting}>
                  <Title>{s.title}</Title>
                  <Text>{s.time} · {s.preview}</Text>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="tremor-surface docs-card">
            <div className="section-head"><Title>Documents</Title></div>
            <DocGroup title="Lease">
              <DocRow file="Lease_25Londale.pdf" pages="47pp" badge={<Badge color="green">Analysed</Badge>} />
            </DocGroup>
            <DocGroup title="Title">
              <DocRow file="TitleRegister_25Londale.pdf" pages="12pp" badge={<Badge color="green">Analysed</Badge>} />
              <DocRow file="TitlePlan_25Londale.pdf" pages="" badge={<Badge color="amber">Missing</Badge>} />
            </DocGroup>
            <DocGroup title="Survey">
              <DocRow file="Survey_25Londale.pdf" pages="23pp" badge={<Badge color="gray">Not analysed</Badge>} />
            </DocGroup>
          </Card>
        </section>

        <section className="issues-section" ref={issuesRef}>
          <div className="issues-head">
            <div className="issues-title-row">
              <Title>Issues</Title>
              <Badge color="gray">{openCount} open</Badge>
            </div>
            <Button variant="secondary" size="xs" className="btn-secondary">+ Add issue</Button>
          </div>

          <div className="issue-filters">
            {['All', 'High', 'Medium', 'Low', 'Resolved'].map((f) => (
              <button
                key={f}
                type="button"
                className={`view-pill btn-chip ${issueFilter === f ? 'active' : ''}`}
                onClick={() => setIssueFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="issue-list">
            {filteredIssues.map((issue) => {
              const resolved = issue.status === 'Resolved'
              return (
                <Card key={issue.id} className={`tremor-surface issue-row project-issue ${resolved ? 'reviewed' : ''}`}>
                  <div className="issue-main">
                    <div className="issue-title-row">
                      <Badge color={resolved ? 'gray' : issue.severity === 'High' ? 'red' : issue.severity === 'Medium' ? 'amber' : 'green'}>
                        {resolved ? 'Resolved' : issue.severity}
                      </Badge>
                      <Title>{issue.title}</Title>
                    </div>
                    <Text>{issue.description}</Text>
                    {issue.source ? (
                      <Badge color="blue" className="source-chip" onClick={() => onOpenCitation(issue.source)}>
                        📄 {issue.source.doc} · {issue.source.label}
                      </Badge>
                    ) : (
                      <Text className="context-muted">No source</Text>
                    )}
                  </div>
                  <div className="issue-actions">
                    <Badge color={resolved ? 'gray' : 'blue'}>{issue.status}</Badge>
                    <Button variant="secondary" size="xs" className="btn-secondary" onClick={() => onAskCopilot(issue.title)}>
                      Ask Copilot
                    </Button>
                    <Button variant="secondary" size="xs" className="btn-ghost" onClick={() => onResolveIssue(issue.id)}>
                      Mark resolved
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}

function DocGroup({ title, children }) {
  return (
    <div className="doc-group">
      <Text className="doc-group-title">{title}</Text>
      {children}
    </div>
  )
}

function DocRow({ file, pages, badge }) {
  return (
    <div className="doc-line">
      <div className="doc-line-left">
        <FileText size={13} />
        <span>{file}</span>
        {pages ? <span className="doc-pages">{pages}</span> : null}
      </div>
      {badge}
    </div>
  )
}

function StandaloneChat({
  title,
  setTitle,
  messages,
  inputValue,
  setInputValue,
  attachments,
  setAttachments,
  sendInput,
  onPrompt,
  onOpenCitation,
  standaloneBlueprintActive,
  setStandaloneBlueprintActive,
  standaloneChecklist,
  toggleStandaloneChecklist,
  simulateStandaloneRequiredDocs,
  allStandaloneRequiredChecked,
  standaloneAnalyzing,
  runStandaloneReport,
  onBrowseBlueprints,
  rightPanelOpen,
  setRightPanelOpen,
  activeDocument,
  activeReference,
  onViewProject,
  onAttachToProject,
}) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const hasMessages = messages.some((m) => m.role === 'user' || m.role === 'assistant')
  const standaloneUploadRef = useRef(null)

  const triggerStandaloneUpload = () => standaloneUploadRef.current?.click()

  return (
    <div className={`standalone-grid ${rightPanelOpen ? 'right-open' : ''}`}>
      <section className="standalone-col">
        <div className="conversation-topbar">
          <div className="standalone-title-wrap">
            {editingTitle ? (
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditingTitle(false)
                }}
                autoFocus
                className="standalone-title-input"
              />
            ) : (
              <button type="button" className="standalone-title" onClick={() => setEditingTitle(true)}>
                {title}
              </button>
            )}
          </div>
          <div className="toolbar-actions">
            <button type="button"><Share2 size={14} /></button>
            <button type="button"><Download size={14} /></button>
          </div>
        </div>

        <div className="thread-scroll standalone-thread">
          {!hasMessages && (
            <div className="empty-state standalone-empty">
              <div className="cube-large" />
              <Title>What would you like to know?</Title>
              <Text>Ask any property law question, or upload documents to get started.</Text>
              <div className="prompt-chips">
                {[
                  'What is the difference between Freehold and Leasehold?',
                  "What does 'good and substantial repair' mean in a lease?",
                  'Explain what an overage clause is',
                  'What is a restrictive covenant?',
                ].map((prompt) => (
                  <Badge key={prompt} color="gray" className="prompt-chip" onClick={() => onPrompt(prompt)}>
                    {prompt}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBlock
              key={msg.id}
              msg={msg}
              onOpenCitation={onOpenCitation}
              onPrompt={onPrompt}
              onRunLeaseReport={() => setStandaloneBlueprintActive(true)}
              onBrowseBlueprints={onBrowseBlueprints}
              onViewProject={onViewProject}
            />
          ))}

          {standaloneBlueprintActive && (
            <BlueprintLaunch
              blueprintName="Lease Report – Standard"
              checklist={standaloneChecklist}
              toggleChecklist={toggleStandaloneChecklist}
              simulateRequiredDocs={simulateStandaloneRequiredDocs}
              allRequiredChecked={allStandaloneRequiredChecked}
              analyzing={standaloneAnalyzing}
              runReport={runStandaloneReport}
            />
          )}
        </div>

        {hasMessages && (
          <div className="attach-project-bar">
            <div className="attach-project-left">
              <FolderPlus size={12} />
              <Text>Save this conversation to a project</Text>
            </div>
            <div className="attach-project-right">
              <Button variant="secondary" size="xs" className="btn-secondary" onClick={() => setShowAttachMenu((v) => !v)}>
                Attach to project
              </Button>
              {showAttachMenu && (
                <Card className="tremor-surface attach-menu">
                  {[...PROPERTIES.map((p) => p.name), 'Create new project'].map((label) => (
                    <button
                      key={label}
                      type="button"
                      className="attach-menu-item"
                      onClick={() => onAttachToProject(label === 'Create new project' ? '25 Londale St' : label)}
                    >
                      {label}
                    </button>
                  ))}
                </Card>
              )}
            </div>
          </div>
        )}

        <div className="composer-wrap standalone-composer">
          {attachments.length > 0 && (
            <div className="inline-attachment-strip">
              {attachments.map((att) => (
                <span key={att.id} className="attachment-chip">
                  <FileText size={11} />
                  {att.name} · {att.size}
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="composer-input-wrap standalone-input-wrap">
            <button type="button" className="composer-left" onClick={triggerStandaloneUpload}><Paperclip size={14} /></button>
            <TextInput
              placeholder={
                attachments.length > 0
                  ? `Ask a question about ${attachments[0].name}...`
                  : 'Ask a property law question...'
              }
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendInput()
                }
              }}
              className="composer-input"
            />
            <button type="button" className="composer-send" onClick={sendInput}>
              <span>Ask AI</span>
              <ArrowUp size={13} />
            </button>
          </div>
          <Text className="composer-hint">Upload documents to ask questions about a specific property</Text>
          <input
            ref={standaloneUploadRef}
            type="file"
            className="hidden-file-input"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setAttachments((prev) => [
                  ...prev,
                  {
                    id: `att-${Date.now()}`,
                    name: file.name,
                    size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                  },
                ])
              }
              e.target.value = ''
            }}
          />
        </div>
      </section>

      {rightPanelOpen && (
        <aside className="doc-panel">
          <div className="doc-panel-head">
            <div className="doc-panel-title"><FileText size={14} /><span>{activeDocument || 'Lease_Excerpt.pdf'}</span></div>
            <div className="doc-panel-actions">
              <button type="button"><ExternalLink size={14} /></button>
              <button type="button" onClick={() => setRightPanelOpen(false)}><X size={14} /></button>
            </div>
          </div>
          <div className="doc-panel-body">
            <DocumentFaux activeDocument={activeDocument} activeReference={activeReference} />
          </div>
          <div className="doc-panel-foot"><Button variant="secondary" size="xs" className="btn-ghost">Open full document</Button></div>
        </aside>
      )}
    </div>
  )
}

function Workspace({
  screen,
  activeProperty,
  setActiveProperty,
  portfolioView,
  setPortfolioView,
  rightPanelOpen,
  setRightPanelOpen,
  activeDocument,
  activeReference,
  blueprintActive,
  blueprintName,
  documents,
  setDocuments,
  messages,
  inputValue,
  setInputValue,
  attachments,
  setAttachments,
  sendInput,
  onPrompt,
  onOpenCitation,
  goHome,
  addSampleDocs,
  checklist,
  toggleChecklist,
  simulateRequiredDocs,
  allRequiredChecked,
  analyzing,
  runReport,
  focusComposer,
  composerRef,
  onNewConversation,
  onActivateBlueprint,
}) {
  const title = screen === 'existing-conversation' ? 'Lease rent review analysis' : 'New conversation'
  const fileInputRef = useRef(null)

  const triggerWorkspaceUpload = () => {
    fileInputRef.current?.click()
  }

  const handleWorkspaceFile = (file) => {
    if (!file) return
    setAttachments((prev) => [
      ...prev,
      {
        id: `att-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      },
    ])
    setDocuments((prev) => [
      ...prev,
      {
        name: file.name,
        type: 'Uploaded',
        pages: 1,
      },
    ])
  }

  return (
    <div className={`workspace-grid ${rightPanelOpen ? 'right-open' : ''}`}>
      <aside className="context-panel">
        <div className="context-sticky">
          <Select value={activeProperty.name} onValueChange={(value) => {
            const found = PROPERTIES.find((p) => p.name === value)
            if (found) setActiveProperty(found)
          }}>
            {PROPERTIES.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
          </Select>
          <Text className="context-sub">{activeProperty.address}</Text>

          <div className="view-toggle">
            <button
              type="button"
              className={`view-pill ${!portfolioView ? 'active' : ''}`}
              onClick={() => setPortfolioView(false)}
            >Single Property</button>
            <button
              type="button"
              className={`view-pill ${portfolioView ? 'active' : ''}`}
              onClick={() => setPortfolioView(true)}
            >Portfolio View</button>
          </div>

          {portfolioView && (
            <Card className="portfolio-map tremor-surface">
              <div className="map-grid footprint-grid">
                <svg viewBox="0 0 100 70" className="footprint-svg" aria-label={`${activeProperty.name} footprint`}>
                  {activeProperty.footprint === 'L' && (
                    <path d="M14 12h22v34h50v12H14z" className="fp-shape" />
                  )}
                  {activeProperty.footprint === 'T' && (
                    <path d="M10 12h80v14H56v34H44V26H10z" className="fp-shape" />
                  )}
                  {activeProperty.footprint === 'U' && (
                    <path d="M14 12h18v34h36V12h18v46H14z" className="fp-shape" />
                  )}
                </svg>
              </div>
              <Text className="map-legend">{activeProperty.name} · footprint view</Text>
            </Card>
          )}

          <SectionHeader
            label="Documents"
            action={<Button size="xs" variant="secondary" className="btn-secondary" onClick={triggerWorkspaceUpload}>+ Upload</Button>}
          />

          {documents.length === 0 ? (
            <div className="empty-upload-zone"><Upload size={14} /><span>Drop files here</span></div>
          ) : (
            <div className="doc-list">
              {documents.map((doc) => (
                <Card key={doc.name} className="doc-item tremor-surface">
                  <div className="doc-row-top">
                    <div className="doc-name-wrap"><FileText size={12} /><span>{doc.name}</span></div>
                    <button
                      type="button"
                      className="doc-remove"
                      onClick={() => setDocuments((prev) => prev.filter((d) => d.name !== doc.name))}
                    ><X size={12} /></button>
                  </div>
                  <Text>{doc.type} · {doc.pages} pages</Text>
                </Card>
              ))}
            </div>
          )}

          <Button variant="secondary" size="xs" className="btn-ghost ghost-mini" onClick={addSampleDocs}>＋ Add sample docs</Button>

          {documents.length > 0 && (
            <Card className="workflow-card tremor-surface">
              <div className="workflow-head"><Sparkles size={12} /><span>Copilot suggests</span></div>
              <Text>
                I&apos;ve detected a Lease and a Title Register. Recommended next steps:
              </Text>
              <div className="workflow-actions">
                <Button size="xs" variant="secondary" className="btn-secondary" icon={FileText} onClick={() => {
                  onActivateBlueprint('Lease Report – Standard')
                }}>
                  Run Lease Report – Standard
                </Button>
                <Button size="xs" variant="secondary" className="btn-secondary" icon={AlertTriangle} onClick={() => {
                  const q = 'Any title restrictions?'
                  setInputValue(q)
                  onPrompt(q)
                  setInputValue('')
                }}>
                  Check for title restrictions
                </Button>
                <Button size="xs" variant="secondary" className="btn-secondary" icon={Search} onClick={focusComposer}>
                  Ask a specific question
                </Button>
              </div>
            </Card>
          )}

          <SectionHeader label="Property" />
          <div className="property-list">
            <Text>📍 {activeProperty.address}</Text>
            <Text>🏠 {activeProperty.status}</Text>
            <Text>📅 Lease expires: {activeProperty.expiry}</Text>
          </div>
        </div>
      </aside>

      <section className="conversation-col">
        <div className="conversation-topbar">
          <div className="crumbs">
            <button type="button" onClick={goHome}>Home</button><span>/</span>
            <button type="button">{activeProperty.name}</button><span>/</span><span>{title}</span>
          </div>
          <div className="toolbar-actions">
            <Button variant="secondary" size="xs" icon={Plus} className="btn-secondary new-chat-btn" onClick={onNewConversation}>
              New Conversation
            </Button>
            <button type="button"><Share2 size={14} /></button>
            <button type="button"><Download size={14} /></button>
          </div>
        </div>

        <div className="thread-scroll">
          {screen === 'new-conversation' && messages.length === 0 && !blueprintActive && (
            <EmptyState onPrompt={onPrompt} setInputValue={setInputValue} activePropertyName={activeProperty.name} />
          )}

          {screen === 'new-conversation' && messages.length === 0 && blueprintActive && (
            <BlueprintLaunch
              blueprintName={blueprintName}
              checklist={checklist}
              toggleChecklist={toggleChecklist}
              simulateRequiredDocs={simulateRequiredDocs}
              allRequiredChecked={allRequiredChecked}
              analyzing={analyzing}
              runReport={runReport}
            />
          )}

          {messages.map((msg) => (
            <MessageBlock key={msg.id} msg={msg} onOpenCitation={onOpenCitation} onPrompt={onPrompt} />
          ))}
        </div>

        <div className="composer-wrap">
          {attachments.length > 0 && (
            <div className="attachment-row">
              {attachments.map((att) => (
                <span key={att.id} className="attachment-chip">
                  {att.name} · {att.size}
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="composer-input-wrap" ref={composerRef}>
            <button type="button" className="composer-left" onClick={triggerWorkspaceUpload}><Paperclip size={14} /></button>
            <TextInput
              placeholder="Ask a question, or / for blueprints..."
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendInput()
                }
              }}
              className="composer-input"
            />
            <button type="button" className="composer-send" onClick={sendInput}>
              <span>Ask AI</span>
              <ArrowUp size={13} />
            </button>
          </div>
          <Text className="composer-hint">@ reference a document · / use a blueprint · Shift+Enter new line</Text>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden-file-input"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleWorkspaceFile(file)
              e.target.value = ''
            }}
          />
        </div>
      </section>

      {rightPanelOpen && (
        <aside className="doc-panel">
          <div className="doc-panel-head">
            <div className="doc-panel-title"><FileText size={14} /><span>{activeDocument || 'Lease_25Londale.pdf'}</span></div>
            <div className="doc-panel-actions">
              <button type="button"><ExternalLink size={14} /></button>
              <button type="button" onClick={() => setRightPanelOpen(false)}><X size={14} /></button>
            </div>
          </div>
          <div className="doc-panel-body">
            <DocumentFaux activeDocument={activeDocument} activeReference={activeReference} />
          </div>
          <div className="doc-panel-foot"><Button variant="secondary" size="xs" className="btn-ghost">Open full document</Button></div>
        </aside>
      )}
    </div>
  )
}

function EmptyState({ onPrompt, setInputValue, activePropertyName }) {
  const prompts = [
    'What is the current ground rent?',
    'Summarize key lease obligations',
    'Any title restrictions I should know?',
    'Compare rent review provisions',
  ]

  return (
    <div className="empty-state">
      <div className="cube-large" />
      <Title>How can I help with {activePropertyName}?</Title>
      <div className="prompt-chips">
        {prompts.map((prompt) => (
          <Badge
            key={prompt}
            color="gray"
            className="prompt-chip"
            onClick={() => {
              setInputValue(prompt)
              onPrompt(prompt)
              setInputValue('')
            }}
          >
            {prompt}
          </Badge>
        ))}
      </div>
    </div>
  )
}

function BlueprintLaunch({
  blueprintName,
  checklist,
  toggleChecklist,
  simulateRequiredDocs,
  allRequiredChecked,
  analyzing,
  runReport,
}) {
  if (analyzing) {
    return (
      <Card className="progress-card tremor-surface">
        <div className="dot pulse" />
        <Title>Analyzing documents...</Title>
        <Text>Step 2 of 5: Reviewing title register</Text>
      </Card>
    )
  }

  return (
    <Card className="blueprint-launch tremor-surface">
      <BookOpen size={28} />
      <Title>{blueprintName || 'Certificate of Title – Schedule 5'}</Title>
      <Text>Build a structured title certificate with sources, risk flags and schedule output.</Text>

      <Divider />
      <div className="checklist-wrap">
        <Text className="checklist-label">Required documents</Text>
        {REQUIRED_DOCS.map((doc) => (
          <label key={doc.id} className="check-row">
            <input type="checkbox" checked={!!checklist[doc.id]} onChange={() => toggleChecklist(doc.id)} />
            <span>{doc.label}</span>
            <Badge color={doc.required ? 'red' : 'gray'} size="xs">{doc.required ? 'required' : 'optional'}</Badge>
          </label>
        ))}
      </div>

      <div className="empty-upload-zone large"><Upload size={16} /><span>Drop files here or click to upload</span></div>

      <Button variant="secondary" size="xs" className="btn-ghost" onClick={simulateRequiredDocs}>Simulate: Add required docs</Button>
      <Button className="btn-primary" disabled={!allRequiredChecked} onClick={runReport}>Run Report →</Button>
    </Card>
  )
}

function MessageBlock({
  msg,
  onOpenCitation,
  onPrompt,
  onRunLeaseReport,
  onBrowseBlueprints,
  onViewProject,
}) {
  const [reviewed, setReviewed] = useState({})
  const [saveMode, setSaveMode] = useState('initial')
  const [saveProject, setSaveProject] = useState('25 Londale St')

  if (msg.role === 'meta') {
    return <div className="meta-pill-wrap"><Badge color="gray">↩ {msg.label}</Badge></div>
  }

  if (msg.role === 'user') {
    return (
      <Card className="user-msg tremor-surface">
        {msg.attachments?.length ? (
          <div className="msg-attachment-stack">
            {msg.attachments.map((att) => (
              <span key={att.id || att.name} className="attachment-chip sent">
                {att.name} · {att.size}
              </span>
            ))}
          </div>
        ) : null}
        <Text>{msg.text}</Text>
      </Card>
    )
  }

  if (msg.role === 'typing') {
    return (
      <Card className="assistant-card tremor-surface">
        <div className="assistant-head"><div className="dot pulse" /><span>Copilot</span></div>
        <div className="typing-dots"><span /><span /><span /></div>
      </Card>
    )
  }

  if (msg.role === 'savePrompt') {
    if (saveMode === 'dismissed') return null
    if (saveMode === 'saved') {
      return (
        <Card className="assistant-card tremor-surface save-prompt-card saved">
          <div className="save-success-row">
            <Check size={14} />
            <Text>Saved to {saveProject}</Text>
            <button type="button" className="save-view-link" onClick={onViewProject}>View project →</button>
          </div>
        </Card>
      )
    }

    return (
      <Card className="assistant-card tremor-surface save-prompt-card">
        <div className="save-prompt-inner">
          <div className="save-prompt-left">
            <FolderPlus size={14} />
            <Text>Would you like to save this document to a project for future reference?</Text>
          </div>
          <div className="save-prompt-actions">
            {saveMode === 'select' ? (
              <>
                <Select value={saveProject} onValueChange={setSaveProject}>
                  <SelectItem value="25 Londale St">25 Londale St</SelectItem>
                  <SelectItem value="Greenlock">Greenlock</SelectItem>
                  <SelectItem value="ABC">ABC</SelectItem>
                  <SelectItem value="Create new project">＋ Create new project</SelectItem>
                </Select>
                <Button size="xs" className="btn-primary" onClick={() => setSaveMode('saved')}>Save</Button>
              </>
            ) : (
              <>
                <Button size="xs" className="btn-primary" onClick={() => setSaveMode('select')}>Save to project</Button>
                <Button size="xs" variant="secondary" className="btn-secondary" onClick={() => setSaveMode('dismissed')}>Not now</Button>
              </>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="assistant-card tremor-surface">
      <div className="assistant-head">
        <div className="dot" />
        <span>Copilot</span>
        <div className="assistant-tools">
          <button type="button"><Copy size={12} /></button>
          <button type="button"><ThumbsUp size={12} /></button>
          <button type="button"><ThumbsDown size={12} /></button>
        </div>
      </div>

      <div className="assistant-body">
        {msg.fileAnalysis ? (
          <div className="file-analysis-block">
            <div className="file-summary-row">
              <FileText size={14} />
              <span>{msg.fileAnalysis.name}</span>
              <Badge color="gray">{msg.fileAnalysis.type}</Badge>
              <Badge color="blue">{msg.fileAnalysis.pages} pages</Badge>
            </div>
            <Text>{msg.fileAnalysis.summary}</Text>
            <div className="next-row">
              <Text>You might want to ask:</Text>
              <div className="source-chips">
                {msg.fileAnalysis.suggested.map((q) => (
                  <Button key={q} variant="secondary" size="xs" className="btn-chip" onClick={() => onPrompt(q)}>
                    {q}
                  </Button>
                ))}
              </div>
            </div>
            <div className="next-row">
              <Text>Run a structured report:</Text>
              <div className="source-chips">
                <Button variant="secondary" size="xs" className="btn-secondary" icon={FileText} onClick={onRunLeaseReport}>
                  Lease Report – Standard
                </Button>
                <Button variant="secondary" size="xs" className="btn-secondary" icon={BookOpen} onClick={onBrowseBlueprints}>
                  Browse all blueprints
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {msg.text && <Text>{formatStrongText(msg.text)}</Text>}

        {msg.sections?.map((section) => (
          <div key={section.heading} className="ai-section">
            <Title>{section.heading}</Title>
            {section.bullets.map((bullet) => <Text key={bullet}>• {formatStrongText(bullet)}</Text>)}
          </div>
        ))}

        {msg.comparisonTable ? (
          <div className="table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th />
                  <th>Freehold</th>
                  <th>Leasehold</th>
                </tr>
              </thead>
              <tbody>
                {msg.comparisonTable.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>{row.freehold}</td>
                    <td>{row.leasehold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {msg.issueList?.map((issue) => {
          const isReviewed = reviewed[issue.id]
          return (
            <Card key={issue.id} className={`issue-row tremor-surface ${isReviewed ? 'reviewed' : ''}`}>
              <div>
                <Badge color={isReviewed ? 'gray' : issue.severity === 'High' ? 'red' : issue.severity === 'Medium' ? 'amber' : 'green'}>
                  {isReviewed ? 'Reviewed' : issue.severity}
                </Badge>
              </div>
              <div className="issue-main">
                <Title>{issue.title}</Title>
                <Text>{issue.description}</Text>
                <Badge color="blue" className="source-chip" onClick={() => onOpenCitation(issue.source)}>
                  📄 {issue.source.doc.replace('.pdf', '')} · {issue.source.label}
                </Badge>
              </div>
              <Button
                variant="secondary"
                size="xs"
                className={isReviewed ? 'btn-ghost' : 'btn-secondary'}
                icon={isReviewed ? Check : undefined}
                onClick={() => setReviewed((prev) => ({ ...prev, [issue.id]: !prev[issue.id] }))}
              >
                {isReviewed ? 'Reviewed' : 'Mark reviewed'}
              </Button>
            </Card>
          )
        })}

        {!!msg.sources?.length && (
          <div className="source-row">
            <Text>Sources</Text>
            <div className="source-chips">
              {msg.sources.map((source) => (
                <Badge key={`${source.doc}-${source.ref}`} color="blue" className="source-chip" onClick={() => onOpenCitation(source)}>
                  📄 {source.doc} · {source.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {!!msg.followUps?.length && (
          <div className="next-row">
            <Text>Suggested next steps</Text>
            <div className="source-chips">
              {msg.followUps.map((f) => (
                <Button key={f} variant="secondary" size="xs" className="btn-chip" onClick={() => onPrompt(f)}>{f}</Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

function DocumentFaux({ activeDocument, activeReference }) {
  const leaseDoc = (
    <div className="faux-page-wrap">
      <FauxPage
        title="CLAUSE 4 — RENT"
        body={[
          '4.1 The Tenant shall pay to the Landlord during the Term the yearly rent of TWO HUNDRED AND FIFTY POUNDS (£250) payable in equal quarterly instalments in advance on the usual quarter days.',
          '4.2 The Initial Rent shall be reviewed on each Review Date in accordance with Schedule 3 of this Lease. The reviewed rent shall not be less than the rent payable immediately before the relevant Review Date.',
          '4.3 If the reviewed rent has not been agreed or determined by the Review Date, the Tenant shall continue to pay rent at the rate previously payable...',
        ]}
        highlight={activeReference === 'clause-4-2' ? 1 : -1}
      />
      <FauxPage
        title="CLAUSE 8 — RENT REVIEW"
        body={[
          '8.1 Reviews occur at five yearly intervals on an upward-only open market basis.',
          '8.2 Valuation assumptions and disregards are set out in Schedule 3.',
          '8.3 Notice must be served no later than 1 March 2026 to trigger review process.',
        ]}
        highlight={activeReference === 'clause-8-3' ? 2 : activeReference === 'clause-8-1' ? 0 : -1}
      />
      <FauxPage
        title="TENANT OBLIGATIONS"
        body={[
          '3.1 Keep premises in repair and condition.',
          '3.2 Not assign/sublet without landlord consent.',
          '3.3 Comply with statutory requirements.',
        ]}
      />
    </div>
  )

  const titleDoc = (
    <div className="faux-page-wrap">
      <FauxPage
        title="CHARGES REGISTER"
        body={[
          'Entry 2: Standard mortgage charge — NatWest.',
          'Entry 4: Restrictive covenant limits use to single private dwelling only.',
          'Entry 7: Overage clause with 20-year trigger and 30% uplift share.',
        ]}
        highlight={activeReference === 'entry-4' ? 1 : -1}
      />
      <FauxPage
        title="PROPERTY REGISTER"
        body={[
          'A: Property Register — 25 Londale St, London EC1A 1BB.',
          'B: Proprietorship Register — Registered proprietor recorded as of 12 Jan 2015.',
          'C: Refer to Charges Register entries for encumbrances and restrictions.',
        ]}
      />
      <FauxPage
        title="NOTES"
        body={[
          'Official copies issued under section 67 of the Land Registration Act 2002.',
          'No pending applications recorded as at issue date.',
          'Title plan should be cross-checked against survey before exchange.',
        ]}
      />
    </div>
  )

  return activeDocument?.includes('TitleRegister') ? titleDoc : leaseDoc
}

function FauxPage({ title, body, highlight = -1 }) {
  return (
    <Card className="faux-page tremor-surface">
      <Text className="faux-title">{title}</Text>
      {body.map((line, idx) => (
        <div key={line} className={highlight === idx ? 'faux-highlight' : 'faux-line'}>
          {highlight === idx && <Badge color="blue" size="xs" className="ref-badge">📍 Referenced</Badge>}
          <Text>{line}</Text>
        </div>
      ))}
    </Card>
  )
}

function BlueprintDrawer({ onClose, onSelectBlueprint }) {
  return (
    <>
      <div className="drawer-overlay" />
      <aside className="blueprint-drawer">
        <div className="drawer-head">
          <Title>Select a Report Blueprint</Title>
          <button type="button" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="drawer-body">
          <TextInput placeholder="Search blueprints..." />
          {BLUEPRINTS.map((bp) => (
            <Card key={bp.name} className="drawer-card tremor-surface">
              <div className="drawer-card-top"><Title>{bp.name}</Title><Badge color="gray">{bp.eta}</Badge></div>
              <Text>{bp.desc}</Text>
              <div className="drawer-doc-tags">
                {bp.docs.map((doc) => <Badge key={doc} color="gray" icon={FileText}>{doc}</Badge>)}
              </div>
              <Divider />
              <Button variant="secondary" size="xs" className="btn-secondary" onClick={() => onSelectBlueprint(bp.name)}>Select →</Button>
            </Card>
          ))}
        </div>
      </aside>
    </>
  )
}

function SectionHeader({ label, action = null }) {
  return (
    <div className="section-mini-head">
      <span>{label}</span>
      {action}
    </div>
  )
}

function formatStrongText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>
    }
    return <span key={idx}>{part}</span>
  })
}

function getResponseForPrompt(prompt, hasAttachment = false) {
  const p = prompt.toLowerCase()

  if (p.includes('difference between freehold and leasehold')) {
    return {
      sections: [
        {
          heading: 'Freehold',
          bullets: [
            'The owner holds the property and the land it stands on outright, indefinitely.',
            'There is no landlord relationship and no ground rent or service charge (unless part of an estate).',
          ],
        },
        {
          heading: 'Leasehold',
          bullets: [
            'The owner holds the property for a fixed term granted by a freeholder (landlord).',
            'Ground rent may be payable, lease length affects mortgageability, and the tenant is bound by lease covenants.',
          ],
        },
      ],
      comparisonTable: [
        { label: 'Ownership', freehold: 'Permanent', leasehold: 'Fixed term' },
        { label: 'Ground rent', freehold: 'No', leasehold: 'Possibly yes' },
        { label: 'Landlord', freehold: 'No', leasehold: 'Yes' },
        { label: 'Covenants', freehold: 'Limited', leasehold: 'Extensive' },
      ],
      followUps: [
        'What happens when a lease gets below 80 years?',
        'Can a leaseholder buy the freehold?',
        'What is a share of freehold?',
      ],
      sources: hasAttachment
        ? [{ doc: 'Lease_Excerpt.pdf', label: 'Uploaded excerpt', ref: 'clause-4-2' }]
        : [],
    }
  }

  if (p.includes('good and substantial repair')) {
    return {
      sections: [
        {
          heading: 'Meaning in practice',
          bullets: [
            'It requires the tenant to keep premises in sound, tenantable condition having regard to age, character, and locality.',
            'It usually goes beyond cosmetic maintenance and can include replacement of worn components.',
          ],
        },
        {
          heading: 'Legal context',
          bullets: [
            'Courts often assess this objectively with property context in mind, including the standard from Proudfoot v Hart.',
            'Liability commonly depends on lease wording, schedules of condition, and whether defects are inherent or tenant-caused.',
          ],
        },
      ],
      followUps: ['How is repair different from improvement?', 'What is a Schedule of Condition?'],
      sources: hasAttachment
        ? [{ doc: 'Lease_Excerpt.pdf', label: 'Uploaded excerpt', ref: 'clause-8-1' }]
        : [],
    }
  }

  if (p.includes('ground rent')) {
    return {
      text:
        'The current ground rent is **£250 per annum**, as set out in the lease dated 15 March 1987. This is subject to review every 25 years. The next scheduled review date is **March 2031**.',
      sources: hasAttachment
        ? [{ doc: 'Lease_Excerpt.pdf', label: 'Uploaded excerpt', ref: 'clause-4-2' }]
        : [{ doc: 'Lease_25Londale.pdf', label: 'p.12, Clause 4.2', ref: 'clause-4-2' }],
      followUps: ['When is the next rent review?', 'What are the review mechanism terms?', 'Compare with market rate'],
    }
  }

  if (p.includes('lease obligations') || p.includes('obligations')) {
    return {
      sections: [
        {
          heading: 'Tenant Obligations',
          bullets: [
            'Keep premises in good repair and condition.',
            'Not assign or sublet without landlord consent.',
            'Comply with all statutory requirements.',
          ],
        },
        {
          heading: 'Landlord Obligations',
          bullets: ['Maintain structure and exterior.', 'Provide quiet enjoyment.'],
        },
      ],
      sources: [{ doc: 'Lease_25Londale.pdf', label: 'p.8–14, Clauses 3–5', ref: 'clause-8-1' }],
      followUps: ['Which obligations are most commonly breached?', 'Flag any unusual clauses'],
    }
  }

  if (p.includes('restriction') || p.includes('title')) {
    return {
      issueList: [
        {
          id: 'issue-1',
          severity: 'High',
          title: 'Restrictive covenant — residential use only',
          description: 'Entry 4 prohibits commercial use. Conflicts with proposed development.',
          source: { doc: 'TitleRegister_25Londale.pdf', label: 'Entry 4', ref: 'entry-4' },
        },
        {
          id: 'issue-2',
          severity: 'Medium',
          title: 'Overage clause — 20 year trigger',
          description: 'Seller retains 30% uplift on planning permission granted within 20 years.',
          source: { doc: 'TitleRegister_25Londale.pdf', label: 'Entry 7', ref: 'entry-4' },
        },
        {
          id: 'issue-3',
          severity: 'Low',
          title: 'Standard mortgage charge — NatWest',
          description: 'Registered charge, expected to be released on completion.',
          source: { doc: 'TitleRegister_25Londale.pdf', label: 'Entry 2', ref: 'entry-4' },
        },
      ],
      sources: [{ doc: 'TitleRegister_25Londale.pdf', label: 'Charges Register', ref: 'entry-4' }],
      followUps: ['Draft a title objection letter', 'How does the overage clause affect valuation?', 'Check all entries for similar covenants'],
    }
  }

  if (p.includes('next rent review')) {
    return {
      text:
        'The next rent review date is **15 March 2026**. Notice should be served no later than **1 March 2026** to trigger the review process.',
      sources: [{ doc: 'Lease_25Londale.pdf', label: 'p.19, Clause 8.3', ref: 'clause-8-3' }],
      followUps: ['Draft rent review notice', 'What happens if notice is missed?', 'Show review history'],
    }
  }

  if (p.includes('compare rent review')) {
    return {
      sections: [
        {
          heading: 'Rent Review Comparison',
          bullets: [
            'Clause 4.2 sets baseline review mechanism tied to schedule process.',
            'Clause 8.1 defines upward-only open market review intervals.',
            'Notice deadline appears in **Clause 8.3** and should be diary tracked.',
          ],
        },
      ],
      sources: [{ doc: 'Lease_25Londale.pdf', label: 'p.18–19, Clauses 8.1–8.3', ref: 'clause-8-3' }],
      followUps: ['When is the next rent review?', 'Draft rent review notice'],
    }
  }

  return {
    text:
      'I can help with lease review, title risks, and blueprint-based reports. Try asking about ground rent, obligations, or title restrictions.',
    sources: hasAttachment
      ? [{ doc: 'Lease_Excerpt.pdf', label: 'Uploaded excerpt', ref: 'clause-4-2' }]
      : [],
    followUps: ['What is the current ground rent?', 'Any title restrictions?', 'Summarize key lease obligations'],
  }
}

export default App
