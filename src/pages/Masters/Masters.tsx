import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Grid3x3, 
  Monitor, 
  GraduationCap, 
  Briefcase, 
  Globe,
  Building,
  MapPin,
  Flag,
  Share,
  Syringe,
  ClipboardList,
  Search,
  Plus,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import RoleModal from '../../components/RoleModal';
import CategoryModal from '../../components/CategoryModal';

interface Master {
  id: string;
  name: string;
  icon: string;
  description?: string;
  count?: number;
}

const API_URL = import.meta.env.VITE_API_URL;

const Masters: React.FC = () => {
  const [masters, setMasters] = useState<Master[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMasters, setFilteredMasters] = useState<Master[]>([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    fetchMasters();
  }, []);

  useEffect(() => {
    const filtered = masters.filter(master =>
      master.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMasters(filtered);
  }, [masters, searchTerm]);

  const fetchMasters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/masters`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Add descriptions and counts for better UI
        const enhancedData = data.map((master: Master) => ({
          ...master,
          description: getDescription(master.name),
          count: Math.floor(Math.random() * 100) + 10
        }));
        setMasters(enhancedData);
      }
    } catch (error) {
      console.error('Error fetching masters:', error);
    }
  };

  const handleMasterClick = (masterId: string) => {
    switch (masterId) {
      case 'role':
        setShowRoleModal(true);
        break;
      case 'category':
        setShowCategoryModal(true);
        break;
      default:
        // Handle other masters
        console.log(`Clicked on ${masterId}`);
        break;
    }
  };

  const handleRoleSubmit = async (roleData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData)
      });

      if (response.ok) {
        console.log('Role added successfully');
        // Optionally refresh data or show success message
      }
    } catch (error) {
      console.error('Error adding role:', error);
    }
  };

  const handleCategorySubmit = async (categoryData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      });

      if (response.ok) {
        console.log('Category added successfully');
        // Optionally refresh data or show success message
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const getDescription = (name: string): string => {
    const descriptions: { [key: string]: string } = {
      'Role': 'User roles and permissions',
      'Category': 'Classification categories',
      'Dose Number': 'Vaccination dose tracking',
      'Education': 'Educational qualifications',
      'Governorate': 'Administrative regions',
      'Wilayat': 'Sub-administrative areas',
      'Governorate vaccinated': 'Vaccination coverage areas',
      'Institution': 'Healthcare institutions',
      'Institution/Place of vaccination': 'Vaccination sites',
      'Nationality': 'Patient nationalities',
      'Occupation': 'Professional categories',
      'Source': 'Data source references',
      'Site of Injection': 'Injection site locations',
      'Treatment': 'Treatment protocols',
      'Vaccine Manufacturer': 'Vaccine producers',
      'Vaccine Name': 'Vaccine types',
      'Vaccine Type': 'Vaccine classifications',
      'Vaccination Unit': 'Vaccination departments'
    };
    return descriptions[name] || 'Master data management';
  };

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      users: Users,
      grid: Grid3x3,
      monitor: Monitor,
      'graduation-cap': GraduationCap,
      briefcase: Briefcase,
      globe: Globe,
      building: Building,
      'map-pin': MapPin,
      flag: Flag,
      share: Share,
      syringe: Syringe,
      'clipboard-list': ClipboardList
    };
    return icons[iconName] || Users;
  };

  const getIconColor = (index: number): string => {
    const colors = [
      'text-blue-500 bg-blue-50',
      'text-purple-500 bg-purple-50',
      'text-green-500 bg-green-50',
      'text-orange-500 bg-orange-50',
      'text-red-500 bg-red-50',
      'text-indigo-500 bg-indigo-50',
      'text-pink-500 bg-pink-50',
      'text-cyan-500 bg-cyan-50',
      'text-yellow-500 bg-yellow-50',
      'text-emerald-500 bg-emerald-50',
      'text-violet-500 bg-violet-50',
      'text-rose-500 bg-rose-50'
    ];
    return colors[index % colors.length];
  };

  return (
    <>
      <div className="space-y-8">
      {/* Header */}
      {/* <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Master Data Management</h1>
          <p className="text-slate-600 mt-2">Configure and manage system reference data</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4"> */}
          {/* Search */}
          {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search masters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full sm:w-80"
            />
          </div> */}
          
          {/* Action Buttons */}
          {/* <div className="flex gap-3">
            <button className="btn btn-outline">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className="btn btn-primary">
              <Plus className="h-4 w-4" />
              Add Master
            </button>
          </div>
        </div>
      </div> */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Masters</p>
              <p className="text-2xl font-bold text-slate-900">{masters.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Grid3x3 className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Records</p>
              <p className="text-2xl font-bold text-slate-900">1,247</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Categories</p>
              <p className="text-2xl font-bold text-slate-900">8</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Building className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Last Updated</p>
              <p className="text-2xl font-bold text-slate-900">Today</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <Monitor className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Masters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMasters.map((master, index) => {
          const Icon = getIcon(master.icon);
          const colorClass = getIconColor(index);
          const [iconColor, bgColor] = colorClass.split(' ');
          
          return (
            <div
              key={master.id}
              className="card group cursor-pointer hover:shadow-xl transition-all duration-300 animate-slide-up"
              onClick={() => handleMasterClick(master.id)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-7 w-7 ${iconColor}`} />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {master.name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {master.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-slate-500">Active</span>
                    </div>
                    <div className="text-sm font-medium text-slate-700">
                      {master.count} records
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 pb-6">
                <button className="w-full btn btn-outline text-sm py-2">
                  Manage Records
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredMasters.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No masters found</h3>
          <p className="text-slate-600">Try adjusting your search terms</p>
        </div>
      )}
      </div>

      {/* Role Modal */}
      <RoleModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSubmit={handleRoleSubmit}
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSubmit={handleCategorySubmit}
      />
    </>
  );
};

export default Masters;