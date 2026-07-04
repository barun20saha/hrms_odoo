import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '../../store/authStore'
import {
  BookOpen,
  Plus,
  ArrowLeft,
  Trash2,
  Download,
  Upload,
  Calendar,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react'
import { toast } from 'react-hot-toast'

// ── Types ──────────────────────────────────────────────────────
interface Settlement {
  amount: number;
  date: string;
  note?: string;
}

interface Transaction {
  id: string;
  createdAt: number;
  type: 'debit' | 'credit';
  amount: number;
  note: string;
  date: string;
  settlements: Settlement[];
}

interface Entity {
  id: string;
  name: string;
  color: string;
}

interface LedgerDB {
  customers: Entity[];
  suppliers: Entity[];
  transactions: Record<string, Transaction[]>;
}

const COLORS = [
  '#0288D1', // Primary Blue
  '#009688', // Accent Teal
  '#26C6DA', // Secondary Cyan
  '#8E24AA', // Purple
  '#D81B60', // Pink
  '#F4511E', // Orange
  '#43A047', // Green
  '#5D4037'  // Brown
]

const INIT_DB: LedgerDB = {
  customers: [],
  suppliers: [],
  transactions: {}
}

export const Accounts: React.FC = () => {
  const { employeeId, email } = useAuthStore()
  
  // Storage key specific to each logged-in user
  const STORAGE_KEY = `hrms_ledger_${employeeId || email || 'global'}`

  const [db, setDb] = useState<LedgerDB>(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        const parsed = JSON.parse(data)
        if (parsed.customers && parsed.suppliers && parsed.transactions) {
          return parsed
        }
      }
    } catch (e) {
      console.error('Failed to load ledger DB', e)
    }
    return INIT_DB
  })

  // State
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers')
  const [searchQuery, setSearchQuery] = useState('')
  const [openEntityId, setOpenEntityId] = useState<string | null>(null)
  
  // Modals
  const [showAddEntity, setShowAddEntity] = useState(false)
  const [newEntityName, setNewEntityName] = useState('')
  
  const [showAddTx, setShowAddTx] = useState(false)
  const [txType, setTxType] = useState<'debit' | 'credit'>('debit')
  const [txAmount, setTxAmount] = useState('')
  const [txNote, setTxNote] = useState('')
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0])
  
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null)
  const [partialAmount, setPartialAmount] = useState('')
  const [showPartialInput, setShowPartialInput] = useState(false)
  
  const [showBackupModal, setShowBackupModal] = useState(false)
  const [showDeleteRangeModal, setShowDeleteRangeModal] = useState(false)
  const [deleteFromDate, setDeleteFromDate] = useState('')
  const [deleteToDate, setDeleteToDate] = useState('')
  const [confirmDeleteRange, setConfirmDeleteRange] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Persist DB updates
  const saveDB = useCallback((nextDB: LedgerDB) => {
    setDb(nextDB)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDB))
    } catch (e) {
      toast.error('Local storage storage limit exceeded.')
    }
  }, [STORAGE_KEY])

  // Helpers
  const getPending = (tx: Transaction) => {
    const settled = (tx.settlements || []).reduce((sum, s) => sum + s.amount, 0)
    return Math.max(0, tx.amount - settled)
  }

  const getEntityStats = (entityId: string, isSupplier: boolean) => {
    const txs = db.transactions[entityId] || []
    let gave = 0
    let got = 0
    txs.forEach(t => {
      const pending = getPending(t)
      if (t.type === 'debit') gave += pending
      else got += pending
    })
    
    // Suppliers: owe to them is (got - gave)
    // Customers: owe to us is (gave - got)
    const net = isSupplier ? (got - gave) : (gave - got)
    return { gave, got, net }
  }

  // General statistics for the active tab
  const getOverviewStats = () => {
    const ids = activeTab === 'customers' ? db.customers : db.suppliers
    let totalGet = 0
    let totalGive = 0
    
    ids.forEach(entity => {
      const { net } = getEntityStats(entity.id, activeTab === 'suppliers')
      if (net > 0) totalGet += net
      else totalGive += Math.abs(net)
    })
    return { totalGet, totalGive }
  }

  const { totalGet, totalGive } = getOverviewStats()

  // Add customer/supplier
  const handleAddEntity = () => {
    if (!newEntityName.trim()) return
    const listKey = activeTab
    const list = db[listKey]
    
    const duplicate = list.some(e => e.name.toLowerCase() === newEntityName.trim().toLowerCase())
    if (duplicate) {
      toast.error(`${activeTab === 'customers' ? 'Customer' : 'Supplier'} already exists.`)
      return
    }

    const newId = 'entity_' + Math.random().toString(36).slice(2) + Date.now()
    const color = COLORS[list.length % COLORS.length]
    const updatedList = [...list, { id: newId, name: newEntityName.trim(), color }]

    saveDB({
      ...db,
      [listKey]: updatedList,
      transactions: {
        ...db.transactions,
        [newId]: []
      }
    })

    setShowAddEntity(false)
    setNewEntityName('')
    toast.success('Successfully added!')
  }

  // Delete customer/supplier
  const handleDeleteEntity = (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" and all transaction history?`)) return
    
    const listKey = activeTab
    const updatedList = db[listKey].filter(e => e.id !== id)
    const updatedTxs = { ...db.transactions }
    delete updatedTxs[id]

    saveDB({
      ...db,
      [listKey]: updatedList,
      transactions: updatedTxs
    })

    setOpenEntityId(null)
    toast.success('Deleted successfully.')
  }

  // Add transaction
  const handleAddTransaction = () => {
    if (!openEntityId) return
    const amount = parseFloat(txAmount)
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount.')
      return
    }

    const newTx: Transaction = {
      id: 'tx_' + Math.random().toString(36).slice(2) + Date.now(),
      createdAt: Date.now(),
      type: txType,
      amount,
      note: txNote.trim() || (txType === 'debit' ? 'Gave' : 'Got'),
      date: txDate,
      settlements: []
    }

    const currentTxs = db.transactions[openEntityId] || []
    
    // Auto settlement logic if applicable
    let updatedTxs = [...currentTxs, newTx]

    saveDB({
      ...db,
      transactions: {
        ...db.transactions,
        [openEntityId]: updatedTxs
      }
    })

    setShowAddTx(false)
    setTxAmount('')
    setTxNote('')
    setTxDate(new Date().toISOString().split('T')[0])
    toast.success('Transaction added!')
  }

  // Delete transaction
  const handleDeleteTransaction = (txId: string) => {
    if (!openEntityId || !window.confirm('Delete this transaction?')) return
    const currentTxs = db.transactions[openEntityId] || []
    const updatedTxs = currentTxs.filter(t => t.id !== txId)
    
    saveDB({
      ...db,
      transactions: {
        ...db.transactions,
        [openEntityId]: updatedTxs
      }
    })

    setSelectedTxId(null)
    toast.success('Transaction deleted.')
  }

  // Settle full
  const handleSettleFull = (tx: Transaction) => {
    if (!openEntityId) return
    const pending = getPending(tx)
    if (pending <= 0) return

    const newSettlement: Settlement = {
      amount: pending,
      date: new Date().toISOString().split('T')[0],
      note: 'Full settlement'
    }

    const currentTxs = db.transactions[openEntityId] || []
    const updatedTxs = currentTxs.map(t => {
      if (t.id === tx.id) {
        return {
          ...t,
          settlements: [...(t.settlements || []), newSettlement]
        }
      }
      return t
    })

    saveDB({
      ...db,
      transactions: {
        ...db.transactions,
        [openEntityId]: updatedTxs
      }
    })
    
    setSelectedTxId(null)
    toast.success('Successfully settled!')
  }

  // Settle partial
  const handleSettlePartial = (tx: Transaction) => {
    if (!openEntityId) return
    const amt = parseFloat(partialAmount)
    const pending = getPending(tx)

    if (!amt || amt <= 0 || amt > pending) {
      toast.error(`Please enter a valid amount (max ${pending}).`)
      return
    }

    const newSettlement: Settlement = {
      amount: amt,
      date: new Date().toISOString().split('T')[0],
      note: 'Partial settlement'
    }

    const currentTxs = db.transactions[openEntityId] || []
    const updatedTxs = currentTxs.map(t => {
      if (t.id === tx.id) {
        return {
          ...t,
          settlements: [...(t.settlements || []), newSettlement]
        }
      }
      return t
    })

    saveDB({
      ...db,
      transactions: {
        ...db.transactions,
        [openEntityId]: updatedTxs
      }
    })

    setPartialAmount('')
    setShowPartialInput(false)
    setSelectedTxId(null)
    toast.success('Partial payment recorded.')
  }

  // Bulk delete by date range
  const handleDeleteDateRange = () => {
    if (!deleteFromDate && !deleteToDate) return
    const from = deleteFromDate ? new Date(deleteFromDate) : null
    const to = deleteToDate ? new Date(deleteToDate) : null

    const updatedTransactions: Record<string, Transaction[]> = {}
    let deleteCount = 0

    Object.keys(db.transactions).forEach(entityId => {
      const txs = db.transactions[entityId] || []
      const remainingTxs = txs.filter(tx => {
        const d = new Date(tx.date)
        const matchesFrom = !from || d >= from
        const matchesTo = !to || d <= to
        if (matchesFrom && matchesTo) {
          deleteCount++
          return false
        }
        return true
      })
      updatedTransactions[entityId] = remainingTxs
    })

    saveDB({
      ...db,
      transactions: updatedTransactions
    })

    setDeleteFromDate('')
    setDeleteToDate('')
    setConfirmDeleteRange(false)
    setShowDeleteRangeModal(false)
    toast.success(`Deleted ${deleteCount} transactions successfully.`)
  }

  // Backup & Restore
  const handleExportBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute("href", dataStr)
      downloadAnchor.setAttribute("download", `HRMS_Accounts_Backup_${new Date().toISOString().split('T')[0]}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
      toast.success('Backup exported!')
    } catch (e) {
      toast.error('Failed to export backup.')
    }
  }

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        if (parsed.customers && parsed.suppliers && parsed.transactions) {
          saveDB(parsed)
          toast.success('Ledger imported successfully!')
          setShowBackupModal(false)
        } else {
          toast.error('Invalid backup file structure.')
        }
      } catch (err) {
        toast.error('Failed to parse file.')
      }
    }
    reader.readAsText(file)
  }

  const activeEntity = openEntityId 
    ? [...db.customers, ...db.suppliers].find(e => e.id === openEntityId)
    : null

  const activeTxs = openEntityId ? db.transactions[openEntityId] || [] : []
  
  const filteredEntities = db[activeTab].filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ledger Book</h2>
            <p className="text-xs text-gray-500">Manage separate accounts ledger, credit, & debit logs</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeleteRangeModal(true)}
            className="px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-150 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 font-semibold text-xs rounded-xl transition-all"
          >
            Clear Range
          </button>
          <button
            onClick={() => setShowBackupModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
          >
            <Download size={14} />
            <span>Backup / Restore</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      {!openEntityId ? (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-slate-800">
            <button
              onClick={() => { setActiveTab('customers'); setSearchQuery('') }}
              className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'customers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Customers (To Receive)
            </button>
            <button
              onClick={() => { setActiveTab('suppliers'); setSearchQuery('') }}
              className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'suppliers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Suppliers (To Pay)
            </button>
          </div>

          {/* Statistics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  You will Get (Pending Debit)
                </span>
                <h3 className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                  ₹{totalGet.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </h3>
              </div>
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
            </div>

            <div className="bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/20 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  You will Give (Pending Credit)
                </span>
                <h3 className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 mt-1">
                  ₹{totalGive.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </h3>
              </div>
              <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
            </div>
          </div>

          {/* List Section */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-850 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
              />
              <button
                onClick={() => setShowAddEntity(true)}
                className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-all shrink-0"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add {activeTab === 'customers' ? 'Customer' : 'Supplier'}</span>
              </button>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-slate-800/80">
              {filteredEntities.length > 0 ? (
                filteredEntities.map(entity => {
                  const { net } = getEntityStats(entity.id, activeTab === 'suppliers')
                  return (
                    <div
                      key={entity.id}
                      onClick={() => setOpenEntityId(entity.id)}
                      className="p-4 flex items-center justify-between hover:bg-gray-50/55 dark:hover:bg-slate-850/50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs"
                          style={{ backgroundColor: entity.color }}
                        >
                          {entity.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{entity.name}</h4>
                          <p className="text-xs text-gray-400">Tap to view ledger history</p>
                        </div>
                      </div>

                      <div className="text-right">
                        {net > 0 ? (
                          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{net.toLocaleString('en-IN')}
                            <span className="text-[10px] block font-normal text-gray-400">
                              {activeTab === 'customers' ? 'to receive' : 'to get'}
                            </span>
                          </div>
                        ) : net < 0 ? (
                          <div className="text-sm font-bold text-red-500 dark:text-red-400">
                            ₹{Math.abs(net).toLocaleString('en-IN')}
                            <span className="text-[10px] block font-normal text-gray-400">
                              {activeTab === 'customers' ? 'to pay' : 'to give'}
                            </span>
                          </div>
                        ) : (
                          <div className="text-sm font-semibold text-gray-400">
                            Settled
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-12 text-center text-gray-400 space-y-2">
                  <HelpCircle className="mx-auto text-gray-300 dark:text-slate-700" size={36} />
                  <p className="text-sm font-medium">No accounts found.</p>
                  <p className="text-xs text-gray-400">Add entries using the button above to begin tracking ledger sheets.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* --- LEDGER HISTORIC VIEW --- */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setOpenEntityId(null); setSelectedTxId(null) }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-all"
            >
              <ArrowLeft size={16} />
              <span>Back to Lists</span>
            </button>

            <button
              onClick={() => handleDeleteEntity(openEntityId, activeEntity?.name || '')}
              className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all"
              title="Delete entire account"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Entity Profile Banner */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-xs"
                style={{ backgroundColor: activeEntity?.color }}
              >
                {activeEntity?.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{activeEntity?.name}</h3>
                <p className="text-xs text-gray-500 capitalize">{activeTab.slice(0, -1)} Ledger Sheet</p>
              </div>
            </div>

            <div className="text-center sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 w-full sm:w-auto">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Current Balance</span>
              {(() => {
                const { net } = getEntityStats(openEntityId, activeTab === 'suppliers')
                if (net > 0) {
                  return (
                    <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">
                      ₹{net.toLocaleString('en-IN')} <span className="text-xs font-normal">to receive</span>
                    </h3>
                  )
                } else if (net < 0) {
                  return (
                    <h3 className="text-2xl font-extrabold text-red-500 mt-0.5">
                      ₹{Math.abs(net).toLocaleString('en-IN')} <span className="text-xs font-normal">to pay</span>
                    </h3>
                  )
                } else {
                  return <h3 className="text-2xl font-extrabold text-gray-400 mt-0.5">All Settled</h3>
                }
              })()}
            </div>
          </div>

          {/* Action grid (Add stamps) */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setTxType('debit'); setShowAddTx(true) }}
              className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-sm rounded-xl shadow-xs transition-all border border-emerald-100 flex items-center justify-center gap-1.5"
            >
              <Plus size={16} />
              <span>You Gave (Debit)</span>
            </button>
            <button
              onClick={() => { setTxType('credit'); setShowAddTx(true) }}
              className="py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm rounded-xl shadow-xs transition-all border border-blue-100 flex items-center justify-center gap-1.5"
            >
              <Plus size={16} />
              <span>You Got (Credit)</span>
            </button>
          </div>

          {/* Ledger History List */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800">
              <h4 className="font-bold text-gray-900 dark:text-white">Transaction Logs</h4>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-slate-800/80">
              {activeTxs.length > 0 ? (
                activeTxs.map(tx => {
                  const pending = getPending(tx)
                  const isDebit = tx.type === 'debit'
                  const isSettled = pending === 0

                  return (
                    <div key={tx.id} className="p-6 space-y-4 hover:bg-gray-55/10 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                            isDebit 
                              ? 'bg-emerald-50/50 text-emerald-600 border-emerald-100' 
                              : 'bg-blue-50/50 text-blue-600 border-blue-100'
                          }`}>
                            <IndianRupee size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{tx.note}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-gray-400">{tx.date}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-semibold border ${
                                isDebit 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {isDebit ? 'You Gave' : 'You Got'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`text-base font-bold ${isDebit ? 'text-emerald-600' : 'text-blue-600'}`}>
                            ₹{tx.amount.toLocaleString('en-IN')}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {isSettled ? (
                              <span className="text-emerald-600 font-semibold">Fully Settled</span>
                            ) : (
                              <span>Pending: ₹{pending.toLocaleString('en-IN')}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Settlement Action Bar */}
                      {!isSettled && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50 dark:border-slate-800">
                          {selectedTxId === tx.id && showPartialInput ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                placeholder={`Amount (max ${pending})...`}
                                value={partialAmount}
                                onChange={(e) => setPartialAmount(e.target.value)}
                                className="px-3 py-1 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs"
                              />
                              <button
                                onClick={() => handleSettlePartial(tx)}
                                className="px-3 py-1 bg-blue-600 text-white font-semibold text-xs rounded-lg"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => { setShowPartialInput(false); setSelectedTxId(null); setPartialAmount('') }}
                                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-xs rounded-lg"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => { setSelectedTxId(tx.id); setShowPartialInput(true) }}
                                className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-300 font-semibold text-xs rounded-lg transition-all"
                              >
                                Settle Partial
                              </button>
                              <button
                                onClick={() => handleSettleFull(tx)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-all"
                              >
                                Settle Full
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                            title="Delete transaction entry"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}

                      {/* Settlements list */}
                      {tx.settlements && tx.settlements.length > 0 && (
                        <div className="bg-gray-50/50 dark:bg-slate-850/40 border border-gray-100 dark:border-slate-800 p-3.5 rounded-xl space-y-2">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Payment Settlements</p>
                          <div className="divide-y divide-gray-100 dark:divide-slate-800/80">
                            {tx.settlements.map((s, idx) => (
                              <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                                <span className="text-gray-500">
                                  {s.note || 'Settlement'} on <span className="text-gray-400">{s.date}</span>
                                </span>
                                <span className="font-bold text-emerald-600">✓ ₹{s.amount.toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="p-12 text-center text-gray-400 space-y-2">
                  <FileSpreadsheet className="mx-auto text-gray-300 dark:text-slate-700" size={36} />
                  <p className="text-sm font-medium">No transaction logs recorded.</p>
                  <p className="text-xs text-gray-400">Add debit or credit entries to keep tracking transaction files.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      
      {/* Add Entity Modal */}
      {showAddEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-850 p-6 rounded-2xl w-full max-w-sm shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              Add New {activeTab === 'customers' ? 'Customer' : 'Supplier'}
            </h3>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</label>
              <input
                type="text"
                value={newEntityName}
                onChange={(e) => setNewEntityName(e.target.value)}
                placeholder="Enter client or partner name..."
                className="w-full px-4 py-2 border border-gray-250 dark:border-slate-750 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => { setShowAddEntity(false); setNewEntityName('') }}
                className="flex-1 py-2 bg-gray-150 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEntity}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-850 p-6 rounded-2xl w-full max-w-md shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              Record {txType === 'debit' ? 'You Gave' : 'You Got'} Entry
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount (INR)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-250 dark:border-slate-750 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white transition-all font-bold text-base"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-250 dark:border-slate-750 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remarks / Remarks</label>
                <input
                  type="text"
                  placeholder="Add item or reason description..."
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-250 dark:border-slate-750 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => { setShowAddTx(false); setTxAmount(''); setTxNote('') }}
                className="flex-1 py-2 bg-gray-150 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTransaction}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
              >
                Record Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-850 p-6 rounded-2xl w-full max-w-sm shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Backup / Restore Ledger</h3>
            <p className="text-xs text-gray-400">Save your records to a JSON file locally, or upload an existing file to restore history sheets.</p>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleExportBackup}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all"
              >
                <Download size={16} />
                <span>Export JSON File</span>
              </button>

              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportBackup}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-350 font-semibold text-sm rounded-xl transition-all"
                >
                  <Upload size={16} />
                  <span>Import Backup File</span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowBackupModal(false)}
                className="w-full py-2 bg-gray-150 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-xl transition-all"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Range Modal */}
      {showDeleteRangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-850 p-6 rounded-2xl w-full max-w-sm shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Delete Range</h3>
            <p className="text-xs text-gray-400">Specify dates to bulk clear transactions in range across all profiles.</p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">From Date</label>
                <input
                  type="date"
                  value={deleteFromDate}
                  onChange={(e) => setDeleteFromDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">To Date</label>
                <input
                  type="date"
                  value={deleteToDate}
                  onChange={(e) => setDeleteToDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-250 rounded-lg text-sm"
                />
              </div>
            </div>

            {confirmDeleteRange && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs font-semibold">
                Warning: This process is irreversible and all matching records will be lost permanently.
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => { setShowDeleteRangeModal(false); setConfirmDeleteRange(false) }}
                className="flex-1 py-2 bg-gray-150 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-xl"
              >
                Cancel
              </button>

              {confirmDeleteRange ? (
                <button
                  onClick={handleDeleteDateRange}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl"
                >
                  Confirm Delete
                </button>
              ) : (
                <button
                  onClick={() => setConfirmDeleteRange(true)}
                  disabled={!deleteFromDate && !deleteToDate}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-xl disabled:opacity-50"
                >
                  Delete Range
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Accounts
