'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Plus, User, Phone, MapPin, Trash2 } from 'lucide-react';
import { Modal } from '@/components/Modal';

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const { data } = await api.get('/suppliers');
            if (data.success) setSuppliers(data.data);
        } catch (e) { console.error(e); }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/suppliers', formData);
            setIsModalOpen(false);
            setFormData({ name: '', phone: '', address: '' });
            fetchSuppliers();
        } catch (e) { alert('Failed to add supplier'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) return;
        try {
            await api.delete(`/suppliers/${id}`);
            fetchSuppliers();
        } catch (e) { alert('Failed to delete supplier'); }
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Suppliers</h1>
                    <p className="text-gray-500">Manage your medicine distributors</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} /> Add Supplier
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map(supplier => (
                    <div key={supplier.id} className="glass-panel p-6 flex flex-col gap-4 relative group">
                        <button
                            onClick={() => handleDelete(supplier.id)}
                            className="absolute top-4 right-4 text-red-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete Supplier"
                        >
                            <Trash2 size={18} />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="bg-sky-100 text-sky-600 p-3 rounded-full">
                                <User size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{supplier.name}</h3>
                                <p className="text-xs text-gray-500">ID: {supplier.id.slice(0, 8)}</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Phone size={16} className="text-gray-400" />
                                {supplier.phone || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-gray-400" />
                                {supplier.address || 'N/A'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Supplier">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Name</label>
                        <input required className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Phone</label>
                        <input className="input-field" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Address</label>
                        <input className="input-field" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    </div>
                    <button type="submit" className="btn-primary w-full mt-4">Save Supplier</button>
                </form>
            </Modal>
        </div>
    );
}
