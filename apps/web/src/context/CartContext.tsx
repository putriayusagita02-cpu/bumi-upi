'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, MenuItem, CartCustomization, Voucher, OrderType } from '../lib/types';
import { MOCK_VOUCHERS } from '../lib/catalogData';
import { asmrAudioEngine } from '../lib/asmrAudioEngine';

interface CartContextType {
  items: CartItem[];
  tableNumber: string;
  setTableNumber: (table: string) => void;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  addItem: (item: MenuItem, customization?: CartCustomization, quantity?: number) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  setItemQuantity: (cartItemId: string, exactQty: number) => void;
  clearCart: () => void;
  appliedVoucher: Voucher | null;
  applyVoucher: (voucher: Voucher | null) => { success: boolean; message: string };
  removeVoucher: () => void;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  totalItemsCount: number;
  estimatedPoints: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<string>('Meja 04');
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);

  // Restore cart and table from localStorage on mount
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem('bumi_cart');
      if (savedItems) setItems(JSON.parse(savedItems));
      const savedTable = localStorage.getItem('bumi_table');
      if (savedTable) setTableNumber(savedTable);
      const savedOrderType = localStorage.getItem('bumi_order_type') as OrderType;
      if (savedOrderType) setOrderType(savedOrderType);
      const savedVoucherId = localStorage.getItem('bumi_voucher_id');
      if (savedVoucherId) {
        const found = MOCK_VOUCHERS.find((v) => v.id === savedVoucherId);
        if (found) setAppliedVoucher(found);
      }
    } catch {
      // Ignore localStorage parse errors in SSR/test
    }
  }, []);

  // Sync back to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bumi_cart', JSON.stringify(items));
    } catch {}
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('bumi_table', tableNumber);
    } catch {}
  }, [tableNumber]);

  useEffect(() => {
    try {
      localStorage.setItem('bumi_order_type', orderType);
    } catch {}
  }, [orderType]);

  useEffect(() => {
    try {
      if (appliedVoucher) {
        localStorage.setItem('bumi_voucher_id', appliedVoucher.id);
      } else {
        localStorage.removeItem('bumi_voucher_id');
      }
    } catch {}
  }, [appliedVoucher]);

  const addItem = (menuItem: MenuItem, customization: CartCustomization = {}, quantity = 1) => {
    let unitPrice = menuItem.price;
    if (customization.size === 'L' && menuItem.variants) {
      unitPrice = menuItem.variants.sizeL;
    } else if (customization.size === 'M' && menuItem.variants) {
      unitPrice = menuItem.variants.sizeM;
    }

    const cartItemId = `${menuItem.id}-${customization.size || 'std'}-${customization.temp || 'std'}-${encodeURIComponent(customization.notes || '')}`;

    setItems((prev) => {
      const index = prev.findIndex((it) => it.cartItemId === cartItemId);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          quantity: copy[index].quantity + quantity,
        };
        return copy;
      }
      return [
        ...prev,
        {
          cartItemId,
          menuItem,
          quantity,
          unitPrice,
          customization,
        },
      ];
    });

    try {
      asmrAudioEngine.playItemAddedChime();
    } catch {}
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((it) => it.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((it) => {
          if (it.cartItemId === cartItemId) {
            const nextQty = it.quantity + delta;
            return nextQty > 0 ? { ...it, quantity: nextQty } : null;
          }
          return it;
        })
        .filter((it): it is CartItem => it !== null)
    );

    if (delta > 0) {
      try {
        asmrAudioEngine.playItemAddedChime();
      } catch {}
    }
  };

  const setItemQuantity = (cartItemId: string, exactQty: number) => {
    const validQty = Math.max(1, Math.min(999, Math.floor(exactQty)));
    setItems((prev) =>
      prev.map((it) => (it.cartItemId === cartItemId ? { ...it, quantity: validQty } : it))
    );
    try {
      asmrAudioEngine.playItemAddedChime();
    } catch {}
  };

  const clearCart = () => {
    setItems([]);
    setAppliedVoucher(null);
    try {
      localStorage.removeItem('bumi_cart');
      localStorage.removeItem('bumi_voucher_id');
    } catch {}
  };

  // Subtotal calculation
  const subtotal = items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);

  // Discount calculation
  let discountAmount = 0;
  if (appliedVoucher) {
    if (subtotal >= appliedVoucher.minSpend) {
      if (appliedVoucher.discountType === 'nominal') {
        discountAmount = appliedVoucher.discountValue;
      } else if (appliedVoucher.discountType === 'percent') {
        const rawDisc = Math.floor((subtotal * appliedVoucher.discountValue) / 100);
        discountAmount = appliedVoucher.maxDiscount ? Math.min(appliedVoucher.maxDiscount, rawDisc) : rawDisc;
      }
      discountAmount = Math.min(subtotal, discountAmount);
    }
  }

  const applyVoucher = (voucher: Voucher | null) => {
    if (!voucher) {
      setAppliedVoucher(null);
      return { success: true, message: 'Voucher dilepas' };
    }
    if (subtotal < voucher.minSpend) {
      return {
        success: false,
        message: `Minimal belanja Rp ${voucher.minSpend.toLocaleString('id-ID')} untuk menggunakan voucher ini.`,
      };
    }
    setAppliedVoucher(voucher);
    return { success: true, message: `Voucher "${voucher.title}" berhasil dipasang!` };
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    try {
      localStorage.removeItem('bumi_voucher_id');
    } catch {}
  };

  const totalAmount = Math.max(0, subtotal - discountAmount);
  const totalItemsCount = items.reduce((acc, it) => acc + it.quantity, 0);
  const estimatedPoints = Math.floor(totalAmount / 10000);

  return (
    <CartContext.Provider
      value={{
        items,
        tableNumber,
        setTableNumber,
        orderType,
        setOrderType,
        addItem,
        removeItem,
        updateQuantity,
        setItemQuantity,
        clearCart,
        appliedVoucher,
        applyVoucher,
        removeVoucher,
        subtotal,
        discountAmount,
        totalAmount,
        totalItemsCount,
        estimatedPoints,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
