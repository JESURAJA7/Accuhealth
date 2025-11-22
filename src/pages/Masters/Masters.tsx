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
  ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMasters();
  }, []);

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
        setMasters(data);
      }
    } catch (error) {
      console.error('Error fetching masters:', error);
    }
  };

  const handleMasterClick = (masterId: string) => {
    switch (masterId) {
      case 'role':
        navigate('/roles'); // Redirect to roles page
        break;
      case 'category':
        setShowCategoryModal(true);
        break;
      default:
        console.log(`Clicked on ${masterId}`);
        break;
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
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
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

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-6">
        {/* Page Title */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-blue-500">Masters</h1>
        </div>

        {/* Masters Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {masters.map((master) => {
              const Icon = getIcon(master.icon);
              
              return (
                <div
                  key={master.id}
                  className="bg-white rounded-lg border border-blue-200 p-8 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300"
                  onClick={() => handleMasterClick(master.id)}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Icon */}
                    <div className="w-12 h-12 flex items-center justify-center">
                      <Icon className="h-8 w-8 text-blue-500" />
                    </div>
                    
                    {/* Master Name */}
                    <h3 className="text-sm font-medium text-gray-800 leading-tight">
                      {master.name}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

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