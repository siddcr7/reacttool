import React, { useState, useEffect } from 'react';

export default function InventoryApp() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ name: '', quantity: '', price: '' });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  const API_URL = 'http://localhost:8000';

  // Fetch all items
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_URL}/items`);
      const data = await response.json();
      setItems(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  // Sort items by name
  const sortedItems = [...items].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    } else {
      return b.name.toLowerCase().localeCompare(a.name.toLowerCase());
    }
  });

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add or update item
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const itemData = {
      name: formData.name,
      quantity: parseInt(formData.quantity),
      price: parseFloat(formData.price)
    };

    try {
      if (editId) {
        // Update existing item
        await fetch(`${API_URL}/items/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        });
      } else {
        // Create new item
        await fetch(`${API_URL}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        });
      }
      
      setFormData({ name: '', quantity: '', price: '' });
      setEditId(null);
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  // Edit item
  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      price: item.price.toString()
    });
    setEditId(item.id);
  };

  // Delete item
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await fetch(`${API_URL}/items/${id}`, { method: 'DELETE' });
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setFormData({ name: '', quantity: '', price: '' });
    setEditId(null);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Inventory Management</h1>
        
        {/* Add/Edit Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editId ? 'Edit Item' : 'Add New Item'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                {editId ? 'Update Item' : 'Add Item'}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Inventory List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Inventory Items</h2>
            <button
              onClick={toggleSortOrder}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
            >
              Sort by Name
              <span className="text-lg">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            </button>
          </div>
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No items in inventory. Add your first item above!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Value</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">${item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        ${(item.quantity * item.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}