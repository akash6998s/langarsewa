import React, { useEffect, useState } from 'react';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:5000/signup');
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [refreshTrigger]);

  const filteredUsers = users.filter(user => {
    if (activeTab === 'all') return true;
    const userStatus = user.status ? user.status.toLowerCase() : 'pending';
    return userStatus === activeTab;
  });

  const handleUpdateStatus = async (rollNumber, newStatus) => {
    try {
      const response = await fetch('http://localhost:5000/signup/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber, status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-100 text-red-700">
        <p className="text-lg">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-[1400px] mx-auto bg-white shadow-xl rounded-2xl p-6 w-full">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          User Management Dashboard
        </h2>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {['pending', 'approved', 'reject'].map(tab => {
            const colorMap = {
              pending: 'yellow',
              approved: 'green',
              reject: 'red',
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-sm capitalize
                  ${activeTab === tab
                    ? `bg-${colorMap[tab]}-600 text-white`
                    : `bg-gray-200 text-gray-800 hover:bg-${colorMap[tab]}-100 hover:text-${colorMap[tab]}-700`
                  }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">Roll Number</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">Email</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-700">Status</th>
                {activeTab !== 'all' && (
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={activeTab !== 'all' ? 4 : 3} className="px-6 py-4 text-center text-gray-500">
                    No users found for this status.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const status = (user.status || 'pending').toLowerCase();
                  const statusColor = {
                    approved: 'green',
                    pending: 'yellow',
                    reject: 'red',
                  }[status] || 'gray';

                  return (
                    <tr key={user.rollNumber} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-800">{user.rollNumber}</td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-${statusColor}-100 text-${statusColor}-800`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                      {activeTab !== 'all' && (
                        <td className="px-6 py-4">
                          <div className="flex gap-2 flex-wrap">
                            {status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(user.rollNumber, 'approved')}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(user.rollNumber, 'reject')}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {status === 'approved' && (
                              <button
                                onClick={() => handleUpdateStatus(user.rollNumber, 'reject')}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium"
                              >
                                Reject
                              </button>
                            )}
                            {status === 'reject' && (
                              <button
                                onClick={() => handleUpdateStatus(user.rollNumber, 'approved')}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium"
                              >
                                Approve
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersList;
