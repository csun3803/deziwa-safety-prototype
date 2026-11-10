const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "../data/safety.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));

const typeByName = Object.fromEntries((data.eventTypes || []).map((et) => [et.name, et]));
const ruleByType = Object.fromEntries((data.rules || []).map((r) => [r.type, r]));

function entryPath(type) {
  return typeByName[type]?.strategy || "直接进正式告警";
}

function typeCode(type) {
  return typeByName[type]?.code || "";
}

function ruleIdOf(type) {
  return typeByName[type]?.ruleId || ruleByType[type]?.id || "";
}

const events = (data.aiEvents || []).map((row) => ({
  ...row,
  source: "视频AI",
  sourceEventId: row.id,
  typeCode: typeCode(row.type),
  entryPath: entryPath(row.type),
  zoneId: "",
  coordPrecision: row.precision || "摄像头点位",
  subjectKind: "未知",
  person: row.person || "",
  ruleId: ruleIdOf(row.type),
  deviceId: row.camera,
  summary: row.note || `${row.type} 置信度 ${row.confidence}%`,
  payload: { algo: row.algo, confidence: row.confidence, camera_id: row.camera }
}));

const extra = [
  {
    id: "SE-20261104-018",
    source: "定位",
    sourceEventId: "LOC-8841",
    type: "非法闯入",
    typeCode: "INTRUDE",
    level: 1,
    entryPath: "直接进正式告警",
    status: "已升告警",
    time: "12:40",
    plant: "湿法分厂",
    zoneId: "z-sx",
    place: "萃取+洗涤+反萃区",
    x: 172,
    y: 454,
    coordPrecision: "人员落点",
    subjectKind: "人员",
    person: "陈立 / 外来承包商",
    ruleId: "R-IN",
    alertId: "EVT-20261104-018",
    deviceId: "TAG-8841",
    summary: "无作业票进入萃取围栏 38 秒",
    payload: { tag_id: "TAG-8841", dwell_sec: 38, permit_ok: false }
  },
  {
    id: "SE-20261104-018B",
    source: "电子围栏",
    sourceEventId: "FENCE-z-sx-1241",
    type: "非法闯入",
    typeCode: "INTRUDE",
    level: 1,
    entryPath: "直接进正式告警",
    status: "已合并",
    time: "12:40",
    plant: "湿法分厂",
    zoneId: "z-sx",
    place: "萃取+洗涤+反萃区",
    x: 170,
    y: 450,
    coordPrecision: "区域落点",
    subjectKind: "人员",
    person: "陈立 / 外来承包商",
    ruleId: "R-IN",
    alertId: "EVT-20261104-018",
    mergedIntoId: "SE-20261104-018",
    deviceId: "FENCE-SX",
    summary: "萃取围栏越界，并入定位主事件",
    payload: { fence_id: "z-sx", action: "进入", dwell_sec: 38 }
  },
  {
    id: "SE-20261104-009",
    source: "定位",
    sourceEventId: "LOC-7712",
    type: "异常滞留",
    typeCode: "LOITER",
    level: 3,
    entryPath: "直接进正式告警",
    status: "已升告警",
    time: "11:52",
    plant: "湿法分厂",
    zoneId: "z-leach",
    place: "浸出区",
    x: 266,
    y: 256,
    coordPrecision: "人员落点",
    subjectKind: "人员",
    person: "王慧 / 浸出班长",
    ruleId: "R-LG",
    alertId: "EVT-20261104-009",
    deviceId: "TAG-7712",
    summary: "浸出槽区停留 16 分钟",
    payload: { tag_id: "TAG-7712", dwell_sec: 960 }
  },
  {
    id: "SE-20261104-006",
    source: "电子围栏",
    sourceEventId: "FENCE-z-tail-1048",
    type: "异常滞留",
    typeCode: "LOITER",
    level: 1,
    entryPath: "直接进正式告警",
    status: "已升告警",
    time: "10:48",
    plant: "尾矿库作业区",
    zoneId: "z-tail",
    place: "高位水池",
    x: 444.4,
    y: 481.4,
    coordPrecision: "区域落点",
    subjectKind: "未知",
    person: "未知人员",
    ruleId: "R-IN",
    alertId: "EVT-20261104-006",
    deviceId: "FENCE-TAIL",
    summary: "坝前围栏停留 12 分钟",
    payload: { fence_id: "z-tail", action: "停留", dwell_sec: 720 }
  },
  {
    id: "SE-20261104-011",
    source: "视频AI",
    sourceEventId: "AI-20261104-011",
    type: "安全帽缺失",
    typeCode: "HELMET",
    level: 2,
    entryPath: "先告警后复核",
    status: "待复核",
    confidence: 87,
    time: "11:28",
    camera: "cam-18",
    plant: "湿法分厂",
    place: "铜电积区",
    x: 496.8,
    y: 252.2,
    precision: "区域落点",
    coordPrecision: "区域落点",
    algo: "helmet-v3.2",
    timeout: false,
    subjectKind: "未知",
    person: "未识别人员",
    ruleId: "R-HL",
    alertId: "EVT-20261104-011",
    deviceId: "cam-18",
    summary: "先告警后复核，通道东侧抓拍",
    payload: { algo: "helmet-v3.2", confidence: 87, camera_id: "cam-18" }
  },
  {
    id: "SE-20261104-020",
    source: "人工上报",
    sourceEventId: "RPT-1104-07",
    type: "烟火",
    typeCode: "FIRE",
    level: 2,
    entryPath: "直接进正式告警",
    status: "已升告警",
    time: "13:05",
    plant: "选矿分厂",
    zoneId: "z-crush",
    place: "磨矿区",
    x: 250,
    y: 165,
    coordPrecision: "手工点选",
    subjectKind: "无对象",
    person: "",
    ruleId: "R-FR",
    alertId: "EVT-20261104-020",
    reporterName: "张磊",
    reporterJob: "破碎巡检",
    summary: "破碎南侧焦糊味，未见明火",
    payload: { category: "现场隐患", description: "破碎南侧焦糊味，未见明火", photo_count: 1 }
  },
  {
    id: "SE-20261101-033",
    source: "定位",
    sourceEventId: "LOC-5520",
    type: "异常滞留",
    typeCode: "LOITER",
    level: 3,
    entryPath: "直接进正式告警",
    status: "已升告警",
    time: "08:12",
    plant: "选矿分厂",
    place: "磨矿区",
    x: 123.5,
    y: 422.4,
    coordPrecision: "人员落点",
    subjectKind: "人员",
    person: "检修班组",
    ruleId: "R-LG",
    alertId: "EVT-20261101-033",
    deviceId: "TAG-5520",
    summary: "筛分平台停留超过阈值",
    payload: { tag_id: "TAG-5520", dwell_sec: 980 }
  }
];

data.events = [...events, ...extra];
delete data.aiEvents;

const dispatch = {
  非法闯入: { org: "湿法分厂值班", role: "当班值班员", assignee: "湿法分厂值班", assigneePerson: "李成" },
  安全帽缺失: { org: "湿法分厂值班", role: "当班值班员", assignee: "湿法分厂值班", assigneePerson: "李成" },
  异常滞留: { org: "湿法分厂值班", role: "浸出班长", assignee: "湿法分厂值班", assigneePerson: "李成" },
  烟火: { org: "选矿分厂值班", role: "当班值班员", assignee: "选矿分厂值班", assigneePerson: "" },
};

const eventIdsByAlert = {};
for (const ev of data.events) {
  if (!ev.alertId) continue;
  eventIdsByAlert[ev.alertId] = eventIdsByAlert[ev.alertId] || [];
  eventIdsByAlert[ev.alertId].push(ev.id);
}

data.alerts.forEach((alert) => {
  const d = dispatch[alert.type] || {};
  if (alert.plant === "选矿分厂") {
    alert.org = alert.org || "选矿分厂值班";
    alert.assignee = "选矿分厂值班";
    alert.role = d.role || "当班值班员";
  } else if (alert.plant === "尾矿库作业区") {
    alert.org = "尾矿库值班";
    alert.assignee = "尾矿库值班";
    alert.role = "坝体巡视";
  } else {
    alert.org = d.org || "湿法分厂值班";
    alert.role = d.role || "当班值班员";
    alert.assignee = d.assignee || "湿法分厂值班";
    alert.assigneePerson = d.assigneePerson || "李成";
  }
  alert.eventIds = eventIdsByAlert[alert.id] || [];
  if (!alert.notify) {
    const rule = ruleByType[alert.type];
    alert.notify = rule?.notify || "待办";
  }
});

data.alerts.unshift({
  id: "EVT-20261104-020",
  level: 2,
  type: "烟火",
  place: "磨矿区",
  plant: "选矿分厂",
  status: "待签收",
  time: "13:06",
  wait: "00:00",
  timeout: false,
  person: "人工上报",
  rule: "R-FR 烟火识别",
  camera: "",
  x: 250,
  y: 165,
  org: "选矿分厂值班",
  role: "当班值班员",
  assignee: "选矿分厂值班",
  notify: "待办 + 电话",
  eventIds: ["SE-20261104-020"],
  timeline: [
    { status: "原始事件", time: "13:05", actor: "张磊", note: "人工上报：破碎南侧焦糊味" },
    { status: "正式告警", time: "13:06", actor: "规则引擎", note: "直接进正式告警，派选矿值班" }
  ]
});

fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
console.log("events", data.events.length, "alerts", data.alerts.length);
