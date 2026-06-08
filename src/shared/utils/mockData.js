// Shared mock data generators used across HES and future MDM

export const ri = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const rf = (min, max, dec = 1) => (Math.random() * (max - min) + min).toFixed(dec);

export const MANUFACTURERS = ['MTP', 'OAK', 'HPL', 'L&T', 'Secure', 'Genus'];
export const METER_TYPES = ['Single Phase', 'Three Phase', 'HT Meter', 'CT Meter'];
export const STATUSES = ['Online', 'Offline', 'Inactive', 'Never Connected'];
export const ZONES = ['North', 'South', 'East', 'West', 'Central'];
export const CIRCLES = ['Circle-1', 'Circle-2', 'Circle-3', 'Circle-4'];
export const DIVISIONS = ['Division-1', 'Division-2', 'Division-3'];

const STATUS_COLORS = {
  'Online': '#16a34a',
  'Offline': '#ef4444',
  'Inactive': '#f59e0b',
  'Never Connected': '#94a3b8',
};

export const getStatusColor = (s) => STATUS_COLORS[s] || '#94a3b8';

export const getStatusPill = (s) => {
  const map = { 'Online': 'pill-green', 'Offline': 'pill-red', 'Inactive': 'pill-amber', 'Never Connected': 'pill-gray' };
  return map[s] || 'pill-gray';
};

export function generateMeters(count = 50) {
  return Array.from({ length: count }, (_, i) => ({
    id: `M${String(i + 1001).padStart(5, '0')}`,
    serial: `SN${ri(100000, 999999)}`,
    consumerNo: `CONS${ri(10000, 99999)}`,
    type: METER_TYPES[i % 4],
    manufacturer: MANUFACTURERS[i % 6],
    zone: ZONES[i % 5],
    circle: CIRCLES[i % 4],
    division: DIVISIONS[i % 3],
    feeder: `FDR-${ri(1, 20)}`,
    dt: `DT-${ri(100, 999)}`,
    status: STATUSES[i % 4],
    voltage: rf(225, 245, 1),
    current: rf(0.5, 15, 2),
    power: rf(0.1, 5, 2),
    pf: rf(0.85, 1.0, 2),
    kwhImport: rf(100, 5000, 1),
    kwhExport: rf(0, 50, 1),
    kvah: rf(150, 5500, 1),
    maxDemand: rf(1, 10, 2),
    frequency: rf(49.5, 50.5, 1),
    lastComm: new Date(Date.now() - ri(0, 7200000)).toISOString(),
    lat: 28.4 + (Math.random() - 0.5) * 0.4,
    lng: 77.5 + (Math.random() - 0.5) * 0.5,
    address: `House ${ri(1, 200)}, Sector ${ri(1, 62)}, Greater Noida`,
    group: `DLP${ri(1, 99)}`,
    firmware: `v3.${ri(0, 3)}.${ri(0, 9)}`,
  }));
}

export function fmtDT(d) {
  if (!d) return '—';
  const dt = typeof d === 'string' ? new Date(d) : d;
  return dt.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
}

export function fmtDate(d) {
  if (!d) return '—';
  const dt = typeof d === 'string' ? new Date(d) : d;
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const METERS = generateMeters(80);

export const ALERT_TYPES = [
  { msg: 'Meter Not Communicating', type: 'Communication', sev: 'Critical' },
  { msg: 'Tamper Detected — Cover Opened', type: 'Tamper', sev: 'Critical' },
  { msg: 'Voltage Sag Detected', type: 'Voltage', sev: 'Warning' },
  { msg: 'High Power Consumption', type: 'Load', sev: 'Warning' },
  { msg: 'Billing Read Failure', type: 'Billing', sev: 'Warning' },
  { msg: 'Low Battery — DCU', type: 'Device', sev: 'Info' },
  { msg: 'RTC Drift Detected', type: 'Clock', sev: 'Info' },
];

export function generateAlerts(count = 20) {
  return Array.from({ length: count }, (_, i) => {
    const a = ALERT_TYPES[i % ALERT_TYPES.length];
    const m = METERS[i % METERS.length];
    return {
      id: `ALT-${1000 + i}`,
      time: new Date(Date.now() - i * 1800000).toISOString(),
      meterNo: m.id,
      message: a.msg,
      type: a.type,
      severity: a.sev,
      status: i < 3 ? 'Active' : 'Cleared',
    };
  });
}

export const ALERTS = generateAlerts(30);

export const ODR_COMMANDS = {
  profile: ['Instantaneous Profile', 'Load Profile', 'Billing Profile', 'Daily Load Profile', 'Historical LP'],
  'config-read': ['Read RTC', 'Read Billing Date', 'Read TOD Schedule', 'Read Demand Config', 'Read Comm Params'],
  'config-write': ['Sync RTC', 'Update Billing Date', 'Update TOD', 'Set Load Limit', 'Toggle Relay'],
  ping: ['DLMS Ping', 'ICMP Ping', 'RF Ping', 'Network Test'],
  'load-control': ['Connect Relay', 'Disconnect Relay', 'Set Load Limit', 'Emergency Disconnect'],
  firmware: ['Get Current Version', 'Initiate FOTA', 'Check Update Status', 'Rollback Firmware'],
};
