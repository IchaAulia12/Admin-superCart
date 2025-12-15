import React from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { cashierStyle } from '../../styles/cashierStyle';
import { Product, formatRupiah } from './dashboard';

const TrashIcon = () => <Text style={{ fontSize: 18 }}>🗑️</Text>;

interface ProductListProps {
  products: Product[];
  totalItems: number;
  totalAmount: number;
  onUpdateQty: (id: string, newQty: number) => void;
  onRemoveProduct: (id: string) => void;
  onCheckout: () => void;
}

export default function ProductList({
  products,
  totalItems,
  totalAmount,
  onUpdateQty,
  onRemoveProduct,
  onCheckout,
}: ProductListProps) {
  return (
    <>
      {/* Summary Card */}
      <View style={cashierStyle.summaryCard}>
        <View style={cashierStyle.summaryRow}>
          <Text style={cashierStyle.summaryLabel}>Total Item:</Text>
          <Text style={cashierStyle.summaryValue}>{totalItems}</Text>
        </View>
        <View style={cashierStyle.totalContainer}>
          <View style={cashierStyle.summaryRow}>
            <Text style={cashierStyle.totalLabel}>TOTAL BELANJA</Text>
            <Text style={cashierStyle.totalAmount}>{formatRupiah(totalAmount)}</Text>
          </View>
        </View>
      </View>

      {/* Products Table */}
      <View style={cashierStyle.tableContainer}>
        <View style={cashierStyle.tableHeader}>
          <Text style={[cashierStyle.tableHeaderCell, cashierStyle.colId]}>ID</Text>
          <Text style={[cashierStyle.tableHeaderCell, cashierStyle.colName]}>
            Nama Produk
          </Text>
          <Text style={[cashierStyle.tableHeaderCell, cashierStyle.colQty]}>Qty</Text>
          <Text style={[cashierStyle.tableHeaderCell, cashierStyle.colPrice]}>
            Harga Satuan
          </Text>
          <Text style={[cashierStyle.tableHeaderCell, cashierStyle.colTotal]}>
            Total Harga
          </Text>
          <Text style={[cashierStyle.tableHeaderCell, cashierStyle.colAction]}>Aksi</Text>
        </View>

        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={cashierStyle.tableRow}>
              <Text style={[cashierStyle.tableCell, cashierStyle.colId]}>{item.id}</Text>
              <Text style={[cashierStyle.tableCell, cashierStyle.colName]}>
                {item.name}
              </Text>
              <View style={[cashierStyle.colQty, { alignItems: 'center' }]}>
                <View style={cashierStyle.qtyContainer}>
                  <TouchableOpacity
                    style={cashierStyle.qtyButton}
                    onPress={() => onUpdateQty(item.id, item.qty - 1)}
                  >
                    <Text style={cashierStyle.qtyButtonText}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={cashierStyle.qtyInput}
                    value={item.qty.toString()}
                    onChangeText={(text) =>
                      onUpdateQty(item.id, parseInt(text) || 1)
                    }
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={cashierStyle.qtyButton}
                    onPress={() => onUpdateQty(item.id, item.qty + 1)}
                  >
                    <Text style={cashierStyle.qtyButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[cashierStyle.tableCell, cashierStyle.colPrice]}>
                {formatRupiah(item.price)}
              </Text>
              <Text
                style={[
                  cashierStyle.tableCell,
                  cashierStyle.tableCellBold,
                  cashierStyle.colTotal,
                ]}
              >
                {formatRupiah(item.price * item.qty)}
              </Text>
              <View style={[cashierStyle.colAction, { alignItems: 'center' }]}>
                <TouchableOpacity
                  style={cashierStyle.deleteButton}
                  onPress={() => onRemoveProduct(item.id)}
                >
                  <TrashIcon />
                </TouchableOpacity>
              </View>
            </View>
          )}
          scrollEnabled={false}
        />
      </View>

      {/* Checkout Button */}
      <TouchableOpacity
        style={cashierStyle.checkoutButton}
        onPress={onCheckout}
      >
        <Text style={cashierStyle.checkoutButtonText}>Pilih Pembayaran</Text>
      </TouchableOpacity>
    </>
  );
}