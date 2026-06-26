"use client";
import React, { useState, useRef } from 'react';
import { ReactTabulator } from 'react-tabulator';
import 'react-tabulator/lib/styles.css';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '../../css/datatable.css';
import '../../css/custom.css';
import { useAdminData } from '@/context/AdminDataContext';
import AdminModal from '@/components/admin/AdminModal';

const tableWrapStyle = {
  width: '100%',
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
};

const SpecificationList = () => {
  const { data, addRecord, deleteRecord } = useAdminData();
  const specifications = data.specifications || [];
  const groups = data.specificationGroups || [];
  const [activeTab, setActiveTab] = useState('specs');
  const [showAddSpecModal, setShowAddSpecModal] = useState(false);
  const [specForm, setSpecForm] = useState({ name: '', code: '', input_type: 'text', is_required: false });
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: '' });
  const specsRef = useRef(null);
  const groupsRef = useRef(null);

  const handleSaveSpec = () => {
    if (!specForm.name) return;
    addRecord('specifications', { ...specForm, status: true });
    setSpecForm({ name: '', code: '', input_type: 'text', is_required: false });
    setShowAddSpecModal(false);
  };

  const handleSaveGroup = () => {
    if (!groupForm.name) return;
    addRecord('specificationGroups', { ...groupForm, specs_count: 0, status: true });
    setGroupForm({ name: '' });
    setShowAddGroupModal(false);
  };

  const specColumns = [
    {
      title: 'Specification', field: 'name', minWidth: 160, widthGrow: 1.5,
      formatter: (cell) => {
        const d = cell.getRow().getData();
        return `<div><div style="font-weight:600;color:#0e1726;font-size:13px">${d.name}</div><div style="font-size:11px;color:#8a96b0;font-family:monospace">#${d.code}</div></div>`;
      }
    },
    {
      title: 'Input Type', field: 'input_type', width: 130,
      formatter: (cell) => `<span style="font-family:'SF Mono','Fira Code',monospace;font-size:12px;font-weight:600;color:#4f46e5;background:#eef0ff;padding:4px 10px;border-radius:6px;text-transform:capitalize">${cell.getValue()}</span>`
    },
    {
      title: 'Required', field: 'is_required', width: 110, hozAlign: 'center',
      formatter: (cell) => cell.getValue()
        ? `<span style="font-size:11px;font-weight:700;color:#dc2626;background:#fef2f2;padding:3px 8px;border-radius:6px">Required</span>`
        : `<span style="font-size:11px;color:#8a96b0">Optional</span>`
    },
    {
      title: 'Status', field: 'status', width: 100, hozAlign: 'center',
      formatter: (cell) => `<span class="status-pill ${cell.getValue() ? 'pill-active' : 'pill-inactive'}">${cell.getValue() ? 'Active' : 'Inactive'}</span>`
    },
    {
      title: 'Actions', headerSort: false, hozAlign: 'right', width: 90,
      formatter: () => `<div style="display:flex;gap:6px;justify-content:flex-end"><button class="btn-icon btn-icon-delete"><i class="fas fa-trash-alt"></i></button></div>`,
      cellClick: (e, cell) => {
        if (e.target.closest('.btn-icon-delete')) {
          if (window.confirm('Delete spec?')) deleteRecord('specifications', cell.getRow().getData().id);
        }
      }
    }
  ];

  const groupColumns = [
    { title: 'Group Name', field: 'name', minWidth: 160, widthGrow: 2, formatter: (cell) => `<span style="font-weight:600;color:#0e1726;font-size:13px">${cell.getValue()}</span>` },
    { title: 'Specs', field: 'specs_count', width: 90, hozAlign: 'center', formatter: (cell) => `<span style="font-weight:700">${cell.getValue()}</span>` },
    {
      title: 'Status', field: 'status', width: 100, hozAlign: 'center',
      formatter: (cell) => `<span class="status-pill ${cell.getValue() ? 'pill-active' : 'pill-inactive'}">${cell.getValue() ? 'Active' : 'Inactive'}</span>`
    },
    {
      title: 'Actions', headerSort: false, hozAlign: 'right', width: 90,
      formatter: () => `<div style="display:flex;gap:6px;justify-content:flex-end"><button class="btn-icon btn-icon-delete"><i class="fas fa-trash-alt"></i></button></div>`,
      cellClick: (e, cell) => {
        if (e.target.closest('.btn-icon-delete')) {
          if (window.confirm('Delete group?')) deleteRecord('specificationGroups', cell.getRow().getData().id);
        }
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div><h2>Specifications</h2><p>Technical details and spec groups</p></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => setShowAddSpecModal(true)}><i className="fas fa-plus mr-2"></i>New Spec</button>
          <button className="btn-primary" onClick={() => setShowAddGroupModal(true)}><i className="fas fa-layer-group mr-2"></i>Create Group</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '2px solid #f1f4f9', display: 'flex', gap: 4 }}>
        {[{ key: 'specs', label: 'Specifications', icon: 'fa-list-alt' }, { key: 'groups', label: 'Groups', icon: 'fa-layer-group' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 18px', border: 'none', borderBottom: activeTab === tab.key ? '2px solid #4f46e5' : '2px solid transparent',
            marginBottom: -2, background: 'none', font: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            color: activeTab === tab.key ? '#4f46e5' : '#8a96b0', transition: 'all 0.15s'
          }}>
            <i className={`fas ${tab.icon} mr-2`}></i>{tab.label}
          </button>
        ))}
      </div>

      <div className="admin-card">
        <div style={tableWrapStyle}>
          {activeTab === 'specs' ? (
            <ReactTabulator
              ref={specsRef}
              data={specifications}
              columns={specColumns}
              layout="fitDataFill"
              pagination
              paginationSize={10}
              options={{ minWidth: 500 }}
            />
          ) : (
            <ReactTabulator
              ref={groupsRef}
              data={groups}
              columns={groupColumns}
              layout="fitDataFill"
              pagination
              paginationSize={10}
              options={{ minWidth: 380 }}
            />
          )}
        </div>
      </div>

      {/* Add Spec Modal */}
      <AdminModal
        isOpen={showAddSpecModal}
        onClose={() => setShowAddSpecModal(false)}
        title="Add New Specification"
        maxWidth={440}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowAddSpecModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSaveSpec}><i className="fas fa-save mr-2"></i>Save Specification</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group"><label>Specification Name</label><input type="text" className="form-control" placeholder="e.g. Water Resistance" value={specForm.name} onChange={e => setSpecForm({ ...specForm, name: e.target.value })} /></div>
          <div className="form-group"><label>Code</label><input type="text" className="form-control" placeholder="e.g. water_resistance" value={specForm.code} onChange={e => setSpecForm({ ...specForm, code: e.target.value })} /></div>
          <div className="form-group">
            <label>Input Type</label>
            <select className="form-control" value={specForm.input_type} onChange={e => setSpecForm({ ...specForm, input_type: e.target.value })}>
              <option value="text">Text Input</option><option value="select">Dropdown Select</option><option value="boolean">Yes / No Match</option>
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: 16, height: 16 }} checked={specForm.is_required} onChange={e => setSpecForm({ ...specForm, is_required: e.target.checked })} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#4b5a7a' }}>Required Field</span>
          </label>
        </div>
      </AdminModal>

      {/* Add Group Modal */}
      <AdminModal
        isOpen={showAddGroupModal}
        onClose={() => setShowAddGroupModal(false)}
        title="Create Spec Group"
        maxWidth={400}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowAddGroupModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSaveGroup}><i className="fas fa-save mr-2"></i>Save Group</button>
          </>
        }
      >
        <div className="form-group"><label>Group Name</label><input type="text" className="form-control" placeholder="e.g. Case Details" value={groupForm.name} onChange={e => setGroupForm({ name: e.target.value })} /></div>
      </AdminModal>
    </div>
  );
};

export default SpecificationList;
