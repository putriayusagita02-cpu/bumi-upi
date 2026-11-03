'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  ShieldAlert,
  Clock,
  User,
  CheckCircle,
  RefreshCw,
  Download
} from 'lucide-react';
import { adminStore, AuditLogItem } from '../../lib/adminStore';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const refreshLogs = () => {
    adminStore.loadFromStorage();
    setLogs([...adminStore.logs]);
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchAction = actionFilter === 'all' || log.action === actionFilter;
      const matchSearch =
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.targetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.timestamp.toLowerCase().includes(searchQuery.toLowerCase());
      return matchAction && matchSearch;
    });
  }, [logs, actionFilter, searchQuery]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE_ORDER':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'UPDATE_ORDER_STATUS':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'UPDATE_STOCK':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'AUTH_LOGIN':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'REDEEM_VOUCHER':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-krem-border shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <ScrollText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-kopi">
              Buku Besar Audit Log (Audit Trail Viewer)
            </h2>
            <p className="text-xs text-kopi-muted font-sans">
              Rekam jejak kepatuhan kronologis aktivitas kasir, pemotongan stok, otentikasi peran, dan penggunaan voucher
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshLogs}
            className="p-2 rounded-xl bg-krem hover:bg-krem-dark text-kopi-muted border border-krem-border"
            title="Muat Ulang Log"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => alert('Laporan audit diekspor untuk tinjauan akuntabilitas akademik!')}
            className="px-3.5 py-1.5 rounded-xl border border-krem-border bg-krem-surface hover:bg-krem text-xs font-semibold text-kopi flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-terakota" />
            <span>Unduh Laporan Audit</span>
          </button>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white p-4 rounded-2xl border border-krem-border shadow-xs space-y-3">
        {/* Search & Actions Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-kopi-subtle absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari log (nomor transaksi, nama staf, detail aksi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-krem-surface border border-krem-border rounded-xl text-kopi focus:outline-none focus:ring-1 focus:ring-olive"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-kopi-muted" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-krem-surface border border-krem-border rounded-xl px-2.5 py-1.5 text-kopi"
            >
              <option value="all">Semua Tipe Aksi</option>
              <option value="CREATE_ORDER">Transaksi Pesanan Baru (CREATE_ORDER)</option>
              <option value="UPDATE_ORDER_STATUS">Status Dapur KDS (UPDATE_ORDER_STATUS)</option>
              <option value="UPDATE_STOCK">Pembaruan Stok (UPDATE_STOCK)</option>
              <option value="AUTH_LOGIN">Otentikasi Staf (AUTH_LOGIN)</option>
            </select>
          </div>
        </div>

        {/* Timeline Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-krem-surface border-b border-krem-border text-kopi-muted font-serif">
                <th className="py-2.5 px-3 font-bold">Waktu (WIB)</th>
                <th className="py-2.5 px-3 font-bold">Jenis Aksi</th>
                <th className="py-2.5 px-3 font-bold">Staf Penanggung Jawab</th>
                <th className="py-2.5 px-3 font-bold">Target ID</th>
                <th className="py-2.5 px-3 font-bold">Keterangan / Rincian Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-krem-border">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-kopi-subtle">
                    Tidak ada aktivitas yang tercatat sesuai kriteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-krem-surface/50 transition">
                    <td className="py-2.5 px-3 font-mono text-kopi-muted whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-terakota" />
                        <span>{log.timestamp}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-kopi flex items-center gap-1">
                        <User className="w-3 h-3 text-olive" />
                        <span>{log.staffName}</span>
                      </div>
                      <div className="text-[10px] text-kopi-subtle font-mono">{log.staffId}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-olive-900 font-medium">
                      {log.targetId}
                    </td>
                    <td className="py-2.5 px-3 text-kopi font-sans">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
