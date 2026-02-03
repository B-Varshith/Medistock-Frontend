'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { ShoppingCart, Plus, Minus, Trash } from 'lucide-react';

export default function BillingPage() {
    const [medicines, setMedicines] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            const { data } = await api.get('/medicines');
            if (data.success) setMedicines(data.data);
        } catch (e) { console.error(e); }
    };

    const addToCart = (medicine: any) => {
        const existing = cart.find(item => item.id === medicine.id);
        if (existing) {
            if (existing.cartQty < medicine.quantity) {
                updateQty(medicine.id, existing.cartQty + 1);
            }
        } else {
            setCart([...cart, { ...medicine, cartQty: 1, sellingPrice: 0 }]); // Assuming price is entered or logic
        }
    };

    const updateQty = (id: string, qty: number) => {
        if (qty < 1) return;
        setCart(cart.map(item => item.id === id ? { ...item, cartQty: qty } : item));
    };

    const updatePrice = (id: string, price: number) => {
        setCart(cart.map(item => item.id === id ? { ...item, sellingPrice: price } : item));
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        try {
            const payload = {
                items: cart.map(item => ({
                    medicineId: item.id,
                    quantity: item.cartQty,
                    price: item.sellingPrice
                }))
            };
            await api.post('/medicines/sell', payload);
            alert('Sale Successful!');
            setCart([]);
            fetchMedicines(); // Refresh stock
        } catch (e) {
            alert('Transaction Failed');
        }
    };

    const totalAmount = cart.reduce((acc, item) => acc + (item.cartQty * item.sellingPrice), 0);

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) && m.quantity > 0
    );

    return (
        <div className="h-[calc(100vh-2rem)] flex gap-6">
            {/* Product Selection */}
            <div className="flex-1 flow-col flex flex-col gap-4">
                <header>
                    <h1 className="text-3xl font-bold">New Bill</h1>
                    <p className="text-gray-500">Select medicines to sell</p>
                </header>
                <input
                    type="text"
                    placeholder="Search medicines..."
                    className="input-field"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex-1 overflow-auto grid grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                    {filteredMedicines.map(med => (
                        <div key={med.id}
                            onClick={() => addToCart(med)}
                            className="glass-panel p-4 cursor-pointer hover:border-sky-400 transition-colors group">
                            <h3 className="font-bold">{med.name}</h3>
                            <div className="flex justify-between text-sm text-gray-500 mt-2">
                                <span>Stock: {med.quantity}</span>
                                <span className="group-hover:text-sky-600 font-medium">Add +</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart Panel */}
            <div className="w-96 glass-panel flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingCart />
                        Current Bill
                    </h2>
                </div>
                <div className="flex-1 overflow-auto p-4 space-y-4">
                    {cart.map(item => (
                        <div key={item.id} className="bg-white/50 p-3 rounded-lg border border-gray-100">
                            <div className="flex justify-between mb-2">
                                <span className="font-medium">{item.name}</span>
                                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                                    <Trash size={16} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateQty(item.id, item.cartQty - 1)} className="p-1 hover:bg-gray-200 rounded"><Minus size={14} /></button>
                                    <span className="text-sm font-bold w-4 text-center">{item.cartQty}</span>
                                    <button onClick={() => updateQty(item.id, item.cartQty + 1)} className="p-1 hover:bg-gray-200 rounded"><Plus size={14} /></button>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        className="w-16 p-1 text-sm border rounded bg-white"
                                        placeholder="Price"
                                        value={item.sellingPrice}
                                        onChange={(e) => updatePrice(item.id, Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="text-center text-gray-400 mt-10">Cart is empty</div>
                    )}
                </div>
                <div className="p-6 border-t border-gray-100 bg-white/30">
                    <div className="flex justify-between text-lg font-bold mb-4">
                        <span>Total</span>
                        <span>₹{totalAmount}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Complete Sale
                    </button>
                </div>
            </div>
        </div>
    );
}
