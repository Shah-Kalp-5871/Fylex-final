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

const AttributeList = () => {
  const { data, addRecord, updateRecord, deleteRecord } = useAdminData();
  const attributesRaw = data.attributes || [];

  const [view, setView] = useState('list');
  const [selectedAttributeId, setSelectedAttributeId] = useState(null);
  const [showAddAttrModal, setShowAddAttrModal] = useState(false);
  const [showAddValueModal, setShowAddValueModal] = useState(false);
  const [attrForm, setAttrForm] = useState({ name: '', code: '', type: 'select', is_variant: true });
  const [valForm, setValForm] = useState({ label: '', value: '#000000' });
  const listRef = useRef(null);
  const valuesRef = useRef(null);

  const selectedAttribute = attributesRaw.find(a => a.id === selectedAttributeId);

  const handleSaveAttribute = () => {
    if (!attrForm.name) return;
    addRecord('attributes', {
      name: attrForm.name,
      code: attrForm.code || attrForm.name.toLowerCase().replace(/ /g, '_'),
      type: attrForm.type,
      is_variant: attrForm.is_variant,
      status: true,
      values_count: 0,
      options: []
    });
    setAttrForm({ name: '', code: '', type: 'select', is_variant: true });
    setShowAddAttrModal(false);
  };

  const handleSaveValue = () => {
    if (!valForm.label || !selectedAttribute) return;
    const newOptions = [...(selectedAttribute.options || []), { id: Date.now(), label: valForm.label, value: valForm.value, status: true }];
    updateRecord('attributes', selectedAttribute.id, { options: newOptions, values_count: newOptions.length });
    setValForm({ label: '', value: selectedAttribute.type === 'color' ? '#000000' : '' });
    setShowAddValueModal(false);
  };

  const handleDeleteValue = (valId) => {
    if (window.confirm('Delete this option?')) {
      const newOptions = selectedAttribute.options.filter(o => o.id !== valId);
      updateRecord('attributes', selectedAttribute.id, { options: newOptions, values_count: newOptions.length });
    }
  };

  // ─── Values View ───
  if (view === 'values' && selectedAttribute) {
    const values = selectedAttribute.options || [];
    const valueColumns = [
      { title: 'ID', field: 'id', width: 80, hozAlign: 'center', formatter: (cell) => `<span style="color:#8a96b0;font-size:12px">#${cell.getValue()}</span>` },
      { title: 'Label', field: 'label', minWidth: 120, widthGrow: 1.5, formatter: (cell) => `<span style="font-weight:600;color:#0e1726">${cell.getValue()}</span>` },
      {
        title: 'Value', field: 'value', minWidth: 140, widthGrow: 1.5,
        formatter: (cell) => {
          if (selectedAttribute.type === 'color') {
            return `<div style="display:flex;align-items:center;gap:8px">
              <div style="width:20px;height:20px;border-radius:5px;border:1px solid #e4e8f0;background:${cell.getValue()};flex-shrink:0"></div>
              <span style="font-size:12px;font-family:monospace;color:#4b5a7a">${cell.getValue()}</span>
            </div>`;
          }
          return `<span style="color:#4b5a7a">${cell.getValue()}</span>`;
        }
      },
      {
        title: 'Status', field: 'status', width: 100, hozAlign: 'center',
        formatter: (cell) => `<span class="status-pill ${cell.getValue() ? 'pill-active' : 'pill-inactive'}">${cell.getValue() ? 'Active' : 'Inactive'}</span>`
      },
      {
        title: 'Actions', headerSort: false, hozAlign: 'right', width: 90,
        formatter: () => `<div style="display:flex;gap:6px;justify-content:flex-end"><button class="btn-icon btn-icon-delete"><i class="fas fa-trash-alt"></i></button></div>`,
        cellClick: (e, cell) => {
          if (e.target.closest('.btn-icon-delete')) handleDeleteValue(cell.getRow().getData().id);
        }
      }
    ];

    return (
      <>
        <div className="space-y-6">
          <div className="page-header">
            <div>
              <h2>{selectedAttribute.name} Values</h2>
              <p>Type: {selectedAttribute.type} · Code: {selectedAttribute.code}</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" onClick={() => setView('list')}><i className="fas fa-arrow-left mr-2"></i>Back</button>
              <button className="btn-primary" onClick={() => setShowAddValueModal(true)}><i className="fas fa-plus mr-2"></i>Add Value</button>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header"><h3>Attribute Values</h3><span style={{ fontSize: 12, color: '#8a96b0', fontWeight: 600 }}>{values.length} options</span></div>
            <div style={tableWrapStyle}>
              <ReactTabulator
                ref={valuesRef}
                data={values}
                columns={valueColumns}
                layout="fitDataFill"
                pagination
                paginationSize={10}
                options={{ minWidth: 480 }}
              />
            </div>
          </div>
        </div>

        {/* Add Attribute Value Modal */}
        <AdminModal
          isOpen={showAddValueModal}
          onClose={() => setShowAddValueModal(false)}
          title={`Add ${selectedAttribute.name} Value`}
          maxWidth={400}
          footer={
            <>
              <button className="btn-secondary" onClick={() => setShowAddValueModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveValue}><i className="fas fa-save mr-2"></i>Save Value</button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label>Label</label>
              <input type="text" className="form-control" placeholder={`e.g. ${selectedAttribute.type === 'color' ? 'Red' : 'Large'}`} value={valForm.label} onChange={e => setValForm({ ...valForm, label: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Value</label>
              {selectedAttribute.type === 'color' ? (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="color" value={valForm.value} onChange={e => setValForm({ ...valForm, value: e.target.value })} style={{ width: 44, height: 44, padding: 2, border: '1px solid #e4e8f0', borderRadius: 9, cursor: 'pointer' }} />
                  <input type="text" className="form-control" placeholder="#000000" value={valForm.value} onChange={e => setValForm({ ...valForm, value: e.target.value })} />
                </div>
              ) : (
                <input type="text" className="form-control" placeholder={`e.g. ${selectedAttribute.type === 'select' ? 'L' : 'Leather'}`} value={valForm.value} onChange={e => setValForm({ ...valForm, value: e.target.value })} />
              )}
            </div>
          </div>
        </AdminModal>
      </>
    );
  }

  // ─── Main Attribute List ───
  const columns = [
    {
      title: 'Attribute', field: 'name', minWidth: 160, widthGrow: 1.5, responsive: 0,
      formatter: (cell) => {
        const d = cell.getRow().getData();
        return `<div><div style="font-weight:600;color:#0e1726;font-size:13px">${d.name}</div><div style="font-size:11px;color:#8a96b0;font-family:monospace">#${d.code}</div></div>`;
      }
    },
    {
      title: 'Type', field: 'type', width: 120,
      formatter: (cell) => `<span style="font-family:'SF Mono','Fira Code',monospace;font-size:12px;font-weight:600;color:#4f46e5;background:#eef0ff;padding:4px 10px;border-radius:6px;text-transform:capitalize">${cell.getValue()}</span>`
    },
    {
      title: 'Values', field: 'values_count', width: 110, hozAlign: 'center',
      formatter: (cell) => {
        const d = cell.getRow().getData();
        return `<button class="values-btn" data-id="${d.id}" style="font-size:13px;font-weight:600;color:#4f46e5;background:#eef0ff;border:none;border-radius:7px;padding:4px 12px;cursor:pointer">${cell.getValue()} Values</button>`;
      }
    },
    {
      title: 'Variant', field: 'is_variant', width: 90, hozAlign: 'center',
      formatter: (cell) => cell.getValue()
        ? `<i class="fas fa-check-circle" style="color:#059669;font-size:15px"></i>`
        : `<i class="fas fa-times-circle" style="color:#e4e8f0;font-size:15px"></i>`
    },
    {
      title: 'Status', field: 'status', width: 100, hozAlign: 'center',
      formatter: (cell) => `<span class="status-pill ${cell.getValue() ? 'pill-active' : 'pill-inactive'}">${cell.getValue() ? 'Active' : 'Inactive'}</span>`
    },
    {
      title: 'Actions', headerSort: false, hozAlign: 'right', width: 90,
      formatter: () => `<div style="display:flex;gap:6px;justify-content:flex-end"><button class="btn-icon btn-icon-delete"><i class="fas fa-trash-alt"></i></button></div>`,
      cellClick: (e, cell) => {
        const attr = cell.getRow().getData();
        if (e.target.closest('.btn-icon-delete')) {
          if (window.confirm('Delete this attribute and all its options?')) deleteRecord('attributes', attr.id);
        }
        if (e.target.closest('.values-btn')) {
          setSelectedAttributeId(attr.id);
          setView('values');
        }
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h2>Product Attributes</h2>
          <p>Manage attributes and variant options</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddAttrModal(true)}><i className="fas fa-plus mr-2"></i>Add Attribute</button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header"><h3>All Attributes</h3></div>
        <div style={tableWrapStyle}>
          <ReactTabulator
            ref={listRef}
            data={attributesRaw}
            columns={columns}
            layout="fitDataFill"
            pagination
            paginationSize={10}
            options={{ minWidth: 560 }}
          />
        </div>
      </div>

      {/* Add New Attribute Modal */}
      <AdminModal
        isOpen={showAddAttrModal}
        onClose={() => setShowAddAttrModal(false)}
        title="Add New Attribute"
        maxWidth={480}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowAddAttrModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSaveAttribute}><i className="fas fa-save mr-2"></i>Save Attribute</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group"><label>Attribute Name</label><input type="text" className="form-control" placeholder="e.g. Strap Material" value={attrForm.name} onChange={e => setAttrForm({ ...attrForm, name: e.target.value })} /></div>
          <div className="form-group"><label>Attribute Code</label><input type="text" className="form-control" placeholder="e.g. strap_material" value={attrForm.code} onChange={e => setAttrForm({ ...attrForm, code: e.target.value })} /></div>
          <div className="form-group">
            <label>Input Type</label>
            <select className="form-control" value={attrForm.type} onChange={e => setAttrForm({ ...attrForm, type: e.target.value })}>
              <option value="select">Select / Dropdown</option><option value="color">Color Swatch</option><option value="text">Text Label</option>
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 4 }}>
            <input type="checkbox" style={{ width: 16, height: 16 }} checked={attrForm.is_variant} onChange={e => setAttrForm({ ...attrForm, is_variant: e.target.checked })} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#4b5a7a' }}>Use as Variant Attribute</span>
          </label>
        </div>
      </AdminModal>
    </div>
  );
};

export default AttributeList;
