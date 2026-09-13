// src/services/storage.js

// Storage keys
export const KEYS = {
  USERS: 'sms_users',
  STUDENTS: 'sms_students',
  LECTURERS: 'sms_lecturers',
  DEPARTMENTS: 'sms_departments',
  COURSES: 'sms_courses',
  SESSIONS: 'sms_sessions',
  ALLOCATIONS: 'sms_allocations',
  REGISTRATIONS: 'sms_registrations',
  ATTENDANCE: 'sms_attendance',
  RESULTS: 'sms_results',
  RECOMMENDATIONS: 'sms_recommendations',
  SETTINGS: 'sms_settings',
  CURRENT_USER: 'sms_current_user',
};

// Generic CRUD operations
export const storageService = {
  get: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error reading ${key} from storage:`, error);
      return null;
    }
  },

  set: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing ${key} to storage:`, error);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  },

  getAll: (key) => {
    return storageService.get(key) || [];
  },

  findById: (key, id) => {
    const items = storageService.getAll(key);
    return items.find((item) => item.id === id) || null;
  },

  create: (key, item) => {
    const items = storageService.getAll(key);
    const newItem = {
      ...item,
      id: item.id || crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.push(newItem);
    storageService.set(key, items);
    return newItem;
  },

  update: (key, id, updates) => {
    const items = storageService.getAll(key);
    const index = items.findIndex((item) => item.id === id);
    if (index !== -1) {
      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      storageService.set(key, items);
      return items[index];
    }
    return null;
  },

  delete: (key, id) => {
    const items = storageService.getAll(key);
    const filteredItems = items.filter((item) => item.id !== id);
    if (filteredItems.length !== items.length) {
      storageService.set(key, filteredItems);
      return true;
    }
    return false;
  },

  exportAll: () => {
    const data = {};
    for (const key in KEYS) {
      // We do not export CURRENT_USER so the session isn't hijacked on restore
      if (KEYS[key] !== KEYS.CURRENT_USER) {
        data[KEYS[key]] = storageService.getAll(KEYS[key]);
      }
    }
    return JSON.stringify(data, null, 2);
  },

  importAll: (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      for (const key in KEYS) {
        if (KEYS[key] !== KEYS.CURRENT_USER && data[KEYS[key]]) {
          storageService.set(KEYS[key], data[KEYS[key]]);
        }
      }
      return true;
    } catch (e) {
      console.error("Failed to import data", e);
      return false;
    }
  },

  clearAll: () => {
    for (const key in KEYS) {
      storageService.remove(KEYS[key]);
    }
  }
};
