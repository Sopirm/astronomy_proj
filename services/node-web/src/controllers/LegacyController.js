const fs = require('fs');
const path = require('path');
const exceljs = require('exceljs'); // Импорт библиотеки exceljs

class LegacyController {
  async getCSVData(req, res) {
    try {
      const csvOutDir = process.env.CSV_OUT_DIR || '/data/csv';
      const files = await fs.promises.readdir(csvOutDir);
      
      // Filter for telemetry CSV files and sort by timestamp in filename
      const csvFiles = files
        .filter(file => file.startsWith('telemetry_') && file.endsWith('.csv'))
        .sort((a, b) => {
          const timestampA = a.match(/_(\d{8}_\d{6})\.csv/);
          const timestampB = b.match(/_(\d{8}_\d{6})\.csv/);
          if (timestampA && timestampB) {
            return timestampB[1].localeCompare(timestampA[1]);
          }
          return 0;
        });

      if (csvFiles.length === 0) {
        return res.status(404).json({ error: 'No CSV files found.' });
      }

      const latestCsvFile = path.join(csvOutDir, csvFiles[0]);
      const csvContent = await fs.promises.readFile(latestCsvFile, 'utf-8');

      // Parse CSV content (simple parsing for demonstration)
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          let value = values[index];
          // Type conversion based on expected types
          if (header === 'voltage' || header === 'temp' || header === 'numeric_value') {
            value = parseFloat(value);
          } else if (header === 'boolean_status') {
            value = value.toLowerCase() === 'true';
          }
          obj[header] = value;
          return obj;
        }, {});
      });

      res.json(data);
    } catch (error) {
      console.error('Error fetching legacy CSV data:', error);
      res.status(500).json({ error: 'Failed to fetch legacy CSV data.' });
    }
  }

  async exportXLSX(req, res) {
    try {
      // Используем ту же логику для чтения CSV, что и в getCSVData
      const csvOutDir = process.env.CSV_OUT_DIR || '/data/csv';
      const files = await fs.promises.readdir(csvOutDir);
      
      const csvFiles = files
        .filter(file => file.startsWith('telemetry_') && file.endsWith('.csv'))
        .sort((a, b) => {
          const timestampA = a.match(/_(\d{8}_\d{6})\.csv/);
          const timestampB = b.match(/_(\d{8}_\d{6})\.csv/);
          if (timestampA && timestampB) {
            return timestampB[1].localeCompare(timestampA[1]);
          }
          return 0;
        });

      if (csvFiles.length === 0) {
        return res.status(404).json({ error: 'No CSV files found for export.' });
      }

      const latestCsvFile = path.join(csvOutDir, csvFiles[0]);
      const csvContent = await fs.promises.readFile(latestCsvFile, 'utf-8');

      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => line.split(',')); // Оставляем строками для XLSX

      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet('Legacy Data');

      worksheet.columns = headers.map(header => ({ header: header.replace(/_/g, ' ').toUpperCase(), key: header, width: 20 }));
      worksheet.addRows(data);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="legacy_data.xlsx"');

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Error exporting legacy data to XLSX:', error);
      res.status(500).json({ error: 'Failed to export legacy data to XLSX.' });
    }
  }
}

module.exports = LegacyController;
