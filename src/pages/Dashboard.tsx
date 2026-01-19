import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, MapPin, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

import { API_BASE_URL } from '../config';
const API_URL = API_BASE_URL;
console.log('API URL:', API_URL);

interface DashboardStats {
  totalNotifications: number;
  confirmedCases: number;
  suspectedCases: number;
  regionsCovered: number;
}

interface CaseData {
  name: string;
  cases: number;
}

interface TrendData {
  date: string;
  cases: number;
  recovered: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalNotifications: 0,
    confirmedCases: 0,
    suspectedCases: 0,
    regionsCovered: 0
  });
  const [casesByGovernorate, setCasesByGovernorate] = useState<CaseData[]>([]);
  const [topRegions, setTopRegions] = useState<CaseData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [statsRes, casesRes, regionsRes] = await Promise.all([
        fetch(`${API_URL}/dashboard/stats`, { headers }),
        fetch(`${API_URL}/dashboard/cases-by-governorate`, { headers }),
        fetch(`${API_URL}/dashboard/top-affected-regions`, { headers })
      ]);

      const statsData = await statsRes.json();
      const casesData = await casesRes.json();
      const regionsData = await regionsRes.json();


      setStats(statsData);
      setCasesByGovernorate(casesData);
      setTopRegions(regionsData.slice(0, 5));

      // Mock trend data
      setTrendData([
        { date: 'Jan', cases: 120, recovered: 100 },
        { date: 'Feb', cases: 150, recovered: 130 },
        { date: 'Mar', cases: 180, recovered: 160 },
        { date: 'Apr', cases: 140, recovered: 120 },
        { date: 'May', cases: 200, recovered: 180 },
        { date: 'Jun', cases: 170, recovered: 150 },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Notifications',
      value: stats.totalNotifications.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      color: 'from-blue-500 to-blue-600',
      icon: Activity,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Confirmed Cases',
      value: stats.confirmedCases.toLocaleString(),
      change: '+8.2%',
      trend: 'up',
      color: 'from-green-500 to-green-600',
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Suspected Cases',
      value: stats.suspectedCases.toLocaleString(),
      change: '-3.1%',
      trend: 'down',
      color: 'from-yellow-500 to-yellow-600',
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Regions Covered',
      value: stats.regionsCovered.toString(),
      change: '+5.0%',
      trend: 'up',
      color: 'from-purple-500 to-purple-600',
      icon: MapPin,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  const pieData = [
    { name: 'Confirmed', value: stats.confirmedCases, color: '#10b981' },
    { name: 'Suspected', value: stats.suspectedCases, color: '#f59e0b' },
    { name: 'Recovered', value: 6800, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">AccuHealth Dashboard</h1>
          <p className="text-slate-600 mt-1 text-sm">Real-time insights into disease surveillance and management</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-slate-200">
            <Clock className="h-3 w-3 text-slate-500" />
            <span className="text-xs text-slate-600">Last updated: 2 min ago</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const TrendIcon = card.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <div key={index} className="card group hover:shadow-lg transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 ${card.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-4 w-4 ${card.iconColor}`} />
                  </div>
                  <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-xs font-medium ${card.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    <TrendIcon className="h-2.5 w-2.5" />
                    <span>{card.change}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                </div>
              </div>
              <div className={`h-0.5 bg-gradient-to-r ${card.color} rounded-b-xl`}></div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 space-x-8 ">
        {/* Cases by Governorate Chart */}
        <div className="card p-2 w-[450px] h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Cases by Governorate</h3>
              <p className="text-xs text-slate-600 mt-0.5">Distribution across regions</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-slate-600">Active Cases</span>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={casesByGovernorate} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Bar
                  dataKey="cases"
                  fill="url(#blueGradient)"
                  radius={[2, 2, 0, 0]}
                />
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Affected Regions */}
        <div className="card p-4 space-y-4 ">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Top Affected Regions</h3>
              <p className="text-xs text-slate-600 mt-0.5">Highest case counts</p>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:bg-blue-50 px-2 py-1 rounded-md transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-2">
            {topRegions.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white font-bold text-xs ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                          'bg-gradient-to-r from-blue-400 to-blue-500'
                    }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-slate-900 text-sm">{region.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 text-sm">{region.cases}</div>
                  <div className="text-xs text-slate-500">cases</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Monthly Trends</h3>
              <p className="text-xs text-slate-600 mt-0.5">Cases vs Recovery rate</p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }} 
                />
                <Line type="monotone" dataKey="cases" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }} />
                <Line type="monotone" dataKey="recovered" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        {/* Case Distribution Pie Chart */}
        {/* <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Case Distribution</h3>
              <p className="text-xs text-slate-600 mt-0.5">Current status breakdown</p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-3">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;