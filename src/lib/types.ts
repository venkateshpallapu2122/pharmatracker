
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  expirationDate: string; // ISO string format
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  barcode?: string; // Optional barcode field
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarUrl?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // Consider using Date object or timestamp
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedTo?: string; // Employee ID
}

export interface ActivityLog {
  id: string;
  user: string; // User name or ID
  action: string;
  timestamp: string; // Consider using Date object or timestamp
  details?: Record<string, any>;
}

export interface ExpirationAlert {
  id: string;
  itemName: string;
  daysToExpiry: number;
  expirationDate: string;
}
