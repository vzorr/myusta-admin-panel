// src/services/databaseExportService.js - Comprehensive database export functionality
import TableService from './tableService';
import logger from '../utils/logger';

class DatabaseExportService {
  constructor(token) {
    this.tableService = new TableService(token);
    this.exportProgress = {};
  }

  // Update token if needed
  updateToken(token) {
    this.tableService.updateToken(token);
  }

  // Export all table data from a backend
  async exportAllTableData(backend, tables, options = {}) {
    const {
      maxRecordsPerTable = 1000,
      includeMetadata = true,
      onProgress = null,
      batchSize = 5 // Process tables in batches to avoid overwhelming the server
    } = options;

    logger.info(`Starting data export for ${backend} backend`, {
      tableCount: tables.length,
      maxRecordsPerTable
    });

    const exportData = {
      database: backend,
      exportType: 'data',
      exportedAt: new Date().toISOString(),
      metadata: {
        tableCount: tables.length,
        maxRecordsPerTable,
        exportOptions: options
      },
      tables: {},
      summary: {
        totalTables: 0,
        successfulTables: 0,
        failedTables: 0,
        totalRecords: 0,
        errors: []
      }
    };

    // Process tables in batches
    for (let i = 0; i < tables.length; i += batchSize) {
      const batch = tables.slice(i, i + batchSize);
      const batchPromises = batch.map(table => this.exportSingleTableData(table, maxRecordsPerTable));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          const table = batch[index];
          const progress = Math.round(((i + index + 1) / tables.length) * 100);
          
          if (onProgress) {
            onProgress(progress, `Processing ${table.name}...`);
          }

          if (result.status === 'fulfilled' && result.value.success) {
            exportData.tables[table.name] = result.value.data;
            exportData.summary.successfulTables++;
            exportData.summary.totalRecords += result.value.data.recordCount;
          } else {
            const error = result.status === 'rejected' 
              ? result.reason.message 
              : result.value.error;
            
            exportData.summary.errors.push({
              table: table.name,
              error: error
            });
            exportData.summary.failedTables++;
            
            logger.warn(`Failed to export data from ${table.name}:`, error);
          }
        });
      } catch (error) {
        logger.error(`Batch export failed for batch ${i / batchSize + 1}:`, error);
        
        // Mark all tables in this batch as failed
        batch.forEach(table => {
          exportData.summary.errors.push({
            table: table.name,
            error: `Batch processing failed: ${error.message}`
          });
          exportData.summary.failedTables++;
        });
      }
    }

    exportData.summary.totalTables = tables.length;
    exportData.completedAt = new Date().toISOString();
    exportData.duration = new Date(exportData.completedAt) - new Date(exportData.exportedAt);

    logger.success(`Data export completed for ${backend}`, exportData.summary);

    if (onProgress) {
      onProgress(100, 'Export completed!');
    }

    return {
      success: true,
      data: exportData
    };
  }

  // Export single table data
  async exportSingleTableData(table, maxRecords = 1000) {
    try {
      const startTime = Date.now();
      
      // Fetch table data with pagination
      const result = await this.tableService.getTableData(table, {
        page: 1,
        size: maxRecords,
        search: '',
        sortBy: table.primaryKey || 'id',
        sortOrder: 'ASC'
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch table data');
      }

      const tableData = {
        tableName: table.tableName,
        displayName: table.displayName,
        backend: table.backend,
        recordCount: result.records.length,
        maxRecordsReached: result.records.length >= maxRecords,
        pagination: result.pagination,
        data: result.records,
        metadata: {
          attributes: table.attributes,
          associations: table.associations,
          primaryKey: table.primaryKey || 'id'
        },
        exportedAt: new Date().toISOString(),
        exportDuration: Date.now() - startTime
      };

      return {
        success: true,
        data: tableData
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Export all table schemas from a backend
  async exportAllTableSchemas(backend, tables, options = {}) {
    const {
      includeStatistics = true,
      onProgress = null,
      batchSize = 10 // Schemas are lighter, can process more at once
    } = options;

    logger.info(`Starting schema export for ${backend} backend`, {
      tableCount: tables.length
    });

    const exportSchema = {
      database: backend,
      exportType: 'schema',
      exportedAt: new Date().toISOString(),
      metadata: {
        tableCount: tables.length,
        includeStatistics,
        exportOptions: options
      },
      tables: {},
      summary: {
        totalTables: 0,
        successfulTables: 0,
        failedTables: 0,
        totalAttributes: 0,
        totalAssociations: 0,
        errors: []
      }
    };

    // Process tables in batches
    for (let i = 0; i < tables.length; i += batchSize) {
      const batch = tables.slice(i, i + batchSize);
      const batchPromises = batch.map(table => this.exportSingleTableSchema(table, includeStatistics));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          const table = batch[index];
          const progress = Math.round(((i + index + 1) / tables.length) * 100);
          
          if (onProgress) {
            onProgress(progress, `Processing ${table.name} schema...`);
          }

          if (result.status === 'fulfilled' && result.value.success) {
            exportSchema.tables[table.name] = result.value.data;
            exportSchema.summary.successfulTables++;
            exportSchema.summary.totalAttributes += result.value.data.statistics.attributeCount;
            exportSchema.summary.totalAssociations += result.value.data.statistics.associationCount;
          } else {
            const error = result.status === 'rejected' 
              ? result.reason.message 
              : result.value.error;
            
            exportSchema.summary.errors.push({
              table: table.name,
              error: error
            });
            exportSchema.summary.failedTables++;
            
            logger.warn(`Failed to export schema from ${table.name}:`, error);
          }
        });
      } catch (error) {
        logger.error(`Schema batch export failed for batch ${i / batchSize + 1}:`, error);
        
        batch.forEach(table => {
          exportSchema.summary.errors.push({
            table: table.name,
            error: `Batch processing failed: ${error.message}`
          });
          exportSchema.summary.failedTables++;
        });
      }
    }

    exportSchema.summary.totalTables = tables.length;
    exportSchema.completedAt = new Date().toISOString();
    exportSchema.duration = new Date(exportSchema.completedAt) - new Date(exportSchema.exportedAt);

    logger.success(`Schema export completed for ${backend}`, exportSchema.summary);

    if (onProgress) {
      onProgress(100, 'Schema export completed!');
    }

    return {
      success: true,
      data: exportSchema
    };
  }

  // Export single table schema
  async exportSingleTableSchema(table, includeStatistics = true) {
    try {
      const startTime = Date.now();
      
      const result = await this.tableService.getTableSchema(table);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch table schema');
      }

      const schemaData = {
        tableName: table.tableName,
        displayName: table.displayName,
        backend: table.backend,
        model: result.model,
        attributes: result.attributes || [],
        associations: result.associations || [],
        statistics: includeStatistics ? this.calculateSchemaStatistics(result.attributes, result.associations) : null,
        exportedAt: new Date().toISOString(),
        exportDuration: Date.now() - startTime
      };

      return {
        success: true,
        data: schemaData
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Calculate schema statistics
  calculateSchemaStatistics(attributes = [], associations = []) {
    const attributeStats = attributes.reduce((stats, attr) => {
      // Count by type
      stats.typeDistribution[attr.type] = (stats.typeDistribution[attr.type] || 0) + 1;
      
      // Count constraints
      if (!attr.allowNull) stats.requiredFields++;
      if (attr.unique) stats.uniqueFields++;
      if (attr.primaryKey) stats.primaryKeys++;
      if (attr.autoIncrement) stats.autoIncrementFields++;
      
      // Validation rules
      if (attr.validate && Object.keys(attr.validate).length > 0) {
        stats.fieldsWithValidation++;
      }
      
      return stats;
    }, {
      attributeCount: attributes.length,
      requiredFields: 0,
      uniqueFields: 0,
      primaryKeys: 0,
      autoIncrementFields: 0,
      fieldsWithValidation: 0,
      typeDistribution: {}
    });

    const associationStats = associations.reduce((stats, assoc) => {
      stats.typeDistribution[assoc.type] = (stats.typeDistribution[assoc.type] || 0) + 1;
      return stats;
    }, {
      associationCount: associations.length,
      typeDistribution: {}
    });

    return {
      ...attributeStats,
      associations: associationStats,
      complexity: this.calculateComplexityScore(attributeStats, associationStats)
    };
  }

  // Calculate table complexity score
  calculateComplexityScore(attributeStats, associationStats) {
    const attributeComplexity = attributeStats.attributeCount * 1;
    const associationComplexity = associationStats.associationCount * 2;
    const constraintComplexity = (attributeStats.requiredFields + attributeStats.uniqueFields) * 0.5;
    const validationComplexity = attributeStats.fieldsWithValidation * 1.5;
    
    const totalComplexity = attributeComplexity + associationComplexity + constraintComplexity + validationComplexity;
    
    if (totalComplexity < 10) return 'Simple';
    if (totalComplexity < 25) return 'Moderate';
    if (totalComplexity < 50) return 'Complex';
    return 'Highly Complex';
  }

  // Export complete database (both data and schema)
  async exportCompleteDatabase(backend, tables, options = {}) {
    const {
      maxRecordsPerTable = 1000,
      includeMetadata = true,
      onProgress = null
    } = options;

    logger.info(`Starting complete database export for ${backend}`);

    try {
      // Export schemas first (faster)
      if (onProgress) onProgress(10, 'Exporting schemas...');
      
      const schemaResult = await this.exportAllTableSchemas(backend, tables, {
        includeStatistics: true,
        onProgress: (progress, message) => {
          if (onProgress) onProgress(10 + (progress * 0.3), message);
        }
      });

      if (!schemaResult.success) {
        throw new Error('Schema export failed');
      }

      // Export data second
      if (onProgress) onProgress(40, 'Exporting data...');
      
      const dataResult = await this.exportAllTableData(backend, tables, {
        maxRecordsPerTable,
        includeMetadata,
        onProgress: (progress, message) => {
          if (onProgress) onProgress(40 + (progress * 0.6), message);
        }
      });

      if (!dataResult.success) {
        throw new Error('Data export failed');
      }

      // Combine results
      const completeExport = {
        database: backend,
        exportType: 'complete',
        exportedAt: new Date().toISOString(),
        metadata: {
          tableCount: tables.length,
          maxRecordsPerTable,
          exportOptions: options
        },
        schemas: schemaResult.data,
        data: dataResult.data,
        summary: {
          totalTables: tables.length,
          schemaExport: schemaResult.data.summary,
          dataExport: dataResult.data.summary,
          overallSuccess: schemaResult.data.summary.successfulTables > 0 || dataResult.data.summary.successfulTables > 0
        },
        completedAt: new Date().toISOString()
      };

      completeExport.duration = new Date(completeExport.completedAt) - new Date(completeExport.exportedAt);

      if (onProgress) onProgress(100, 'Complete export finished!');

      logger.success(`Complete database export finished for ${backend}`, completeExport.summary);

      return {
        success: true,
        data: completeExport
      };
    } catch (error) {
      logger.error(`Complete database export failed for ${backend}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Download JSON file
  downloadJSON(data, filename) {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      logger.success(`Downloaded export file: ${filename}`);
      return true;
    } catch (error) {
      logger.error(`Failed to download file ${filename}:`, error);
      return false;
    }
  }

  // Generate filename with timestamp
  generateFilename(backend, exportType, extension = 'json') {
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const timeStamp = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '');
    return `${backend}_${exportType}_${timestamp}_${timeStamp}.${extension}`;
  }

  // Get export progress
  getExportProgress(backend) {
    return this.exportProgress[backend] || null;
  }

  // Set export progress
  setExportProgress(backend, progress) {
    this.exportProgress[backend] = progress;
  }

  // Clear export progress
  clearExportProgress(backend) {
    delete this.exportProgress[backend];
  }
}

export default DatabaseExportService;