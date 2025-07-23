import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Phone, MapPin, Building, FileText, Activity, TestTube, ChevronRight, ChevronLeft, Save } from 'lucide-react';

interface NotificationFormData {
  // Notification Info
  governorate: string;
  wilayat: string;
  institution: string;
  reportingDate: string;
  
  // Patient Info
  patientId: string;
  civilId: string;
  expiryDate: string;
  age: string;
  firstName: string;
  secondName: string;
  dob: string;
  term: string;
  mobileNo: string;
  nextOfKinMobileNo: string;
  education: string;
  passportNo: string;
  placeOfWork: string;
  monthlyIncome: string;
  patientGovernorate: string;
  nationality: string;
  longitude: string;
  maritalStatus: string;
  patientWilayat: string;
  gender: string;
  workStatus: string;
  
  // Source Details
  treatment: string;
  treatmentStartDate: string;
  treatmentDose: string;
  primaquine: string;
  outcome: string;
  outcomeDate: string;
  remarks: string;
  
  // History Details
  dateOfOnset: string;
  symptoms: string[];
  pastHistoryOfMalaria: string;
  bloodTransfusionWithinPast3Months: string;

  // Lab Results
  rdtReportedDate: string;
  species: string[];
  density: string;
  stages: string[];
  parasiteCount: string;
  relapse: string;
  attachments: File[];

  // Other Details
  otherTreatment: string;
  otherTreatmentStartDate: string;
  treatmentEndDate: string;
  otherTreatmentDose: string;
  otherPrimaquine: string;
  otherOutcome: string;
  otherOutcomeDate: string;
  otherRemarks: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const NotificationEntry: React.FC = () => {
  const navigate = (path: string) => {
    console.log('Navigate to:', path);
  };
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NotificationFormData>({
    // Notification Info
    governorate: '',
    wilayat: '',
    institution: '',
    reportingDate: '',
    
    // Patient Info
    patientId: '',
    civilId: '',
    expiryDate: '',
    age: '',
    firstName: '',
    secondName: '',
    dob: '',
    term: 'Years',
    mobileNo: '',
    nextOfKinMobileNo: '',
    education: '',
    passportNo: '',
    placeOfWork: '',
    monthlyIncome: '',
    patientGovernorate: '',
    nationality: '',
    longitude: '',
    maritalStatus: '',
    patientWilayat: '',
    gender: '',
    workStatus: '',
    
    // Source Details
    treatment: '',
    treatmentStartDate: '',
    treatmentDose: '',
    primaquine: 'Given',
    outcome: '',
    outcomeDate: '',
    remarks: '',
    
    // History Details
    dateOfOnset: '',
    symptoms: [],
    pastHistoryOfMalaria: 'No',
    bloodTransfusionWithinPast3Months: 'No',

    // Lab Results
    rdtReportedDate: '',
    species: [],
    density: '',
    stages: [],
    parasiteCount: '',
    relapse: 'No',
    attachments: [],

    // Other Details
    otherTreatment: '',
    otherTreatmentStartDate: '',
    treatmentEndDate: '',
    otherTreatmentDose: '',
    otherPrimaquine: 'Given',
    otherOutcome: '',
    otherOutcomeDate: '',
    otherRemarks: ''
  });

  const steps = [
    {
      id: 'notification-info',
      title: 'Notification Info',
      icon: FileText,
      description: 'Basic notification details'
    },
    {
      id: 'patient-info',
      title: 'Patient Info',
      icon: User,
      description: 'Patient personal information'
    },
    {
      id: 'source-details',
      title: 'Source Details',
      icon: Activity,
      description: 'Treatment and outcome details'
    },
    {
      id: 'history-details',
      title: 'History Details',
      icon: Calendar,
      description: 'Medical history and symptoms'
    },
    {
      id: 'lab-results',
      title: 'Lab Results',
      icon: TestTube,
      description: 'Laboratory test results'
    },
    {
      id: 'other-details',
      title: 'Other Details',
      icon: Activity,
      description: 'Additional treatment details'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'symptoms' || name === 'species' || name === 'stages') {
        const checkboxValue = (e.target as HTMLInputElement).value;
        setFormData(prev => ({
          ...prev,
          [name]: checked 
            ? [...(prev[name as keyof typeof prev] as string[]), checkboxValue]
            : (prev[name as keyof typeof prev] as string[]).filter(s => s !== checkboxValue)
        }));
      }
    } else if (type === 'radio') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        navigate('/notifications');
      }
    } catch (error) {
      console.error('Error submitting notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderNotificationInfo = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Malaria Notification</h2>
        <p className="text-slate-600">[Notify only for confirmed cases]</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Governorate
          </label>
          <select
            name="governorate"
            value={formData.governorate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Wilayat
          </label>
          <select
            name="wilayat"
            value={formData.wilayat}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select</option>
            <option value="khartoum">Khartoum</option>
            <option value="omdurman">Omdurman</option>
            <option value="bahri">Bahri</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Institution <span className="text-red-500">*</span>
          </label>
          <select
            name="institution"
            value={formData.institution}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select</option>
            <option value="hospital">Hospital</option>
            <option value="clinic">Clinic</option>
            <option value="health-center">Health Center</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Reporting Date
          </label>
          <input
            type="date"
            name="reportingDate"
            value={formData.reportingDate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderPatientInfo = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Patient Id <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="patientId"
            value={formData.patientId}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Civil Id
          </label>
          <input
            type="text"
            name="civilId"
            value={formData.civilId}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Expiry Date
          </label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Age
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Second Name
          </label>
          <input
            type="text"
            name="secondName"
            value={formData.secondName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            DOB <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Term
          </label>
          <select
            name="term"
            value={formData.term}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Years">Years</option>
            <option value="Months">Months</option>
            <option value="Days">Days</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Mobile No
          </label>
          <input
            type="tel"
            name="mobileNo"
            value={formData.mobileNo}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Next of Kin Mobile No
          </label>
          <input
            type="tel"
            name="nextOfKinMobileNo"
            value={formData.nextOfKinMobileNo}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Education
          </label>
          <select
            name="education"
            value={formData.education}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select</option>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="university">University</option>
            <option value="none">None</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Passport No
          </label>
          <input
            type="text"
            name="passportNo"
            value={formData.passportNo}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Place of Work <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="placeOfWork"
            value={formData.placeOfWork}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Monthly Income
          </label>
          <input
            type="number"
            name="monthlyIncome"
            value={formData.monthlyIncome}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Governorate <span className="text-red-500">*</span>
          </label>
          <select
            name="patientGovernorate"
            value={formData.patientGovernorate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select</option>
            <option value="khartoum">Khartoum</option>
            <option value="kassala">Kassala</option>
            <option value="aljazeera">Aljazeera</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Nationality <span className="text-red-500">*</span>
          </label>
          <select
            name="nationality"
            value={formData.nationality}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select</option>
            <option value="sudanese">Sudanese</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Longitude
          </label>
          <input
            type="text"
            name="longitude"
            value={formData.longitude}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Marital Status
          </label>
          <select
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Wilayat <span className="text-red-500">*</span>
          </label>
          <select
            name="patientWilayat"
            value={formData.patientWilayat}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select</option>
            <option value="khartoum">Khartoum</option>
            <option value="omdurman">Omdurman</option>
            <option value="bahri">Bahri</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            Work Status
          </label>
          <select
            name="workStatus"
            value={formData.workStatus}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select</option>
            <option value="employed">Employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="student">Student</option>
            <option value="retired">Retired</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSourceDetails = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Treatment <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="treatment"
            value={formData.treatment}
            onChange={handleInputChange}
            placeholder="Enter treatment"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Treatment Start Date
          </label>
          <select
            name="treatmentStartDate"
            value={formData.treatmentStartDate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="custom">Custom Date</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Treatment Dose
          </label>
          <input
            type="text"
            name="treatmentDose"
            value={formData.treatmentDose}
            onChange={handleInputChange}
            placeholder="Enter dose"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Primaquine <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4 mt-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="primaquine"
                value="Given"
                checked={formData.primaquine === 'Given'}
                onChange={handleInputChange}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Given</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="primaquine"
                value="Not Given"
                checked={formData.primaquine === 'Not Given'}
                onChange={handleInputChange}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Not Given</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Outcome
          </label>
          <select
            name="outcome"
            value={formData.outcome}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select</option>
            <option value="cured">Cured</option>
            <option value="died">Died</option>
            <option value="transferred">Transferred</option>
            <option value="lost-to-followup">Lost to Follow-up</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Outcome Date
          </label>
          <input
            type="date"
            name="outcomeDate"
            value={formData.outcomeDate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            Remarks
          </label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleInputChange}
            placeholder="Add remarks"
            rows={4}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>
      </div>
    </div>
  );

  const renderHistoryDetails = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Date of Onset <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="dateOfOnset"
            value={formData.dateOfOnset}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Symptoms
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['Fever', 'Headache', 'Dizziness', 'Vomiting', 'Other'].map((symptom) => (
            <label key={symptom} className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="symptoms"
                value={symptom}
                checked={formData.symptoms.includes(symptom)}
                onChange={handleInputChange}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{symptom}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Past History of Malaria
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="pastHistoryOfMalaria"
              value="Yes"
              checked={formData.pastHistoryOfMalaria === 'Yes'}
              onChange={handleInputChange}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">Yes</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="pastHistoryOfMalaria"
              value="No"
              checked={formData.pastHistoryOfMalaria === 'No'}
              onChange={handleInputChange}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">No</span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Blood transfusion within past 3 months
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="bloodTransfusionWithinPast3Months"
              value="Yes"
              checked={formData.bloodTransfusionWithinPast3Months === 'Yes'}
              onChange={handleInputChange}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">Yes</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="bloodTransfusionWithinPast3Months"
              value="No"
              checked={formData.bloodTransfusionWithinPast3Months === 'No'}
              onChange={handleInputChange}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">No</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderLabResults = () => (
    <div className="space-y-8">
      <div className="space-y-8">
        {/* RDT Section */}
        <div className="space-y-4">
          <label className="block text-lg font-medium text-slate-700 border-b border-slate-200 pb-2">
            RDT
          </label>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Reported on Date
            </label>
            <input
              type="date"
              name="rdtReportedDate"
              value={formData.rdtReportedDate}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Species Section */}
        <div className="space-y-4">
          <label className="block text-lg font-medium text-slate-700 border-b border-slate-200 pb-2">
            Species
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { value: 'P.falciparum', label: 'P.falciparum' },
              { value: 'P.vivax', label: 'P.vivax' },
              { value: 'P.ovale', label: 'P.ovale' },
              { value: 'P.malariae', label: 'P.malariae' },
              { value: 'Mixed', label: 'Mixed' }
            ].map((species) => (
              <label key={species.value} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  name="species"
                  value={species.value}
                  checked={formData.species.includes(species.value)}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-slate-700">{species.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Density Section */}
        <div className="space-y-4">
          <label className="block text-lg font-medium text-slate-700 border-b border-slate-200 pb-2">
            Density
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '+1', label: '+1' },
              { value: '+2', label: '+2' },
              { value: '+3', label: '+3' },
              { value: '+4', label: '+4' }
            ].map((density) => (
              <label key={density.value} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <input
                  type="radio"
                  name="density"
                  value={density.value}
                  checked={formData.density === density.value}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-slate-700">{density.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Stages Section */}
        <div className="space-y-4">
          <label className="block text-lg font-medium text-slate-700 border-b border-slate-200 pb-2">
            Stages
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 'Ring forms', label: 'Ring forms' },
              { value: 'Trophozoites', label: 'Trophozoites' },
              { value: 'Schizonts', label: 'Schizonts' },
              { value: 'Gametocytes', label: 'Gametocytes' }
            ].map((stage) => (
              <label key={stage.value} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  name="stages"
                  value={stage.value}
                  checked={formData.stages.includes(stage.value)}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-slate-700">{stage.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Parasite Count Section */}
        <div className="space-y-4">
          <label className="block text-lg font-medium text-slate-700 border-b border-slate-200 pb-2">
            Count (parasite/Uiblood)
          </label>
          <input
            type="text"
            name="parasiteCount"
            value={formData.parasiteCount}
            onChange={handleInputChange}
            placeholder="Enter parasite count per microliter of blood"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Relapse Section */}
        <div className="space-y-4">
          <label className="block text-lg font-medium text-slate-700 border-b border-slate-200 pb-2">
            Relapse?
          </label>
          <div className="flex space-x-6">
            <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <input
                type="radio"
                name="relapse"
                value="Yes"
                checked={formData.relapse === 'Yes'}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-slate-700">Yes</span>
            </label>
            <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <input
                type="radio"
                name="relapse"
                value="No"
                checked={formData.relapse === 'No'}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-slate-700">No</span>
            </label>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="space-y-4">
          <label className="block text-lg font-medium text-slate-700 border-b border-slate-200 pb-2">
            Attachments
          </label>
          <div className="bg-slate-50 rounded-lg p-6 border-2 border-dashed border-slate-300">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-4">Max. file size: 10MB</p>
              
              {/* File Upload Area */}
              <div className="space-y-4">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <div className="flex justify-center space-x-3">
                  <label
                    htmlFor="file-upload"
                    className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors cursor-pointer"
                  >
                    Browse
                  </label>
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Upload
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Uploading attachments will be enabled after saving the notification.
                </p>
              </div>

              {/* File List */}
              {formData.attachments.length > 0 && (
                <div className="mt-6">
                  <div className="bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                      <span className="font-medium text-slate-700">File Name</span>
                      <span className="font-medium text-slate-700">Actions</span>
                    </div>
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-b-0">
                        <span className="text-sm text-slate-600 truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOtherDetails = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Treatment <span className="text-red-500">*</span>
          </label>
          <select
            name="otherTreatment"
            value={formData.otherTreatment}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Treatment</option>
            <option value="artemether-lumefantrine">Artemether-Lumefantrine</option>
            <option value="artesunate">Artesunate</option>
            <option value="chloroquine">Chloroquine</option>
            <option value="quinine">Quinine</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Treatment Start Date
          </label>
          <input
            type="date"
            name="otherTreatmentStartDate"
            value={formData.otherTreatmentStartDate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Treatment End Date
          </label>
          <input
            type="date"
            name="treatmentEndDate"
            value={formData.treatmentEndDate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Treatment Dose
          </label>
          <input
            type="text"
            name="otherTreatmentDose"
            value={formData.otherTreatmentDose}
            onChange={handleInputChange}
            placeholder="Enter dose"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Primaquine <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4 mt-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="otherPrimaquine"
                value="Given"
                checked={formData.otherPrimaquine === 'Given'}
                onChange={handleInputChange}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Given</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="otherPrimaquine"
                value="Not Given"
                checked={formData.otherPrimaquine === 'Not Given'}
                onChange={handleInputChange}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Not Given</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Outcome
          </label>
          <select
            name="otherOutcome"
            value={formData.otherOutcome}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Outcome</option>
            <option value="cured">Cured</option>
            <option value="died">Died</option>
            <option value="transferred">Transferred</option>
            <option value="lost-to-followup">Lost to Follow-up</option>
            <option value="treatment-failure">Treatment Failure</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Outcome Date
          </label>
          <input
            type="date"
            name="otherOutcomeDate"
            value={formData.otherOutcomeDate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Remarks
        </label>
        <textarea
          name="otherRemarks"
          value={formData.otherRemarks}
          onChange={handleInputChange}
          placeholder="Please use this space to enter other details for Malaria"
          rows={4}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderNotificationInfo();
      case 1:
        return renderPatientInfo();
      case 2:
        return renderSourceDetails();
      case 3:
        return renderHistoryDetails();
      case 4:
        return renderLabResults();
      case 5:
        return renderOtherDetails();
      default:
        return renderNotificationInfo();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/60 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">New Notification Entry</h1>
              <p className="text-sm text-slate-600">Complete all required information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Step Navigation */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/60 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Progress</h2>
            <span className="text-sm text-slate-600">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 mb-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                      : isCompleted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="h-5 w-5" />
                    <span className="font-medium text-sm hidden sm:block">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/60 p-8">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {steps[currentStep].title}
            </h3>
            <p className="text-slate-600">{steps[currentStep].description}</p>
          </div>

          {renderCurrentStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-slate-200 mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-3">
              {currentStep === steps.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>Submit</span>
                    </div>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationEntry;