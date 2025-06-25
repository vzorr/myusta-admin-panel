// src/components/windows/TableSchemaWindow.js
import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Database, 
  Key, 
  Link2, 
  Info, 
  FileText,
  Hash,
  Type,
  CheckCircle,
  XCircle,
  AlertCircle,
  Layers
} from 'lucide-react';
import TableService from '../../services/tableService';
import { useAuth } from '../../context/AuthContext';

const TableSchemaWindow = ({ window }) => {
  const { token } = useAuth();
  const [tableService] = useState(() => new TableService(token));
  
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(window.data?.activeTab || 'attributes');

  const { table } = window;

  const fetchSchema = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await tableService.getTableSchema(table);
      
      if (result.success) {
        setSchema(result);
      } else {
        setError(result.error || 'Failed to fetch schema');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchema();
  }, [table.name]);

  const getTypeIcon = (type) => {
    const typeMap = {
      'INTEGER': <Hash className="w-4 h-4 text-blue-600" />,
      'STRING': <Type className="w-4 h-4 text-green-600" />,
      'TEXT': <FileText className="w-4 h-4 text-purple-600" />,
      'BOOLEAN': <CheckCircle className="w-4 h-4 text-orange-600" />,
      'DATE': <Database className="w-4 h-4 text-red-600" />,
      'DATEONLY': <Database className="w-4 h-4 text-red-600" />,
      'ENUM': <Layers className="w-4 h-4 text-indigo-600" />,
      'JSON': <FileText className="w-4 h-4 text-teal-600" />,
      'JSONB': <FileText className="w-4 h-4 text-teal-600" />
    };
    
    return typeMap[type] || <Type className="w-4 h-4 text-gray-600" />;
  };

  const getAssociationIcon = (type) => {
    const iconMap = {
      'HasMany': <Link2 className="w-4 h-4 text-blue-600" />,
      'HasOne': <Link2 className="w-4 h-4 text-green-600" />,
      'BelongsTo': <Link2 className="w-4 h-4 text-purple-600" />,
      'BelongsToMany': <Link2 className="w-4 h-4 text-orange-600" />
    };
    
    return iconMap[type] || <Link2 className="w-4 h-4 text-gray-600" />;
  };

  const AttributesTab = () => (
    <div className="overflow-auto">
      <table className="w-full">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Field Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Constraints
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Default
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Validation
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {schema?.attributes?.map((attr) => (
            <tr key={attr.name} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center space-x-2">
                  {attr.primaryKey && <Key className="w-4 h-4 text-yellow-600" title="Primary Key" />}
                  <span className="font-medium text-gray-900">{attr.name}</span>
                  {attr.unique && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">UNIQUE</span>}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(attr.type)}
                  <span className="text-sm text-gray-900">{attr.type}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {attr.allowNull ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">NULL</span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">NOT NULL</span>
                  )}
                  {attr.autoIncrement && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">AUTO_INCREMENT</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {attr.defaultValue !== null ? attr.defaultValue?.toString() : '-'}
              </td>
              <td className="px-4 py-3">
                {attr.validate && Object.keys(attr.validate).length > 0 ? (
                  <div className="text-xs text-gray-600">
                    {Object.entries(attr.validate).map(([key, value]) => (
                      <div key={key} className="mb-1">
                        <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">None</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const AssociationsTab = () => (
    <div className="overflow-auto">
      <table className="w-full">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Association Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Target Model
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Foreign Key
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Source Key
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {schema?.associations?.map((assoc, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center space-x-2">
                  {getAssociationIcon(assoc.type)}
                  <span className="font-medium text-gray-900">{assoc.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  assoc.type === 'HasMany' ? 'bg-blue-100 text-blue-800' :
                  assoc.type === 'HasOne' ? 'bg-green-100 text-green-800' :
                  assoc.type === 'BelongsTo' ? 'bg-purple-100 text-purple-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {assoc.type}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                {assoc.target}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {assoc.foreignKey || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {assoc.sourceKey || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {(!schema?.associations || schema.associations.length === 0) && (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No associations found</p>
          </div>
        </div>
      )}
    </div>
  );

  const InfoTab = () => (
    <div className="p-6 space-y-6">
      {/* Model Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Model Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Model Name</label>
            <p className="text-sm text-gray-900">{schema?.model?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Table Name</label>
            <p className="text-sm text-gray-900 font-mono">{schema?.model?.tableName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Primary Key</label>
            <p className="text-sm text-gray-900">{schema?.model?.primaryKey}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Backend</label>
            <p className="text-sm text-gray-900 capitalize">{table.backend}</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {schema?.statistics && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{schema.statistics.totalFields || 0}</div>
              <div className="text-sm text-gray-500">Total Fields</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{schema.statistics.totalAssociations || 0}</div>
              <div className="text-sm text-gray-500">Associations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{schema.statistics.requiredFields || 0}</div>
              <div className="text-sm text-gray-500">Required Fields</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{schema.statistics.uniqueFields || 0}</div>
              <div className="text-sm text-gray-500">Unique Fields</div>
            </div>
          </div>
        </div>
      )}

      {/* Field Types Summary */}
      {schema?.attributes && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Field Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(
              schema.attributes.reduce((acc, attr) => {
                acc[attr.type] = (acc[attr.type] || 0) + 1;
                return acc;
              }, {})
            ).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-2 bg-white rounded">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(type)}
                  <span className="text-sm text-gray-900">{type}</span>
                </div>
                <span className="text-sm font-medium text-gray-600">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading schema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchSchema}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'attributes', label: 'Attributes', icon: Type },
    { id: 'associations', label: 'Associations', icon: Link2 },
    { id: 'info', label: 'Information', icon: Info }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-gray-200 bg-gray-50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === 'attributes' && schema?.attributes && (
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                  {schema.attributes.length}
                </span>
              )}
              {tab.id === 'associations' && schema?.associations && (
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                  {schema.associations.length}
                </span>
              )}
            </button>
          );
        })}
        
        <div className="ml-auto px-4">
          <button
            onClick={fetchSchema}
            disabled={loading}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'attributes' && <AttributesTab />}
        {activeTab === 'associations' && <AssociationsTab />}
        {activeTab === 'info' && <InfoTab />}
      </div>
    </div>
  );
};

export default TableSchemaWindow;