'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Plus, Trash2, Search, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/Modal';
import clsx from 'clsx';

export default function InventoryPage() {
    const [medicines, setMedicines] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        batchNumber: '',
        expiryDate: '',
        quantity: 0,
        purchaseDate: '',
        supplierId: '',
        location: '',
    });

    useEffect(() => {
        fetchMedicines();
        fetchSuppliers();
    }, []);

    const fetchMedicines = async () => {
        try {
            const { data } = await api.get('/medicines');
            if (data.success) setMedicines(data.data);
        } catch (e) { console.error(e); }
    };

    const fetchSuppliers = async () => {
        try {
            const { data } = await api.get('/suppliers');
            if (data.success) setSuppliers(data.data);
        } catch (e) { console.error(e); }
    };

    const [file, setFile] = useState<File | null>(null);

    const handleAddMedicine = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formDataPayload = new FormData();
            formDataPayload.append('name', formData.name);
            formDataPayload.append('batchNumber', formData.batchNumber);
            formDataPayload.append('expiryDate', formData.expiryDate);
            formDataPayload.append('quantity', formData.quantity.toString());
            formDataPayload.append('purchaseDate', formData.purchaseDate);
            formDataPayload.append('purchaseDate', formData.purchaseDate);
            formDataPayload.append('supplierId', formData.supplierId);
            formDataPayload.append('location', formData.location);
            if (file) {
                formDataPayload.append('bill', file);
            }

            await api.post('/medicines', formDataPayload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setIsModalOpen(false);
            fetchMedicines();
            setFormData({ name: '', batchNumber: '', expiryDate: '', quantity: 0, purchaseDate: '', supplierId: '', location: '' });
            setFile(null);
        } catch (error) {
            alert('Failed to add medicine');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/medicines/${id}`);
            fetchMedicines();
        } catch (e) { alert('Failed to delete'); }
    };

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Inventory</h1>
                    <p className="text-gray-500">Manage your medicine stock</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} /> Add Medicine
                </button>
            </header>

            <div className="glass-panel p-4">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search medicines..."
                        className="input-field pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">Batch No.</th>
                                <th className="p-4 font-medium">Quantity</th>
                                <th className="p-4 font-medium">Expiry</th>
                                <th className="p-4 font-medium">Supplier</th>
                                <th className="p-4 font-medium">Location</th>
                                <th className="p-4 font-medium">Bill</th>
                                <th className="p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMedicines.map((med) => (
                                <tr key={med.id} className="hover:bg-white/50 transition-colors border-b border-gray-50 last:border-0">
                                    <td className="p-4 font-semibold text-gray-700">{med.name}</td>
                                    <td className="p-4 text-gray-500 font-mono text-xs">{med.batchNumber}</td>
                                    <td className={clsx("p-4 font-bold", med.quantity < 10 ? "text-orange-500" : "text-emerald-600")}>
                                        {med.quantity}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {new Date(med.expiryDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-sky-600">{med.supplier?.name}</td>
                                    <td className="p-4 text-gray-600">{med.location || '-'}</td>
                                    <td className="p-4">
                                        {med.billUrl ? (
                                            <a href={med.billUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-sm hover:text-blue-700">
                                                View Bill
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 text-xs">No Bill</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <button onClick={() => handleDelete(med.id)} className="text-red-400 hover:text-red-600 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredMedicines.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertCircle size={32} />
                                            No medicines found
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Medicine"
            >
                <form onSubmit={handleAddMedicine} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Medicine Name</label>
                        <input required className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Location / Shelf</label>
                        <input className="input-field" placeholder="e.g. Rack A, Shelf 2" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Batch Number</label>
                            <input required className="input-field" value={formData.batchNumber} onChange={e => setFormData({ ...formData, batchNumber: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Quantity</label>
                            <input required type="number" className="input-field" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Purchase Date</label>
                            <input required type="date" className="input-field" value={formData.purchaseDate} onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Expiry Date</label>
                            <input required type="date" className="input-field" value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Supplier</label>
                        <select required className="input-field" value={formData.supplierId} onChange={e => setFormData({ ...formData, supplierId: e.target.value })}>
                            <option value="">Select Supplier</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        {suppliers.length === 0 && <p className="text-xs text-orange-500 mt-1">No suppliers found. Add one in Suppliers tab first.</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium">Upload Bill (Optional)</label>
                        <input type="file" className="input-field p-2" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
                    </div>

                    <button type="submit" className="btn-primary w-full mt-4">Add Medicine</button>
                </form>
            </Modal>
        </div>
    );
}
