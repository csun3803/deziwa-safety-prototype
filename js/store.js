const SafetyStore = (() => {
  const LIVE_KEY = "dzw-safety-live";
  const CHANNEL = "dzw-safety";
  let channel = null;

  function read() {
    try {
      return JSON.parse(localStorage.getItem(LIVE_KEY) || "null");
    } catch {
      return null;
    }
  }

  function apply(data) {
    const live = read();
    if (!live) return data;
    if (Array.isArray(live.events)) {
      data.events = live.events;
      if (Array.isArray(live.alerts)) data.alerts = live.alerts;
    }
    if (Array.isArray(live.workTypes)) data.workTypes = live.workTypes;
    if (Array.isArray(live.workFlows)) data.workFlows = live.workFlows;
    if (Array.isArray(live.workOrders)) data.workOrders = live.workOrders;
    if (Array.isArray(live.workCerts)) data.workCerts = live.workCerts;
    if (Array.isArray(live.workTrainings)) data.workTrainings = live.workTrainings;
    if (Array.isArray(live.employees)) data.employees = live.employees;
    if (Array.isArray(live.sysUsers)) data.sysUsers = live.sysUsers;
    if (Array.isArray(data.events)) {
      data.aiEvents = data.events.filter((row) => row.source === "视频AI" || row.confidence != null);
    }
    return data;
  }

  function save(data) {
    const payload = {
      alerts: data.alerts,
      events: data.events,
      workTypes: data.workTypes,
      workFlows: data.workFlows,
      workOrders: data.workOrders,
      workCerts: data.workCerts,
      workTrainings: data.workTrainings,
      employees: data.employees,
      sysUsers: data.sysUsers,
      aiEvents: (data.events || []).filter((row) => row.source === "视频AI" || row.confidence != null),
      t: Date.now()
    };
    localStorage.setItem(LIVE_KEY, JSON.stringify(payload));
    try {
      channel?.postMessage({ t: payload.t });
    } catch (_) { /* ignore */ }
  }

  function reset() {
    localStorage.removeItem(LIVE_KEY);
    try {
      channel?.postMessage({ reset: true });
    } catch (_) { /* ignore */ }
  }

  function subscribe(fn) {
    try {
      channel = new BroadcastChannel(CHANNEL);
      channel.onmessage = (event) => fn(event.data || {});
    } catch (_) { /* ignore */ }
    window.addEventListener("storage", (event) => {
      if (event.key !== LIVE_KEY) return;
      if (!event.newValue) fn({ reset: true });
      else fn({ storage: true });
    });
  }

  return { apply, save, reset, read, subscribe };
})();
