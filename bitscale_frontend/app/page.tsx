"use client";

import { useState } from "react";
import {
  Search,
  MoreHorizontal,
  Play,
  Plus,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ArrowLeft,
  Settings,
  RefreshCw,
  Layout,
  Share2,
  Download,
  Trash2,
  ChevronDown,
  Grid,
  Table,
  PlusCircle,
  X,
  Save,
  Loader2,
  UserCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { initialRows, statsData } from '@/appUtils/data';

interface Row {
  id: number;
  timestamp: string;
  action: string;
  enrichment: {
    name: string;
    icon: string;
  };
}

interface ActionButton {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface NewRowForm {
  action: string;
  enrichment: {
    name: string;
    icon: string;
  };
}

const ActionButton = ({ icon, label, onClick, variant = 'secondary' }: ActionButton) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "px-3 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition-all duration-300",
      variant === 'primary' && "bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25",
      variant === 'secondary' && "bg-white hover:bg-gray-50 border shadow-sm",
      variant === 'danger' && "bg-red-50 text-red-600 hover:bg-red-100"
    )}
  >
    {icon}
    <span>{label}</span>
  </motion.button>
);

const EnhancedDataGrid = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState("table");
  const [autoSave, setAutoSave] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showNewRowForm, setShowNewRowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRowData, setNewRowData] = useState<NewRowForm>({
    action: "",
    enrichment: {
      name: "",
      icon: "🔵",
    },
  });
  const [rows, setRows] = useState<Row[]>(initialRows);

  const handleRowClick = (row: Row) => {
    setSelectedRow(row);
    setModalOpen(true);
  };

  const getStatusBadge = (action: string) => {
    if (action.includes("exceeds")) 
      return (
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="inline-block"
        >
          <Badge className="bg-red-50 text-red-600 hover:bg-red-50">Error</Badge>
        </motion.div>
      );
    if (action.includes("Loading")) 
      return (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="inline-block"
        >
          <Badge variant="secondary">Loading</Badge>
        </motion.div>
      );
    return (
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="inline-block"
      >
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-500 hover:to-emerald-500 text-white">Complete</Badge>
      </motion.div>
    );
  };

  const handleAddNewRow = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newRow = {
      id: rows.length + 1,
      timestamp: new Date().toLocaleString(),
      action: newRowData.action,
      enrichment: newRowData.enrichment,
    };
    
    setRows([...rows, newRow]);
    
    setNewRowData({
      action: "",
      enrichment: {
        name: "",
        icon: "🔵",
      },
    });
    setShowNewRowForm(false);
    setIsSubmitting(false);
  };

  const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {
    const emojis = ["🔵", "🟡", "⚪", "🟢", "🔴"];
    
    return (
      <div className="flex gap-2 items-center">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="text-xl hover:scale-110 transition-transform"
          >
            {emoji}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <motion.div
        initial={{ width: sidebarOpen ? "4rem" : "0rem" }}
        animate={{ width: sidebarOpen ? "4rem" : "0rem" }}
        transition={{ duration: 0.3 }}
        className="bg-white border-r flex flex-col"
      >
        <div className="p-3 border-b">
          <button
            className="w-full h-10 bg-gray-100 rounded-md flex items-center justify-center hover:bg-gray-200"
            title="Toggle Sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Grid className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        {sidebarOpen && (
          <div className="flex-1 flex flex-col gap-2 p-2">
            <button className="p-2 rounded-md hover:bg-gray-100" title="Refresh">
              <RefreshCw className="h-4 w-4 text-gray-600" />
            </button>
            <button
              className="p-2 rounded-md hover:bg-gray-100"
              title="Settings"
            >
              <Settings className="h-4 w-4 text-gray-600" />
            </button>
            <button className="p-2 rounded-md hover:bg-gray-100" title="Layout">
              <Layout className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        )}
        <div className="p-2 border-t">
          <button className="p-2 rounded-md hover:bg-gray-100" title="Table View">
            <Table className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-md"
              title="Toggle Sidebar"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600" />
            </button>
            <span className="text-sm font-medium">Name of the File</span>
          </div>
          <div className="flex items-center gap-3">
            {selectedRows.size > 0 && (
              <span className="text-sm text-gray-600">
                {selectedRows.size} items selected
              </span>
            )}
            <button className="p-2 hover:bg-gray-100 rounded-md">
              <Share2 className="h-4 w-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-md">
              <Download className="h-4 w-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-md text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md">
              <Switch
                checked={autoSave}
                onCheckedChange={setAutoSave}
                className="data-[state=checked]:bg-green-500"
              />
              <span className="text-sm text-gray-600">Auto-save</span>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-md">
              <UserCircle className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium">Bitscale</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto bg-gray-50/50">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            <div className="grid grid-cols-4 gap-4">
              {statsData.map((stat, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={stat.label}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="text-sm text-gray-500">{stat.label}</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold">{stat.value}</span>
                    <span className={cn(
                      "text-xs font-medium",
                      stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'
                    )}>{stat.trend}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 max-w-xl">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search in all columns..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
                      {['table', 'grid'].map((view) => (
                        <motion.button
                          key={view}
                          onClick={() => setViewMode(view)}
                          className={cn(
                            "p-2 rounded-md transition-all duration-300",
                            viewMode === view ? "bg-white shadow-sm" : "hover:bg-white/50"
                          )}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {view === 'table' ? <Table className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                        </motion.button>
                      ))}
                    </motion.div>
                    <ActionButton
                      icon={<Filter className="h-4 w-4" />}
                      label="Filter"
                      variant="secondary"
                    />
                    <ActionButton
                      icon={<PlusCircle className="h-4 w-4" />}
                      label="New Enrichment"
                      variant="primary"
                      onClick={() => setShowNewRowForm(!showNewRowForm)}
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500/20"
                        />
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-sm text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-sm text-gray-500">Action</th>
                      <th className="px-4 py-3 text-left font-medium text-sm text-gray-500">Enrichment</th>
                      <th className="px-4 py-3 text-left font-medium text-sm text-gray-500">Timestamp</th>
                      <th className="px-4 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-50 hover:bg-gray-50/50"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(row.id)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedRows);
                              if (e.target.checked) {
                                newSelected.add(row.id);
                              } else {
                                newSelected.delete(row.id);
                              }
                              setSelectedRows(newSelected);
                              e.stopPropagation();
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(row.action)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {row.action.startsWith("http") ? (
                            <a
                              href={row.action}
                              className="text-blue-500 flex items-center gap-1 hover:underline"
                            >
                              {row.action}
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : (
                            <span
                              className={
                                row.action.includes("exceeds")
                                  ? "text-red-500"
                                  : "text-gray-600"
                              }
                            >
                              {row.action}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{row.enrichment.icon}</span>
                            <span className="text-sm text-gray-600">
                              {row.enrichment.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {row.timestamp}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ActionButton
                            icon={<Play className="h-4 w-4" />}
                            label="Play"
                            onClick={() => handleRowClick(row)}
                            variant="primary"
                          />
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <AnimatePresence>
                {showNewRowForm && (
                  <table className="w-full">
                    <tbody>
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-blue-50/50 border-b border-blue-100"
                      >
                        <td className="px-4 py-3">
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            onClick={() => setShowNewRowForm(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </motion.button>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">New</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={newRowData.action}
                            onChange={(e) => setNewRowData({ ...newRowData, action: e.target.value })}
                            placeholder="Enter action..."
                            className="w-full px-3 py-1.5 rounded-md border-0 bg-white/50 focus:ring-2 focus:ring-blue-500/20"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-4 items-center">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={newRowData.enrichment.name}
                                onChange={(e) => setNewRowData({
                                  ...newRowData,
                                  enrichment: { ...newRowData.enrichment, name: e.target.value }
                                })}
                                placeholder="Enter enrichment name..."
                                className="w-full px-3 py-1.5 rounded-md border-0 bg-white/50 focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>
                            <EmojiPicker
                              onSelect={(emoji) => setNewRowData({
                                ...newRowData,
                                enrichment: { ...newRowData.enrichment, icon: emoji }
                              })}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date().toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAddNewRow}
                            disabled={isSubmitting}
                            className={cn(
                              "px-4 py-2 rounded-md bg-gradient-to-r from-green-500 to-emerald-500 text-white flex items-center gap-2 shadow-lg shadow-green-500/25",
                              isSubmitting && "opacity-75 cursor-not-allowed"
                            )}
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            <span>Save</span>
                          </motion.button>
                        </td>
                      </motion.tr>
                    </tbody>
                  </table>
                )}
              </AnimatePresence>

              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing 1 to 10 of 100 entries
                </div>
                <div className="flex items-center gap-2">
                  {['Previous', '1', '2', '3', '...', '10', 'Next'].map((page) => (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "px-3 py-1 rounded-md text-sm",
                        page === '1' ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
                      )}
                    >
                      {page}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={(open) => setModalOpen(open)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRow?.enrichment.icon} {selectedRow?.enrichment.name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Status</span>
              {selectedRow && getStatusBadge(selectedRow.action)}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Action</span>
              <span className="col-span-3 text-sm">{selectedRow?.action}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Timestamp</span>
              <span className="col-span-3 text-sm">{selectedRow?.timestamp}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedDataGrid;
