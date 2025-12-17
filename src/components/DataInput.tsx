import { useState } from 'react';
import { Upload, Shuffle, PenTool, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import type { DataPoint, InputMode } from '@/types/population';
import { generateRandomDataset } from '@/utils/populationModel';

interface DataInputProps {
  onDataSubmit: (data: DataPoint[], mode: InputMode) => void;
}

export function DataInput({ onDataSubmit }: DataInputProps) {
  const [mode, setMode] = useState<InputMode>('manual');
  const [manualData, setManualData] = useState({
    p0: '1000',
    r: '1.5',
    k: '10000',
    years: '10',
  });
  const [csvData, setCsvData] = useState<DataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleManualSubmit = () => {
    setError(null);
    const p0 = parseFloat(manualData.p0);
    const years = parseInt(manualData.years);

    if (isNaN(p0) || p0 <= 0) {
      setError('Initial population must be a positive number');
      return;
    }
    if (isNaN(years) || years < 1 || years > 100) {
      setError('Years must be between 1 and 100');
      return;
    }

    // Generate simple dataset from initial values
    const data: DataPoint[] = [];
    const currentYear = new Date().getFullYear();
    let pop = p0;
    const r = parseFloat(manualData.r);
    const k = parseFloat(manualData.k);

    for (let i = 0; i < years; i++) {
      data.push({ year: currentYear + i, population: Math.round(pop) });
      pop = r * pop * (1 - pop / k);
      pop = Math.max(0, pop);
    }

    setSuccess(`Generated ${years} years of data starting from ${p0.toLocaleString()}`);
    onDataSubmit(data, 'manual');
  };

  const handleRandomGenerate = () => {
    setError(null);
    const currentYear = new Date().getFullYear() - 10;
    const data = generateRandomDataset(currentYear, 15);
    setSuccess(`Generated random dataset with ${data.length} years of data`);
    onDataSubmit(data, 'random');
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data: DataPoint[] = results.data.map((row: any) => {
            const year = parseInt(row.Year || row.year);
            const population = parseFloat(row.Population || row.population);
            
            if (isNaN(year) || isNaN(population)) {
              throw new Error('Invalid data format');
            }
            
            return { year, population: Math.round(population) };
          });

          if (data.length < 2) {
            setError('CSV must contain at least 2 data points');
            return;
          }

          // Sort by year
          data.sort((a, b) => a.year - b.year);
          setCsvData(data);
          setSuccess(`Loaded ${data.length} data points from CSV`);
          onDataSubmit(data, 'csv');
        } catch {
          setError('Invalid CSV format. Please ensure columns: Year, Population');
        }
      },
      error: () => {
        setError('Failed to parse CSV file');
      },
    });

    // Reset input
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex flex-wrap gap-3">
        {[
          { id: 'manual', label: 'Manual Input', icon: PenTool },
          { id: 'random', label: 'Random Generate', icon: Shuffle },
          { id: 'csv', label: 'Upload CSV', icon: Upload },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setMode(id as InputMode);
              setError(null);
              setSuccess(null);
            }}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
              mode === id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border hover:border-primary/50 hover:bg-muted'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Manual Input Form */}
      {mode === 'manual' && (
        <div className="card-academic animate-fade-in">
          <h4 className="text-lg font-semibold mb-4">Enter Model Parameters</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Initial Population P(0)
              </label>
              <input
                type="number"
                value={manualData.p0}
                onChange={(e) => setManualData({ ...manualData, p0: e.target.value })}
                className="input-academic"
                placeholder="e.g., 1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Growth Rate (r)
              </label>
              <input
                type="number"
                step="0.1"
                value={manualData.r}
                onChange={(e) => setManualData({ ...manualData, r: e.target.value })}
                className="input-academic"
                placeholder="e.g., 1.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Carrying Capacity (K)
              </label>
              <input
                type="number"
                value={manualData.k}
                onChange={(e) => setManualData({ ...manualData, k: e.target.value })}
                className="input-academic"
                placeholder="e.g., 10000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Number of Years
              </label>
              <input
                type="number"
                value={manualData.years}
                onChange={(e) => setManualData({ ...manualData, years: e.target.value })}
                className="input-academic"
                placeholder="e.g., 10"
              />
            </div>
          </div>
          <button onClick={handleManualSubmit} className="btn-primary mt-6 w-full sm:w-auto">
            Generate Dataset
          </button>
        </div>
      )}

      {/* Random Generation */}
      {mode === 'random' && (
        <div className="card-academic animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Shuffle className="w-8 h-8 text-secondary" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold">Generate Random Dataset</h4>
              <p className="text-muted-foreground">
                Creates a realistic population dataset with 15 years of historical data
              </p>
            </div>
          </div>
          <button onClick={handleRandomGenerate} className="btn-secondary mt-6 w-full sm:w-auto">
            Generate Random Data
          </button>
        </div>
      )}

      {/* CSV Upload */}
      {mode === 'csv' && (
        <div className="card-academic animate-fade-in">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">Upload CSV File</h4>
            <p className="text-muted-foreground mb-4">
              File should contain columns: <code className="font-mono bg-muted px-2 py-1 rounded">Year</code> and{' '}
              <code className="font-mono bg-muted px-2 py-1 rounded">Population</code>
            </p>
            <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Choose File
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>
          </div>

          {csvData.length > 0 && (
            <div className="mt-6">
              <h5 className="font-semibold mb-3">Uploaded Data Preview</h5>
              <div className="max-h-48 overflow-auto rounded-lg border border-border">
                <table className="table-academic text-sm">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Population</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 10).map((row, i) => (
                      <tr key={i}>
                        <td>{row.year}</td>
                        <td>{row.population.toLocaleString()}</td>
                      </tr>
                    ))}
                    {csvData.length > 10 && (
                      <tr>
                        <td colSpan={2} className="text-center text-muted-foreground">
                          ... and {csvData.length - 10} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-secondary-light border border-secondary/30 rounded-lg text-secondary animate-fade-in">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}
