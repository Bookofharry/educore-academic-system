import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings as SettingsIcon, Download, Upload, AlertOctagon } from 'lucide-react';
import { storageService } from '../../services/storage';

const Settings = () => {
  const { logout } = useAuth();
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState({ message: '', type: '' });

  const handleExport = () => {
    const dataStr = storageService.exportAll();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'sms-backup.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const success = storageService.importAll(content);
      if (success) {
        setImportStatus({ message: 'Data imported successfully! Please log in again.', type: 'success' });
        setTimeout(() => {
          logout();
          window.location.reload();
        }, 2000);
      } else {
        setImportStatus({ message: 'Failed to import data. Invalid format.', type: 'error' });
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const handleFactoryReset = () => {
    const confirmed = window.confirm(
      "WARNING: This will permanently delete all students, lecturers, courses, and results from your browser. Are you sure you want to continue?"
    );
    if (confirmed) {
      storageService.clearAll();
      logout();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-blue-600" />
            System Settings
          </h1>
          <p className="text-sm text-slate-500">Manage data backups and system configurations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Management */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-semibold text-slate-800">Data Management</h2>
            <p className="text-sm text-slate-500">Export or import application data</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Export Data Backup</h3>
              <p className="text-sm text-slate-500 mb-4">
                Download a complete JSON backup of all students, courses, results, and settings.
              </p>
              <button 
                onClick={handleExport}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg flex justify-center items-center gap-2 text-sm font-medium transition-colors border border-slate-300"
              >
                <Download className="h-4 w-4" />
                Export backup.json
              </button>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Restore from Backup</h3>
              <p className="text-sm text-slate-500 mb-4">
                Upload a previously exported backup file to restore your system state. This will overwrite current data.
              </p>
              <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                className="hidden" 
              />
              <button 
                onClick={handleImportClick}
                className="w-full sm:w-auto bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg flex justify-center items-center gap-2 text-sm font-medium transition-colors border border-blue-200"
              >
                <Upload className="h-4 w-4" />
                Upload backup.json
              </button>

              {importStatus.message && (
                <div className={`mt-4 p-3 rounded-md text-sm ${importStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {importStatus.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
          <div className="p-4 border-b border-red-100 bg-red-50">
            <h2 className="font-semibold text-red-800">Danger Zone</h2>
            <p className="text-sm text-red-600">Destructive actions</p>
          </div>
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-full text-red-600 shrink-0">
                <AlertOctagon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Factory Reset</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Permanently wipe all records from the browser storage and reset the system back to the initial demo seed data. This action cannot be undone unless you have a backup.
                </p>
                <button 
                  onClick={handleFactoryReset}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex justify-center items-center text-sm font-medium transition-colors shadow-sm"
                >
                  Reset System
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
