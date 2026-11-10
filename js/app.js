const TABS = [
  {
    id: "t1",
    name: "安全综合监控",
    pages: [
      { id: "overview", name: "安全综合监控", done: true, layout: "三维场景主导型" }
    ]
  },
  {
    id: "t2",
    name: "告警中心",
    pages: [
      { id: "alerts", name: "告警中心", done: true, layout: "列表-详情型" }
    ]
  },
  {
    id: "t3",
    name: "识别复核",
    pages: [
      { id: "review", name: "识别复核", done: true, layout: "列表-详情型" }
    ]
  },
  {
    id: "t5",
    name: "作业管理",
    pages: [
      { id: "tickets", name: "作业工单", done: true, layout: "列表-详情型" }
    ]
  },
  {
    id: "t6",
    name: "安全分析",
    pages: [
      { id: "stats", name: "安全事件统计", done: true, layout: "总览/驾驶舱型", desc: "事件与正式告警并列统计：类型、区域、等级、复核与处置。" },
      { id: "heatmap", name: "安全告警热力分析", done: true, layout: "统计报表/分析型", desc: "区域热力、重复事件与重点点位，辅助调整巡查。" },
      { id: "events", name: "事件档案", done: true, layout: "列表-详情型", desc: "事件全量留痕：定位/AI/人工上报；默认一对一正式告警。" },
      { id: "alert-archive", name: "告警档案", done: true, layout: "列表-详情型", desc: "正式告警卷宗：派发、处置时间线及关联事件。" }
    ]
  },
  {
    id: "t7",
    name: "配置中心",
    pages: [
      { id: "zones", name: "区域与定位告警", group: "告警配置", done: true, layout: "表单录入/编辑型", desc: "区域准入与定位类告警（含人员落点、围栏越界，同一规则池）。" },
      { id: "work-types", name: "作业类型", group: "作业配置", done: true, layout: "表单录入/编辑型", desc: "按作业类型配置等级、区域、资格、措施与审批流。" },
      { id: "work-flows", name: "审批流", group: "作业配置", done: true, layout: "表单录入/编辑型", desc: "配置作业工单签批节点，作业类型引用审批流。" },
      { id: "org", name: "组织管理", group: "系统基础", done: true, layout: "表单录入/编辑型", desc: "组织树与主数据属性，与人员系统同步。" },
      { id: "roles", name: "角色与权限", group: "系统基础", done: true, layout: "表单录入/编辑型", desc: "菜单、数据范围、操作与对象引用。" },
      { id: "users", name: "用户管理", group: "系统基础", done: true, layout: "表单录入/编辑型", desc: "账号、组织归属与角色。" },
      { id: "employees", name: "员工管理", group: "系统基础", done: true, layout: "列表-详情型", desc: "现场人员档案与定位卡绑定；支持批量导入发卡；工单选人来源。" },
      { id: "cameras", name: "摄像头管理", group: "系统基础", done: true, layout: "列表-详情型", desc: "通道接入、三维标定与视频 AI 算法绑定。" },
      { id: "dict", name: "字典管理", group: "系统基础", done: true, layout: "表单录入/编辑型", desc: "等级、误报原因等枚举字典。" },
      { id: "params", name: "运行参数", group: "系统基础", done: true, layout: "表单录入/编辑型", desc: "告警、定位、视频 AI、复核等运行参数。" },
      { id: "audit", name: "操作审计", group: "系统基础", done: true, layout: "列表-详情型", desc: "按用户、模块、时间查操作记录。" },
      { id: "base", name: "安全基础管理", group: "系统基础", done: true, layout: "列表-详情型", desc: "隐患、应急、事故、证照等台账入口。" }
    ]
  }
];

const WIRES = {
  "三维场景主导型": "左侧对象/图层树，中间三维画布，右侧属性与操作，底部时间轴或工具栏。",
  "列表-详情型": "左侧筛选列表，右侧选中记录详情与操作。",
  "表单录入/编辑型": "左侧对象导航，右侧分组表单，底部保存/提交/校验。",
  "流程审批型": "左侧待办，右侧工单详情与审批时间线，通过/驳回/退回。",
  "总览/驾驶舱型": "顶部筛选与指标卡，中部图表或场景，底部明细下钻。",
  "统计报表/分析型": "筛选条件 + 统计图 + 交叉明细 + 导出/快照。",
  "移动端作业型": "窄屏：状态、现场信息、拍照、措施、提交/转派。"
};

const LEVEL_NAME = { 1: "一级", 2: "二级", 3: "三级", 4: "四级" };

let data = null;
let plant = "all";
let regionCascadeOpen = false;
let regionCascadePlant = "";
let layers = { people: true, zones: true, cameras: true, alerts: true, track: false, fov: false };

/** 轨迹回放：仅当已选人员且有回放数据时开启；见 personTracks */
let trackReplay = { active: false, personId: null, trackId: null, tIndex: 0, playing: false, timer: null, alertId: null };

const LAYER_BTNS = [
  { id: "people", name: "人员" },
  { id: "zones", name: "围栏/风险区" },
  { id: "alerts", name: "告警落点" },
  { id: "cameras", name: "摄像头" },
  { id: "fov", name: "可视域" }
];
let selected = null;
let scenePanelExpanded = true;
let sceneDetailTab = "info";
/** 区域详情：fence=围栏与告警（默认），admission=准入与名单 */
let zoneDetailTab = "fence";
/** 在区人员弹窗筛选：all | abnormal */
let plantRosterFilter = "all";
/** 点选摄像头时仅绘制该路可视域；点图层「可视域」为展示全部 */
let fovFocusId = null;
let fovShowAll = false;
/** 视频联动当前实时画面通道 */
let linkageFocusCamId = null;
/** 多路分屏弹窗自选通道 id（最多 4） */
let linkageSplitCamIds = null;
/** 三维页「历史轨迹」独占模式：地图禁点选，右侧固定检索面板 */
let overviewTrackMode = false;
let trackSearch = {
  date: "2026-11-04",
  from: "08:00",
  to: "20:00",
  zoneIds: [],
  personId: "",
  searched: false
};
let trackSearchResults = [];

function personById(id) {
  const row = (data.people || []).find((item) => item.id === id) || null;
  return row ? hydratePerson(row) : null;
}

function livePersonForEmployee(empId) {
  if (!empId) return null;
  return (data.people || []).find((row) => row.employeeId === empId) || null;
}

function employeeForPerson(person) {
  if (!person) return null;
  if (person.employeeId) return employeeById(person.employeeId);
  if (person.name) return employeeByName(person.name);
  return null;
}

function hydratePerson(person) {
  if (!person) return person;
  const emp = employeeForPerson(person);
  if (!emp) return person;
  person.employeeId = emp.id;
  person.name = emp.name;
  person.empCode = emp.code || person.empCode || "";
  person.job = emp.job || person.job || "";
  person.org = emp.org || person.org || "";
  person.team = emp.team || person.team || "";
  person.dept = emp.team || person.dept || person.dept || "";
  person.mobile = emp.mobile || person.mobile || "";
  person.tagId = emp.tagId || person.tagId || "";
  person.locMode = emp.locMode || person.locMode || "";
  person.tagStatus = emp.tagStatus || person.tagStatus || "";
  person.tagBattery = emp.tagBattery || "";
  person.tagHeartbeat = emp.tagHeartbeat || "";
  return person;
}

function ensurePeopleLinked() {
  (data.people || []).forEach((row) => {
    if (!row.employeeId && row.name) {
      const emp = employeeByName(row.name);
      if (emp) row.employeeId = emp.id;
    }
    hydratePerson(row);
  });
}

function personLocAbnormal(person) {
  const status = (person?.status || "正常");
  return status !== "正常";
}

function peopleInCurrentPlant() {
  return (data.people || []).map(hydratePerson).filter(inCurrentPlant);
}

function personZoneName(person) {
  return data.zones.find((z) => z.id === person.zone)?.name
    || data.zones.find((z) => z.id === person.zone)?.mapLabel
    || "—";
}

function personTracksCatalog(personId) {
  const all = data.personTracks || [];
  if (personId) return all.filter((row) => row.personId === personId);
  return all;
}

function trackForReplay(personId, trackId) {
  const rows = personTracksCatalog(personId);
  if (!rows.length) return null;
  if (trackId) return rows.find((row) => row.id === trackId) || rows[0];
  return rows[0];
}

function clearTrackPlaybackTimer() {
  if (trackReplay.timer) {
    clearInterval(trackReplay.timer);
    trackReplay.timer = null;
  }
}

function stopTrackPlayback() {
  trackReplay.playing = false;
  clearTrackPlaybackTimer();
}

function exitTrackReplay() {
  stopTrackPlayback();
  trackReplay = { active: false, personId: null, trackId: null, tIndex: 0, playing: false, timer: null, alertId: null };
  layers.track = false;
}

function trackReplayState() {
  if (!trackReplay.active || !trackReplay.personId || !data) return null;
  const person = personById(trackReplay.personId);
  const tr = trackForReplay(trackReplay.personId, trackReplay.trackId);
  if (!person || !tr || !(tr.points || []).length) return null;
  return { person, tr, idx: Math.max(0, Math.min(trackReplay.tIndex, tr.points.length - 1)) };
}

function setOverviewHashWithTrack(extra) {
  const base = {
    id: selected?.id || "",
    track: trackReplay.active ? "1" : "",
    tp: trackReplay.active ? String(trackReplay.tIndex || 0) : "",
    alert: trackReplay.alertId || "",
    plant: plant !== "all" ? plant : ""
  };
  const q = new URLSearchParams({ ...base, ...extra });
  if (!q.get("id")) q.delete("id");
  if (!q.get("track")) q.delete("track");
  if (!q.get("tp")) q.delete("tp");
  if (!q.get("alert")) q.delete("alert");
  if (!q.get("plant")) q.delete("plant");
  if (sceneDetailTab === "calib" && selected?.id && sceneKind(selected) === "camera") q.set("calib", "1");
  else q.delete("calib");
  if (sceneDetailTab === "watch" && selected?.id) q.set("watch", "1");
  else q.delete("watch");
  q.delete("roster");
  if (trackReplay.active && trackReplay.trackId) q.set("tid", trackReplay.trackId);
  else q.delete("tid");
  const qs = q.toString();
  const next = qs ? `/t1/overview?${qs}` : "/t1/overview";
  if (next === lastOverviewHash) return;
  lastOverviewHash = next;
  location.hash = next;
}

function applyTrackFromRoute(route) {
  exitTrackReplay();
  const focusId = route.focus;
  if (route.trackMode !== "1" || !focusId || !personById(focusId)) return;
  const trObj = trackForReplay(focusId, route.trackTid);
  if (!trObj) return;
  trackReplay.active = true;
  trackReplay.personId = focusId;
  trackReplay.trackId = trObj.id;
  trackReplay.alertId = route.alertLink || "";
  const n = trObj.points.length;
  const tp = route.trackTp;
  const idx = tp ? Math.max(0, Math.min(Number(tp) || 0, n - 1)) : n - 1;
  trackReplay.tIndex = idx;
  layers.track = true;
  selected = personById(focusId);
  if (route.historyMode === "1") {
    trackSearch.personId = focusId;
    enterOverviewTrackMode();
  }
}

function startTrackReplay(personId, options = {}) {
  exitTrackReplay();
  const tr = trackForReplay(personId, options.trackId);
  if (!tr) return false;
  selected = personById(personId);
  trackReplay.active = true;
  trackReplay.personId = personId;
  trackReplay.trackId = tr.id;
  trackReplay.alertId = options.alertId || "";
  const n = tr.points.length;
  let idx = options.tIndex;
  if (idx == null && options.alertId) {
    const pName = personById(personId)?.name || "";
    const ev = (data.events || []).find((e) => (
      e.alertId === options.alertId
      && (!pName || personNameFromEventField(e.person) === pName)
    ));
    const t = ev?.time;
    if (t) {
      const hit = tr.points.findIndex((p) => eventTimeMatchesPoint(t, p.t));
      idx = hit >= 0 ? hit : n - 1;
    }
  }
  if (idx == null) idx = n - 1;
  trackReplay.tIndex = Math.max(0, Math.min(idx, n - 1));
  layers.track = true;
  setOverviewHashWithTrack({ id: personId, tid: tr.id, tp: String(trackReplay.tIndex) });
  return true;
}

/** 供人员/告警「看轨迹」链接：含 id、track、tid、tp、alert，进入 overview 后由 applyTrackFromRoute 还原 */
function trackReplayDeepHash(personId, options = {}) {
  const tr = trackForReplay(personId, options.trackId);
  if (!tr || !(tr.points || []).length) return "#/t1/overview";
  const n = tr.points.length;
  let idx = options.tIndex;
  if (idx == null && options.alertId) {
    const pName = personById(personId)?.name || "";
    const ev = (data.events || []).find((e) => (
      e.alertId === options.alertId
      && (!pName || personNameFromEventField(e.person) === pName)
    ));
    const t = ev?.time;
    if (t) {
      const hit = tr.points.findIndex((p) => eventTimeMatchesPoint(t, p.t));
      idx = hit >= 0 ? hit : n - 1;
    }
  }
  if (idx == null) idx = n - 1;
  idx = Math.max(0, Math.min(idx, n - 1));
  const q = new URLSearchParams({ id: personId, track: "1", tid: tr.id, tp: String(idx), history: "1" });
  if (options.alertId) q.set("alert", options.alertId);
  return `#/t1/overview?${q.toString()}`;
}

function trackTimeInRange(t, from, to) {
  if (!t) return false;
  return String(t) >= String(from || "00:00") && String(t) <= String(to || "23:59");
}

function pointInZone(x, y, zone) {
  if (x == null || y == null || !zone) return false;
  return x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h;
}

function trackTouchesZones(tr, zoneIds) {
  if (!zoneIds?.length) return true;
  const pts = tr.points || [];
  return pts.some((p) => zoneIds.some((zid) => {
    const z = (data.zones || []).find((row) => row.id === zid);
    return pointInZone(p.x, p.y, z);
  }));
}

function trackSummaryWindow(tr) {
  const pts = (tr.points || []).filter((p) => p.t);
  if (!pts.length) return "—";
  const sorted = [...pts].sort((a, b) => String(a.t).localeCompare(String(b.t)));
  return `${sorted[0].t}–${sorted[sorted.length - 1].t}`;
}

function runTrackSearch() {
  const rows = data.personTracks || [];
  trackSearchResults = rows.filter((tr) => {
    if (trackSearch.personId && tr.personId !== trackSearch.personId) return false;
    const pts = tr.points || [];
    if (!pts.some((p) => trackTimeInRange(p.t, trackSearch.from, trackSearch.to))) return false;
    if (!trackTouchesZones(tr, trackSearch.zoneIds)) return false;
    const person = personById(tr.personId);
    if (plant !== "all" && person?.zone) {
      const z = (data.zones || []).find((row) => row.id === person.zone);
      if (z?.plant && z.plant !== plant) return false;
    }
    return true;
  });
  trackSearch.searched = true;
}

function enterOverviewTrackMode() {
  overviewTrackMode = true;
  layers.zones = true;
  layers.track = false;
  runTrackSearch();
}

function exitOverviewTrackMode() {
  overviewTrackMode = false;
}

function personIdForAlertSubject(alertPerson) {
  const name = personNameFromEventField(alertPerson);
  if (!name) return null;
  return (data.people || []).find((p) => p.name === name)?.id || null;
}

let lastOverviewHash = "";

function trackReplayPanelHtml() {
  const st = trackReplayState();
  if (!st) return "";
  const { person, tr, idx } = st;
  const pts = tr.points;
  const pt = pts[idx];
  const n = pts.length;
  const label = pt && !pt.gap ? `${pt.t || ""}${pt.note ? ` · ${pt.note}` : ""}` : "定位缺口";
  return `
    <section class="track-replay-panel grad-border" role="region" aria-label="轨迹回放">
      <h3 class="field-group-title">当前回放</h3>
      <p class="meta track-replay-summary">${person.name} · ${tr.label || "历史轨迹"}</p>
      <div class="track-replay-row track-replay-controls">
        <button type="button" class="btn btn-ghost-sm" data-track-step="-1"${idx <= 0 ? " disabled" : ""} title="上一帧">◀</button>
        <input type="range" class="track-replay-scrub" min="0" max="${Math.max(0, n - 1)}" value="${idx}" data-track-scrub aria-label="时间位置" />
        <button type="button" class="btn btn-ghost-sm" data-track-step="1"${idx >= n - 1 ? " disabled" : ""} title="下一帧">▶</button>
        <button type="button" class="btn btn-ghost-sm track-replay-play" data-track-play>${trackReplay.playing ? "暂停" : "播放"}</button>
      </div>
      <p class="meta track-replay-meta">${label}（${idx + 1}/${n}）</p>
      <button type="button" class="btn btn-sm track-replay-exit" data-track-exit>结束回放</button>
    </section>
  `;
}

function bindTrackReplayBar(root) {
  const scrub = root.querySelector("[data-track-scrub]");
  const playBtn = root.querySelector("[data-track-play]");
  root.querySelectorAll("[data-track-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const st = trackReplayState();
      if (!st) return;
      const delta = Number(btn.dataset.trackStep) || 0;
      const next = Math.max(0, Math.min(st.tr.points.length - 1, st.idx + delta));
      trackReplay.tIndex = next;
      setOverviewHashWithTrack({ tp: String(next) });
      renderPage();
    });
  });
  scrub?.addEventListener("input", () => {
    const st = trackReplayState();
    if (!st) return;
    const v = Number(scrub.value) || 0;
    trackReplay.tIndex = Math.max(0, Math.min(st.tr.points.length - 1, v));
    setOverviewHashWithTrack({ tp: String(trackReplay.tIndex) });
    renderPage();
  });
  playBtn?.addEventListener("click", () => {
    const st = trackReplayState();
    if (!st) return;
    if (trackReplay.playing) {
      stopTrackPlayback();
      renderPage();
      return;
    }
    trackReplay.playing = true;
    clearTrackPlaybackTimer();
    trackReplay.timer = setInterval(() => {
      const s = trackReplayState();
      if (!s) {
        stopTrackPlayback();
        renderPage();
        return;
      }
      if (s.idx >= s.tr.points.length - 1) {
        stopTrackPlayback();
        renderPage();
        return;
      }
      trackReplay.tIndex = s.idx + 1;
      renderPage();
    }, 900);
    renderPage();
  });
  root.querySelector("[data-track-exit]")?.addEventListener("click", () => {
    exitTrackReplay();
    if (overviewTrackMode) {
      setOverviewHashWithTrack({ track: "", id: "", alert: "" });
    } else {
      selected = null;
      lastOverviewHash = "";
      location.hash = "/t1/overview";
    }
    renderPage();
  });
}

function tabSidenavGroups(tab) {
  const labels = [];
  const buckets = new Map();
  tab.pages.forEach((page) => {
    const label = page.group || "";
    if (!buckets.has(label)) {
      buckets.set(label, []);
      labels.push(label);
    }
    buckets.get(label).push(page);
  });
  return labels.map((label) => ({ label, pages: buckets.get(label) }));
}

function findPage(tabId, pageId) {
  const tab = TABS.find((item) => item.id === tabId) || TABS[0];
  const page = tab.pages.find((item) => item.id === pageId) || tab.pages[0];
  return { tab, page };
}

function parseRoute() {
  const hash = (location.hash || "#/t1/overview").replace(/^#\/?/, "");
  const [path, queryString] = hash.split("?");
  let [tabId, pageId] = path.split("/");
  const params = new URLSearchParams(queryString || "");
  if (tabId === "t1" && pageId && pageId !== "overview") {
    if (pageId === "track") layers.track = true;
    if (pageId === "locate") layers.people = true;
    if (pageId === "area") layers.zones = true;
    pageId = "overview";
  }
  if (tabId === "t2") {
    if (pageId === "ack") params.set("filter", params.get("filter") || "待签收");
    if (pageId === "close") params.set("filter", params.get("filter") || "处理中");
    if (pageId === "replay") params.set("filter", params.get("filter") || "已办结");
    if (pageId === "field") params.set("view", "field");
    pageId = "alerts";
  }
  if (tabId === "t3" && (pageId === "video" || params.get("view") === "watch")) {
    tabId = "t1";
    pageId = "overview";
  } else if (tabId === "t3" && (pageId === "cameras" || params.get("view") === "assets")) {
    tabId = "t7";
    pageId = "cameras";
  } else if (tabId === "t3") {
    pageId = "review";
  }
  if (tabId === "t4") {
    tabId = "t7";
  }
  if (tabId === "t7" && pageId === "perms") {
    pageId = "roles";
  }
  if (tabId === "t7" && pageId === "notify") {
    pageId = "audit";
  }
  if (tabId === "t7" && (pageId === "alert-hub" || pageId === "types" || pageId === "rules" || pageId === "report")) {
    tabId = "t2";
    pageId = "alerts";
  }
  if (tabId === "t6" && (pageId === "hotspots" || pageId === "heatmap")) {
    pageId = "heatmap";
  }
  if (tabId === "t6" && (pageId === "cockpit" || pageId === "reports" || pageId === "rollcall")) {
    pageId = "stats";
  }
  if (tabId === "t6" && pageId === "history") {
    pageId = "events";
  }
  if (tabId === "t7" && (pageId === "shifts" || pageId === "duty")) {
    pageId = "org";
  }
  if (tabId === "t5" && pageId === "work-types") {
    tabId = "t7";
    pageId = "work-types";
  }
  if (tabId === "t5" && (pageId === "permit" || pageId === "archive" || pageId === "tickets")) {
    if (pageId === "archive" && !params.get("filter")) params.set("filter", "已归档");
    pageId = "tickets";
  }
  return {
    ...findPage(tabId, pageId),
    focus: params.get("id"),
    filter: params.get("filter") || "全部",
    view: params.get("view") || "",
    scroll: params.get("scroll") || "",
    trackMode: params.get("track") || "",
    trackTid: params.get("tid") || "",
    trackTp: params.get("tp") || "",
    alertLink: params.get("alert") || "",
    historyMode: params.get("history") || "",
    plantId: params.get("plant") || "",
    calib: params.get("calib") || "",
    watch: params.get("watch") || "",
    roster: params.get("roster") || ""
  };
}

function overviewLinkageHref(subjectId) {
  return `#/t1/overview?id=${encodeURIComponent(subjectId)}&watch=1`;
}

function cameraCalibOverviewHref(camId) {
  return `#/t1/overview?id=${encodeURIComponent(camId)}&calib=1`;
}

function cameraCalibPanelHtml(cam) {
  const hasXY = cam.x != null && cam.y != null;
  return `
    ${sceneBlockHtml("地图坐标", `
      <div class="cam-calib-grid">
        <label class="modal-field">X
          <input class="field mono" id="calib-x" type="number" step="0.1" value="${hasXY ? cam.x : ""}" readonly>
        </label>
        <label class="modal-field">Y
          <input class="field mono" id="calib-y" type="number" step="0.1" value="${hasXY ? cam.y : ""}" readonly>
        </label>
      </div>
    `)}
    ${sceneBlockHtml("姿态", `
      <div class="cam-calib-grid">
        <label class="modal-field">方位角（°）
          <input class="field" id="calib-heading" type="number" step="1" value="${cam.heading ?? 0}">
        </label>
        <label class="modal-field">俯仰（°）
          <input class="field" id="calib-pitch" type="number" step="1" value="${cam.pitch ?? 0}">
        </label>
        <label class="modal-field">视场角（°）
          <input class="field" id="calib-fov" type="number" step="1" value="${cam.fov ?? 68}">
        </label>
        <label class="modal-field">标定状态
          <select class="field" id="calib-state">
            ${CAM_CALIB_STATES.map((v) => `<option value="${v}"${v === (cam.calib || "未标定") ? " selected" : ""}>${v}</option>`).join("")}
          </select>
        </label>
      </div>
    `)}
    <div class="scene-panel-actions cam-calib-actions">
      <button type="button" class="btn btn-primary" data-cam-calib-save>保存标定</button>
    </div>
  `;
}

function applyCalibFieldsFromPanel(root, cam) {
  if (!cam || !root) return;
  const h = root.querySelector("#calib-heading");
  if (!h) return;
  cam.heading = Number(h.value) || 0;
  cam.pitch = Number(root.querySelector("#calib-pitch")?.value) || 0;
  cam.fov = Number(root.querySelector("#calib-fov")?.value) || 68;
  cam.calib = root.querySelector("#calib-state")?.value || cam.calib || "未标定";
}

function syncCalibPanelCoords(root, cam) {
  const xEl = root.querySelector("#calib-x");
  const yEl = root.querySelector("#calib-y");
  if (xEl) xEl.value = cam.x != null ? String(Math.round(cam.x * 10) / 10) : "";
  if (yEl) yEl.value = cam.y != null ? String(Math.round(cam.y * 10) / 10) : "";
}

function svgPointFromClient(svg, clientX, clientY) {
  if (!svg) return null;
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const sp = pt.matrixTransform(ctm.inverse());
  return { x: sp.x, y: sp.y };
}

function updateCamMarkerGraphic(root, cam) {
  const g = root.querySelector(`#map [data-cam-drag="${CSS.escape(cam.id)}"]`);
  if (!g || cam.x == null || cam.y == null) return;
  const rect = g.querySelector("rect");
  if (rect) {
    rect.setAttribute("x", cam.x - 4);
    rect.setAttribute("y", cam.y - 4);
    rect.setAttribute("transform", `rotate(45 ${cam.x} ${cam.y})`);
    if (cam._placeHolder) rect.removeAttribute("stroke-dasharray");
  }
  const ring = g.querySelector("circle");
  if (ring) {
    ring.setAttribute("cx", cam.x);
    ring.setAttribute("cy", cam.y);
  }
  updateCamFovGraphic(root, cam);
}

function updateCamFovGraphic(root, cam) {
  if (!layers.fov || cam.x == null) return;
  const show = fovShowAll || fovFocusId === cam.id;
  if (!show) return;
  const svg = root.querySelector("#map .scene-map-stage svg");
  const fovG = svg?.querySelector(".scene-fov");
  if (!fovG) return;
  if (fovShowAll) return;
  if (fovFocusId === cam.id) {
    fovG.innerHTML = fovPath(cam, true);
  }
}

function refreshOverviewMap(root) {
  const stage = root.querySelector("#map .scene-map-stage");
  if (!stage) return;
  stage.outerHTML = drawMap();
  bindOverviewMapInteractions(root);
  if (selected?.id) {
    root.querySelector(`#map [data-pick="${CSS.escape(selected.id)}"]`)?.classList.add("is-hot");
  }
}

function bindOverviewMapInteractions(root) {
  if (!overviewTrackMode) {
    root.querySelectorAll("#map [data-pick]").forEach((node) => {
      node.addEventListener("click", () => {
        const hit = lookup(node.dataset.pick);
        applySceneSelection(hit);
        renderPage();
      });
    });
  }
  bindCameraMapDrag(root);
}

function bindCameraMapDrag(root) {
  if (overviewTrackMode || sceneDetailTab !== "calib") return;
  const cam = selected && sceneKind(selected) === "camera"
    ? data.cameras.find((c) => c.id === selected.id)
    : null;
  if (!cam) return;
  const svg = root.querySelector("#map .scene-map-stage svg");
  const target = root.querySelector(`#map [data-cam-drag="${CSS.escape(cam.id)}"]`);
  if (!svg || !target) return;
  let dragging = false;
  const move = (event) => {
    if (!dragging) return;
    const pt = svgPointFromClient(svg, event.clientX, event.clientY);
    if (!pt) return;
    cam.x = Math.max(0, Math.min(SCENE_MAP_W, Math.round(pt.x * 10) / 10));
    cam.y = Math.max(0, Math.min(SCENE_MAP_H, Math.round(pt.y * 10) / 10));
    if ((cam.calib || "未标定") === "未标定") cam.calib = "标定中";
    syncCalibPanelCoords(root, cam);
    updateCamMarkerGraphic(root, cam);
  };
  const up = () => {
    dragging = false;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    refreshOverviewMap(root);
  };
  target.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    dragging = true;
    target.setPointerCapture?.(event.pointerId);
    move(event);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  });
}

function bindCameraCalibPanel(root) {
  const cam = selected && sceneKind(selected) === "camera"
    ? data.cameras.find((c) => c.id === selected.id)
    : null;
  if (!cam || sceneDetailTab !== "calib") return;
  root.querySelectorAll("#calib-heading, #calib-pitch, #calib-fov, #calib-state").forEach((el) => {
    el.addEventListener("input", () => {
      applyCalibFieldsFromPanel(root, cam);
      if ((cam.calib || "") === "未标定" && (cam.x != null)) cam.calib = "标定中";
      refreshOverviewMap(root);
    });
    el.addEventListener("change", () => {
      applyCalibFieldsFromPanel(root, cam);
      refreshOverviewMap(root);
    });
  });
  root.querySelector("[data-cam-calib-save]")?.addEventListener("click", () => {
    applyCalibFieldsFromPanel(root, cam);
    if (cam.x != null && cam.y != null && cam.calib === "标定中") cam.calib = "已标定";
    persist();
    renderPage();
  });
}

function camerasForSceneDisplay(on) {
  const list = camerasOnMap().filter(inCurrentPlant);
  if (!on.cameras) return [];
  const selId = sceneDetailTab === "calib" && selected?.id && sceneKind(selected) === "camera" ? selected.id : null;
  if (selId && !list.some((c) => c.id === selId)) {
    const cam = data.cameras.find((c) => c.id === selId);
    if (cam && inCurrentPlant(cam)) {
      return [...list, {
        ...cam,
        x: cam.x ?? Math.round(SCENE_MAP_W * 0.5),
        y: cam.y ?? Math.round(SCENE_MAP_H * 0.5),
        _placeHolder: cam.x == null || cam.y == null
      }];
    }
  }
  return list;
}

function go(tabId, pageId, query) {
  location.hash = query ? `/${tabId}/${pageId}?${query}` : `/${tabId}/${pageId}`;
}

function isOpenAlert(item) {
  return item && item.status !== "已办结" && !item.workSuppressed;
}

function openCount() {
  return (data?.alerts || []).filter(isOpenAlert).length;
}

function pendingReview() {
  return videoEvents().filter((item) => ["待复核", "待核查"].includes(item.status)).length;
}

function allEvents() {
  return data?.events || data?.aiEvents || [];
}

function videoEvents() {
  return allEvents().filter((item) => item.source === "视频AI" || item.confidence != null);
}

function eventById(id) {
  return allEvents().find((item) => item.id === id) || null;
}

function personNameFromEventField(personField) {
  if (!personField) return "";
  return String(personField).split(/[\/／]/)[0].trim();
}

function eventTimeMatchesPoint(evTime, ptTime) {
  return evTime && ptTime && String(evTime) <= String(ptTime);
}

function eventsForAlert(alert) {
  if (!alert) return [];
  const listed = (alert.eventIds || []).map(eventById).filter(Boolean);
  if (listed.length) return listed.slice(0, 1);
  const hit = allEvents().find((item) => item.alertId === alert.id && !item.mergedIntoId);
  return hit ? [hit] : [];
}

function linkAlertToEvent(alert, eventId) {
  if (!alert || !eventId) return;
  alert.eventIds = [eventId];
  const ev = eventById(eventId);
  if (ev) ev.alertId = alert.id;
}

function bindAlertsOneEventEach() {
  (data.alerts || []).forEach((alert) => {
    const ids = [...new Set((alert.eventIds || []).filter(Boolean))];
    if (ids.length > 1) alert.eventIds = [ids[0]];
    if (!alert.eventIds?.length) {
      const hit = allEvents().find((ev) => ev.alertId === alert.id && !ev.mergedIntoId);
      if (hit) alert.eventIds = [hit.id];
    }
    const primaryId = alert.eventIds?.[0];
    if (!primaryId) return;
    allEvents().forEach((ev) => {
      if (ev.alertId === alert.id && ev.id !== primaryId) {
        ev.alertId = "";
        if (!ev.note?.includes("未单独升告警")) {
          ev.note = [ev.note, "同学区重复信号，未单独升告警"].filter(Boolean).join("；");
        }
      }
    });
    linkAlertToEvent(alert, primaryId);
  });
}

const LOC_EVENT_SOURCE = "定位";
const LEGACY_FENCE_SOURCE = "电子围栏";

function isLocSpaceEvent(ev) {
  return ev?.source === LOC_EVENT_SOURCE || ev?.source === LEGACY_FENCE_SOURCE;
}

function inferLocTrigger(row) {
  if (row?.locTrigger) return row.locTrigger;
  if (row?.payload?.fence_id || String(row?.deviceId || "").startsWith("FENCE")
    || row?.sourceEventId?.startsWith("FENCE-")) return "围栏边界";
  if (row?.payload?.tag_id || String(row?.deviceId || "").startsWith("TAG")
    || row?.sourceEventId?.startsWith("LOC-")
    || (row?.coordPrecision || "").includes("人员")) return "人员定位";
  if (row?.source === LEGACY_FENCE_SOURCE) return "围栏边界";
  return "人员定位";
}

function normalizeLocEventSource(row) {
  if (!row) return row;
  if (row.source === LEGACY_FENCE_SOURCE) row.source = LOC_EVENT_SOURCE;
  if (isLocSpaceEvent(row) && !row.locTrigger) row.locTrigger = inferLocTrigger(row);
  return row;
}

function migrateLocEventSources() {
  (data.events || []).forEach(normalizeLocEventSource);
}

function eventSourceLabel(ev) {
  if (isLocSpaceEvent(ev)) return LOC_EVENT_SOURCE;
  return ev?.source || "—";
}

function locTriggerLabel(ev) {
  return inferLocTrigger(ev);
}

const HISTORY_EVENT_QUEUE = ["待复核", "待核查"];

function alertForEvent(event) {
  if (!event?.alertId) return null;
  return (data.alerts || []).find((row) => row.id === event.alertId) || null;
}

function historyArchiveEvents() {
  return allEvents().filter((row) => {
    if (row.mergedIntoId) return false;
    if (HISTORY_EVENT_QUEUE.includes(row.status)) return false;
    return true;
  });
}

function ruleLineForEvent(event) {
  const rule = event.ruleId
    ? (data.rules || []).find((r) => r.id === event.ruleId)
    : ruleForType(event.type);
  return rule ? `${rule.id} · ${rule.name}` : (event.ruleId || "—");
}

function eventHistoryTimeline(event) {
  const rows = [];
  const actor = event.reporterName || event.source || "系统";
  rows.push({
    time: event.time || "—",
    status: "原始事件",
    actor,
    note: event.summary || event.note || `${event.source || ""} ${event.type || ""}`.trim()
  });
  if (event.entryPath) {
    rows.push({ time: event.time || "—", status: "规则判定", actor: "告警规则", note: event.entryPath });
  }
  if (event.status === "误报") {
    rows.push({
      time: event.time || "—",
      status: "误报",
      actor: event.reviewer || "复核",
      note: [event.reason, event.note].filter(Boolean).join("；") || "标记误报，未保留正式告警"
    });
  } else if (event.status === "真警") {
    rows.push({
      time: event.time || "—",
      status: "真警",
      actor: event.reviewer || "复核",
      note: event.note || "复核确认真警"
    });
  } else if (event.status === "已抑制") {
    rows.push({
      time: event.time || "—",
      status: "已抑制",
      actor: "作业关联",
      note: event.note || event.fusionNote || "作业票抑制，未升正式告警"
    });
  } else if (event.status === "已升告警" && event.alertId) {
    rows.push({
      time: event.time || "—",
      status: "已升告警",
      actor: "系统",
      note: `生成正式告警 ${event.alertId}`
    });
  } else if (!event.alertId && event.note) {
    rows.push({ time: event.time || "—", status: event.status || "留痕", actor: event.source || "系统", note: event.note });
  }
  const alert = alertForEvent(event);
  if (alert?.timeline?.length) {
    alert.timeline.forEach((row) => {
      rows.push({
        time: row.time,
        status: row.status,
        actor: row.actor,
        note: row.note ? `告警处置 · ${row.note}` : "告警处置留痕"
      });
    });
  }
  return rows;
}

function renderHistoryLinkedBlock(event) {
  const alert = alertForEvent(event);
  let html = "";
  if (event.mergedIntoId) {
    html += `<p class="meta">已并入主事件 ${esc(event.mergedIntoId)}</p>`;
  }
  if (alert?.eventIds?.length > 1) {
    const extras = alert.eventIds.slice(1).map(eventById).filter(Boolean);
    if (extras.length) {
      html += `<dl class="kv"><dt>规则合并附挂</dt><dd class="meta">本告警默认一对一；以下为显式合并的附加事件：${extras.map((row) => esc(row.id)).join("、")}</dd></dl>`;
    }
  }
  if (alert) {
    html += `
      <dl class="kv">
        <dt>正式告警</dt><dd>${esc(alert.id)} · ${esc(alert.status)}</dd>
        <dt>派发</dt><dd>${esc(alertDispatchLine(alert))}</dd>
      </dl>
      ${renderAlertLinkedWorkOrders(alert)}
    `;
  } else if (event.workOrderId) {
    html += `<dl class="kv"><dt>关联工单</dt><dd><a class="text-link" href="#/t5/tickets?id=${encodeURIComponent(event.workOrderId)}">${esc(event.workOrderId)}</a></dd></dl>`;
  }
  return html;
}

function ruleForType(type) {
  return (data.rules || []).find((row) => row.type === type) || null;
}

function rosterNameFor(org, role) {
  const rows = data.shiftRoster || [];
  const byOrg = rows.find((row) => row.org === org);
  if (byOrg) return byOrg.name;
  if (role) {
    const byJob = rows.find((row) => (row.job || "").includes(role));
    if (byJob) return byJob.name;
  }
  return "";
}

function applyRuleDispatch(alert, type, plant) {
  const rule = ruleForType(type);
  if (rule) {
    alert.org = rule.org;
    alert.role = rule.role;
    alert.notify = rule.notify;
    alert.rule = `${rule.id} ${rule.name}`;
  } else {
    alert.org = defaultPlantAssignee(plant);
    alert.role = alert.role || "当班值班员";
    alert.notify = alert.notify || "待办";
    if (!alert.rule) alert.rule = "未绑定规则";
  }
  alert.assignee = alert.org || defaultPlantAssignee(plant);
  alert.assigneePerson = rosterNameFor(alert.org, alert.role);
}

function alertDispatchLine(item) {
  return [item.org || alertAssignee(item), item.role, item.assigneePerson].filter(Boolean).join(" · ");
}

function renderShell() {
  const { tab, page } = parseRoute();
  const hasL2 = tab.pages.length > 1;
  document.querySelector(".body").classList.toggle("no-side", !hasL2);
  document.getElementById("tabs").innerHTML = TABS.map((item) => {
    const count = item.id === "t2" ? openCount() : item.id === "t3" ? pendingReview() : 0;
    const badge = count ? `<span class="tab-badge num">${count > 99 ? "99+" : count}</span>` : "";
    const on = item.id === tab.id;
    return `<button class="tab dark-nav-item${on ? " is-active" : ""}" type="button" data-tab="${item.id}">${item.name}${badge}${on ? `<span class="tab-underline"></span>` : ""}</button>`;
  }).join("");

  document.getElementById("sidenav").innerHTML = hasL2 ? `
    ${tabSidenavGroups(tab).map((group) => `
      ${group.label ? `<h3 class="sidenav-group">${group.label}</h3>` : ""}
      ${group.pages.map((item) => (
        `<a href="#/${tab.id}/${item.id}" class="${item.id === page.id ? "is-active" : ""}">${item.name}</a>`
      )).join("")}
    `).join("")}
  ` : "";

  const crumb = document.getElementById("crumb");
  if (crumb) {
    const hideCrumb = tab.id === "t1" && page.id === "overview";
    const pageTitleTabs = new Set(["t2", "t3", "t5"]);
    const usePageTitle = pageTitleTabs.has(tab.id);
    crumb.classList.toggle("is-hidden", hideCrumb);
    crumb.classList.toggle("has-page-title", !hideCrumb && usePageTitle);
    if (hideCrumb) {
      crumb.innerHTML = "";
    } else if (usePageTitle) {
      crumb.innerHTML = `<h1 class="workspace-page-title">${tab.name}</h1>`;
    } else {
      crumb.innerHTML = hasL2
        ? `<span>${tab.name}</span><span class="crumb-sep">/</span><span class="crumb-current">${page.name}</span>`
        : `<span class="crumb-current">${tab.name}</span>`;
    }
  }

  const op = document.getElementById("operator");
  if (op && data?.operator) {
    const initial = (data.operator.name || "值").slice(0, 1);
    op.innerHTML = `<span class="user-avatar">${initial}</span><span>${data.operator.name} · ${data.operator.role}</span>`;
  }
}

function renderPage() {
  const route = parseRoute();
  if (route.tab.id !== "t1" || route.page?.id !== "overview") {
    stopTrackPlayback();
    overviewTrackMode = false;
  }
  const root = document.getElementById("main");
  if (route.tab.id === "t2") {
    renderAlertFlow(root, route);
    return;
  }
  if (route.tab.id === "t3") {
    renderAiQueue(root, route.focus);
    return;
  }
  if (route.tab.id === "t5") {
    renderWorkOrders(root, route);
    return;
  }
  if (route.tab.id === "t6") {
    if (route.page.id === "stats") renderEventStats(root);
    else if (route.page.id === "heatmap") renderHeatAnalysis(root, route.focus);
    else if (route.page.id === "alert-archive") renderAlertArchive(root, route);
    else renderEventArchive(root, route);
    return;
  }
  if (route.tab.id === "t7") {
    if (route.page.id === "work-types") renderWorkTypesConfig(root, route.focus);
    else if (route.page.id === "work-flows") renderWorkFlowsConfig(root, route.focus);
    else if (route.page.id === "zones") renderZoneAccess(root, route.focus);
    else if (route.page.id === "cameras") renderCameraPage(root, route.focus);
    else if (route.page.id === "org") renderSysOrgPage(root, route.focus);
    else if (route.page.id === "roles") renderSysRolesPage(root, route.focus);
    else if (route.page.id === "users") renderSysUsersPage(root, route.focus);
    else if (route.page.id === "employees") renderSysEmployeesPage(root, route.focus);
    else if (route.page.id === "dict") renderSysDictPage(root, route.focus);
    else if (route.page.id === "params") renderSysParamsPage(root, route.focus);
    else if (route.page.id === "audit") renderSysAudit(root, route);
    else renderSysBase(root, route.focus);
    return;
  }
  if (route.page.done) {
    renderOverview(root, route);
    return;
  }
  renderPlaceholder(root, route);
}

function renderPlaceholder(root, { tab, page, focus }) {
  const alert = data.alerts.find((item) => item.id === focus);
  const detail = alert ? `
    <dl class="object-card">
      <dt>告警编号</dt><dd>${alert.id}</dd>
      <dt>等级 / 类型</dt><dd>${LEVEL_NAME[alert.level]}　${alert.type}</dd>
      <dt>位置</dt><dd>${alert.plant}　${alert.place}</dd>
      <dt>状态</dt><dd>${alert.status}</dd>
      <dt>对象</dt><dd>${alert.person}</dd>
      <dt>命中规则</dt><dd>${alert.rule}</dd>
    </dl>
  ` : "";
  root.innerHTML = `<div class="placeholder">${detail}</div>`;
}

function filteredZones() {
  const plantId = resolvePlantId(plant);
  return data.zones.filter((zone) => plantId === "all" || zone.plant === plantId);
}

function isFocusZone(zone) {
  return !!zone && (zone.fence === "电子围栏" || zone.risk === "高" || zone.risk === "重大");
}

function zoneForSceneItem(item) {
  if (!item || item.empty) return null;
  if ((data.zones || []).some((row) => row.id === item.id)) return item;
  if (item.zone) return (data.zones || []).find((row) => row.id === item.zone) || null;
  if (item.place) {
    return (data.zones || []).find((row) => row.name === item.place || row.mapLabel === item.place) || null;
  }
  return null;
}

function inCurrentPlant(item) {
  if (plant === "all") return true;
  if (!item) return false;
  const plantId = resolvePlantId(plant);
  const itemPlant = item.plant ? resolvePlantId(item.plant) : "";
  if (itemPlant === plantId || item.plant === plantName(plantId)) return true;
  const z = zoneForSceneItem(item);
  return !!(z && z.plant === plantId);
}

function alertsForZone(zone) {
  if (!zone) return [];
  return (data.alerts || []).filter((row) => {
    if (row.status === "已办结") return false;
    if (row.place === zone.name || (zone.mapLabel && row.place === zone.mapLabel)) return true;
    if (row.x == null || zone.x == null) return false;
    return row.x >= zone.x && row.x <= zone.x + zone.w && row.y >= zone.y && row.y <= zone.y + zone.h;
  });
}

function regionCascadePathText() {
  const z = zoneForSceneItem(selected);
  if (z) return `${plantName(z.plant)} / ${z.mapLabel || z.name}`;
  if (plant !== "all") return plantName(plant);
  return "全厂";
}

function regionCascadeHtml() {
  const colPlant = regionCascadePlant || (plant !== "all" ? plant : "");
  const plants = (data.plants || []).filter((row) => row.id !== "all");
  const zones = colPlant ? (data.zones || []).filter((row) => row.plant === colPlant) : [];
  const selZ = zoneForSceneItem(selected);
  return `
    <div class="region-cascade${regionCascadeOpen ? " is-open" : ""}" id="region-cascade">
      <span class="region-cascade-label">区域</span>
      <button type="button" class="field region-cascade-btn" data-cascade-toggle aria-expanded="${regionCascadeOpen}" aria-haspopup="listbox">
        ${regionCascadePathText()}
      </button>
      <div class="region-cascade-panel" ${regionCascadeOpen ? "" : "hidden"}>
        <div class="region-cascade-col">
          <button type="button" class="region-cascade-item${plant === "all" && !selZ ? " is-on" : ""}" data-cascade-all>全厂</button>
        </div>
        <div class="region-cascade-col">
          ${plants.map((row) => `
            <button type="button" class="region-cascade-item${colPlant === row.id ? " is-on" : ""}" data-cascade-plant="${row.id}">${row.name}</button>
          `).join("")}
        </div>
        <div class="region-cascade-col">
          ${colPlant ? `
            <button type="button" class="region-cascade-item${!selZ && plant === colPlant ? " is-on" : ""}" data-cascade-plant-only="${colPlant}">全部区域</button>
            ${zones.map((row) => `
              <button type="button" class="region-cascade-item${selZ?.id === row.id ? " is-on" : ""}" data-cascade-zone="${row.id}">
                ${row.mapLabel || row.name}${isFocusZone(row) ? "<em>重点</em>" : ""}
              </button>
            `).join("")}
          ` : `<p class="meta">先选分厂</p>`}
        </div>
      </div>
    </div>
  `;
}

function applySceneSelection(hit) {
  selected = hit;
  linkageFocusCamId = null;
  scenePanelExpanded = true;
  afterScenePick(hit);
  if (hit && !hit.empty && sceneKind(hit) === "zone") {
    const z = (data.zones || []).find((row) => row.id === hit.id);
    if (z?.plant) {
      plant = z.plant;
      regionCascadePlant = z.plant;
    }
  }
  setOverviewHashWithTrack({ id: hit?.empty ? "" : (hit?.id || "") });
}

function bindRegionCascade(root) {
  const wrap = root.querySelector("#region-cascade");
  if (!wrap) return;
  wrap.querySelector("[data-cascade-toggle]")?.addEventListener("click", (event) => {
    event.stopPropagation();
    regionCascadeOpen = !regionCascadeOpen;
    renderPage();
  });
  wrap.querySelector("[data-cascade-all]")?.addEventListener("click", () => {
    plant = "all";
    regionCascadePlant = "";
    regionCascadeOpen = false;
    selected = null;
    fovFocusId = null;
    fovShowAll = false;
    layers.fov = false;
    setOverviewHashWithTrack({ id: "" });
    renderPage();
  });
  wrap.querySelectorAll("[data-cascade-plant]").forEach((btn) => {
    btn.addEventListener("click", () => {
      plant = btn.dataset.cascadePlant;
      regionCascadePlant = plant;
      regionCascadeOpen = true;
      const z = zoneForSceneItem(selected);
      if (z && z.plant !== plant) {
        selected = null;
        fovFocusId = null;
        fovShowAll = false;
        layers.fov = false;
      }
      setOverviewHashWithTrack({ id: selected?.id || "" });
      renderPage();
    });
  });
  wrap.querySelectorAll("[data-cascade-plant-only]").forEach((btn) => {
    btn.addEventListener("click", () => {
      plant = btn.dataset.cascadePlantOnly;
      regionCascadePlant = plant;
      regionCascadeOpen = false;
      selected = null;
      fovFocusId = null;
      fovShowAll = false;
      layers.fov = false;
      setOverviewHashWithTrack({ id: "" });
      renderPage();
    });
  });
  wrap.querySelectorAll("[data-cascade-zone]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const zone = (data.zones || []).find((row) => row.id === btn.dataset.cascadeZone);
      if (!zone) return;
      plant = zone.plant || plant;
      regionCascadePlant = plant;
      regionCascadeOpen = false;
      applySceneSelection(zone);
      renderPage();
    });
  });
  window.setTimeout(() => {
    document.addEventListener("click", (event) => {
      if (!regionCascadeOpen) return;
      if (event.target.closest("#region-cascade")) return;
      regionCascadeOpen = false;
      wrap.classList.remove("is-open");
      const panel = wrap.querySelector(".region-cascade-panel");
      if (panel) panel.hidden = true;
      wrap.querySelector("[data-cascade-toggle]")?.setAttribute("aria-expanded", "false");
    }, { once: true });
  }, 0);
}

function afterScenePick(item) {
  if (!item || item.empty) return;
  sceneDetailTab = "info";
  layers.cameras = true;
  const isCam = (data.cameras || []).some((cam) => cam.id === item.id);
  if (isCam) {
    fovFocusId = item.id;
    fovShowAll = false;
    layers.fov = true;
  } else {
    fovFocusId = null;
    fovShowAll = false;
    layers.fov = false;
  }
}

function renderOverview(root, route) {
  lastOverviewHash = location.hash || "";
  if (route?.tab?.id === "t1") applyTrackFromRoute(route);
  if (route?.plantId && (data.plants || []).some((row) => row.id === route.plantId)) {
    plant = route.plantId;
    if (!regionCascadePlant) regionCascadePlant = route.plantId;
  }
  normalizeOverviewPlant();
  const focusId = route?.focus;
  const focus = lookup(focusId) || selected;
  if (focus && !focus.empty) selected = focus;
  if (route?.watch === "1" && focus && !focus.empty) {
    sceneDetailTab = "watch";
    scenePanelExpanded = true;
    layers.cameras = true;
    linkageFocusCamId = null;
    const pid = plantIdFromSceneItem(focus);
    if (pid) {
      plant = pid;
      regionCascadePlant = pid;
    }
  } else if (route?.calib === "1" && focus && !focus.empty && sceneKind(focus) === "camera") {
    sceneDetailTab = "calib";
    scenePanelExpanded = true;
    layers.cameras = true;
    layers.fov = true;
    fovFocusId = focus.id;
    fovShowAll = false;
    const pid = plantIdFromSceneItem(focus);
    if (pid) {
      plant = pid;
      regionCascadePlant = pid;
    }
  }
  if (trackReplay.active && trackReplay.personId && selected?.id !== trackReplay.personId) {
    selected = personById(trackReplay.personId) || selected;
  }
  if (selected && !selected.empty && sceneKind(selected) === "zone" && selected.plant) {
    plant = selected.plant;
    regionCascadePlant = selected.plant;
  }
  if (!layers.cameras && layers.fov) {
    layers.fov = false;
    fovShowAll = false;
    fovFocusId = null;
  }
  root.innerHTML = `
    <div class="scene-bar">
      ${regionCascadeHtml()}
      <input id="search-box" class="field search" type="search" placeholder="搜索人员、工号、定位卡、区域、告警">
      <div class="scene-bar-end">${trackModeToggleHtml()}</div>
    </div>
    <div id="scene" class="scene overview-page">
      <div class="overview-layout">
        <section class="overview-scene">
          <div class="canvas-wrap canvas-bg${overviewTrackMode ? " is-track-mode" : ""}" id="map">
            ${drawMap()}
            <div class="mode-switch glass-card">Deziwa 厂区 · 俯视图卫图</div>
            ${overviewTrackMode ? `<div class="track-mode-map-blocker" aria-hidden="true"></div>` : ""}
            <div class="layer-dock" role="group" aria-label="场景图层">
              ${LAYER_BTNS.map((item) => {
                const fovLocked = item.id === "fov" && !layers.cameras;
                return `<button type="button" class="layer-btn${layers[item.id] ? " is-on" : ""}${fovLocked ? " is-disabled" : ""}" data-layer="${item.id}"${fovLocked ? " disabled" : ""} title="${fovLocked ? "请先开启摄像头图层" : ""}">${item.name}</button>`;
              }).join("")}
            </div>
            ${sceneFloatPanelShell(focus)}
          </div>
        </section>
      </div>
    </div>
  `;

  bindRegionCascade(root);
  root.querySelectorAll("[data-layer]").forEach((box) => {
    box.addEventListener("click", () => {
      const layer = box.dataset.layer;
      if (layer === "fov" && !layers.cameras) return;
      layers[layer] = !layers[layer];
      if (layer === "cameras" && !layers.cameras) {
        layers.fov = false;
        fovShowAll = false;
        fovFocusId = null;
      }
      if (layer === "fov") {
        if (layers.fov) {
          fovShowAll = true;
          fovFocusId = null;
        } else {
          fovShowAll = false;
          fovFocusId = null;
        }
      }
      renderPage();
    });
  });
  root.querySelector("#search-box").addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    if (overviewTrackMode) return;
    locateObject(event.target.value.trim());
  });
  bindOverviewMapInteractions(root);
  root.querySelectorAll("[data-toggle-scene-panel]").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      scenePanelExpanded = !scenePanelExpanded;
      renderPage();
    });
  });
  root.querySelectorAll("[data-scene-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      sceneDetailTab = btn.dataset.sceneTab || "info";
      if (selected?.id) setOverviewHashWithTrack({ id: selected.id });
      renderPage();
    });
  });
  root.querySelectorAll("[data-open-plant-roster]").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      layers.people = true;
      openPlantRosterDialog();
    });
  });
  bindCameraCalibPanel(root);
  bindLinkagePanel(root);
  root.querySelector("[data-close-panel]")?.addEventListener("click", () => {
    selected = null;
    linkageFocusCamId = null;
    fovFocusId = null;
    fovShowAll = false;
    layers.fov = false;
    regionCascadeOpen = false;
    setOverviewHashWithTrack({ id: "" });
    renderPage();
  });
  root.querySelector("[data-overview-up]")?.addEventListener("click", () => {
    const z = zoneForSceneItem(selected);
    if (z) {
      selected = null;
      fovFocusId = null;
      fovShowAll = false;
      layers.fov = false;
      plant = z.plant || plant;
      regionCascadePlant = plant;
      setOverviewHashWithTrack({ id: "" });
    } else if (plant !== "all") {
      plant = "all";
      regionCascadePlant = "";
      setOverviewHashWithTrack({ id: "" });
    }
    renderPage();
  });
  if (selected?.id) {
    root.querySelector(`[data-pick="${CSS.escape(selected.id)}"]`)?.classList.add("is-hot");
  }
  bindTrackReplayBar(root);
  bindTrackHistoryPanel(root);
}

function lookup(id) {
  return data.alerts.find((item) => item.id === id)
    || data.people.find((item) => item.id === id)
    || data.cameras.find((item) => item.id === id)
    || data.zones.find((item) => item.id === id)
    || eventById(id);
}

function locateObject(q) {
  if (!q || overviewTrackMode) return;
  const people = (data.people || []).map(hydratePerson);
  const hit = [...people, ...data.cameras, ...data.alerts, ...data.zones]
    .find((item) => [item.name, item.id, item.empCode, item.tagId, item.job, item.team, item.type, item.place]
      .filter(Boolean).some((value) => String(value).includes(q)));
  if (!hit) {
    selected = { empty: true, query: q };
    scenePanelExpanded = true;
    renderPage();
    return;
  }
  applySceneSelection(hit);
  renderPage();
}

function relatedVideos(item) {
  const anchor = linkageAnchorXY(item);
  if (!anchor) return [];
  return nearbyCams(anchor.x, anchor.y).slice(0, 4);
}

function linkageAnchorXY(item) {
  if (!item || item.empty) return null;
  const kind = sceneKind(item);
  if (kind === "camera" && item.x != null) return { x: item.x, y: item.y };
  if (kind === "alert" && item.x != null) return { x: item.x, y: item.y };
  if (kind === "person" && item.x != null) return { x: item.x, y: item.y };
  if (kind === "zone" && item.x != null) {
    return { x: item.x + (item.w || 0) / 2, y: item.y + (item.h || 0) / 2 };
  }
  const zoneId = item.zone || (kind === "zone" ? item.id : null);
  if (zoneId) {
    const z = (data.zones || []).find((row) => row.id === zoneId);
    if (z?.x != null) {
      return { x: z.x + (z.w || 0) / 2, y: z.y + (z.h || 0) / 2 };
    }
  }
  return null;
}

function linkageCamsFor(item) {
  const kind = sceneKind(item);
  const anchor = linkageAnchorXY(item);
  let primary = null;
  if (kind === "camera") primary = item;
  else if (kind === "alert" && item.camera) {
    primary = data.cameras.find((c) => c.id === item.camera) || null;
  }
  const focusId = linkageFocusCamId || primary?.id;
  if (focusId) primary = data.cameras.find((c) => c.id === focusId) || primary;

  const seen = new Set();
  const recommended = [];
  const addRec = (cam, hint) => {
    if (!cam || seen.has(cam.id) || cam.id === primary?.id) return;
    seen.add(cam.id);
    const dist = anchor && cam.x != null
      ? Math.round(Math.hypot(cam.x - anchor.x, cam.y - anchor.y))
      : null;
    recommended.push({
      cam,
      hint: hint || (dist != null ? `距落点约 ${dist}m` : "邻近推荐")
    });
  };

  if (kind === "zone") {
    (data.cameras || []).filter((c) => c.zone === item.id && c.x != null).forEach((c) => addRec(c, "同区域"));
  }
  if (anchor) {
    nearbyCams(anchor.x, anchor.y).forEach((c) => addRec(c));
  }
  if (item.zone && kind !== "zone") {
    (data.cameras || []).filter((c) => c.zone === item.zone && c.x != null).slice(0, 2)
      .forEach((c) => addRec(c, "同区域"));
  }

  const grid = [];
  if (primary) grid.push(primary);
  recommended.forEach((row) => {
    if (grid.length >= 4) return;
    grid.push(row.cam);
  });
  if (!grid.length && recommended.length) grid.push(recommended[0].cam);

  return { primary, recommended: recommended.slice(0, 6), grid: grid.slice(0, 4), anchor };
}

function linkageCamById(camId) {
  return (data.cameras || []).find((c) => c.id === camId) || null;
}

function linkageCamMetaLine(cam) {
  const st = cam.online ? "在线" : "离线";
  return `${cam.code || cam.id} · ${cam.area || "—"} · ${plantName(cam.plant)} · ${st}`;
}

function openLinkageCamModal(camId) {
  const cam = linkageCamById(camId);
  if (!cam) return;
  openAlertDialog(`实时画面 · ${cam.name}`, `
    <div class="linkage-modal-video">${renderMonitor(cam, true)}</div>
    <p class="meta linkage-modal-meta">${linkageCamMetaLine(cam)}</p>
  `, () => true, "关闭", true);
}

function linkageSplitGridHtml(camIds, focusId) {
  const cams = camIds.map((id) => linkageCamById(id)).filter(Boolean).slice(0, 4);
  if (!cams.length) {
    return `<p class="meta">请在下方选择最多 4 路通道后点「应用」。</p>`;
  }
  const active = focusId || cams[0]?.id;
  return `
    <div class="video-grid ai-shots linkage-split-modal" id="linkage-split-grid">
      ${cams.map((cam) => `
        <button type="button" class="linkage-tile${cam.id === active ? " is-on" : ""}" data-linkage-split-pick="${cam.id}">
          ${renderMonitor(cam, cam.id === active)}
        </button>
      `).join("")}
    </div>
  `;
}

function paintLinkageSplitGrid(backdrop, camIds, focusId) {
  const slot = backdrop.querySelector("#linkage-split-grid-slot");
  if (!slot) return;
  slot.innerHTML = linkageSplitGridHtml(camIds, focusId);
  backdrop.querySelectorAll("[data-linkage-split-pick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.linkageSplitPick;
      linkageFocusCamId = id;
      layers.cameras = true;
      paintLinkageSplitGrid(backdrop, camIds, id);
    });
  });
}

function linkageCamOptionLabel(cam) {
  return `${cam.name} · ${cam.code || cam.id}`;
}

function bindLinkageSplitPicker(picker, pool, initialIds, max = 4) {
  let picked = initialIds.filter((id) => pool.some((c) => c.id === id)).slice(0, max);
  const box = picker.querySelector(".linkage-split-box");
  const tags = picker.querySelector(".linkage-split-tags");
  const search = picker.querySelector(".linkage-split-search");
  const menu = picker.querySelector(".linkage-split-menu");
  const camById = Object.fromEntries(pool.map((c) => [c.id, c]));

  const getPicked = () => picked.slice();

  const paintTags = () => {
    tags.innerHTML = picked.map((id) => {
      const cam = camById[id];
      if (!cam) return "";
      return `<span class="linkage-split-tag" data-split-tag="${id}">${cam.name}<button type="button" class="linkage-split-tag-x" data-split-remove="${id}" aria-label="移除">×</button></span>`;
    }).join("");
    search.placeholder = picked.length ? "继续添加" : "选择或搜索通道";
    search.value = "";
  };

  const paintMenu = () => {
    const q = (search.value || "").trim().toLowerCase();
    const rows = pool.filter((c) => {
      if (picked.includes(c.id)) return false;
      if (!q) return true;
      return `${c.name} ${c.code || ""} ${c.id} ${c.area || ""}`.toLowerCase().includes(q);
    });
    if (!rows.length) {
      menu.innerHTML = `<div class="linkage-split-empty">${picked.length >= max ? "最多选择 4 路" : "无匹配通道"}</div>`;
      return;
    }
    const full = picked.length >= max;
    menu.innerHTML = rows.map((c) => (
      `<button type="button" class="linkage-split-opt" data-split-add="${c.id}"${full ? " disabled" : ""}>${linkageCamOptionLabel(c)}</button>`
    )).join("");
  };

  const openMenu = () => {
    picker.classList.add("is-open");
    menu.hidden = false;
    paintMenu();
  };

  const closeMenu = () => {
    picker.classList.remove("is-open");
    menu.hidden = true;
    search.value = "";
  };

  paintTags();

  box.addEventListener("click", (event) => {
    if (event.target.closest("[data-split-remove]")) return;
    openMenu();
    search.focus();
  });
  tags.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-split-remove]");
    if (!btn) return;
    event.stopPropagation();
    picked = picked.filter((id) => id !== btn.dataset.splitRemove);
    paintTags();
    if (picker.classList.contains("is-open")) paintMenu();
  });
  menu.addEventListener("mousedown", (event) => event.preventDefault());
  menu.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-split-add]");
    if (!btn || btn.disabled) return;
    if (picked.length >= max) return;
    picked.push(btn.dataset.splitAdd);
    paintTags();
    paintMenu();
    search.focus();
  });
  search.addEventListener("input", () => {
    openMenu();
    paintMenu();
  });
  search.addEventListener("focus", openMenu);
  search.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && !search.value && picked.length) {
      picked.pop();
      paintTags();
      paintMenu();
    }
    if (event.key === "Escape") {
      event.stopPropagation();
      closeMenu();
      search.blur();
    }
    if (event.key === "Enter") event.preventDefault();
  });

  picker._getPicked = getPicked;
  picker._closeMenu = closeMenu;
  return { getPicked, closeMenu };
}

function openLinkageSplitModal(item) {
  const pack = linkageCamsFor(item);
  const pool = (data.cameras || []).filter((c) => c.x != null).filter(inCurrentPlant);
  let camIds = (linkageSplitCamIds && linkageSplitCamIds.length
    ? linkageSplitCamIds
    : pack.grid.map((c) => c.id)).slice(0, 4);
  const focusId = linkageFocusCamId || pack.primary?.id || camIds[0];
  openAlertDialog("多路分屏", `
    <p class="meta">自选最多 4 路通道组成分屏；点画面可切换面板中的实时画面。</p>
    <p class="linkage-split-channel-label">分屏通道 <span class="meta">最多 4 路</span></p>
    <div class="linkage-split-channel-row">
      <div class="linkage-split-picker" id="linkage-split-picker">
        <div class="linkage-split-box">
          <div class="linkage-split-tags"></div>
          <input type="text" class="linkage-split-search" placeholder="选择或搜索通道" autocomplete="off">
        </div>
        <div class="linkage-split-menu" hidden></div>
      </div>
      <button type="button" class="btn btn-sm linkage-split-apply" data-linkage-split-apply>应用</button>
    </div>
    <div id="linkage-split-grid-slot">${linkageSplitGridHtml(camIds, focusId)}</div>
  `, (backdrop) => {
    const picked = backdrop.querySelector("#linkage-split-picker")?._getPicked?.() || [];
    if (picked.length) linkageSplitCamIds = picked;
    renderPage();
    return true;
  }, "关闭", true, (backdrop) => {
    backdrop.querySelector(".modal-body")?.classList.add("linkage-split-body");
    const picker = backdrop.querySelector("#linkage-split-picker");
    const ctl = bindLinkageSplitPicker(picker, pool, camIds, 4);
    const apply = () => {
      const picked = ctl.getPicked();
      if (!picked.length) return;
      linkageSplitCamIds = picked;
      camIds = picked;
      ctl.closeMenu();
      paintLinkageSplitGrid(backdrop, camIds, linkageFocusCamId || camIds[0]);
    };
    backdrop.querySelector("[data-linkage-split-apply]")?.addEventListener("click", apply);
    backdrop.addEventListener("mousedown", (event) => {
      if (picker && !picker.contains(event.target)) ctl.closeMenu();
    });
    paintLinkageSplitGrid(backdrop, camIds, focusId);
  });
}

function renderLinkagePanelHtml(item) {
  const pack = linkageCamsFor(item);
  if (!pack.primary && !pack.grid.length) {
    return `<p class="meta">暂无关联视频。请确认告警/区域已标定，且附近有在线摄像头。</p>`;
  }
  const primary = pack.primary || pack.grid[0];
  return `
    <section class="linkage-video-panel" data-linkage-context="${item.id}">
      <div class="linkage-panel-head">
        <h3 class="field-group-title">实时画面</h3>
        <button type="button" class="btn btn-sm" data-linkage-split-open>多路分屏</button>
      </div>
      <button type="button" class="linkage-primary linkage-zoom-hit" data-linkage-zoom="${primary.id}" title="点击放大">
        ${renderMonitor(primary, true)}
        <span class="linkage-zoom-hint">点击放大</span>
      </button>
      ${pack.recommended.length ? `
        <h3 class="field-group-title">推荐路</h3>
        <div class="scene-cam-list">
          ${pack.recommended.map((row) => `
            <div class="linkage-rec-row">
              <button type="button" class="scene-cam-row" data-linkage-zoom="${row.cam.id}" title="点击放大">
                <span class="status-lamp">
                  <i class="${row.cam.online ? "ok" : "off"}"></i>
                  <span class="text-link linkage-cam-name" data-linkage-open-cam="${row.cam.id}" role="link" tabindex="-1">${row.cam.name}</span>
                </span>
                <span class="scene-cam-meta">${row.hint}</span>
              </button>
              <button type="button" class="btn btn-sm btn-ghost" data-linkage-live="${row.cam.id}">实时画面</button>
            </div>
          `).join("")}
        </div>
      ` : ""}
    </section>
  `;
}

function bindLinkagePanel(root) {
  if (sceneDetailTab !== "watch") return;
  const ctxId = root.querySelector("[data-linkage-context]")?.dataset.linkageContext;
  const ctx = ctxId ? lookup(ctxId) : selected;
  root.querySelectorAll("[data-linkage-zoom]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      openLinkageCamModal(btn.dataset.linkageZoom);
    });
  });
  root.querySelector("[data-linkage-split-open]")?.addEventListener("click", () => {
    if (ctx) openLinkageSplitModal(ctx);
  });
  root.querySelectorAll("[data-linkage-live]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      openLinkageCamModal(btn.dataset.linkageLive);
    });
  });
  root.querySelectorAll("[data-linkage-open-cam]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      const cam = linkageCamById(btn.dataset.linkageOpenCam);
      if (!cam) return;
      applySceneSelection(cam);
      sceneDetailTab = "watch";
      renderPage();
    });
  });
}

function isSceneFieldNum(label, value) {
  return /编码|时间|已到手|编号|IP|版本|角/.test(label)
    || /^(EVT-|SE-|cam-|R-|HZ-|SG-|TAG-|\d)/.test(String(value));
}

function statusCapsule(status) {
  const tone = status === "已办结" || status === "在线" ? "ok"
    : status === "待签收" || status === "离线" ? "danger"
    : status === "待复核" || status === "处理中" ? "info"
    : status === "已转派" ? "muted"
    : "warn";
  return `<span class="capsule capsule-${tone}">${esc(status)}</span>`;
}

function sceneProfileHtml(rows) {
  return `<div class="field-table">${rows
    .filter(([, value]) => value != null && value !== "")
    .map(([label, value]) => `<div class="field-row"><span class="field-label">${label}</span><span class="field-value${isSceneFieldNum(label, String(value).replace(/<[^>]+>/g, "")) ? " num" : ""}">${value}</span></div>`)
    .join("")}</div>`;
}

function sceneBlockHtml(title, inner) {
  return `<section class="grad-border scene-block"><h3 class="field-group-title">${title}</h3>${inner}</section>`;
}

function sceneFloatPanelLabel(item) {
  if (!item) return plant === "all" ? "全厂概览" : `${plantName(plant)} · 概览`;
  if (item.empty) return "未找到";
  const kind = sceneKind(item);
  if (kind === "alert") return item.type;
  if (kind === "person") return item.name;
  if (kind === "camera") return item.name;
  return item.name || "区域详情";
}

function scenePanelTabsHtml(active, specs) {
  if (!specs || specs.length < 2) return "";
  return `<div class="scene-panel-tabs alert-panel-switch">${specs.map((s) => (
    `<button type="button" class="btn btn-sm scene-panel-tab${active === s.id ? " is-on" : ""}" data-scene-tab="${s.id}">${s.label}</button>`
  )).join("")}</div>`;
}

function scenePanelChrome({ title, sub, badge, body, actions }) {
  return `
    <header class="scene-panel-head hairline-b">
      <div class="scene-panel-title-row">
        <strong>${title}</strong>
        <div class="scene-panel-head-actions">
          ${badge || ""}
          <button type="button" class="scene-panel-fold" data-toggle-scene-panel aria-label="收起面板">收起</button>
        </div>
      </div>
      ${sub ? `<p class="scene-panel-hero">${sub}</p>` : ""}
    </header>
    ${body ? `<div class="scene-panel-body">${body}</div>` : ""}
    ${actions ? `<footer class="scene-panel-foot hairline-t">${actions}</footer>` : ""}
  `;
}

function trackModeToggleHtml() {
  const on = overviewTrackMode;
  return `
    <button type="button" class="track-mode-toggle btn${on ? " is-on" : ""}" data-toggle-track-mode aria-pressed="${on}">
      ${on ? "退出轨迹模式" : "历史轨迹"}
    </button>
  `;
}

let trackZoneSelectCtl = null;
let trackPersonSelectCtl = null;
const TRACK_CANVAS_DROPDOWN = "track-canvas-dropdown";

function trackZoneSelectInitialValue() {
  const ids = trackSearch.zoneIds || [];
  return ids.length ? ids.slice() : ["__ALL__"];
}

function trackZoneIdsFromSelectValue(vals) {
  const v = vals || [];
  if (!v.length || v.includes("__ALL__")) return [];
  return v.filter((id) => id !== "__ALL__");
}

function TrackZoneAntSelect(props) {
  const { Select } = antd;
  const [value, setValue] = React.useState(props.value || ["__ALL__"]);
  const handleChange = (vals) => {
    let next = vals?.length ? [...vals] : ["__ALL__"];
    if (next.includes("__ALL__")) {
      const last = vals[vals.length - 1];
      if (last === "__ALL__" || next.filter((id) => id !== "__ALL__").length === 0) {
        next = ["__ALL__"];
      } else {
        next = next.filter((id) => id !== "__ALL__");
      }
    }
    setValue(next);
    props.onChange(next);
  };
  return React.createElement(Select, {
    mode: "multiple",
    showSearch: true,
    optionFilterProp: "label",
    maxTagCount: "responsive",
    placeholder: "全部",
    value,
    onChange: handleChange,
    options: props.options,
    style: { width: "100%" },
    dropdownClassName: TRACK_CANVAS_DROPDOWN,
    dropdownStyle: { zIndex: 2000 },
    getPopupContainer: () => document.body,
    notFoundContent: "无匹配区域"
  });
}

function trackPersonSelectOptions() {
  return (data.people || []).map(hydratePerson).map((p) => ({
    value: p.id,
    label: `${p.name} · ${p.job || ""} · ${p.tagId || "未发卡"}`
  }));
}

function TrackPersonAntSelect(props) {
  const { Select } = antd;
  const [value, setValue] = React.useState(props.value || undefined);
  const handleChange = (v) => {
    const next = v || "";
    setValue(next || undefined);
    props.onChange(next);
  };
  return React.createElement(Select, {
    allowClear: true,
    showSearch: true,
    optionFilterProp: "label",
    placeholder: "不限",
    value: value || undefined,
    onChange: handleChange,
    options: props.options,
    style: { width: "100%" },
    dropdownClassName: TRACK_CANVAS_DROPDOWN,
    dropdownStyle: { zIndex: 2000 },
    getPopupContainer: () => document.body,
    notFoundContent: "无匹配人员"
  });
}

function mountTrackPersonSelect(host) {
  const state = { value: trackSearch.personId || "" };
  const options = trackPersonSelectOptions();
  if (!host) {
    return { getValue: () => state.value, destroy() {} };
  }
  if (!antdMultiSelectReady()) {
    host.innerHTML = `
      <select class="field track-person-fallback" id="track-search-person-fallback">
        <option value="">不限</option>
        ${options.map((o) => (
          `<option value="${esc(o.value)}"${state.value === o.value ? " selected" : ""}>${esc(o.label)}</option>`
        )).join("")}
      </select>`;
    const sel = host.querySelector("select");
    sel?.addEventListener("change", () => { state.value = sel.value || ""; });
    return {
      getValue: () => state.value,
      destroy() { host.innerHTML = ""; }
    };
  }
  const root = ReactDOM.createRoot(host);
  root.render(React.createElement(TrackPersonAntSelect, {
    value: state.value,
    options,
    onChange: (next) => { state.value = next; }
  }));
  return {
    getValue: () => state.value || "",
    destroy() {
      root.unmount();
      host.innerHTML = "";
    }
  };
}

function mountTrackZoneSelect(host) {
  const state = { value: trackZoneSelectInitialValue() };
  const zones = filteredZones();
  const options = [
    { value: "__ALL__", label: "全部" },
    ...zones.map((z) => ({ value: z.id, label: z.mapLabel || z.name }))
  ];
  if (!host) {
    return { getValue: () => trackZoneIdsFromSelectValue(state.value), destroy() {} };
  }
  if (!antdMultiSelectReady()) {
    host.innerHTML = `
      <select class="field track-zone-fallback" multiple size="${Math.min(8, Math.max(4, options.length))}">
        ${options.map((o) => (
          `<option value="${esc(o.value)}"${state.value.includes(o.value) ? " selected" : ""}>${esc(o.label)}</option>`
        )).join("")}
      </select>`;
    const sel = host.querySelector("select");
    const syncFallback = () => {
      let vals = [...(sel?.selectedOptions || [])].map((opt) => opt.value);
      if (!vals.length || vals.includes("__ALL__")) {
        vals = ["__ALL__"];
        [...(sel?.options || [])].forEach((opt) => { opt.selected = opt.value === "__ALL__"; });
      } else {
        vals = vals.filter((v) => v !== "__ALL__");
      }
      state.value = vals;
    };
    sel?.addEventListener("change", syncFallback);
    return {
      getValue: () => trackZoneIdsFromSelectValue(state.value),
      destroy() { host.innerHTML = ""; }
    };
  }
  const root = ReactDOM.createRoot(host);
  root.render(React.createElement(TrackZoneAntSelect, {
    value: state.value,
    options,
    onChange: (next) => { state.value = next; }
  }));
  return {
    getValue: () => trackZoneIdsFromSelectValue(state.value),
    destroy() {
      root.unmount();
      host.innerHTML = "";
    }
  };
}

function trackResultCardHtml(tr) {
  const person = personById(tr.personId);
  const n = (tr.points || []).length;
  const playing = trackReplay.active && trackReplay.trackId === tr.id;
  const zonesHit = (trackSearch.zoneIds || []).length
    ? trackSearch.zoneIds.map((id) => data.zones.find((z) => z.id === id)?.mapLabel || data.zones.find((z) => z.id === id)?.name).filter(Boolean).join("、")
    : "全图范围";
  return `
    <article class="track-result-card grad-border${playing ? " is-playing" : ""}" data-track-result="${tr.id}">
      <header class="track-result-head">
        <strong>${person?.name || tr.personId}</strong>
        <span class="meta num">${trackSummaryWindow(tr)}</span>
      </header>
      <p class="meta">${tr.label || "历史轨迹"} · ${n} 点 · ${zonesHit}</p>
      <div class="track-result-actions">
        <button type="button" class="btn btn-primary btn-sm" data-track-replay-row="${tr.personId}" data-track-row-id="${tr.id}">回放此段</button>
      </div>
    </article>
  `;
}

function renderTrackHistoryPanel() {
  const results = trackSearch.searched
    ? (trackSearchResults.length
      ? trackSearchResults.map(trackResultCardHtml).join("")
      : "")
    : "";
  const replayHtml = trackReplayPanelHtml();
  return `
    <aside class="scene-float-panel is-expanded is-track-fixed glass-card glass-glow" id="track-history-panel" aria-label="历史轨迹检索">
      <header class="scene-panel-head hairline-b">
        <div class="scene-panel-title-row">
          <strong>历史轨迹</strong>
          <span class="track-mode-badge">轨迹模式</span>
        </div>
      </header>
      <div class="track-history-form-wrap track-search-body">
        <div class="track-search-form">
          <label class="track-field">
            <span>日期</span>
            <input type="date" class="field" id="track-search-date" value="${trackSearch.date}" />
          </label>
          <div class="track-field-row">
            <label class="track-field">
              <span>起始</span>
              <input type="time" class="field" id="track-search-from" value="${trackSearch.from}" />
            </label>
            <label class="track-field">
              <span>截止</span>
              <input type="time" class="field" id="track-search-to" value="${trackSearch.to}" />
            </label>
          </div>
          <label class="track-field">
            <span>人员</span>
            <div id="track-person-select-host" class="track-zone-select-host track-person-select-host wo-people-select"></div>
          </label>
          <div class="track-field">
            <span class="track-field-label">经过区域</span>
            <div id="track-zone-select-host" class="track-zone-select-host wo-people-select"></div>
          </div>
          <div class="track-search-actions">
            <button type="button" class="btn btn-primary" data-track-search-run>查询</button>
            <button type="button" class="btn" data-track-search-reset>重置</button>
          </div>
        </div>
      </div>
      <div class="track-history-results scene-panel-body">
        <h3 class="field-group-title">命中 ${trackSearch.searched ? trackSearchResults.length : "—"} 段</h3>
        <div class="track-result-list">${results}</div>
      </div>
      <footer class="track-replay-dock hairline-t${replayHtml ? " is-active" : ""}">${replayHtml}</footer>
    </aside>
  `;
}

function bindTrackHistoryPanel(root) {
  trackPersonSelectCtl?.destroy();
  trackPersonSelectCtl = mountTrackPersonSelect(root.querySelector("#track-person-select-host"));
  trackZoneSelectCtl?.destroy();
  trackZoneSelectCtl = mountTrackZoneSelect(root.querySelector("#track-zone-select-host"));
  root.querySelector("[data-toggle-track-mode]")?.addEventListener("click", () => {
    if (overviewTrackMode) exitOverviewTrackMode();
    else enterOverviewTrackMode();
    renderPage();
  });
  root.querySelector("[data-track-search-run]")?.addEventListener("click", () => {
    trackSearch.date = root.querySelector("#track-search-date")?.value || trackSearch.date;
    trackSearch.from = root.querySelector("#track-search-from")?.value || trackSearch.from;
    trackSearch.to = root.querySelector("#track-search-to")?.value || trackSearch.to;
    trackSearch.personId = trackPersonSelectCtl?.getValue() || "";
    trackSearch.zoneIds = trackZoneSelectCtl?.getValue() || [];
    runTrackSearch();
    renderPage();
  });
  root.querySelector("[data-track-search-reset]")?.addEventListener("click", () => {
    trackSearch = { date: "2026-11-04", from: "08:00", to: "20:00", zoneIds: [], personId: "", searched: false };
    trackSearchResults = [];
    renderPage();
  });
  root.querySelectorAll("[data-track-replay-row]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const personId = btn.dataset.trackReplayRow;
      const trackId = btn.dataset.trackRowId;
      if (startTrackReplay(personId, { trackId })) renderPage();
    });
  });
}

function sceneFloatPanelShell(focus) {
  if (overviewTrackMode) return renderTrackHistoryPanel();
  const label = sceneFloatPanelLabel(focus);
  const zoneOn = focus && !focus.empty && sceneKind(focus) === "zone";
  if (!scenePanelExpanded) {
    return `
      <aside class="scene-float-panel is-collapsed" id="object-card" aria-label="对象详情" aria-expanded="false">
        <button type="button" class="scene-float-peek glass-card" data-toggle-scene-panel aria-label="展开信息面板">
          <span class="scene-float-peek-kicker">信息</span>
          <span class="scene-float-peek-title">${label}</span>
          <span class="scene-float-peek-icon" aria-hidden="true">‹</span>
        </button>
      </aside>
    `;
  }
  return `
    <aside class="scene-float-panel is-expanded glass-card glass-glow animate-rise${zoneOn ? " is-console" : ""}" id="object-card" aria-label="${zoneOn ? "区域信息" : "对象详情"}" aria-expanded="true">
      ${renderScenePanel(focus)}
    </aside>
  `;
}

function personSceneProfileHtml(person) {
  const row = hydratePerson(person);
  const zoneName = personZoneName(row);
  const locLine = `${row.status || "—"} · ${zoneName}`;
  const beat = [row.tagHeartbeat, row.tagBattery ? `电量 ${row.tagBattery}` : ""].filter(Boolean).join(" · ");
  return sceneProfileHtml([
    ["工号", row.empCode || "—"],
    ["姓名", row.name],
    ["岗位", row.job || "—"],
    ["班组", row.team || "—"],
    ["单位", row.org || "—"],
    ["定位卡", row.tagId || "未绑定"],
    ["制式", row.locMode || "—"],
    ["实时定位", locLine],
    ["心跳", beat || "—"],
    ["手机号", row.mobile || "—"]
  ]);
}

function alertSceneProfileHtml(alert) {
  const linked = eventsForAlert(alert);
  const eventLine = linked.length
    ? linked.map((ev) => `${ev.source} ${ev.id}`).join("；")
    : "—";
  return sceneProfileHtml([
    ["告警编号", alert.id],
    ["类型", alert.type],
    ["等级", LEVEL_NAME[alert.level] || alert.level],
    ["状态", statusCapsule(alertDisplayStatus(alert))],
    ["发生时间", alert.time],
    ["分厂", alert.plant],
    ["地点", alert.place],
    ["对象", alert.person],
    ["命中规则", alert.rule],
    ["派发", alertDispatchLine(alert)],
    ["已到手", alertHeldDuration(alert)],
    ["关联事件", eventLine],
    ["最近动作", alert.lastAction]
  ]);
}

function cameraSceneProfileHtml(cam) {
  const zoneName = data.zones.find((z) => z.id === cam.zone)?.name || "";
  const openHere = (data.alerts || []).filter((row) => row.camera === cam.id && isOpenAlert(row)).length;
  return sceneProfileHtml([
    ["通道编码", cam.code || cam.id],
    ["名称", cam.name],
    ["状态", statusCapsule(cam.online ? "在线" : "离线")],
    ["形态", cam.form],
    ["IP", cam.ip],
    ["监控分区", cam.area],
    ["分厂", plantName(cam.plant)],
    ["关联区域", zoneName],
    ["朝向 / 俯仰", `${cam.heading != null ? `${cam.heading}°` : "—"}${cam.pitch != null ? ` / ${cam.pitch}°` : ""}`],
    ["视场角", cam.fov != null ? `${cam.fov}°` : ""],
    ["三维标定", cam.calib],
    ["协议 / 编码", [cam.protocol, cam.codec].filter(Boolean).join(" · ")],
    ["型号", cam.model],
    ["NVR 通道", cam.nvrChannel],
    ["台账同步", cam.sync],
    ["未关闭告警", openHere ? `${openHere} 条` : "无"],
    ["维护备注", cam.maintNote]
  ]);
}

function zoneSceneProfileHtml(zone) {
  const boundRules = (data.rules || []).filter((r) => ruleZoneIds(r).includes(zone.id));
  return sceneProfileHtml([
    ["区域编号", zone.id],
    ["名称", zone.name],
    ["分厂", plantName(zone.plant)],
    ["围栏类型", zone.fence],
    ["风险等级", zone.risk],
    ["有效时段", zone.hours],
    ["作业票", zone.permit ? "须作业票" : "不要求"],
    ["当前有效工单", validWorkOrdersForZone(zone.id).length
      ? validWorkOrdersForZone(zone.id).map((row) => `${row.id} ${workTypeName(row.typeId)}`).join("；")
      : "无"],
    ["边界版本", zone.version],
    ["绑定规则", boundRules.length ? boundRules.map((r) => `${r.id} ${r.name}`).join("；") : "无"],
    ["说明", zone.note]
  ]);
}

function sceneKind(item) {
  if ((data.alerts || []).some((row) => row.id === item.id) && item.type) return "alert";
  if ((data.people || []).some((row) => row.id === item.id)) return "person";
  if ((data.cameras || []).some((row) => row.id === item.id)) return "camera";
  if ((data.zones || []).some((row) => row.id === item.id)) return "zone";
  if (item.level && item.type) return "alert";
  if (item.online !== undefined) return "camera";
  if (item.job) return "person";
  return "zone";
}

function sceneCamSection(item) {
  if (sceneKind(item) === "camera") {
    return sceneBlockHtml("实时画面", `<div class="scene-video-grid">${renderMonitor(item, true)}</div>`);
  }
  const recs = relatedVideos(item);
  if (!recs.length) return "";
  return sceneBlockHtml("周边摄像头", `
    <div class="scene-cam-list">
      ${recs.map((cam) => `
        <button type="button" class="scene-cam-row" data-pick="${cam.id}">
          <span class="status-lamp"><i class="${cam.online ? "ok" : "off"}"></i>${cam.name}</span>
          <span class="scene-cam-meta">${cam.online ? "实时画面" : "离线"}</span>
        </button>
      `).join("")}
    </div>
    ${item.online !== undefined ? `<div class="scene-video-grid">${renderMonitor(item, true)}</div>` : ""}
  `);
}

function plantRosterPlantSplitHtml() {
  if (plant !== "all") return "";
  const all = peopleInCurrentPlant();
  const byPlant = {};
  (data.plants || []).filter((p) => p.id !== "all").forEach((p) => { byPlant[p.id] = 0; });
  all.forEach((p) => {
    const z = zoneForSceneItem(p);
    const pid = z?.plant || "";
    if (pid && byPlant[pid] != null) byPlant[pid] += 1;
  });
  return `<p class="meta plant-roster-split">${(data.plants || []).filter((p) => p.id !== "all").map((p) => `${p.name.replace("作业区", "")} ${byPlant[p.id] || 0}`).join(" · ")}</p>`;
}

function plantRosterListHtml(filter) {
  const all = peopleInCurrentPlant();
  const rows = filter === "abnormal" ? all.filter(personLocAbnormal) : all;
  if (!rows.length) return `<p class="meta">当前范围无在区人员。</p>`;
  return `
    <div class="table-wrap plant-roster-modal-table">
      <table>
        <thead>
          <tr>
            <th>姓名</th>
            <th>工号</th>
            <th>岗位</th>
            <th>区域</th>
            <th>状态</th>
            <th>定位卡</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((p) => {
            const panelHref = `#/t1/overview?id=${encodeURIComponent(p.id)}`;
            const tone = personLocAbnormal(p) ? "danger" : "ok";
            return `
            <tr>
              <td><a class="text-link" href="${panelHref}">${esc(p.name)}</a></td>
              <td class="meta">${esc(p.empCode || "—")}</td>
              <td>${esc(p.job || "—")}</td>
              <td>${esc(personZoneName(p))}</td>
              <td><span class="dot ${tone}">${esc(p.status || "正常")}</span></td>
              <td class="meta">${esc(p.tagId || "未发卡")}</td>
              <td class="table-actions"><a class="btn btn-sm" href="${panelHref}">查看</a></td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function openPlantRosterDialog() {
  let filter = plantRosterFilter;
  const label = plant === "all" ? "全厂" : plantName(plant);
  const all = peopleInCurrentPlant();
  const abnormalCount = all.filter(personLocAbnormal).length;
  const syncDialog = (dlg) => {
    plantRosterFilter = filter;
    const host = dlg.querySelector("#plant-roster-host");
    if (host) host.innerHTML = plantRosterListHtml(filter);
    dlg.querySelectorAll("[data-roster-filter]").forEach((btn) => {
      const on = btn.dataset.rosterFilter === filter;
      btn.classList.toggle("is-on", on);
    });
  };
  openAlertDialog(`在区人员 · ${label}`, `
    <p class="meta">当前 ${esc(label)} 共 <b>${all.length}</b> 人${abnormalCount ? `，<b>${abnormalCount}</b> 人状态异常` : ""}。点击姓名或「查看」打开地图人员面板。</p>
    ${plantRosterPlantSplitHtml()}
    <div class="alert-status-chips plant-roster-chips">
      <button type="button" class="chip${filter === "all" ? " is-on" : ""}" data-roster-filter="all">在区 ${all.length}</button>
      <button type="button" class="chip${filter === "abnormal" ? " is-on" : ""}" data-roster-filter="abnormal">异常 ${abnormalCount}</button>
    </div>
    <div id="plant-roster-host">${plantRosterListHtml(filter)}</div>
  `, () => true, "关闭", true, (dlg) => {
    dlg.querySelector(".modal")?.classList.add("is-wide");
    dlg.querySelectorAll("[data-roster-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        filter = btn.dataset.rosterFilter === "abnormal" ? "abnormal" : "all";
        syncDialog(dlg);
      });
    });
  });
}

function renderPlantBriefPanel() {
  const label = plant === "all" ? "全厂" : plantName(plant);
  const openAlerts = (data.alerts || []).filter((row) => isOpenAlert(row) && inCurrentPlant(row));
  const pending = openAlerts.filter((row) => row.status === "待签收").length;
  const cams = (data.cameras || []).filter((cam) => inCurrentPlant(cam));
  const people = peopleInCurrentPlant();
  const abnormal = people.filter(personLocAbnormal).length;
  const keys = filteredZones().filter(isFocusZone);
  const infoBody = `
      <div class="scene-kpi-grid scene-kpi-grid--brief">
        <div class="kpi grad-border shadow-soft"><span>告警</span><strong class="num">${openAlerts.length}</strong></div>
        <div class="kpi grad-border shadow-soft"><span>待签收告警</span><strong class="num">${pending}</strong></div>
        <button type="button" class="kpi grad-border shadow-soft scene-kpi-btn" data-open-plant-roster>
          <span>在区人员</span>
          <strong class="num scene-kpi-value">${people.length}<em>${abnormal ? `${abnormal}人异常` : "状态正常"}</em></strong>
        </button>
        <div class="kpi grad-border shadow-soft"><span>摄像头</span><strong class="num">${cams.length}</strong></div>
      </div>
      <h3 class="field-group-title">重点区域</h3>
      <div class="scene-brief-scroll scene-brief-zones">
        ${keys.length ? keys.map((row) => `
          <button type="button" class="scene-brief-zone grad-border shadow-soft" data-pick="${row.id}">
            <div class="scene-todo-head">
              <span>${row.mapLabel || row.name}</span>
              <span class="lvl lvl-${RISK_LVL[row.risk] || 4}">${row.risk}</span>
            </div>
            <p class="meta">${plantName(row.plant)} · ${row.fence || "风险区"}</p>
          </button>
        `).join("") : `<p class="meta">当前范围无高风险围栏。</p>`}
      </div>
      <h3 class="field-group-title">未关闭告警</h3>
      <div class="scene-brief-scroll scene-brief-alerts">
        ${openAlerts.length ? openAlerts.map((row) => `
          <div class="scene-brief-alert grad-border">
            <button type="button" class="scene-brief-alert-main" data-pick="${row.id}">
              <div class="scene-todo-head">
                <span class="scene-brief-alert-type">${row.type}</span>
                <span class="lvl lvl-${row.level}">${LEVEL_NAME[row.level]}</span>
              </div>
              <p class="meta">${row.place} · ${row.time} · ${alertDisplayStatus(row)}</p>
            </button>
            <a class="btn btn-sm" href="#/t1/overview?id=${encodeURIComponent(row.id)}">查看</a>
          </div>
        `).join("") : `<p class="meta">无未关闭告警。</p>`}
      </div>
  `;
  return scenePanelChrome({
    title: `${label} · 态势`,
    body: infoBody
  });
}

function scenePanelTabbedBody(item, kind, profileHtml) {
  const tabs = [{ id: "info", label: "基本信息" }];
  if (kind === "camera") tabs.push({ id: "calib", label: "三维标定" });
  if (["alert", "person", "camera"].includes(kind)) tabs.push({ id: "watch", label: "关联视频" });
  const active = tabs.some((t) => t.id === sceneDetailTab) ? sceneDetailTab : "info";
  const inner = active === "watch"
    ? renderLinkagePanelHtml(item)
    : active === "calib" && kind === "camera"
      ? `${sceneCamSection(item)}${cameraCalibPanelHtml(item)}`
      : sceneBlockHtml("基本信息", profileHtml);
  return `${scenePanelTabsHtml(active, tabs)}${inner}`;
}

function zoneVideoTabHtml(zone) {
  const cams = relatedVideos(zone);
  if (!cams.length) return `<p class="meta">该区暂无关联视频。</p>`;
  const cells = cams.slice(0, 4).map((cam) => (
    `<div class="zone-console-cam" data-pick="${cam.id}">${renderMonitor(cam, fovFocusId === cam.id)}</div>`
  )).join("");
  return `<div class="zone-console-video">${cells}</div>`;
}

function zoneAlertsTabHtml(zone) {
  const openAlerts = alertsForZone(zone);
  if (!openAlerts.length) return `<p class="meta">该区无未关闭告警。</p>`;
  return openAlerts.map((row) => `
    <button type="button" class="scene-todo-card grad-border shadow-soft" data-pick="${row.id}">
      <div class="scene-todo-head">
        <span>${row.type}</span>
        <span class="lvl lvl-${row.level}">${LEVEL_NAME[row.level]}</span>
      </div>
      <p>${alertDisplayStatus(row)} · ${row.time}</p>
    </button>
  `).join("");
}

function zonePeopleTabHtml(zone) {
  const inZone = (data.people || []).map(hydratePerson).filter((p) => p.zone === zone.id);
  if (!inZone.length) return `<p class="meta">当前无人在区。</p>`;
  return `
    <div class="zone-people-list">
      ${inZone.map((p) => {
        const tr = trackForReplay(p.id);
        const lamp = personLocAbnormal(p) ? "off" : "ok";
        return `
          <article class="zone-people-card grad-border">
            <div class="zone-people-card-main">
              <div class="zone-people-card-head">
                <button type="button" class="zone-people-name" data-pick="${p.id}">${esc(p.name)}</button>
                <span class="status-lamp status-lamp--sm"><i class="${lamp}"></i>${esc(p.status || "在岗")}</span>
              </div>
              <p class="meta zone-people-card-meta">${esc(p.job || "—")} · ${esc(p.tagId || "未发卡")}</p>
            </div>
            ${tr ? `<a class="btn btn-sm" href="${trackReplayDeepHash(p.id, { trackId: tr.id })}">轨迹</a>` : ""}
          </article>`;
      }).join("")}
    </div>
  `;
}

function zonePanelHtml(zone) {
  const tabs = [
    { id: "info", label: "基本信息" },
    { id: "watch", label: "关联视频" },
    { id: "alerts", label: "异常告警" },
    { id: "people", label: "人员分布" }
  ];
  const active = tabs.some((t) => t.id === sceneDetailTab)
    ? sceneDetailTab
    : (sceneDetailTab === "video" ? "watch" : "info");
  const inner = active === "watch" ? renderLinkagePanelHtml(zone)
    : active === "alerts" ? zoneAlertsTabHtml(zone)
    : active === "people" ? zonePeopleTabHtml(zone)
    : sceneBlockHtml("基本信息", zoneSceneProfileHtml(zone));
  return scenePanelChrome({
    title: "区域信息",
    sub: `${zone.name} · ${plantName(zone.plant)}`,
    badge: `<span class="lvl lvl-${RISK_LVL[zone.risk] || 4}">${zone.risk || "区域"}</span>`,
    body: `${scenePanelTabsHtml(active, tabs)}${inner}`,
    actions: `
      <a class="btn" href="#/t7/zones?id=${encodeURIComponent(zone.id)}">区域与定位</a>
      <button type="button" class="btn" data-overview-up>返回上层</button>
    `
  });
}

function renderScenePanel(item) {
  if (!item) return renderPlantBriefPanel();
  if (item.empty) {
    return scenePanelChrome({
      title: "未找到",
      sub: item.query || "",
      body: "",
      actions: `<button type="button" class="btn" data-close-panel>返回概览</button>`
    });
  }
  const kind = sceneKind(item);
  if (kind === "alert") {
    const subjId = personIdForAlertSubject(item.person);
    const subjTrack = subjId && trackForReplay(subjId);
    const trackHref = subjTrack ? trackReplayDeepHash(subjId, { alertId: item.id, trackId: subjTrack.id }) : "";
    return scenePanelChrome({
      title: "告警信息",
      sub: `${item.type} · ${item.id}`,
      badge: `<span class="lvl lvl-${item.level}">${LEVEL_NAME[item.level]}</span>`,
      body: scenePanelTabbedBody(item, kind, alertSceneProfileHtml(item)),
      actions: `
        <a class="btn btn-primary" href="#/t2/alerts?id=${encodeURIComponent(item.id)}">处理告警</a>
        ${trackHref ? `<a class="btn" href="${trackHref}">看轨迹</a>` : ""}
        <button type="button" class="btn" data-close-panel>返回上层</button>
      `
    });
  }
  if (kind === "person") {
    const row = hydratePerson(item);
    const tr = trackForReplay(row.id);
    const replayHref = tr ? trackReplayDeepHash(row.id, { trackId: tr.id }) : "";
    const empHref = row.employeeId ? `#/t7/employees?id=${encodeURIComponent(row.employeeId)}` : "";
    const lamp = personLocAbnormal(row) ? "off" : "ok";
    return scenePanelChrome({
      title: "人员信息",
      sub: `${row.name} · ${row.job || ""}`,
      badge: `<span class="status-lamp"><i class="${lamp}"></i>${row.status || "在岗"}</span>`,
      body: scenePanelTabbedBody(row, kind, personSceneProfileHtml(row)),
      actions: `
        ${replayHref ? `<a class="btn btn-primary" href="${replayHref}">回放轨迹</a>` : ""}
        ${empHref ? `<a class="btn" href="${empHref}">员工档案</a>` : ""}
        <button type="button" class="btn" data-close-panel>返回上层</button>
      `
    });
  }
  if (kind === "camera") {
    return scenePanelChrome({
      title: "摄像头信息",
      sub: `${item.name} · ${item.code || item.id}`,
      badge: `<span class="status-lamp"><i class="${item.online ? "ok" : "off"}"></i>${item.online ? "在线" : "离线"}</span>`,
      body: scenePanelTabbedBody(item, kind, cameraSceneProfileHtml(item)),
      actions: `
        <button type="button" class="btn" data-close-panel>返回上层</button>
      `
    });
  }
  return zonePanelHtml(item);
}

function renderObject(item) {
  return renderScenePanel(item);
}

function camerasOnMap() {
  return data.cameras.filter((cam) => cam.x != null && cam.y != null);
}

const SCENE_AERIAL = "./assets/deziwa-aerial.png?v=4";
/** 必须与 deziwa-aerial.png 像素尺寸一致；改图后整表重标 data/deziwa-map-zones.json */
const SCENE_MAP_W = 576;
const SCENE_MAP_H = 655;
/** 仅用于临时整体平移调试，正式标定请改 deziwa-map-zones.json（见 docs/map-zones-calibration.md） */
const SCENE_MAP_NUDGE = { x: 0, y: 0 };

function sceneMapNudge() {
  const { x, y } = SCENE_MAP_NUDGE;
  return x || y ? ` transform="translate(${x} ${y})"` : "";
}

function fovPath(cam, emphasize) {
  const heading = Number(cam.heading) || 0;
  const rad = (heading * Math.PI) / 180;
  const reach = 58;
  const spread = ((Number(cam.fov) || 68) / 2) * (Math.PI / 180);
  const x1 = cam.x + Math.cos(rad - spread) * reach;
  const y1 = cam.y + Math.sin(rad - spread) * reach;
  const x2 = cam.x + Math.cos(rad + spread) * reach;
  const y2 = cam.y + Math.sin(rad + spread) * reach;
  const fill = cam.online ? "rgba(34,197,94,0.28)" : "rgba(180,35,24,0.24)";
  const stroke = cam.online ? "rgba(74,222,128,0.55)" : "rgba(248,113,113,0.5)";
  const strokeW = emphasize ? 1.8 : 1;
  return `<path class="scene-fov-wedge${emphasize ? " is-focus" : ""}" data-cam-fov="${cam.id}" d="M${cam.x} ${cam.y} L${x1} ${y1} L${x2} ${y2} Z" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" />`;
}

function sceneMapDefs() {
  return `
    <defs>
      <linearGradient id="scene-vignette" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(15,23,42,0)" />
        <stop offset="100%" stop-color="rgba(15,23,42,0.12)" />
      </linearGradient>
      <filter id="scene-label-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0.15" stdDeviation="0.35" flood-color="#0f172a" flood-opacity="0.85" />
      </filter>
      <filter id="scene-marker-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0.2" stdDeviation="0.45" flood-color="#0f172a" flood-opacity="0.7" />
      </filter>
    </defs>
  `;
}

function sceneMapBase() {
  return `
    ${sceneMapDefs()}
    <image href="${SCENE_AERIAL}" x="0" y="0" width="${SCENE_MAP_W}" height="${SCENE_MAP_H}" />
    <rect width="${SCENE_MAP_W}" height="${SCENE_MAP_H}" fill="url(#scene-vignette)" pointer-events="none" />
  `;
}

function svgEscapeText(str) {
  return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function trackMarkerShape(kind, x, y, fill, stroke) {
  if (kind === "cross") {
    const s = 5;
    return `<path d="M${x - s} ${y - s} L${x + s} ${y + s} M${x - s} ${y + s} L${x + s} ${y - s}" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round" />`;
  }
  if (kind === "triangle") {
    return `<polygon points="${x},${y - 6} ${x - 5},${y + 5} ${x + 5},${y + 5}" fill="${fill}" stroke="${stroke}" stroke-width="1" />`;
  }
  return `<circle cx="${x}" cy="${y}" r="4.5" fill="${fill}" stroke="${stroke}" stroke-width="1" />`;
}

function drawTrackReplaySvg() {
  const st = trackReplayState();
  if (!st) return "";
  const { tr, idx } = st;
  const pts = tr.points || [];
  const drawn = pts.map((p, i) => ({
    ...p,
    draw: !(p.gap || (p.x == null || p.y == null))
  }));
  const segments = [];
  let cur = [];
  drawn.forEach((p) => {
    if (!p.draw) {
      if (cur.length) {
        segments.push(cur);
        cur = [];
      }
      return;
    }
    cur.push(p);
  });
  if (cur.length) segments.push(cur);
  const lines = segments.map((seg) => {
    const ptsStr = seg.map((p) => `${p.x},${p.y}`).join(" ");
    return `<polyline points="${ptsStr}" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="6 4" stroke-linecap="round" opacity="0.9" />`;
  }).join("");
  const marks = drawn.map((p, i) => {
    if (!p.label && !p.gap) return "";
    const fill = p.gap ? "#64748b" : p.kind === "warn" ? "#f97316" : "#38bdf8";
    const stroke = "#0f172a";
    const shape = trackMarkerShape(p.shape || "circle", p.x, p.y, fill, stroke);
    const title = svgEscapeText(`${p.t || ""}${p.note ? ` ${p.note}` : ""}`);
    const lab = p.label ? `<text x="${p.x + 8}" y="${p.y - 6}" font-size="10" fill="#e2e8f0" filter="url(#scene-label-shadow)">${svgEscapeText(p.label)}</text>` : "";
    return `<g data-track-idx="${i}" class="track-point${i === idx ? " is-now" : ""}" style="pointer-events:none"><title>${title}</title>${shape}${lab}</g>`;
  }).join("");
  const curPt = drawn[idx];
  let head = "";
  if (curPt && curPt.draw) {
    head = `
      <circle cx="${curPt.x}" cy="${curPt.y}" r="7" fill="none" stroke="#f8fafc" stroke-width="2" opacity="0.95" />
      <circle cx="${curPt.x}" cy="${curPt.y}" r="3.5" fill="#f8fafc" stroke="#0f172a" stroke-width="1" />
    `;
  }
  return `<g class="track-replay-layer">${lines}${marks}${head}</g>`;
}

function personPositionForMap(person) {
  if (!person) return null;
  const st = trackReplayState();
  if (st && st.person && st.person.id === person.id && trackReplay.active) {
    const pt = st.tr.points[st.idx];
    if (pt && !pt.gap && pt.x != null) return { x: pt.x, y: pt.y };
  }
  return { x: person.x, y: person.y };
}

function drawMap(layerState, fovCamId) {
  const on = layerState || layers;
  const fovSingleId = fovCamId !== undefined ? fovCamId : null;
  const zones = filteredZones().map((zone) => {
    const count = data.people.filter((person) => hydratePerson(person).zone === zone.id).length;
    const riskStroke = zone.risk === "重大" ? "#f87171" : zone.risk === "高" ? "#fb923c" : zone.risk === "低" ? "#94a3b8" : "#fbbf24";
    const label = zone.mapLabel || zone.name;
    const fontSize = Math.min(13, Math.max(8, zone.w / 16));
    const countText = count ? ` · ${count}人` : "";
    const filterOn = overviewTrackMode && (trackSearch.zoneIds || []).includes(zone.id);
    const hot = selected?.id === zone.id;
    const key = isFocusZone(zone);
    const fill = filterOn ? "rgba(56,189,248,0.22)" : hot ? "rgba(248,113,113,0.22)" : key ? "rgba(220,38,38,0.16)" : "rgba(220,38,38,0.08)";
    const strokeW = filterOn ? 2.4 : hot ? 2.2 : key ? 1.8 : 1.2;
    const dash = filterOn || key ? "0" : "4 2";
    return on.zones ? `
    <g data-pick="${zone.id}" class="scene-zone${filterOn ? " is-track-filter" : ""}${hot ? " is-hot" : ""}">
      <rect x="${zone.x}" y="${zone.y}" width="${zone.w}" height="${zone.h}"
        fill="${fill}" stroke="${filterOn ? "#38bdf8" : riskStroke}" stroke-width="${strokeW}" stroke-dasharray="${dash}" rx="2" />
      <text x="${zone.x + 3}" y="${zone.y + Math.min(zone.h - 4, fontSize + 2)}" font-size="${fontSize}" fill="#fff" filter="url(#scene-label-shadow)">${label}${countText}</text>
    </g>
  ` : "";
  }).join("");

  let fovList = [];
  if (on.fov) {
    if (fovSingleId) {
      fovList = camerasOnMap().filter((cam) => cam.id === fovSingleId);
    } else if (fovShowAll) {
      fovList = camerasOnMap().filter(inCurrentPlant);
    } else if (fovFocusId) {
      fovList = camerasOnMap().filter((cam) => cam.id === fovFocusId);
    }
  }
  const fov = fovList.length
    ? `<g class="scene-fov">${fovList.map((cam) => fovPath(cam, fovList.length === 1)).join("")}</g>`
    : "";

  const trackReplayLayer = drawTrackReplaySvg();

  const people = on.people ? data.people.map(hydratePerson).filter(inCurrentPlant).filter((person) => (
    person.x != null && person.y != null
  )).map((person) => {
    const abnormal = personLocAbnormal(person);
    const pos = personPositionForMap(person);
    const cx = pos?.x ?? person.x;
    const cy = pos?.y ?? person.y;
    if (cx == null || cy == null) return "";
    return `
    <g data-pick="${person.id}" filter="url(#scene-marker-glow)">
      <circle cx="${cx}" cy="${cy}" r="5"
        fill="${abnormal ? "#ef4444" : "#f8fafc"}" stroke="#0f172a" stroke-width="1" />
      <text x="${cx + 8}" y="${cy + 4}" font-size="11" fill="#fff" filter="url(#scene-label-shadow)">${person.name}</text>
    </g>
  `;
  }).join("") : "";

  const cameras = on.cameras ? camerasForSceneDisplay(on).map((cam) => {
    const calibDrag = sceneDetailTab === "calib" && selected?.id === cam.id;
    const stroke = cam._placeHolder ? "#38bdf8" : "#0f172a";
    const dash = cam._placeHolder ? ' stroke-dasharray="3 2"' : "";
    return `
    <g data-pick="${cam.id}" data-cam-drag="${cam.id}" class="scene-cam${calibDrag ? " is-calib-target" : ""}" filter="url(#scene-marker-glow)">
      <rect x="${cam.x - 4}" y="${cam.y - 4}" width="8" height="8" rx="1"
        fill="${cam.online ? "#e2e8f0" : "#94a3b8"}" stroke="${stroke}" stroke-width="${calibDrag ? 1.6 : 1}"${dash}
        transform="rotate(45 ${cam.x} ${cam.y})" />
      ${calibDrag ? `<circle cx="${cam.x}" cy="${cam.y}" r="11" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="4 3" pointer-events="none" />` : ""}
    </g>
  `;
  }).join("") : "";

  const alerts = on.alerts ? data.alerts.filter((item) => inCurrentPlant(item) && isOpenAlert(item)).map((item) => `
    <g data-pick="${item.id}" filter="url(#scene-marker-glow)">
      <polygon points="${item.x},${item.y - 10} ${item.x - 7},${item.y + 5} ${item.x + 7},${item.y + 5}"
        fill="#ef4444" stroke="#fecaca" stroke-width="1" />
    </g>
  `).join("") : "";

  const svg = `
    <svg viewBox="0 0 ${SCENE_MAP_W} ${SCENE_MAP_H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Deziwa 厂区俯视图卫图场景">
      ${sceneMapBase()}
      <g class="scene-map-overlays"${sceneMapNudge()}>
        ${fov}${zones}${trackReplayLayer}${cameras}${people}${alerts}
      </g>
    </svg>
  `;

  return `<div class="scene-map-stage">${svg}</div>`;
}

const FLOW = ["待签收", "核查中", "处理中", "待复核", "已办结"];

function persist() {
  if (typeof SafetyStore !== "undefined") SafetyStore.save(data);
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function parseAlertWait(wait) {
  if (!wait || wait === "—") return null;
  const parts = String(wait).trim().split(":");
  if (parts.length !== 2) return null;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 3600 + minutes * 60;
}

function formatHeldDuration(totalSeconds) {
  if (totalSeconds == null || totalSeconds < 0) return "";
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const min = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (d >= 1) return `${d}天${h}时`;
  if (h >= 1) return `${h}时${min}分`;
  if (min >= 1) return s ? `${min}分${s}秒` : `${min}分`;
  return `${s}秒`;
}

function alertHeldDuration(item) {
  if (item.status === "已办结") return "";
  const sec = parseAlertWait(item.wait);
  if (sec == null) return "";
  return formatHeldDuration(sec);
}

function alertHeldText(item) {
  const d = alertHeldDuration(item);
  return d ? `已到手 ${d}` : "";
}

function alertMetaLine(item) {
  const parts = [alertDisplayStatus(item)];
  const held = alertHeldText(item);
  if (held) parts.push(held);
  parts.push(item.time);
  return parts.join(" · ");
}

function defaultPlantAssignee(plant) {
  const map = {
    湿法分厂: "湿法分厂值班",
    选矿分厂: "选矿分厂值班",
    尾矿库作业区: "尾矿库值班"
  };
  return map[plant] || "当班值班";
}

function operatorDefaultAssignee() {
  const role = data?.operator?.role || "";
  if (role.includes("选矿")) return defaultPlantAssignee("选矿分厂");
  if (role.includes("尾矿")) return defaultPlantAssignee("尾矿库作业区");
  return defaultPlantAssignee("湿法分厂");
}

function alertAssignee(item) {
  return item.assignee || defaultPlantAssignee(item.plant);
}

function isTransferredOutByMe(item) {
  if (!item || item.status === "已办结") return false;
  if (item.lastTransferActor !== data.operator.name) return false;
  return alertAssignee(item) !== operatorDefaultAssignee();
}

function alertDisplayStatus(item) {
  if (isTransferredOutByMe(item)) return "已转派";
  return item.status;
}

function ensureAlertAssignees() {
  (data?.alerts || []).forEach((item) => {
    if (!item.assignee) item.assignee = defaultPlantAssignee(item.plant);
  });
}

function cameraName(id) {
  return data.cameras.find((item) => item.id === id)?.name || id || "—";
}

function eventReviewHref(ev) {
  if (ev.source === "视频AI" || ev.confidence != null) return `#/t3/review?id=${encodeURIComponent(ev.id)}`;
  return "";
}

function renderAlertLinkedEvents(item) {
  const rows = eventsForAlert(item);
  const eventsHtml = rows.length ? `
    <div class="alert-related">
      <h4 class="alert-related-title">关联事件</h4>
      <ul class="alert-related-list">
        ${rows.map((ev) => {
          const href = eventReviewHref(ev);
          const src = isLocSpaceEvent(ev) ? `${eventSourceLabel(ev)} · ${locTriggerLabel(ev)}` : eventSourceLabel(ev);
          const head = href
            ? `<a class="text-link" href="${href}">${esc(ev.id)}</a>`
            : `<span>${esc(ev.id)}</span>`;
          return `<li>
            <div class="alert-related-head">${head}<span class="meta">${esc(src)} · ${esc(ev.status)}</span></div>
            <p class="meta">${esc(ev.summary || ev.type || "—")}</p>
          </li>`;
        }).join("")}
      </ul>
    </div>
  ` : "";
  return `${eventsHtml}${renderAlertLinkedWorkOrders(item)}`;
}

function alertFilter(filter) {
  return data.alerts.filter((item) => {
    if (item.workSuppressed) return false;
    if (filter === "待签收") {
      if (isTransferredOutByMe(item)) return false;
      return item.status === "待签收";
    }
    if (filter === "处理中") return ["核查中", "处理中", "待复核"].includes(item.status);
    if (filter === "已办结") return item.status === "已办结";
    return true;
  });
}

function alertQueryFilter(items, query) {
  const idQ = (query.id || "").trim().toLowerCase();
  const typeQ = (query.type || "").trim().toLowerCase();
  const placeQ = (query.place || "").trim().toLowerCase();
  const assigneeQ = (query.assignee || "").trim().toLowerCase();
  return items.filter((item) => {
    if (idQ && !item.id.toLowerCase().includes(idQ)) return false;
    if (typeQ && !item.type.toLowerCase().includes(typeQ)) return false;
    if (placeQ) {
      const hay = `${item.place || ""} ${item.plant || ""}`.toLowerCase();
      if (!hay.includes(placeQ)) return false;
    }
    if (assigneeQ && !alertAssignee(item).toLowerCase().includes(assigneeQ)) return false;
    return true;
  });
}

function manualAlertTypeOptions() {
  const names = new Set(["现场隐患"]);
  (data.eventTypes || []).forEach((et) => {
    if (!isLocEventType(et)) names.add(et.name);
  });
  aiAlgos().forEach((a) => names.add(a.eventName));
  (data.alerts || []).forEach((row) => { if (row.type) names.add(row.type); });
  return [...names].sort();
}

function applyManualAlertAssignee(alert, pick) {
  if (!pick) return;
  const opt = alertTransferOptions().find((o) => o.value === pick);
  const label = opt?.label || pick;
  if (pick.startsWith("person:")) {
    const person = (data.people || []).find((p) => p.id === pick.slice(7));
    if (person) {
      alert.assigneePerson = person.name;
      alert.assignee = person.job ? `${person.name}（${person.job}）` : person.name;
      alert.role = person.job || alert.role;
    } else {
      alert.assignee = label;
    }
    return;
  }
  alert.org = pick;
  alert.assignee = pick;
  alert.assigneePerson = rosterNameFor(pick, alert.role);
}

function openManualAlertDialog(after) {
  const plants = (data.plants || []).filter((p) => p.id !== "all");
  const types = manualAlertTypeOptions();
  const assignees = alertTransferOptions();
  const defaultPlant = plants.find((p) => plantName(p.id) === "湿法分厂") || plants[0];
  const zones = (data.zones || []).filter((z) => !defaultPlant || z.plant === defaultPlant.id);
  const cams = (data.cameras || []).filter((c) => !defaultPlant || c.plant === defaultPlant.id).slice(0, 200);
  openAlertDialog("登记告警", `
    <p class="meta">现场发现隐患或需跟进的异常，登记后按类型匹配派发规则进入告警流程。</p>
    <div class="form-fields">
      <label>告警类型
        <select class="field" name="ma-type" id="ma-type">
          ${types.map((name) => `<option value="${name}">${name}</option>`).join("")}
        </select>
      </label>
      <label>告警等级
        <select class="field" name="ma-level">
          ${[1, 2, 3, 4].map((n) => `<option value="${n}"${n === 3 ? " selected" : ""}>${LEVEL_NAME[n]}</option>`).join("")}
        </select>
      </label>
      <label>分厂
        <select class="field" name="ma-plant" id="ma-plant">
          ${plants.map((p) => `<option value="${p.id}"${p.id === defaultPlant?.id ? " selected" : ""}>${p.name}</option>`).join("")}
        </select>
      </label>
      <label>位置 / 区域
        <input class="field" name="ma-place" placeholder="如：磨矿区、电积车间" list="ma-place-hints">
        <datalist id="ma-place-hints">${[...new Set((data.alerts || []).map((r) => r.place).filter(Boolean))].map((n) => `<option value="${n}">`).join("")}</datalist>
      </label>
      <label class="span-2">情况说明
        <textarea class="field" name="ma-summary" rows="3" placeholder="简要描述现场情况"></textarea>
      </label>
      <label>关联区域（可选）
        <select class="field" name="ma-zone" id="ma-zone">
          <option value="">—</option>
          ${zones.map((z) => `<option value="${z.id}">${z.mapLabel || z.name}</option>`).join("")}
        </select>
      </label>
      <label>关联摄像头（可选）
        <select class="field" name="ma-camera" id="ma-camera">
          <option value="">—</option>
          ${cams.map((c) => `<option value="${c.id}">${c.name} · ${c.code || c.id}</option>`).join("")}
        </select>
      </label>
      <label class="span-2">责任人（可选）
        <select class="field" name="ma-assignee" id="ma-assignee">
          <option value="">按规则自动派发</option>
          ${assignees.map((o) => `<option value="${o.value}">${o.label}</option>`).join("")}
        </select>
      </label>
    </div>
  `, (dlg, err) => {
    const type = formVal(dlg, "ma-type");
    const place = formVal(dlg, "ma-place");
    const summary = formVal(dlg, "ma-summary");
    if (!type || !place) {
      if (err) {
        err.hidden = false;
        err.textContent = "请填写告警类型与位置。";
      }
      return false;
    }
    const plantId = dlg.querySelector('[name="ma-plant"]')?.value || defaultPlant?.id;
    const plantLabel = plantName(plantId);
    const level = Number(formVal(dlg, "ma-level")) || 3;
    const zoneId = formVal(dlg, "ma-zone");
    const camera = formVal(dlg, "ma-camera");
    const zone = zoneId ? (data.zones || []).find((z) => z.id === zoneId) : null;
    const day = new Date();
    const stamp = `${day.getFullYear()}${String(day.getMonth() + 1).padStart(2, "0")}${String(day.getDate()).padStart(2, "0")}`;
    const seq = String((data.alerts || []).length + 1).padStart(3, "0");
    const alertId = `EVT-${stamp}-${seq}`;
    const seId = `SE-${stamp}-${seq}`;
    const t = nowTime();
    const alert = {
      id: alertId,
      level,
      type,
      place,
      plant: plantLabel,
      status: "待签收",
      time: t,
      wait: "00:00",
      timeout: false,
      person: data.operator?.name || "值班登记",
      camera: camera || "",
      x: zone?.x,
      y: zone?.y,
      timeline: [
        { status: "人工登记", time: t, actor: data.operator.name, note: summary || type }
      ]
    };
    linkAlertToEvent(alert, seId);
    applyRuleDispatch(alert, type, plantLabel);
    applyManualAlertAssignee(alert, formVal(dlg, "ma-assignee"));
    const rule = ruleForType(type);
    if (rule?.level) alert.level = level;
    if (rule?.sla) alert.rule = `${rule.id} ${rule.name}`;
    else if (!alert.rule) alert.rule = "人工登记";
    const assignPick = formVal(dlg, "ma-assignee");
    if (assignPick) {
      const assignLabel = assignees.find((o) => o.value === assignPick)?.label || assignPick;
      alert.timeline[0].note = [alert.timeline[0].note, `指定责任人：${assignLabel}`].filter(Boolean).join("；");
    }
    data.events = data.events || [];
    data.events.unshift({
      id: seId,
      source: "人工上报",
      sourceEventId: `RPT-${stamp}-${seq}`,
      type,
      level,
      status: "已升告警",
      time: t,
      plant: plantLabel,
      place,
      zoneId: zoneId || "",
      x: zone?.x,
      y: zone?.y,
      camera: camera || "",
      alertId,
      summary: summary || place,
      reporterName: data.operator?.name,
      payload: { description: summary || place, category: "现场隐患" }
    });
    data.alerts = data.alerts || [];
    data.alerts.unshift(alert);
    data.kpis = data.kpis || {};
    data.kpis.openAlerts = openCount();
    persist();
    after(alertId);
    return true;
  }, "确认", true, (dlg) => {
    const plantSel = dlg.querySelector("#ma-plant");
    const zoneSel = dlg.querySelector("#ma-zone");
    const camSel = dlg.querySelector("#ma-camera");
    const syncZoneCam = () => {
      const pid = plantSel?.value;
      const zlist = (data.zones || []).filter((z) => !pid || z.plant === pid);
      const clist = (data.cameras || []).filter((c) => !pid || c.plant === pid);
      if (zoneSel) {
        const prev = zoneSel.value;
        zoneSel.innerHTML = `<option value="">—</option>${zlist.map((z) => (
          `<option value="${z.id}">${z.mapLabel || z.name}</option>`
        )).join("")}`;
        if (prev && zlist.some((z) => z.id === prev)) zoneSel.value = prev;
      }
      if (camSel) {
        const prev = camSel.value;
        camSel.innerHTML = `<option value="">—</option>${clist.map((c) => (
          `<option value="${c.id}">${c.name} · ${c.code || c.id}</option>`
        )).join("")}`;
        if (prev && clist.some((c) => c.id === prev)) camSel.value = prev;
      }
    };
    plantSel?.addEventListener("change", syncZoneCam);
  });
}

function pushLog(item, status, note) {
  item.status = status;
  item.timeline = item.timeline || [];
  item.timeline.push({ status, time: nowTime(), actor: data.operator.name, note });
}

function toolbarStatusFilterHtml(selectId, current, options) {
  return `
    <label class="cam-field-label toolbar-status-filter">
      <span class="cam-field-label-name">状态</span>
      <select class="field alert-q-field" id="${selectId}">
        ${options.map((name) => `<option value="${esc(name)}"${current === name ? " selected" : ""}>${esc(name)}</option>`).join("")}
      </select>
    </label>
  `;
}

function renderAlertFlow(root, route) {
  let focus = route.focus;
  let filter = route.filter || "全部";
  let detailTab = "detail";
  let searchId = "";
  let searchType = "";
  let searchPlace = "";
  let searchAssignee = "";
  let draftId = "";
  let draftType = "";
  let draftPlace = "";
  let draftAssignee = "";

  const list = () => alertQueryFilter(alertFilter(filter), {
    id: searchId,
    type: searchType,
    place: searchPlace,
    assignee: searchAssignee
  });
  const current = () => list().find((item) => item.id === focus) || list()[0] || null;

  function syncDraftFromDom() {
    draftId = root.querySelector("#alert-q-id")?.value || "";
    draftType = root.querySelector("#alert-q-type")?.value || "";
    draftPlace = root.querySelector("#alert-q-place")?.value || "";
    draftAssignee = root.querySelector("#alert-q-assignee")?.value || "";
  }

  function applySearch() {
    syncDraftFromDom();
    searchId = draftId;
    searchType = draftType;
    searchPlace = draftPlace;
    searchAssignee = draftAssignee;
    paint();
  }

  function resetSearch() {
    searchId = "";
    searchType = "";
    searchPlace = "";
    searchAssignee = "";
    draftId = "";
    draftType = "";
    draftPlace = "";
    draftAssignee = "";
    paint();
  }

  function paint() {
    syncDraftFromDom();
    const rows = list();
    const item = current();
    focus = item?.id || null;
    root.innerHTML = `
      <div class="filter-row alert-toolbar">
        ${toolbarStatusFilterHtml("alert-status-filter", filter, ["全部", "待签收", "处理中", "已办结"])}
        <span class="alert-toolbar-sep" aria-hidden="true"></span>
        <label class="cam-field-label"><span class="cam-field-label-name">编号</span>
          <input type="search" class="field alert-q-field" id="alert-q-id" value="${draftId.replace(/"/g, "&quot;")}" autocomplete="off">
        </label>
        <label class="cam-field-label"><span class="cam-field-label-name">类型</span>
          <input type="search" class="field alert-q-field" id="alert-q-type" value="${draftType.replace(/"/g, "&quot;")}" autocomplete="off" list="alert-type-hints">
        </label>
        <label class="cam-field-label"><span class="cam-field-label-name">区域</span>
          <input type="search" class="field alert-q-field" id="alert-q-place" value="${draftPlace.replace(/"/g, "&quot;")}" autocomplete="off" list="alert-place-hints">
        </label>
        <label class="cam-field-label"><span class="cam-field-label-name">责任人</span>
          <input type="search" class="field alert-q-field" id="alert-q-assignee" value="${draftAssignee.replace(/"/g, "&quot;")}" autocomplete="off" list="alert-assignee-hints">
        </label>
        <button type="button" class="btn btn-primary alert-q-submit" id="alert-q-search">搜索</button>
        <button type="button" class="btn btn-ghost alert-q-reset" id="alert-q-reset"${searchId || searchType || searchPlace || searchAssignee || draftId || draftType || draftPlace || draftAssignee ? "" : " disabled"}>重置</button>
        <button type="button" class="btn" id="alert-manual-add">登记告警</button>
        <datalist id="alert-type-hints">${[...new Set((data.alerts || []).map((row) => row.type))].map((name) => `<option value="${name}">`).join("")}</datalist>
        <datalist id="alert-place-hints">${[...new Set((data.alerts || []).flatMap((row) => [row.place, row.plant].filter(Boolean)))].map((name) => `<option value="${name}">`).join("")}</datalist>
        <datalist id="alert-assignee-hints">${[...new Set((data.alerts || []).map((row) => alertAssignee(row)))].map((name) => `<option value="${name}">`).join("")}</datalist>
      </div>
      <div class="alert-layout">
        <aside class="alert-list-panel">
          ${rows.length ? rows.map((row) => `
            <button type="button" class="alert-card${row.id === item?.id ? " is-on" : ""}${isTransferredOutByMe(row) ? " is-transferred" : ""}" data-alert="${row.id}">
              <div class="row">
                <strong>${row.id}</strong>
                <span class="alert-card-tags">
                  ${statusCapsule(alertDisplayStatus(row))}
                  <span class="lvl lvl-${row.level}">${LEVEL_NAME[row.level]}</span>
                </span>
              </div>
              <p>${row.type} · ${row.place}</p>
              <p class="meta">${[alertHeldText(row), row.time].filter(Boolean).join(" · ")}</p>
            </button>
          `).join("") : ""}
        </aside>
        <section class="alert-detail">
          ${item ? renderAlertDetail(item, detailTab) : ""}
        </section>
      </div>
    `;
    root.querySelector("#alert-status-filter")?.addEventListener("change", (event) => {
      filter = event.currentTarget.value || "全部";
      paint();
    });
    const onDraftInput = (event) => {
      draftId = root.querySelector("#alert-q-id")?.value || "";
      draftType = root.querySelector("#alert-q-type")?.value || "";
      draftPlace = root.querySelector("#alert-q-place")?.value || "";
      draftAssignee = root.querySelector("#alert-q-assignee")?.value || "";
      const resetBtn = root.querySelector("#alert-q-reset");
      if (resetBtn) {
        const dirty = searchId || searchType || searchPlace || searchAssignee
          || draftId || draftType || draftPlace || draftAssignee;
        resetBtn.disabled = !dirty;
      }
    };
    root.querySelector("#alert-q-id")?.addEventListener("input", onDraftInput);
    root.querySelector("#alert-q-type")?.addEventListener("input", onDraftInput);
    root.querySelector("#alert-q-place")?.addEventListener("input", onDraftInput);
    root.querySelector("#alert-q-assignee")?.addEventListener("input", onDraftInput);
    root.querySelectorAll(".alert-q-field").forEach((field) => {
      field.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          applySearch();
        }
      });
    });
    root.querySelector("#alert-q-search")?.addEventListener("click", applySearch);
    root.querySelector("#alert-q-reset")?.addEventListener("click", resetSearch);
    root.querySelector("#alert-manual-add")?.addEventListener("click", () => {
      openManualAlertDialog((id) => {
        focus = id;
        filter = "全部";
        paint();
        renderShell();
      });
    });
    root.querySelectorAll("[data-alert]").forEach((btn) => {
      btn.addEventListener("click", () => { focus = btn.dataset.alert; paint(); });
    });
    root.querySelectorAll("[data-detail-tab]").forEach((btn) => {
      btn.addEventListener("click", () => { detailTab = btn.dataset.detailTab; paint(); });
    });
    bindAlertActions(root, item, (next) => {
      focus = next || focus;
      paint();
      renderShell();
    });
    bindAlertEvidenceViewer(root);
  }
  paint();
}

function aiEventForAlert(alertId) {
  const alert = (data.alerts || []).find((row) => row.id === alertId);
  const rows = alert ? eventsForAlert(alert) : allEvents().filter((row) => row.alertId === alertId);
  return rows.find((row) => row.source === "视频AI" || row.confidence != null) || rows[0] || null;
}

function allEventsForAlert(alert) {
  if (!alert) return [];
  const seen = new Set();
  const rows = [];
  const add = (ev) => {
    if (!ev || ev.mergedIntoId || seen.has(ev.id)) return;
    seen.add(ev.id);
    rows.push(ev);
  };
  (alert.eventIds || []).forEach((id) => add(eventById(id)));
  allEvents().forEach((ev) => {
    if (ev.alertId === alert.id) add(ev);
  });
  return rows;
}

function alertEvidenceIsVideo(item, ev) {
  if (ev && (ev.source === "视频AI" || ev.confidence != null)) return true;
  if (ev?.source === "人工上报" && (item.camera || ev.camera)) return true;
  return !!(item.camera);
}

function alertEvidenceCaption(item, ev, cam) {
  const isVideo = alertEvidenceIsVideo(item, ev);
  const capTime = ev?.time || item.time || "";
  const title = ev?.type || item.type || "告警";
  let meta = "";
  if (isVideo) {
    meta = [
      cam?.name || cameraName(item.camera || ev?.camera),
      ev?.confidence != null ? `置信度 ${ev.confidence}%` : "",
      ev ? aiAlgoLabel(ev) : ""
    ].filter(Boolean).join(" · ");
  } else if (ev?.source === "人工上报") {
    meta = ev.summary || ev.payload?.description || "现场上报";
  } else if (isLocSpaceEvent(ev)) {
    meta = `${locTriggerLabel(ev)} · ${ev.summary || "空间触发"}`;
  } else {
    meta = item.person ? `对象 ${item.person}` : "定位 / 规则触发";
  }
  return { isVideo, capTime, title, meta };
}

function alertEvidenceSpec(item, ev, cam, opts = {}) {
  const { isVideo, capTime, title, meta } = alertEvidenceCaption(item, ev, cam);
  const kind = opts.kind || (isVideo ? "video" : "image");
  const badge = opts.badge || (kind === "video" ? "抓拍视频" : "抓拍图片");
  const capLabel = opts.capLabel || `${capTime} · ${opts.titleSuffix ? `${title} · ${opts.titleSuffix}` : title}`;
  const metaLine = opts.metaExtra ? [meta, opts.metaExtra].filter(Boolean).join(" · ") : meta;
  return { kind, title: opts.titleSuffix ? `${title} · ${opts.titleSuffix}` : title, cap: capLabel, meta: metaLine, badge };
}

function alertEvidenceItems(item) {
  const out = [];
  const seen = new Set();
  const push = (spec) => {
    const key = `${spec.kind}|${spec.cap}|${spec.title}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(spec);
  };
  const events = allEventsForAlert(item);
  events.forEach((ev) => {
    const cam = data.cameras.find((c) => c.id === (ev.camera || item.camera));
    const primary = alertEvidenceSpec(item, ev, cam);
    push(primary);
    if (primary.kind === "video") {
      push(alertEvidenceSpec(item, ev, cam, {
        kind: "image",
        titleSuffix: "关键帧",
        metaExtra: "告警触发帧",
        badge: "抓拍图片"
      }));
      push(alertEvidenceSpec(item, ev, cam, {
        kind: "video",
        titleSuffix: "前后片段",
        capLabel: `${ev.time || item.time} · 前后 6s`,
        metaExtra: "触发前后各 3 秒",
        badge: "抓拍视频"
      }));
    } else if (ev?.source === "人工上报") {
      push(alertEvidenceSpec(item, ev, cam, {
        kind: "image",
        titleSuffix: "现场图 2",
        metaExtra: "补充角度",
        badge: "抓拍图片"
      }));
    }
  });
  if (!out.length) {
    const cam = data.cameras.find((c) => c.id === item.camera);
    if (item.camera) {
      push(alertEvidenceSpec(item, null, cam, {
        kind: "video",
        metaExtra: "关联通道录像",
        badge: "抓拍视频"
      }));
      push(alertEvidenceSpec(item, null, cam, {
        kind: "image",
        titleSuffix: "触发帧",
        metaExtra: "告警时刻留存",
        badge: "抓拍图片"
      }));
    } else {
      push(alertEvidenceSpec(item, events[0] || null, cam, {
        kind: "image",
        titleSuffix: "定位快照",
        metaExtra: item.person ? `对象 ${item.person}` : "围栏 / 规则触发",
        badge: "抓拍图片"
      }));
    }
  }
  const nearby = nearbyCams(item.x, item.y).filter((c) => c.id !== item.camera).slice(0, 2);
  nearby.forEach((cam, i) => {
    push({
      kind: i === 0 ? "image" : "video",
      title: "关联通道",
      cap: `${item.time} · ${cam.mapLabel || cam.name}`,
      meta: `${cam.name} · 同期${i === 0 ? "抓拍" : "片段"}`,
      badge: i === 0 ? "抓拍图片" : "抓拍视频"
    });
  });
  return out;
}

function renderAlertEvidenceThumb(spec) {
  const kind = spec.kind === "video" ? "video" : "image";
  const badge = spec.badge || (kind === "video" ? "抓拍视频" : "抓拍图片");
  return `
    <button type="button" class="alert-evidence-thumb alert-evidence-thumb--${kind}"
      data-alert-evidence data-kind="${kind}"
      data-title="${esc(spec.title)}"
      data-cap="${esc(spec.cap)}"
      data-meta="${esc(spec.meta || "")}"
      aria-label="放大查看${badge}">
      <span class="alert-evidence-thumb-media" aria-hidden="true">${kind === "video" ? '<span class="alert-evidence-play">▶</span>' : ""}</span>
      <span class="alert-evidence-thumb-badge">${badge}</span>
      <span class="alert-evidence-thumb-cap">${esc(spec.cap)}</span>
      <span class="alert-evidence-thumb-meta">${esc(spec.meta) || "—"}</span>
      <span class="alert-evidence-zoom">放大查看</span>
    </button>
  `;
}

function renderAlertEvidenceBlock(item) {
  const specs = alertEvidenceItems(item);
  if (!specs.length) return `<p class="meta">暂无抓拍图片或视频。</p>`;
  return `<div class="alert-evidence-grid">${specs.map(renderAlertEvidenceThumb).join("")}</div>`;
}

function alertEvidenceLightboxHtml(dataset) {
  const kind = dataset.kind === "video" ? "video" : "image";
  const title = dataset.title || "证据";
  return `
    <div class="alert-evidence-lightbox alert-evidence-lightbox--${kind}">
      <div class="alert-evidence-stage${kind === "image" ? " alert-evidence-stage--still" : ""}" role="img" aria-label="${kind === "video" ? "抓拍视频" : "抓拍图片"}">
        ${kind === "video" ? '<span class="alert-evidence-play alert-evidence-play--lg" aria-hidden="true">▶</span>' : ""}
      </div>
      <p class="alert-evidence-lightbox-title"><strong>${esc(title)}</strong></p>
      <p class="meta">${esc(dataset.cap || "")}</p>
      ${dataset.meta ? `<p class="meta">${esc(dataset.meta)}</p>` : ""}
    </div>
  `;
}

function bindAlertEvidenceViewer(root) {
  root.querySelectorAll("[data-alert-evidence]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openAlertDialog(
        `证据 · ${btn.dataset.title || ""}`,
        alertEvidenceLightboxHtml(btn.dataset),
        () => true,
        "关闭",
        true
      );
    });
  });
}

function renderAlertSnapshot(item, cam, ev) {
  return renderAlertEvidenceThumb(alertEvidenceSpec(item, ev, cam));
}

function renderAlertVideoTab(item) {
  const nearby = nearbyCams(item.x, item.y).slice(0, 4);
  return `
    <div class="alert-evidence-stack">
      <div class="white-card flush">
        <h3>证据</h3>
        ${renderAlertEvidenceBlock(item)}
      </div>
      <div class="white-card flush">
        <h3>周边关联视频</h3>
        <div class="video-grid ai-shots">
          ${nearby.length
    ? nearby.map((c) => renderMonitor(c, c.id === item.camera)).join("")
    : ""}
        </div>
      </div>
    </div>
  `;
}

function renderAlertDetail(item, detailTab) {
  const tab = detailTab || "detail";
  const step = FLOW.indexOf(item.status);
  const cam = cameraName(item.camera);
  const noteTitle = item.status === "待复核" ? "复核关闭" : item.status === "处理中" ? "现场处置" : "核查处置";
  const logCount = (item.timeline || []).length;
  return `
    <div class="detail-head">
      <div>
        <h2>${item.id} · ${item.type}</h2>
        <p class="meta">${item.plant} ${item.place}${alertHeldText(item) ? ` · ${alertHeldText(item)}` : ""} · ${item.time}</p>
      </div>
      <div class="detail-head-side">
        <span class="alert-card-tags">
          ${statusCapsule(alertDisplayStatus(item))}
          <span class="lvl lvl-${item.level}">${LEVEL_NAME[item.level]}</span>
        </span>
      </div>
    </div>
    <ol class="steps" aria-label="办理进度">
      ${FLOW.map((name, index) => `<li class="${index < step ? "is-done" : index === step ? "is-now" : ""}" data-flow="${name}">${name}</li>`).join("")}
    </ol>
    <div class="detail-tabs" role="tablist">
      <button type="button" class="detail-tab${tab === "detail" ? " is-on" : ""}" role="tab" aria-selected="${tab === "detail"}" data-detail-tab="detail">详情</button>
      <button type="button" class="detail-tab${tab === "video" ? " is-on" : ""}" role="tab" aria-selected="${tab === "video"}" data-detail-tab="video">视频与证据</button>
      <button type="button" class="detail-tab${tab === "timeline" ? " is-on" : ""}" role="tab" aria-selected="${tab === "timeline"}" data-detail-tab="timeline">时间线${logCount ? `<span class="detail-tab-count">${logCount}</span>` : ""}</button>
    </div>
    <div class="detail-tab-panel">
      ${tab === "detail" ? `
        <div class="detail-grid${item.status === "待签收" ? " detail-grid-single" : ""}">
          <div class="white-card flush">
            <h3>关联信息</h3>
            <div class="alert-facts">
              <div class="alert-fact">
                <span class="alert-fact-k">区域</span>
                <span class="alert-fact-v">${esc(item.place || "—")}</span>
              </div>
              <div class="alert-fact">
                <span class="alert-fact-k">对象</span>
                <span class="alert-fact-v">${esc(item.person || "—")}</span>
              </div>
              <div class="alert-fact">
                <span class="alert-fact-k">责任人</span>
                <span class="alert-fact-v">${esc(alertAssignee(item))}</span>
              </div>
              <div class="alert-fact">
                <span class="alert-fact-k">摄像头</span>
                <span class="alert-fact-v">${esc(cam)}</span>
              </div>
              <div class="alert-fact alert-fact--wide">
                <span class="alert-fact-k">已到手</span>
                <span class="alert-fact-v num">${esc(alertHeldDuration(item) || "—")}</span>
              </div>
            </div>
            ${renderAlertLinkedEvents(item)}
          </div>
          ${item.status !== "待签收" ? `
          <div class="white-card flush">
            <h3>${noteTitle}</h3>
            <label>说明<textarea id="alert-note" rows="4" placeholder="填写核查结论、到场措施或复核意见"></textarea></label>
          </div>
          ` : ""}
        </div>
      ` : ""}
      ${tab === "video" ? renderAlertVideoTab(item) : ""}
      ${tab === "timeline" ? `
        <div class="white-card flush">
          <ol class="log">
            ${(item.timeline || []).map((row) => `<li><b>${row.time}</b> ${row.status} · ${row.actor}<span>${row.note || ""}</span></li>`).join("")}
          </ol>
        </div>
      ` : ""}
    </div>
    ${tab === "detail" ? `<div class="alert-actions">${actionButtons(item)}</div>` : ""}
  `;
}

function actionButtons(item) {
  const id = item.id;
  if (isTransferredOutByMe(item)) {
    return `<span class="meta">${alertAssignee(item)}</span>`;
  }
  if (item.status === "已办结") {
    return "";
  }
  const buttons = [];
  if (item.status === "待签收") {
    buttons.push(`<button class="btn btn-primary" data-act="ack" data-id="${id}">立即签收</button>`);
  }
  if (item.status === "核查中") {
    buttons.push(`<button class="btn btn-primary" data-act="check" data-id="${id}">进入处理</button>`);
    buttons.push(`<button class="btn" data-act="false" data-id="${id}">误报关闭</button>`);
  }
  if (item.status === "处理中") {
    buttons.push(`<button class="btn btn-primary" data-act="sim-field" data-id="${id}">处理完成</button>`);
  }
  if (item.status === "待复核") {
    buttons.push(`<button class="btn btn-primary" data-act="close" data-id="${id}">复核关闭</button>`);
    buttons.push(`<button class="btn" data-act="back" data-id="${id}">退回补充</button>`);
  }
  buttons.push(`<button class="btn" data-act="transfer" data-id="${id}">转派</button>`);
  buttons.push(`<button class="btn" data-act="up" data-id="${id}">升级</button>`);
  if (item.status !== "待签收" && item.status !== "待复核") {
    buttons.push(`<button class="btn" data-act="back" data-id="${id}">退回</button>`);
  }
  return buttons.join("");
}

function alertTransferOptions() {
  const seen = new Set();
  const rows = [];
  (data.orgs || []).forEach((name) => {
    if (seen.has(name)) return;
    seen.add(name);
    rows.push({ value: name, label: name });
  });
  ["选矿现场值班", "湿法现场值班", "尾矿现场值班"].forEach((name) => {
    if (seen.has(name)) return;
    seen.add(name);
    rows.push({ value: name, label: name });
  });
  (data.people || []).forEach((p) => {
    const label = `${p.name}（${p.job}）`;
    rows.push({ value: `person:${p.id}`, label });
  });
  return rows;
}

function openAlertDialog(title, bodyHtml, onConfirm, okLabel = "确认", wide = false, onMount) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal${wide ? " is-wide" : ""}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <header class="modal-head"><h3 id="modal-title">${title}</h3></header>
      <div class="modal-body">${bodyHtml}</div>
      <p class="modal-err" id="modal-err" hidden></p>
      <footer class="modal-foot">
        <button type="button" class="btn" data-modal-cancel>取消</button>
        <button type="button" class="btn btn-primary" data-modal-ok>${okLabel}</button>
      </footer>
    </div>
  `;
  const close = () => backdrop.remove();
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) close();
  });
  backdrop.querySelector("[data-modal-cancel]").addEventListener("click", close);
  backdrop.querySelector("[data-modal-ok]").addEventListener("click", () => {
    const err = backdrop.querySelector("#modal-err");
    const ok = onConfirm(backdrop, err);
    if (ok) close();
  });
  document.body.appendChild(backdrop);
  if (typeof onMount === "function") onMount(backdrop);
}

function showTransferDialog(target, defaultNote, after) {
  const options = alertTransferOptions();
  openAlertDialog("转派告警", `
    <p class="meta">${target.id} · ${target.type}。转派后业务状态不变，时间线留痕。</p>
    <label class="modal-field">转派给
      <select id="transfer-to" class="field">
        <option value="">请选择人员或岗位</option>
        ${options.map((o) => `<option value="${o.value}">${o.label}</option>`).join("")}
      </select>
    </label>
    <label class="modal-field">说明（可选）
      <textarea id="transfer-note" class="field" rows="3" placeholder="转派原因或补充要求">${defaultNote || ""}</textarea>
    </label>
  `, (root, err) => {
    const select = root.querySelector("#transfer-to");
    const to = select.value;
    if (!to) {
      err.hidden = false;
      err.textContent = "请选择转派对象。";
      return false;
    }
    const label = options.find((o) => o.value === to)?.label || to;
    const extra = root.querySelector("#transfer-note").value.trim();
    pushLog(target, target.status, extra || `转派给${label}`);
    target.assignee = label;
    target.lastAction = "转派";
    target.lastTransferActor = data.operator.name;
    target.lastTransferAt = nowTime();
    data.kpis.openAlerts = openCount();
    persist();
    after(target.id);
    return true;
  });
}

function showUpgradeDialog(target, defaultNote, after) {
  const cur = target.level;
  const higher = [1, 2, 3, 4].filter((lv) => lv < cur);
  if (!higher.length) {
    openAlertDialog("告警升级", `
      <p class="meta">当前为${LEVEL_NAME[cur]}，已是最高等级，无法继续升级。</p>
    `, () => true);
    return;
  }
  openAlertDialog("告警升级", `
    <p class="meta">${target.id} · 当前 ${LEVEL_NAME[cur]}。升级后等级提高，请确认。</p>
    <label class="modal-field">升级为
      <select id="upgrade-level" class="field">
        ${higher.map((lv) => `<option value="${lv}">${LEVEL_NAME[lv]}</option>`).join("")}
      </select>
    </label>
    <label class="modal-field">说明（可选）
      <textarea id="upgrade-note" class="field" rows="3" placeholder="升级原因">${defaultNote || ""}</textarea>
    </label>
  `, (root, err) => {
    const lv = Number(root.querySelector("#upgrade-level").value);
    if (!lv || lv >= cur) {
      err.hidden = false;
      err.textContent = "请选择有效等级。";
      return false;
    }
    const extra = root.querySelector("#upgrade-note").value.trim();
    target.level = lv;
    pushLog(target, target.status, extra || `升级为${LEVEL_NAME[lv]}`);
    data.kpis.openAlerts = openCount();
    persist();
    after(target.id);
    return true;
  });
}

function bindAlertActions(root, item, refresh) {
  root.querySelectorAll("[data-act]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = data.alerts.find((row) => row.id === btn.dataset.id);
      if (!target) return;
      const act = btn.dataset.act;
      const note = (root.querySelector("#alert-note")?.value || "").trim();
      if (act === "transfer") {
        showTransferDialog(target, note, (id) => {
          refresh(id);
          renderShell();
        });
        return;
      }
      if (act === "up") {
        showUpgradeDialog(target, note, (id) => {
          refresh(id);
          renderShell();
        });
        return;
      }
      if (act === "ack") {
        target.lastAction = "签收";
        pushLog(target, "核查中", note || "值班签收");
      }
      if (act === "check") {
        const contact = aiFieldContact(target.plant);
        target.lastAction = "派现场";
        pushLog(target, "处理中", note || `派${contact}到场处置`);
      }
      if (act === "false") {
        target.lastAction = "误报关闭";
        pushLog(target, "已办结", note || "误报关闭");
      }
      if (act === "sim-field") simulateMobileAlertSubmit(target, note);
      if (act === "close") {
        target.lastAction = "复核关闭";
        pushLog(target, "已办结", note || "复核通过，风险已消除");
      }
      if (act === "back") {
        const index = Math.max(0, FLOW.indexOf(target.status) - 1);
        target.lastAction = "退回";
        pushLog(target, FLOW[index], note || "退回上一节点补充");
      }
      data.kpis.openAlerts = openCount();
      persist();
      refresh(target.id);
    });
  });
}

const FALSE_REASONS = ["遮挡", "光照", "目标误识别", "维护作业"];

function aiFieldContact(plant) {
  const map = {
    选矿分厂: "选矿现场值班",
    湿法分厂: "湿法现场值班",
    尾矿库作业区: "尾矿现场值班"
  };
  return map[plant] || "当班现场值班";
}

function simulateMobileAlertSubmit(item, extraNote) {
  const contact = aiFieldContact(item.plant);
  const arrived = nowTime();
  const measure = "已监护";
  const result = "风险已消除";
  const tail = extraNote ? `；${extraNote}` : "";
  const body = `${measure}；${result}；模拟平板提交${tail}；照片 现场1`;
  item.arrivedAt = arrived;
  item.status = "待复核";
  item.timeline = item.timeline || [];
  item.timeline.push({
    status: "待复核",
    time: nowTime(),
    actor: contact,
    note: `到场 ${arrived}。${body}`
  });
}

function renderAiFieldBlock(item) {
  if (item.status !== "待核查") return "";
  const waiting = !item.fieldReply;
  return `
    <div class="field-confirm">
      <h4>现场确认</h4>
      <dl class="kv">
        <dt>推送对象</dt><dd>${item.fieldTo || "—"}</dd>
        <dt>推送时间</dt><dd>${item.fieldSentAt || "—"}</dd>
        <dt>确认事项</dt><dd>${item.fieldAsk || "—"}</dd>
        <dt>现场回传</dt><dd>${waiting ? '<span class="dot warn">等待回传</span>' : `${item.fieldReply}${item.fieldReplyAt ? ` · ${item.fieldReplyAt}` : ""}`}</dd>
      </dl>
    </div>
  `;
}

function nearbyCams(x, y) {
  return camerasOnMap()
    .map((cam) => ({ ...cam, dist: Math.hypot(cam.x - x, cam.y - y) }))
    .sort((a, b) => a.dist - b.dist);
}

function renderMiniScene(layerState, pickId) {
  const camId = pickId && (data.cameras || []).some((c) => c.id === pickId) ? pickId : null;
  const state = { ...layerState, fov: !!camId };
  return `
    <section class="canvas-wrap canvas-bg">
      ${drawMap(state, camId)}
      <div class="mode-switch glass-card">Deziwa 厂区 · 俯视图卫图</div>
    </section>
  `;
}

function renderMonitor(cam, active) {
  if (!cam) {
    return `<div class="monitor is-off"><span>未选摄像头</span><b>请从左侧选择通道</b></div>`;
  }
  if (!cam.online) {
    return `
      <div class="monitor is-off${active ? " is-on" : ""}">
        <span>${cam.name} · ${cam.code || cam.id}</span>
        <b>通道离线，不能当误报依据</b>
        <p>保留抓拍和录像入口，稍后再调。</p>
      </div>
    `;
  }
  return `
    <div class="monitor${active ? " is-on" : ""}">
      <span>${cam.name} · ${cam.code || cam.id}</span>
      <b>LIVE</b>
      <p>${cam.area || ""}　朝向 ${cam.heading}°</p>
    </div>
  `;
}

function plantName(id) {
  return data.plants.find((item) => item.id === id)?.name || id || "—";
}

function resolvePlantId(plantRef) {
  if (!plantRef || plantRef === "all") return "all";
  const rows = (data.plants || []).filter((p) => p.id !== "all");
  if (rows.some((p) => p.id === plantRef)) return plantRef;
  const byName = rows.find((p) => p.name === plantRef);
  if (byName) return byName.id;
  return plantRef;
}

function plantIdFromSceneItem(item) {
  if (!item || item.empty) return null;
  const z = zoneForSceneItem(item);
  if (z?.plant) return z.plant;
  const id = item.plant ? resolvePlantId(item.plant) : null;
  if (id && id !== "all" && (data.plants || []).some((p) => p.id === id)) return id;
  return null;
}

function normalizeOverviewPlant() {
  const rows = (data.plants || []).filter((p) => p.id !== "all");
  const id = resolvePlantId(plant);
  if (id === "all" || !plant || plant === "all") {
    plant = "all";
    return;
  }
  if (!rows.some((p) => p.id === id)) {
    plant = "all";
    regionCascadePlant = "";
    return;
  }
  plant = id;
  if (regionCascadePlant) regionCascadePlant = resolvePlantId(regionCascadePlant);
}

function calibTone(calib) {
  if (calib === "已标定") return "ok";
  if (calib === "标定中") return "warn";
  return "off";
}

const CAM_FORMS = ["枪机", "球机", "半球", "云台"];
const CAM_PROTOCOLS = ["RTSP", "ONVIF"];
const CAM_CODECS = ["H.264", "H.265"];
const CAM_CALIB_STATES = ["未标定", "标定中", "已标定"];
const CAM_SYNC_STATES = ["已对齐", "待并表"];
const AI_ROI_OPTS = ["全画面", "关联区域", "下半区"];
const DEFAULT_AI_ALGOS = [
  {
    id: "helmet",
    code: "helmet-v3.2",
    name: "安全帽佩戴",
    category: "劳保穿戴",
    eventName: "安全帽缺失",
    eventTypeId: "et-helm",
    enabled: true,
    confidence: 80,
    interval: 30,
    roi: "全画面",
    strategy: "先告警后复核",
    level: 2,
    desc: "作业区未佩戴安全帽，覆盖矿区冶炼厂常见违章。"
  },
  {
    id: "ppe",
    code: "ppe-v1.4",
    name: "劳保服穿戴",
    category: "劳保穿戴",
    eventName: "劳保服缺失",
    eventTypeId: "et-ppe",
    enabled: true,
    confidence: 75,
    interval: 60,
    roi: "全画面",
    strategy: "先告警后复核",
    level: 3,
    desc: "作业区未按规定穿戴劳保服。"
  },
  {
    id: "smoke",
    code: "smoke-v2.0",
    name: "烟雾检测",
    category: "烟火",
    eventName: "烟雾",
    eventTypeId: "et-smoke",
    enabled: true,
    confidence: 70,
    interval: 20,
    roi: "全画面",
    strategy: "先告警后复核",
    level: 2,
    desc: "矿区冶炼厂烟雾异常，可与明火结果融合上屏。"
  },
  {
    id: "fire",
    code: "fire-v2.1",
    name: "明火检测",
    category: "烟火",
    eventName: "明火",
    eventTypeId: "et-fire",
    enabled: true,
    confidence: 78,
    interval: 15,
    roi: "全画面",
    strategy: "先告警后复核",
    level: 1,
    desc: "明火识别，覆盖焊接误报比对。"
  },
  {
    id: "intrusion",
    code: "intrusion-v1.8",
    name: "区域入侵检测",
    category: "区域入侵",
    eventName: "区域入侵",
    eventTypeId: "et-inv",
    enabled: true,
    confidence: 72,
    interval: 20,
    roi: "关联区域",
    strategy: "真警才进正式告警",
    level: 1,
    desc: "视频入侵；置信度偏低时先复核。"
  }
];

function aiAlgos() {
  return data.aiAlgos || DEFAULT_AI_ALGOS;
}

function aiAlgoById(id) {
  return aiAlgos().find((row) => row.id === id) || null;
}

function aiAlgoByCode(code) {
  if (!code) return null;
  return aiAlgos().find((row) => row.code === code || row.id === code) || null;
}

function aiAlgoForEvent(ev) {
  if (!ev) return null;
  return aiAlgoByCode(ev.algo)
    || aiAlgos().find((row) => row.eventName === ev.type || row.eventTypeId === ev.typeCode)
    || null;
}

function aiAlgoLabel(ev) {
  const algo = aiAlgoForEvent(ev);
  if (algo) return `${algo.name} · ${algo.code}`;
  return ev?.algo || "视频AI";
}

function cameraAiBindings(cam) {
  return Array.isArray(cam?.aiBindings) ? cam.aiBindings : [];
}

function cameraAiSummary(cam) {
  const rows = cameraAiBindings(cam)
    .map((row) => {
      const algo = aiAlgoById(row.algoId);
      if (!algo || row.enabled === false || algo.enabled === false) return null;
      return algo.name.replace(/检测$|佩戴$|穿戴$/, "");
    })
    .filter(Boolean);
  return rows;
}

function defaultAiBinding(algo) {
  return {
    algoId: algo.id,
    enabled: true,
    confidence: algo.confidence,
    interval: algo.interval,
    roi: algo.roi
  };
}

function hashText(text) {
  let h = 0;
  String(text || "").split("").forEach((ch) => {
    h = (h * 31 + ch.charCodeAt(0)) | 0;
  });
  return Math.abs(h);
}

function seedAiBindingsForCam(cam) {
  const algos = aiAlgos();
  const h = hashText(cam.id);
  if (!cam.online || h % 9 === 0) return [];
  const area = `${cam.area || ""} ${cam.name || ""}`;
  const picks = new Set(["helmet"]);
  if (/电积|萃取|沉钴|溶液|溶剂|车间/.test(area)) {
    picks.add("ppe");
    picks.add("smoke");
  }
  if (/矿坑|大门|围墙|总降|球机/.test(area) || cam.form === "球机") picks.add("intrusion");
  if (/配电|高配/.test(area) || h % 5 === 0) {
    picks.add("smoke");
    picks.add("fire");
  }
  if (h % 3 === 0) picks.add("ppe");
  return [...picks].map((id) => {
    const algo = algos.find((row) => row.id === id);
    if (!algo) return null;
    const bind = defaultAiBinding(algo);
    bind.enabled = algo.enabled !== false && (id === "helmet" || h % 11 !== 0);
    if (id === "intrusion") bind.roi = "关联区域";
    return bind;
  }).filter(Boolean);
}

function ensureAiEventType(seed) {
  const list = data.eventTypes || (data.eventTypes = []);
  let et = list.find((row) => row.id === seed.id);
  if (!et) {
    et = { ...seed };
    list.push(et);
  }
  Object.assign(et, {
    name: seed.name,
    code: seed.code,
    source: seed.source,
    strategy: seed.strategy,
    level: seed.level,
    sla: seed.sla,
    desc: seed.desc,
    ruleId: seed.ruleId
  });
  return et;
}

function ensureAiRule(seed) {
  const list = data.rules || (data.rules = []);
  let rule = list.find((row) => row.id === seed.id);
  if (!rule) {
    rule = {
      zone: (data.zones || [])[0]?.id || "",
      zoneIds: [],
      status: "启用",
      version: "v1.0",
      stay: 0,
      window: 180,
      recover: 30,
      shift: "全天",
      dedup: "",
      merge: "",
      suppress: "",
      org: (data.orgs || [])[0] || "",
      role: "当班值班员",
      notify: NOTIFY_WAYS[0],
      history: [],
      ...seed
    };
    list.push(rule);
  }
  if (seed.type) rule.type = seed.type;
  if (seed.name) rule.name = seed.name;
  return rule;
}

function ensureAiSysParams() {
  const list = data.sysParams || (data.sysParams = []);
  const extras = [
    { id: "sp-ai-conf", group: "视频AI", name: "默认置信度", code: "AI_CONFIDENCE", value: "80", unit: "%", note: "通道未单独设置时使用" },
    { id: "sp-ai-int", group: "视频AI", name: "默认识别间隔", code: "AI_INTERVAL", value: "30", unit: "秒", note: "同通道同算法最短告警间隔" },
    { id: "sp-ai-dedup", group: "视频AI", name: "融合去重窗口", code: "AI_FUSION_DEDUP", value: "120", unit: "秒", note: "同类结果空间匹配后合并上屏" },
    { id: "sp-ai-radius", group: "视频AI", name: "空间匹配半径", code: "AI_MATCH_RADIUS", value: "15", unit: "米", note: "多路识别归并同一事件" }
  ];
  extras.forEach((row) => {
    if (!list.some((item) => item.id === row.id || item.code === row.code)) list.push(row);
  });
}

function migrateAiTypeNames() {
  const rename = { 烟火: "明火" };
  const apply = (row) => {
    if (row && rename[row.type]) row.type = rename[row.type];
  };
  (data.events || []).forEach(apply);
  (data.alerts || []).forEach(apply);
  (data.eventTypes || []).forEach((et) => {
    if (et.id === "et-fire" || et.name === "烟火") {
      et.name = "明火";
      et.desc = et.desc?.replace("烟火", "明火") || "明火识别。先告警后复核。";
    }
  });
  (data.rules || []).forEach((rule) => {
    if (rule.id === "R-FR" || rule.type === "烟火") {
      rule.type = "明火";
      if (rule.name === "烟火识别") rule.name = "明火识别";
    }
  });
  const fireEv = (data.events || []).find((ev) => ev.type === "明火" && ev.source === "视频AI");
  if (fireEv && !fireEv.fusionNote) fireEv.fusionNote = "同落点 120s 内已抑制 1 条烟雾识别";
}

function ensureAiDemoEvents() {
  const cams = (data.cameras || []).filter((c) => c.x != null);
  const pick = (i) => cams[i % Math.max(cams.length, 1)] || (data.cameras || [])[0];
  const samples = [
    {
      id: "AI-20261108-201",
      type: "劳保服缺失",
      typeCode: "PPE",
      algo: "ppe-v1.4",
      level: 3,
      confidence: 83,
      camera: pick(2),
      note: "作业区未穿戴劳保服，先告警后复核",
      fusionNote: ""
    },
    {
      id: "AI-20261108-202",
      type: "烟雾",
      typeCode: "SMOKE",
      algo: "smoke-v2.0",
      level: 2,
      confidence: 76,
      camera: pick(4),
      note: "槽区烟雾，与明火结果做空间匹配",
      fusionNote: "同落点 120s 内与明火识别合并上屏"
    }
  ];
  const events = data.events || (data.events = []);
  samples.forEach((row) => {
    if (events.some((ev) => ev.id === row.id)) return;
    const cam = row.camera;
    if (!cam) return;
    events.unshift({
      id: row.id,
      type: row.type,
      typeCode: row.typeCode,
      level: row.level,
      status: "待复核",
      confidence: row.confidence,
      time: "16:20",
      camera: cam.id,
      place: cam.area || cam.name,
      plant: plantName(cam.plant),
      x: cam.x,
      y: cam.y,
      precision: "摄像头点位",
      algo: row.algo,
      timeout: false,
      alertId: "",
      reason: "",
      note: row.note,
      fusionNote: row.fusionNote,
      source: "视频AI",
      sourceEventId: row.id,
      entryPath: "先告警后复核",
      zoneId: cam.zone || "",
      coordPrecision: "摄像头点位",
      subjectKind: "未知",
      person: "",
      ruleId: row.typeCode === "PPE" ? "R-PPE" : "R-SM",
      deviceId: cam.id,
      summary: row.note,
      payload: { algo: row.algo, confidence: row.confidence, camera_id: cam.id }
    });
  });
}

function ensureAiCatalog() {
  if (!Array.isArray(data.aiAlgos) || !data.aiAlgos.length) {
    data.aiAlgos = DEFAULT_AI_ALGOS.map((row) => ({ ...row }));
  } else {
    DEFAULT_AI_ALGOS.forEach((seed) => {
      if (!data.aiAlgos.some((row) => row.id === seed.id)) data.aiAlgos.push({ ...seed });
    });
  }
  migrateAiTypeNames();
  ensureAiEventType({
    id: "et-ppe",
    code: "PPE",
    name: "劳保服缺失",
    level: 3,
    source: "视频AI",
    strategy: "先告警后复核",
    sla: "30分钟",
    enabled: true,
    desc: "作业区未穿戴劳保服。",
    ruleId: "R-PPE"
  });
  ensureAiEventType({
    id: "et-smoke",
    code: "SMOKE",
    name: "烟雾",
    level: 2,
    source: "视频AI",
    strategy: "先告警后复核",
    sla: "15分钟",
    enabled: true,
    desc: "烟雾识别，可与明火融合上屏。",
    ruleId: "R-SM"
  });
  ensureAiEventType({
    id: "et-rpt",
    code: "FIELD",
    name: "现场隐患",
    level: 3,
    source: "人工上报",
    strategy: "直接进正式告警",
    sla: "30分钟",
    enabled: true,
    desc: "现场人员上报隐患，直接进正式告警。",
    ruleId: "R-RPT"
  });
  ensureAiRule({
    id: "R-PPE",
    name: "作业区必须穿戴劳保服",
    type: "劳保服缺失",
    sla: "30分钟",
    level: 3
  });
  ensureAiRule({
    id: "R-SM",
    name: "烟雾识别",
    type: "烟雾",
    sla: "15分钟",
    level: 2
  });
  ensureAiRule({
    id: "R-RPT",
    name: "现场隐患上报",
    type: "现场隐患",
    sla: "30分钟",
    level: 3,
    notify: "待办 + 短信"
  });
  ensureAiSysParams();
  (data.cameras || []).forEach((cam) => {
    if (!Array.isArray(cam.aiBindings)) cam.aiBindings = seedAiBindingsForCam(cam);
  });
  ensureAiDemoEvents();
}

function zoneNameByCamId(zoneId) {
  if (!zoneId) return "—";
  const z = (data.zones || []).find((row) => row.id === zoneId);
  return z?.mapLabel || z?.name || zoneId;
}

function cameraAiViewRows(cam) {
  const rows = cameraAiBindings(cam);
  if (!rows.length) return [["绑定算法", "未绑定"]];
  return rows.map((row) => {
    const algo = aiAlgoById(row.algoId);
    const name = algo ? algo.name : row.algoId;
    const on = row.enabled !== false && algo?.enabled !== false;
    const st = `<span class="capsule capsule-${on ? "ok" : "warn"}">${on ? "启用" : "停用"}</span>`;
    return [name, `${st}　${row.confidence ?? algo?.confidence ?? "—"}%　${row.roi || "全画面"}　间隔 ${row.interval ?? algo?.interval ?? "—"}s`];
  });
}

function cameraModalSection(title, rows) {
  return `
    <section class="camera-modal-section-block">
      <h4 class="camera-modal-section-title">${title}</h4>
      ${sceneProfileHtml(rows)}
    </section>
  `;
}

function cameraViewDialogHtml(cam) {
  const coord = cam.x != null && cam.y != null
    ? `<span class="mono">${cam.x}, ${cam.y}</span>`
    : "—";
  const onlineCap = `<span class="capsule capsule-${cam.online ? "ok" : "warn"}">${cam.online ? "在线" : "离线"}</span>`;
  const calibCap = `<span class="dot ${calibTone(cam.calib)}">${cam.calib || "未标定"}</span>`;
  const syncCap = `<span class="dot ${cam.sync === "待并表" ? "warn" : "ok"}">${cam.sync || "已对齐"}</span>`;
  return `
    <div class="camera-modal-view">
      ${cameraModalSection("通道与接入", [
        ["通道编码", cam.code || cam.id],
        ["名称", cam.name],
        ["IP", cam.ip || "—"],
        ["NVR 通道", cam.nvrChannel ?? "—"],
        ["设备类型", cam.form || "—"],
        ["协议 / 编码", [cam.protocol, cam.codec].filter(Boolean).join(" · ") || "—"],
        ["在线状态", onlineCap]
      ])}
      ${cameraModalSection("位置与归属", [
        ["分厂", plantName(cam.plant)],
        ["监控分区", cam.area || "—"],
        ["关联区域", zoneNameByCamId(cam.zone)],
        ["地图坐标", coord]
      ])}
      ${cameraModalSection("标定与姿态", [
        ["标定状态", calibCap],
        ["台账同步", syncCap],
        ["方位 / 俯仰", `${cam.heading ?? "—"}° / ${cam.pitch ?? "—"}°`],
        ["视场角", cam.fov != null ? `${cam.fov}°` : "—"],
        ["维护备注", cam.maintNote || "—"]
      ])}
      ${cameraModalSection("识别算法", cameraAiViewRows(cam))}
      <div class="camera-modal-foot-links">
        ${cam.x != null ? `<a class="btn" href="#/t1/overview?id=${encodeURIComponent(cam.id)}">在地图查看</a>` : ""}
        <a class="btn" href="${cameraCalibOverviewHref(cam.id)}">去场景标定</a>
      </div>
    </div>
  `;
}

function cameraFormFields(cam) {
  const plants = (data.plants || []).filter((p) => p.id !== "all");
  const areas = data.cameraAreas || [...new Set((data.cameras || []).map((c) => c.area).filter(Boolean))].sort();
  const zones = (data.zones || []).map((z) => ({ id: z.id, label: z.mapLabel || z.name }));
  const fld = (label, inner, full = false) => (
    `<label class="camera-modal-field${full ? " span-2" : ""}"><span class="camera-modal-label">${label}</span>${inner}</label>`
  );
  return `
    <div class="form-fields camera-modal-form">
      <h4 class="camera-modal-section-title span-2">通道与接入</h4>
      ${fld("通道编码", `<input class="field" name="code" value="${(cam.code || "").replace(/"/g, "&quot;")}">`)}
      ${fld("名称", `<input class="field" name="name" value="${(cam.name || "").replace(/"/g, "&quot;")}">`)}
      ${fld("IP", `<input class="field" name="ip" value="${(cam.ip || "").replace(/"/g, "&quot;")}">`)}
      ${fld("NVR 通道", `<input class="field" name="nvrChannel" type="number" value="${cam.nvrChannel ?? ""}">`)}
      ${fld("设备类型", `<select class="field" name="form">
        ${CAM_FORMS.map((v) => `<option${v === cam.form ? " selected" : ""}>${v}</option>`).join("")}
      </select>`)}
      ${fld("协议", `<select class="field" name="protocol">
        ${CAM_PROTOCOLS.map((v) => `<option${v === cam.protocol ? " selected" : ""}>${v}</option>`).join("")}
      </select>`)}
      ${fld("编码格式", `<select class="field" name="codec">
        ${CAM_CODECS.map((v) => `<option${v === cam.codec ? " selected" : ""}>${v}</option>`).join("")}
      </select>`)}
      ${fld("在线状态", `<select class="field" name="online">
        <option value="1"${cam.online ? " selected" : ""}>在线</option>
        <option value="0"${!cam.online ? " selected" : ""}>离线</option>
      </select>`, true)}
      <h4 class="camera-modal-section-title span-2">位置与归属</h4>
      ${fld("分厂", `<select class="field" name="plant">
        ${plants.map((p) => `<option value="${p.id}"${p.id === cam.plant ? " selected" : ""}>${p.name}</option>`).join("")}
      </select>`)}
      ${fld("监控分区", `<select class="field" name="area">
        ${areas.map((a) => `<option${a === cam.area ? " selected" : ""}>${a}</option>`).join("")}
      </select>`)}
      ${fld("关联区域", `<select class="field" name="zone">
        <option value="">—</option>
        ${zones.map((z) => `<option value="${z.id}"${z.id === cam.zone ? " selected" : ""}>${z.label}</option>`).join("")}
      </select>`, true)}
      <h4 class="camera-modal-section-title span-2">标定与姿态</h4>
      ${fld("标定", `<select class="field" name="calib">
        ${CAM_CALIB_STATES.map((v) => `<option${v === (cam.calib || "未标定") ? " selected" : ""}>${v}</option>`).join("")}
      </select>`)}
      ${fld("台账同步", `<select class="field" name="sync">
        ${CAM_SYNC_STATES.map((v) => `<option${v === (cam.sync || "已对齐") ? " selected" : ""}>${v}</option>`).join("")}
      </select>`)}
      ${fld("朝向（°）", `<input class="field" name="heading" type="number" value="${cam.heading ?? ""}">`)}
      ${fld("俯仰（°）", `<input class="field" name="pitch" type="number" value="${cam.pitch ?? ""}">`)}
      ${fld("视场角（°）", `<input class="field" name="fov" type="number" value="${cam.fov ?? ""}">`)}
      ${fld("维护备注", `<input class="field" name="maintNote" value="${(cam.maintNote || "").replace(/"/g, "&quot;")}">`, true)}
    </div>
  `;
}

function readCameraFromDialog(dlg) {
  return {
    code: dlg.querySelector('[name="code"]')?.value.trim() || "",
    name: dlg.querySelector('[name="name"]')?.value.trim() || "",
    ip: dlg.querySelector('[name="ip"]')?.value.trim() || "",
    nvrChannel: Number(dlg.querySelector('[name="nvrChannel"]')?.value) || "",
    form: dlg.querySelector('[name="form"]')?.value || CAM_FORMS[0],
    plant: dlg.querySelector('[name="plant"]')?.value || (data.plants || []).find((p) => p.id !== "all")?.id || "",
    area: dlg.querySelector('[name="area"]')?.value || "",
    zone: dlg.querySelector('[name="zone"]')?.value || "",
    protocol: dlg.querySelector('[name="protocol"]')?.value || "RTSP",
    codec: dlg.querySelector('[name="codec"]')?.value || "H.265",
    online: dlg.querySelector('[name="online"]')?.value === "1",
    calib: dlg.querySelector('[name="calib"]')?.value || "未标定",
    sync: dlg.querySelector('[name="sync"]')?.value || "已对齐",
    heading: Number(dlg.querySelector('[name="heading"]')?.value) || 0,
    pitch: Number(dlg.querySelector('[name="pitch"]')?.value) || 0,
    fov: Number(dlg.querySelector('[name="fov"]')?.value) || 0,
    maintNote: dlg.querySelector('[name="maintNote"]')?.value.trim() || ""
  };
}

function cameraAlgoDialogHtml(cam) {
  const bound = Object.fromEntries(cameraAiBindings(cam).map((row) => [row.algoId, row]));
  return `
    <p class="meta">本通道可绑定多种识别算法，按需启停；告警等级与复核策略沿用算法模型默认。</p>
    <div class="cam-algo-list">
      ${aiAlgos().map((algo) => {
        const row = bound[algo.id];
        const on = !!row;
        const enabled = on ? row.enabled !== false : true;
        const conf = on ? (row.confidence ?? algo.confidence) : algo.confidence;
        const roi = on ? (row.roi || algo.roi) : algo.roi;
        const interval = on ? (row.interval ?? algo.interval) : algo.interval;
        const locked = algo.enabled === false;
        return `
          <div class="cam-algo-card${on ? " is-on" : ""}${locked ? " is-locked" : ""}">
            <div class="cam-algo-card-head">
              <input type="checkbox" name="algo-bind" value="${algo.id}"${on ? " checked" : ""}${!on && locked ? " disabled" : ""}>
              <div>
                <strong>${algo.name}</strong>
                <p class="meta">${algo.code} · ${algo.category}${locked ? " · 模型已停用" : ""}</p>
              </div>
            </div>
            <div class="cam-algo-card-fields" data-algo-fields="${algo.id}">
              <label>启用
                <select class="field" name="en-${algo.id}"${!on || locked ? " disabled" : ""}>
                  <option value="1"${enabled ? " selected" : ""}>启用</option>
                  <option value="0"${!enabled ? " selected" : ""}>停用</option>
                </select>
              </label>
              <label>置信度
                <input class="field" name="conf-${algo.id}" type="number" min="1" max="99" value="${conf}"${!on || locked ? " disabled" : ""}>
              </label>
              <label>检测区域
                <select class="field" name="roi-${algo.id}"${!on || locked ? " disabled" : ""}>
                  ${AI_ROI_OPTS.map((opt) => `<option${opt === roi ? " selected" : ""}>${opt}</option>`).join("")}
                </select>
              </label>
              <label>告警间隔（秒）
                <input class="field" name="int-${algo.id}" type="number" min="5" max="600" value="${interval}"${!on || locked ? " disabled" : ""}>
              </label>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function readCameraAlgoBindings(dlg) {
  return aiAlgos().map((algo) => {
    const box = dlg.querySelector(`[name="algo-bind"][value="${algo.id}"]`);
    if (!box?.checked) return null;
    return {
      algoId: algo.id,
      enabled: dlg.querySelector(`[name="en-${algo.id}"]`)?.value !== "0",
      confidence: Number(dlg.querySelector(`[name="conf-${algo.id}"]`)?.value) || algo.confidence,
      roi: dlg.querySelector(`[name="roi-${algo.id}"]`)?.value || algo.roi,
      interval: Number(dlg.querySelector(`[name="int-${algo.id}"]`)?.value) || algo.interval
    };
  }).filter(Boolean);
}

function bindCameraAlgoDialog(dlg) {
  dlg.querySelector(".modal")?.classList.add("algo-modal");
  const sync = () => {
    dlg.querySelectorAll("[name=algo-bind]").forEach((box) => {
      const card = box.closest(".cam-algo-card");
      card?.classList.toggle("is-on", box.checked);
      const locked = card?.classList.contains("is-locked");
      card?.querySelectorAll("select, input[type=number]").forEach((el) => {
        el.disabled = !box.checked || locked;
      });
    });
  };
  dlg.querySelectorAll("[name=algo-bind]").forEach((box) => {
    box.addEventListener("change", sync);
  });
  sync();
}

function cameraEditDialogHtml(cam) {
  return `
    <div class="camera-edit-modal">
      <div class="alert-panel-switch camera-edit-tabs">
        <button type="button" class="btn btn-sm is-on" data-cam-edit-tab="base">基本信息</button>
        <button type="button" class="btn btn-sm" data-cam-edit-tab="algo">识别算法</button>
      </div>
      <div class="camera-edit-pane" data-cam-edit-pane="base">${cameraFormFields(cam)}</div>
      <div class="camera-edit-pane" data-cam-edit-pane="algo" hidden>${cameraAlgoDialogHtml(cam)}</div>
    </div>
  `;
}

function bindCameraEditDialog(dlg) {
  dlg.querySelector(".modal")?.classList.add("algo-modal");
  bindCameraAlgoDialog(dlg);
  dlg.querySelectorAll("[data-cam-edit-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.camEditTab;
      dlg.querySelectorAll("[data-cam-edit-tab]").forEach((b) => b.classList.toggle("is-on", b.dataset.camEditTab === id));
      dlg.querySelectorAll("[data-cam-edit-pane]").forEach((pane) => {
        pane.hidden = pane.dataset.camEditPane !== id;
      });
    });
  });
}

function aiAlgoCatalogHtml() {
  return `
    <p class="meta">内置 5 类智能识别。全局停用后各通道不可再启用该模型；通道仍可覆盖置信度、检测区域与告警间隔。</p>
    <div class="cam-algo-list">
      ${aiAlgos().map((algo) => `
        <div class="cam-algo-card is-on">
          <div class="cam-algo-card-head">
            <div>
              <strong>${algo.name}</strong>
              <p class="meta">${algo.code} · ${algo.category} · ${algo.strategy}</p>
            </div>
          </div>
          <p class="meta cam-algo-desc">${algo.desc}</p>
          <div class="cam-algo-card-fields">
            <label>模型
              <select class="field" name="cat-en-${algo.id}">
                <option value="1"${algo.enabled !== false ? " selected" : ""}>启用</option>
                <option value="0"${algo.enabled === false ? " selected" : ""}>停用</option>
              </select>
            </label>
            <label>默认置信度
              <input class="field" name="cat-conf-${algo.id}" type="number" min="1" max="99" value="${algo.confidence}">
            </label>
            <label>默认检测区域
              <select class="field" name="cat-roi-${algo.id}">
                ${AI_ROI_OPTS.map((opt) => `<option${opt === algo.roi ? " selected" : ""}>${opt}</option>`).join("")}
              </select>
            </label>
            <label>默认间隔（秒）
              <input class="field" name="cat-int-${algo.id}" type="number" min="5" max="600" value="${algo.interval}">
            </label>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function openAiAlgoCatalogDialog(after) {
  openAlertDialog("算法模型", aiAlgoCatalogHtml(), (dlg) => {
    aiAlgos().forEach((algo) => {
      algo.enabled = dlg.querySelector(`[name="cat-en-${algo.id}"]`)?.value !== "0";
      algo.confidence = Number(dlg.querySelector(`[name="cat-conf-${algo.id}"]`)?.value) || algo.confidence;
      algo.roi = dlg.querySelector(`[name="cat-roi-${algo.id}"]`)?.value || algo.roi;
      algo.interval = Number(dlg.querySelector(`[name="cat-int-${algo.id}"]`)?.value) || algo.interval;
    });
    persist();
    after();
    return true;
  }, "确认", true, (dlg) => dlg.querySelector(".modal")?.classList.add("algo-modal"));
}

function openCameraView(cam) {
  openAlertDialog(`查看 · ${cam.name}`, cameraViewDialogHtml(cam), () => true, "关闭", true);
}

function openCameraEdit(cam, after) {
  openAlertDialog(`编辑 · ${cam.name}`, cameraEditDialogHtml(cam), (dlg, err) => {
    const patch = readCameraFromDialog(dlg);
    if (!patch.code || !patch.name) {
      if (err) {
        err.hidden = false;
        err.textContent = "请填写通道编码与名称。";
      }
      return false;
    }
    Object.assign(cam, patch, {
      streamConfigured: true,
      aiBindings: readCameraAlgoBindings(dlg)
    });
    persist();
    after();
    return true;
  }, "保存", true, bindCameraEditDialog);
}

function openCameraCreate(after) {
  const plants = (data.plants || []).filter((p) => p.id !== "all");
  const draft = {
    code: "CH-NEW",
    name: "新摄像头",
    ip: "",
    nvrChannel: "",
    form: "枪机",
    plant: plants[0]?.id || "hydro",
    area: (data.cameraAreas || [])[0] || "未分区",
    zone: "",
    protocol: "RTSP",
    codec: "H.265",
    online: true,
    calib: "未标定",
    sync: "已对齐",
    heading: 0,
    pitch: 0,
    fov: 68,
    streamConfigured: false
  };
  openAlertDialog("新增摄像头", cameraFormFields(draft), (dlg, err) => {
    const patch = readCameraFromDialog(dlg);
    if (!patch.code || !patch.name) {
      if (err) {
        err.hidden = false;
        err.textContent = "请填写通道编码与名称。";
      }
      return false;
    }
    const id = `cam-${Date.now()}`;
    data.cameras.push({ id, ...patch, streamConfigured: true, aiBindings: [] });
    persist();
    after(id);
    return true;
  }, "保存", true);
}

function confirmCameraDelete(cam, after) {
  openAlertDialog("删除摄像头", `
    <p>确认删除 <strong>${cam.name}</strong>（${cam.code}）？演示数据将从当前列表移除。</p>
  `, () => {
    data.cameras = data.cameras.filter((row) => row.id !== cam.id);
    persist();
    after();
    return true;
  }, "删除");
}

function listPagerPageNums(current, total) {
  if (total <= 1) return [1];
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) {
    if (total <= 4) return Array.from({ length: total }, (_, i) => i + 1);
    return [1, 2, 3, "ellipsis", total];
  }
  if (current >= total - 2) return [1, "ellipsis", total - 2, total - 1, total];
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

function listPagerHtml(page, totalPages, totalRows) {
  const nums = listPagerPageNums(page, totalPages);
  const items = [];
  nums.forEach((n) => {
    if (n === "ellipsis") {
      items.push(
        `<li class="ant-pagination-item ant-pagination-item-ellipsis" aria-hidden="true"><span class="ant-pagination-item-ellipsis">•••</span></li>`
      );
      return;
    }
    items.push(
      `<li class="ant-pagination-item${n === page ? " ant-pagination-item-active" : ""}" title="${n}">
        <button type="button" class="ant-pagination-item-link" data-page-num="${n}">${n}</button>
      </li>`
    );
  });
  const prevDis = page <= 1;
  const nextDis = page >= totalPages;
  return `
    <div class="ant-pagination-wrap">
      <span class="ant-pagination-total-text">共 ${totalRows} 条</span>
      <ul class="ant-pagination" role="navigation" aria-label="分页">
        <li class="ant-pagination-prev${prevDis ? " ant-pagination-disabled" : ""}">
          <button type="button" class="ant-pagination-item-link" data-page="prev"${prevDis ? " disabled" : ""} aria-label="上一页">
            <span class="ant-pagination-item-link-icon" aria-hidden="true">‹</span>
          </button>
        </li>
        ${items.join("")}
        <li class="ant-pagination-next${nextDis ? " ant-pagination-disabled" : ""}">
          <button type="button" class="ant-pagination-item-link" data-page="next"${nextDis ? " disabled" : ""} aria-label="下一页">
            <span class="ant-pagination-item-link-icon" aria-hidden="true">›</span>
          </button>
        </li>
      </ul>
    </div>
  `;
}

function renderCameraPage(root, focusId) {
  let statusFilter = "全部";
  let plantFilter = "全部";
  let areaFilter = "全部";
  let formFilter = "全部";
  let calibFilter = "全部";
  let draftName = "";
  let draftIp = "";
  let draftChannel = "";
  let qName = "";
  let qIp = "";
  let qChannel = "";
  let page = 1;
  const pageSize = 20;
  const plants = ["全部", ...(data.plants || []).filter((p) => p.id !== "all")];
  const areas = ["全部", ...(data.cameraAreas || [...new Set(data.cameras.map((c) => c.area))].sort())];
  const forms = ["全部", ...CAM_FORMS.filter((f) => data.cameras.some((c) => c.form === f))];

  function rowsOf() {
    return data.cameras.filter((cam) => {
      if (statusFilter === "在线") return cam.online;
      if (statusFilter === "离线") return !cam.online;
      if (statusFilter === "待标定") return cam.calib !== "已标定";
      if (statusFilter === "待并表") return cam.sync === "待并表";
      return true;
    }).filter((cam) => plantFilter === "全部" || cam.plant === plantFilter)
      .filter((cam) => areaFilter === "全部" || cam.area === areaFilter)
      .filter((cam) => formFilter === "全部" || cam.form === formFilter)
      .filter((cam) => calibFilter === "全部" || (cam.calib || "未标定") === calibFilter)
      .filter((cam) => {
        if (qName && !String(cam.name || "").toLowerCase().includes(qName)) return false;
        if (qIp && !String(cam.ip || "").toLowerCase().includes(qIp)) return false;
        if (qChannel) {
          const hay = `${cam.code || ""} ${cam.nvrChannel ?? ""}`.toLowerCase();
          if (!hay.includes(qChannel)) return false;
        }
        return true;
      });
  }

  function applySearch() {
    qName = draftName.trim().toLowerCase();
    qIp = draftIp.trim().toLowerCase();
    qChannel = draftChannel.trim().toLowerCase();
    page = 1;
    paint();
  }

  function resetFilters() {
    statusFilter = "全部";
    plantFilter = "全部";
    areaFilter = "全部";
    formFilter = "全部";
    calibFilter = "全部";
    draftName = "";
    draftIp = "";
    draftChannel = "";
    qName = "";
    qIp = "";
    qChannel = "";
    page = 1;
    paint();
  }

  function paint() {
    const rowsAll = rowsOf();
    const totalPages = Math.max(1, Math.ceil(rowsAll.length / pageSize));
    if (page > totalPages) page = totalPages;
    const start = (page - 1) * pageSize;
    const rows = rowsAll.slice(start, start + pageSize);
    const plantOpts = plants.map((p) => (
      typeof p === "string"
        ? `<option value="${p}"${plantFilter === p ? " selected" : ""}>${p === "全部" ? "全部" : p}</option>`
        : `<option value="${p.id}"${plantFilter === p.id ? " selected" : ""}>${p.name}</option>`
    )).join("");

    root.innerHTML = `
      <div class="camera-toolbar-stack">
        <div class="filter-row alert-toolbar camera-toolbar camera-toolbar-filters">
          <label class="cam-field-label"><span class="cam-field-label-name">状态</span>
            <select class="field cam-filter-sel" id="cam-status-filter">
              ${["全部", "在线", "离线", "待标定", "待并表"].map((name) => (
                `<option value="${name}"${statusFilter === name ? " selected" : ""}>${name === "全部" ? "全部" : name}</option>`
              )).join("")}
            </select>
          </label>
          <label class="cam-field-label"><span class="cam-field-label-name">分厂</span>
            <select class="field cam-filter-sel" id="cam-plant-filter">${plantOpts}</select>
          </label>
          <label class="cam-field-label"><span class="cam-field-label-name">监控分区</span>
            <select class="field cam-filter-sel" id="cam-area-filter">
              ${areas.map((name) => `<option value="${name}"${areaFilter === name ? " selected" : ""}>${name === "全部" ? "全部" : name}</option>`).join("")}
            </select>
          </label>
          <label class="cam-field-label"><span class="cam-field-label-name">设备类型</span>
            <select class="field cam-filter-sel" id="cam-form-filter">
              ${forms.map((name) => `<option value="${name}"${formFilter === name ? " selected" : ""}>${name === "全部" ? "全部" : name}</option>`).join("")}
            </select>
          </label>
          <label class="cam-field-label"><span class="cam-field-label-name">标定</span>
            <select class="field cam-filter-sel" id="cam-calib-filter">
              ${["全部", ...CAM_CALIB_STATES].map((name) => (
                `<option value="${name}"${calibFilter === name ? " selected" : ""}>${name === "全部" ? "全部" : name}</option>`
              )).join("")}
            </select>
          </label>
        </div>
        <div class="filter-row alert-toolbar camera-toolbar camera-toolbar-search">
          <label class="cam-field-label"><span class="cam-field-label-name">名称</span>
            <input type="search" class="field alert-q-field" id="cam-q-name" value="${draftName.replace(/"/g, "&quot;")}" autocomplete="off">
          </label>
          <label class="cam-field-label"><span class="cam-field-label-name">IP</span>
            <input type="search" class="field alert-q-field" id="cam-q-ip" value="${draftIp.replace(/"/g, "&quot;")}" autocomplete="off">
          </label>
          <label class="cam-field-label"><span class="cam-field-label-name">通道</span>
            <input type="search" class="field alert-q-field" id="cam-q-channel" value="${draftChannel.replace(/"/g, "&quot;")}" autocomplete="off">
          </label>
          <div class="camera-toolbar-actions">
            <button type="button" class="btn btn-primary alert-q-submit" data-cam-search>搜索</button>
            <button type="button" class="btn btn-ghost alert-q-reset" data-cam-reset>重置</button>
            <button type="button" class="btn" data-cam-import>导入</button>
            <button type="button" class="btn" data-cam-export>导出</button>
            <button type="button" class="btn" data-cam-algos>算法模型</button>
            <button type="button" class="btn btn-primary" data-cam-add>新增</button>
          </div>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>通道</th>
              <th>名称</th>
              <th>IP</th>
              <th>NVR</th>
              <th>类型</th>
              <th>监控分区</th>
              <th>分厂</th>
              <th>关联区域</th>
              <th>状态</th>
              <th>标定</th>
              <th>编码</th>
              <th>协议</th>
              <th>台账</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length ? rows.map((cam) => `
              <tr class="${cam.id === focusId ? "is-on" : ""}" data-cam="${cam.id}">
                <td class="mono">${cam.code}</td>
                <td>${cam.name}${cam.maintNote ? ` <span class="dot off">${cam.maintNote}</span>` : ""}</td>
                <td class="mono">${cam.ip || "—"}</td>
                <td class="mono">${cam.nvrChannel ?? "—"}</td>
                <td>${cam.form || "—"}</td>
                <td>${cam.area || "—"}</td>
                <td>${plantName(cam.plant)}</td>
                <td>${zoneNameByCamId(cam.zone)}</td>
                <td><span class="dot ${cam.online ? "ok" : "off"}">${cam.online ? "在线" : "离线"}</span></td>
                <td><span class="dot ${calibTone(cam.calib)}">${cam.calib || "未标定"}</span></td>
                <td>${cam.codec || "—"}</td>
                <td>${cam.protocol || "—"}</td>
                <td><span class="dot ${cam.sync === "待并表" ? "warn" : "ok"}">${cam.sync || "已对齐"}</span></td>
                <td>
                  <div class="table-actions">
                    <a class="btn btn-primary" href="${cameraCalibOverviewHref(cam.id)}">标定</a>
                    <button type="button" class="btn" data-cam-view="${cam.id}">查看</button>
                    <button type="button" class="btn" data-cam-edit="${cam.id}">编辑</button>
                    <button type="button" class="btn" data-cam-del="${cam.id}">删除</button>
                  </div>
                </td>
              </tr>
            `).join("") : `<tr><td colspan="14" class="empty">没有符合条件的摄像头。</td></tr>`}
          </tbody>
        </table>
      </div>
      ${listPagerHtml(page, totalPages, rowsAll.length)}
    `;
    const bindSelect = (id, assign) => {
      root.querySelector(id)?.addEventListener("change", (e) => {
        assign(e.target.value);
        page = 1;
        paint();
      });
    };
    bindSelect("#cam-status-filter", (v) => { statusFilter = v; });
    bindSelect("#cam-plant-filter", (v) => { plantFilter = v; });
    bindSelect("#cam-area-filter", (v) => { areaFilter = v; });
    bindSelect("#cam-form-filter", (v) => { formFilter = v; });
    bindSelect("#cam-calib-filter", (v) => { calibFilter = v; });
    root.querySelector("#cam-q-name")?.addEventListener("input", (e) => { draftName = e.target.value; });
    root.querySelector("#cam-q-ip")?.addEventListener("input", (e) => { draftIp = e.target.value; });
    root.querySelector("#cam-q-channel")?.addEventListener("input", (e) => { draftChannel = e.target.value; });
    root.querySelectorAll("#cam-q-name, #cam-q-ip, #cam-q-channel").forEach((el) => {
      el.addEventListener("keydown", (event) => {
        if (event.key === "Enter") applySearch();
      });
    });
    root.querySelector("[data-cam-search]")?.addEventListener("click", applySearch);
    root.querySelector("[data-cam-reset]")?.addEventListener("click", resetFilters);
    root.querySelector("[data-cam-import]")?.addEventListener("click", () => {
      openAlertDialog("批量导入", `
        <p class="meta">按模板导入通道：通道编码、名称、IP、NVR 通道、设备类型、监控分区、分厂、协议、编码格式。</p>
        <p class="meta">原型不解析文件，确认后提示对接视频平台批量同步。</p>
      `, () => true, "导入");
    });
    root.querySelector("[data-cam-export]")?.addEventListener("click", () => {
      openAlertDialog("导出", `<p class="meta">导出当前筛选结果 ${rowsAll.length} 条（CSV / Excel 模板）。</p>`, () => true, "导出");
    });
    root.querySelector("[data-cam-add]")?.addEventListener("click", () => {
      openCameraCreate((id) => {
        go("t7", "cameras", `id=${encodeURIComponent(id)}`);
      });
    });
    root.querySelector("[data-cam-algos]")?.addEventListener("click", () => {
      openAiAlgoCatalogDialog(paint);
    });
    root.querySelectorAll("[data-cam-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cam = data.cameras.find((item) => item.id === btn.dataset.camView);
        if (cam) openCameraView(cam);
      });
    });
    root.querySelectorAll("[data-cam-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cam = data.cameras.find((item) => item.id === btn.dataset.camEdit);
        if (cam) openCameraEdit(cam, paint);
      });
    });
    root.querySelectorAll("[data-cam-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cam = data.cameras.find((item) => item.id === btn.dataset.camDel);
        if (cam) confirmCameraDelete(cam, paint);
      });
    });
    root.querySelector("[data-page=prev]")?.addEventListener("click", () => { if (page > 1) { page -= 1; paint(); } });
    root.querySelector("[data-page=next]")?.addEventListener("click", () => { if (page < totalPages) { page += 1; paint(); } });
    root.querySelectorAll("[data-page-num]").forEach((btn) => {
      btn.addEventListener("click", () => {
        page = Number(btn.dataset.pageNum) || 1;
        paint();
      });
    });
    if (focusId) root.querySelector(`tr[data-cam="${focusId}"]`)?.scrollIntoView({ block: "nearest" });
  }
  paint();
}

const RISK_LVL = { "重大": 1, "高": 2, "较高": 3, "中": 4, "低": 5 };
const RULE_STATUSES = ["启用", "停用"];
const ALERT_EVENT_SOURCES = ["视频AI", "人工上报"];
const STRATEGIES = ["直接进正式告警", "先告警后复核", "真警才进正式告警"];
const NOTIFY_WAYS = ["待办", "待办 + 短信", "待办 + 电话"];
const FENCE_KINDS = ["电子围栏", "风险区"];
const RISK_NAMES = ["重大", "高", "较高", "中", "低"];

function formVal(root, name) {
  return root.querySelector(`[name="${name}"]`)?.value.trim() || "";
}

function formChecks(root, name) {
  return [...root.querySelectorAll(`[name="${name}"]:checked`)].map((item) => item.value);
}

function bumpVersion(version) {
  const match = String(version || "v0.0").match(/v(\d+)\.(\d+)/);
  if (!match) return "v1.0";
  return `v${match[1]}.${Number(match[2]) + 1}`;
}

function statusTone(status) {
  if (status === "启用") return "ok";
  if (status === "停用") return "off";
  return "warn";
}

function isLocEventType(et) {
  return et?.source === "定位";
}

function eventTypeForRule(rule) {
  if (!rule) return null;
  const byId = (data.eventTypes || []).find((row) => row.ruleId === rule.id);
  if (byId) return byId;
  return eventTypeByName(rule.type);
}

function locRulesForZone(zoneId) {
  return (data.rules || []).filter((rule) => {
    if (rule.zone !== zoneId) return false;
    const et = eventTypeForRule(rule);
    return et && isLocEventType(et);
  });
}

function ensureZoneFenceAlert(zone) {
  if (zone.fenceAlert && typeof zone.fenceAlert === "object") return zone.fenceAlert;
  const locRule = locRulesForZone(zone.id)[0];
  const riskLevel = RISK_LVL[zone.risk] || 3;
  zone.fenceAlert = {
    status: locRule?.status === "启用" ? "启用" : "停用",
    eventType: locRule?.type || "非法闯入",
    name: locRule?.name || `${zone.name}围栏告警`,
    stay: locRule?.stay ?? 60,
    window: locRule?.window ?? 300,
    recover: locRule?.recover ?? 60,
    level: locRule?.level ?? riskLevel,
    sla: locRule?.sla || "30分钟",
    org: locRule?.org || (data.orgs || [])[0] || "",
    role: locRule?.role || "",
    notify: locRule?.notify || NOTIFY_WAYS[0],
    shift: locRule?.shift || zone.hours || "",
    note: locRule?.note || ""
  };
  return zone.fenceAlert;
}

function migrateSysRoleMenus() {
  (data.sysRoles || []).forEach((role) => {
    role.menus = (role.menus || []).map((name) => (name === "三维实景" ? "安全综合监控" : name));
  });
}

function migrateRuleZoneIds() {
  (data.rules || []).forEach((rule) => {
    if (!Array.isArray(rule.zoneIds) || !rule.zoneIds.length) {
      rule.zoneIds = rule.zone ? [rule.zone] : [];
    }
  });
}

function migrateZoneFenceAlerts() {
  (data.zones || []).forEach(ensureZoneFenceAlert);
}

function defaultAdmissionRange() {
  const y = new Date().getFullYear();
  return { startDate: `${y}-01-01`, endDate: `${y}-12-31` };
}

function normalizeAdmissionRow(row, zone) {
  const range = defaultAdmissionRange();
  const next = {
    person: row?.person || "",
    hours: row?.hours || zone?.hours || "全天",
    permit: !!row?.permit,
    startDate: row?.startDate || range.startDate,
    endDate: row?.endDate || range.endDate
  };
  return next;
}

function ensureZoneAdmissions(zone) {
  if (Array.isArray(zone.admissions) && zone.admissions.length) {
    zone.admissions = zone.admissions.map((row) => normalizeAdmissionRow(row, zone));
    return zone.admissions;
  }
  const rows = [];
  const jobs = zone.jobs || [];
  const wl = parseWhitelistLines(zone.whitelist).filter(Boolean);
  const people = [...new Set([...jobs, ...wl])];
  if (people.length) {
    people.forEach((person) => {
      rows.push(normalizeAdmissionRow({
        person,
        hours: zone.hours || "全天",
        permit: !!zone.permit
      }, zone));
    });
  }
  zone.admissions = rows;
  return zone.admissions;
}

function migrateZoneAdmissions() {
  (data.zones || []).forEach(ensureZoneAdmissions);
}

function syncZoneLegacyFromAdmissions(zone) {
  const rows = (zone.admissions || []).filter((r) => r.person);
  const jobsCatalog = data.jobs || [];
  zone.jobs = rows.map((r) => r.person).filter((p) => jobsCatalog.includes(p));
  const nonJobs = rows.map((r) => r.person).filter((p) => !jobsCatalog.includes(p));
  zone.whitelist = nonJobs.join("、");
  zone.hours = rows[0]?.hours || zone.hours || "全天";
  zone.permit = rows.some((r) => r.permit);
}

function admissionDateText(row) {
  if (row.startDate && row.endDate) return `${row.startDate} ~ ${row.endDate}`;
  return row.startDate || row.endDate || "—";
}

function admissionStatus(row) {
  const today = new Date().toISOString().slice(0, 10);
  if (row.endDate && row.endDate < today) return "已过期";
  if (row.startDate && row.startDate > today) return "未生效";
  return "有效";
}

function admissionStatusTone(status) {
  if (status === "有效") return "ok";
  if (status === "未生效") return "warn";
  return "off";
}

function readAdmissionFromDialog(dlg, zone) {
  return normalizeAdmissionRow({
    person: dlg.querySelector("#adm-person")?.value.trim() || "",
    hours: dlg.querySelector("#adm-hours")?.value.trim() || "",
    permit: dlg.querySelector("#adm-permit")?.checked || false,
    startDate: dlg.querySelector("#adm-start")?.value || "",
    endDate: dlg.querySelector("#adm-end")?.value || ""
  }, zone);
}

function admissionDialogFields(row) {
  const jobHints = (data.jobs || []).map((j) => `<option value="${j}">`).join("");
  return `
    <div class="admission-modal-form form-fields">
      <label class="span-2">岗位或人员
        <input id="adm-person" class="field" value="${(row.person || "").replace(/"/g, "&quot;")}" placeholder="岗位或人员" list="adm-job-hints" autocomplete="off">
      </label>
      <datalist id="adm-job-hints">${jobHints}</datalist>
      <label class="span-2">有效时段
        <input id="adm-hours" class="field" value="${(row.hours || "").replace(/"/g, "&quot;")}" placeholder="如 08:00–20:00 或 全天">
      </label>
      <label>开始日期
        <input type="date" id="adm-start" class="field" value="${row.startDate || ""}">
      </label>
      <label>结束日期
        <input type="date" id="adm-end" class="field" value="${row.endDate || ""}">
      </label>
      <div class="span-2 admission-modal-permit">
        <span class="admission-modal-permit-label">作业票</span>
        <label class="switch-row">
          <label class="switch">
            <input type="checkbox" id="adm-permit"${row.permit ? " checked" : ""}>
            <span class="switch-ui"></span>
          </label>
          <span>进入须持有效作业票</span>
        </label>
      </div>
    </div>
  `;
}

function openAdmissionDialog(zone, idx, after) {
  const isNew = idx == null;
  const rows = ensureZoneAdmissions(zone);
  const draft = isNew ? normalizeAdmissionRow({ hours: zone.hours || "全天" }, zone) : rows[idx];
  const title = isNew ? "新增准入" : "编辑准入";
  openAlertDialog(title, admissionDialogFields(draft), (dlg, err) => {
    const next = readAdmissionFromDialog(dlg, zone);
    if (!next.person) {
      if (err) {
        err.hidden = false;
        err.textContent = "请填写岗位或人员";
      }
      return false;
    }
    if (next.startDate && next.endDate && next.endDate < next.startDate) {
      if (err) {
        err.hidden = false;
        err.textContent = "结束日期不能早于开始日期";
      }
      return false;
    }
    if (isNew) rows.push(next);
    else rows[idx] = next;
    syncZoneLegacyFromAdmissions(zone);
    after();
    return true;
  }, "确定", true, (dlg) => {
    dlg.querySelector("#adm-person")?.focus();
  });
}

function persistZoneFence(root, zone) {
  if (!root.querySelector("[name=fence]")) return;
  zone.fence = formVal(root, "fence");
  zone.risk = formVal(root, "risk");
  const ver = zone.version || "v1";
  zone.version = bumpVersion(ver.includes(".") ? ver : `${ver}.0`);
  readZoneFenceAlert(root, zone);
  syncFenceAlertToRules(zone);
}

function readZoneFenceAlert(root, zone) {
  const fa = ensureZoneFenceAlert(zone);
  const st = formVal(root, "za-status");
  fa.status = RULE_STATUSES.includes(st) ? st : "停用";
  fa.name = formVal(root, "za-name") || fa.name;
  fa.stay = Number(formVal(root, "za-stay")) || 0;
  fa.window = Number(formVal(root, "za-window")) || 0;
  fa.recover = Number(formVal(root, "za-recover")) || 0;
  fa.level = Number(formVal(root, "za-level")) || fa.level;
  fa.sla = formVal(root, "za-sla");
  fa.org = formVal(root, "za-org");
  fa.role = formVal(root, "za-role");
  fa.notify = formVal(root, "za-notify");
  fa.shift = formVal(root, "za-shift");
  fa.note = formVal(root, "za-note");
}

function syncFenceAlertToRules(zone) {
  const fa = zone.fenceAlert;
  if (!fa) return;
  const rules = locRulesForZone(zone.id);
  if (!rules.length) return;
  rules.forEach((rule) => {
    rule.status = fa.status;
    rule.name = fa.name;
    rule.stay = fa.stay;
    rule.window = fa.window;
    rule.recover = fa.recover;
    rule.level = fa.level;
    rule.sla = fa.sla;
    rule.org = fa.org;
    rule.role = fa.role;
    rule.notify = fa.notify;
    rule.shift = fa.shift;
    rule.note = fa.note;
  });
}

function optionList(values, current) {
  return values.map((value) => `<option${value === current ? " selected" : ""}>${value}</option>`).join("");
}

function eventTypeByName(name) {
  return (data.eventTypes || []).find((row) => row.name === name);
}

function zoneById(id) {
  return (data.zones || []).find((row) => row.id === id);
}

function ruleForEvent(et) {
  if (!et) return null;
  if (et.ruleId) {
    const byId = (data.rules || []).find((r) => r.id === et.ruleId);
    if (byId) return byId;
  }
  return (data.rules || []).find((r) => r.type === et.name);
}

function ensureRuleForEvent(et) {
  let rule = ruleForEvent(et);
  if (rule) {
    if (!et.ruleId) et.ruleId = rule.id;
    return rule;
  }
  const id = `R-${String(et.code || Date.now()).replace(/\W/g, "")}`;
  rule = {
    id,
    name: et.name,
    type: et.name,
    zone: (data.zones || [])[0]?.id || "",
    zoneIds: (data.zones || [])[0]?.id ? [(data.zones || [])[0].id] : [],
    level: et.level,
    status: "停用",
    version: "v0.1",
    stay: 0,
    window: 300,
    recover: 60,
    shift: "",
    dedup: "",
    merge: "",
    suppress: "",
    org: (data.orgs || [])[0] || "",
    role: "",
    notify: NOTIFY_WAYS[0],
    sla: et.sla || "",
    note: "",
    history: []
  };
  data.rules.push(rule);
  et.ruleId = id;
  return rule;
}

function alertEventTypes() {
  return (data.eventTypes || []).filter((et) => !isLocEventType(et));
}

function reportEventTypes() {
  return (data.eventTypes || []).filter((et) => et.source === "人工上报");
}

function resolveEventFocusId(focusId) {
  if (!focusId) return reportEventTypes()[0]?.id;
  if ((data.eventTypes || []).some((e) => e.id === focusId)) return focusId;
  const rule = (data.rules || []).find((r) => r.id === focusId);
  if (rule) {
    const et = (data.eventTypes || []).find((e) => e.ruleId === rule.id || e.name === rule.type);
    return et?.id;
  }
  return focusId;
}

function strategiesForSource(source) {
  if (source === "视频AI") return STRATEGIES;
  return ["直接进正式告警"];
}

function ruleZoneIds(rule) {
  if (!rule) return [];
  if (Array.isArray(rule.zoneIds) && rule.zoneIds.length) return rule.zoneIds;
  if (rule.zone) return [rule.zone];
  return [];
}

function eventWithRuleDetailHtml(et, rule) {
  const picked = new Set(ruleZoneIds(rule));
  const rawStatus = RULE_STATUSES.includes(rule.status) ? rule.status : (rule.status === "启用" ? "启用" : "停用");
  const src = et.source || "视频AI";
  const strategyOpts = strategiesForSource(src);
  if (!strategyOpts.includes(et.strategy)) {
    et.strategy = strategyOpts[0];
  }
  const levelVal = rule.level ?? et.level;
  const strategyField = src === "视频AI" ? `
          <label class="span-2">告警规则
            <select class="field" name="strategy">${optionList(strategyOpts, et.strategy)}</select>
          </label>
  ` : `
          <input type="hidden" name="strategy" value="直接进正式告警">
          <p class="meta span-2">人工上报：固定为直接进正式告警。</p>
  `;
  return `
    <div class="detail-head">
      <div><h2>${et.name}</h2><p class="meta">定位类（人员落点、围栏越界）在「区域与定位告警」配置；视频 AI 在「摄像头管理」按通道绑定算法。</p></div>
      <div class="detail-head-tags">
        <span class="dot ${et.enabled ? "ok" : "off"}">${et.enabled ? "启用" : "停用"}</span>
        <span class="dot ${statusTone(rawStatus)}">${rawStatus}</span>
        <span class="lvl lvl-${levelVal}">${LEVEL_NAME[levelVal]}</span>
      </div>
    </div>
    <div class="white-card">
      <div class="form-fields">
        <label>名称<input class="field" name="ename" value="${et.name}"></label>
        <label>编码<input class="field" name="code" value="${et.code}"></label>
        <label>事件状态
          <select class="field" name="enabled">
            <option${et.enabled ? " selected" : ""}>启用</option>
            <option${!et.enabled ? " selected" : ""}>停用</option>
          </select>
        </label>
      </div>
    </div>
    <div class="white-card">
      <div class="form-fields">
        ${strategyField}
      </div>
      <p class="meta">适用区域（标定/责任区，可多选）</p>
      <div class="check-row is-stack">
        ${(data.zones || []).map((row) => `
          <label><input type="checkbox" name="zone" value="${row.id}"${picked.has(row.id) ? " checked" : ""}>${row.name}</label>
        `).join("")}
      </div>
      <div class="form-fields">
        <label>告警等级
          <select class="field" name="level">
            ${[1, 2, 3, 4].map((n) => `<option value="${n}"${n === levelVal ? " selected" : ""}>${LEVEL_NAME[n]}</option>`).join("")}
          </select>
        </label>
        <label>处置时限<input class="field" name="sla" value="${rule.sla || et.sla || ""}"></label>
        <label>生效班次<input class="field" name="shift" value="${rule.shift || ""}"></label>
        <label>责任组织
          <select class="field" name="org">${optionList(data.orgs || [], rule.org)}</select>
        </label>
        <label>责任岗位<input class="field" name="role" value="${rule.role || ""}"></label>
        <label class="span-2">通知方式
          <select class="field" name="notify">${optionList(NOTIFY_WAYS, rule.notify)}</select>
        </label>
      </div>
    </div>
    <div class="form-foot">
      <button type="button" class="btn btn-primary" data-save>保存</button>
    </div>
  `;
}

function renderAlertRulesConfig(root, focusId) {
  const locEt = (data.eventTypes || []).find((e) => e.id === focusId && isLocEventType(e));
  if (locEt) {
    const r = ruleForEvent(locEt);
    if (r?.zone) {
      go("t7", "zones", `id=${encodeURIComponent(r.zone)}`);
      return;
    }
  }
  const locRule = (data.rules || []).find((r) => r.id === focusId);
  if (locRule) {
    const et = eventTypeForRule(locRule);
    if (et && isLocEventType(et) && locRule.zone) {
      go("t7", "zones", `id=${encodeURIComponent(locRule.zone)}`);
      return;
    }
    if (et?.source === "视频AI") {
      go("t7", "cameras");
      return;
    }
  }
  const videoEt = (data.eventTypes || []).find((e) => e.id === focusId && e.source === "视频AI");
  if (videoEt) {
    go("t7", "cameras");
    return;
  }
  let focus = resolveEventFocusId(focusId);
  let filter = "全部";

  function readForms(et, rule) {
    et.name = formVal(root, "ename") || et.name;
    et.code = formVal(root, "code") || et.code;
    et.strategy = formVal(root, "strategy") || strategiesForSource(et.source || "视频AI")[0];
    et.enabled = formVal(root, "enabled") === "启用";
    rule.status = et.enabled ? "启用" : "停用";
    const sla = formVal(root, "sla");
    const level = Number(formVal(root, "level")) || et.level || rule.level;
    et.level = level;
    et.sla = sla;
    rule.name = et.name;
    rule.type = et.name;
    const zoneIds = formChecks(root, "zone");
    rule.zoneIds = zoneIds;
    rule.zone = zoneIds[0] || "";
    rule.level = level;
    rule.sla = sla;
    rule.org = formVal(root, "org");
    rule.role = formVal(root, "role");
    rule.notify = formVal(root, "notify");
    rule.shift = formVal(root, "shift");
  }

  function paint() {
    const all = reportEventTypes();
    const rows = all.filter((et) => {
      if (filter === "全部") return true;
      const rule = ruleForEvent(et);
      const st = RULE_STATUSES.includes(rule?.status) ? rule.status : (rule?.status === "启用" ? "启用" : "停用");
      return rule && st === filter;
    });
    const et = rows.find((row) => row.id === focus) || all.find((row) => row.id === focus) || rows[0] || all[0];
    focus = et?.id;
    const rule = et ? ensureRuleForEvent(et) : null;
    root.innerHTML = `
      <div class="filter-row tight">
        ${["全部", "启用", "停用"].map((name) => (
          `<button type="button" class="chip${filter === name ? " is-on" : ""}" data-filter="${name}">${name}</button>`
        )).join("")}
      </div>
      <div class="alert-layout">
        <aside class="alert-list-panel">
          ${(rows.length ? rows : all).map((row) => {
            const r = ruleForEvent(row);
            return `
            <button type="button" class="alert-card${row.id === et?.id ? " is-on" : ""}" data-id="${row.id}">
              <div class="row">
                <strong>${row.name}</strong>
                <span class="dot ${statusTone(RULE_STATUSES.includes(r?.status) ? r.status : "停用")}">${RULE_STATUSES.includes(r?.status) ? r.status : "停用"}</span>
              </div>
              <p class="meta">${row.code} · ${row.source}</p>
            </button>`;
          }).join("")}
          <div class="list-foot">
            <button type="button" class="btn" data-add>新增</button>
          </div>
        </aside>
        <section class="alert-detail">
          ${et && rule ? eventWithRuleDetailHtml(et, rule) : ""}
        </section>
      </div>
    `;
    root.querySelectorAll("[data-filter]").forEach((btn) => {
      btn.addEventListener("click", () => { filter = btn.dataset.filter; paint(); });
    });
    root.querySelectorAll("[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => { focus = btn.dataset.id; paint(); });
    });
    root.querySelector("[data-add]")?.addEventListener("click", () => {
      const fresh = {
        id: `et-${Date.now()}`,
        code: "NEW",
        name: "新事件",
        level: 3,
        source: "人工上报",
        strategy: "直接进正式告警",
        sla: "30分钟",
        enabled: false,
        desc: ""
      };
      data.eventTypes.push(fresh);
      ensureRuleForEvent(fresh);
      focus = fresh.id;
      go("t7", "report", `id=${encodeURIComponent(fresh.id)}`);
    });
    root.querySelector("[data-save]")?.addEventListener("click", () => {
      readForms(et, rule);
      paint();
    });
  }
  paint();
}
function renderZoneAccess(root, focusId) {
  let focus = focusId;

  function paint() {
    const rows = data.zones;
    const item = rows.find((row) => row.id === focus) || rows[0];
    focus = item?.id;
    root.innerHTML = `
      <div class="alert-layout">
        <aside class="alert-list-panel">
          ${rows.map((row) => {
            const fa = ensureZoneFenceAlert(row);
            const alertOn = fa.status === "启用";
            return `
            <button type="button" class="alert-card${row.id === item.id ? " is-on" : ""}" data-id="${row.id}">
              <div class="row">
                <strong>${row.name}</strong>
                <span class="lvl lvl-${RISK_LVL[row.risk] || 4}">${row.risk}</span>
              </div>
              <p class="meta">${plantName(row.plant)} · ${row.fence}${alertOn ? " · 定位告警启" : ""}</p>
            </button>`;
          }).join("")}
        </aside>
        <section class="alert-detail">
          ${item ? zoneForm(item) : ""}
        </section>
      </div>
    `;
    root.querySelectorAll("[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        focus = btn.dataset.id;
        paint();
      });
    });
    root.querySelectorAll("[data-zone-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        zoneDetailTab = btn.dataset.zoneTab || "fence";
        paint();
      });
    });
    const refreshAdmission = () => {
      zoneDetailTab = "admission";
      paint();
    };
    root.querySelector("[data-admission-add]")?.addEventListener("click", () => {
      openAdmissionDialog(item, null, refreshAdmission);
    });
    root.querySelectorAll("[data-admission-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openAdmissionDialog(item, Number(btn.dataset.idx), refreshAdmission);
      });
    });
    root.querySelectorAll("[data-admission-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.idx);
        ensureZoneAdmissions(item).splice(idx, 1);
        syncZoneLegacyFromAdmissions(item);
        refreshAdmission();
      });
    });
    const persistFence = () => {
      persistZoneFence(root, item);
    };
    root.querySelectorAll("[data-zone-panel=fence] .field, [data-zone-panel=fence] select, [data-zone-panel=fence] textarea").forEach((el) => {
      el.addEventListener("change", persistFence);
    });
  }
  paint();
}

function parseWhitelistLines(text) {
  const lines = String(text || "")
    .split(/[\n,，、;；]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return lines.length ? lines : [""];
}

function joinWhitelistLines(lines) {
  return lines.map((s) => s.trim()).filter(Boolean).join("、");
}

function zoneAdmissionListHtml(item) {
  const rows = ensureZoneAdmissions(item);
  const body = rows.length
    ? rows.map((row, i) => {
      const st = admissionStatus(row);
      return `
        <tr data-admission-row="${i}">
          <td>${row.person || "—"}</td>
          <td>${row.hours || "—"}</td>
          <td>${admissionDateText(row)}</td>
          <td class="zone-adm-check">
            <label class="switch is-readonly">
              <input type="checkbox" disabled${row.permit ? " checked" : ""}>
              <span class="switch-ui"></span>
            </label>
          </td>
          <td><span class="dot ${admissionStatusTone(st)}">${st}</span></td>
          <td class="zone-adm-actions">
            <button type="button" class="btn btn-sm" data-admission-edit data-idx="${i}">编辑</button>
            <button type="button" class="btn btn-sm btn-ghost" data-admission-del data-idx="${i}">删除</button>
          </td>
        </tr>`;
    }).join("")
    : `<tr><td colspan="6" class="meta">暂无准入条目</td></tr>`;
  return `
    <div class="white-card zone-admission-list">
      <div class="zone-admission-toolbar">
        <h3>准入名单</h3>
        <button type="button" class="btn btn-sm btn-primary" data-admission-add>新增</button>
      </div>
      <table class="zone-admission-grid">
        <thead>
          <tr>
            <th>岗位或人员</th>
            <th>有效时段</th>
            <th>有效期</th>
            <th>作业票</th>
            <th>状态</th>
            <th class="zone-adm-actions">操作</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function zoneFenceAlertBlock(item) {
  const fa = ensureZoneFenceAlert(item);
  const st = RULE_STATUSES.includes(fa.status) ? fa.status : "停用";
  return `
    <div class="white-card zone-fence-alert">
      <h3>定位类告警</h3>
      <p class="meta" style="margin:0 0 10px">人员定位落点与围栏越界统一由此配置，生成「定位」事件；默认一事件升一正式告警，规则显式开启时才合并多源。</p>
      <div class="form-fields">
        <label>告警状态
          <select class="field" name="za-status">
            ${RULE_STATUSES.map((name) => `<option${name === st ? " selected" : ""}>${name}</option>`).join("")}
          </select>
        </label>
        <label>告警名称<input class="field" name="za-name" value="${fa.name || ""}"></label>
        <label>停留时长（秒）<input class="field" type="number" name="za-stay" value="${fa.stay ?? 0}"></label>
        <label>统计窗口（秒）<input class="field" type="number" name="za-window" value="${fa.window ?? 0}"></label>
        <label>恢复时长（秒）<input class="field" type="number" name="za-recover" value="${fa.recover ?? 0}"></label>
        <label>告警等级
          <select class="field" name="za-level">
            ${[1, 2, 3, 4].map((n) => `<option value="${n}"${n === fa.level ? " selected" : ""}>${LEVEL_NAME[n]}</option>`).join("")}
          </select>
        </label>
        <label>处置时限<input class="field" name="za-sla" value="${fa.sla || ""}"></label>
        <label>责任组织
          <select class="field" name="za-org">${optionList(data.orgs || [], fa.org)}</select>
        </label>
        <label>责任岗位<input class="field" name="za-role" value="${fa.role || ""}"></label>
        <label>通知方式
          <select class="field" name="za-notify">${optionList(NOTIFY_WAYS, fa.notify)}</select>
        </label>
        <label>生效班次<input class="field" name="za-shift" value="${fa.shift || ""}"></label>
        <label class="span-2">说明<textarea name="za-note" rows="2">${fa.note || ""}</textarea></label>
      </div>
    </div>
  `;
}

function zoneForm(item) {
  const tab = zoneDetailTab === "admission" ? "admission" : "fence";
  const tabsHtml = `
    <div class="zone-detail-tabs alert-panel-switch">
      <button type="button" class="btn btn-sm${tab === "fence" ? " is-on" : ""}" data-zone-tab="fence">定位告警</button>
      <button type="button" class="btn btn-sm${tab === "admission" ? " is-on" : ""}" data-zone-tab="admission">准入与名单</button>
    </div>
  `;
  const fencePanel = `
    <div class="zone-detail-panel${tab === "fence" ? " is-active" : ""}" data-zone-panel="fence">
      <div class="white-card">
        <div class="form-fields">
          <label>围栏类型
            <select class="field" name="fence">${optionList(FENCE_KINDS, item.fence)}</select>
          </label>
          <label>区域风险等级
            <select class="field" name="risk">${optionList(RISK_NAMES, item.risk)}</select>
          </label>
        </div>
      </div>
      ${zoneFenceAlertBlock(item)}
    </div>
  `;
  const admissionPanel = `
    <div class="zone-detail-panel${tab === "admission" ? " is-active" : ""}" data-zone-panel="admission">
      ${zoneAdmissionListHtml(item)}
    </div>
  `;
  return `
    <div class="detail-head">
      <div>
        <h2>${item.name}</h2>
        <p class="meta">${plantName(item.plant)} · ${item.id} · 边界由孪生维护</p>
      </div>
      <span class="lvl lvl-${RISK_LVL[item.risk] || 4}">${item.risk}</span>
    </div>
    ${tabsHtml}
    <div class="zone-detail-panels">
      ${fencePanel}
      ${admissionPanel}
    </div>
  `;
}

const WORK_FLOW = ["草稿", "待审批", "已签发", "作业中", "待销项", "已归档"];
const WORK_OPEN = ["新建", "草稿", "待审批", "已签发", "作业中", "待销项", "已驳回"];
const WORK_ACTIVE = ["已签发", "作业中", "待销项"];
const WORK_LEVEL_NAME = { 0: "特级", 1: "一级", 2: "二级", 3: "三级" };
const WORK_MEASURE_RESULTS = ["是", "否", "不适用"];
const WORK_APPROVAL_DEFAULT = [
  { step: "作业单位意见", role: "作业负责人" },
  { step: "区域单位意见", role: "分厂值班员" },
  { step: "安全管理部门意见", role: "安环专工" },
  { step: "公司领导审批意见", role: "公司领导" }
];
const WORK_TICKET_ROLES = ["申请人", "作业负责人", "作业人", "监护人", "动火人", "采样人"];

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function workLevelLabel(level) {
  return WORK_LEVEL_NAME[level] || WORK_LEVEL_NAME[Number(level)] || "";
}

function workTypeById(id) {
  return (data.workTypes || []).find((row) => row.id === id) || null;
}

function workTypeName(id) {
  return workTypeById(id)?.name || id || "—";
}

function workTypeLevels(type) {
  const rows = (type?.levels || []).map(Number).filter((n) => WORK_LEVEL_NAME[n] != null);
  return rows.length ? rows : [type?.level || 2];
}

function workTypeLevelsText(type) {
  return workTypeLevels(type).map(workLevelLabel).filter(Boolean).join("/") || "—";
}

function workOrderTypeLabel(order) {
  const name = workTypeName(order?.typeId);
  const lv = workLevelLabel(order?.level);
  return lv ? `${name}${lv}` : name;
}

function workStatusTone(status) {
  if (["作业中", "已签发", "合格", "启用", "是", "同意", "已抑制", "在册"].includes(status)) return "ok";
  if (["待审批", "待销项", "新建", "草稿", "过期", "不适用"].includes(status)) return "warn";
  if (["已驳回", "已作废", "缺失", "停用", "否", "离场"].includes(status)) return "off";
  return "";
}

function workOrderZones(order) {
  return (order.zoneIds || []).map((id) => zoneById(id)).filter(Boolean);
}

function workOrderPlace(order) {
  const names = workOrderZones(order).map((zone) => zone.name);
  return names.join("、") || order.place || "—";
}

function validWorkOrdersForZone(zoneId) {
  return (data.workOrders || []).filter((row) => (
    WORK_ACTIVE.includes(row.status) && (row.zoneIds || []).includes(zoneId)
  ));
}

function zoneForAlertPlace(alert) {
  const place = alert?.place || "";
  return (data.zones || []).find((zone) => zone.name === place || zone.mapLabel === place) || null;
}

function workOrdersForAlert(alert) {
  const zone = zoneForAlertPlace(alert);
  if (!zone) return [];
  const rows = (data.workOrders || []).filter((row) => (row.zoneIds || []).includes(zone.id));
  if (alert.type === "烟火" || alert.type === "明火") {
    const hot = rows.filter((row) => workTypeName(row.typeId) === "动火");
    const active = hot.filter((row) => WORK_ACTIVE.includes(row.status));
    return active.length ? active : hot;
  }
  if (alert.type === "非法闯入" || (alert.rule || "").includes("作业票")) {
    return rows.filter((row) => WORK_ACTIVE.includes(row.status));
  }
  return rows.filter((row) => WORK_ACTIVE.includes(row.status));
}

function workClock() {
  return data.workClock || "2026-11-06 10:30";
}

function workStampFromRecord(row) {
  const m = String(row?.id || "").match(/(\d{8})/);
  if (m) {
    const d = m[1];
    const t = (row.time && String(row.time).includes(":")) ? String(row.time).slice(-5) : "12:00";
    return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)} ${t}`;
  }
  return workClock();
}

function workInWindow(order, at) {
  const t = Date.parse(String(at || workClock()).replace(" ", "T"));
  const a = Date.parse(String(order.start || "").replace(" ", "T"));
  const b = Date.parse(String(order.end || "").replace(" ", "T"));
  if (!Number.isFinite(t) || !Number.isFinite(a) || !Number.isFinite(b)) return WORK_ACTIVE.includes(order.status);
  return t >= a && t <= b;
}

function workSuppressableEventTypes() {
  return (data.eventTypes || []).filter((et) => et.source === "定位" || et.source === "视频AI");
}

function workEventTypeNames(name) {
  if (name === "明火" || name === "烟火") return ["明火", "烟火"];
  return [name];
}

function workTypeSuppresses(type, eventType) {
  const list = type?.suppressEventTypes || [];
  const names = workEventTypeNames(eventType);
  return list.some((item) => names.includes(item) || workEventTypeNames(item).includes(eventType));
}

function workIntrusionType(eventType) {
  return eventType === "非法闯入" || eventType === "区域入侵";
}

function workPersonOnTicket(order, person) {
  if (!person) return false;
  const name = personNameFromEventField(person);
  return (order.people || []).some((row) => row.name === name);
}

function matchingSuppressWorkOrders({ zoneId, place, eventType, person, at } = {}) {
  const when = at || workClock();
  const zone = zoneId ? zoneById(zoneId) : zoneForAlertPlace({ place });
  if (!zone || !eventType) return [];
  return (data.workOrders || []).filter((order) => {
    if (!WORK_ACTIVE.includes(order.status)) return false;
    if (!(order.zoneIds || []).includes(zone.id)) return false;
    if (!workInWindow(order, when)) return false;
    const type = workTypeById(order.typeId);
    if (!workTypeSuppresses(type, eventType)) return false;
    if (workIntrusionType(eventType) && person && !workPersonOnTicket(order, person)) return false;
    return true;
  });
}

function hasValidWorkOrder(args) {
  return matchingSuppressWorkOrders(args).length > 0;
}

function recordWorkSuppression(order, payload) {
  order.suppressions = order.suppressions || [];
  if (payload.eventId && order.suppressions.some((row) => row.eventId === payload.eventId)) return;
  if (!payload.eventId && payload.alertId && order.suppressions.some((row) => row.alertId === payload.alertId)) return;
  order.suppressions.unshift({
    eventId: payload.eventId || "",
    alertId: payload.alertId || "",
    type: payload.type || "",
    time: payload.time || nowTime(),
    place: payload.place || "",
    note: payload.note || "识别未升告警"
  });
}

function suppressAlertByWork(alert, order) {
  if (!alert || alert.workSuppressed) return;
  alert.workSuppressed = true;
  alert.suppressedBy = order.id;
  pushLog(alert, "已办结", `有效工单 ${order.id} 抑制升告警`);
  recordWorkSuppression(order, {
    alertId: alert.id,
    type: alert.type,
    time: alert.time,
    place: alert.place,
    note: "正式告警已抑制，不进待办"
  });
}

function suppressEventByWork(event, order) {
  if (!event) return;
  event.status = "已抑制";
  event.workOrderId = order.id;
  event.note = event.note || `有效工单 ${order.id} 抑制升告警`;
  event.fusionNote = event.fusionNote || "作业关联，不进告警中心";
  recordWorkSuppression(order, {
    eventId: event.id,
    type: event.type,
    time: event.time,
    place: event.place,
    note: "视频识别未升告警"
  });
  if (event.alertId) {
    const linked = (data.alerts || []).find((row) => row.id === event.alertId);
    if (linked) suppressAlertByWork(linked, order);
  }
}

function isManualAlert(alert) {
  if (!alert) return false;
  if (alert.person === "人工上报" || alert.person === "值班登记") return true;
  return (alert.timeline || []).some((row) => (row.note || "").includes("人工上报") || row.status === "人工登记");
}

function applyWorkAlertSuppression() {
  (data.alerts || []).forEach((alert) => {
    if (!isOpenAlert(alert) || isManualAlert(alert)) return;
    const hits = matchingSuppressWorkOrders({
      place: alert.place,
      eventType: alert.type,
      person: alert.person,
      at: workStampFromRecord(alert)
    });
    if (hits[0]) suppressAlertByWork(alert, hits[0]);
  });
  videoEvents().forEach((event) => {
    if (!["待复核", "待核查", "真警"].includes(event.status)) return;
    const hits = matchingSuppressWorkOrders({
      place: event.place,
      eventType: event.type,
      person: event.person,
      at: workStampFromRecord(event)
    });
    if (hits[0]) suppressEventByWork(event, hits[0]);
  });
  ensureWorkSuppressDemo();
}

function ensureWorkSuppressDemo() {
  const order = (data.workOrders || []).find((row) => row.id === "WO-261106-01");
  if (!order || !WORK_ACTIVE.includes(order.status)) return;
  const type = workTypeById(order.typeId);
  if (!workTypeSuppresses(type, "明火")) return;
  data.events = data.events || [];
  const id = "AI-20261106-HOT";
  let ev = data.events.find((row) => row.id === id);
  const cam = (data.cameras || []).find((row) => row.zone === "z-crush") || {};
  if (!ev) {
    ev = {
      id,
      source: "视频AI",
      sourceEventId: id,
      type: "明火",
      typeCode: "FIRE",
      algo: "fire-v2.1",
      level: 2,
      status: "已抑制",
      confidence: 88,
      time: "10:18",
      camera: cam.id || "",
      place: "磨矿区",
      plant: "选矿分厂",
      x: cam.x,
      y: cam.y,
      summary: "焊接火花，有效动火票抑制升告警",
      workOrderId: order.id,
      note: `有效工单 ${order.id} 抑制升告警`,
      fusionNote: "作业关联，不进告警中心",
      payload: { algo: "fire-v2.1", camera_id: cam.id || "" }
    };
    data.events.unshift(ev);
  }
  suppressEventByWork(ev, order);
}

function renderAlertLinkedWorkOrders(item) {
  const rows = workOrdersForAlert(item);
  const wantPermit = item.type === "非法闯入" || (item.rule || "").includes("作业票");
  const wantHot = item.type === "烟火" || item.type === "明火";
  if (!wantPermit && !wantHot && !rows.length) return "";
  const body = rows.length
    ? `<ul class="alert-related-list">${rows.map((row) => (
      `<li>
        <div class="alert-related-head">
          <a class="text-link" href="#/t5/tickets?id=${encodeURIComponent(row.id)}">${esc(row.id)}</a>
          <span class="meta">${esc(workOrderTypeLabel(row))} · ${esc(row.status)}</span>
        </div>
      </li>`
    )).join("")}</ul>`
    : `<p class="meta">${wantPermit ? "无有效作业票" : "无"}</p>`;
  return `
    <div class="alert-related">
      <h4 class="alert-related-title">作业工单</h4>
      ${body}
    </div>
  `;
}

const EMPLOYEE_KINDS = ["自有", "承包商"];
const EMPLOYEE_STATUS = ["在册", "离场"];
const LOC_MODES = ["UWB", "GPS"];
const TAG_BIND_STATUS = ["已绑定", "未绑定", "已回收"];
const LOC_IMPORT_SAMPLE = `工号,姓名,卡号,制式,班组,单位
DZW-H-1001,张卫东,TAG-2201,UWB,萃取甲班,湿法分厂
DZW-M-2011,张磊,TAG-6602,UWB,破碎班,选矿分厂
DZW-H-1099,韩冬,TAG-8800,UWB,浸出乙班,湿法分厂`;

const EMPLOYEE_LOC_SEED = {
  "李成": { code: "DZW-H-1088", team: "值班甲班", tagId: "TAG-1108", locMode: "UWB", tagStatus: "已绑定", tagBattery: "91%", tagHeartbeat: "09:18" },
  "张卫东": { code: "DZW-H-1001", team: "萃取甲班", job: "萃取操作工", tagId: "TAG-2201", locMode: "UWB", tagStatus: "已绑定", tagBattery: "82%", tagHeartbeat: "11:42" },
  "穆萨": { code: "DZW-H-1002", team: "电积甲班", job: "电积巡检", tagId: "TAG-3308", locMode: "UWB", tagStatus: "已绑定", tagBattery: "76%", tagHeartbeat: "11:40" },
  "陈立": { code: "DZW-C-2088", team: "现场施工", job: "外来承包商", tagId: "TAG-8841", locMode: "UWB", tagStatus: "已绑定", tagBattery: "64%", tagHeartbeat: "11:32" },
  "王慧": { code: "DZW-H-1004", team: "浸出甲班", job: "浸出班长", tagId: "TAG-7712", locMode: "UWB", tagStatus: "已绑定", tagBattery: "48%", tagHeartbeat: "11:52" },
  "卡比拉": { code: "DZW-T-3001", team: "坝体巡视", job: "坝体巡视", tagId: "TAG-GPS-09", locMode: "GPS", tagStatus: "已绑定", tagBattery: "71%", tagHeartbeat: "11:45" },
  "赵宁": { code: "DZW-M-2001", team: "值班甲班" },
  "刘洋": { code: "DZW-T-3008", team: "值班甲班", tagId: "TAG-GPS-12", locMode: "GPS", tagStatus: "已绑定", tagBattery: "88%", tagHeartbeat: "11:46" },
  "周安": { code: "DZW-A-4001" },
  "张磊": { code: "DZW-M-2011", team: "破碎班", job: "破碎巡检", tagId: "TAG-6602", locMode: "UWB", tagStatus: "已绑定", tagBattery: "80%", tagHeartbeat: "11:41" },
  "苏晨": { code: "DZW-A-4002" }
};
const WORK_CERT_NAMES = ["动火作业证", "特种作业资格证", "高处作业证", "受限空间作业证", "监护资格", "电工证"];
const WORK_CERT_STATUS = ["合格", "过期", "缺失"];

function employeeById(id) {
  return (data.employees || []).find((row) => row.id === id) || null;
}

function employeeByName(name) {
  return (data.employees || []).find((row) => row.name === name) || null;
}

function employeeByUserId(userId) {
  if (!userId) return null;
  return (data.employees || []).find((row) => row.userId === userId) || null;
}

function bindEmployeeUser(emp, userId) {
  const nextId = userId || "";
  (data.employees || []).forEach((row) => {
    if (row.id !== emp.id && row.userId === nextId && nextId) row.userId = "";
  });
  (data.sysUsers || []).forEach((user) => {
    if (user.employeeId === emp.id && user.id !== nextId) user.employeeId = "";
  });
  emp.userId = nextId;
  if (nextId) {
    const user = (data.sysUsers || []).find((row) => row.id === nextId);
    if (user) user.employeeId = emp.id;
  }
}

function workCertsForEmployee(emp) {
  if (!emp) return [];
  return (data.workCerts || []).filter((row) => row.employeeId === emp.id || row.person === emp.name);
}

function workTrainingsForEmployee(emp) {
  if (!emp) return [];
  return (data.workTrainings || [])
    .filter((row) => row.employeeId === emp.id || row.person === emp.name)
    .sort((a, b) => String(b.time || "").localeCompare(String(a.time || "")));
}

function defaultWorkTrainings() {
  return [
    { id: "tr-001", person: "张磊", course: "动火安全专项培训", kind: "培训", result: "通过", score: "", time: "2026-09-20", source: "仿真培训平台" },
    { id: "tr-002", person: "张磊", course: "动火仿真操作考核 L2", kind: "操作考核", result: "通过", score: "92", time: "2026-10-15", source: "仿真培训平台" },
    { id: "tr-003", person: "穆萨", course: "高处作业年度复训", kind: "培训", result: "通过", score: "", time: "2026-08-05", source: "公司培训系统" },
    { id: "tr-004", person: "穆萨", course: "高处仿真操作考核", kind: "操作考核", result: "通过", score: "88", time: "2026-08-12", source: "仿真培训平台" },
    { id: "tr-005", person: "陈立", course: "受限空间入场培训", kind: "培训", result: "通过", score: "", time: "2026-07-01", source: "公司培训系统" },
    { id: "tr-006", person: "陈立", course: "受限空间仿真操作考核", kind: "操作考核", result: "未通过", score: "58", time: "2026-07-08", source: "仿真培训平台" },
    { id: "tr-007", person: "卡比拉", course: "高处作业入场培训", kind: "培训", result: "通过", score: "", time: "2026-06-18", source: "公司培训系统" },
    { id: "tr-008", person: "赵宁", course: "监护人角色培训", kind: "培训", result: "通过", score: "", time: "2026-05-10", source: "公司培训系统" }
  ];
}

function ensureWorkTrainings() {
  const seeds = defaultWorkTrainings();
  if (!Array.isArray(data.workTrainings) || !data.workTrainings.length) {
    data.workTrainings = seeds.map((row) => ({ ...row }));
  } else {
    seeds.forEach((seed) => {
      if (!data.workTrainings.some((row) => row.id === seed.id)) {
        data.workTrainings.push({ ...seed });
      }
    });
  }
  (data.workTrainings || []).forEach((row) => {
    if (!row.employeeId && row.person) {
      const emp = employeeByName(row.person);
      if (emp) row.employeeId = emp.id;
    }
  });
}

function replaceWorkCertsForEmployee(emp, certs) {
  data.workCerts = (data.workCerts || []).filter((row) => row.employeeId !== emp.id && row.person !== emp.name);
  (certs || []).forEach((row) => {
    if (!row.cert) return;
    data.workCerts.push({
      employeeId: emp.id,
      person: emp.name,
      cert: row.cert,
      no: row.no || "",
      status: row.status || "合格",
      due: row.due || ""
    });
  });
}

function syncCertLedgersFromWorkCerts() {
  const other = (data.sysLedgers || []).filter((row) => row.kind !== "证照" || !String(row.id).startsWith("ZZ-WK-"));
  const certRows = (data.workCerts || []).map((row) => ({
    id: `ZZ-WK-${row.employeeId || row.person}-${row.cert}`,
    kind: "证照",
    title: `${row.person} · ${row.cert}`,
    place: row.person,
    owner: row.person,
    status: row.status === "合格" ? "有效" : row.status,
    due: row.due || "—",
    note: row.no || ""
  }));
  data.sysLedgers = other.concat(certRows);
}

function emptyLocFields() {
  return {
    team: "",
    tagId: "",
    locMode: "",
    tagStatus: "未绑定",
    tagBattery: "",
    tagHeartbeat: ""
  };
}

function defaultEmployees() {
  const fromUser = (user, kind = "自有") => ({
    id: `em-${user.id.slice(2)}`,
    name: user.name,
    code: "",
    org: user.org || "",
    job: user.role || "",
    kind: user.role === "承包商" ? "承包商" : kind,
    status: user.status === "临时" ? "在册" : (user.status === "停用" ? "离场" : "在册"),
    userId: user.id,
    mobile: user.mobile || "",
    note: "",
    ...emptyLocFields()
  });
  const workNames = new Set((defaultWorkCerts().map((row) => row.person)));
  const rows = [];
  (data.sysUsers || []).forEach((user) => {
    if (!["现场作业", "承包商", "分厂值班员", "公司领导", "安环专工"].includes(user.role)) return;
    if (user.name === "系统管理员") return;
    rows.push(fromUser(user));
  });
  workNames.forEach((name) => {
    if (rows.some((row) => row.name === name)) return;
    const user = (data.sysUsers || []).find((u) => u.name === name);
    rows.push({
      id: `em-${name}`,
      name,
      code: "",
      org: user?.org || "",
      job: user?.role || "现场作业",
      kind: user?.role === "承包商" ? "承包商" : "自有",
      status: "在册",
      userId: user?.id || "",
      mobile: user?.mobile || "",
      note: "",
      ...emptyLocFields()
    });
  });
  return rows;
}

function ensureEmployees() {
  const seeds = defaultEmployees();
  if (!Array.isArray(data.employees) || !data.employees.length) {
    data.employees = seeds.map((row) => ({ ...row }));
  } else {
    seeds.forEach((seed) => {
      if (!data.employees.some((row) => row.id === seed.id || row.name === seed.name)) {
        data.employees.push({ ...seed });
      }
    });
  }
  ensureWorkTrainings();
  (data.employees || []).forEach((emp) => {
    if (!emp.tagStatus) emp.tagStatus = emp.tagId ? "已绑定" : "未绑定";
    if (emp.team == null) emp.team = "";
    if (emp.tagId == null) emp.tagId = "";
    if (emp.locMode == null) emp.locMode = "";
    if (emp.tagBattery == null) emp.tagBattery = "";
    if (emp.tagHeartbeat == null) emp.tagHeartbeat = "";
    const locSeed = EMPLOYEE_LOC_SEED[emp.name];
    if (locSeed && !emp.tagId && !emp.code) {
      Object.assign(emp, locSeed);
    }
    (data.workCerts || []).forEach((cert) => {
      if (cert.person === emp.name) cert.employeeId = emp.id;
    });
    (data.workTrainings || []).forEach((row) => {
      if (row.person === emp.name) row.employeeId = emp.id;
    });
    if (!emp.userId) {
      const user = (data.sysUsers || []).find((u) => u.name === emp.name);
      if (user) bindEmployeeUser(emp, user.id);
    } else {
      const user = (data.sysUsers || []).find((u) => u.id === emp.userId);
      if (user && user.employeeId !== emp.id) user.employeeId = emp.id;
    }
  });
  (data.sysUsers || []).forEach((user) => {
    if (user.employeeId) return;
    const emp = employeeByUserId(user.id);
    if (emp) user.employeeId = emp.id;
  });
  ensurePeopleLinked();
}

function workPeopleOptions() {
  const active = (data.employees || []).filter((row) => row.status === "在册");
  if (active.length) {
    return active.map((row) => ({ name: row.name, job: row.job || "" }));
  }
  const names = new Map();
  (data.people || []).forEach((p) => names.set(p.name, p.job || ""));
  (data.sysUsers || []).forEach((u) => {
    if (!names.has(u.name)) names.set(u.name, u.role || "");
  });
  (data.workCerts || []).forEach((row) => {
    if (row.person && !names.has(row.person)) names.set(row.person, "");
  });
  return [...names.entries()].map(([name, job]) => ({ name, job }));
}

function workOrgOptions() {
  const names = new Set();
  (data.plants || []).forEach((p) => { if (p.id !== "all") names.add(p.name); });
  (data.orgs || []).forEach((o) => names.add(o));
  (data.sysUsers || []).forEach((u) => { if (u.org) names.add(u.org); });
  return [...names];
}

function lookupWorkCert(person, cert) {
  if (!person || !cert) return { qual: "合格", certNo: "" };
  const emp = employeeByName(person);
  const row = (data.workCerts || []).find((item) => item.cert === cert && (
    (emp && item.employeeId === emp.id) || item.person === person
  ));
  if (!row) return { qual: "缺失", certNo: "" };
  return { qual: row.status || "合格", certNo: row.no || "" };
}

function workPersonSnapshot(name, roleOnTicket, type) {
  const qualRule = (type?.quals || []).find((row) => row.role === roleOnTicket);
  const cert = qualRule?.cert || "";
  const found = lookupWorkCert(name, cert);
  return {
    name,
    roleOnTicket,
    cert,
    certNo: found.certNo,
    qual: cert && qualRule?.required ? found.qual : (cert ? found.qual : "合格")
  };
}

function nextWorkOrderId() {
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const n = (data.workOrders || []).filter((row) => (row.id || "").includes(stamp)).length + 1;
  return `WO-${stamp}-${String(n).padStart(2, "0")}`;
}

function workOrderStepIndex(order) {
  if (order.status === "新建") return WORK_FLOW.indexOf("草稿");
  if (order.status === "已驳回") return WORK_FLOW.indexOf("待审批");
  if (order.status === "已作废") return -1;
  return WORK_FLOW.indexOf(order.status);
}

function pushWorkLog(order, status, note) {
  order.timeline = order.timeline || [];
  order.timeline.push({
    status,
    time: nowTime(),
    actor: data.operator?.name || "值班员",
    note: note || ""
  });
}

function workHoursBetween(start, end) {
  const a = Date.parse(String(start || "").replace(" ", "T"));
  const b = Date.parse(String(end || "").replace(" ", "T"));
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 0;
  return (b - a) / 3600000;
}

function workNowStamp(hour = 8, minute = 0) {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(hour)}:${pad(minute)}`;
}

function workExtras(type) {
  return type?.extras || {};
}

function workTypeAllowedLevels(type) {
  const set = type?.levelSet;
  if (set === "hot") return [0, 1, 2];
  if (set === "height") return [1, 2, 3];
  return [1, 2, 3];
}

function cloneWorkMeasures(type) {
  return (type?.measures || []).map((row) => {
    const name = typeof row === "string" ? row : row.name;
    const keys = typeof row === "string" ? [] : (row.fills || []);
    const fills = {};
    keys.forEach((key) => { fills[key] = ""; });
    return { name, result: "", confirmer: "", fills };
  });
}

function defaultWorkFlows() {
  return [
    {
      id: "wf-four",
      name: "四方签批",
      enabled: true,
      steps: WORK_APPROVAL_DEFAULT.map((row) => ({ ...row }))
    },
    {
      id: "wf-three",
      name: "三级签批",
      enabled: true,
      steps: [
        { step: "作业单位意见", role: "作业负责人" },
        { step: "区域单位意见", role: "分厂值班员" },
        { step: "安全管理部门意见", role: "安环专工" }
      ]
    }
  ];
}

function workFlowById(id) {
  return (data.workFlows || []).find((row) => row.id === id) || null;
}

function workFlowName(id) {
  return workFlowById(id)?.name || id || "—";
}

function workApprovalRoleOptions() {
  const names = new Set(["作业负责人", "分厂值班员", "安环专工", "公司领导", "班长"]);
  (data.sysRoles || []).forEach((row) => { if (row.name) names.add(row.name); });
  return [...names];
}

function workTypesUsingFlow(flowId) {
  return (data.workTypes || []).filter((row) => row.flowId === flowId);
}

function workTypeApprovalChain(type) {
  const flow = workFlowById(type?.flowId);
  if (flow?.steps?.length) return flow.steps;
  if ((type?.approval || []).length) return type.approval;
  return WORK_APPROVAL_DEFAULT;
}

function guessWorkFlowId(type) {
  const n = (type?.approval || []).length;
  if (type?.id === "wt-elec" || n === 3) return "wf-three";
  return "wf-four";
}

function ensureWorkFlows() {
  const seeds = defaultWorkFlows();
  if (!Array.isArray(data.workFlows) || !data.workFlows.length) {
    data.workFlows = seeds.map((row) => ({
      ...row,
      steps: row.steps.map((step) => ({ ...step }))
    }));
  } else {
    seeds.forEach((seed) => {
      if (!data.workFlows.some((row) => row.id === seed.id)) {
        data.workFlows.push({ ...seed, steps: seed.steps.map((step) => ({ ...step })) });
      }
    });
  }
  data.workFlows.forEach((flow) => {
    flow.steps = (flow.steps || []).map((row) => ({ step: row.step || "", role: row.role || "" }));
    if (flow.enabled == null) flow.enabled = true;
  });
}

function cloneWorkApprovals(type) {
  const chain = workTypeApprovalChain(type);
  return chain.map((row) => ({
    step: row.step,
    role: row.role,
    result: "",
    opinion: "",
    actor: "",
    time: ""
  }));
}

function workPendingApproval(order) {
  return (order.approvals || []).find((row) => !row.result) || null;
}

function workRoleMatchesOperator(nodeRole) {
  const role = (data.operator?.role || "").trim();
  const need = (nodeRole || "").trim();
  if (!role || !need) return false;
  return role === need || role.includes(need) || need.includes(role);
}

function operatorIsSuperAdmin() {
  const role = (data.operator?.role || "").trim();
  return role.includes("超级管理员") || role === "系统管理员";
}

function workCanApproveNode(item, node) {
  if (!item || item.status !== "待审批" || !node || node.result) return false;
  if (operatorIsSuperAdmin()) return true;
  if (workRoleMatchesOperator(node.role)) return true;
  const opName = data.operator?.name || "";
  if (!opName) return false;
  return peopleByRole(item, node.role).includes(opName)
    || (node.role === "作业负责人" && (firstPersonByRole(item, "作业负责人") === opName || item.applicant === opName));
}

function workMeasureLabel(row) {
  const fills = row.fills && typeof row.fills === "object"
    ? Object.entries(row.fills).filter(([, v]) => String(v || "").trim()).map(([k, v]) => `${k}${v}`)
    : [];
  return fills.length ? `${row.name}（${fills.join("，")}）` : row.name;
}

function defaultWorkTypeSeeds() {
  return [
    {
      id: "wt-hot",
      code: "HOT",
      name: "动火",
      level: 1,
      levelSet: "hot",
      levels: [0, 1, 2],
      enabled: true,
      zoneIds: ["z-crush", "z-wh", "z-stock", "z-unload"],
      workerRole: "现场作业",
      guardianRole: "当班值班员",
      approverRole: "分厂值班员",
      quals: [
        { role: "作业人", cert: "动火作业证", required: true },
        { role: "动火人", cert: "特种作业资格证", required: true },
        { role: "监护人", cert: "监护资格", required: true }
      ],
      measures: [
        { name: "动火设备内部构件清理干净，蒸汽吹扫或水洗合格，达到动火条件", fills: [] },
        { name: "断开与动火设备相连接的所有管线，加盲板", fills: ["盲板块数"] },
        { name: "动火点周围的下水道、地漏、地沟、电缆沟等已清除易燃物，并已采取覆盖、铺沙、水封等手段进行隔离", fills: [] },
        { name: "罐区内动火点同一围堰内和防火间距内的油罐不同时进行脱水作业", fills: [] },
        { name: "高处作业已采取防火花飞溅措施", fills: [] },
        { name: "动火点周围易燃物已清除", fills: [] },
        { name: "电焊回路线已接在焊件上，把线未穿过下水井或其他设备搭接", fills: [] },
        { name: "乙炔气瓶直立有防倾倒措施，气瓶间距大于5m，与明火间距大于10m", fills: [] },
        { name: "现场配备消防带、灭火器、铁锹、消防沙、灭火毯", fills: ["消防带根数", "灭火器个数", "铁锹把数", "消防沙桶数", "灭火毯块数"] },
        { name: "其他安全措施", fills: ["说明"] }
      ],
      flowId: "wf-four",
      approval: WORK_APPROVAL_DEFAULT.map((row) => ({ ...row })),
      riskOptions: ["火灾", "触电", "灼烫", "爆炸"],
      validityHours: 8,
      night: false,
      extras: {
        gas: true,
        gasStandard: "可燃气体浓度 <20%LEL",
        gasHint: "作业前 30 min 内应对动火现场进行气体采样分析，分析合格后方可进入；作业中如有必要应 2h 监测一次或加密。",
        gasLimit: 20,
        maxHours: 8,
        hotWorker: true,
        heightRequired: false
      },
      suppressEventTypes: ["明火", "烟雾"]
    },
    {
      id: "wt-height",
      code: "WAH",
      name: "高处",
      level: 2,
      levelSet: "height",
      levels: [1, 2, 3],
      enabled: true,
      zoneIds: ["z-ew", "z-tail", "z-cmd"],
      workerRole: "现场作业",
      guardianRole: "当班值班员",
      approverRole: "分厂值班员",
      quals: [
        { role: "作业人", cert: "高处作业证", required: true },
        { role: "监护人", cert: "监护资格", required: true }
      ],
      measures: [
        { name: "作业人员身体条件符合要求", fills: [] },
        { name: "作业人员着装符合工作要求", fills: [] },
        { name: "作业人员佩戴合格的安全帽", fills: [] },
        { name: "作业人员佩戴安全带，安全带高挂低用", fills: [] },
        { name: "作业人员携带有工具袋及安全绳", fills: [] },
        { name: "现场搭设的脚手架、防护网、围栏、挡脚板、跳板符合安全规定", fills: [] },
        { name: "垂直分层作业中间有隔离设施", fills: [] },
        { name: "上下梯子、绳子符合安全规定", fills: [] },
        { name: "承重梁、柱能承受作业过程最大负荷的要求", fills: [] },
        { name: "作业现场四周已设置警戒", fills: [] },
        { name: "屋顶等斜面作业设置有牢固可靠的安全绳、安全网及相关防护措施", fills: [] },
        { name: "禁止在石棉瓦等不承重的物件上行走或停留", fills: [] }
      ],
      flowId: "wf-four",
      approval: WORK_APPROVAL_DEFAULT.map((row) => ({ ...row })),
      riskOptions: ["高处坠落", "物体打击", "触电"],
      validityHours: 8,
      night: false,
      extras: {
        gas: false,
        heightRequired: true,
        hotWorker: false,
        maxHours: 8
      },
      suppressEventTypes: ["非法闯入"]
    }
  ];
}

function defaultWorkCerts() {
  return [
    { person: "张磊", cert: "动火作业证", no: "DH-049", status: "合格", due: "2027-06" },
    { person: "张磊", cert: "特种作业资格证", no: "049", status: "合格", due: "2027-06" },
    { person: "穆萨", cert: "动火作业证", no: "DH-051", status: "合格", due: "2027-03" },
    { person: "穆萨", cert: "高处作业证", no: "WAH-118", status: "合格", due: "2027-08" },
    { person: "穆萨", cert: "特种作业资格证", no: "051", status: "合格", due: "2027-03" },
    { person: "赵宁", cert: "监护资格", no: "GRD-012", status: "合格", due: "2027-12" },
    { person: "李成", cert: "监护资格", no: "GRD-007", status: "合格", due: "2027-12" },
    { person: "张卫东", cert: "受限空间作业证", no: "CSE-033", status: "合格", due: "2027-04" },
    { person: "陈立", cert: "受限空间作业证", no: "CSE-088", status: "过期", due: "2026-08" },
    { person: "卡比拉", cert: "高处作业证", no: "", status: "缺失", due: "" },
    { person: "赵宁", cert: "电工证", no: "EL-021", status: "合格", due: "2027-09" }
  ];
}

function normalizeWorkMeasureTpl(row) {
  if (typeof row === "string") return { name: row, fills: [] };
  return { name: row?.name || "", fills: Array.isArray(row?.fills) ? row.fills : [] };
}

function normalizeWorkType(type, seed) {
  const next = type || {};
  if (seed) {
    const oldMeasures = next.measures || [];
    const looksLegacy = !oldMeasures.length
      || oldMeasures.every((row) => typeof row === "string")
      || (typeof oldMeasures[0] !== "string" && oldMeasures.length < (seed.measures || []).length && seed.id === next.id);
    if (looksLegacy && seed.measures) next.measures = seed.measures.map((row) => ({ ...row, fills: [...(row.fills || [])] }));
    if (!Array.isArray(next.approval) || !next.approval.some((row) => (row.step || "").includes("作业单位") || (row.step || "").includes("安全管理部门"))) {
      next.approval = (seed.approval || WORK_APPROVAL_DEFAULT).map((row) => ({ ...row }));
    }
    if (!Array.isArray(next.levels) || !next.levels.length) next.levels = seed.levels ? [...seed.levels] : [next.level || 2];
    if (!next.levelSet) next.levelSet = seed.levelSet || "normal";
    if (!next.extras) next.extras = { ...(seed.extras || {}) };
    else next.extras = { ...(seed.extras || {}), ...next.extras };
    if (!Array.isArray(next.riskOptions) || !next.riskOptions.length) next.riskOptions = [...(seed.riskOptions || [])];
    if (seed.quals && (next.quals || []).length < seed.quals.length) next.quals = seed.quals.map((row) => ({ ...row }));
    if (!Array.isArray(next.suppressEventTypes)) next.suppressEventTypes = [...(seed.suppressEventTypes || [])];
    if (!next.flowId && seed.flowId) next.flowId = seed.flowId;
  }
  next.measures = (next.measures || []).map(normalizeWorkMeasureTpl);
  next.approval = (next.approval || []).map((row) => ({ step: row.step || "", role: row.role || "" }));
  if (!next.flowId) next.flowId = guessWorkFlowId(next);
  next.approval = workTypeApprovalChain(next).map((row) => ({ step: row.step || "", role: row.role || "" }));
  next.quals = (next.quals || []).map((row) => ({ role: row.role || "", cert: row.cert || "", required: row.required !== false }));
  next.levels = workTypeLevels(next);
  next.extras = next.extras || {};
  next.riskOptions = next.riskOptions || [];
  next.suppressEventTypes = Array.isArray(next.suppressEventTypes) ? next.suppressEventTypes : [];
  delete next.permitSource;
  return next;
}

function normalizeWorkOrderMeasure(row) {
  if (typeof row === "string") return { name: row, result: "", confirmer: "", fills: {} };
  const fills = row.fills && typeof row.fills === "object" && !Array.isArray(row.fills) ? { ...row.fills } : {};
  let result = row.result || "";
  if (!result && row.done === true) result = "是";
  return { name: row.name || "", result, confirmer: row.confirmer || "", fills };
}

function peopleByRole(order, role) {
  return (order.people || []).filter((row) => row.roleOnTicket === role).map((row) => row.name).filter(Boolean);
}

function firstPersonByRole(order, role) {
  return peopleByRole(order, role)[0] || "";
}

function parseBriefedToNames(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((name) => String(name).trim()).filter(Boolean);
  return String(value).split(/[、,，;；]/).map((name) => name.trim()).filter(Boolean);
}

function formatBriefedTo(names) {
  return (names || []).filter(Boolean).join("、");
}

function normalizeWorkOrder(order, type) {
  const next = order;
  next.measures = (next.measures || []).map(normalizeWorkOrderMeasure);
  next.people = (next.people || []).map((row) => {
    if (!row.cert || row.certNo) return row;
    const found = lookupWorkCert(row.name, row.cert);
    return { ...row, certNo: found.certNo, qual: row.qual || found.qual };
  });
  if (type && (!next.measures.length || next.measures.length < type.measures.length) && next.status === "草稿") {
    next.measures = cloneWorkMeasures(type);
  }
  if (!Array.isArray(next.approvals) || !next.approvals.length) {
    next.approvals = cloneWorkApprovals(type);
    if (["已签发", "作业中", "待销项", "已归档"].includes(next.status)) {
      next.approvals.forEach((row) => {
        row.result = "同意";
        row.opinion = "同意";
        row.actor = next.timeline?.find((t) => t.status === "已签发")?.actor || data.operator?.name || "";
        row.time = next.timeline?.find((t) => t.status === "已签发")?.time || "";
      });
    }
  }
  if (next.level == null) next.level = type?.level ?? workTypeLevels(type)[0] ?? 2;
  if (!next.applyOrg) next.applyOrg = next.plant || "";
  if (!next.applicant) next.applicant = firstPersonByRole(next, "申请人") || next.people?.[0]?.name || "";
  if (!next.content) next.content = next.place || "";
  if (!Array.isArray(next.risks)) next.risks = [];
  if (!next.riskNote) next.riskNote = "";
  if (!Array.isArray(next.gasChecks)) next.gasChecks = [];
  if (!next.briefBy) next.briefBy = firstPersonByRole(next, "作业负责人") || next.applicant || "";
  if (!next.briefedTo) next.briefedTo = peopleByRole(next, "作业人").join("、");
  if (!next.guardian) next.guardian = firstPersonByRole(next, "监护人");
  if (next.gasStandard == null) next.gasStandard = workExtras(type).gasStandard || "";
  delete next.source;
  delete next.externalNo;
  delete next.externalSystem;
  (next.timeline || []).forEach((row) => {
    if (typeof row.note === "string" && row.note.includes("关联许可")) row.note = "提交审批";
  });
  return next;
}

function paperDemoOrders() {
  return {
    "WO-261106-01": {
      id: "WO-261106-01",
      typeId: "wt-hot",
      level: 1,
      status: "作业中",
      plant: "选矿分厂",
      applyOrg: "选矿分厂",
      applicant: "赵宁",
      content: "支架加固",
      zoneIds: ["z-crush"],
      place: "磨矿区",
      start: "2026-11-06 08:00",
      end: "2026-11-06 16:00",
      people: [
        { name: "赵宁", roleOnTicket: "申请人", cert: "", certNo: "", qual: "合格" },
        { name: "赵宁", roleOnTicket: "作业负责人", cert: "监护资格", certNo: "GRD-012", qual: "合格" },
        { name: "张磊", roleOnTicket: "作业人", cert: "动火作业证", certNo: "DH-049", qual: "合格" },
        { name: "穆萨", roleOnTicket: "作业人", cert: "动火作业证", certNo: "DH-051", qual: "合格" },
        { name: "张磊", roleOnTicket: "动火人", cert: "特种作业资格证", certNo: "049", qual: "合格" },
        { name: "赵宁", roleOnTicket: "监护人", cert: "监护资格", certNo: "GRD-012", qual: "合格" }
      ],
      risks: ["火灾", "触电"],
      riskNote: "",
      measures: [
        { name: "动火设备内部构件清理干净，蒸汽吹扫或水洗合格，达到动火条件", result: "是", confirmer: "赵宁", fills: {} },
        { name: "断开与动火设备相连接的所有管线，加盲板", result: "不适用", confirmer: "赵宁", fills: { 盲板块数: "" } },
        { name: "动火点周围的下水道、地漏、地沟、电缆沟等已清除易燃物，并已采取覆盖、铺沙、水封等手段进行隔离", result: "是", confirmer: "赵宁", fills: {} },
        { name: "罐区内动火点同一围堰内和防火间距内的油罐不同时进行脱水作业", result: "是", confirmer: "赵宁", fills: {} },
        { name: "高处作业已采取防火花飞溅措施", result: "是", confirmer: "赵宁", fills: {} },
        { name: "动火点周围易燃物已清除", result: "是", confirmer: "赵宁", fills: {} },
        { name: "电焊回路线已接在焊件上，把线未穿过下水井或其他设备搭接", result: "是", confirmer: "赵宁", fills: {} },
        { name: "乙炔气瓶直立有防倾倒措施，气瓶间距大于5m，与明火间距大于10m", result: "不适用", confirmer: "赵宁", fills: {} },
        { name: "现场配备消防带、灭火器、铁锹、消防沙、灭火毯", result: "是", confirmer: "赵宁", fills: { 消防带根数: "2", 灭火器个数: "2", 铁锹把数: "2", 消防沙桶数: "1", 灭火毯块数: "1" } },
        { name: "其他安全措施", result: "是", confirmer: "赵宁", fills: { 说明: "专人监护" } }
      ],
      gasChecks: [
        { time: "2026-11-06 07:37", lel: "0", sampler: "李成" }
      ],
      gasStandard: "可燃气体浓度 <20%LEL",
      briefBy: "赵宁",
      guardian: "赵宁",
      briefedTo: "张磊、穆萨",
      approvals: [
        { step: "作业单位意见", role: "作业负责人", result: "同意", opinion: "同意", actor: "赵宁", time: "07:40" },
        { step: "区域单位意见", role: "分厂值班员", result: "同意", opinion: "同意", actor: "赵宁", time: "07:46" },
        { step: "安全管理部门意见", role: "安环专工", result: "同意", opinion: "同意", actor: "周安", time: "07:50" },
        { step: "公司领导审批意见", role: "公司领导", result: "同意", opinion: "同意", actor: "苏晨", time: "07:52" }
      ],
      timeline: [
        { status: "待审批", time: "07:40", actor: "张磊", note: "提交审批" },
        { status: "已签发", time: "07:52", actor: "苏晨", note: "四方签批完成" },
        { status: "作业中", time: "08:05", actor: "张磊", note: "开始焊接" }
      ]
    },
    "WO-261106-03": {
      id: "WO-261106-03",
      typeId: "wt-height",
      level: 2,
      status: "已签发",
      plant: "湿法分厂",
      applyOrg: "湿法分厂",
      applicant: "李成",
      content: "铜电积区桁架检修",
      height: "20m",
      zoneIds: ["z-ew"],
      place: "铜电积区",
      start: "2026-11-06 08:00",
      end: "2026-11-06 16:00",
      people: [
        { name: "李成", roleOnTicket: "申请人", cert: "", certNo: "", qual: "合格" },
        { name: "李成", roleOnTicket: "作业负责人", cert: "监护资格", certNo: "GRD-007", qual: "合格" },
        { name: "穆萨", roleOnTicket: "作业人", cert: "高处作业证", certNo: "WAH-118", qual: "合格" },
        { name: "李成", roleOnTicket: "监护人", cert: "监护资格", certNo: "GRD-007", qual: "合格" }
      ],
      risks: ["高处坠落", "物体打击"],
      riskNote: "槽面边缘作业，工具防坠落。",
      measures: [
        { name: "作业人员身体条件符合要求", result: "是", confirmer: "李成", fills: {} },
        { name: "作业人员着装符合工作要求", result: "是", confirmer: "李成", fills: {} },
        { name: "作业人员佩戴合格的安全帽", result: "是", confirmer: "李成", fills: {} },
        { name: "作业人员佩戴安全带，安全带高挂低用", result: "是", confirmer: "李成", fills: {} },
        { name: "作业人员携带有工具袋及安全绳", result: "是", confirmer: "李成", fills: {} },
        { name: "现场搭设的脚手架、防护网、围栏、挡脚板、跳板符合安全规定", result: "否", confirmer: "李成", fills: {} },
        { name: "垂直分层作业中间有隔离设施", result: "否", confirmer: "李成", fills: {} },
        { name: "上下梯子、绳子符合安全规定", result: "否", confirmer: "李成", fills: {} },
        { name: "承重梁、柱能承受作业过程最大负荷的要求", result: "否", confirmer: "李成", fills: {} },
        { name: "作业现场四周已设置警戒", result: "是", confirmer: "李成", fills: {} },
        { name: "屋顶等斜面作业设置有牢固可靠的安全绳、安全网及相关防护措施", result: "否", confirmer: "李成", fills: {} },
        { name: "禁止在石棉瓦等不承重的物件上行走或停留", result: "否", confirmer: "李成", fills: {} }
      ],
      gasChecks: [],
      briefBy: "李成",
      guardian: "李成",
      briefedTo: "穆萨",
      approvals: [
        { step: "作业单位意见", role: "作业负责人", result: "同意", opinion: "同意", actor: "李成", time: "08:20" },
        { step: "区域单位意见", role: "分厂值班员", result: "同意", opinion: "同意", actor: "李成", time: "08:26" },
        { step: "安全管理部门意见", role: "安环专工", result: "同意", opinion: "同意", actor: "周安", time: "08:32" },
        { step: "公司领导审批意见", role: "公司领导", result: "同意", opinion: "同意", actor: "苏晨", time: "08:36" }
      ],
      timeline: [
        { status: "待审批", time: "08:20", actor: "穆萨", note: "提交审批" },
        { status: "已签发", time: "08:36", actor: "苏晨", note: "四方签批完成" }
      ]
    }
  };
}

function ensureWorkUsers() {
  const extra = [
    { id: "u-zl", name: "张磊", account: "zhanglei", org: "选矿分厂值班", role: "现场作业", plant: "选矿分厂" },
    { id: "u-sc", name: "苏晨", account: "suchen", org: "安环部", role: "公司领导", plant: "全厂" }
  ];
  data.sysUsers = data.sysUsers || [];
  extra.forEach((row) => {
    if (data.sysUsers.some((u) => u.name === row.name || u.id === row.id)) return;
    data.sysUsers.push({ ...row, status: "启用", source: "组织主数据", mobile: "—", shift: "—" });
  });
}

function ensureWorkCertLedgers() {
  data.sysLedgers = data.sysLedgers || [];
  defaultWorkCerts().forEach((row) => {
    const id = `ZZ-WK-${row.person}-${row.cert}`;
    if (data.sysLedgers.some((item) => item.id === id)) return;
    data.sysLedgers.push({
      id,
      kind: "证照",
      title: `${row.person} · ${row.cert}`,
      place: row.person,
      owner: row.person,
      status: row.status === "合格" ? "有效" : row.status,
      due: row.due || "—",
      note: row.no || ""
    });
  });
}

function ensureWorkCatalog() {
  ensureWorkUsers();
  if (!Array.isArray(data.workCerts) || !data.workCerts.length) data.workCerts = defaultWorkCerts();
  ensureEmployees();
  syncCertLedgersFromWorkCerts();
  delete data.externalPermits;
  ensureWorkFlows();
  const seeds = defaultWorkTypeSeeds();
  const byId = new Map(seeds.map((row) => [row.id, row]));
  data.workTypes = (data.workTypes || []).map((row) => normalizeWorkType(row, byId.get(row.id)));
  seeds.forEach((seed) => {
    if (!data.workTypes.some((row) => row.id === seed.id)) data.workTypes.push(normalizeWorkType({ ...seed }, seed));
  });
  const keepTypeIds = new Set(["wt-hot", "wt-height"]);
  data.workTypes = data.workTypes.filter((row) => keepTypeIds.has(row.id));
  const demos = paperDemoOrders();
  data.workOrders = (data.workOrders || []).map((order) => {
    if (order.typeId === "wt-confined" || order.typeId === "wt-elec") order.typeId = "wt-height";
    const type = workTypeById(order.typeId);
    const demo = demos[order.id];
    if (demo && (!Array.isArray(order.approvals) || !order.approvals.length || !order.applicant)) {
      return JSON.parse(JSON.stringify(demo));
    }
    return normalizeWorkOrder(order, type);
  });
}

function workCfgTable(title, headers, body, addAttr) {
  return `
    <div class="white-card">
      <div class="zone-admission-toolbar">
        <h3>${title}</h3>
        <button type="button" class="btn btn-sm btn-primary" ${addAttr}>新增</button>
      </div>
      <div class="table-wrap work-cfg-table">
        <table>
          <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}<th>操作</th></tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>
    </div>
  `;
}

function workTypeFromForm(root, item) {
  item.name = formVal(root, "name") || item.name;
  item.code = formVal(root, "code") || item.code;
  item.enabled = formVal(root, "enabled") === "启用";
  item.validityHours = Number(formVal(root, "validityHours")) || 8;
  item.night = root.querySelector("[name=night]")?.checked || false;
  item.zoneIds = formChecks(root, "zone");
  const levels = formChecks(root, "wlevel").map(Number);
  item.levels = levels.length ? levels : workTypeAllowedLevels(item);
  item.level = item.levels[0] ?? item.level ?? 2;
  item.extras = {
    ...(item.extras || {}),
    gas: root.querySelector("[name=extra-gas]")?.checked || false,
    heightRequired: root.querySelector("[name=extra-height]")?.checked || false,
    hotWorker: root.querySelector("[name=extra-hot]")?.checked || false,
    gasStandard: formVal(root, "gasStandard"),
    gasHint: formVal(root, "gasHint"),
    gasLimit: Number(formVal(root, "gasLimit")) || 20,
    maxHours: Number(formVal(root, "maxHours")) || item.validityHours
  };
  item.suppressEventTypes = formChecks(root, "suppress-et");
  item.flowId = formVal(root, "flowId") || item.flowId || "wf-four";
  item.approval = workTypeApprovalChain(item).map((row) => ({ step: row.step, role: row.role }));
}

function openWorkTypeRowDialog(kind, item, idx, after) {
  const isNew = idx == null;
  let title = "编辑";
  let fields = "";
  if (kind === "qual") {
    const row = isNew ? { role: "作业人", cert: "", required: true } : item.quals[idx];
    title = isNew ? "新增资格" : "编辑资格";
    fields = `
      <div class="form-fields">
        <label>角色
          <select class="field" id="wt-role">${WORK_TICKET_ROLES.map((name) => (
            `<option${name === row.role ? " selected" : ""}>${name}</option>`
          )).join("")}</select>
        </label>
        <label>证照<input class="field" id="wt-cert" value="${esc(row.cert)}"></label>
        <label class="span-2 check-inline">必持
          <span><input type="checkbox" id="wt-req"${row.required !== false ? " checked" : ""}> 提交时校验资格</span>
        </label>
      </div>`;
  } else if (kind === "measure") {
    const row = isNew ? { name: "", fills: [] } : item.measures[idx];
    title = isNew ? "新增安全措施" : "编辑安全措施";
    fields = `
      <div class="form-fields">
        <label class="span-2">措施内容<textarea class="field" id="wt-m-name" rows="3">${esc(row.name)}</textarea></label>
        <label class="span-2">填空项（逗号分隔）<input class="field" id="wt-m-fills" value="${esc((row.fills || []).join("，"))}" placeholder="如 盲板块数，灭火器个数"></label>
      </div>`;
  } else {
    const value = isNew ? "" : item.riskOptions[idx];
    title = isNew ? "新增风险项" : "编辑风险项";
    fields = `<label class="modal-field">风险辨识<input class="field" id="wt-risk" value="${esc(value)}"></label>`;
  }
  openAlertDialog(title, fields, (dlg, err) => {
    if (kind === "qual") {
      const role = dlg.querySelector("#wt-role")?.value || "";
      const cert = dlg.querySelector("#wt-cert")?.value.trim() || "";
      if (!role) { err.hidden = false; err.textContent = "请选择角色。"; return false; }
      const row = { role, cert, required: dlg.querySelector("#wt-req")?.checked !== false };
      if (isNew) item.quals.push(row); else item.quals[idx] = row;
    } else if (kind === "measure") {
      const name = dlg.querySelector("#wt-m-name")?.value.trim() || "";
      if (!name) { err.hidden = false; err.textContent = "请填写措施内容。"; return false; }
      const fills = (dlg.querySelector("#wt-m-fills")?.value || "").split(/[,，]/).map((s) => s.trim()).filter(Boolean);
      const row = { name, fills };
      if (isNew) item.measures.push(row); else item.measures[idx] = row;
    } else {
      const name = dlg.querySelector("#wt-risk")?.value.trim() || "";
      if (!name) { err.hidden = false; err.textContent = "请填写风险项。"; return false; }
      if (isNew) item.riskOptions.push(name); else item.riskOptions[idx] = name;
    }
    persist();
    after();
    return true;
  });
}

function openWorkFlowStepDialog(list, idx, after) {
  const isNew = idx == null;
  const row = isNew ? { step: "", role: workApprovalRoleOptions()[0] || "" } : { ...list[idx] };
  const roles = workApprovalRoleOptions();
  openAlertDialog(isNew ? "新增审批节点" : "编辑审批节点", `
    <div class="form-fields">
      <label>步骤<input class="field" id="wf-step" value="${esc(row.step)}" placeholder="如 作业单位意见"></label>
      <label>岗位
        <select class="field" id="wf-role">
          ${roles.map((name) => `<option${name === row.role ? " selected" : ""}>${esc(name)}</option>`).join("")}
        </select>
      </label>
    </div>
  `, (dlg, err) => {
    const step = dlg.querySelector("#wf-step")?.value.trim() || "";
    if (!step) {
      err.hidden = false;
      err.textContent = "请填写步骤。";
      return false;
    }
    const next = { step, role: dlg.querySelector("#wf-role")?.value || "" };
    if (isNew) list.push(next);
    else list[idx] = next;
    after();
    return true;
  });
}

function openWorkFlowPickerDialog(item, after) {
  ensureWorkFlows();
  const flows = data.workFlows || [];
  if (!flows.length) {
    openAlertDialog("更换审批流", `<p class="meta">暂无审批流，请先在审批流配置中新增。</p>`, () => true, "知道了");
    return;
  }
  const applyPick = (id, backdrop) => {
    if (!id || id === item.flowId) {
      backdrop?.remove();
      return;
    }
    item.flowId = id;
    item.approval = workTypeApprovalChain(item).map((row) => ({ step: row.step, role: row.role }));
    persist();
    if (typeof after === "function") after();
    backdrop?.remove();
  };
  openAlertDialog("更换审批流", `
    <p class="meta">当前：${esc(workFlowName(item.flowId))} · 点击一行即可切换并保存</p>
    <div class="table-wrap work-cfg-table">
      <table>
        <thead>
          <tr><th>名称</th><th>状态</th><th>节点</th></tr>
        </thead>
        <tbody>
          ${flows.map((flow) => `
            <tr class="${flow.id === item.flowId ? "is-on" : ""}" data-wf-pick="${esc(flow.id)}" role="button" tabindex="0">
              <td>${esc(flow.name)}<span class="meta"> · ${esc(flow.id)}</span></td>
              <td><span class="dot ${workStatusTone(flow.enabled !== false ? "启用" : "停用")}">${flow.enabled !== false ? "启用" : "停用"}</span></td>
              <td>${(flow.steps || []).length} 步 · ${esc((flow.steps || []).map((s) => s.role).filter(Boolean).join(" → ") || "—")}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>
    <p class="meta"><a class="text-link" href="#/t7/work-flows">审批流配置</a> 中可编辑节点。</p>
  `, () => true, "关闭", true, (dlg) => {
    const backdrop = dlg.closest(".modal-backdrop");
    const onRow = (row) => {
      const id = row.dataset.wfPick;
      if (!id) return;
      dlg.querySelectorAll("[data-wf-pick]").forEach((tr) => tr.classList.toggle("is-on", tr.dataset.wfPick === id));
      applyPick(id, backdrop);
    };
    dlg.querySelectorAll("[data-wf-pick]").forEach((row) => {
      row.addEventListener("click", () => onRow(row));
      row.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          onRow(row);
        }
      });
    });
  });
}

function showWorkFlowEditor(item, after) {
  const draftSteps = (item.steps || []).map((row) => ({ ...row }));
  const renderSteps = (host) => {
    if (!host) return;
    host.innerHTML = `
      <div class="table-wrap work-cfg-table">
        <table>
          <thead><tr><th>序号</th><th>步骤</th><th>岗位</th><th>操作</th></tr></thead>
          <tbody>
            ${draftSteps.length ? draftSteps.map((row, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${esc(row.step)}</td>
                <td>${esc(row.role || "—")}</td>
                <td class="table-actions">
                  <button type="button" class="btn btn-sm" data-step-up data-idx="${i}" ${i === 0 ? "disabled" : ""}>上移</button>
                  <button type="button" class="btn btn-sm" data-step-down data-idx="${i}" ${i === draftSteps.length - 1 ? "disabled" : ""}>下移</button>
                  <button type="button" class="btn btn-sm" data-step-edit data-idx="${i}">编辑</button>
                  <button type="button" class="btn btn-sm btn-ghost" data-step-del data-idx="${i}">删除</button>
                </td>
              </tr>`).join("") : `<tr><td colspan="4" class="meta">未配置节点</td></tr>`}
          </tbody>
        </table>
      </div>
      <button type="button" class="btn btn-sm" data-step-add style="margin-top:8px">新增节点</button>
    `;
    host.querySelector("[data-step-add]")?.addEventListener("click", () => {
      openWorkFlowStepDialog(draftSteps, null, () => renderSteps(host));
    });
    host.querySelectorAll("[data-step-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openWorkFlowStepDialog(draftSteps, Number(btn.dataset.idx), () => renderSteps(host));
      });
    });
    host.querySelectorAll("[data-step-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        draftSteps.splice(Number(btn.dataset.idx), 1);
        renderSteps(host);
      });
    });
    host.querySelectorAll("[data-step-up]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.idx);
        if (i < 1) return;
        [draftSteps[i - 1], draftSteps[i]] = [draftSteps[i], draftSteps[i - 1]];
        renderSteps(host);
      });
    });
    host.querySelectorAll("[data-step-down]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.idx);
        if (i >= draftSteps.length - 1) return;
        [draftSteps[i], draftSteps[i + 1]] = [draftSteps[i + 1], draftSteps[i]];
        renderSteps(host);
      });
    });
  };
  openAlertDialog(`编辑审批流 · ${item.name}`, `
    <div class="form-fields">
      <label>审批流 ID<input class="field" name="id" value="${esc(item.id)}" readonly></label>
      <label>名称<input class="field" name="name" value="${esc(item.name)}"></label>
      <label>状态
        <select class="field" name="enabled">
          <option value="启用"${item.enabled !== false ? " selected" : ""}>启用</option>
          <option value="停用"${item.enabled === false ? " selected" : ""}>停用</option>
        </select>
      </label>
    </div>
    <h3 class="form-section">审批节点</h3>
    <div id="wf-step-host"></div>
  `, (dlg, err) => {
    const name = formVal(dlg, "name").trim();
    if (!name) {
      err.hidden = false;
      err.textContent = "请填写名称。";
      return false;
    }
    if (!draftSteps.length) {
      err.hidden = false;
      err.textContent = "请至少配置一个审批节点。";
      return false;
    }
    item.name = name;
    item.enabled = formVal(dlg, "enabled") !== "停用";
    item.steps = draftSteps.map((row) => ({ step: row.step, role: row.role }));
    workTypesUsingFlow(item.id).forEach((type) => {
      type.approval = item.steps.map((row) => ({ ...row }));
    });
    persist();
    after?.();
    return true;
  }, "保存", true, (dlg) => {
    dlg.querySelector(".modal")?.classList.add("work-modal");
    renderSteps(dlg.querySelector("#wf-step-host"));
  });
}

function renderWorkFlowsConfig(root, focusId) {
  let focus = focusId;
  let filter = "全部";

  function paint() {
    ensureWorkFlows();
    const all = data.workFlows || [];
    const rows = all.filter((row) => {
      if (filter === "启用") return row.enabled !== false;
      if (filter === "停用") return row.enabled === false;
      return true;
    });
    if (focus && !rows.some((row) => row.id === focus)) focus = rows[0]?.id || null;
    root.innerHTML = `
      <div class="sys-stack">
        <div class="filter-row alert-toolbar">
          <div class="alert-status-chips">
            ${["全部", "启用", "停用"].map((name) => (
              `<button type="button" class="chip${filter === name ? " is-on" : ""}" data-filter="${name}">${name}</button>`
            )).join("")}
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>审批流 ID</th>
                <th>名称</th>
                <th>状态</th>
                <th>节点</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length ? rows.map((row) => `
                  <tr class="${row.id === focus ? "is-on" : ""}" data-id="${row.id}">
                    <td class="meta">${esc(row.id)}</td>
                    <td><button type="button" class="cell-link" data-id="${row.id}">${esc(row.name)}</button></td>
                    <td><span class="dot ${workStatusTone(row.enabled !== false ? "启用" : "停用")}">${row.enabled !== false ? "启用" : "停用"}</span></td>
                    <td>${(row.steps || []).length} 步 · ${esc((row.steps || []).map((s) => s.role).filter(Boolean).join(" → ") || "—")}</td>
                    <td class="table-actions">
                      <button type="button" class="btn" data-edit-row="${row.id}">编辑</button>
                      <button type="button" class="btn btn-ghost" data-del-row="${row.id}">删除</button>
                    </td>
                  </tr>`).join("") : `<tr><td colspan="5" class="meta">没有审批流</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="sys-table-toolbar">
          <button type="button" class="btn" data-add>新增审批流</button>
          <a class="btn" href="#/t7/work-types">作业类型</a>
          <a class="btn" href="#/t5/tickets">作业工单</a>
        </div>
        <p class="meta">作业类型引用审批流 ID；工单提交时按当时节点生成签批，已开工单不随流变更改写。</p>
      </div>
    `;
    root.querySelectorAll("[data-filter]").forEach((btn) => {
      btn.addEventListener("click", () => { filter = btn.dataset.filter; paint(); });
    });
    root.querySelectorAll("tr[data-id]").forEach((row) => {
      row.addEventListener("click", (ev) => {
        if (ev.target.closest("[data-edit-row]") || ev.target.closest("[data-del-row]") || ev.target.closest("a")) return;
        focus = row.dataset.id;
        paint();
      });
    });
    root.querySelectorAll(".cell-link[data-id]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        focus = btn.dataset.id;
        paint();
      });
    });
    root.querySelectorAll("[data-edit-row]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const item = workFlowById(btn.dataset.editRow);
        if (item) showWorkFlowEditor(item, paint);
      });
    });
    root.querySelectorAll("[data-del-row]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const id = btn.dataset.delRow;
        const used = workTypesUsingFlow(id);
        if (used.length) {
          openAlertDialog("无法删除", `<p class="meta">该审批流已被 ${esc(used.map((t) => t.name).join("、"))} 引用。</p>`, () => true, "知道了");
          return;
        }
        data.workFlows = (data.workFlows || []).filter((row) => row.id !== id);
        persist();
        if (focus === id) focus = null;
        paint();
      });
    });
    root.querySelector("[data-add]")?.addEventListener("click", () => {
      const fresh = {
        id: `wf-${Date.now()}`,
        name: "新审批流",
        enabled: true,
        steps: WORK_APPROVAL_DEFAULT.map((row) => ({ ...row }))
      };
      data.workFlows = data.workFlows || [];
      data.workFlows.push(fresh);
      persist();
      focus = fresh.id;
      showWorkFlowEditor(fresh, paint);
    });
  }
  paint();
}

function renderWorkTypesConfig(root, focusId) {
  let focus = focusId;
  let filter = "全部";

  function paint() {
    ensureWorkCatalog();
    const all = data.workTypes || [];
    const rows = all.filter((row) => {
      if (filter === "启用") return row.enabled;
      if (filter === "停用") return !row.enabled;
      return true;
    });
    const item = rows.find((row) => row.id === focus) || all.find((row) => row.id === focus) || rows[0] || all[0];
    focus = item?.id;
    root.innerHTML = `
      <div class="filter-row tight">
        ${["全部", "启用", "停用"].map((name) => (
          `<button type="button" class="chip${filter === name ? " is-on" : ""}" data-filter="${name}">${name}</button>`
        )).join("")}
      </div>
      <div class="alert-layout">
        <aside class="alert-list-panel">
          ${(rows.length ? rows : all).map((row) => `
            <button type="button" class="alert-card${row.id === item?.id ? " is-on" : ""}" data-id="${row.id}">
              <div class="row">
                <strong>${esc(row.name)}</strong>
                <span class="dot ${workStatusTone(row.enabled ? "启用" : "停用")}">${row.enabled ? "启用" : "停用"}</span>
              </div>
              <p class="meta">${esc(row.code)} · ${esc(workTypeLevelsText(row))} · ${esc(workFlowName(row.flowId))}</p>
            </button>
          `).join("")}
          <div class="list-foot">
            <button type="button" class="btn" data-add>新增</button>
          </div>
        </aside>
        <section class="alert-detail">
          ${item ? renderWorkTypeDetail(item) : ""}
        </section>
      </div>
    `;
    root.querySelectorAll("[data-filter]").forEach((btn) => {
      btn.addEventListener("click", () => { filter = btn.dataset.filter; paint(); });
    });
    root.querySelectorAll("[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => { focus = btn.dataset.id; paint(); });
    });
    root.querySelector("[data-add]")?.addEventListener("click", () => {
      const fresh = normalizeWorkType({
        id: `wt-${Date.now()}`,
        code: "NEW",
        name: "新作业类型",
        level: 2,
        levelSet: "normal",
        levels: [1, 2, 3],
        enabled: false,
        zoneIds: [],
        quals: [{ role: "作业人", cert: "", required: true }],
        measures: [],
        flowId: "wf-four",
        approval: WORK_APPROVAL_DEFAULT.map((row) => ({ ...row })),
        riskOptions: [],
        validityHours: 8,
        night: false,
        extras: {},
        suppressEventTypes: []
      });
      data.workTypes = data.workTypes || [];
      data.workTypes.push(fresh);
      persist();
      focus = fresh.id;
      paint();
    });
    root.querySelector("[data-save]")?.addEventListener("click", () => {
      workTypeFromForm(root, item);
      applyWorkAlertSuppression();
      persist();
      paint();
    });
    const bindRow = (attr, kind, list) => {
      root.querySelector(`[${attr}-add]`)?.addEventListener("click", () => openWorkTypeRowDialog(kind, item, null, paint));
      root.querySelectorAll(`[${attr}-edit]`).forEach((btn) => {
        btn.addEventListener("click", () => openWorkTypeRowDialog(kind, item, Number(btn.dataset.idx), paint));
      });
      root.querySelectorAll(`[${attr}-del]`).forEach((btn) => {
        btn.addEventListener("click", () => {
          list.splice(Number(btn.dataset.idx), 1);
          persist();
          paint();
        });
      });
    };
    if (item) {
      bindRow("data-qual", "qual", item.quals);
      bindRow("data-measure", "measure", item.measures);
      bindRow("data-risk", "risk", item.riskOptions);
      root.querySelector("[data-change-flow]")?.addEventListener("click", () => {
        openWorkFlowPickerDialog(item, paint);
      });
    }
  }
  paint();
}

function renderWorkTypeDetail(item) {
  const extras = workExtras(item);
  const allowed = workTypeAllowedLevels(item);
  const selected = new Set(workTypeLevels(item).map(Number));
  const qualBody = (item.quals || []).length
    ? item.quals.map((row, i) => `
        <tr>
          <td>${esc(row.role)}</td>
          <td>${esc(row.cert || "—")}</td>
          <td>${row.required === false ? "否" : "是"}</td>
          <td class="table-actions">
            <button type="button" class="btn btn-sm" data-qual-edit data-idx="${i}">编辑</button>
            <button type="button" class="btn btn-sm btn-ghost" data-qual-del data-idx="${i}">删除</button>
          </td>
        </tr>`).join("")
    : `<tr><td colspan="4" class="meta">未配置资格</td></tr>`;
  const measureBody = (item.measures || []).length
    ? item.measures.map((row, i) => `
        <tr>
          <td>${esc(row.name)}${(row.fills || []).length ? `<div class="meta">填空：${esc(row.fills.join("、"))}</div>` : ""}</td>
          <td class="table-actions">
            <button type="button" class="btn btn-sm" data-measure-edit data-idx="${i}">编辑</button>
            <button type="button" class="btn btn-sm btn-ghost" data-measure-del data-idx="${i}">删除</button>
          </td>
        </tr>`).join("")
    : `<tr><td colspan="2" class="meta">未配置措施</td></tr>`;
  const riskBody = (item.riskOptions || []).length
    ? item.riskOptions.map((name, i) => `
        <tr>
          <td>${esc(name)}</td>
          <td class="table-actions">
            <button type="button" class="btn btn-sm" data-risk-edit data-idx="${i}">编辑</button>
            <button type="button" class="btn btn-sm btn-ghost" data-risk-del data-idx="${i}">删除</button>
          </td>
        </tr>`).join("")
    : `<tr><td colspan="2" class="meta">未配置风险项</td></tr>`;
  return `
    <div class="detail-head">
      <div><h2>${esc(item.name)}</h2></div>
      <div class="detail-head-tags">
        <span class="dot ${workStatusTone(item.enabled ? "启用" : "停用")}">${item.enabled ? "启用" : "停用"}</span>
        <span class="lvl lvl-${item.level || 2}">${esc(workTypeLevelsText(item))}</span>
      </div>
    </div>
    <div class="white-card">
      <div class="form-fields">
        <label>名称<input class="field" name="name" value="${esc(item.name || "")}"></label>
        <label>编码<input class="field" name="code" value="${esc(item.code || "")}"></label>
        <label>状态
          <select class="field" name="enabled">
            <option${item.enabled ? " selected" : ""}>启用</option>
            <option${!item.enabled ? " selected" : ""}>停用</option>
          </select>
        </label>
        <label>默认可作业时长（小时）<input class="field" name="validityHours" type="number" value="${item.validityHours || 8}"></label>
        <label>等级上限时长（小时）<input class="field" name="maxHours" type="number" value="${extras.maxHours || item.validityHours || 8}"></label>
        <label class="span-2">允许等级
          <span class="check-row">${allowed.map((n) => (
            `<label><input type="checkbox" name="wlevel" value="${n}"${selected.has(n) ? " checked" : ""}>${workLevelLabel(n)}</label>`
          )).join("")}</span>
        </label>
        <label class="check-inline">夜间
          <span><input type="checkbox" name="night"${item.night ? " checked" : ""}> 允许夜间作业</span>
        </label>
        <label class="check-inline">动火人
          <span><input type="checkbox" name="extra-hot"${extras.hotWorker ? " checked" : ""}> 需要动火人及特种作业证</span>
        </label>
        <label class="check-inline">气体分析
          <span><input type="checkbox" name="extra-gas"${extras.gas ? " checked" : ""}> 开票须气体分析</span>
        </label>
        <label class="check-inline">作业高度
          <span><input type="checkbox" name="extra-height"${extras.heightRequired ? " checked" : ""}> 开票须填写高度</span>
        </label>
        <label>合格标准<input class="field" name="gasStandard" value="${esc(extras.gasStandard || "")}"></label>
        <label>LEL 上限（%）<input class="field" name="gasLimit" type="number" value="${extras.gasLimit || 20}"></label>
        <label class="span-2">分析要求<textarea class="field" name="gasHint" rows="2">${esc(extras.gasHint || "")}</textarea></label>
      </div>
    </div>
    <div class="white-card">
      <h3>重点监管区域</h3>
      <div class="check-row is-stack">
        ${(data.zones || []).map((zone) => `
          <label><input type="checkbox" name="zone" value="${zone.id}"${(item.zoneIds || []).includes(zone.id) ? " checked" : ""}>${esc(zone.name)}</label>
        `).join("")}
      </div>
    </div>
    <div class="white-card">
      <h3>有效票期间抑制的告警</h3>
      <p class="meta">工单已签发且在时间窗内时，勾选类型不进告警中心；识别复核仍留痕。定位闯入还需人员在票上。</p>
      <div class="check-row is-stack">
        ${workSuppressableEventTypes().map((et) => `
          <label><input type="checkbox" name="suppress-et" value="${esc(et.name)}"${(item.suppressEventTypes || []).includes(et.name) ? " checked" : ""}>${esc(et.name)} · ${esc(et.source)}</label>
        `).join("") || `<span class="meta">暂无定位/视频事件类型</span>`}
      </div>
    </div>
    ${workCfgTable("人员与资格", ["角色", "证照", "必持"], qualBody, "data-qual-add")}
    ${workCfgTable("安全措施", ["措施"], measureBody, "data-measure-add")}
    <div class="white-card">
      <div class="zone-admission-toolbar">
        <div>
          <h3>审批节点预览</h3>
          <p class="meta">审批流：${esc(workFlowName(item.flowId))}</p>
        </div>
        <button type="button" class="btn btn-sm" data-change-flow>更换审批流</button>
      </div>
      <div class="table-wrap work-cfg-table">
        <table>
          <thead><tr><th>序号</th><th>步骤</th><th>岗位</th></tr></thead>
          <tbody>
            ${workTypeApprovalChain(item).length ? workTypeApprovalChain(item).map((row, i) => `
              <tr><td>${i + 1}</td><td>${esc(row.step)}</td><td>${esc(row.role || "—")}</td></tr>
            `).join("") : `<tr><td colspan="3" class="meta">未绑定审批流</td></tr>`}
          </tbody>
        </table>
      </div>
      <p class="meta">节点在审批流配置中维护；通过「更换审批流」切换引用，已开工单不受影响。</p>
    </div>
    ${workCfgTable("风险辨识选项", ["风险"], riskBody, "data-risk-add")}
    <div class="form-foot">
      <button type="button" class="btn btn-primary" data-save>保存</button>
      <a class="btn" href="#/t5/tickets">作业工单</a>
    </div>
  `;
}

function workOrderMatches(order, filter, query, typeId) {
  if (typeId && order.typeId !== typeId) return false;
  if (filter === "在办" && !WORK_OPEN.includes(order.status)) return false;
  if (filter === "待审批" && order.status !== "待审批") return false;
  if (filter === "已归档" && order.status !== "已归档") return false;
  const q = (query || "").trim().toLowerCase();
  if (!q) return true;
  const people = (order.people || []).map((p) => p.name).join(" ");
  const hay = `${order.id} ${workOrderTypeLabel(order)} ${workOrderPlace(order)} ${people} ${order.applicant || ""} ${order.content || ""}`.toLowerCase();
  return hay.includes(q);
}

function workOrderIsEditing(item, editingIds) {
  if (!item) return false;
  if (item.status === "新建") return true;
  return (item.status === "草稿" || item.status === "已驳回")
    && (editingIds?.has(item.id) ?? false);
}

function workCanEditBody(item, editingIds) {
  return workOrderIsEditing(item, editingIds);
}

function workOrderSubmitErrors(item) {
  const type = workTypeById(item.typeId);
  const extras = workExtras(type);
  const errors = [];
  if (!item.content) errors.push("请填写作业内容。");
  if (!item.applyOrg) errors.push("请填写申请单位。");
  if (!item.applicant) errors.push("请填写申请人。");
  if (!firstPersonByRole(item, "作业负责人") && !item.applicant) errors.push("请指定作业负责人。");
  if (!peopleByRole(item, "作业人").length) errors.push("请指定作业人。");
  if (!firstPersonByRole(item, "监护人") && !item.guardian) errors.push("请指定监护人。");
  if (extras.hotWorker && !item.hotSpot) errors.push("请填写动火设施/部位。");
  if (extras.heightRequired && !item.height) errors.push("请填写作业高度。");
  const maxH = extras.maxHours || type?.validityHours;
  if (maxH && workHoursBetween(item.start, item.end) > maxH + 0.01) errors.push(`作业时长不能超过 ${maxH} 小时。`);
  (item.people || []).forEach((row) => {
    const rule = (type?.quals || []).find((q) => q.role === row.roleOnTicket);
    if (rule?.required && (row.qual === "缺失" || row.qual === "过期")) {
      errors.push(`${row.roleOnTicket} ${row.name} 的${rule.cert || "资格"}为${row.qual}。`);
    }
  });
  (item.measures || []).forEach((row, i) => {
    if (!row.result) errors.push(`安全措施第 ${i + 1} 条未确认。`);
    else if (!row.confirmer) errors.push(`安全措施第 ${i + 1} 条缺少确认人。`);
  });
  if (extras.gas) {
    if (!(item.gasChecks || []).length) errors.push("请至少录入一条作业前气体分析。");
    else {
      const limit = Number(extras.gasLimit) || 20;
      (item.gasChecks || []).forEach((row, i) => {
        const lel = Number(row.lel);
        if (!Number.isFinite(lel)) errors.push(`气体分析第 ${i + 1} 条缺少 %LEL。`);
        else if (lel >= limit) errors.push(`气体分析第 ${i + 1} 条 %LEL 未达合格标准（<${limit}%）。`);
        if (!row.sampler) errors.push(`气体分析第 ${i + 1} 条缺少采样人。`);
      });
    }
  }
  if (!item.briefBy || !parseBriefedToNames(item.briefedTo).length) {
    errors.push("请完成安全交底（交底人、接受交底人）。");
  }
  return errors;
}

function createNewWorkOrder() {
  const types = (data.workTypes || []).filter((row) => row.enabled);
  if (!types.length) {
    openAlertDialog("创建工单", `<p class="meta">没有已启用的作业类型，请先在作业类型中启用。</p>`, () => true, "知道了");
    return null;
  }
  const type = types[0];
  const levels = workTypeLevels(type);
  const draft = {
    id: nextWorkOrderId(),
    status: "新建",
    typeId: type.id,
    level: levels.includes(Number(type.level)) ? Number(type.level) : (levels[0] || 1),
    measures: cloneWorkMeasures(type),
    approvals: cloneWorkApprovals(type),
    risks: [],
    riskNote: "",
    gasChecks: [],
    gasStandard: workExtras(type).gasStandard || "",
    zoneIds: [],
    place: "",
    plant: "",
    start: workNowStamp(8, 0),
    end: workNowStamp(16, 0),
    content: "",
    hotSpot: "",
    applyOrg: workOrgOptions()[0] || "",
    applicant: "",
    people: [],
    timeline: [{ status: "新建", time: nowTime(), actor: data.operator?.name || "值班员", note: "创建工单" }]
  };
  data.workOrders = data.workOrders || [];
  data.workOrders.unshift(draft);
  persist();
  return draft.id;
}

function renderWorkOrders(root, route) {
  ensureWorkCatalog();
  let focus = route.focus;
  const fromHash = /(?:\?|&)filter=/.test(location.hash);
  let filter = (route.filter === "已归档" || route.filter === "待审批")
    ? route.filter
    : (fromHash && route.filter === "全部" ? "全部" : "在办");
  let query = "";
  let typeId = "";
  let woPeopleMounts = null;
  let workDetailTab = "info";
  let lastWorkFocus = null;
  const workOrderEditing = new Set();

  function list() {
    return (data.workOrders || []).filter((row) => workOrderMatches(row, filter, query, typeId));
  }

  function paint() {
    woPeopleMounts?.workerCtl?.destroy?.();
    woPeopleMounts?.hotCtl?.destroy?.();
    root._briefedCtl?.destroy?.();
    root._briefedCtl = null;
    woPeopleMounts = null;
    const rows = list();
    const item = rows.find((row) => row.id === focus) || rows[0] || null;
    focus = item?.id || null;
    if (focus !== lastWorkFocus) {
      workDetailTab = "info";
      lastWorkFocus = focus;
    }
    if (workDetailTab === "approve") workDetailTab = "info";
    const types = data.workTypes || [];
    root.innerHTML = `
      <div class="filter-row alert-toolbar">
        ${toolbarStatusFilterHtml("work-status-filter", filter, ["在办", "待审批", "已归档", "全部"])}
        <span class="alert-toolbar-sep" aria-hidden="true"></span>
        <label class="cam-field-label"><span class="cam-field-label-name">作业类型</span>
          <select class="field alert-q-field" id="work-type-filter">
            <option value="">全部</option>
            ${types.map((row) => `<option value="${row.id}"${row.id === typeId ? " selected" : ""}>${esc(row.name)}</option>`).join("")}
          </select>
        </label>
        <label class="cam-field-label"><span class="cam-field-label-name">关键词</span>
          <input type="search" class="field alert-q-field" id="work-q" value="${esc(query)}" autocomplete="off">
        </label>
        <button type="button" class="btn btn-primary" data-search>搜索</button>
        <button type="button" class="btn btn-ghost alert-q-reset" data-reset${query || typeId ? "" : " disabled"}>重置</button>
        <button type="button" class="btn" data-work-create>创建工单</button>
        <button type="button" class="btn" data-export>导出</button>
      </div>
      <div class="alert-layout">
        <aside class="alert-list-panel">
          ${rows.length ? rows.map((row) => `
            <button type="button" class="alert-card${row.id === item?.id ? " is-on" : ""}" data-id="${row.id}">
              <div class="row">
                <strong>${esc(row.id)}</strong>
                <span class="dot ${workStatusTone(row.status)}">${esc(row.status)}</span>
              </div>
              <p>${esc(workOrderTypeLabel(row))} · ${esc(workOrderPlace(row))}</p>
              <p class="meta">${esc(row.start || "")}</p>
            </button>
          `).join("") : `<p class="meta" style="padding:16px">无匹配工单</p>`}
        </aside>
        <section class="alert-detail">
          ${item ? renderWorkOrderDetail(item, workDetailTab, workOrderEditing) : ""}
        </section>
      </div>
    `;
    root.querySelector("#work-status-filter")?.addEventListener("change", (event) => {
      filter = event.currentTarget.value || "在办";
      paint();
    });
    root.querySelectorAll("[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => { focus = btn.dataset.id; paint(); });
    });
    root.querySelectorAll("[data-work-detail-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        workDetailTab = btn.dataset.workDetailTab || "info";
        switchWorkDetailTab(root, workDetailTab);
      });
    });
    const runSearch = () => {
      query = root.querySelector("#work-q")?.value || "";
      typeId = root.querySelector("#work-type-filter")?.value || "";
      paint();
    };
    root.querySelector("[data-search]")?.addEventListener("click", runSearch);
    root.querySelector("[data-reset]")?.addEventListener("click", () => {
      query = "";
      typeId = "";
      paint();
    });
    root.querySelector("#work-q")?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") runSearch();
    });
    root.querySelector("[data-work-create]")?.addEventListener("click", () => {
      const id = createNewWorkOrder();
      if (!id) return;
      focus = id;
      filter = "在办";
      workDetailTab = "info";
      paint();
    });
    root.querySelector("[data-export]")?.addEventListener("click", () => {
      openAlertDialog("导出工单", `<p class="meta">导出当前筛选 ${rows.length} 条为 CSV。</p>`, () => {
        exportWorkOrdersCsv(rows);
        return true;
      }, "导出");
    });
    const after = () => { applyWorkAlertSuppression(); persist(); paint(); };
    bindWorkOrderActions(root, item, after, workOrderEditing, () => { workDetailTab = "info"; });
    if (item && workCanEditBody(item, workOrderEditing)) {
      const host = root.querySelector(".alert-detail");
      bindWorkOrderDetailForm(host, item, after);
      woPeopleMounts = host?._woSelects || null;
    }
  }
  paint();
}

function exportWorkOrdersCsv(rows) {
  const headers = ["编号", "类型", "等级", "状态", "分厂", "区域", "内容", "开始", "结束", "申请单位", "申请人", "作业人"];
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    const cells = [
      row.id,
      workTypeName(row.typeId),
      workLevelLabel(row.level),
      row.status,
      row.plant || "",
      workOrderPlace(row),
      row.content || "",
      row.start || "",
      row.end || "",
      row.applyOrg || "",
      row.applicant || "",
      peopleByRole(row, "作业人").join("、")
    ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`);
    lines.push(cells.join(","));
  });
  const blob = new Blob([`\ufeff${lines.join("\n")}`], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `作业工单-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function workOrderActions(item, editingIds) {
  const editing = workOrderIsEditing(item, editingIds);
  if (item.status === "新建") return [["save", "保存", true], ["void", "作废", false]];
  if (item.status === "草稿") {
    if (editing) return [["save", "保存", true], ["cancel-edit", "取消", false], ["void", "作废", false]];
    return [["edit", "编辑", false], ["submit", "提交审批", true], ["void", "作废", false]];
  }
  if (item.status === "待审批") return [["flow", "审批流", true]];
  if (item.status === "已签发") return [["start", "开始作业", true]];
  if (item.status === "作业中") {
    const extras = workExtras(workTypeById(item.typeId));
    const rows = [["close-ask", "申请验收", true]];
    if (extras.gas) rows.unshift(["gas", "补录气体分析", false]);
    return rows;
  }
  if (item.status === "待销项") return [["archive", "完工验收", true]];
  if (item.status === "已驳回") {
    if (editing) return [["save", "保存", true], ["cancel-edit", "取消", false], ["void", "作废", false]];
    return [["edit", "编辑", false], ["submit", "重新提交", true], ["void", "作废", false]];
  }
  return [];
}

function bindWorkOrderActions(root, item, after, editingIds, onEditStart) {
  if (!item) return;
  const canBody = workCanEditBody(item, editingIds);
  root.querySelectorAll("[data-risk]").forEach((input) => {
    input.addEventListener("change", () => {
      if (!canBody) return;
      item.risks = [...root.querySelectorAll("[data-risk]:checked")].map((el) => el.value);
      persist();
    });
  });
  root.querySelector("[data-risk-note]")?.addEventListener("change", (event) => {
    if (!canBody) return;
    item.riskNote = event.currentTarget.value.trim();
    persist();
  });
  ["briefBy", "guardian", "content", "height"].forEach((key) => {
    root.querySelector(`[data-field="${key}"]`)?.addEventListener("change", (event) => {
      if (!canBody) return;
      item[key] = event.currentTarget.value.trim();
      persist();
    });
  });
  root._briefedCtl?.destroy?.();
  const briefedHost = root.querySelector("#wo-briefed-select");
  if (canBody && briefedHost) {
    root._briefedCtl = mountWorkPeopleSelect(briefedHost, {
      value: parseBriefedToNames(item.briefedTo),
      placeholder: "搜索并选择接受交底人",
      onChange: (names) => {
        item.briefedTo = formatBriefedTo(names);
        persist();
      }
    });
  } else {
    root._briefedCtl = null;
  }
  const flushBriefedTo = () => {
    if (root._briefedCtl) item.briefedTo = formatBriefedTo(root._briefedCtl.getValue());
  };
  root.querySelectorAll("[data-measure-result]").forEach((el) => {
    el.addEventListener("change", () => {
      if (!canBody) return;
      const idx = Number(el.dataset.measureResult);
      if (item.measures?.[idx]) item.measures[idx].result = el.value;
      persist();
    });
  });
  root.querySelectorAll("[data-measure-confirmer]").forEach((el) => {
    el.addEventListener("change", () => {
      if (!canBody) return;
      const idx = Number(el.dataset.measureConfirmer);
      if (item.measures?.[idx]) item.measures[idx].confirmer = el.value.trim();
      persist();
    });
  });
  root.querySelectorAll("[data-measure-fill]").forEach((el) => {
    el.addEventListener("change", () => {
      if (!canBody) return;
      const idx = Number(el.dataset.measureFill);
      const key = el.dataset.fill;
      if (item.measures?.[idx]) {
        item.measures[idx].fills = item.measures[idx].fills || {};
        item.measures[idx].fills[key] = el.value.trim();
      }
      persist();
    });
  });
  const typeForGas = workTypeById(item.typeId);
  const gasExtras = workExtras(typeForGas);
  const gasEditable = gasExtras.gas && (canBody || item.status === "作业中");
  const syncGasField = (idx, key, value) => {
    if (!gasEditable || !item.gasChecks?.[idx]) return;
    item.gasChecks[idx][key] = value;
    persist();
  };
  root.querySelector("[data-gas-add]")?.addEventListener("click", () => {
    if (!gasEditable) return;
    item.gasChecks = item.gasChecks || [];
    item.gasChecks.push({
      time: workNowStamp(new Date().getHours(), new Date().getMinutes()),
      lel: "",
      sampler: data.operator?.name || ""
    });
    persist();
    after();
  });
  root.querySelectorAll("[data-gas-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!gasEditable) return;
      const idx = Number(btn.dataset.gasDel);
      if (!Number.isFinite(idx)) return;
      item.gasChecks.splice(idx, 1);
      persist();
      after();
    });
  });
  root.querySelectorAll("[data-gas-time]").forEach((el) => {
    el.addEventListener("change", () => syncGasField(Number(el.dataset.gasTime), "time", el.value.trim()));
  });
  root.querySelectorAll("[data-gas-lel]").forEach((el) => {
    el.addEventListener("change", () => syncGasField(Number(el.dataset.gasLel), "lel", el.value.trim()));
  });
  root.querySelectorAll("[data-gas-sampler]").forEach((el) => {
    el.addEventListener("change", () => syncGasField(Number(el.dataset.gasSampler), "sampler", el.value));
  });
  root.querySelectorAll("[data-work-act]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const act = btn.dataset.workAct;
      if (act === "edit") {
        editingIds.add(item.id);
        onEditStart?.();
        after();
        return;
      }
      if (act === "cancel-edit") {
        editingIds.delete(item.id);
        after();
        return;
      }
      if (act === "save") {
        flushBriefedTo();
        const host = root.querySelector(".alert-detail");
        const fail = syncWorkOrderFromDetailForm(host, item, after, true);
        if (fail) return;
        if (item.status === "新建") {
          item.status = "草稿";
          pushWorkLog(item, "草稿", "保存工单");
        } else {
          pushWorkLog(item, item.status, "保存修改");
        }
        editingIds.delete(item.id);
        persist();
        after();
        return;
      }
      if (act === "submit") {
        if (item.status === "新建") {
          openAlertDialog("无法提交", `<p class="meta">请先保存工单，状态变为草稿后再提交审批。</p>`, () => true, "知道了");
          return;
        }
        if (workOrderIsEditing(item, editingIds)) {
          flushBriefedTo();
          const host = root.querySelector(".alert-detail");
          const fail = syncWorkOrderFromDetailForm(host, item, after, true);
          if (fail) return;
          editingIds.delete(item.id);
        }
        const errors = workOrderSubmitErrors(item);
        if (errors.length) {
          openAlertDialog("无法提交", `<p class="meta">${errors.map(esc).join("<br>")}</p>`, () => true, "知道了");
          return;
        }
        item.status = "待审批";
        item.approvals = (item.approvals || []).map((row) => ({ ...row, result: "", opinion: "", actor: "", time: "" }));
        pushWorkLog(item, "待审批", "提交审批");
        after();
        return;
      }
      if (act === "flow") {
        showWorkApprovalFlowDialog(item, after);
        return;
      }
      if (act === "approve") {
        showWorkApproveDialog(item, false, after);
        return;
      }
      if (act === "reject") {
        showWorkApproveDialog(item, true, after);
        return;
      }
      if (act === "start") {
        item.status = "作业中";
        pushWorkLog(item, "作业中", "开始作业");
        after();
        return;
      }
      if (act === "gas") {
        item.gasChecks = item.gasChecks || [];
        item.gasChecks.push({
          time: workNowStamp(new Date().getHours(), new Date().getMinutes()),
          lel: "",
          sampler: data.operator?.name || ""
        });
        persist();
        after();
        return;
      }
      if (act === "close-ask") {
        item.status = "待销项";
        pushWorkLog(item, "待销项", "申请验收");
        after();
        return;
      }
      if (act === "archive") {
        showWorkAcceptDialog(item, after);
        return;
      }
      if (act === "void") {
        item.status = "已作废";
        pushWorkLog(item, "已作废", "作废");
        after();
      }
    });
  });
}

function applyWorkApproval(item, reject, opinion, err) {
  const node = workPendingApproval(item);
  if (!node) return false;
  if (reject && !opinion) {
    if (err) {
      err.hidden = false;
      err.textContent = "请填写驳回意见。";
    }
    return false;
  }
  node.result = reject ? "驳回" : "同意";
  node.opinion = opinion || "同意";
  node.actor = data.operator?.name || "值班员";
  node.time = nowTime();
  if (reject) {
    item.status = "已驳回";
    pushWorkLog(item, "已驳回", `${node.step}驳回：${opinion}`);
  } else if (!workPendingApproval(item)) {
    item.status = "已签发";
    pushWorkLog(item, "已签发", `${node.step}通过，签发`);
  } else {
    const next = workPendingApproval(item);
    pushWorkLog(item, "待审批", `${node.step}通过，待${next.step}`);
  }
  persist();
  return true;
}

function workApprovalFlowStepsHtml(item, pending) {
  const rows = item.approvals || [];
  if (!rows.length) return `<p class="meta">未配置审批链</p>`;
  return `
    <ol class="work-approve-steps" aria-label="审批流转">
      ${rows.map((row) => {
        let state = "待签";
        let cls = "";
        if (row.result === "同意") {
          state = "已通过";
          cls = "is-done";
        } else if (row.result === "驳回") {
          state = "已驳回";
          cls = "is-reject";
        } else if (pending && row === pending) {
          state = "待签";
          cls = "is-now";
        }
        return `
          <li class="${cls}">
            <div class="work-approve-step-title">${esc(row.step)}</div>
            <p class="meta work-approve-step-role">审批岗位 · ${esc(row.role)}</p>
            <span class="dot ${workStatusTone(row.result === "驳回" ? "已驳回" : row.result === "同意" ? "合格" : "待审批")}">${state}</span>
          </li>`;
      }).join("")}
    </ol>
  `;
}

function workApprovalRecordsHtml(item) {
  const rows = item.approvals || [];
  if (!rows.length) return `<p class="meta">尚无签批记录。</p>`;
  const signed = rows.filter((row) => row.result);
  if (!signed.length) return `<p class="meta">审批尚未开始，签批后将在此展示。</p>`;
  return `
    <ul class="log work-approve-log">
      ${signed.slice().reverse().map((row) => `
        <li>
          <b>${esc(row.time || "—")}</b>
          ${esc(row.step)} · ${esc(row.role)}
          <span class="dot ${workStatusTone(row.result === "同意" ? "合格" : "已驳回")}">${esc(row.result)}</span>
          <span>签字 ${esc(row.actor || "—")}${row.opinion ? ` · 意见：${esc(row.opinion)}` : ""}</span>
        </li>
      `).join("")}
    </ul>
  `;
}

function showWorkApprovalFlowDialog(item, after) {
  const pending = workPendingApproval(item);
  const canApprove = workCanApproveNode(item, pending);
  const opRole = data.operator?.role || "当前用户";
  openAlertDialog("审批流", `
    <div class="work-flow-dialog">
      <p class="meta">${esc(item.id)} · ${pending ? `当前节点 ${esc(pending.step)}（${esc(pending.role)}）` : "签批已完成"}</p>
      ${workApprovalFlowStepsHtml(item, pending)}
      ${canApprove ? `
        <label class="modal-field">意见
          <textarea id="wo-opinion" class="field" rows="3">同意</textarea>
        </label>
      ` : pending ? `<p class="meta">当前节点需「${esc(pending.role)}」审批，您的岗位为「${esc(opRole)}」，仅可查看。</p>` : ""}
    </div>
  `, (dlg, err) => {
    if (!canApprove) return true;
    const opinion = dlg.querySelector("#wo-opinion")?.value.trim() || "";
    if (!applyWorkApproval(item, false, opinion, err)) return false;
    after();
    return true;
  }, canApprove ? "通过" : "关闭", true, (dlg) => {
    dlg.querySelector(".modal")?.classList.add("work-modal");
    if (!canApprove) {
      const cancel = dlg.querySelector("[data-modal-cancel]");
      if (cancel) cancel.hidden = true;
      return;
    }
    const rejectBtn = document.createElement("button");
    rejectBtn.type = "button";
    rejectBtn.className = "btn";
    rejectBtn.textContent = "驳回";
    rejectBtn.addEventListener("click", () => {
      const err = dlg.querySelector("#modal-err");
      const opinion = dlg.querySelector("#wo-opinion")?.value.trim() || "";
      if (!applyWorkApproval(item, true, opinion, err)) return;
      after();
      dlg.remove();
    });
    dlg.querySelector("[data-modal-ok]")?.before(rejectBtn);
  });
}

function showWorkApproveDialog(item, reject, after) {
  const node = workPendingApproval(item);
  if (!node) return;
  openAlertDialog(reject ? "驳回工单" : "审批通过", `
    <p class="meta">${esc(item.id)} · 当前节点 ${esc(node.step)}（${esc(node.role)}）</p>
    <label class="modal-field">意见
      <textarea id="wo-opinion" class="field" rows="3">${reject ? "" : "同意"}</textarea>
    </label>
  `, (dlg, err) => {
    const opinion = dlg.querySelector("#wo-opinion")?.value.trim() || "";
    if (!applyWorkApproval(item, reject, opinion, err)) return false;
    after();
    return true;
  });
}

function workGasChecksTableHtml(item, editable) {
  const rows = item.gasChecks || [];
  const people = workPeopleOptions();
  const samplerSelect = (value, idx) => `
    <select class="field" data-gas-sampler="${idx}">
      <option value="">请选择</option>
      ${people.map((p) => `<option value="${esc(p.name)}"${p.name === value ? " selected" : ""}>${esc(p.name)}</option>`).join("")}
    </select>`;
  if (!editable) {
    return rows.length ? rows.map((row) => `
      <tr><td>${esc(row.time)}</td><td>${esc(row.lel)}</td><td>${esc(row.sampler)}</td></tr>
    `).join("") : `<tr><td colspan="3" class="meta">尚未录入</td></tr>`;
  }
  return rows.length ? rows.map((row, idx) => `
    <tr>
      <td><input class="field" data-gas-time="${idx}" value="${esc(row.time || "")}" autocomplete="off"></td>
      <td><input class="field" data-gas-lel="${idx}" value="${esc(row.lel ?? "")}" inputmode="decimal" autocomplete="off"></td>
      <td>${samplerSelect(row.sampler, idx)}</td>
      <td class="td-act"><button type="button" class="btn btn-ghost btn-sm" data-gas-del="${idx}">删除</button></td>
    </tr>
  `).join("") : `<tr><td colspan="4" class="meta">尚未录入，请点击「新增」。</td></tr>`;
}

function showWorkGasDialog(item, after) {
  const people = workPeopleOptions();
  openAlertDialog("补录气体分析", `
    <div class="form-fields">
      <label>分析时间<input class="field" id="wo-gas-time" value="${esc(workNowStamp(new Date().getHours(), new Date().getMinutes()))}"></label>
      <label>%LEL<input class="field" id="wo-gas-lel" value=""></label>
      <label class="span-2">采样人
        <select class="field" id="wo-gas-sampler">
          ${people.map((row) => `<option value="${esc(row.name)}">${esc(row.name)}</option>`).join("")}
        </select>
      </label>
    </div>
  `, (dlg, err) => {
    const lel = dlg.querySelector("#wo-gas-lel")?.value.trim() || "";
    const sampler = dlg.querySelector("#wo-gas-sampler")?.value || "";
    if (!lel || !sampler) {
      err.hidden = false;
      err.textContent = "请填写 %LEL 和采样人。";
      return false;
    }
    item.gasChecks = item.gasChecks || [];
    item.gasChecks.push({
      time: dlg.querySelector("#wo-gas-time")?.value.trim() || workNowStamp(),
      lel,
      sampler
    });
    pushWorkLog(item, item.status, `气体分析 ${lel}%LEL · ${sampler}`);
    persist();
    after();
    return true;
  });
}

function showWorkAcceptDialog(item, after) {
  const people = workPeopleOptions();
  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${nowTime()}`;
  openAlertDialog("完工验收", `
    <div class="form-fields">
      <label>验收时间<input class="field" id="wo-acc-time" value="${esc(stamp)}"></label>
      <label>验收人
        <select class="field" id="wo-acc-person">
          ${people.map((row) => `<option value="${esc(row.name)}"${row.name === (item.applicant || data.operator?.name) ? " selected" : ""}>${esc(row.name)}</option>`).join("")}
        </select>
      </label>
    </div>
  `, (dlg) => {
    item.status = "已归档";
    item.acceptedAt = dlg.querySelector("#wo-acc-time")?.value.trim() || stamp;
    item.acceptor = dlg.querySelector("#wo-acc-person")?.value || data.operator?.name;
    item.closedAt = item.acceptedAt;
    pushWorkLog(item, "已归档", `完工验收 · ${item.acceptor}`);
    persist();
    after();
    return true;
  });
}

function switchWorkDetailTab(root, tab) {
  const key = tab || "info";
  root.querySelectorAll("[data-work-detail-tab]").forEach((btn) => {
    const on = btn.dataset.workDetailTab === key;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-selected", on ? "true" : "false");
  });
  root.querySelectorAll("[data-work-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.workPanel !== key;
  });
}

function renderWorkOrderDetail(item, detailTab, editingIds) {
  const tab = !detailTab || detailTab === "approve" ? "info" : detailTab;
  const type = workTypeById(item.typeId);
  const extras = workExtras(type);
  const step = workOrderStepIndex(item);
  const measures = item.measures || [];
  const canBody = workCanEditBody(item, editingIds);
  const showInfoForm = workOrderIsEditing(item, editingIds);
  const draftTypes = (data.workTypes || []).filter((row) => row.enabled || row.id === item.typeId);
  const actions = workOrderActions(item, editingIds);
  const opts = workPeopleOptions();
  const tabCount = (n) => (n ? `<span class="detail-tab-count">${n}</span>` : "");
  const timelineCount = (item.timeline || []).length;
  const approvalSignedCount = (item.approvals || []).filter((row) => row.result).length;
  const personSelect = (value, attr) => `
    <select class="field" ${attr} ${canBody ? "" : "disabled"}>
      ${opts.map((row) => `<option value="${esc(row.name)}"${row.name === value ? " selected" : ""}>${esc(row.name)}</option>`).join("")}
    </select>`;
  const panelHidden = (name) => (tab !== name ? " hidden" : "");
  const actionButtons = actions.length ? actions.map(([act, label, primary]) => (
    `<button type="button" class="btn${primary ? " btn-primary" : ""}" data-work-act="${act}">${label}</button>`
  )).join("") : "";
  return `
    <div class="detail-head work-order-detail-head">
      <div class="detail-head-main">
        <div class="work-order-title-row">
          <h2>${esc(item.id)} · ${esc(workOrderTypeLabel(item))}</h2>
          <span class="dot ${workStatusTone(item.status)}">${esc(item.status)}</span>
        </div>
        <p class="meta">${esc(workOrderPlace(item))} · ${esc(item.start || "")}–${esc((item.end || "").slice(-5))}</p>
      </div>
      ${actionButtons ? `
        <div class="detail-head-side work-order-head-side">
          <div class="work-order-actions" role="toolbar" aria-label="工单操作">${actionButtons}</div>
        </div>
      ` : ""}
    </div>
    <ol class="steps">
      ${WORK_FLOW.map((name, index) => `<li class="${step < 0 ? "" : index < step ? "is-done" : index === step ? "is-now" : ""}">${name}</li>`).join("")}
    </ol>
    <div class="detail-tabs" role="tablist">
      <button type="button" class="detail-tab${tab === "info" ? " is-on" : ""}" role="tab" aria-selected="${tab === "info"}" data-work-detail-tab="info">基本信息</button>
      <button type="button" class="detail-tab${tab === "safety" ? " is-on" : ""}" role="tab" aria-selected="${tab === "safety"}" data-work-detail-tab="safety">风险措施</button>
      <button type="button" class="detail-tab${tab === "log" ? " is-on" : ""}" role="tab" aria-selected="${tab === "log"}" data-work-detail-tab="log">记录${tabCount(timelineCount + approvalSignedCount)}</button>
    </div>
    <div class="detail-tab-panel work-order-detail-panels">
      <div data-work-panel="info"${panelHidden("info")}>
        <div class="white-card">
          <h3>工单信息</h3>
          ${showInfoForm ? workOrderFormHtml(item, draftTypes) : workOrderInfoReadHtml(item, extras)}
        </div>
      </div>
      <div data-work-panel="safety"${panelHidden("safety")}>
        <div class="white-card">
          <h3>风险辨识</h3>
          <div class="check-row">
            ${(type?.riskOptions || []).map((name) => `
              <label><input type="checkbox" data-risk value="${esc(name)}"${(item.risks || []).includes(name) ? " checked" : ""}${canBody ? "" : " disabled"}> ${esc(name)}</label>
            `).join("") || `<span class="meta">该类型未配置风险项</span>`}
          </div>
          ${canBody ? `<textarea class="field" data-risk-note rows="2" placeholder="补充说明">${esc(item.riskNote || "")}</textarea>` : (item.riskNote ? `<p class="meta">${esc(item.riskNote)}</p>` : "")}
        </div>
        <div class="white-card">
          <h3>安全措施</h3>
          ${measures.length ? `
            <div class="table-wrap">
              <table class="work-measure-grid">
                <thead><tr><th>序号</th><th>安全措施</th><th>是/否</th><th>确认人</th></tr></thead>
                <tbody>
                  ${measures.map((row, idx) => `
                    <tr>
                      <td>${idx + 1}</td>
                      <td>
                        <div class="work-measure-name">${esc(row.name)}</div>
                        ${Object.keys(row.fills || {}).length ? `
                          <div class="work-measure-fills">
                            ${Object.keys(row.fills).map((key) => (
                              canBody
                                ? `<label>${esc(key)}<input class="field" data-measure-fill="${idx}" data-fill="${esc(key)}" value="${esc(row.fills[key] || "")}"></label>`
                                : (row.fills[key] ? `<span class="meta">${esc(key)} ${esc(row.fills[key])}</span>` : "")
                            )).join("")}
                          </div>` : ""}
                      </td>
                      <td>
                        ${canBody ? `
                          <select class="field" data-measure-result="${idx}">
                            <option value="">—</option>
                            ${WORK_MEASURE_RESULTS.map((name) => `<option${row.result === name ? " selected" : ""}>${name}</option>`).join("")}
                          </select>` : `<span class="dot ${workStatusTone(row.result)}">${esc(row.result || "—")}</span>`}
                      </td>
                      <td>${canBody ? `<input class="field" data-measure-confirmer="${idx}" value="${esc(row.confirmer || "")}">` : esc(row.confirmer || "—")}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          ` : `<p class="meta">该类型未配置措施模板。</p>`}
        </div>
        ${extras.gas || (item.gasChecks || []).length ? `
          <div class="white-card">
            <div class="zone-admission-toolbar">
              <h3>气体分析</h3>
              ${extras.gas && (canBody || item.status === "作业中") ? `<button type="button" class="btn btn-sm btn-primary" data-gas-add>新增</button>` : ""}
            </div>
            <p class="meta">${esc(item.gasStandard || extras.gasStandard || "")}${extras.gasHint ? ` · ${esc(extras.gasHint)}` : ""}</p>
            <div class="table-wrap">
              <table class="work-gas-grid">
                <thead><tr>
                  <th>分析时间</th><th>%LEL</th><th>采样人</th>
                  ${extras.gas && (canBody || item.status === "作业中") ? "<th>操作</th>" : ""}
                </tr></thead>
                <tbody>
                  ${workGasChecksTableHtml(item, extras.gas && (canBody || item.status === "作业中"))}
                </tbody>
              </table>
            </div>
          </div>
        ` : ""}
        <div class="white-card">
          <h3>安全交底</h3>
          ${canBody ? `
            <div class="work-info-grid work-brief-grid">
              <label>交底人${personSelect(item.briefBy, `data-field="briefBy"`)}</label>
              <label>监护人${personSelect(item.guardian, `data-field="guardian"`)}</label>
              <div class="span-all wo-people-field">
                <span class="wo-people-label">接受交底人</span>
                <div id="wo-briefed-select" class="wo-people-select"></div>
              </div>
            </div>
          ` : `
            <div class="work-info-grid work-brief-grid">
              ${workInfoFact("交底人", esc(item.briefBy || ""))}
              ${workInfoFact("监护人", esc(item.guardian || ""))}
              ${workInfoFact("接受交底人", esc(item.briefedTo || ""), true)}
            </div>
          `}
        </div>
      </div>
      <div data-work-panel="log"${panelHidden("log")}>
        <div class="white-card">
          <h3>审批记录</h3>
          ${workApprovalRecordsHtml(item)}
        </div>
        <div class="white-card">
          <h3>时间线</h3>
          <ul class="log">
            ${(item.timeline || []).slice().reverse().map((row) => (
              `<li><b>${esc(row.time)}</b> ${esc(row.status)} · ${esc(row.actor)}<span>${esc(row.note || "")}</span></li>`
            )).join("")}
          </ul>
        </div>
      </div>
    </div>
  `;
}

function antdMultiSelectReady() {
  return typeof React !== "undefined"
    && typeof ReactDOM !== "undefined"
    && typeof antd !== "undefined"
    && antd.Select;
}

function workPeopleSelectOptions() {
  return workPeopleOptions().map((row) => ({
    value: row.name,
    label: row.job ? `${row.name} · ${row.job}` : row.name
  }));
}

function workPersonCertSuffix(name, certNames) {
  const names = certNames || [];
  for (const cert of names) {
    const found = lookupWorkCert(name, cert);
    if (found.qual === "合格" || found.certNo) return ` · ${cert}${found.certNo ? ` ${found.certNo}` : ""}`;
  }
  const row = (data.workCerts || []).find((item) => (
    item.person === name && item.status === "合格" && (names.length === 0 || names.includes(item.cert))
  ));
  if (row?.cert) return ` · ${row.cert}${row.no ? ` ${row.no}` : ""}`;
  return "";
}

function workHotPeopleSelectOptions() {
  return workPeopleOptions().map((row) => {
    const certTag = workPersonCertSuffix(row.name, ["特种作业资格证", "动火作业证"]);
    return {
      value: row.name,
      label: `${row.name}${certTag}`
    };
  });
}

function WorkPeopleAntSelect(props) {
  const { Select } = antd;
  const [value, setValue] = React.useState(props.value || []);
  const handleChange = (vals) => {
    const next = vals || [];
    setValue(next);
    props.onChange(next);
  };
  return React.createElement(Select, {
    mode: "multiple",
    allowClear: true,
    showSearch: true,
    optionFilterProp: "label",
    optionLabelProp: "value",
    placeholder: props.placeholder,
    value,
    onChange: handleChange,
    options: props.options,
    style: { width: "100%" },
    dropdownStyle: { zIndex: 2000 },
    getPopupContainer: () => document.body,
    notFoundContent: "无匹配人员"
  });
}

function mountWorkPeopleSelect(host, { value, placeholder, onChange, options: optionsOverride }) {
  const state = { value: [...(value || [])] };
  const options = optionsOverride || workPeopleSelectOptions();
  if (!host) {
    return { getValue: () => state.value.slice(), destroy() {} };
  }
  if (!antdMultiSelectReady()) {
    host.innerHTML = `
      <select class="field" multiple size="${Math.min(6, Math.max(3, options.length))}">
        ${options.map((row) => (
          `<option value="${esc(row.value)}"${state.value.includes(row.value) ? " selected" : ""}>${esc(row.label)}</option>`
        )).join("")}
      </select>`;
    const sel = host.querySelector("select");
    sel?.addEventListener("change", () => {
      state.value = [...(sel.selectedOptions || [])].map((opt) => opt.value);
      onChange?.(state.value.slice());
    });
    return {
      getValue: () => [...(sel?.selectedOptions || [])].map((opt) => opt.value),
      destroy() { host.innerHTML = ""; }
    };
  }
  const root = ReactDOM.createRoot(host);
  root.render(React.createElement(WorkPeopleAntSelect, {
    value: state.value,
    options,
    placeholder,
    onChange: (next) => {
      state.value = next;
      onChange?.(next);
    }
  }));
  return {
    getValue: () => state.value.slice(),
    destroy() {
      root.unmount();
    }
  };
}

function bindWorkPeopleSelects(host, item, { modalCleanup } = {}) {
  const workerCtl = mountWorkPeopleSelect(host.querySelector("#wo-worker-select"), {
    value: peopleByRole(item || {}, "作业人"),
    placeholder: "搜索并选择作业人",
    onChange: host._woOnPeopleChange
  });
  const hotCtl = mountWorkPeopleSelect(host.querySelector("#wo-hot-select"), {
    value: peopleByRole(item || {}, "动火人"),
    placeholder: "搜索并选择动火人",
    onChange: host._woOnPeopleChange,
    options: workHotPeopleSelectOptions()
  });
  host._woSelects = { workerCtl, hotCtl };
  if (!modalCleanup) return;
  const origRemove = host.remove.bind(host);
  host.remove = () => {
    try {
      workerCtl.destroy();
      hotCtl.destroy();
    } catch (_) { /* ignore */ }
    host._woSelects = null;
    origRemove();
  };
}

function collectWorkPeople(type, applicant, supervisor, workers, guardian, hotWorkers) {
  const extras = workExtras(type);
  const rows = [];
  const push = (name, role) => {
    if (!name) return;
    if (rows.some((row) => row.name === name && row.roleOnTicket === role)) return;
    rows.push(workPersonSnapshot(name, role, type));
  };
  push(applicant, "申请人");
  push(supervisor, "作业负责人");
  workers.forEach((name) => push(name, "作业人"));
  push(guardian, "监护人");
  if (extras.hotWorker) (hotWorkers.length ? hotWorkers : workers).forEach((name) => push(name, "动火人"));
  return rows;
}

function fillWorkOrderFromDialog(host, item, type) {
  const zoneId = host.querySelector("#wo-zone")?.value;
  const workers = host._woSelects?.workerCtl?.getValue() || [];
  const hotWorkers = host._woSelects?.hotCtl?.getValue() || [];
  const applicant = host.querySelector("#wo-applicant")?.value || "";
  const supervisor = host.querySelector("#wo-supervisor")?.value || "";
  const guardian = host.querySelector("#wo-guardian")?.value || item.guardian || "";
  item.typeId = type.id;
  item.level = Number(host.querySelector("#wo-level")?.value);
  item.plant = plantName(zoneById(zoneId)?.plant) || "";
  item.zoneIds = zoneId ? [zoneId] : [];
  item.place = zoneById(zoneId)?.name || "";
  item.start = host.querySelector("#wo-start")?.value || "";
  item.end = host.querySelector("#wo-end")?.value || "";
  item.content = host.querySelector("#wo-content")?.value.trim() || "";
  item.applyOrg = host.querySelector("#wo-org")?.value || "";
  item.applicant = applicant;
  item.height = host.querySelector("#wo-height")?.value.trim() || "";
  item.hotSpot = workExtras(type).hotWorker
    ? (host.querySelector("#wo-hot-spot")?.value.trim() || "")
    : "";
  item.people = collectWorkPeople(type, applicant, supervisor, workers, guardian, hotWorkers);
  item.briefBy = supervisor || applicant;
  item.guardian = guardian;
  if (!parseBriefedToNames(item.briefedTo).length && workers.length) {
    item.briefedTo = formatBriefedTo(workers);
  }
  return { zoneId, workers };
}

function syncWorkOrderFromDetailForm(host, item, after, submit) {
  if (!host?.querySelector("#wo-type")) return false;
  const type = workTypeById(host.querySelector("#wo-type")?.value);
  if (!type) {
    if (submit) {
      openAlertDialog("无法提交", `<p class="meta">请选择作业类型。</p>`, () => true, "知道了");
      return true;
    }
    return false;
  }
  const prevType = item.typeId;
  const { zoneId, workers } = fillWorkOrderFromDialog(host, item, type);
  if (submit && !zoneId) {
    openAlertDialog("无法提交", `<p class="meta">请选择区域。</p>`, () => true, "知道了");
    return true;
  }
  if (submit && !workers.length) {
    openAlertDialog("无法提交", `<p class="meta">请选择作业人。</p>`, () => true, "知道了");
    return true;
  }
  const typeChanged = prevType !== type.id;
  const measuresMismatch = (item.measures || []).length !== (type.measures || []).length;
  if (typeChanged || measuresMismatch) {
    item.measures = cloneWorkMeasures(type);
    item.approvals = cloneWorkApprovals(type);
    item.gasStandard = workExtras(type).gasStandard || "";
    after();
    return false;
  }
  persist();
  return false;
}

function bindWorkOrderDetailForm(host, item, after) {
  if (!host?.querySelector("#wo-type")) return;
  const levelEl = host.querySelector("#wo-level");
  if (levelEl) levelEl.dataset.keep = String(item.level ?? "");
  host._woOnPeopleChange = () => syncWorkOrderFromDetailForm(host, item, after, false);
  bindWorkOrderFormSync(host, item.typeId, item.zoneIds?.[0]);
  bindWorkPeopleSelects(host, item);
  const onField = () => syncWorkOrderFromDetailForm(host, item, after, false);
  ["#wo-type", "#wo-level", "#wo-zone", "#wo-org", "#wo-applicant", "#wo-supervisor", "#wo-start", "#wo-end", "#wo-content", "#wo-height", "#wo-hot-spot"].forEach((sel) => {
    host.querySelector(sel)?.addEventListener("change", onField);
  });
  host.querySelector("#wo-content")?.addEventListener("input", onField);
}

function workInfoFact(label, valueHtml, wide) {
  const empty = !valueHtml || valueHtml === "—";
  return `
    <div class="work-info-item${wide ? " span-all" : ""}">
      <span class="work-info-k">${label}</span>
      <span class="work-info-v${empty ? " is-empty" : ""}">${empty ? "—" : valueHtml}</span>
    </div>`;
}

function workOrderInfoReadHtml(item, extras) {
  const place = workOrderPlace(item);
  const placeText = item.plant && place && place !== "—" ? `${item.plant} · ${place}` : (item.plant || place || "");
  const timeText = [item.start, item.end].filter(Boolean).join(" — ");
  const acceptText = item.acceptedAt ? `${item.acceptedAt}${item.acceptor ? ` · ${item.acceptor}` : ""}` : "";
  const supervisor = firstPersonByRole(item, "作业负责人");
  const workers = peopleByRole(item, "作业人").join("、");
  const hotWorkers = peopleByRole(item, "动火人").map((name) => (
    `${name}${workPersonCertSuffix(name, ["特种作业资格证", "动火作业证"])}`
  )).join("、");
  const typeHtml = `<a class="text-link" href="#/t7/work-types?id=${encodeURIComponent(item.typeId)}">${esc(workTypeName(item.typeId))}</a>`;
  return `
    <div class="work-order-info">
      <p class="work-form-legend">作业安排</p>
      <div class="work-info-grid">
        ${workInfoFact("作业类型", typeHtml)}
        ${workInfoFact("作业等级", esc(workLevelLabel(item.level) || ""))}
        ${workInfoFact("作业区域", esc(placeText))}
        ${workInfoFact("申请单位", esc(item.applyOrg || ""))}
        ${workInfoFact("申请人", esc(item.applicant || ""))}
        ${workInfoFact("作业时间", esc(timeText))}
        ${acceptText ? workInfoFact("完工验收", esc(acceptText)) : ""}
        ${extras.heightRequired || item.height ? workInfoFact("作业高度", esc(item.height || "")) : ""}
        ${extras.hotWorker || item.hotSpot ? workInfoFact("动火设施/部位", esc(item.hotSpot || ""), true) : ""}
        ${workInfoFact("作业内容", esc(item.content || ""), true)}
      </div>
      <p class="work-form-legend">作业人员</p>
      <div class="work-info-grid">
        ${workInfoFact("作业负责人", esc(supervisor || item.applicant || ""))}
        ${workInfoFact("作业人", esc(workers), true)}
        ${hotWorkers ? workInfoFact("动火人", esc(hotWorkers), true) : ""}
      </div>
    </div>
  `;
}

function workOrderFormHtml(item, types) {
  const people = workPeopleOptions();
  const orgs = workOrgOptions();
  const typeId = item?.typeId || types[0]?.id;
  const extras = workExtras(workTypeById(typeId));
  const personOpts = (value) => [
    `<option value="">请选择</option>`,
    ...people.map((row) => (
      `<option value="${esc(row.name)}"${row.name === value ? " selected" : ""}>${esc(row.name)}${row.job ? ` · ${esc(row.job)}` : ""}</option>`
    ))
  ].join("");
  return `
    <div class="work-order-form">
      <p class="work-form-legend">作业安排</p>
      <div class="work-info-grid">
        <label>作业类型
          <select id="wo-type" class="field">${types.map((row) => (
            `<option value="${row.id}"${row.id === typeId ? " selected" : ""}>${esc(row.name)}</option>`
          )).join("")}</select>
        </label>
        <label>作业等级
          <select id="wo-level" class="field"></select>
        </label>
        <label>作业区域
          <select id="wo-zone" class="field"><option value="">请选择</option></select>
        </label>
        <label>申请单位
          <select id="wo-org" class="field">${orgs.map((name) => (
            `<option${name === (item?.applyOrg || "") ? " selected" : ""}>${esc(name)}</option>`
          )).join("")}</select>
        </label>
        <label>申请人
          <select id="wo-applicant" class="field">${personOpts(item?.applicant)}</select>
        </label>
        <label>开始时间<input id="wo-start" class="field" value="${esc(item?.start || workNowStamp(8, 0))}" autocomplete="off"></label>
        <label>结束时间<input id="wo-end" class="field" value="${esc(item?.end || workNowStamp(16, 0))}" autocomplete="off"></label>
        <label id="wo-height-wrap"${extras.heightRequired || item?.height ? "" : " hidden"}>作业高度
          <input id="wo-height" class="field" value="${esc(item?.height || "")}" placeholder="如 20m" autocomplete="off">
        </label>
        <label id="wo-hot-spot-wrap" class="span-all"${extras.hotWorker || item?.hotSpot ? "" : " hidden"}>动火设施/部位
          <input id="wo-hot-spot" class="field" value="${esc(item?.hotSpot || "")}" placeholder="如 2#储罐人孔法兰、配电间东侧电缆桥架" autocomplete="off">
        </label>
        <label class="span-all">作业内容<textarea id="wo-content" class="field" rows="3" placeholder="简述作业范围、对象与方式">${esc(item?.content || "")}</textarea></label>
      </div>
      <p class="work-form-legend">作业人员</p>
      <div class="work-info-grid">
        <label>作业负责人
          <select id="wo-supervisor" class="field">${personOpts(firstPersonByRole(item || {}, "作业负责人") || item?.applicant)}</select>
        </label>
        <div class="span-all wo-people-field">
          <span class="wo-people-label">作业人</span>
          <div id="wo-worker-select" class="wo-people-select"></div>
        </div>
        <div class="span-all wo-people-field" id="wo-hot-wrap" ${extras.hotWorker ? "" : "hidden"}>
          <span class="wo-people-label">动火人</span>
          <div id="wo-hot-select" class="wo-people-select"></div>
        </div>
      </div>
    </div>
  `;
}

function bindWorkOrderFormSync(dlg, selectedTypeId, selectedZoneId) {
  const typeEl = dlg.querySelector("#wo-type");
  const levelEl = dlg.querySelector("#wo-level");
  const zoneEl = dlg.querySelector("#wo-zone");
  const heightWrap = dlg.querySelector("#wo-height-wrap");
  const hotWrap = dlg.querySelector("#wo-hot-wrap");
  const hotSpotWrap = dlg.querySelector("#wo-hot-spot-wrap");
  const sync = () => {
    const type = workTypeById(typeEl.value);
    const extras = workExtras(type);
    const levels = workTypeLevels(type);
    levelEl.innerHTML = levels.map((n) => `<option value="${n}">${workLevelLabel(n)}</option>`).join("");
    const keepLevel = Number(levelEl.dataset.keep);
    const typeLevel = Number(type?.level);
    if (levels.includes(keepLevel)) levelEl.value = String(keepLevel);
    else if (levels.includes(typeLevel)) levelEl.value = String(typeLevel);
    const zoneIds = type?.zoneIds?.length ? type.zoneIds : (data.zones || []).map((z) => z.id);
    zoneEl.innerHTML = [
      `<option value="">请选择</option>`,
      ...zoneIds.map((id) => {
        const zone = zoneById(id);
        return `<option value="${id}"${id === selectedZoneId ? " selected" : ""}>${esc(zone?.name || id)}</option>`;
      })
    ].join("");
    if (heightWrap) heightWrap.hidden = !extras.heightRequired;
    if (hotWrap) hotWrap.hidden = !extras.hotWorker;
    if (hotSpotWrap) hotSpotWrap.hidden = !extras.hotWorker;
  };
  typeEl.addEventListener("change", sync);
  sync();
}

function showWorkOrderCreate(after) {
  const types = (data.workTypes || []).filter((row) => row.enabled);
  if (!types.length) {
    openAlertDialog("创建工单", `<p class="meta">没有已启用的作业类型。</p>`, () => true, "知道了");
    return;
  }
  openAlertDialog("创建工单", workOrderFormHtml(null, types), (dlg, err) => {
    const type = workTypeById(dlg.querySelector("#wo-type")?.value);
    if (!type) {
      err.hidden = false;
      err.textContent = "请选择作业类型。";
      return false;
    }
    const draft = { id: nextWorkOrderId(), status: "新建" };
    const { zoneId, workers } = fillWorkOrderFromDialog(dlg, draft, type);
    if (!zoneId) {
      err.hidden = false;
      err.textContent = "请选择区域。";
      return false;
    }
    if (!workers.length) {
      err.hidden = false;
      err.textContent = "请选择作业人。";
      return false;
    }
    draft.measures = cloneWorkMeasures(type);
    draft.approvals = cloneWorkApprovals(type);
    draft.risks = [];
    draft.riskNote = "";
    draft.gasChecks = [];
    draft.gasStandard = workExtras(type).gasStandard || "";
    draft.timeline = [{ status: "新建", time: nowTime(), actor: data.operator?.name || "值班员", note: "创建工单" }];
    data.workOrders = data.workOrders || [];
    data.workOrders.unshift(draft);
    persist();
    after(draft.id);
    return true;
  }, "创建", true, (dlg) => {
    dlg.querySelector(".modal")?.classList.add("work-modal");
    bindWorkOrderFormSync(dlg);
    bindWorkPeopleSelects(dlg, null, { modalCleanup: true });
  });
}

function showWorkOrderEdit(item, after) {
  const types = (data.workTypes || []).filter((row) => row.enabled || row.id === item.typeId);
  openAlertDialog("编辑工单", workOrderFormHtml(item, types), (dlg, err) => {
    const type = workTypeById(dlg.querySelector("#wo-type")?.value);
    const { zoneId, workers } = fillWorkOrderFromDialog(dlg, item, type);
    if (!type || !zoneId || !workers.length) {
      err.hidden = false;
      err.textContent = "请完整填写类型、区域和作业人。";
      return false;
    }
    if (item.measures.length !== (type.measures || []).length) item.measures = cloneWorkMeasures(type);
    if (item.approvals.length !== (type.approval || []).length) item.approvals = cloneWorkApprovals(type);
    persist();
    after();
    return true;
  }, "确认", true, (dlg) => {
    dlg.querySelector(".modal")?.classList.add("work-modal");
    const levelEl = dlg.querySelector("#wo-level");
    if (levelEl) levelEl.dataset.keep = String(item.level ?? "");
    bindWorkOrderFormSync(dlg, item.typeId, item.zoneIds?.[0]);
    bindWorkPeopleSelects(dlg, item, { modalCleanup: true });
  });
}

function reviewEvidenceItems(item) {
  const cam = data.cameras.find((c) => c.id === item.camera);
  const camName = cam ? (cam.mapLabel || cam.name) : cameraName(item.camera);
  const algo = aiAlgoLabel(item);
  const conf = item.confidence != null ? `置信度 ${item.confidence}%` : "";
  const t = item.time || "";
  return [
    { kind: "image", badge: "抓拍图片", title: item.type, cap: `${t} · 关键帧`, meta: [camName, algo, conf].filter(Boolean).join(" · ") },
    { kind: "video", badge: "抓拍视频", title: item.type, cap: `${t} · 前后 6s`, meta: [camName, "触发前后各 3 秒"].filter(Boolean).join(" · ") },
    { kind: "image", badge: "抓拍图片", title: item.type, cap: `${t} · 特写帧`, meta: [camName, "二次抓拍"].filter(Boolean).join(" · ") },
    { kind: "video", badge: "抓拍视频", title: item.type, cap: `${t} · 完整片段`, meta: [camName, "约 15 秒"].filter(Boolean).join(" · ") }
  ];
}

function reviewLiveCameras(item) {
  const list = [];
  const add = (cam) => {
    if (cam && !list.some((row) => row.id === cam.id)) list.push(cam);
  };
  add(data.cameras.find((c) => c.id === item.camera));
  nearbyCams(item.x, item.y).forEach(add);
  return list.slice(0, 6);
}

function renderAlertEvidenceDisplay(spec) {
  const kind = spec.kind === "video" ? "video" : "image";
  const badge = spec.badge || (kind === "video" ? "抓拍视频" : "抓拍图片");
  return `
    <div class="alert-evidence-thumb alert-evidence-thumb--${kind} alert-evidence-thumb--static" aria-label="${badge}">
      <span class="alert-evidence-thumb-media" aria-hidden="true">${kind === "video" ? '<span class="alert-evidence-play">▶</span>' : ""}</span>
      <span class="alert-evidence-thumb-badge">${badge}</span>
      <span class="alert-evidence-thumb-cap">${esc(spec.cap)}</span>
      <span class="alert-evidence-thumb-meta">${esc(spec.meta) || "—"}</span>
    </div>
  `;
}

function renderReviewShotStage(spec) {
  if (!spec) return `<div class="monitor is-off review-media-live"><span>无抓拍</span><b>暂无照片或视频</b></div>`;
  return `<div class="review-media-frame">${renderAlertEvidenceDisplay(spec)}</div>`;
}

function renderAiQueue(root, focusId) {
  let focus = focusId;
  let filter = "待办";
  let searchId = "";
  let searchType = "";
  let searchPlace = "";
  let searchCam = "";
  let draftId = "";
  let draftType = "";
  let draftPlace = "";
  let draftCam = "";
  let mediaMode = "shot";
  let shotIndex = 0;
  let liveCamId = "";
  let mediaFocusId = "";

  const rowsOf = () => videoEvents().filter((item) => {
    if (filter === "待办") return ["待复核", "待核查"].includes(item.status);
    if (filter === "真警") return item.status === "真警";
    if (filter === "误报") return item.status === "误报";
    if (filter === "已抑制") return item.status === "已抑制";
    return true;
  }).sort((a, b) => a.level - b.level);

  function applySearch() {
    searchId = draftId.trim();
    searchType = draftType.trim();
    searchPlace = draftPlace.trim();
    searchCam = draftCam.trim();
    paint();
  }

  function resetSearch() {
    searchId = searchType = searchPlace = searchCam = "";
    draftId = draftType = draftPlace = draftCam = "";
    paint();
  }

  function list() {
    return rowsOf().filter((row) => {
      if (searchId && !String(row.id).includes(searchId)) return false;
      if (searchType && !String(row.type || "").includes(searchType)) return false;
      if (searchPlace) {
        const blob = [row.place, row.plant].filter(Boolean).join(" ");
        if (!blob.includes(searchPlace)) return false;
      }
      if (searchCam) {
        const cam = (data.cameras || []).find((c) => c.id === row.camera);
        const blob = [row.camera, cam?.name, cam?.code].filter(Boolean).join(" ");
        if (!blob.includes(searchCam)) return false;
      }
      return true;
    });
  }

  function syncDraftFromDom() {
    if (!root.querySelector("#ai-q-id")) return;
    draftId = root.querySelector("#ai-q-id")?.value || "";
    draftType = root.querySelector("#ai-q-type")?.value || "";
    draftPlace = root.querySelector("#ai-q-place")?.value || "";
    draftCam = root.querySelector("#ai-q-cam")?.value || "";
  }

  function refresh(opts = {}) {
    if (opts.filter) filter = opts.filter;
    if (opts.focus) focus = opts.focus;
    paint();
    renderShell();
  }

  function paint() {
    syncDraftFromDom();
    const rows = list();
    let item = rows.find((row) => row.id === focus) || null;
    if (!item && focus) {
      item = videoEvents().find((row) => row.id === focus) || null;
    }
    if (!item) item = rows[0] || null;
    focus = item?.id || null;
    const cam = item ? data.cameras.find((row) => row.id === item.camera) : null;
    if (item?.id !== mediaFocusId) {
      mediaFocusId = item?.id || "";
      mediaMode = "shot";
      shotIndex = 0;
      liveCamId = item?.camera || "";
    }
    const shotSpecs = item ? reviewEvidenceItems(item) : [];
    if (shotIndex >= shotSpecs.length) shotIndex = Math.max(0, shotSpecs.length - 1);
    const liveCams = item ? reviewLiveCameras(item) : [];
    if (liveCamId && !liveCams.some((c) => c.id === liveCamId)) liveCamId = liveCams[0]?.id || item?.camera || "";
    const liveCam = liveCams.find((c) => c.id === liveCamId) || cam;
    const sceneCam = mediaMode === "live" ? liveCam : cam;
    const aiTypes = [...new Set([
      ...aiAlgos().map((row) => row.eventName),
      ...videoEvents().map((row) => row.type).filter(Boolean)
    ])];
    const aiPlaces = [...new Set(videoEvents().flatMap((row) => [row.place, row.plant].filter(Boolean)))];
    const aiCams = [...new Set(videoEvents().map((row) => row.camera).filter(Boolean))];
    root.innerHTML = `
      <div class="filter-row alert-toolbar">
        ${toolbarStatusFilterHtml("ai-status-filter", filter, ["待办", "全部", "真警", "误报", "已抑制"])}
        <span class="alert-toolbar-sep" aria-hidden="true"></span>
        <label class="cam-field-label"><span class="cam-field-label-name">编号</span>
          <input type="search" class="field alert-q-field" id="ai-q-id" value="${draftId.replace(/"/g, "&quot;")}" autocomplete="off">
        </label>
        <label class="cam-field-label"><span class="cam-field-label-name">类型</span>
          <input type="search" class="field alert-q-field" id="ai-q-type" value="${draftType.replace(/"/g, "&quot;")}" autocomplete="off" list="ai-type-hints">
        </label>
        <label class="cam-field-label"><span class="cam-field-label-name">区域</span>
          <input type="search" class="field alert-q-field" id="ai-q-place" value="${draftPlace.replace(/"/g, "&quot;")}" autocomplete="off" list="ai-place-hints">
        </label>
        <label class="cam-field-label"><span class="cam-field-label-name">摄像头</span>
          <input type="search" class="field alert-q-field" id="ai-q-cam" value="${draftCam.replace(/"/g, "&quot;")}" autocomplete="off" list="ai-cam-hints">
        </label>
        <button type="button" class="btn btn-primary alert-q-submit" id="ai-q-search">搜索</button>
        <button type="button" class="btn btn-ghost alert-q-reset" id="ai-q-reset"${searchId || searchType || searchPlace || searchCam || draftId || draftType || draftPlace || draftCam ? "" : " disabled"}>重置</button>
        <datalist id="ai-type-hints">${aiTypes.map((name) => `<option value="${name}">`).join("")}</datalist>
        <datalist id="ai-place-hints">${aiPlaces.map((name) => `<option value="${name}">`).join("")}</datalist>
        <datalist id="ai-cam-hints">${aiCams.map((name) => `<option value="${name}">`).join("")}</datalist>
      </div>
      <div class="review-layout">
        <div class="review-column">
          <h2 class="review-col-head">识别队列</h2>
          <aside class="alert-list-panel">
            ${rows.length ? rows.map((row) => `
              <button type="button" class="alert-card${row.id === item?.id ? " is-on" : ""}" data-ai="${row.id}">
                <div class="row">
                  <strong>${row.id}</strong>
                  <span class="lvl lvl-${row.level}">${LEVEL_NAME[row.level]}</span>
                </div>
                <p>${row.type} · ${row.place}</p>
                <p class="meta">${row.status} · 置信度 ${row.confidence}% · ${row.time}</p>
              </button>
            `).join("") : ""}
          </aside>
        </div>
        ${item ? `
          <div class="review-column review-column--media">
            <header class="review-media-head">
              <div class="review-media-tabs" role="tablist">
                <button type="button" class="btn btn-sm review-media-tab${mediaMode === "shot" ? " is-on" : ""}" data-review-mode="shot">抓拍</button>
                <button type="button" class="btn btn-sm review-media-tab${mediaMode === "live" ? " is-on" : ""}" data-review-mode="live">实时画面</button>
              </div>
              ${sceneCam ? `<a class="btn btn-sm" href="${overviewLinkageHref(sceneCam.id)}">三维场景</a>` : ""}
            </header>
            <section class="review-media-stage">
              ${mediaMode === "live"
                ? `<div class="review-media-frame review-media-live">${renderMonitor(liveCam, true)}</div>`
                : renderReviewShotStage(shotSpecs[shotIndex])}
            </section>
            ${mediaMode === "live" ? `
              <div class="review-cam-switch" role="tablist" aria-label="切换摄像头">
                ${liveCams.length ? liveCams.map((c) => (
                  `<button type="button" class="chip${c.id === liveCam?.id ? " is-on" : ""}" data-review-cam="${c.id}">${esc(c.mapLabel || c.name)}</button>`
                )).join("") : `<p class="meta">无关联摄像头</p>`}
              </div>
            ` : `
              <div class="review-shot-switch" aria-label="切换抓拍">
                <button type="button" class="btn btn-sm" data-review-shot-step="-1"${shotIndex <= 0 ? " disabled" : ""}>上一张</button>
                ${shotSpecs.map((spec, i) => (
                  `<button type="button" class="chip${i === shotIndex ? " is-on" : ""}" data-review-shot="${i}">${i + 1}</button>`
                )).join("")}
                <button type="button" class="btn btn-sm" data-review-shot-step="1"${shotIndex >= shotSpecs.length - 1 ? " disabled" : ""}>下一张</button>
                <span class="meta">第 ${shotSpecs.length ? shotIndex + 1 : 0} / ${shotSpecs.length} 张</span>
              </div>
            `}
          </div>
          <aside class="review-judge">
            <div class="review-judge-body">
              <div class="white-card flush judge-card">
                <h3>复核裁决</h3>
                <div class="detail-head judge-detail-head">
                  <strong class="judge-title">${item.id} · ${item.type}</strong>
                  <span class="lvl lvl-${item.level} lvl-sm">${LEVEL_NAME[item.level]}</span>
                </div>
                <dl class="kv review-facts">
                  <dt>位置</dt><dd>${esc([item.plant, item.place].filter(Boolean).join(" ") || "—")}</dd>
                  <dt>状态</dt><dd>${esc(item.status || "—")}</dd>
                  <dt>时间</dt><dd class="num">${esc(item.time || "—")}</dd>
                  <dt>摄像头</dt><dd>${cam ? `${cam.name} ${cam.online ? "在线" : "离线"}` : item.camera}${cam ? `　<a class="text-link" href="#/t7/cameras?id=${cam.id}">算法配置</a>` : ""}</dd>
                  <dt>识别算法</dt><dd>${aiAlgoLabel(item)}</dd>
                  <dt>定位精度</dt><dd>${item.precision}</dd>
                  <dt>识别编号</dt><dd>${item.id}${item.alertId ? `　已挂 ${item.alertId}` : "　尚未转正式告警"}</dd>
                  <dt>置信度</dt><dd>${item.confidence}%</dd>
                  ${item.fusionNote ? `<dt>融合</dt><dd>${item.fusionNote}</dd>` : ""}
                </dl>
                ${renderAiFieldBlock(item)}
                ${renderAiJudgeExtras(item)}
              </div>
            </div>
            ${(() => {
              const actions = aiButtons(item);
              if (!actions) return "";
              const verdict = item.status === "真警" || item.status === "误报";
              return `<div class="alert-actions${verdict ? " is-verdict" : ""}">${actions}</div>`;
            })()}
          </aside>
        ` : `<section class="review-empty"></section>`}
      </div>
    `;
    root.querySelector("#ai-status-filter")?.addEventListener("change", (event) => {
      filter = event.currentTarget.value || "待办";
      paint();
    });
    const onDraftInput = () => {
      syncDraftFromDom();
      const resetBtn = root.querySelector("#ai-q-reset");
      if (resetBtn) {
        const dirty = searchId || searchType || searchPlace || searchCam
          || draftId || draftType || draftPlace || draftCam;
        resetBtn.disabled = !dirty;
      }
    };
    ["#ai-q-id", "#ai-q-type", "#ai-q-place", "#ai-q-cam"].forEach((sel) => {
      root.querySelector(sel)?.addEventListener("input", onDraftInput);
    });
    root.querySelectorAll(".alert-q-field").forEach((field) => {
      field.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          applySearch();
        }
      });
    });
    root.querySelector("#ai-q-search")?.addEventListener("click", applySearch);
    root.querySelector("#ai-q-reset")?.addEventListener("click", resetSearch);
    root.querySelectorAll("[data-ai]").forEach((btn) => {
      btn.addEventListener("click", () => { focus = btn.dataset.ai; paint(); });
    });
    root.querySelectorAll("[data-review-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        mediaMode = btn.dataset.reviewMode === "live" ? "live" : "shot";
        paint();
      });
    });
    root.querySelectorAll("[data-review-shot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        shotIndex = Number(btn.dataset.reviewShot) || 0;
        paint();
      });
    });
    root.querySelectorAll("[data-review-shot-step]").forEach((btn) => {
      btn.addEventListener("click", () => {
        shotIndex = Math.max(0, Math.min(shotSpecs.length - 1, shotIndex + (Number(btn.dataset.reviewShotStep) || 0)));
        paint();
      });
    });
    root.querySelectorAll("[data-review-cam]").forEach((btn) => {
      btn.addEventListener("click", () => {
        liveCamId = btn.dataset.reviewCam;
        mediaMode = "live";
        paint();
      });
    });
    bindAiActions(root, item, refresh);
  }
  paint();
}

function aiButtons(item) {
  if (item.status === "已抑制") {
    return item.workOrderId ? `<a class="btn btn-primary" href="#/t5/tickets?id=${encodeURIComponent(item.workOrderId)}">查看作业工单</a>` : "";
  }
  if (item.status === "真警" || item.status === "误报") {
    return item.alertId ? `<a class="btn btn-primary" href="#/t2/alerts?id=${item.alertId}">查看正式告警</a>` : "";
  }
  if (item.status !== "待复核" && item.status !== "待核查") {
    return "";
  }
  const buttons = [
    `<button class="btn btn-primary" data-ai-act="true" data-id="${item.id}">真警，转正式告警</button>`,
    `<button class="btn" data-ai-act="false" data-id="${item.id}">误报</button>`
  ];
  if (item.status === "待复核") {
    buttons.push(`<button class="btn" data-ai-act="field" data-id="${item.id}">送现场确认</button>`);
  }
  return buttons.join("");
}

function renderAiJudgeExtras(item) {
  if (item.status === "待复核") return "";
  if (item.status === "待核查") {
    return `
      <label>说明
        <textarea id="ai-note" rows="3" placeholder="送现场确认的补充说明（可选）">${item.note || ""}</textarea>
      </label>
    `;
  }
  if (item.status === "误报") {
    return `
      <dl class="kv review-readonly">
        <dt>误报原因</dt><dd>${item.reason || "—"}</dd>
        <dt>说明</dt><dd>${item.note || "—"}</dd>
        <dt>复核人</dt><dd>${item.reviewer || "—"}</dd>
      </dl>
    `;
  }
  if (item.status === "已抑制") {
    return `
      <dl class="kv review-readonly">
        <dt>说明</dt><dd>${item.note || "有效作业票抑制升告警"}</dd>
        <dt>作业工单</dt><dd>${item.workOrderId ? `<a class="text-link" href="#/t5/tickets?id=${encodeURIComponent(item.workOrderId)}">${item.workOrderId}</a>` : "—"}</dd>
      </dl>
    `;
  }
  if (item.status === "真警") {
    return `
      <dl class="kv review-readonly">
        <dt>说明</dt><dd>${item.note || "—"}</dd>
        <dt>复核人</dt><dd>${item.reviewer || "—"}</dd>
      </dl>
    `;
  }
  return "";
}

function applyAiFalse(target, reason, note) {
  target.status = "误报";
  target.reason = reason;
  target.reviewer = data.operator.name;
  target.note = note || "";
  if (target.alertId) {
    const linked = data.alerts.find((row) => row.id === target.alertId);
    if (linked && linked.status !== "已办结") {
      pushLog(linked, "已办结", `AI误报关闭：${reason}`);
    }
  }
}

function showAiFalseDialog(target, refresh) {
  openAlertDialog("标记误报", `
    <label class="modal-field">误报原因
      <select id="ai-false-reason" class="field">
        <option value="">请选择</option>
        ${FALSE_REASONS.map((name) => `<option value="${name}">${name}</option>`).join("")}
      </select>
    </label>
    <label class="modal-field">说明（可选）
      <textarea id="ai-false-note" class="field" rows="3" placeholder="补充描述"></textarea>
    </label>
  `, (root, err) => {
    const reason = root.querySelector("#ai-false-reason").value;
    if (!reason) {
      err.hidden = false;
      err.textContent = "请选择误报原因。";
      return false;
    }
    const note = root.querySelector("#ai-false-note").value.trim();
    applyAiFalse(target, reason, note);
    data.kpis.openAlerts = openCount();
    persist();
    refresh();
    return true;
  });
}

function bindAiActions(root, item, refresh) {
  root.querySelectorAll("[data-ai-act]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = data.aiEvents.find((row) => row.id === btn.dataset.id);
      if (!target) return;
      const act = btn.getAttribute("data-ai-act");
      const note = root.querySelector("#ai-note")?.value.trim() || "";
      if (act === "false") {
        showAiFalseDialog(target, () => refresh({ filter: "误报", focus: target.id }));
        return;
      }
      if (act === "true") {
        const hits = matchingSuppressWorkOrders({
          place: target.place,
          eventType: target.type,
          person: target.person,
          at: workStampFromRecord(target)
        });
        if (hits[0]) {
          suppressEventByWork(target, hits[0]);
          data.kpis.openAlerts = openCount();
          persist();
          refresh({ filter: "已抑制", focus: target.id });
          return;
        }
        target.status = "真警";
        target.reviewer = data.operator.name;
        target.note = note || "复核确认真警";
        if (!target.alertId) {
          const fresh = {
            id: `EVT-${target.id.replace("AI-", "")}`,
            level: target.level,
            type: target.type,
            place: target.place,
            plant: target.plant,
            status: "待签收",
            time: nowTime(),
            wait: "00:00",
            person: "AI识别对象",
            rule: `由 ${target.id} 转入`,
            camera: target.camera,
            x: target.x,
            y: target.y,
            timeline: [
              { status: "AI识别", time: target.time, actor: "视频平台", note: `置信度 ${target.confidence}%` },
              { status: "正式告警", time: nowTime(), actor: data.operator.name, note: "复核真警后自动派发当班岗位" }
            ]
          };
          ensureAlertAssignees();
          fresh.assignee = defaultPlantAssignee(fresh.plant);
          data.alerts.unshift(fresh);
          linkAlertToEvent(fresh, target.id);
        }
        data.kpis.openAlerts = openCount();
        persist();
        refresh({ filter: "真警", focus: target.id });
        return;
      }
      if (act === "field") {
        target.status = "待核查";
        target.fieldTo = aiFieldContact(target.plant);
        target.fieldSentAt = nowTime();
        target.fieldAsk = note || `请现场确认：${target.type}，${target.place}，抓拍 ${target.time}，置信度 ${target.confidence}%`;
        target.fieldReply = "";
        target.fieldReplyAt = "";
        target.note = note || "识别结果已推送现场确认";
        data.kpis.openAlerts = openCount();
        persist();
        refresh({ focus: target.id });
      }
    });
  });
}

function barRows(items) {
  const max = Math.max(...items.map((item) => item.count), 1);
  return items.map((item) => `
    <div class="bar-row">
      <span>${item.name}</span>
      <div class="bar-track"><i style="width:${Math.round((item.count / max) * 100)}%"></i></div>
      <b>${item.count}</b>
    </div>
  `).join("");
}

function destroyCockpitCharts(root) {
  (root._cockpitTimers || []).forEach((id) => clearInterval(id));
  root._cockpitTimers = [];
  if (root._cockpitResize) {
    window.removeEventListener("resize", root._cockpitResize);
    root._cockpitResize = null;
  }
  (root._cockpitCharts || []).forEach((chart) => {
    try { chart.dispose(); } catch (_) { /* ignore */ }
  });
  root._cockpitCharts = [];
}

function bindCockpitResize(root) {
  const onResize = () => {
    (root._cockpitCharts || []).forEach((chart) => {
      try { chart.resize(); } catch (_) { /* ignore */ }
    });
  };
  root._cockpitResize = onResize;
  window.addEventListener("resize", onResize);
}

const COCKPIT_CHART_COLORS = {
  primary: "#2563eb",
  primarySoft: "rgba(37, 99, 235, 0.16)",
  copper: "#c2410c",
  ok: "#15803d",
  warn: "#ca8a04",
  muted: "#94a3b8",
  l1: "#dc2626",
  l2: "#ea580c",
  l3: "#ca8a04",
  l4: "#64748b",
};

function statsEchartTheme() {
  const read = (name, fallback) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  };
  return {
    fg: read("--foreground", "#1e293b"),
    muted: read("--muted-foreground", "#64748b"),
    line: read("--border", "#e2e8f0"),
    panel: "#ffffff",
    ev: COCKPIT_CHART_COLORS.primary,
    al: COCKPIT_CHART_COLORS.copper,
    ok: COCKPIT_CHART_COLORS.ok,
    warn: COCKPIT_CHART_COLORS.warn,
    mutedBar: COCKPIT_CHART_COLORS.muted,
    levels: [COCKPIT_CHART_COLORS.l1, COCKPIT_CHART_COLORS.l2, COCKPIT_CHART_COLORS.l3, COCKPIT_CHART_COLORS.l4],
  };
}

function statsAxis(theme) {
  return {
    axisLine: { lineStyle: { color: theme.line } },
    axisTick: { show: false },
    axisLabel: { color: theme.muted, fontSize: 11 },
    splitLine: { lineStyle: { color: "rgba(148, 163, 184, 0.18)", type: "dashed" } }
  };
}

function statsTooltip(theme, trigger = "axis") {
  return {
    trigger,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderColor: theme.line,
    textStyle: { color: theme.fg, fontSize: 12 }
  };
}

function statsLegend(theme) {
  return {
    top: 0,
    right: 0,
    itemWidth: 10,
    itemHeight: 8,
    textStyle: { color: theme.muted, fontSize: 11 }
  };
}

function gradDown(from, to) {
  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: from },
    { offset: 1, color: to }
  ]);
}

function gradRight(from, to) {
  return new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: from },
    { offset: 1, color: to }
  ]);
}

function cockpitEchart(root, id, option, extras) {
  if (typeof echarts === "undefined") return null;
  const el = root.querySelector(`#${id}`);
  if (!el) return null;
  const chart = echarts.init(el, null, { renderer: "canvas" });
  chart.setOption(option);
  root._cockpitCharts = root._cockpitCharts || [];
  root._cockpitCharts.push(chart);
  extras?.onReady?.(chart);
  return chart;
}

function statsPlantLabel(plantId) {
  if (!plantId || plantId === "all") return null;
  return data.plants.find((p) => p.id === plantId)?.name || null;
}

const STATS_PERIOD_OPTIONS = [
  { value: "7d", label: "近7天", days: 7 },
  { value: "30d", label: "近30天", days: 30 },
  { value: "90d", label: "近90天", days: 90 },
  { value: "ytd", label: "本年度", ytd: true }
];

function analysisReferenceDate() {
  return new Date(2026, 10, 10);
}

function parseAnalysisDateTime(timeStr) {
  if (!timeStr) return null;
  const raw = String(timeStr).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const d = new Date(raw.replace(" ", "T"));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const ref = analysisReferenceDate();
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const parts = raw.split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (Number.isFinite(h)) d.setHours(h, Number.isFinite(m) ? m : 0, 0, 0);
  return d;
}

function rowInStatsPeriod(row, periodKey) {
  if (!periodKey || periodKey === "all") return true;
  const opt = STATS_PERIOD_OPTIONS.find((item) => item.value === periodKey) || STATS_PERIOD_OPTIONS[1];
  const when = parseAnalysisDateTime(row.time);
  const ref = analysisReferenceDate();
  if (!when) return true;
  if (opt.ytd) return when.getFullYear() === ref.getFullYear();
  const start = new Date(ref);
  start.setDate(start.getDate() - (opt.days || 30));
  start.setHours(0, 0, 0, 0);
  const end = new Date(ref);
  end.setHours(23, 59, 59, 999);
  return when >= start && when <= end;
}

function eventsForAnalysis(plantId, periodKey) {
  const plantName = statsPlantLabel(plantId);
  return allEvents().filter((row) => {
    if (row.mergedIntoId) return false;
    if (plantName && row.plant !== plantName) return false;
    if (!rowInStatsPeriod(row, periodKey)) return false;
    return true;
  });
}

function alertsForAnalysis(plantId, periodKey) {
  const plantName = statsPlantLabel(plantId);
  return (data.alerts || []).filter((row) => {
    if (plantName && row.plant !== plantName) return false;
    if (!rowInStatsPeriod(row, periodKey)) return false;
    return true;
  });
}

function countByField(rows, pick) {
  const map = new Map();
  rows.forEach((row) => {
    const key = pick(row) || "未分类";
    map.set(key, (map.get(key) || 0) + 1);
  });
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

function levelBucketName(level) {
  return LEVEL_NAME[level] || `等级${level || "—"}`;
}

function hourBucket(timeStr) {
  if (!timeStr) return "未知";
  const h = parseInt(String(timeStr).split(":")[0], 10);
  if (Number.isNaN(h)) return "未知";
  if (h < 6) return "00–06";
  if (h < 12) return "06–12";
  if (h < 18) return "12–18";
  return "18–24";
}

function reviewStatsForPlant(plantId, periodKey) {
  const plantName = statsPlantLabel(plantId);
  const rows = videoEvents().filter((row) => {
    if (row.mergedIntoId) return false;
    if (plantName && row.plant !== plantName) return false;
    if (!rowInStatsPeriod(row, periodKey)) return false;
    return true;
  });
  return {
    total: rows.length,
    trueHit: rows.filter((r) => r.status === "真警").length,
    falseHit: rows.filter((r) => r.status === "误报").length,
    hold: rows.filter((r) => ["待复核", "待核查"].includes(r.status)).length,
    suppressed: rows.filter((r) => r.status === "已抑制").length,
  };
}

function monthSeriesFromTotals(monthRows, total) {
  const weights = (monthRows || []).map((row) => row.count);
  const sum = weights.reduce((a, n) => a + n, 0) || 1;
  return weights.map((w) => Math.max(0, Math.round((total * w) / sum)));
}

function renderEventStats(root) {
  let plantId = "all";
  let periodKey = "30d";
  const a = data.analysis || {};
  const summary = a.summary || {};

  function snapshot() {
    const events = eventsForAnalysis(plantId, periodKey);
    const alerts = alertsForAnalysis(plantId, periodKey);
    const escalated = events.filter((row) => row.alertId).length;
    const review = reviewStatsForPlant(plantId, periodKey);
    const openAlerts = alerts.filter((row) => row.status !== "已办结").length;
    const closed = alerts.filter((row) => row.status === "已办结").length;
    const major = alerts.filter((row) => row.level <= 2).length;
    const typesEv = countByField(events, (row) => row.type).slice(0, 6);
    const typesAl = countByField(alerts, (row) => row.type).slice(0, 6);
    const typeLabels = [...new Set([...typesEv, ...typesAl].map((row) => row.name))].slice(0, 6);
    const areasEv = countByField(events, (row) => row.place || row.plant).slice(0, 8);
    const areasAl = countByField(alerts, (row) => row.place).slice(0, 8);
    const areaLabels = [...new Set([...areasEv, ...areasAl].map((row) => row.name))].slice(0, 8);
    const levelsEv = countByField(events, (row) => levelBucketName(row.level));
    const levelsAl = countByField(alerts, (row) => levelBucketName(row.level));
    const plants = data.plants.filter((p) => p.id !== "all").map((p) => ({
      name: p.name,
      events: eventsForAnalysis(p.id, periodKey).length,
      alerts: alertsForAnalysis(p.id, periodKey).length,
    }));
    const hoursEv = countByField(events, (row) => hourBucket(row.time));
    const hoursAl = countByField(alerts, (row) => hourBucket(row.time));
    const hourOrder = ["00–06", "06–12", "12–18", "18–24", "未知"];
    const hourLabels = hourOrder.filter((name) => hoursEv.some((r) => r.name === name) || hoursAl.some((r) => r.name === name));
    const monthLabels = (a.months || []).map((row) => row.name);
    const monthEv = monthSeriesFromTotals(a.months, events.length);
    const monthAl = monthSeriesFromTotals(a.months, alerts.length);
    const handleStatuses = countByField(alerts, (row) => row.status);
    return {
      events,
      alerts,
      escalated,
      review,
      openAlerts,
      closed,
      major,
      typeLabels,
      typesEv,
      typesAl,
      areaLabels,
      areasEv,
      areasAl,
      levelsEv,
      levelsAl,
      plants,
      hourLabels,
      hoursEv,
      hoursAl,
      monthLabels,
      monthEv,
      monthAl,
      handleStatuses,
    };
  }

  function paint() {
    const s = snapshot();
    const escalRate = s.events.length ? Math.round((s.escalated / s.events.length) * 100) : 0;
    const falseRate = s.review.total ? Math.round((s.review.falseHit / s.review.total) * 100) : 0;
    const majorShare = s.alerts.length ? Math.round((s.major / s.alerts.length) * 100) : 0;
    const lookupCount = (rows, name) => rows.find((row) => row.name === name)?.count || 0;

    destroyCockpitCharts(root);
    root.innerHTML = `
      <div class="filter-row cockpit-filters">
        <select class="field" name="period">
          ${STATS_PERIOD_OPTIONS.map((item) => (
            `<option value="${item.value}"${item.value === periodKey ? " selected" : ""}>${esc(item.label)}</option>`
          )).join("")}
        </select>
        <select class="field" name="plant">
          <option value="all"${plantId === "all" ? " selected" : ""}>全厂</option>
          ${data.plants.filter((p) => p.id !== "all").map((p) => (
            `<option value="${p.id}"${plantId === p.id ? " selected" : ""}>${p.name}</option>`
          )).join("")}
        </select>
      </div>
      <div class="cockpit-kpi">
        <div class="kpi-card">
          <span>事件</span>
          <strong>${s.events.length}<small>条</small></strong>
          <em>含误报/抑制/未升告警</em>
        </div>
        <div class="kpi-card">
          <span>正式告警</span>
          <strong>${s.alerts.length}<small>条</small></strong>
          <em>升告警率 ${escalRate}%</em>
        </div>
        <div class="kpi-card">
          <span>未办结</span>
          <strong class="danger">${s.openAlerts}<small>条</small></strong>
          <em><a class="text-link" href="#/t2/alerts">告警中心</a></em>
        </div>
        <div class="kpi-card">
          <span>平均处置</span>
          <strong>${summary.avgHandleMin || "—"}<small>min</small></strong>
          <em>签收至办结 · ${s.closed} 已办结</em>
        </div>
        <div class="kpi-card">
          <span>复核误报率</span>
          <strong>${falseRate}<small>%</small></strong>
          <em>${s.review.total} 条视频/AI</em>
        </div>
        <div class="kpi-card">
          <span>一二级占比</span>
          <strong>${majorShare || "—"}<small>%</small></strong>
          <em>告警等级结构</em>
        </div>
      </div>
      <div class="cockpit-mosaic">
        <div class="white-card chart-card chart-card--trend">
          <h3>月度趋势 <span class="meta">· 事件 vs 告警 · 条</span></h3>
          <div class="chart-wrap chart-wrap--trend"><div class="echart" id="stats-months" role="img" aria-label="月度趋势"></div></div>
        </div>
        <div class="white-card chart-card chart-card--gauge">
          <h3>升告警率</h3>
          <div class="chart-wrap chart-wrap--gauge"><div class="echart" id="stats-escal" role="img" aria-label="升告警率"></div></div>
        </div>
        <div class="white-card chart-card chart-card--half">
          <h3>类型结构 <span class="meta">· 条</span></h3>
          <div class="chart-wrap chart-wrap--bar"><div class="echart" id="stats-types" role="img" aria-label="事件类型"></div></div>
        </div>
        <div class="white-card chart-card chart-card--half">
          <h3>区域排行 <span class="meta">· 条</span></h3>
          <div class="chart-wrap chart-wrap--rank"><div class="echart" id="stats-areas" role="img" aria-label="风险区域"></div></div>
        </div>
        <div class="white-card chart-card chart-card--third">
          <h3>等级结构 <span class="meta">· 内环事件 / 外环告警</span></h3>
          <div class="chart-wrap chart-wrap--pie-sm"><div class="echart" id="stats-levels" role="img" aria-label="等级结构"></div></div>
        </div>
        <div class="white-card chart-card chart-card--third">
          <h3>复核结论 <span class="meta">· 仅事件 · 条</span></h3>
          <div class="chart-wrap chart-wrap--pie-sm"><div class="echart" id="stats-review" role="img" aria-label="复核结论"></div></div>
        </div>
        <div class="white-card chart-card chart-card--third">
          <h3>告警处置状态 <span class="meta">· 条</span></h3>
          <div class="chart-wrap chart-wrap--pie-sm"><div class="echart" id="stats-handle" role="img" aria-label="处置状态"></div></div>
        </div>
        <div class="white-card chart-card chart-card--half">
          <h3>分厂对比 <span class="meta">· 条</span></h3>
          <div class="chart-wrap chart-wrap--bar"><div class="echart" id="stats-plants" role="img" aria-label="分厂对比"></div></div>
        </div>
        <div class="white-card chart-card chart-card--half">
          <h3>发生时段 <span class="meta">· 条</span></h3>
          <div class="chart-wrap chart-wrap--bar"><div class="echart" id="stats-hours" role="img" aria-label="发生时段"></div></div>
        </div>
      </div>
      ${typeof echarts === "undefined" ? `<p class="meta">图表库未加载，请检查网络后刷新。</p>` : ""}
    `;

    const bindStatsFilters = () => {
      root.querySelector("[name=plant]")?.addEventListener("change", (event) => {
        plantId = event.target.value || "all";
        paint();
      });
      root.querySelector("[name=period]")?.addEventListener("change", (event) => {
        periodKey = event.target.value || "30d";
        paint();
      });
    };

    if (typeof echarts === "undefined") {
      bindStatsFilters();
      return;
    }

    const theme = statsEchartTheme();
    const axis = statsAxis(theme);
    const grid = { top: 28, left: 8, right: 12, bottom: 4, containLabel: true };
    const barEv = {
      type: "bar",
      name: "事件",
      barWidth: 10,
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: gradDown(theme.ev, "rgba(37, 99, 235, 0.12)")
      }
    };
    const barAl = {
      type: "bar",
      name: "正式告警",
      barWidth: 10,
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: gradDown(theme.al, "rgba(194, 65, 12, 0.12)")
      }
    };

    cockpitEchart(root, "stats-months", {
      color: [theme.ev, theme.al],
      tooltip: statsTooltip(theme),
      legend: statsLegend(theme),
      grid,
      xAxis: { type: "category", data: s.monthLabels, ...axis, splitLine: { show: false } },
      yAxis: { type: "value", name: "条", nameTextStyle: { color: theme.muted, fontSize: 10 }, ...axis },
      series: [
        {
          type: "line",
          name: "事件",
          smooth: true,
          symbol: "none",
          lineStyle: { width: 2.4, color: theme.ev },
          areaStyle: { color: gradDown("rgba(37,99,235,0.28)", "rgba(37,99,235,0.02)") },
          data: s.monthEv
        },
        {
          type: "line",
          name: "正式告警",
          smooth: true,
          symbol: "none",
          lineStyle: { width: 2.4, color: theme.al },
          areaStyle: { color: gradDown("rgba(194,65,12,0.2)", "rgba(194,65,12,0.02)") },
          data: s.monthAl
        }
      ]
    });

    cockpitEchart(root, "stats-escal", {
      series: [{
        type: "gauge",
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        progress: { show: true, width: 12, itemStyle: { color: theme.ev } },
        axisLine: { lineStyle: { width: 12, color: [[1, "rgba(148,163,184,0.2)"]] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        anchor: { show: false },
        detail: {
          fontSize: 28,
          color: theme.fg,
          fontWeight: 700,
          formatter: "{value}%",
          offsetCenter: [0, 8]
        },
        title: { show: true, offsetCenter: [0, 36], color: theme.muted, fontSize: 11 },
        data: [{ value: escalRate, name: `${s.escalated} / ${s.events.length} 条` }]
      }]
    });

    const typeEvData = s.typeLabels.map((name) => lookupCount(s.typesEv, name));
    const typeAlData = s.typeLabels.map((name) => lookupCount(s.typesAl, name));
    cockpitEchart(root, "stats-types", {
      tooltip: statsTooltip(theme),
      legend: statsLegend(theme),
      grid,
      xAxis: { type: "category", data: s.typeLabels, ...axis, splitLine: { show: false }, axisLabel: { ...axis.axisLabel, interval: 0 } },
      yAxis: { type: "value", ...axis },
      series: [
        { ...barEv, data: typeEvData },
        { ...barAl, data: typeAlData }
      ]
    });

    const areaEvData = s.areaLabels.map((name) => lookupCount(s.areasEv, name));
    const areaAlData = s.areaLabels.map((name) => lookupCount(s.areasAl, name));
    cockpitEchart(root, "stats-areas", {
      tooltip: statsTooltip(theme),
      legend: statsLegend(theme),
      grid: { ...grid, left: 4, right: 28 },
      xAxis: { type: "value", ...axis },
      yAxis: {
        type: "category",
        inverse: true,
        data: s.areaLabels,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: theme.muted, fontSize: 11 }
      },
      series: [
        {
          type: "bar",
          name: "事件",
          barWidth: 8,
          itemStyle: { borderRadius: 4, color: gradRight(theme.ev, "rgba(37,99,235,0.08)") },
          data: areaEvData
        },
        {
          type: "bar",
          name: "正式告警",
          barWidth: 8,
          itemStyle: { borderRadius: 4, color: gradRight(theme.al, "rgba(194,65,12,0.08)") },
          data: areaAlData
        }
      ]
    });

    const levelOrder = ["一级", "二级", "三级", "四级"];
    const levelEvMap = Object.fromEntries(s.levelsEv.map((row) => [row.name, row.count]));
    const levelAlMap = Object.fromEntries(s.levelsAl.map((row) => [row.name, row.count]));
    const pieEv = levelOrder.filter((name) => levelEvMap[name]).map((name, i) => ({
      name,
      value: levelEvMap[name],
      itemStyle: { color: theme.levels[i] }
    }));
    const pieAl = levelOrder.filter((name) => levelAlMap[name]).map((name, i) => ({
      name,
      value: levelAlMap[name],
      itemStyle: { color: theme.levels[i] }
    }));
    cockpitEchart(root, "stats-levels", {
      tooltip: statsTooltip(theme, "item"),
      legend: { ...statsLegend(theme), right: 0, top: "middle", orient: "vertical" },
      series: [
        {
          type: "pie",
          name: "事件",
          radius: ["0%", "38%"],
          center: ["38%", "52%"],
          label: { show: false },
          data: pieEv,
          itemStyle: { borderColor: theme.panel, borderWidth: 2 }
        },
        {
          type: "pie",
          name: "正式告警",
          radius: ["50%", "70%"],
          center: ["38%", "52%"],
          label: { color: theme.muted, fontSize: 10, formatter: "{d}%" },
          data: pieAl,
          itemStyle: { borderColor: theme.panel, borderWidth: 2 }
        }
      ]
    });

    const reviewData = [
      { name: "真警", value: s.review.trueHit, itemStyle: { color: theme.ok } },
      { name: "误报", value: s.review.falseHit, itemStyle: { color: theme.warn } },
      { name: "待复核", value: s.review.hold, itemStyle: { color: theme.mutedBar } },
      { name: "已抑制", value: s.review.suppressed, itemStyle: { color: theme.ev } }
    ].filter((row) => row.value);
    cockpitEchart(root, "stats-review", {
      tooltip: statsTooltip(theme, "item"),
      legend: { ...statsLegend(theme), right: 0, top: "middle", orient: "vertical" },
      series: [{
        type: "pie",
        radius: ["48%", "70%"],
        center: ["38%", "52%"],
        label: { color: theme.muted, fontSize: 10, formatter: "{b}\n{c}" },
        itemStyle: { borderColor: theme.panel, borderWidth: 2 },
        data: reviewData
      }]
    }, {
      onReady: (chart) => {
        if (reviewData.length < 2) return;
        let cur = 0;
        const timer = setInterval(() => {
          chart.dispatchAction({ type: "downplay", seriesIndex: 0 });
          chart.dispatchAction({ type: "highlight", seriesIndex: 0, dataIndex: cur });
          cur = (cur + 1) % reviewData.length;
        }, 2400);
        root._cockpitTimers = root._cockpitTimers || [];
        root._cockpitTimers.push(timer);
      }
    });

    cockpitEchart(root, "stats-handle", {
      tooltip: statsTooltip(theme),
      grid: { ...grid, top: 12 },
      xAxis: {
        type: "category",
        data: s.handleStatuses.map((row) => row.name),
        ...axis,
        splitLine: { show: false },
        axisLabel: { ...axis.axisLabel, interval: 0 }
      },
      yAxis: { type: "value", ...axis },
      series: [{
        type: "bar",
        name: "告警",
        barWidth: 14,
        itemStyle: {
          borderRadius: [5, 5, 0, 0],
          color: gradDown(theme.al, "rgba(194,65,12,0.1)")
        },
        data: s.handleStatuses.map((row) => row.count)
      }]
    });

    cockpitEchart(root, "stats-plants", {
      tooltip: statsTooltip(theme),
      legend: statsLegend(theme),
      grid,
      xAxis: { type: "category", data: s.plants.map((row) => row.name), ...axis, splitLine: { show: false } },
      yAxis: { type: "value", ...axis },
      series: [
        { ...barEv, data: s.plants.map((row) => row.events) },
        { ...barAl, data: s.plants.map((row) => row.alerts) }
      ]
    });

    const hourEvData = s.hourLabels.map((name) => lookupCount(s.hoursEv, name));
    const hourAlData = s.hourLabels.map((name) => lookupCount(s.hoursAl, name));
    cockpitEchart(root, "stats-hours", {
      tooltip: statsTooltip(theme),
      legend: statsLegend(theme),
      grid,
      xAxis: { type: "category", data: s.hourLabels, ...axis, splitLine: { show: false } },
      yAxis: { type: "value", ...axis },
      series: [
        { ...barEv, data: hourEvData },
        { ...barAl, data: hourAlData }
      ]
    });

    bindCockpitResize(root);
    bindStatsFilters();
  }
  paint();
}

function heatBucketsFromEvents(events, grid = 36) {
  const map = new Map();
  events.forEach((ev) => {
    if (ev.x == null || ev.y == null) return;
    const kx = Math.round(ev.x / grid) * grid;
    const ky = Math.round(ev.y / grid) * grid;
    const key = `${kx},${ky}`;
    map.set(key, (map.get(key) || 0) + 1);
  });
  return [...map.entries()].map(([key, count]) => {
    const [x, y] = key.split(",").map(Number);
    return { x, y, count };
  }).sort((a, b) => b.count - a.count);
}

function drawHeatOverlay(buckets) {
  const max = Math.max(...buckets.map((b) => b.count), 1);
  return `<g class="heat-layer" pointer-events="none">${buckets.map((b) => {
    const r = 10 + (b.count / max) * 26;
    const op = 0.12 + (b.count / max) * 0.5;
    return `<circle cx="${b.x}" cy="${b.y}" r="${r}" fill="rgba(220,38,38,${op.toFixed(2)})" />`;
  }).join("")}</g>`;
}

function repeatEventGroups(events) {
  const map = new Map();
  events.forEach((ev) => {
    const key = `${ev.type || "—"}@@${ev.place || ev.plant || "—"}`;
    if (!map.has(key)) map.set(key, { type: ev.type, place: ev.place || ev.plant, count: 0, sample: ev.id });
    const row = map.get(key);
    row.count += 1;
  });
  return [...map.values()].filter((row) => row.count > 1).sort((a, b) => b.count - a.count);
}

function hotspotsForPlant(plantId) {
  const plantName = statsPlantLabel(plantId);
  const rows = (data.analysis?.hotspots || []).filter((row) => {
    if (!plantName) return true;
    const zone = (data.zones || []).find((z) => z.id === row.zone);
    if (zone?.plant === plantName) return true;
    return (row.area || "").includes(plantName.replace("分厂", "")) || row.area?.includes(plantName);
  });
  return rows.length ? rows : (data.analysis?.hotspots || []).slice(0, 6);
}

function renderHeatAnalysis(root, focusId) {
  let plantId = "all";
  let layer = "events";
  let focus = focusId || "";

  function paint() {
    const allEv = eventsForAnalysis(plantId);
    const alertEv = allEv.filter((row) => row.alertId);
    const heatSource = layer === "alerts" ? alertEv : allEv;
    const buckets = heatBucketsFromEvents(heatSource);
    const repeats = repeatEventGroups(allEv).slice(0, 8);
    const spots = hotspotsForPlant(plantId);
    const focused = spots.find((row) => row.id === focus) || spots[0] || null;
    focus = focused?.id || "";

    const spotMax = Math.max(...spots.map((row) => row.count), 1);
    root.innerHTML = `
      <div class="heatmap-page">
        <div class="filter-row cockpit-filters heatmap-toolbar">
          <select class="field" name="plant">
            <option value="all"${plantId === "all" ? " selected" : ""}>全厂</option>
            ${data.plants.filter((p) => p.id !== "all").map((p) => (
              `<option value="${p.id}"${plantId === p.id ? " selected" : ""}>${p.name}</option>`
            )).join("")}
          </select>
          <div class="alert-status-chips">
            <button type="button" class="chip${layer === "events" ? " is-on" : ""}" data-heat-layer="events">事件热力</button>
            <button type="button" class="chip${layer === "alerts" ? " is-on" : ""}" data-heat-layer="alerts">告警热力</button>
          </div>
        </div>
        <div class="cockpit-kpi heatmap-kpi">
          <div class="kpi-card">
            <span>落点</span>
            <strong>${heatSource.length}<small>条</small></strong>
          </div>
          <div class="kpi-card">
            <span>聚合格</span>
            <strong>${buckets.length}<small>个</small></strong>
          </div>
          <div class="kpi-card">
            <span>重复组合</span>
            <strong>${repeats.length}<small>组</small></strong>
          </div>
          <div class="kpi-card">
            <span>重点点位</span>
            <strong>${spots.length}<small>处</small></strong>
          </div>
        </div>
        <div class="heatmap-layout">
          <div class="white-card heatmap-map-card">
            <div class="heatmap-map-head">
              <h3>${layer === "alerts" ? "告警" : "事件"}热力 · ${statsPlantLabel(plantId) || "全厂"}</h3>
              <span class="heat-legend" aria-hidden="true"><i></i>低<span></span>高</span>
            </div>
            <div class="heatmap-scene">
              <section class="canvas-wrap canvas-bg">
                ${drawMap({ people: false, zones: true, cameras: false, alerts: false, track: false, fov: false }, null)}
              </section>
            </div>
          </div>
          <div class="heatmap-side">
            <div class="white-card heatmap-panel heat-spot-card">
              <h3>重点点位</h3>
              <div class="table-wrap">
                <table class="heat-rank-table">
                  <colgroup>
                    <col class="heat-col-name">
                    <col class="heat-col-type">
                    <col class="heat-col-count">
                  </colgroup>
                  <thead><tr><th>点位</th><th>类型</th><th>次</th></tr></thead>
                  <tbody>
                    ${spots.length ? spots.map((row) => `
                      <tr class="${row.id === focus ? "is-on" : ""}" data-spot="${esc(row.id)}" tabindex="0">
                        <td title="${esc(row.name)}">${esc(row.name)}</td>
                        <td title="${esc(row.types || "—")}">${esc(row.types || "—")}</td>
                        <td>
                          <div class="heat-count">
                            <i style="width:${Math.round((row.count / spotMax) * 100)}%"></i>
                            <strong>${row.count}</strong>
                          </div>
                        </td>
                      </tr>`).join("") : `<tr><td colspan="3" class="meta">暂无点位</td></tr>`}
                  </tbody>
                </table>
              </div>
            </div>
            <div class="white-card heatmap-panel heat-repeat-card">
              <h3>重复事件 <span class="meta">· 同类型同区域</span></h3>
              <div class="table-wrap">
                <table class="heat-repeat-table">
                  <colgroup>
                    <col class="heat-col-type">
                    <col class="heat-col-place">
                    <col class="heat-col-n">
                    <col class="heat-col-act">
                  </colgroup>
                  <thead><tr><th>类型</th><th>区域</th><th>次</th><th></th></tr></thead>
                  <tbody>
                    ${repeats.length ? repeats.map((row) => `
                      <tr>
                        <td title="${esc(row.type)}">${esc(row.type)}</td>
                        <td title="${esc(row.place || "—")}">${esc(row.place || "—")}</td>
                        <td><strong>${row.count}</strong></td>
                        <td class="table-actions">
                          <a class="btn btn-sm" href="#/t6/events?id=${encodeURIComponent(row.sample)}">查看</a>
                        </td>
                      </tr>`).join("") : `<tr><td colspan="4" class="meta">暂无重复组合</td></tr>`}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    root.querySelector("[name=plant]")?.addEventListener("change", (event) => {
      plantId = event.target.value || "all";
      paint();
    });
    root.querySelectorAll("[data-heat-layer]").forEach((btn) => {
      btn.addEventListener("click", () => {
        layer = btn.dataset.heatLayer || "events";
        paint();
      });
    });
    root.querySelectorAll("[data-spot]").forEach((row) => {
      const open = () => {
        focus = row.dataset.spot;
        paint();
      };
      row.addEventListener("click", open);
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      });
    });
    if (buckets.length) {
      root.querySelector(".heatmap-scene .scene-map-overlays")?.insertAdjacentHTML("beforeend", drawHeatOverlay(buckets));
    }
    root.querySelector(".heatmap-scene svg")?.setAttribute("preserveAspectRatio", "xMidYMid slice");
  }
  paint();
}

function historyEventDetailHtml(event) {
  const alert = alertForEvent(event);
  const stubAlert = {
    camera: event.camera,
    time: event.time,
    type: event.type,
    x: event.x,
    y: event.y
  };
  const primaryCam = data.cameras.find((c) => c.id === event.camera);
  const timeline = eventHistoryTimeline(event);
  const logCount = timeline.length;
  const tabCount = (n) => (n ? `<span class="detail-tab-count">${n}</span>` : "");
  const closeRow = alert ? [...(alert.timeline || [])].reverse().find((row) => row.status === "已办结") : null;
  const alertLine = event.alertId
    ? (alert ? `${event.alertId} · ${alert.status}` : event.alertId)
    : "未生成正式告警";
  return `
    <p class="meta">${esc(eventSourceLabel(event))}${isLocSpaceEvent(event) ? ` · ${esc(locTriggerLabel(event))}` : ""} · ${esc(event.plant || "—")} ${esc(event.place || "")} · 发生 ${esc(event.time || "—")}${closeRow ? ` · 告警办结 ${esc(closeRow.time)}` : ""}</p>
    <div class="detail-tabs" role="tablist">
      <button type="button" class="detail-tab is-on" role="tab" aria-selected="true" data-history-tab="detail">详情</button>
      <button type="button" class="detail-tab" role="tab" aria-selected="false" data-history-tab="video">视频与证据</button>
      <button type="button" class="detail-tab" role="tab" aria-selected="false" data-history-tab="timeline">时间线${tabCount(logCount)}</button>
    </div>
    <div class="detail-tab-panel">
      <div data-history-panel="detail">
        <div class="white-card flush">
          <dl class="kv">
            <dt>事件编号</dt><dd>${esc(event.id)}${event.sourceEventId ? ` <span class="meta">（源 ${esc(event.sourceEventId)}）</span>` : ""}</dd>
            <dt>来源</dt><dd>${esc(eventSourceLabel(event))}${isLocSpaceEvent(event) ? ` · ${esc(locTriggerLabel(event))}` : ""}</dd>
            <dt>类型</dt><dd>${esc(event.type || "—")}</dd>
            <dt>等级</dt><dd><span class="lvl lvl-${event.level}">${LEVEL_NAME[event.level] || "—"}</span></dd>
            <dt>事件结论</dt><dd>${esc(event.status || "—")}</dd>
            <dt>规则</dt><dd>${esc(ruleLineForEvent(event))}</dd>
            <dt>升级策略</dt><dd>${esc(event.entryPath || "—")}</dd>
            <dt>对象</dt><dd>${esc(event.person || "—")}</dd>
            <dt>正式告警</dt><dd>${esc(alertLine)}</dt>
            ${event.confidence != null ? `<dt>置信度</dt><dd>${event.confidence}%</dd>` : ""}
            ${event.coordPrecision || event.precision ? `<dt>落点精度</dt><dd>${esc(event.coordPrecision || event.precision)}</dd>` : ""}
            <dt>摄像头</dt><dd>${esc(cameraName(event.camera) || "—")}</dd>
            <dt>摘要</dt><dd>${esc(event.summary || event.note || "—")}</dd>
          </dl>
          ${renderHistoryLinkedBlock(event)}
        </div>
      </div>
      <div data-history-panel="video" hidden>
        <div class="white-card flush">
          <div class="video-grid ai-shots">
            ${primaryCam ? renderMonitor(primaryCam, true) : ""}
            ${renderAlertSnapshot(stubAlert, primaryCam, event)}
          </div>
          ${event.x != null && event.y != null ? `<div class="scene mini-scene" style="margin-top:10px">${renderMiniScene({ people: false, zones: true, cameras: true, alerts: true, track: false, fov: Boolean(event.camera) }, event.camera)}</div>` : ""}
        </div>
      </div>
      <div data-history-panel="timeline" hidden>
        <div class="white-card flush">
          <ol class="log">
            ${logCount
    ? timeline.map((row) => `<li><b>${esc(row.time)}</b> ${esc(row.status)} · ${esc(row.actor)}<span>${esc(row.note || "")}</span></li>`).join("")
    : `<li class="meta">无时间线记录</li>`}
          </ol>
        </div>
      </div>
    </div>
    <div class="form-foot" style="margin-top:12px;padding-top:12px;border-top:1px solid var(--line)">
      ${event.alertId ? `<a class="btn" href="#/t6/alert-archive?id=${encodeURIComponent(event.alertId)}">告警档案</a>` : ""}
      ${HISTORY_EVENT_QUEUE.includes(event.status) ? `<a class="btn" href="#/t3/review?id=${encodeURIComponent(event.id)}">识别复核</a>` : ""}
      <a class="btn btn-primary" href="${overviewLinkageHref(event.alertId || event.id)}">三维场景</a>
    </div>
  `;
}

function bindHistoryEventDetailTabs(dlg) {
  const showTab = (name) => {
    dlg.querySelectorAll("[data-history-tab]").forEach((btn) => {
      const on = btn.dataset.historyTab === name;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    dlg.querySelectorAll("[data-history-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.historyPanel !== name;
    });
  };
  dlg.querySelectorAll("[data-history-tab]").forEach((btn) => {
    btn.addEventListener("click", () => showTab(btn.dataset.historyTab));
  });
  showTab("detail");
}

function showHistoryEventDetail(event) {
  if (!event) return;
  openAlertDialog(`事件档案 · ${event.id}`, historyEventDetailHtml(event), () => true, "关闭", true, (dlg) => {
    bindHistoryEventDetailTabs(dlg);
  });
}

function alertArchiveDetailHtml(alert) {
  const ev = eventsForAlert(alert)[0];
  const logCount = (alert.timeline || []).length;
  const tabCount = (n) => (n ? `<span class="detail-tab-count">${n}</span>` : "");
  const closeRow = [...(alert.timeline || [])].reverse().find((row) => row.status === "已办结");
  return `
    <p class="meta">${esc(alert.plant || "—")} · ${esc(alert.place || "—")} · ${esc(alert.status)} · ${esc(alert.time || "—")}${closeRow ? ` · 办结 ${esc(closeRow.time)}` : ""}</p>
    <div class="detail-tabs" role="tablist">
      <button type="button" class="detail-tab is-on" role="tab" aria-selected="true" data-history-tab="detail">详情</button>
      <button type="button" class="detail-tab" role="tab" aria-selected="false" data-history-tab="video">视频与证据</button>
      <button type="button" class="detail-tab" role="tab" aria-selected="false" data-history-tab="timeline">时间线${tabCount(logCount)}</button>
    </div>
    <div class="detail-tab-panel">
      <div data-history-panel="detail">
        <div class="white-card flush">
          <dl class="kv">
            <dt>告警编号</dt><dd>${esc(alert.id)}</dd>
            <dt>类型</dt><dd>${esc(alert.type || "—")}</dd>
            <dt>等级</dt><dd><span class="lvl lvl-${alert.level}">${LEVEL_NAME[alert.level]}</span></dd>
            <dt>办理状态</dt><dd>${esc(alert.status || "—")}</dd>
            <dt>规则</dt><dd>${esc(alert.rule || "—")}</dd>
            <dt>对象</dt><dd>${esc(alert.person || "—")}</dd>
            <dt>派发</dt><dd>${esc(alertDispatchLine(alert))}</dd>
            <dt>摄像头</dt><dd>${esc(cameraName(alert.camera) || "—")}</dd>
            <dt>关联事件</dt><dd>${ev ? `<a class="text-link" href="#/t6/events?id=${encodeURIComponent(ev.id)}">${esc(ev.id)}</a> · ${esc(eventSourceLabel(ev))}` : `<span class="meta">未绑定</span>`}</dd>
          </dl>
          ${renderAlertLinkedWorkOrders(alert)}
        </div>
      </div>
      <div data-history-panel="video" hidden>
        ${renderAlertVideoTab(alert)}
      </div>
      <div data-history-panel="timeline" hidden>
        <div class="white-card flush">
          <ol class="log">
            ${logCount
    ? (alert.timeline || []).map((row) => `<li><b>${esc(row.time)}</b> ${esc(row.status)} · ${esc(row.actor)}<span>${esc(row.note || "")}</span></li>`).join("")
    : `<li class="meta">无时间线记录</li>`}
          </ol>
        </div>
      </div>
    </div>
    <div class="form-foot" style="margin-top:12px;padding-top:12px;border-top:1px solid var(--line)">
      ${ev ? `<a class="btn" href="#/t6/events?id=${encodeURIComponent(ev.id)}">事件档案</a>` : ""}
      ${alert.status !== "已办结" ? `<a class="btn btn-primary" href="#/t2/alerts?id=${encodeURIComponent(alert.id)}">告警中心办理</a>` : ""}
      <a class="btn${alert.status === "已办结" ? " btn-primary" : ""}" href="${overviewLinkageHref(alert.id)}">三维场景</a>
    </div>
  `;
}

function showAlertArchiveDetail(alert) {
  if (!alert) return;
  openAlertDialog(`告警档案 · ${alert.id}`, alertArchiveDetailHtml(alert), () => true, "关闭", true, (dlg) => {
    bindHistoryEventDetailTabs(dlg);
  });
}

function renderEventArchive(root, route) {
  let type = route.filter && route.filter !== "全部" ? route.filter : "全部";
  let plantFilter = "全部";
  let level = "全部";
  let sourceFilter = "全部";
  let query = "";
  let openFocus = route.focus || "";

  function rowsOf() {
    return historyArchiveEvents().filter((item) => {
      if (type !== "全部" && item.type !== type) return false;
      if (plantFilter !== "全部" && item.plant !== plantFilter) return false;
      if (level !== "全部" && String(item.level) !== level) return false;
      if (sourceFilter !== "全部" && eventSourceLabel(item) !== sourceFilter) return false;
      const blob = [item.id, item.sourceEventId, item.person, item.place, item.summary, item.alertId].filter(Boolean).join(" ");
      if (query && !blob.includes(query)) return false;
      return true;
    }).sort((a, b) => String(b.time || "").localeCompare(String(a.time || "")));
  }

  function alertCell(event) {
    if (!event.alertId) return `<span class="meta">未生成</span>`;
    const alert = alertForEvent(event);
    const st = alert ? alert.status : "—";
    return `${esc(event.alertId)}<span class="meta"> · ${esc(st)}</span>`;
  }

  function paint() {
    const rows = rowsOf();
    const archive = historyArchiveEvents();
    const types = ["全部", ...new Set(archive.map((row) => row.type).filter(Boolean))];
    const plants = ["全部", ...data.plants.filter((row) => row.id !== "all").map((row) => row.name)];
    const sources = ["全部", ...new Set(archive.map((row) => eventSourceLabel(row)).filter(Boolean))];
    root.innerHTML = `
      <div class="filter-row alert-toolbar">
        <select class="field" name="source">${optionList(sources, sourceFilter)}</select>
        <select class="field" name="type">${optionList(types, type)}</select>
        <select class="field" name="plant">${optionList(plants, plantFilter)}</select>
        <select class="field" name="level">
          <option${level === "全部" ? " selected" : ""}>全部</option>
          ${[1, 2, 3, 4].map((n) => `<option value="${n}"${level === String(n) ? " selected" : ""}>${LEVEL_NAME[n]}</option>`).join("")}
        </select>
        <input class="field search" name="q" placeholder="编号、人员、区域、告警号" value="${esc(query)}">
        <button type="button" class="btn btn-primary" data-search>查询</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>事件编号</th>
              <th>来源</th>
              <th>类型</th>
              <th>等级</th>
              <th>分厂</th>
              <th>区域</th>
              <th>对象</th>
              <th>结论</th>
              <th>正式告警</th>
              <th>发生时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length ? rows.map((row) => `
              <tr>
                <td class="meta">${esc(row.id)}</td>
                <td>${esc(eventSourceLabel(row))}${isLocSpaceEvent(row) ? ` · ${esc(locTriggerLabel(row))}` : ""}</td>
                <td>${esc(row.type)}</td>
                <td><span class="lvl lvl-${row.level}">${LEVEL_NAME[row.level]}</span></td>
                <td>${esc(row.plant || "—")}</td>
                <td>${esc(row.place || "—")}</td>
                <td>${esc(row.person || "—")}</td>
                <td>${esc(row.status || "—")}</td>
                <td>${alertCell(row)}</td>
                <td class="meta">${esc(row.time || "—")}</td>
                <td class="table-actions">
                  <button type="button" class="btn btn-sm" data-history-view="${esc(row.id)}">查看</button>
                </td>
              </tr>`).join("") : `<tr><td colspan="11" class="meta">暂无已落库事件。</td></tr>`}
          </tbody>
        </table>
      </div>
      <p class="meta" style="margin-top:10px">共 ${rows.length} 条事件（不含待复核/待核查）。其中 ${rows.filter((row) => !row.alertId).length} 条未升正式告警。</p>
    `;
    const apply = () => {
      sourceFilter = formVal(root, "source") || "全部";
      type = formVal(root, "type") || "全部";
      plantFilter = formVal(root, "plant") || "全部";
      level = formVal(root, "level") === "全部" ? "全部" : (root.querySelector("[name=level]")?.value || "全部");
      query = formVal(root, "q");
      openFocus = "";
      paint();
    };
    root.querySelector("[data-search]")?.addEventListener("click", apply);
    root.querySelector("[name=q]")?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") apply();
    });
    root.querySelectorAll("[data-history-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const hit = rows.find((row) => row.id === btn.dataset.historyView);
        showHistoryEventDetail(hit);
      });
    });
    if (openFocus) {
      let hit = rows.find((row) => row.id === openFocus || row.alertId === openFocus);
      if (!hit) {
        const ev = eventById(openFocus) || allEvents().find((row) => row.alertId === openFocus);
        if (ev && !ev.mergedIntoId) hit = ev;
      }
      if (hit) showHistoryEventDetail(hit);
      openFocus = "";
    }
  }
  paint();
}

function alertArchiveBaseRows() {
  return (data.alerts || []).filter((row) => !row.workSuppressed);
}

function renderAlertArchive(root, route) {
  let type = route.filter && route.filter !== "全部" ? route.filter : "全部";
  let plantFilter = "全部";
  let level = "全部";
  let statusFilter = "已办结";
  let query = "";
  let openFocus = route.focus || "";

  function rowsOf() {
    return alertArchiveBaseRows().filter((item) => {
      if (statusFilter === "已办结" && item.status !== "已办结") return false;
      if (statusFilter === "在办" && item.status === "已办结") return false;
      if (type !== "全部" && item.type !== type) return false;
      if (plantFilter !== "全部" && item.plant !== plantFilter) return false;
      if (level !== "全部" && String(item.level) !== level) return false;
      const ev = eventsForAlert(item)[0];
      const blob = [item.id, item.type, item.person, item.place, item.rule, ev?.id].filter(Boolean).join(" ");
      if (query && !blob.includes(query)) return false;
      return true;
    }).sort((a, b) => String(b.time || "").localeCompare(String(a.time || "")));
  }

  function eventCell(alert) {
    const ev = eventsForAlert(alert)[0];
    if (!ev) return `<span class="meta">—</span>`;
    return `<a class="text-link" href="#/t6/events?id=${encodeURIComponent(ev.id)}">${esc(ev.id)}</a>`;
  }

  function paint() {
    const rows = rowsOf();
    const base = alertArchiveBaseRows();
    const types = ["全部", ...new Set(base.map((row) => row.type).filter(Boolean))];
    const plants = ["全部", ...data.plants.filter((row) => row.id !== "all").map((row) => row.name)];
    root.innerHTML = `
      <div class="filter-row alert-toolbar">
        <select class="field" name="status">
          <option value="已办结"${statusFilter === "已办结" ? " selected" : ""}>已办结</option>
          <option value="在办"${statusFilter === "在办" ? " selected" : ""}>在办</option>
          <option value="全部"${statusFilter === "全部" ? " selected" : ""}>全部</option>
        </select>
        <select class="field" name="type">${optionList(types, type)}</select>
        <select class="field" name="plant">${optionList(plants, plantFilter)}</select>
        <select class="field" name="level">
          <option${level === "全部" ? " selected" : ""}>全部</option>
          ${[1, 2, 3, 4].map((n) => `<option value="${n}"${level === String(n) ? " selected" : ""}>${LEVEL_NAME[n]}</option>`).join("")}
        </select>
        <input class="field search" name="q" placeholder="告警号、人员、区域、事件号" value="${esc(query)}">
        <button type="button" class="btn btn-primary" data-search>查询</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>告警编号</th>
              <th>类型</th>
              <th>等级</th>
              <th>分厂</th>
              <th>区域</th>
              <th>对象</th>
              <th>状态</th>
              <th>关联事件</th>
              <th>发生时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length ? rows.map((row) => `
              <tr>
                <td class="meta">${esc(row.id)}</td>
                <td>${esc(row.type)}</td>
                <td><span class="lvl lvl-${row.level}">${LEVEL_NAME[row.level]}</span></td>
                <td>${esc(row.plant || "—")}</td>
                <td>${esc(row.place || "—")}</td>
                <td>${esc(row.person || "—")}</td>
                <td>${esc(row.status || "—")}</td>
                <td>${eventCell(row)}</td>
                <td class="meta">${esc(row.time || "—")}</td>
                <td class="table-actions">
                  <button type="button" class="btn btn-sm" data-alert-archive-view="${esc(row.id)}">查看</button>
                </td>
              </tr>`).join("") : `<tr><td colspan="10" class="meta">无匹配告警。</td></tr>`}
          </tbody>
        </table>
      </div>
      <p class="meta" style="margin-top:10px">共 ${rows.length} 条。未升告警的识别与定位留痕见「事件档案」。</p>
    `;
    const apply = () => {
      statusFilter = formVal(root, "status") || "已办结";
      type = formVal(root, "type") || "全部";
      plantFilter = formVal(root, "plant") || "全部";
      level = formVal(root, "level") === "全部" ? "全部" : (root.querySelector("[name=level]")?.value || "全部");
      query = formVal(root, "q");
      openFocus = "";
      paint();
    };
    root.querySelector("[data-search]")?.addEventListener("click", apply);
    root.querySelector("[name=q]")?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") apply();
    });
    root.querySelectorAll("[data-alert-archive-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const hit = rows.find((row) => row.id === btn.dataset.alertArchiveView);
        showAlertArchiveDetail(hit);
      });
    });
    if (openFocus) {
      let hit = rows.find((row) => row.id === openFocus);
      if (!hit) {
        hit = alertArchiveBaseRows().find((row) => row.id === openFocus);
        if (hit && statusFilter === "已办结" && hit.status !== "已办结") statusFilter = "全部";
      }
      if (hit) showAlertArchiveDetail(hit);
      openFocus = "";
    }
  }
  paint();
}

const SYS_MENUS = TABS.map((tab) => tab.name);
const SYS_ACTIONS = ["查看", "签收", "核查", "转派", "关闭", "真警误报", "现场处置", "配置规则", "系统配置"];
const SYS_OBJECTS = ["告警", "识别结果", "摄像头", "围栏", "人员", "作业票"];
const SYS_SCOPES = ["本岗位", "本分厂", "本组织", "全厂"];
const SYS_USER_STATUS = ["启用", "停用", "临时"];
const SYS_LEDGER_KINDS = ["隐患", "应急", "事故", "证照"];
const SYS_ORG_KINDS = ["企业", "分厂", "职能部门", "岗位"];

function checkBoxes(name, options, selected) {
  const set = new Set(selected || []);
  return `<div class="check-row">${options.map((value) => `
    <label><input type="checkbox" name="${name}" value="${value}"${set.has(value) ? " checked" : ""}>${value}</label>
  `).join("")}</div>`;
}

function sysTone(status) {
  if (["启用", "有效", "现行有效", "成功", "已结案"].includes(status)) return "ok";
  if (["临时", "整改中", "待复查", "临期", "标定中"].includes(status)) return "warn";
  if (["停用", "失败"].includes(status)) return "off";
  return "";
}

function sysOrgDisplayCode(org) {
  if (org.code) return org.code;
  const idx = (data.sysOrgs || []).findIndex((row) => row.id === org.id);
  return String(10000001 + Math.max(0, idx)).padStart(8, "0");
}

function sysOrgTreeRows(collapsed) {
  const orgs = data.sysOrgs || [];
  const names = new Set(orgs.map((row) => row.name));
  const roots = orgs.filter((row) => row.parent === "—" || !names.has(row.parent));
  const rows = [];
  function walk(org, depth) {
    const children = orgs.filter((row) => row.parent === org.name);
    const hasChildren = children.length > 0;
    rows.push({ org, depth, hasChildren });
    if (hasChildren && !collapsed.has(org.id)) children.forEach((child) => walk(child, depth + 1));
  }
  roots.forEach((root) => walk(root, 0));
  return rows;
}

function sysOrgTreeTable(focusId, collapsed) {
  const rows = sysOrgTreeRows(collapsed);
  if (!rows.length) return `<div class="table-wrap"><p class="meta" style="padding:16px">没有组织。</p></div>`;
  const body = rows.map(({ org, depth, hasChildren }) => {
    const toggle = hasChildren
      ? `<button type="button" class="tree-toggle" data-toggle="${org.id}" aria-label="${collapsed.has(org.id) ? "展开" : "收起"}">${collapsed.has(org.id) ? "+" : "−"}</button>`
      : `<span class="tree-leaf" aria-hidden="true"></span>`;
    return `
      <tr class="${org.id === focusId ? "is-on" : ""}" data-id="${org.id}">
        <td class="tree-cell"><span class="tree-indent" style="--tree-depth:${depth}">${toggle}</span></td>
        <td><button type="button" class="cell-link" data-id="${org.id}">${sysOrgDisplayCode(org)}</button></td>
        <td>${org.name}</td>
        <td>${org.abbr || org.name}</td>
        <td>${org.kind || "—"}</td>
        <td>${org.status || "启用"}</td>
        <td class="table-actions"><button type="button" class="btn" data-edit-row="${org.id}">编辑</button></td>
      </tr>
    `;
  }).join("");
  return `
    <div class="table-wrap sys-tree-table">
      <table>
        <thead>
          <tr>
            <th class="tree-col"></th>
            <th>组织编码</th>
            <th>组织名称</th>
            <th>组织简称</th>
            <th>组织类型</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function sysUserTable(focusId) {
  const rows = data.sysUsers || [];
  if (!rows.length) return `<div class="table-wrap"><p class="meta" style="padding:16px">没有用户。</p></div>`;
  const body = rows.map((row) => {
    const emp = row.employeeId ? employeeById(row.employeeId) : employeeByUserId(row.id);
    return `
    <tr class="${row.id === focusId ? "is-on" : ""}" data-id="${row.id}">
      <td class="meta">${esc(row.id)}</td>
      <td><button type="button" class="cell-link" data-id="${row.id}">${row.account}</button></td>
      <td>${row.name}</td>
      <td>${row.org || "—"}</td>
      <td>${row.role || "—"}</td>
      <td>${emp ? `<a class="text-link" href="#/t7/employees?id=${encodeURIComponent(emp.id)}">${esc(emp.id)}</a>` : "—"}</td>
      <td>${row.plant || "—"}</td>
      <td>${row.status || "—"}</td>
      <td class="table-actions"><button type="button" class="btn" data-edit-row="${row.id}">编辑</button></td>
    </tr>`;
  }).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>用户 ID</th>
            <th>账号</th>
            <th>姓名</th>
            <th>组织</th>
            <th>角色</th>
            <th>员工 ID</th>
            <th>分厂 / 范围</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function sysRoleNavList(rows, focusId) {
  if (!rows.length) return `<p class="meta" style="padding:8px 10px">没有角色。</p>`;
  return rows.map((row) => (
    `<button type="button" class="sys-nav-item${row.id === focusId ? " is-on" : ""}" data-id="${row.id}">${row.name}</button>`
  )).join("");
}

function sysOrgFormFields(item) {
  const parents = ["—", ...(data.sysOrgs || []).map((row) => row.name).filter((name) => name !== item.name)];
  return `
    <div class="form-fields">
      <label>名称<input class="field" name="name" value="${item.name}"></label>
      <label>类型<select class="field" name="kind">${optionList(SYS_ORG_KINDS, item.kind)}</select></label>
      <label>上级<select class="field" name="parent">${optionList(parents, item.parent)}</select></label>
      <label>职责<input class="field" name="duty" value="${item.duty || ""}"></label>
      <label>同步来源<input class="field" name="sync" value="${item.sync || ""}"></label>
      <label class="span-2">说明<textarea class="field" name="note" rows="3">${item.note || ""}</textarea></label>
    </div>
  `;
}

function applySysOrgForm(root, item) {
  item.name = formVal(root, "name") || item.name;
  item.parent = formVal(root, "parent");
  item.kind = formVal(root, "kind");
  item.duty = formVal(root, "duty");
  item.sync = formVal(root, "sync");
  item.note = formVal(root, "note");
}

function showSysOrgEditor(item, after) {
  openAlertDialog(`编辑组织 · ${item.name}`, sysOrgFormFields(item), (backdrop) => {
    if (!formVal(backdrop, "name")) {
      const err = backdrop.querySelector("#modal-err");
      err.hidden = false;
      err.textContent = "请填写组织名称。";
      return false;
    }
    applySysOrgForm(backdrop, item);
    after?.();
    return true;
  }, "保存", true);
}

function sysUserFormFields(item) {
  const orgs = [...new Set((data.sysOrgs || []).map((row) => row.name))];
  const roles = (data.sysRoles || []).map((row) => row.name);
  const plants = data.plants.filter((row) => row.id !== "all").map((row) => row.name).concat(["全厂"]);
  const emp = item.employeeId ? employeeById(item.employeeId) : employeeByUserId(item.id);
  const empOptions = (data.employees || []).map((row) => {
    const taken = row.userId && row.userId !== item.id;
    return `<option value="${esc(row.id)}"${row.id === (emp?.id || "") ? " selected" : ""}${taken ? " disabled" : ""}>${esc(row.id)} · ${esc(row.name)}${taken ? " · 已关联其他用户" : ""}</option>`;
  }).join("");
  return `
    <div class="form-fields">
      <label>用户 ID<input class="field" name="uid" value="${item.id}" readonly></label>
      <label>姓名<input class="field" name="name" value="${item.name}"></label>
      <label>账号<input class="field" name="account" value="${item.account}"></label>
      <label>组织<select class="field" name="org">${optionList(orgs, item.org)}</select></label>
      <label>角色<select class="field" name="role">${optionList(roles, item.role)}</select></label>
      <label>分厂 / 范围<select class="field" name="plant">${optionList(plants, item.plant)}</select></label>
      <label>状态<select class="field" name="status">${optionList(SYS_USER_STATUS, item.status)}</select></label>
      <label>来源<input class="field" name="source" value="${item.source || ""}"></label>
      <label>手机<input class="field" name="mobile" value="${item.mobile || ""}"></label>
      <label class="span-2">班次<input class="field" name="shift" value="${item.shift || ""}"></label>
      <label class="span-2">关联员工
        <select class="field" name="employeeId">
          <option value="">— 不关联</option>
          ${empOptions}
        </select>
      </label>
    </div>
    <p class="meta" style="margin-top:12px">规则派发到组织/岗位，不绑定个人。签收后时间线记录操作人。员工档案见员工管理（按员工 ID / 用户 ID 互链）。</p>
  `;
}

function applySysUserForm(root, item) {
  item.name = formVal(root, "name") || item.name;
  item.account = formVal(root, "account") || item.account;
  item.org = formVal(root, "org");
  item.role = formVal(root, "role");
  item.plant = formVal(root, "plant");
  item.status = formVal(root, "status");
  item.source = formVal(root, "source");
  item.mobile = formVal(root, "mobile");
  item.shift = formVal(root, "shift");
  const empPick = formVal(root, "employeeId") || "";
  if (!empPick) {
    const prev = employeeByUserId(item.id);
    if (prev) bindEmployeeUser(prev, "");
    item.employeeId = "";
  } else {
    const emp = employeeById(empPick);
    if (emp) {
      bindEmployeeUser(emp, item.id);
      item.employeeId = emp.id;
    }
  }
}

function showSysUserEditor(item, after) {
  openAlertDialog(`编辑用户 · ${item.name}`, sysUserFormFields(item), (backdrop) => {
    if (!formVal(backdrop, "account")) {
      const err = backdrop.querySelector("#modal-err");
      err.hidden = false;
      err.textContent = "请填写账号。";
      return false;
    }
    applySysUserForm(backdrop, item);
    persist();
    after?.();
    return true;
  }, "保存", true);
}

function sysRoleEdit(item) {
  return `
    <div class="detail-head dict-detail-head">
      <div>
        <h2>${item.name}</h2>
      </div>
      <button type="button" class="btn btn-ghost-danger" data-del-role>删除</button>
    </div>
    <div class="sys-role-form">
      <div class="form-fields">
        <label>名称<input class="field" name="name" value="${item.name}"></label>
        <label>数据范围<select class="field" name="scope">${optionList(SYS_SCOPES, item.scope)}</select></label>
        <label class="span-2">说明<textarea name="desc" rows="2">${item.desc || ""}</textarea></label>
      </div>
      <h3 class="form-section">菜单</h3>
      ${checkBoxes("menus", SYS_MENUS, item.menus)}
      <h3 class="form-section">操作</h3>
      ${checkBoxes("actions", SYS_ACTIONS, item.actions)}
      <h3 class="form-section">对象引用</h3>
      ${checkBoxes("objects", SYS_OBJECTS, item.objects)}
      <div class="form-foot">
        <button type="button" class="btn btn-primary" data-save>保存</button>
      </div>
    </div>
  `;
}

function employeeMatches(row, filter, kind, query) {
  if (filter === "在册" && row.status !== "在册") return false;
  if (filter === "离场" && row.status !== "离场") return false;
  if (kind && kind !== "全部" && row.kind !== kind) return false;
  const q = (query || "").trim().toLowerCase();
  if (!q) return true;
  const certs = workCertsForEmployee(row).map((c) => c.cert).join(" ");
  const hay = `${row.id} ${row.userId || ""} ${row.name} ${row.code || ""} ${row.org || ""} ${row.job || ""} ${row.team || ""} ${row.tagId || ""} ${row.locMode || ""} ${certs}`.toLowerCase();
  return hay.includes(q);
}

function sysEmployeeTable(rows, focusId) {
  if (!rows.length) return `<div class="table-wrap"><p class="meta" style="padding:16px">没有员工。</p></div>`;
  const body = rows.map((row) => {
    const live = livePersonForEmployee(row.id);
    return `
    <tr class="${row.id === focusId ? "is-on" : ""}" data-id="${row.id}">
      <td><button type="button" class="cell-link" data-id="${row.id}">${esc(row.name)}</button></td>
      <td class="meta">${esc(row.code || "—")}</td>
      <td><span class="dot ${workStatusTone(row.status)}">${esc(row.status)}</span></td>
      <td>${esc(row.org || "—")}</td>
      <td>${esc(row.job || "—")}</td>
      <td class="meta">${esc(row.tagId || "未绑定")}</td>
      <td>${esc(row.locMode || "—")}</td>
      <td>${live ? `<a class="text-link" href="#/t1/overview?id=${encodeURIComponent(live.id)}">${esc(live.status || "在区")}</a>` : "—"}</td>
      <td class="table-actions"><button type="button" class="btn" data-edit-row="${row.id}">编辑</button></td>
    </tr>`;
  }).join("");
  return `
    <div class="table-wrap emp-loc-table">
      <table>
        <thead>
          <tr>
            <th>姓名</th>
            <th>工号</th>
            <th>状态</th>
            <th>组织</th>
            <th>岗位</th>
            <th>定位卡</th>
            <th>制式</th>
            <th>实时</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function openEmployeeCertDialog(list, idx, after) {
  const isNew = idx == null;
  const row = isNew
    ? { cert: WORK_CERT_NAMES[0], no: "", status: "合格", due: "" }
    : { ...list[idx] };
  openAlertDialog(isNew ? "新增资格证" : "编辑资格证", `
    <div class="form-fields">
      <label>证照类型
        <select class="field" id="emp-cert-type">${WORK_CERT_NAMES.map((name) => (
          `<option${name === row.cert ? " selected" : ""}>${esc(name)}</option>`
        )).join("")}</select>
      </label>
      <label>证号<input class="field" id="emp-cert-no" value="${esc(row.no || "")}"></label>
      <label>状态
        <select class="field" id="emp-cert-status">${WORK_CERT_STATUS.map((name) => (
          `<option${name === row.status ? " selected" : ""}>${esc(name)}</option>`
        )).join("")}</select>
      </label>
      <label>有效期至<input class="field" id="emp-cert-due" value="${esc(row.due || "")}" placeholder="如 2027-06"></label>
    </div>
  `, (dlg, err) => {
    const cert = dlg.querySelector("#emp-cert-type")?.value;
    if (!cert) {
      err.hidden = false;
      err.textContent = "请选择证照类型。";
      return false;
    }
    const next = {
      cert,
      no: dlg.querySelector("#emp-cert-no")?.value.trim() || "",
      status: dlg.querySelector("#emp-cert-status")?.value || "合格",
      due: dlg.querySelector("#emp-cert-due")?.value.trim() || ""
    };
    if (isNew) list.push(next);
    else list[idx] = next;
    after();
    return true;
  }, "确认", true);
}

function trainingResultTone(result) {
  if (result === "通过") return workStatusTone("合格");
  if (result === "未通过") return workStatusTone("已驳回");
  return workStatusTone("停用");
}

function showEmployeeEditor(item, after) {
  const orgs = [...new Set((data.sysOrgs || []).map((row) => row.name))];
  const draftCerts = workCertsForEmployee(item).map((row) => ({ ...row }));
  const trainingRows = workTrainingsForEmployee(item);
  const users = (data.sysUsers || []).filter((u) => u.status !== "停用");
  const tabCount = (n) => (n ? `<span class="detail-tab-count">${n}</span>` : "");
  const bindEmployeeEditorTabs = (dlg) => {
    const syncCertTabCount = () => {
      const tab = dlg.querySelector('[data-emp-tab="certs"]');
      if (!tab) return;
      const old = tab.querySelector(".detail-tab-count");
      old?.remove();
      if (draftCerts.length) {
        tab.insertAdjacentHTML("beforeend", tabCount(draftCerts.length));
      }
    };
    const showTab = (name) => {
      dlg.querySelectorAll("[data-emp-tab]").forEach((btn) => {
        const on = btn.dataset.empTab === name;
        btn.classList.toggle("is-on", on);
        btn.setAttribute("aria-selected", on ? "true" : "false");
      });
      dlg.querySelectorAll("[data-emp-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.empPanel !== name;
      });
      if (name === "certs") renderCertTableWrapped(dlg.querySelector("#emp-cert-host"));
      if (name === "training") renderTrainingTable(dlg.querySelector("#emp-training-host"));
    };
    dlg.querySelectorAll("[data-emp-tab]").forEach((btn) => {
      btn.addEventListener("click", () => showTab(btn.dataset.empTab));
    });
    const certHost = dlg.querySelector("#emp-cert-host");
    const renderCertTableWrapped = (host) => {
      if (!host) return;
      host.innerHTML = `
        <div class="table-wrap work-cfg-table">
          <table>
            <thead><tr><th>证照类型</th><th>证号</th><th>状态</th><th>有效期至</th><th>操作</th></tr></thead>
            <tbody>
              ${draftCerts.length ? draftCerts.map((row, i) => `
                <tr>
                  <td>${esc(row.cert)}</td>
                  <td>${esc(row.no || "—")}</td>
                  <td>${esc(row.status)}</td>
                  <td>${esc(row.due || "—")}</td>
                  <td class="table-actions">
                    <button type="button" class="btn btn-sm" data-cert-edit data-idx="${i}">编辑</button>
                    <button type="button" class="btn btn-sm btn-ghost" data-cert-del data-idx="${i}">删除</button>
                  </td>
                </tr>`).join("") : `<tr><td colspan="5" class="meta">未登记资格证</td></tr>`}
            </tbody>
          </table>
        </div>
        <button type="button" class="btn btn-sm" data-cert-add style="margin-top:8px">新增资格证</button>
        <p class="meta" style="margin-top:8px">工单开票按员工姓名对证；保存后写入作业资格证台账。</p>
      `;
      host.querySelector("[data-cert-add]")?.addEventListener("click", () => {
        openEmployeeCertDialog(draftCerts, null, () => {
          renderCertTableWrapped(host);
          syncCertTabCount();
        });
      });
      host.querySelectorAll("[data-cert-edit]").forEach((btn) => {
        btn.addEventListener("click", () => {
          openEmployeeCertDialog(draftCerts, Number(btn.dataset.idx), () => {
            renderCertTableWrapped(host);
            syncCertTabCount();
          });
        });
      });
      host.querySelectorAll("[data-cert-del]").forEach((btn) => {
        btn.addEventListener("click", () => {
          draftCerts.splice(Number(btn.dataset.idx), 1);
          renderCertTableWrapped(host);
          syncCertTabCount();
        });
      });
    };
    const renderTrainingTable = (host) => {
      if (!host) return;
      host.innerHTML = `
        <div class="table-wrap work-cfg-table">
          <table>
            <thead><tr><th>课程/模块</th><th>类型</th><th>结果</th><th>得分</th><th>时间</th><th>来源</th></tr></thead>
            <tbody>
              ${trainingRows.length ? trainingRows.map((row) => `
                <tr>
                  <td>${esc(row.course || "—")}</td>
                  <td>${esc(row.kind || "—")}</td>
                  <td><span class="dot ${trainingResultTone(row.result)}">${esc(row.result || "—")}</span></td>
                  <td>${esc(row.score || "—")}</td>
                  <td class="meta">${esc(row.time || "—")}</td>
                  <td class="meta">${esc(row.source || "—")}</td>
                </tr>`).join("") : `<tr><td colspan="6" class="meta">暂无培训或考核记录</td></tr>`}
            </tbody>
          </table>
        </div>
        <p class="meta" style="margin-top:8px">厂内培训与操作考核结论，由仿真培训平台或公司培训系统同步，只读展示。官方作业资格证见「作业资格证」页签，二者独立维护。</p>
      `;
    };
    const renderLocPanel = (host) => {
      if (!host) return;
      const live = livePersonForEmployee(item.id);
      host.innerHTML = `
        <div class="form-fields">
          <label>定位卡号<input class="field" name="tagId" value="${esc(item.tagId || "")}" placeholder="如 TAG-2201"></label>
          <label>制式
            <select class="field" name="locMode">
              <option value="">—</option>
              ${LOC_MODES.map((name) => `<option${name === (item.locMode || "") ? " selected" : ""}>${esc(name)}</option>`).join("")}
            </select>
          </label>
          <label>绑定状态
            <select class="field" name="tagStatus">
              ${TAG_BIND_STATUS.map((name) => `<option${name === (item.tagStatus || "未绑定") ? " selected" : ""}>${esc(name)}</option>`).join("")}
            </select>
          </label>
          <label>电量<input class="field" name="tagBattery" value="${esc(item.tagBattery || "")}" placeholder="如 82%"></label>
          <label>最后心跳<input class="field" name="tagHeartbeat" value="${esc(item.tagHeartbeat || "")}" placeholder="如 11:42"></label>
        </div>
        <p class="meta" style="margin-top:8px">卡号与人员一对一。厂内用 UWB，厂外/尾矿巡视用 GPS。清空卡号即解绑。</p>
        ${live
          ? `<p class="meta">实时 ${esc(live.status || "在区")} · ${esc(personZoneName(live))}　<a class="text-link" href="#/t1/overview?id=${encodeURIComponent(live.id)}">在地图查看</a></p>`
          : `<p class="meta">当前无实时落点，发卡后由定位网关上报。</p>`}
      `;
    };
    renderCertTableWrapped(certHost);
    renderLocPanel(dlg.querySelector("#emp-loc-host"));
    showTab("profile");
  };
  openAlertDialog(`编辑员工 · ${item.name}`, `
    <div class="detail-tabs" role="tablist">
      <button type="button" class="detail-tab is-on" role="tab" aria-selected="true" data-emp-tab="profile">档案</button>
      <button type="button" class="detail-tab" role="tab" aria-selected="false" data-emp-tab="loc">定位设备</button>
      <button type="button" class="detail-tab" role="tab" aria-selected="false" data-emp-tab="certs">作业资格证${tabCount(draftCerts.length)}</button>
      <button type="button" class="detail-tab" role="tab" aria-selected="false" data-emp-tab="training">培训考核${tabCount(trainingRows.length)}</button>
    </div>
    <div class="detail-tab-panel">
      <div data-emp-panel="profile">
        <div class="form-fields">
          <label>员工 ID<input class="field" name="emp-id" value="${esc(item.id)}" readonly></label>
          <label>姓名<input class="field" name="name" value="${esc(item.name)}"></label>
          <label>工号<input class="field" name="code" value="${esc(item.code || "")}" placeholder="可选"></label>
          <label>人员类型<select class="field" name="kind">${EMPLOYEE_KINDS.map((name) => (
            `<option${name === (item.kind || "自有") ? " selected" : ""}>${esc(name)}</option>`
          )).join("")}</select></label>
          <label>状态<select class="field" name="status">${EMPLOYEE_STATUS.map((name) => (
            `<option${name === (item.status || "在册") ? " selected" : ""}>${esc(name)}</option>`
          )).join("")}</select></label>
          <label>组织<select class="field" name="org">${optionList(orgs, item.org)}</select></label>
          <label>岗位<input class="field" name="job" value="${esc(item.job || "")}"></label>
          <label>班组<input class="field" name="team" value="${esc(item.team || "")}" placeholder="如 萃取甲班"></label>
          <label>手机<input class="field" name="mobile" value="${esc(item.mobile || "")}"></label>
          <label class="span-2">关联用户
            <select class="field" name="userId">
              <option value="">— 不关联</option>
              ${users.map((u) => {
                const taken = (data.employees || []).find((e) => e.userId === u.id && e.id !== item.id);
                const hint = taken ? ` · 已绑 ${taken.name}` : "";
                return `<option value="${esc(u.id)}"${u.id === item.userId ? " selected" : ""}>${esc(u.id)} · ${esc(u.account)} · ${esc(u.name)}${hint}</option>`;
              }).join("")}
            </select>
          </label>
          <label class="span-2">说明<textarea class="field" name="note" rows="2">${esc(item.note || "")}</textarea></label>
        </div>
      </div>
      <div data-emp-panel="loc" hidden>
        <div id="emp-loc-host"></div>
      </div>
      <div data-emp-panel="certs" hidden>
        <div id="emp-cert-host"></div>
      </div>
      <div data-emp-panel="training" hidden>
        <div id="emp-training-host"></div>
      </div>
    </div>
  `, (dlg, err) => {
    const name = formVal(dlg, "name").trim();
    if (!name) {
      err.hidden = false;
      err.textContent = "请填写姓名。";
      return false;
    }
    const dup = (data.employees || []).some((row) => row.id !== item.id && row.name === name);
    if (dup) {
      err.hidden = false;
      err.textContent = "姓名与另一位员工重复。";
      return false;
    }
    const tagId = formVal(dlg, "tagId").trim();
    const tagTaken = tagId && (data.employees || []).find((row) => row.id !== item.id && row.tagId === tagId);
    if (tagTaken) {
      err.hidden = false;
      err.textContent = `定位卡 ${tagId} 已绑定 ${tagTaken.name}。`;
      return false;
    }
    item.name = name;
    item.code = formVal(dlg, "code");
    item.kind = formVal(dlg, "kind") || "自有";
    item.status = formVal(dlg, "status") || "在册";
    item.org = formVal(dlg, "org");
    item.job = formVal(dlg, "job");
    item.team = formVal(dlg, "team");
    item.mobile = formVal(dlg, "mobile");
    item.tagId = tagId;
    item.locMode = formVal(dlg, "locMode");
    item.tagStatus = formVal(dlg, "tagStatus") || (tagId ? "已绑定" : "未绑定");
    item.tagBattery = formVal(dlg, "tagBattery");
    item.tagHeartbeat = formVal(dlg, "tagHeartbeat");
    if (!item.tagId) {
      item.tagStatus = item.tagStatus === "已回收" ? "已回收" : "未绑定";
      item.locMode = item.locMode || "";
    } else if (item.tagStatus === "未绑定") {
      item.tagStatus = "已绑定";
    }
    const userId = formVal(dlg, "userId") || "";
    const userTaken = userId && (data.employees || []).find((row) => row.userId === userId && row.id !== item.id);
    if (userTaken) {
      err.hidden = false;
      err.textContent = `用户 ${userId} 已关联员工 ${userTaken.id}。`;
      return false;
    }
    bindEmployeeUser(item, userId);
    item.note = formVal(dlg, "note");
    replaceWorkCertsForEmployee(item, draftCerts);
    syncCertLedgersFromWorkCerts();
    ensurePeopleLinked();
    persist();
    after?.();
    return true;
  }, "保存", true, (dlg) => {
    dlg.querySelector(".modal")?.classList.add("work-modal");
    bindEmployeeEditorTabs(dlg);
  });
}

function parseLocImportText(text) {
  return String(text || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    .filter((line) => !/^工号/.test(line))
    .map((line) => {
      const [code, name, tagId, locMode, team, org] = line.split(/[,，\t]/).map((part) => part.trim());
      return { code, name, tagId, locMode, team, org };
    })
    .filter((row) => row.name);
}

function locImportPreviewHtml(rows) {
  if (!rows.length) return `<p class="meta">没有可导入的行。</p>`;
  return `
    <div class="table-wrap loc-import-preview">
      <table>
        <thead><tr><th>工号</th><th>姓名</th><th>卡号</th><th>制式</th><th>班组</th></tr></thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              <td>${esc(row.code || "—")}</td>
              <td>${esc(row.name)}</td>
              <td>${esc(row.tagId || "—")}</td>
              <td>${esc(row.locMode || "—")}</td>
              <td>${esc(row.team || "—")}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function applyLocImportRows(rows) {
  data.employees = data.employees || [];
  rows.forEach((row) => {
    let emp = data.employees.find((item) => (row.code && item.code === row.code) || item.name === row.name);
    if (!emp) {
      emp = {
        id: `em-imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: row.name,
        code: row.code || "",
        org: row.org || (data.sysOrgs || [])[0]?.name || "",
        job: "现场作业",
        kind: "自有",
        status: "在册",
        userId: "",
        mobile: "",
        note: "批量导入发卡",
        ...emptyLocFields()
      };
      data.employees.push(emp);
    }
    if (row.code) emp.code = row.code;
    if (row.org) emp.org = row.org;
    if (row.team) emp.team = row.team;
    emp.tagId = row.tagId || "";
    emp.locMode = LOC_MODES.includes(row.locMode) ? row.locMode : (emp.locMode || "");
    emp.tagStatus = emp.tagId ? "已绑定" : "未绑定";
    if (emp.tagId && !emp.tagHeartbeat) emp.tagHeartbeat = nowTime();
    if (emp.tagId && !emp.tagBattery) emp.tagBattery = "100%";
    const live = (data.people || []).find((p) => p.employeeId === emp.id || p.name === emp.name);
    if (live) live.employeeId = emp.id;
  });
  ensurePeopleLinked();
  persist();
}

function openLocImportDialog(after) {
  openAlertDialog("批量导入定位卡", `
    <p class="meta">CSV 列：工号,姓名,卡号,制式,班组,单位。按工号或姓名匹配已有员工；没有则新增档案并绑定。</p>
    <div class="form-fields">
      <label class="span-2">选择文件
        <input class="field" type="file" id="loc-import-file" accept=".csv,.txt,text/csv">
      </label>
      <label class="span-2">名单
        <textarea class="field" id="loc-import-text" rows="6">${esc(LOC_IMPORT_SAMPLE)}</textarea>
      </label>
    </div>
    <div id="loc-import-preview">${locImportPreviewHtml(parseLocImportText(LOC_IMPORT_SAMPLE))}</div>
  `, (dlg, err) => {
    const rows = parseLocImportText(dlg.querySelector("#loc-import-text")?.value || "");
    if (!rows.length) {
      err.hidden = false;
      err.textContent = "没有可导入的行。";
      return false;
    }
    const dupTag = rows.find((row, i) => row.tagId && rows.findIndex((other) => other.tagId === row.tagId) !== i);
    if (dupTag) {
      err.hidden = false;
      err.textContent = `名单中卡号 ${dupTag.tagId} 重复。`;
      return false;
    }
    applyLocImportRows(rows);
    after?.();
    return true;
  }, "导入", true, (dlg) => {
    const sync = () => {
      const rows = parseLocImportText(dlg.querySelector("#loc-import-text")?.value || "");
      const host = dlg.querySelector("#loc-import-preview");
      if (host) host.innerHTML = locImportPreviewHtml(rows);
    };
    dlg.querySelector("#loc-import-text")?.addEventListener("input", sync);
    dlg.querySelector("#loc-import-file")?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const box = dlg.querySelector("#loc-import-text");
        if (box) box.value = String(reader.result || "");
        sync();
      };
      reader.readAsText(file);
    });
  });
}

function renderSysEmployeesPage(root, focusId) {
  let focus = focusId;
  let filter = "在册";
  let kind = "全部";
  let query = "";

  function openEditor(id) {
    const item = (data.employees || []).find((row) => row.id === id);
    if (item) showEmployeeEditor(item, paint);
  }

  function paint() {
    ensureEmployees();
    const all = data.employees || [];
    const rows = all.filter((row) => employeeMatches(row, filter, kind, query));
    if (focus && !rows.some((row) => row.id === focus)) focus = rows[0]?.id || null;
    root.innerHTML = `
      <div class="sys-stack">
      <div class="filter-row alert-toolbar">
        <div class="alert-status-chips">
          ${["在册", "离场", "全部"].map((name) => (
            `<button type="button" class="chip${filter === name ? " is-on" : ""}" data-filter="${name}">${name}</button>`
          )).join("")}
        </div>
        <select class="field alert-q-field" id="emp-kind" style="max-width:120px">
          ${["全部", ...EMPLOYEE_KINDS].map((name) => (
            `<option${kind === name ? " selected" : ""}>${esc(name)}</option>`
          )).join("")}
        </select>
        <input type="search" class="field alert-q-field" id="emp-q" placeholder="姓名、工号、定位卡、组织" value="${esc(query)}" autocomplete="off">
        <button type="button" class="btn btn-primary" data-search>搜索</button>
      </div>
      ${sysEmployeeTable(rows, focus)}
      <div class="sys-table-toolbar">
        <button type="button" class="btn" data-add>新增员工</button>
        <button type="button" class="btn" data-import-loc>批量导入</button>
        <a class="btn" href="#/t5/tickets">作业工单</a>
      </div>
      <p class="meta">档案与定位卡在同一人上维护；批量导入按工号/姓名绑定 UWB 或 GPS 卡。实时落点见综合监控。</p>
      </div>
    `;
    root.querySelectorAll("[data-filter]").forEach((btn) => {
      btn.addEventListener("click", () => { filter = btn.dataset.filter; paint(); });
    });
    root.querySelector("#emp-kind")?.addEventListener("change", (ev) => { kind = ev.target.value; paint(); });
    root.querySelector("[data-search]")?.addEventListener("click", () => {
      query = root.querySelector("#emp-q")?.value || "";
      paint();
    });
    root.querySelectorAll("tr[data-id]").forEach((row) => {
      row.addEventListener("click", (ev) => {
        if (ev.target.closest("[data-edit-row]") || ev.target.closest("a")) return;
        focus = row.dataset.id;
        paint();
      });
    });
    root.querySelectorAll(".cell-link[data-id]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        focus = btn.dataset.id;
        paint();
      });
    });
    root.querySelectorAll("[data-edit-row]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        openEditor(btn.dataset.editRow);
      });
    });
    root.querySelector("[data-import-loc]")?.addEventListener("click", () => {
      openLocImportDialog(paint);
    });
    root.querySelector("[data-add]")?.addEventListener("click", () => {
      const fresh = {
        id: `em-${Date.now()}`,
        name: "新员工",
        code: "",
        org: (data.sysOrgs || [])[0]?.name || "",
        job: "现场作业",
        kind: "自有",
        status: "在册",
        userId: "",
        mobile: "",
        note: "",
        ...emptyLocFields()
      };
      data.employees = data.employees || [];
      data.employees.push(fresh);
      persist();
      focus = fresh.id;
      showEmployeeEditor(fresh, paint);
    });
  }
  paint();
}

function renderSysOrgPage(root, focusId) {
  renderSysIamPage(root, focusId, "org");
}

function renderSysRolesPage(root, focusId) {
  renderSysIamPage(root, focusId, "roles");
}

function renderSysUsersPage(root, focusId) {
  renderSysIamPage(root, focusId, "users");
}

function renderSysIamPage(root, focusId, kind) {
  let focus = focusId;
  const orgCollapsed = new Set();

  function openOrgEditor(item) {
    showSysOrgEditor(item, () => paint());
  }

  function openUserEditor(item) {
    showSysUserEditor(item, () => paint());
  }

  function paint() {
    const orgRows = data.sysOrgs || [];
    const roleRows = data.sysRoles || [];
    const userRows = data.sysUsers || [];
    let item = null;
    let body = "";
    const toolbar = `<div class="sys-table-toolbar"><button type="button" class="btn" data-add>新增${kind === "org" ? "组织" : "用户"}</button></div>`;

    if (kind === "org") {
      const rows = orgRows;
      item = rows.find((row) => row.id === focus) || rows[0] || null;
      focus = item?.id || null;
      body = `
        <div class="sys-stack">
          ${sysOrgTreeTable(focus, orgCollapsed)}
          ${toolbar}
        </div>
      `;
    } else if (kind === "users") {
      const rows = userRows;
      item = rows.find((row) => row.id === focus) || rows[0] || null;
      focus = item?.id || null;
      body = `
        <div class="sys-stack">
          ${sysUserTable(focus)}
          ${toolbar}
        </div>
      `;
    } else {
      const rows = roleRows;
      item = rows.find((row) => row.id === focus) || rows[0] || null;
      focus = item?.id || null;
      body = `
        <div class="alert-layout sys-org-layout">
          <aside class="alert-list-panel sys-nav-panel">
            <div class="sys-panel-head">
              <span class="sys-panel-title">角色列表</span>
              <button type="button" class="btn" data-add>新增</button>
            </div>
            <div class="sys-panel-body">
              ${sysRoleNavList(rows, focus)}
            </div>
          </aside>
          <section class="alert-detail">
            ${item ? sysRoleEdit(item) : ""}
          </section>
        </div>
      `;
    }

    root.innerHTML = `
      ${body}
    `;

    root.querySelectorAll("tr[data-id]").forEach((row) => {
      row.addEventListener("click", (ev) => {
        if (ev.target.closest("[data-toggle]") || ev.target.closest(".table-actions")) return;
        focus = row.dataset.id;
        paint();
      });
    });
    root.querySelectorAll(".cell-link[data-id]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        focus = btn.dataset.id;
        paint();
      });
    });
    root.querySelectorAll("[data-edit-row]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const id = btn.dataset.editRow;
        if (kind === "org") {
          const target = orgRows.find((row) => row.id === id);
          if (target) openOrgEditor(target);
        } else if (kind === "users") {
          const target = userRows.find((row) => row.id === id);
          if (target) openUserEditor(target);
        }
      });
    });
    root.querySelectorAll("[data-toggle]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const id = btn.dataset.toggle;
        if (orgCollapsed.has(id)) orgCollapsed.delete(id);
        else orgCollapsed.add(id);
        paint();
      });
    });
    root.querySelectorAll(".sys-nav-item[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => { focus = btn.dataset.id; paint(); });
    });
    root.querySelector("[data-del-role]")?.addEventListener("click", () => {
      if (!item || kind !== "roles") return;
      if (!window.confirm(`确定删除角色「${item.name}」？`)) return;
      data.sysRoles = roleRows.filter((row) => row.id !== item.id);
      if (focus === item.id) focus = null;
      paint();
    });
    root.querySelectorAll("[data-add]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (kind === "org") {
          const fresh = { id: `o-${Date.now()}`, name: "新组织", parent: "迪兹瓦铜钴矿", kind: "分厂", duty: "", sync: "本地", note: "", status: "启用" };
          data.sysOrgs.push(fresh);
          focus = fresh.id;
          openOrgEditor(fresh);
        } else if (kind === "roles") {
          const fresh = { id: `r-${Date.now()}`, name: "新角色", scope: "本分厂", desc: "", menus: ["告警中心"], actions: ["查看"], objects: ["告警"] };
          data.sysRoles.push(fresh);
          focus = fresh.id;
          paint();
        } else {
          const fresh = { id: `u-${Date.now()}`, name: "新用户", account: "newuser", org: "湿法分厂值班", role: "分厂值班员", plant: "湿法分厂", status: "启用", source: "本地账号", mobile: "", shift: "" };
          data.sysUsers.push(fresh);
          focus = fresh.id;
          openUserEditor(fresh);
        }
      });
    });
    root.querySelector("[data-save]")?.addEventListener("click", () => {
      if (!item || kind !== "roles") return;
      item.name = formVal(root, "name") || item.name;
      item.scope = formVal(root, "scope");
      item.desc = formVal(root, "desc");
      item.menus = formChecks(root, "menus");
      item.actions = formChecks(root, "actions");
      item.objects = formChecks(root, "objects");
      paint();
    });
  }
  paint();
}

function renderSysDictPage(root, focusId) {
  let focus = focusId;

  function paint() {
    const dicts = data.sysDicts || [];
    const item = dicts.find((row) => row.id === focus) || dicts[0] || null;
    focus = item?.id || null;
    root.innerHTML = `
      <div class="alert-layout sys-org-layout">
        <aside class="alert-list-panel sys-nav-panel">
          ${dicts.map((row) => (
            `<button type="button" class="sys-nav-item${row.id === focus ? " is-on" : ""}" data-id="${row.id}">${row.name}</button>`
          )).join("")}
        </aside>
        <section class="alert-detail">
          ${item ? `
            <div class="detail-head dict-detail-head">
              <div>
                <h2>${item.name}</h2>
                <p class="meta">${item.code}${item.note ? ` · ${item.note}` : ""}</p>
              </div>
              <button type="button" class="btn btn-primary" data-add-dict-item>新增</button>
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>取值</th><th>显示名</th><th>状态</th><th>操作</th></tr></thead>
                <tbody>
                  ${(item.items || []).map((row, index) => `
                    <tr>
                      <td class="mono">${row.value}</td>
                      <td>${row.label}</td>
                      <td><span class="dot ${sysTone(row.enabled ? "启用" : "停用")}">${row.enabled ? "启用" : "停用"}</span></td>
                      <td class="table-actions"><button type="button" class="btn" data-toggle="${index}">${row.enabled ? "停用" : "启用"}</button></td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          ` : "<p class=\"meta\">没有字典。</p>"}
        </section>
      </div>
    `;
    root.querySelectorAll(".sys-nav-item[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => { focus = btn.dataset.id; paint(); });
    });
    root.querySelectorAll("[data-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const row = item.items[Number(btn.dataset.toggle)];
        if (!row) return;
        row.enabled = !row.enabled;
        paint();
      });
    });
    root.querySelector("[data-add-dict-item]")?.addEventListener("click", () => {
      openAlertDialog(`新增字典项 · ${item.name}`, `
        <div class="form-fields">
          <label>取值<input class="field" name="value" placeholder="编码或枚举值"></label>
          <label>显示名<input class="field" name="label" placeholder="界面显示"></label>
        </div>
      `, (backdrop) => {
        const value = formVal(backdrop, "value");
        const label = formVal(backdrop, "label") || value;
        if (!value) {
          const err = backdrop.querySelector("#modal-err");
          err.hidden = false;
          err.textContent = "请填写取值。";
          return false;
        }
        item.items = item.items || [];
        item.items.push({ value, label, enabled: true });
        paint();
        return true;
      }, "保存", true);
    });
  }
  paint();
}

const PARAM_GROUP_ORDER = ["告警", "定位", "视频AI", "识别复核", "值班"];

function paramGroupsFromData(params) {
  const inData = new Set((params || []).map((row) => row.group));
  return PARAM_GROUP_ORDER.filter((name) => inData.has(name));
}

function sysParamGroupNav(groups, activeGroup) {
  return groups.map((name) => (
    `<button type="button" class="sys-nav-item${name === activeGroup ? " is-on" : ""}" data-group="${name}">${name}</button>`
  )).join("");
}

function sysParamGroupTable(rows) {
  if (!rows.length) return `<p class="meta">该分组下没有参数。</p>`;
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>参数</th>
            <th>编码</th>
            <th>取值</th>
            <th>单位</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              <td>${row.name}</td>
              <td class="mono">${row.code}</td>
              <td><input class="field" name="param-${row.id}" value="${row.value}"></td>
              <td>${row.unit || "—"}</td>
              <td class="meta">${row.note || ""}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderSysParamsPage(root, focusId) {
  const params = data.sysParams || [];
  const groups = paramGroupsFromData(params);
  let group = groups[0] || "告警";
  if (focusId) {
    const byId = params.find((row) => row.id === focusId);
    if (byId && groups.includes(byId.group)) group = byId.group;
  }

  function paint() {
    const rows = params.filter((row) => row.group === group);
    root.innerHTML = `
      <div class="alert-layout sys-org-layout">
        <aside class="alert-list-panel sys-nav-panel">
          ${groups.length ? sysParamGroupNav(groups, group) : `<p class="meta" style="padding:8px 10px">没有参数分组。</p>`}
        </aside>
        <section class="alert-detail">
          <div class="detail-head">
            <div>
              <h2>${group}</h2>
              <p class="meta">${rows.length} 项参数</p>
            </div>
          </div>
          ${sysParamGroupTable(rows)}
          <div class="form-foot">
            <button type="button" class="btn btn-primary" data-save-params>保存</button>
          </div>
        </section>
      </div>
    `;
    root.querySelectorAll("[data-group]").forEach((btn) => {
      btn.addEventListener("click", () => { group = btn.dataset.group; paint(); });
    });
    root.querySelector("[data-save-params]")?.addEventListener("click", () => {
      rows.forEach((row) => {
        row.value = formVal(root, `param-${row.id}`) || row.value;
      });
      paint();
    });
  }
  paint();
}

function renderSysAudit(root, route) {
  let module = "全部";
  let user = "全部";
  let query = "";

  function rowsOf() {
    return (data.sysAudits || []).filter((item) => {
      if (module !== "全部" && item.module !== module) return false;
      if (user !== "全部" && item.user !== user) return false;
      if (query && ![item.id, item.object, item.action, item.detail].join(" ").includes(query)) return false;
      return true;
    });
  }

  function paint() {
    const rows = rowsOf();
    const modules = ["全部", ...new Set((data.sysAudits || []).map((row) => row.module))];
    const users = ["全部", ...new Set((data.sysAudits || []).map((row) => row.user))];
    root.innerHTML = `
      <div class="filter-row">
        <select class="field" name="module">${optionList(modules, module)}</select>
        <select class="field" name="user">${optionList(users, user)}</select>
        <input class="field search" name="q" placeholder="编号、对象、动作" value="${query}">
        <button type="button" class="btn btn-primary" data-search>搜索</button>
        <button type="button" class="btn btn-ghost" data-reset${module === "全部" && user === "全部" && !query ? " disabled" : ""}>重置</button>
      </div>
      <div class="table-wrap sys-audit-table">
        <table>
          <thead>
            <tr>
              <th>时间</th>
              <th>用户</th>
              <th>模块</th>
              <th>动作</th>
              <th>对象</th>
              <th>结果</th>
              <th>终端</th>
              <th>详情</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length ? rows.map((row) => `
              <tr>
                <td class="mono">${row.time}</td>
                <td>${row.user}</td>
                <td>${row.module}</td>
                <td>${row.action}</td>
                <td class="mono">${row.object}</td>
                <td><span class="dot ${sysTone(row.result)}">${row.result}</span></td>
                <td class="mono">${row.ip}</td>
                <td>${row.detail}</td>
              </tr>
            `).join("") : `<tr><td class="empty" colspan="8">没有符合条件的记录。</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
    root.querySelector("[data-search]")?.addEventListener("click", () => {
      module = formVal(root, "module") || "全部";
      user = formVal(root, "user") || "全部";
      query = formVal(root, "q");
      paint();
    });
    root.querySelector("[data-reset]")?.addEventListener("click", () => {
      module = "全部";
      user = "全部";
      query = "";
      paint();
    });
  }
  paint();
}

function renderSysBase(root, focusId) {
  let kind = "隐患";
  let focus = focusId;

  function rowsOf() {
    return (data.sysLedgers || []).filter((row) => row.kind === kind);
  }

  function paint() {
    const rows = rowsOf();
    const item = rows.find((row) => row.id === focus) || rows[0] || null;
    focus = item?.id || null;
    const counts = Object.fromEntries(SYS_LEDGER_KINDS.map((name) => [
      name,
      (data.sysLedgers || []).filter((row) => row.kind === name).length
    ]));
    root.innerHTML = `
      <div class="filter-row">
        ${SYS_LEDGER_KINDS.map((name) => (
          `<button type="button" class="chip${kind === name ? " is-on" : ""}" data-kind="${name}">${name} ${counts[name]}</button>`
        )).join("")}
      </div>
      <div class="alert-layout">
        <aside class="alert-list-panel">
          ${rows.length ? rows.map((row) => `
            <button type="button" class="alert-card${row.id === item?.id ? " is-on" : ""}" data-id="${row.id}">
              <div class="row">
                <strong>${row.id}</strong>
                <span class="dot ${sysTone(row.status)}">${row.status}</span>
              </div>
              <p>${row.title}</p>
              <p class="meta">${row.place} · ${row.owner}</p>
            </button>
          `).join("") : `<p class="meta" style="padding:12px">这一类没有台账。</p>`}
        </aside>
        <section class="alert-detail">
          ${item ? `
            <div class="detail-head">
              <div>
                <h2>${item.id} · ${item.title}</h2>
                <p class="meta">${item.kind} · ${item.place}</p>
              </div>
              <span class="dot ${sysTone(item.status)}">${item.status}</span>
            </div>
            <div class="white-card">
              <h3>台账信息</h3>
              <div class="form-fields">
                <label class="span-2">标题<input class="field" name="title" value="${item.title}"></label>
                <label>地点<input class="field" name="place" value="${item.place}"></label>
                <label>责任单位<input class="field" name="owner" value="${item.owner}"></label>
                <label>状态<input class="field" name="status" value="${item.status}"></label>
                <label>到期 / 有效期<input class="field" name="due" value="${item.due || ""}"></label>
                <label class="span-2">说明<textarea name="note" rows="3">${item.note || ""}</textarea></label>
              </div>
            </div>
            <div class="form-foot">
              <button type="button" class="btn btn-primary" data-save>保存</button>
              ${item.kind === "隐患" ? `<a class="btn" href="#/t6/heatmap">热力分析</a>` : ""}
              ${item.kind === "事故" ? `<a class="btn" href="#/t6/events">事件档案</a>` : ""}
            </div>
          ` : "<p class=\"meta\">没有可查看的台账。</p>"}
        </section>
      </div>
    `;
    root.querySelectorAll("[data-kind]").forEach((btn) => {
      btn.addEventListener("click", () => { kind = btn.dataset.kind; focus = null; paint(); });
    });
    root.querySelectorAll("[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => { focus = btn.dataset.id; paint(); });
    });
    root.querySelector("[data-save]")?.addEventListener("click", () => {
      item.title = formVal(root, "title") || item.title;
      item.place = formVal(root, "place");
      item.owner = formVal(root, "owner");
      item.status = formVal(root, "status");
      item.due = formVal(root, "due");
      item.note = formVal(root, "note");
      paint();
    });
  }
  paint();
}

function bindChrome() {
  document.getElementById("tabs").addEventListener("click", (event) => {
    const button = event.target.closest("[data-tab]");
    if (!button) return;
    const tab = TABS.find((item) => item.id === button.dataset.tab);
    go(tab.id, tab.pages[0].id);
  });
  document.getElementById("reset-demo")?.addEventListener("click", () => {
    if (typeof SafetyStore !== "undefined") SafetyStore.reset();
    location.reload();
  });
}

async function boot() {
  data = await fetch("./data/safety.json?v=35").then((res) => res.json());
  try {
    const mapZones = await fetch("./data/deziwa-map-zones.json", { cache: "no-store" }).then((res) => res.json());
    if (Array.isArray(mapZones) && mapZones.length) data.zones = mapZones;
  } catch (_) { /* 无 map 文件时沿用 safety.json 内 zones */ }
  try {
    const camBundle = await fetch("./data/cameras.json?v=5").then((res) => res.json());
    if (Array.isArray(camBundle.cameras) && camBundle.cameras.length) {
      data.cameras = camBundle.cameras;
      data.cameraAreas = camBundle.cameraAreas || [];
      data.cameraMeta = camBundle.meta || {};
      if (camBundle.analysisPatch && data.analysis) {
        if (camBundle.analysisPatch.areas) data.analysis.areas = camBundle.analysisPatch.areas;
        if (camBundle.analysisPatch.hotspots) data.analysis.hotspots = camBundle.analysisPatch.hotspots;
      }
    }
  } catch (_) { /* keep seed cameras if any */ }
  if (typeof SafetyStore !== "undefined") SafetyStore.apply(data);
  migrateSysRoleMenus();
  migrateRuleZoneIds();
  migrateZoneFenceAlerts();
  migrateZoneAdmissions();
  migrateLocEventSources();
  bindAlertsOneEventEach();
  ensureAiCatalog();
  ensureWorkCatalog();
  applyWorkAlertSuppression();
  ensureAlertAssignees();
  data.kpis.openAlerts = openCount();
  bindChrome();
  const draw = () => {
    renderShell();
    renderPage();
  };
  if (typeof SafetyStore !== "undefined") {
    SafetyStore.subscribe((msg) => {
      if (msg.reset || !SafetyStore.read()) {
        location.reload();
        return;
      }
      SafetyStore.apply(data);
      migrateSysRoleMenus();
      migrateRuleZoneIds();
      migrateZoneFenceAlerts();
      migrateZoneAdmissions();
      migrateLocEventSources();
      bindAlertsOneEventEach();
      ensureAiCatalog();
      ensureWorkCatalog();
      applyWorkAlertSuppression();
      ensureAlertAssignees();
      data.kpis.openAlerts = openCount();
      draw();
    });
  }
  window.addEventListener("hashchange", () => {
    document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
    draw();
  });
  if (!location.hash) location.hash = "/t1/overview";
  else draw();
}

boot();
