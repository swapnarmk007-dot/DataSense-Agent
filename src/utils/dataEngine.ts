import {
  ColumnProfile,
  DatasetProfile,
  CleaningLog,
  ChartConfig,
  AnomalyItem,
  ForecastResult,
  DataType,
} from '../types';

export function detectType(values: any[]): DataType {
  const nonNulls = values.filter((v) => v !== null && v !== undefined && v !== '');
  if (nonNulls.length === 0) return 'text';

  let numCount = 0;
  let dateCount = 0;
  let boolCount = 0;

  for (const val of nonNulls.slice(0, 100)) {
    if (typeof val === 'boolean' || String(val).toLowerCase() === 'true' || String(val).toLowerCase() === 'false') {
      boolCount++;
      continue;
    }
    const cleanStr = String(val).replace(/[$,%]/g, '').trim();
    if (!isNaN(Number(cleanStr)) && cleanStr !== '') {
      numCount++;
      continue;
    }
    const parsedDate = Date.parse(String(val));
    if (!isNaN(parsedDate) && String(val).length >= 8 && (String(val).includes('-') || String(val).includes('/') || String(val).includes('.'))) {
      dateCount++;
      continue;
    }
  }

  const sampleSize = Math.min(nonNulls.length, 100);
  if (numCount / sampleSize > 0.7) return 'numerical';
  if (dateCount / sampleSize > 0.7) return 'datetime';
  if (boolCount / sampleSize > 0.7) return 'boolean';

  const uniqueSet = new Set(nonNulls.map(String));
  if (uniqueSet.size <= Math.min(25, nonNulls.length * 0.4)) return 'categorical';

  return 'text';
}

export function profileDataset(data: Record<string, any>[], datasetName = 'dataset.csv'): DatasetProfile {
  if (!data || data.length === 0) {
    return {
      name: datasetName,
      rowCount: 0,
      columnCount: 0,
      columns: [],
      missingTotal: 0,
      missingPercentage: 0,
      duplicateCount: 0,
      duplicatePercentage: 0,
      dataQualityScore: 100,
      numericalColumns: [],
      categoricalColumns: [],
      dateColumns: [],
      memorySizeKB: 0,
      createdAt: new Date().toISOString(),
    };
  }

  const rowCount = data.length;
  const colKeys = Object.keys(data[0] || {});
  const columnCount = colKeys.length;

  let totalNulls = 0;
  const columns: ColumnProfile[] = [];
  const numericalCols: string[] = [];
  const categoricalCols: string[] = [];
  const dateCols: string[] = [];

  for (const col of colKeys) {
    const rawValues = data.map((row) => row[col]);
    const nulls = rawValues.filter((v) => v === null || v === undefined || v === '' || (typeof v === 'number' && isNaN(v))).length;
    totalNulls += nulls;

    const colType = detectType(rawValues);
    const validValues = rawValues.filter((v) => v !== null && v !== undefined && v !== '');
    const uniqueValues = Array.from(new Set(validValues.map(String)));

    const profile: ColumnProfile = {
      name: col,
      type: colType,
      rawType: typeof rawValues[0],
      nullCount: nulls,
      nullPercentage: Number(((nulls / rowCount) * 100).toFixed(2)),
      uniqueCount: uniqueValues.length,
      sampleValues: uniqueValues.slice(0, 5),
    };

    if (colType === 'numerical') {
      numericalCols.push(col);
      const nums = validValues
        .map((v) => Number(String(v).replace(/[$,%]/g, '')))
        .filter((n) => !isNaN(n))
        .sort((a, b) => a - b);

      if (nums.length > 0) {
        const sum = nums.reduce((acc, v) => acc + v, 0);
        const mean = sum / nums.length;
        const min = nums[0];
        const max = nums[nums.length - 1];

        // Quartiles
        const q25Index = Math.floor(nums.length * 0.25);
        const q50Index = Math.floor(nums.length * 0.5);
        const q75Index = Math.floor(nums.length * 0.75);
        const q25 = nums[q25Index];
        const median = nums[q50Index];
        const q75 = nums[q75Index];
        const iqr = q75 - q25;

        // Variance & Std Dev
        const variance = nums.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / nums.length;
        const std = Math.sqrt(variance);

        // Skewness
        let skewness = 0;
        if (std > 0) {
          skewness = nums.reduce((acc, v) => acc + Math.pow((v - mean) / std, 3), 0) / nums.length;
        }

        // Outlier count via 1.5 * IQR
        const lowerBound = q25 - 1.5 * iqr;
        const upperBound = q75 + 1.5 * iqr;
        const outliers = nums.filter((v) => v < lowerBound || v > upperBound).length;

        profile.min = Number(min.toFixed(2));
        profile.max = Number(max.toFixed(2));
        profile.mean = Number(mean.toFixed(2));
        profile.median = Number(median.toFixed(2));
        profile.std = Number(std.toFixed(2));
        profile.q25 = Number(q25.toFixed(2));
        profile.q75 = Number(q75.toFixed(2));
        profile.iqr = Number(iqr.toFixed(2));
        profile.skewness = Number(skewness.toFixed(2));
        profile.outliersCount = outliers;
      }
    } else if (colType === 'categorical' || colType === 'text') {
      categoricalCols.push(col);
      // Find mode
      const counts: Record<string, number> = {};
      for (const val of validValues) {
        const s = String(val);
        counts[s] = (counts[s] || 0) + 1;
      }
      let topVal = '';
      let topCount = -1;
      for (const [k, count] of Object.entries(counts)) {
        if (count > topCount) {
          topCount = count;
          topVal = k;
        }
      }
      profile.mode = topVal;
    } else if (colType === 'datetime') {
      dateCols.push(col);
      const sortedDates = validValues
        .map((v) => new Date(v).getTime())
        .filter((t) => !isNaN(t))
        .sort((a, b) => a - b);
      if (sortedDates.length > 0) {
        profile.min = new Date(sortedDates[0]).toISOString().split('T')[0];
        profile.max = new Date(sortedDates[sortedDates.length - 1]).toISOString().split('T')[0];
      }
    }

    columns.push(profile);
  }

  // Duplicate records check
  const rowSignatures = new Set<string>();
  let duplicateCount = 0;
  for (const row of data) {
    const sig = JSON.stringify(row);
    if (rowSignatures.has(sig)) {
      duplicateCount++;
    } else {
      rowSignatures.add(sig);
    }
  }

  const totalCells = rowCount * columnCount;
  const missingPercentage = totalCells > 0 ? Number(((totalNulls / totalCells) * 100).toFixed(2)) : 0;
  const duplicatePercentage = rowCount > 0 ? Number(((duplicateCount / rowCount) * 100).toFixed(2)) : 0;

  // Data Quality Score formula: 100 - (missingPenalty * 1.5) - (duplicatePenalty * 1.2) - (outlierPenalty * 0.5)
  let outlierTotal = 0;
  for (const c of columns) {
    if (c.outliersCount) outlierTotal += c.outliersCount;
  }
  const outlierRate = rowCount > 0 ? (outlierTotal / (rowCount * Math.max(1, numericalCols.length))) * 100 : 0;

  const scorePenalty = missingPercentage * 1.4 + duplicatePercentage * 1.2 + outlierRate * 0.3;
  const dataQualityScore = Math.max(10, Math.min(100, Math.round(100 - scorePenalty)));

  const approxMemoryBytes = totalCells * 16;
  const memorySizeKB = Math.round(approxMemoryBytes / 1024);

  return {
    name: datasetName,
    rowCount,
    columnCount,
    columns,
    missingTotal: totalNulls,
    missingPercentage,
    duplicateCount,
    duplicatePercentage,
    dataQualityScore,
    numericalColumns: numericalCols,
    categoricalColumns: categoricalCols,
    dateColumns: dateCols,
    memorySizeKB,
    createdAt: new Date().toISOString(),
  };
}

export function cleanDataset(
  data: Record<string, any>[],
  options: {
    standardizeText?: boolean;
    removeDuplicates?: boolean;
    imputeMissing?: boolean;
    clipOutliers?: boolean;
  } = {
    standardizeText: true,
    removeDuplicates: true,
    imputeMissing: true,
    clipOutliers: false,
  }
): { cleanedData: Record<string, any>[]; logs: CleaningLog[]; profile: DatasetProfile } {
  let workingData = JSON.parse(JSON.stringify(data));
  const logs: CleaningLog[] = [];
  const initialProfile = profileDataset(workingData);

  // 1. Standardize Text / Trim whitespace & inconsistent casing
  if (options.standardizeText) {
    let modifiedCount = 0;
    const catCols = initialProfile.categoricalColumns;
    for (const row of workingData) {
      for (const col of catCols) {
        if (typeof row[col] === 'string') {
          const original = row[col];
          const cleaned = original.trim();
          if (original !== cleaned) {
            row[col] = cleaned;
            modifiedCount++;
          }
        }
      }
    }
    if (modifiedCount > 0 || catCols.length > 0) {
      logs.push({
        id: 'clean-' + Math.random().toString(36).substring(2, 7),
        title: 'Standardize Categorical Text & Trim Whitespace',
        description: `Sanitized leading/trailing whitespaces and normalized formatting across ${catCols.length} text columns.`,
        type: 'standardize_text',
        affectedColumns: catCols,
        recordsAffected: modifiedCount,
        beforeMetric: `${modifiedCount} untrimmed values`,
        afterMetric: '0 untrimmed values',
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  }

  // 2. Remove Duplicates
  if (options.removeDuplicates) {
    const seen = new Set<string>();
    const uniqueRows: Record<string, any>[] = [];
    let dupsRemoved = 0;

    for (const row of workingData) {
      const signature = JSON.stringify(row);
      if (!seen.has(signature)) {
        seen.add(signature);
        uniqueRows.push(row);
      } else {
        dupsRemoved++;
      }
    }
    workingData = uniqueRows;

    logs.push({
      id: 'clean-' + Math.random().toString(36).substring(2, 7),
      title: 'Deduplicate Exact Rows',
      description: `Identified and purged ${dupsRemoved} duplicate record(s) to guarantee relational integrity.`,
      type: 'remove_duplicates',
      affectedColumns: Object.keys(workingData[0] || {}),
      recordsAffected: dupsRemoved,
      beforeMetric: `${initialProfile.rowCount} records`,
      afterMetric: `${workingData.length} unique records`,
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  // 3. Impute Missing Values
  if (options.imputeMissing) {
    let missingFilled = 0;
    const currentProfile = profileDataset(workingData);

    for (const colProfile of currentProfile.columns) {
      if (colProfile.nullCount > 0) {
        if (colProfile.type === 'numerical') {
          const fillVal = colProfile.median !== undefined ? colProfile.median : colProfile.mean || 0;
          for (const row of workingData) {
            if (row[colProfile.name] === null || row[colProfile.name] === undefined || row[colProfile.name] === '' || isNaN(Number(row[colProfile.name]))) {
              row[colProfile.name] = fillVal;
              missingFilled++;
            }
          }
        } else if (colProfile.type === 'categorical' || colProfile.type === 'text') {
          const fillMode = colProfile.mode || 'Unknown';
          for (const row of workingData) {
            if (row[colProfile.name] === null || row[colProfile.name] === undefined || row[colProfile.name] === '') {
              row[colProfile.name] = fillMode;
              missingFilled++;
            }
          }
        }
      }
    }

    logs.push({
      id: 'clean-' + Math.random().toString(36).substring(2, 7),
      title: 'Impute Missing Values (Median & Mode Strategy)',
      description: `Imputed ${missingFilled} null/empty cells using column median for numerical attributes and modal frequency for categoricals.`,
      type: 'impute_missing',
      affectedColumns: currentProfile.columns.filter((c) => c.nullCount > 0).map((c) => c.name),
      recordsAffected: missingFilled,
      beforeMetric: `${initialProfile.missingTotal} missing cells`,
      afterMetric: '0 missing cells',
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  // 4. Clip Outliers (optional)
  if (options.clipOutliers) {
    let clippedCount = 0;
    const currentProfile = profileDataset(workingData);
    for (const colProfile of currentProfile.columns) {
      if (colProfile.type === 'numerical' && colProfile.q25 !== undefined && colProfile.q75 !== undefined && colProfile.iqr !== undefined) {
        const lowerBound = colProfile.q25 - 1.5 * colProfile.iqr;
        const upperBound = colProfile.q75 + 1.5 * colProfile.iqr;
        for (const row of workingData) {
          const val = Number(row[colProfile.name]);
          if (!isNaN(val)) {
            if (val < lowerBound) {
              row[colProfile.name] = lowerBound;
              clippedCount++;
            } else if (val > upperBound) {
              row[colProfile.name] = upperBound;
              clippedCount++;
            }
          }
        }
      }
    }
    if (clippedCount > 0) {
      logs.push({
        id: 'clean-' + Math.random().toString(36).substring(2, 7),
        title: 'Clip Statistical Outliers (1.5x IQR Winsorization)',
        description: `Clipped ${clippedCount} extreme values into robust Tukey bounds to protect downstream regression stability.`,
        type: 'clip_outliers',
        affectedColumns: currentProfile.numericalColumns,
        recordsAffected: clippedCount,
        beforeMetric: `${clippedCount} outliers detected`,
        afterMetric: '0 extreme values outside IQR bounds',
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  }

  const finalProfile = profileDataset(workingData);
  return {
    cleanedData: workingData,
    logs,
    profile: finalProfile,
  };
}

export function detectAnomalies(data: Record<string, any>[]): AnomalyItem[] {
  if (!data || data.length === 0) return [];
  const profile = profileDataset(data);
  const anomalies: AnomalyItem[] = [];

  const numCols = profile.numericalColumns;
  if (numCols.length === 0) return [];

  // 1. Univariate IQR & Z-Score Anomaly detection
  for (const col of numCols) {
    const colProfile = profile.columns.find((c) => c.name === col);
    if (!colProfile || colProfile.mean === undefined || colProfile.std === undefined || colProfile.iqr === undefined || colProfile.q25 === undefined || colProfile.q75 === undefined) {
      continue;
    }

    const { mean, std, q25, q75, iqr } = colProfile;
    const lowerIqr = q25 - 1.5 * iqr;
    const upperIqr = q75 + 1.5 * iqr;

    data.forEach((row, idx) => {
      const val = Number(row[col]);
      if (isNaN(val)) return;

      const zScore = std > 0 ? (val - mean) / std : 0;
      const isIqrOutlier = val < lowerIqr || val > upperIqr;
      const isZScoreOutlier = Math.abs(zScore) >= 2.5;

      if (isIqrOutlier || isZScoreOutlier) {
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
        if (Math.abs(zScore) > 4.0) severity = 'critical';
        else if (Math.abs(zScore) > 3.0) severity = 'high';
        else severity = 'medium';

        const deviationPct = mean !== 0 ? (((val - mean) / mean) * 100).toFixed(1) : '100';

        anomalies.push({
          id: `anom-${idx}-${col}`,
          rowIndex: idx + 1,
          record: row,
          column: col,
          value: Number(val.toFixed(2)),
          expectedMin: Number(lowerIqr.toFixed(2)),
          expectedMax: Number(upperIqr.toFixed(2)),
          deviationScore: Number(Math.abs(zScore).toFixed(2)),
          method: isZScoreOutlier ? 'Z-Score' : 'IQR',
          severity,
          reason: `Value of ${val.toLocaleString()} in column "${col}" is ${deviationPct}% ${val > mean ? 'higher' : 'lower'} than the dataset mean (${mean.toLocaleString()}) with a Z-Score of ${zScore.toFixed(2)}.`,
        });
      }
    });
  }

  // Sort anomalies by severity and deviation score descending
  return anomalies.sort((a, b) => b.deviationScore - a.deviationScore);
}

export function generateForecast(
  data: Record<string, any>[],
  dateCol?: string,
  metricCol?: string,
  forecastPeriods = 6
): ForecastResult | null {
  if (!data || data.length === 0) return null;
  const profile = profileDataset(data);

  const selectedDateCol = dateCol || profile.dateColumns[0];
  const selectedMetricCol = metricCol || profile.numericalColumns.find((c) => /sales|revenue|profit|cost|amount/i.test(c)) || profile.numericalColumns[0];

  if (!selectedDateCol || !selectedMetricCol) return null;

  // Aggregate metric by monthly period
  const periodMap: Record<string, number> = {};
  for (const row of data) {
    const rawDate = row[selectedDateCol];
    const rawVal = Number(row[selectedMetricCol]);
    if (!rawDate || isNaN(rawVal)) continue;

    const parsed = new Date(rawDate);
    if (isNaN(parsed.getTime())) continue;

    const yearMonth = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
    periodMap[yearMonth] = (periodMap[yearMonth] || 0) + rawVal;
  }

  const sortedPeriods = Object.keys(periodMap).sort();
  if (sortedPeriods.length < 3) return null;

  const historyPoints = sortedPeriods.map((period) => ({
    date: period,
    actual: Number(periodMap[period].toFixed(2)),
  }));

  // Linear trend calculation
  const n = historyPoints.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  historyPoints.forEach((pt, i) => {
    const x = i;
    const y = pt.actual!;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;

  // Residual std dev for confidence interval
  let sumResidualSq = 0;
  historyPoints.forEach((pt, i) => {
    const yPred = intercept + slope * i;
    sumResidualSq += Math.pow(pt.actual! - yPred, 2);
  });
  const stdError = Math.sqrt(sumResidualSq / Math.max(1, n - 2));

  // Generate future forecast
  const lastPeriod = sortedPeriods[sortedPeriods.length - 1];
  const [lastY, lastM] = lastPeriod.split('-').map(Number);

  const forecastPoints: { date: string; predicted: number; lowerBound: number; upperBound: number }[] = [];
  let nextYear = lastY;
  let nextMonth = lastM;

  for (let step = 1; step <= forecastPeriods; step++) {
    nextMonth++;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear++;
    }
    const nextPeriodStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
    const x = n - 1 + step;
    const baselinePred = Math.max(0, intercept + slope * x);
    const margin = stdError * (1 + 0.15 * step) * 1.96;

    forecastPoints.push({
      date: nextPeriodStr,
      predicted: Number(baselinePred.toFixed(2)),
      lowerBound: Number(Math.max(0, baselinePred - margin).toFixed(2)),
      upperBound: Number((baselinePred + margin).toFixed(2)),
    });
  }

  const historicalTotal = historyPoints.reduce((acc, p) => acc + p.actual!, 0);
  const projectedTotal = forecastPoints.reduce((acc, p) => acc + p.predicted, 0);
  const growthRatePct = historyPoints[0].actual! > 0 ? Number((((historyPoints[n - 1].actual! - historyPoints[0].actual!) / historyPoints[0].actual!) * 100).toFixed(1)) : 0;

  let highestProj = forecastPoints[0];
  for (const fp of forecastPoints) {
    if (fp.predicted > highestProj.predicted) highestProj = fp;
  }

  return {
    dateColumn: selectedDateCol,
    metricColumn: selectedMetricCol,
    frequency: 'monthly',
    modelUsed: 'Linear Regression Trend',
    historyPoints,
    forecastPoints,
    growthRatePct,
    summary: {
      historicalTotal: Number(historicalTotal.toFixed(2)),
      projectedTotal: Number(projectedTotal.toFixed(2)),
      highestProjectedPeriod: highestProj.date,
      trendDirection: slope > 0 ? 'upward' : slope < 0 ? 'downward' : 'stable',
    },
  };
}

export function executeDeterministicQuery(
  data: Record<string, any>[],
  queryConfig: {
    operation: 'group_by' | 'top_n' | 'correlation' | 'describe' | 'filter' | 'time_series';
    groupCol?: string;
    metricCol?: string;
    aggregation?: 'sum' | 'mean' | 'count' | 'max' | 'min' | 'median';
    n?: number;
    sortOrder?: 'asc' | 'desc';
    filterCol?: string;
    filterVal?: any;
    filterOp?: '==' | '!=' | '>' | '<' | 'contains';
  }
): {
  table: Record<string, any>[];
  metrics: Record<string, any>;
  chartSuggestion?: ChartConfig;
  summaryText: string;
} {
  if (!data || data.length === 0) {
    return {
      table: [],
      metrics: {},
      summaryText: 'Dataset is empty.',
    };
  }

  const { operation, groupCol, metricCol, aggregation = 'sum', n = 10, sortOrder = 'desc' } = queryConfig;

  // 1. Group By Query
  if (operation === 'group_by' && groupCol && metricCol) {
    const groups: Record<string, number[]> = {};
    for (const row of data) {
      const key = String(row[groupCol] || 'Unknown');
      const val = Number(row[metricCol]);
      if (!isNaN(val)) {
        if (!groups[key]) groups[key] = [];
        groups[key].push(val);
      }
    }

    const table: Record<string, any>[] = [];
    for (const [key, vals] of Object.entries(groups)) {
      let aggregatedValue = 0;
      if (aggregation === 'sum') {
        aggregatedValue = vals.reduce((a, b) => a + b, 0);
      } else if (aggregation === 'mean') {
        aggregatedValue = vals.reduce((a, b) => a + b, 0) / vals.length;
      } else if (aggregation === 'count') {
        aggregatedValue = vals.length;
      } else if (aggregation === 'max') {
        aggregatedValue = Math.max(...vals);
      } else if (aggregation === 'min') {
        aggregatedValue = Math.min(...vals);
      } else if (aggregation === 'median') {
        const sorted = [...vals].sort((a, b) => a - b);
        aggregatedValue = sorted[Math.floor(sorted.length / 2)];
      }

      table.push({
        [groupCol]: key,
        [metricCol]: Number(aggregatedValue.toFixed(2)),
        record_count: vals.length,
      });
    }

    // Sort
    table.sort((a, b) => (sortOrder === 'desc' ? b[metricCol] - a[metricCol] : a[metricCol] - b[metricCol]));

    const topItem = table[0];
    const totalAgg = table.reduce((acc, r) => acc + r[metricCol], 0);

    const chartType = table.length <= 6 ? 'bar' : 'bar';

    return {
      table: table.slice(0, n),
      metrics: {
        totalSum: Number(totalAgg.toFixed(2)),
        topPerformer: topItem ? topItem[groupCol] : 'N/A',
        topValue: topItem ? topItem[metricCol] : 0,
        groupCount: table.length,
      },
      chartSuggestion: {
        type: chartType,
        title: `${metricCol} by ${groupCol} (${aggregation.toUpperCase()})`,
        xAxis: groupCol,
        yAxis: metricCol,
        data: table.slice(0, 15),
      },
      summaryText: `${topItem ? topItem[groupCol] : 'Top entity'} recorded the highest aggregate ${metricCol} at ${topItem ? topItem[metricCol].toLocaleString() : 0} (${(((topItem ? topItem[metricCol] : 0) / (totalAgg || 1)) * 100).toFixed(1)}% of total).`,
    };
  }

  // 2. Top N
  if (operation === 'top_n' && groupCol && metricCol) {
    return executeDeterministicQuery(data, {
      ...queryConfig,
      operation: 'group_by',
      n,
      sortOrder: 'desc',
    });
  }

  // 3. Time Series
  if (operation === 'time_series' && groupCol && metricCol) {
    const monthlyMap: Record<string, number> = {};
    for (const row of data) {
      const rawDate = row[groupCol];
      const val = Number(row[metricCol]);
      if (!rawDate || isNaN(val)) continue;
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + val;
    }

    const table = Object.entries(monthlyMap)
      .map(([date, value]) => ({ date, [metricCol]: Number(value.toFixed(2)) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      table,
      metrics: {
        periods: table.length,
        total: Number(table.reduce((acc: number, r: Record<string, any>) => acc + Number(r[metricCol] || 0), 0).toFixed(2)),
      },
      chartSuggestion: {
        type: 'line',
        title: `${metricCol} Trend Over Time`,
        xAxis: 'date',
        yAxis: metricCol,
        data: table,
      },
      summaryText: `Time series across ${table.length} periods evaluated with historical totals of ${table.reduce((acc: number, r: Record<string, any>) => acc + Number(r[metricCol] || 0), 0).toLocaleString()}.`,
    };
  }

  // Default fallback: general description
  const profile = profileDataset(data);
  return {
    table: data.slice(0, 5),
    metrics: {
      rows: profile.rowCount,
      columns: profile.columnCount,
      qualityScore: profile.dataQualityScore,
    },
    summaryText: `Analyzed ${profile.rowCount} rows and ${profile.columnCount} columns with ${profile.dataQualityScore}% Data Quality Score.`,
  };
}

export function detectAnomaliesIQR(data: Record<string, any>[], col: string, threshold = 1.5): AnomalyItem[] {
  if (!data || data.length === 0 || !col) return [];
  const validVals = data.map((r, i) => ({ idx: i + 1, val: Number(r[col]), record: r })).filter((x) => !isNaN(x.val));
  if (validVals.length === 0) return [];

  const nums = validVals.map((x) => x.val).sort((a, b) => a - b);
  const q25 = nums[Math.floor(nums.length * 0.25)];
  const q75 = nums[Math.floor(nums.length * 0.75)];
  const iqr = q75 - q25;
  const lowerBound = q25 - threshold * iqr;
  const upperBound = q75 + threshold * iqr;

  const sum = nums.reduce((a, b) => a + b, 0);
  const mean = sum / nums.length;
  const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length;
  const std = Math.sqrt(variance) || 1;

  const results: AnomalyItem[] = [];
  validVals.forEach((item) => {
    if (item.val < lowerBound || item.val > upperBound) {
      const zScore = Math.abs((item.val - mean) / std);
      const severity: 'low' | 'medium' | 'high' | 'critical' =
        zScore > 4.0 ? 'critical' : zScore > 2.8 ? 'high' : 'medium';

      results.push({
        id: `anom-${item.idx}-${col}`,
        rowIndex: item.idx,
        record: item.record,
        column: col,
        value: Number(item.val.toFixed(2)),
        expectedMin: Number(lowerBound.toFixed(2)),
        expectedMax: Number(upperBound.toFixed(2)),
        deviationScore: Number(zScore.toFixed(2)),
        method: 'IQR',
        severity,
        reason: `Value ${item.val.toLocaleString()} is outside ${threshold}x IQR bounds [${lowerBound.toFixed(1)}, ${upperBound.toFixed(1)}].`,
      });
    }
  });

  return results.sort((a, b) => b.deviationScore - a.deviationScore);
}

export function forecastTimeSeries(
  data: Record<string, any>[],
  dateCol: string,
  metricCol: string,
  periods = 4
): {
  dateCol: string;
  metricCol: string;
  historical: { period: string; actual: number }[];
  forecast: { period: string; forecast: number; lowerBound: number; upperBound: number }[];
  trendDirection: 'upward' | 'downward' | 'stable';
  growthRatePct: number;
  projectedTotal: number;
  historicalTotal: number;
} | null {
  const result = generateForecast(data, dateCol, metricCol, periods);
  if (!result) return null;

  return {
    dateCol,
    metricCol,
    historical: result.historyPoints.map((p) => ({ period: p.date, actual: p.actual || 0 })),
    forecast: result.forecastPoints.map((p) => ({
      period: p.date,
      forecast: p.predicted || 0,
      lowerBound: p.lowerBound || 0,
      upperBound: p.upperBound || 0,
    })),
    trendDirection: result.summary.trendDirection,
    growthRatePct: result.growthRatePct,
    projectedTotal: result.summary.projectedTotal,
    historicalTotal: result.summary.historicalTotal,
  };
}

