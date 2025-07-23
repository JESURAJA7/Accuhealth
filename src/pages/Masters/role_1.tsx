import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface Role {
  id: number;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
}

const role_1: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([
    { id: 1, code: '1001', name: 'admin', description: 'test', isActive: true },
    { id: 2, code: '1002', name: 'user', description: 'test', isActive: true }
  ]);

  const [newRole, setNewRole] = useState<Omit<Role, 'id'>>({
    code: '',
    name: '',
    description: '',
    isActive: true
  });

  const handleAddRole = () => {
    const nextId = Math.max(...roles.map(r => r.id), 0) + 1;
    setRoles([...roles, { ...newRole, id: nextId }]);
    setNewRole({ code: '', name: '', description: '', isActive: true });
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Roles</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">IsActive</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role.id}>
                <td className="px-4 py-2 whitespace-nowrap">{role.id}</td>
                <td className="px-4 py-2 whitespace-nowrap">{role.code}</td>
                <td className="px-4 py-2 whitespace-nowrap">{role.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{role.description}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {role.isActive ? 'yes' : 'no'}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap">{roles.length + 1}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                <input
                  type="text"
                  value={newRole.code}
                  onChange={(e) => setNewRole({...newRole, code: e.target.value})}
                  className="border rounded px-2 py-1 w-full"
                  placeholder="Enter code"
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                  className="border rounded px-2 py-1 w-full"
                  placeholder="Enter name"
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <input
                  type="text"
                  value={newRole.description}
                  onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                  className="border rounded px-2 py-1 w-full"
                  placeholder="Enter description"
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap flex items-center gap-2">
                <button
                  onClick={handleAddRole}
                  className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default role_1;