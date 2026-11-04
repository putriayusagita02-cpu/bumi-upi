// apps/web/src/components/SplitBillModal.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Users,
  QrCode,
  CheckCircle2,
  WhatsApp,
  Share2,
  Check,
  Utensils,
  Sparkles,
} from './icons';
import { asmrAudioEngine } from '../lib/asmrAudioEngine';

export interface SplitBillItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  size?: string;
  temp?: string;
}

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber?: string;
  tableNumber?: string;
  items: SplitBillItem[];
  finalAmount: number;
  subtotal?: number;
  discountAmount?: number;
}

interface Participant {
  id: string;
  name: string;
  isPaid: boolean;
}

export const SplitBillModal: React.FC<SplitBillModalProps> = ({
  isOpen,
  onClose,
  orderNumber = 'BU-ORD-SAMPLE',
  tableNumber = 'Meja 01',
  items,
  finalAmount,
  subtotal = finalAmount,
  discountAmount = 0,
}) => {
  const [splitMode, setSplitMode] = useState<'equal' | 'itemized'>('equal');
  const [personCount, setPersonCount] = useState<number>(3);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 'p-1', name: 'Saya (Tuan Meja)', isPaid: false },
    { id: 'p-2', name: 'Teman 1', isPaid: false },
    { id: 'p-3', name: 'Teman 2', isPaid: false },
  ]);

  // For Itemized split: Map of itemIndex -> string[] of participant IDs
  const [itemAssignments, setItemAssignments] = useState<Record<number, string[]>>({});

  // Active individual QRIS preview modal
  const [selectedQrisPerson, setSelectedQrisPerson] = useState<{
    id: string;
    name: string;
    amount: number;
  } | null>(null);

  const [copiedText, setCopiedText] = useState(false);
  const [celebrated, setCelebrated] = useState(false);

  // Sync participants when personCount changes in 'equal' mode
  const handleCountChange = (count: number) => {
    const validCount = Math.max(2, Math.min(10, count));
    setPersonCount(validCount);

    setParticipants((prev) => {
      const updated: Participant[] = [];
      for (let i = 0; i < validCount; i++) {
        if (prev[i]) {
          updated.push(prev[i]);
        } else {
          updated.push({
            id: `p-${i + 1}`,
            name: i === 0 ? 'Saya (Tuan Meja)' : `Teman ${i}`,
            isPaid: false,
          });
        }
      }
      return updated;
    });
  };

  // Equal split calculations
  const equalShareList = useMemo(() => {
    const count = participants.length || 1;
    const baseShare = Math.floor(finalAmount / count);
    const remainder = finalAmount - baseShare * count;

    return participants.map((p, idx) => {
      // Add remainder to the first person so exact sum equals finalAmount
      const amount = idx === 0 ? baseShare + remainder : baseShare;
      return {
        ...p,
        shareAmount: amount,
      };
    });
  }, [participants, finalAmount]);

  // Itemized calculations
  const itemizedShareList = useMemo(() => {
    const count = participants.length;
    if (count === 0) return [];

    // Initialize totals
    const personRawTotals: Record<string, number> = {};
    participants.forEach((p) => {
      personRawTotals[p.id] = 0;
    });

    items.forEach((item, itemIdx) => {
      const assigned = itemAssignments[itemIdx] || [];
      const itemTotal = item.unitPrice * item.quantity;

      if (assigned.length > 0) {
        const splitCost = itemTotal / assigned.length;
        assigned.forEach((pid) => {
          if (personRawTotals[pid] !== undefined) {
            personRawTotals[pid] += splitCost;
          }
        });
      } else {
        // If unassigned, split equally among all
        const perPerson = itemTotal / count;
        participants.forEach((p) => {
          personRawTotals[p.id] += perPerson;
        });
      }
    });

    const totalRaw = Object.values(personRawTotals).reduce((a, b) => a + b, 0) || 1;

    // Apply proportional finalAmount (handles discounts / taxes correctly)
    return participants.map((p) => {
      const ratio = personRawTotals[p.id] / totalRaw;
      const calculatedShare = Math.round(finalAmount * ratio);
      return {
        ...p,
        shareAmount: calculatedShare,
      };
    });
  }, [participants, items, itemAssignments, finalAmount]);

  const activeShareList = splitMode === 'equal' ? equalShareList : itemizedShareList;

  // Total collected and completion check
  const totalPaid = useMemo(() => {
    return activeShareList
      .filter((p) => p.isPaid)
      .reduce((sum, p) => sum + p.shareAmount, 0);
  }, [activeShareList]);

  const allPaid = activeShareList.length > 0 && activeShareList.every((p) => p.isPaid);
  const percentCollected = Math.min(100, Math.round((totalPaid / (finalAmount || 1)) * 100));

  // Trigger sound when all are paid
  useEffect(() => {
    if (allPaid && !celebrated) {
      setCelebrated(true);
      asmrAudioEngine.playCelebrationChime();
    } else if (!allPaid) {
      setCelebrated(false);
    }
  }, [allPaid, celebrated]);

  // Toggle paid status
  const togglePaid = (id: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isPaid: !p.isPaid } : p))
    );
  };

  // Update participant name
  const updateName = (id: string, newName: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName } : p))
    );
  };

  // Toggle item assignment for itemized mode
  const toggleItemAssignment = (itemIdx: number, pid: string) => {
    setItemAssignments((prev) => {
      const current = prev[itemIdx] || [];
      const exists = current.includes(pid);
      const updated = exists ? current.filter((id) => id !== pid) : [...current, pid];
      return { ...prev, [itemIdx]: updated };
    });
  };

  // Copy breakdown message or send to WhatsApp
  const generateMessageText = () => {
    const listStr = activeShareList
      .map(
        (p) =>
          `${p.isPaid ? '✅' : '⏳'} *${p.name}*: Rp ${p.shareAmount.toLocaleString('id-ID')} (${p.isPaid ? 'LUNAS' : 'Belum Bayar'})`
      )
      .join('\n');

    return `🍽️ *PATUNGAN MAKAN DI BUMI UPI GARUT*
📍 Tempat Santap: ${tableNumber}
📜 No. Pesanan: ${orderNumber}
💰 Total Tagihan Meja: Rp ${finalAmount.toLocaleString('id-ID')}
${discountAmount > 0 ? `🎁 Hemat Diskon: Rp ${discountAmount.toLocaleString('id-ID')}\n` : ''}
*Rincian Tagihan Tiap Orang:*
${listStr}

📊 *Status Meja:* Rp ${totalPaid.toLocaleString('id-ID')} / Rp ${finalAmount.toLocaleString('id-ID')} (${percentCollected}% Terkumpul)
${allPaid ? '🎉 Seluruh tagihan meja sudah lunas!' : 'Silakan selesaikan pembayaran ke kasir atau via QRIS.'}

_Hatur nuhun sadayana! Mugi janten barokah._ 🙏`;
  };

  const handleCopyText = () => {
    const text = generateMessageText();
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2200);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateMessageText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B2625]/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-[#FBF7EE] rounded-3xl border border-[#E8DCC2] shadow-2xl flex flex-col overflow-hidden text-[#2B2625]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#3E4F30] to-[#2D3B23] text-[#F5EEDC] flex items-center justify-between border-b-2 border-[#D4A24C]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4A24C] text-[#2B2625] flex items-center justify-center text-xl font-bold shadow-sm">
              💳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className="font-serif text-lg font-bold text-white tracking-wide"
                  style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
                >
                  Split Bill Meja & Patungan QRIS
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4A24C] text-[#2B2625] font-black uppercase">
                  Instan
                </span>
              </div>
              <p className="text-xs text-[#D8E6D2]">
                {tableNumber} • {orderNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-3 bg-[#EFE4CB]/60 border-b border-[#E8DCC2] flex gap-2">
          <button
            type="button"
            onClick={() => setSplitMode('equal')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              splitMode === 'equal'
                ? 'bg-[#3E4F30] text-[#F5EEDC] shadow-xs'
                : 'bg-white/60 text-[#634E3F] hover:bg-white'
            }`}
          >
            <span>⚖️ Bagi Rata (Sama Rata)</span>
          </button>
          <button
            type="button"
            onClick={() => setSplitMode('itemized')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              splitMode === 'itemized'
                ? 'bg-[#B4532A] text-white shadow-xs'
                : 'bg-white/60 text-[#634E3F] hover:bg-white'
            }`}
          >
            <span>📝 Pilih per Menu (By Item)</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Progress Bar Summary Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#E8DCC2] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#634E3F] flex items-center gap-1.5">
                <span>📊 Status Terkumpul:</span>
                <span className="text-[#3E4F30] font-black">{percentCollected}%</span>
              </span>
              <span className="font-mono text-xs font-bold text-[#2B2625]">
                Rp {totalPaid.toLocaleString('id-ID')} /{' '}
                <span className="text-[#B4532A]">Rp {finalAmount.toLocaleString('id-ID')}</span>
              </span>
            </div>

            <div className="w-full h-3 bg-[#E8DCC2]/60 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  allPaid
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                    : 'bg-gradient-to-r from-[#D4A24C] to-[#3E4F30]'
                }`}
                style={{ width: `${percentCollected}%` }}
              />
            </div>

            {/* Celebration Badge if 100% */}
            {allPaid && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-bounce">
                <span className="text-lg">🎉</span>
                <span>
                  <strong>Hatur Nuhun!</strong> Seluruh patungan meja telah lunas. Meja Anda bebas tagihan!
                </span>
              </div>
            )}
          </div>

          {/* Equal Split Mode Controls */}
          {splitMode === 'equal' && (
            <div className="space-y-4">
              {/* Number of People Stepper */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F5EEDC] border border-[#E8DCC2]">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#2B2625] block">
                    Jumlah Orang Patungan:
                  </span>
                  <span className="text-[11px] text-[#634E3F]">
                    Rp {Math.floor(finalAmount / personCount).toLocaleString('id-ID')} per orang
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCountChange(personCount - 1)}
                    disabled={personCount <= 2}
                    className="w-8 h-8 rounded-xl bg-white border border-[#D4A24C] text-[#2B2625] font-bold disabled:opacity-40 hover:bg-[#FDF7EE]"
                  >
                    -
                  </button>
                  <span className="font-mono font-black text-sm px-2 text-[#3E4F30]">
                    {personCount} orang
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCountChange(personCount + 1)}
                    disabled={personCount >= 10}
                    className="w-8 h-8 rounded-xl bg-white border border-[#D4A24C] text-[#2B2625] font-bold disabled:opacity-40 hover:bg-[#FDF7EE]"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* People Cards Grid */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7767] block">
                  Daftar Pembayar & QRIS Mandiri:
                </span>

                {activeShareList.map((person, idx) => (
                  <div
                    key={person.id}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      person.isPaid
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-white border-[#E8DCC2]'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          person.isPaid
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#3E4F30] text-[#F5EEDC]'
                        }`}
                      >
                        {person.isPaid ? '✓' : idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={person.name}
                          onChange={(e) => updateName(person.id, e.target.value)}
                          className="font-bold text-xs text-[#2B2625] bg-transparent border-b border-dashed border-[#D4A24C]/40 hover:border-[#D4A24C] focus:outline-none focus:border-[#3E4F30] w-full"
                          placeholder="Nama Teman"
                        />
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs font-black text-[#B4532A]">
                            Rp {person.shareAmount.toLocaleString('id-ID')}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                              person.isPaid
                                ? 'bg-emerald-200 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {person.isPaid ? 'Lunas' : 'Menunggu'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedQrisPerson({
                            id: person.id,
                            name: person.name,
                            amount: person.shareAmount,
                          })
                        }
                        className="p-2 rounded-xl bg-[#F5EEDC] text-[#3E4F30] hover:bg-[#E8DCC2] border border-[#D4A24C]/40 transition"
                        title="Tampilkan QRIS Khusus Orang Ini"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => togglePaid(person.id)}
                        className={`py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs ${
                          person.isPaid
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-[#3E4F30] text-[#F5EEDC] hover:brightness-110 active:scale-95'
                        }`}
                      >
                        {person.isPaid ? 'Lunas ✓' : 'Bayar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Itemized Split Mode Controls */}
          {splitMode === 'itemized' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 leading-relaxed">
                💡 <strong>Tips Bagi Menu:</strong> Centang siapa saja teman yang memesan atau ikut mencicipi tiap hidangan. Jika 1 porsi dibagi 2 orang, biayanya otomatis dibagi dua rata!
              </div>

              {/* Items List with Checkboxes */}
              <div className="space-y-3">
                {items.map((item, itemIdx) => {
                  const assigned = itemAssignments[itemIdx] || [];
                  const isAssignedToAll = assigned.length === 0;

                  return (
                    <div
                      key={itemIdx}
                      className="p-3.5 rounded-2xl bg-white border border-[#E8DCC2] shadow-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#E8DCC2]/60">
                        <div>
                          <p className="font-bold text-[#2B2625]">
                            {item.quantity}x {item.itemName}
                          </p>
                          {item.notes && (
                            <p className="text-[10px] text-[#8C7767] italic">&quot;{item.notes}&quot;</p>
                          )}
                        </div>
                        <span className="font-mono font-bold text-[#B4532A]">
                          Rp {(item.unitPrice * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>

                      {/* Participant Assignment Pills */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-[#8C7767] font-semibold block">
                          Siapa yang menyantap ini?
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {participants.map((p) => {
                            const isChecked = assigned.includes(p.id);
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => toggleItemAssignment(itemIdx, p.id)}
                                className={`text-[11px] py-1 px-2.5 rounded-xl border transition flex items-center gap-1.5 ${
                                  isChecked
                                    ? 'bg-[#3E4F30] text-white border-[#3E4F30] font-bold shadow-2xs'
                                    : 'bg-[#FDF7EE] text-[#634E3F] border-[#E8DCC2] hover:bg-[#F5EEDC]'
                                }`}
                              >
                                <span>{isChecked ? '✓' : '+'}</span>
                                <span>{p.name.split(' ')[0]}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Itemized Person Totals Summary */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7767] block">
                  Total Tagihan Tiap Orang (Sesuai Porsi):
                </span>
                {activeShareList.map((p) => (
                  <div
                    key={p.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between ${
                      p.isPaid ? 'bg-emerald-50/70 border-emerald-300' : 'bg-white border-[#E8DCC2]'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs text-[#2B2625]">{p.name}</span>
                      <p className="font-mono text-xs font-bold text-[#B4532A]">
                        Rp {p.shareAmount.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedQrisPerson({
                            id: p.id,
                            name: p.name,
                            amount: p.shareAmount,
                          })
                        }
                        className="p-2 rounded-xl bg-[#F5EEDC] text-[#3E4F30] border border-[#D4A24C]/40"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePaid(p.id)}
                        className={`py-1.5 px-3 rounded-xl text-xs font-bold transition ${
                          p.isPaid
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#3E4F30] text-white hover:brightness-110'
                        }`}
                      >
                        {p.isPaid ? 'Lunas ✓' : 'Bayar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions: WhatsApp & Copy */}
        <div className="p-4 bg-[#F5EEDC] border-t border-[#E8DCC2] flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
          >
            <WhatsApp className="w-4 h-4" />
            <span>Kirim Rincian ke WhatsApp Group</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-[#D4A24C] bg-white text-[#2B2625] text-xs font-semibold hover:bg-[#FDF7EE] transition flex items-center justify-center gap-1.5"
          >
            {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedText ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>
        </div>
      </div>

      {/* Individual Person QRIS Modal Preview */}
      {selectedQrisPerson && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-white rounded-3xl p-6 text-center space-y-4 shadow-2xl border-2 border-[#D4A24C] animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7767]">
                QRIS Patungan Mandiri
              </span>
              <button
                type="button"
                onClick={() => setSelectedQrisPerson(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs text-[#634E3F]">Bagian Pembayaran:</p>
              <h4 className="font-serif text-lg font-bold text-[#2B2625]">
                {selectedQrisPerson.name}
              </h4>
              <p className="font-mono text-xl font-black text-[#B4532A] mt-1">
                Rp {selectedQrisPerson.amount.toLocaleString('id-ID')}
              </p>
            </div>

            {/* Stylized QR Box */}
            <div className="p-4 bg-[#FBF7EE] rounded-2xl border-2 border-dashed border-[#D4A24C] flex flex-col items-center justify-center space-y-2">
              <div className="w-40 h-40 bg-white p-2 rounded-xl shadow-xs border border-gray-200 flex items-center justify-center">
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#2B2625]">
                  <rect width="100" height="100" fill="white" />
                  {/* Outer position detection corners */}
                  <rect x="5" y="5" width="28" height="28" fill="#2B2625" />
                  <rect x="9" y="9" width="20" height="20" fill="white" />
                  <rect x="13" y="13" width="12" height="12" fill="#2B2625" />

                  <rect x="67" y="5" width="28" height="28" fill="#2B2625" />
                  <rect x="71" y="9" width="20" height="20" fill="white" />
                  <rect x="75" y="13" width="12" height="12" fill="#2B2625" />

                  <rect x="5" y="67" width="28" height="28" fill="#2B2625" />
                  <rect x="9" y="71" width="20" height="20" fill="white" />
                  <rect x="13" y="75" width="12" height="12" fill="#2B2625" />

                  {/* Simulated QR matrix elements */}
                  <rect x="40" y="8" width="8" height="8" fill="#3E4F30" />
                  <rect x="52" y="8" width="6" height="6" fill="#2B2625" />
                  <rect x="40" y="22" width="10" height="10" fill="#2B2625" />
                  <rect x="8" y="40" width="12" height="6" fill="#2B2625" />
                  <rect x="25" y="40" width="8" height="8" fill="#3E4F30" />
                  <rect x="40" y="40" width="20" height="20" fill="#D4A24C" rx="4" />
                  <rect x="68" y="40" width="10" height="8" fill="#2B2625" />
                  <rect x="85" y="40" width="8" height="12" fill="#2B2625" />
                  <rect x="40" y="68" width="8" height="12" fill="#2B2625" />
                  <rect x="54" y="68" width="10" height="8" fill="#3E4F30" />
                  <rect x="68" y="68" width="12" height="12" fill="#2B2625" />
                  <rect x="85" y="75" width="8" height="15" fill="#2B2625" />
                </svg>
              </div>
              <span className="text-[10px] text-[#8C7767] font-semibold">
                NMID: ID1029384758291 • Garut
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                togglePaid(selectedQrisPerson.id);
                setSelectedQrisPerson(null);
              }}
              className="w-full py-2.5 rounded-xl bg-[#3E4F30] hover:brightness-110 text-[#F5EEDC] text-xs font-bold transition shadow-xs"
            >
              Simulasi Selesai Bayar (Konfirmasi)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
