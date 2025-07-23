import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, X, Calendar, User, Phone, MapPin, Building, FileText, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FormData {
  patientId: string;
  name: string;
  gsmNo: string;
  sex: string;
  maritalStatus: string;
  ageFrom: string;
  ageTo: string;
  nationality: string;
  patientGovernorate: string;
  governorate: string;
  wilayat: string;
  reportingInstitute: string;
  finalOutcome: string;
  notificationId: string;
  reportingDate: string;
  finalOutcomeDate: string;
  caseDetectedVisa: string;
  labConfirmedCase: string;
  species: {
    pFalciparum: boolean;
    pVivax: boolean;
    mixed: boolean;
    pOvale: boolean;
    pMalariae: boolean;
  };
  pastMalariaHistory: string;
  travelHistory: string;
  classification: string;
  hospitalType: string;
}

interface Notification {
  id: number;
  notificationId: string;
  reportingDate: string;
  patientName: string;
  patientNo: string;
  age: number;
  sex: string;
  reportingInstitute: string;
  status: string;
}

const API_URL = import.meta.env.VITE_API_URL; 

const MalariaListing: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    patientId: '',
    name: '',
    gsmNo: '',
    sex: '',
    maritalStatus: '',
    ageFrom: '',
    ageTo: '',
    nationality: '',
    patientGovernorate: '',
    governorate: '',
    wilayat: '',
    reportingInstitute: '',
    finalOutcome: '',
    notificationId: '',
    reportingDate: '',
    finalOutcomeDate: '',
    caseDetectedVisa: '',
    labConfirmedCase: '',
    species: {
      pFalciparum: false,
      pVivax: false,
      mixed: false,
      pOvale: false,
      pMalariae: false
    },
    pastMalariaHistory: '',
    travelHistory: '',
    classification: 'imported',
    hospitalType: 'all'
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name.startsWith('species.')) {
        const speciesType = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          species: {
            ...prev.species,
            [speciesType]: checked
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value && typeof value === 'string' && value.trim() !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${API_URL}/notifications/search?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error searching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      patientId: '',
      name: '',
      gsmNo: '',
      sex: '',
      maritalStatus: '',
      ageFrom: '',
      ageTo: '',
      nationality: '',
      patientGovernorate: '',
      governorate: '',
      wilayat: '',
      reportingInstitute: '',
      finalOutcome: '',
      notificationId: '',
      reportingDate: '',
      finalOutcomeDate: '',
      caseDetectedVisa: '',
      labConfirmedCase: '',
      species: {
        pFalciparum: false,
        pVivax: false,
        mixed: false,
        pOvale: false,
        pMalariae: false
      },
      pastMalariaHistory: '',
      travelHistory: '',
      classification: 'imported',
      hospitalType: 'all'
    });
    fetchNotifications();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/notifications')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Malaria Notification</h1>
              <p className="text-sm text-gray-600">Search and manage malaria case notifications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search Criteria
            </h2>
          </div>

          <div className="p-6">
            {/* Patient Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Patient Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    placeholder="Enter Patient ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    GSM NO
                  </label>
                  <input
                    type="text"
                    name="gsmNo"
                    value={formData.gsmNo}
                    onChange={handleInputChange}
                    placeholder="Enter GSM No"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Sex
                  </label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Marital Status
                  </label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Age (in Years)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      name="ageFrom"
                      value={formData.ageFrom}
                      onChange={handleInputChange}
                      placeholder="From"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <input
                      type="number"
                      name="ageTo"
                      value={formData.ageTo}
                      onChange={handleInputChange}
                      placeholder="To"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nationality <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select</option>
                    <option value="sudanese">Sudanese</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Patient Governorate
                  </label>
                  <select
                    name="patientGovernorate"
                    value={formData.patientGovernorate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select</option>
                    <option value="khartoum">Khartoum</option>
                    <option value="kassala">Kassala</option>
                    <option value="aljazeera">Aljazeera</option>
                    <option value="elgedarf">Elgedarf</option>
                    <option value="kordofan">Kordofan</option>
                    <option value="darfur">Darfur</option>
                    <option value="port-sudan">Port Sudan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Governorate
                  </label>
                  <select
                    name="governorate"
                    value={formData.governorate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Governorate</option>
                    <option value="khartoum">Khartoum</option>
                    <option value="kassala">Kassala</option>
                    <option value="aljazeera">Aljazeera</option>
                    <option value="elgedarf">Elgedarf</option>
                    <option value="kordofan">Kordofan</option>
                    <option value="darfur">Darfur</option>
                    <option value="port-sudan">Port Sudan</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Wilayat
                  </label>
                  <select
                    name="wilayat"
                    value={formData.wilayat}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Wilayat</option>
                    <option value="khartoum">Khartoum</option>
                    <option value="omdurman">Omdurman</option>
                    <option value="bahri">Bahri</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    Reporting Institute
                  </label>
                  <select
                    name="reportingInstitute"
                    value={formData.reportingInstitute}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select</option>
                    <option value="hospital">Hospital</option>
                    <option value="clinic">Clinic</option>
                    <option value="health-center">Health Center</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Final Outcome
                  </label>
                  <select
                    name="finalOutcome"
                    value={formData.finalOutcome}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select</option>
                    <option value="cured">Cured</option>
                    <option value="died">Died</option>
                    <option value="transferred">Transferred</option>
                    <option value="lost-to-followup">Lost to Follow-up</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Date Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Date Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Notification ID
                  </label>
                  <input
                    type="text"
                    name="notificationId"
                    value={formData.notificationId}
                    onChange={handleInputChange}
                    placeholder="Enter Notification ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Reporting Date
                  </label>
                  <input
                    type="date"
                    name="reportingDate"
                    value={formData.reportingDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Final Outcome Date
                  </label>
                  <input
                    type="date"
                    name="finalOutcomeDate"
                    value={formData.finalOutcomeDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Clinical Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Clinical Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Case detected in visa screening */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Case detected in visa screening
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="caseDetectedVisa"
                        value="yes"
                        checked={formData.caseDetectedVisa === 'yes'}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="caseDetectedVisa"
                        value="no"
                        checked={formData.caseDetectedVisa === 'no'}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                {/* Lab confirmed case */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Lab confirmed case
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="labConfirmedCase"
                        value="yes"
                        checked={formData.labConfirmedCase === 'yes'}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="labConfirmedCase"
                        value="no"
                        checked={formData.labConfirmedCase === 'no'}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                {/* Species */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Species
                  </label>
                  <div className="space-y-2">
                    {Object.entries(formData.species).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`species.${key}`}
                          checked={value}
                          onChange={handleInputChange}
                          className="mr-2 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, '.$1')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Classification */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Classification
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="classification"
                        value="imported"
                        checked={formData.classification === 'imported'}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Imported</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="classification"
                        value="local"
                        checked={formData.classification === 'local'}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Local</span>
                    </label>
                  </div>
                </div>

                {/* Past Malaria History */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Past Malaria History
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="pastMalariaHistory"
                        value="yes"
                        checked={formData.pastMalariaHistory === 'yes'}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="pastMalariaHistory"
                        value="no"
                        checked={formData.pastMalariaHistory === 'no'}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                {/* Travel History */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Travel History
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="travelHistory"
                        value="yes"
                        checked={formData.travelHistory === 'yes'}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="travelHistory"
                        value="no"
                        checked={formData.travelHistory === 'no'}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                {/* Hospital Type */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Hospital Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hospitalType"
                        value="all"
                        checked={formData.hospitalType === 'all'}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">All</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hospitalType"
                        value="moh"
                        checked={formData.hospitalType === 'moh'}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">MOH</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hospitalType"
                        value="non-moh"
                        checked={formData.hospitalType === 'non-moh'}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Non-MOH</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSearch}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg flex items-center space-x-2 font-medium transition-colors disabled:opacity-50"
              >
                <Search className="h-5 w-5" />
                <span>{loading ? 'Searching...' : 'Search'}</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg flex items-center space-x-2 font-medium transition-colors"
              >
                <X className="h-5 w-5" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Malaria Listing
            </h2>
            <button className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-blue-400">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Notification ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Reporting Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Patient NO
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Sex
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Reporting Institute
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <tr key={notification.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {notification.notificationId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {notification.reportingDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {notification.patientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {notification.patientNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {notification.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {notification.sex}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {notification.reportingInstitute}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          notification.status === 'Saved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {notification.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FileText className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No notifications found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MalariaListing;