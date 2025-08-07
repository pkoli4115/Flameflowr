import React, { useEffect, useState } from "react";
import { fetchUsers, User, updateUser, deleteUser } from "../firebase/userApi";
import { exportToCsv } from "../utils/exportCsv"; // Make sure this file exists!

const PAGE_SIZE = 20;

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    // Fetch all users for "Export All"
    const allUsers: User[] = [];
    let cursor = undefined;
    let hasNextPage = true;
    while (hasNextPage) {
      const { users, lastDoc, hasNextPage: hasMore } = await fetchUsers(PAGE_SIZE, cursor);
      allUsers.push(...users);
      hasNextPage = hasMore;
      cursor = lastDoc;
    }
    setUsers(allUsers);
    setLoading(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditValue(user.name);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);
    await updateUser(selectedUser.uid, { name: editValue });
    setUsers(users.map(u => u.uid === selectedUser.uid ? { ...u, name: editValue } : u));
    setSelectedUser(null);
    setSaving(false);
  };

  const handleDelete = async (uid: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUser(uid);
      setUsers(users.filter(u => u.uid !== uid));
    }
  };

  const handleBan = async (user: User) => {
    await updateUser(user.uid, { status: user.status === "banned" ? "active" : "banned" });
    setUsers(users.map(u =>
      u.uid === user.uid
        ? { ...u, status: user.status === "banned" ? "active" : "banned" }
        : u
    ));
  };

  const handleExport = () => {
    exportToCsv("users.csv", users);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-purple-800 mb-1">User Management</h2>
          <p className="text-gray-500">Manage, search, edit and moderate your user base.</p>
        </div>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700"
          onClick={handleExport}
        >
          Export CSV
        </button>
      </div>
      <div className="mb-6">
        <input
          className="w-full max-w-xs px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Search users by name or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-purple-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.uid} className="hover:bg-purple-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    user.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 capitalize">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                  <button
                    className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-3 py-1 rounded-md"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-md"
                    onClick={() => handleDelete(user.uid)}
                  >
                    Delete
                  </button>
                  <button
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1 rounded-md"
                    onClick={() => handleBan(user)}
                  >
                    {user.status === "banned" ? "Unban" : "Ban"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-10 text-gray-400 text-xl">No users found.</div>
        )}
        {loading && (
          <div className="text-center py-10 text-gray-400 text-xl">Loading users...</div>
        )}
      </div>
      {/* Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Edit User</h3>
            <input
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              disabled={saving}
            />
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-200 px-4 py-2 rounded-lg"
                onClick={() => setSelectedUser(null)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded-lg"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
