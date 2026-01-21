import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, ArrowLeft, Download, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../config';

interface HEVRecord {
    id: number;
    patient_id: string;
    first_name: string;
    second_name: string;
    civil_id: string;
    reporting_date: string; // ISO string from DB
    outcome: string;
    final_outcome: string;
}

const HEVListing: React.FC = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState<HEVRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const initAndFetch = async () => {
            const token = localStorage.getItem('token');
            // Try to init table (silent fail is ok if it exists)
            try {
                await fetch(`${API_BASE_URL}/hev-notifications/init-table`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (e) {
                console.warn('Table init warning:', e);
            }
            fetchRecords();
        };
        initAndFetch();
    }, []);

    const fetchRecords = async (searchTerm = '') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = searchTerm
                ? `${API_BASE_URL}/hev-notifications?search=${encodeURIComponent(searchTerm)}`
                : `${API_BASE_URL}/hev-notifications`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setRecords(data.notifications || []);
            } else {
                console.error('Failed to fetch records');
            }
        } catch (error) {
            console.error('Error fetching HEV records:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchRecords(search);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                            <ArrowLeft className="w-4 h-4 cursor-pointer hover:text-slate-800" onClick={() => navigate('/dashboard')} />
                            <span>Notifications</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">HEV Reports</h1>
                        <p className="text-slate-500">Manage and track Hepatitis E Virus notifications</p>
                    </div>

                    <div className="flex gap-3">
                         <button 
                            onClick={() => navigate('/hev-notification/entry')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-sm shadow-blue-200 hover:shadow-blue-300 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Notification</span>
                        </button>
                    </div>
                </div>

                {/* Filters & Search - Simplified for HEV */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by name, ID or civil ID..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors">
                            Search
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Info</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">IDs</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reporting Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-500">
                                            <div className="flex justify-center items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Loading records...
                                            </div>
                                        </td>
                                    </tr>
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-500">
                                            No HEV notifications found
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((record) => (
                                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                        {record.first_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900">
                                                            {record.first_name} {record.second_name}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            File ID: {record.patient_id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-slate-700">{record.civil_id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-slate-600">
                                                    {record.reporting_date ? new Date(record.reporting_date).toLocaleDateString() : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    record.outcome === 'Recovered' ? 'bg-green-100 text-green-800' :
                                                    record.outcome === 'Died' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {record.outcome || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HEVListing;
