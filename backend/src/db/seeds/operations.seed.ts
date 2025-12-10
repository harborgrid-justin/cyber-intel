
export const INITIAL_PLAYBOOKS = [
  { id: 'PB-01', name: 'Phishing Containment', description: 'Standard response to phishing reports.', tasks: ['Isolate Host', 'Reset Creds', 'Block Sender'], trigger_label: 'Phishing', status: 'ACTIVE', usage_count: 12, risk_level: 'LOW' },
  { id: 'PB-02', name: 'Ransomware Isolation', description: 'Immediate network segregation.', tasks: ['Sever Network', 'Snapshot VM', 'Page On-Call'], trigger_label: 'Ransomware', status: 'ACTIVE', usage_count: 5, risk_level: 'HIGH' }
];
