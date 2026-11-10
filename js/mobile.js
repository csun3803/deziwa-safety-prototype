const LEVEL_NAME = { 1: "一级", 2: "二级", 3: "三级", 4: "四级" };
const POSTS = [
  { id: "选矿现场值班", plant: "选矿分厂" },
  { id: "湿法现场值班", plant: "湿法分厂" },
  { id: "尾矿现场值班", plant: "尾矿库作业区" }
];
const MEASURES = ["已劝离", "已停工", "已监护", "已报班组", "其他"];
const RESULTS = ["风险已消除", "仍需持续监护", "需上级支援"];
const SEENS = ["情况属实", "不是这个问题", "看不清或无法靠近"];
const ADVICES = ["建议真警", "建议误报", "无法判断"];

let seed = null;
let initial = null;
let data = null;
let postId = sessionStorage.getItem("dzw-post") || "选矿现场值班";
let todoTab = sessionStorage.getItem("dzw-todo-tab") || "alert";
let toastTimer = 0;

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function post() {
  return POSTS.find((item) => item.id === postId) || POSTS[0];
}

function persist() {
  SafetyStore.save(data);
}

function cameraOf(id) {
  return data.cameras.find((item) => item.id === id) || null;
}

function alertsOf() {
  return (data.alerts || []).filter((item) => item.status === "处理中" && item.plant === post().plant);
}

function mobileEvents() {
  return data.events || data.aiEvents || [];
}

function checksOf() {
  return mobileEvents().filter((item) => (
    item.status === "待核查" && item.fieldTo === post().id && !item.fieldReply
  ));
}

function alertsAllOf() {
  return (data.alerts || [])
    .filter((item) => item.plant === post().plant)
    .sort((a, b) => parseDemoTime(b.time) - parseDemoTime(a.time));
}

function checksAllOf() {
  return mobileEvents()
    .filter((item) => item.fieldTo === post().id)
    .sort((a, b) => parseDemoTime(b.fieldSentAt || b.fieldReplyAt || b.time) - parseDemoTime(a.fieldSentAt || a.fieldReplyAt || a.time));
}

function postFieldLog(alert) {
  return (alert.timeline || []).filter((row) => row.actor === post().id).pop() || null;
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

function parseDemoTime(text) {
  const m = String(text || "").match(/(\d{1,2}):(\d{2})/);
  if (!m) return 0;
  return Number(m[1]) * 60 + Number(m[2]);
}

function parseRoute() {
  const hash = (location.hash || "#/home").replace(/^#\/?/, "");
  const [kind, id] = hash.split("/");
  if (kind === "alert" && id) return { page: "alert", id };
  if (kind === "check" && id) return { page: "check", id };
  if (kind === "alerts") return { page: "alerts" };
  if (kind === "checks") return { page: "checks" };
  if (kind === "todo" || kind === "inbox") return { page: "todo" };
  if (kind === "home" || !kind) return { page: "home" };
  return { page: "home" };
}

function go(hash) {
  const next = hash.startsWith("#") ? hash : `#${hash}`;
  if (location.hash === next) {
    render();
    return;
  }
  location.hash = next;
  render();
}

function showToast(text) {
  clearTimeout(toastTimer);
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = text;
  document.querySelector(".tablet").appendChild(el);
  toastTimer = setTimeout(() => el.remove(), 2200);
}

function render() {
  const route = parseRoute();
  if (route.page === "alert") renderAlert(route.id);
  else if (route.page === "check") renderCheck(route.id);
  else if (route.page === "alerts") renderAlertCenter();
  else if (route.page === "checks") renderCheckCenter();
  else if (route.page === "todo") renderTodo();
  else renderHome();
}

function setListBack(path) {
  sessionStorage.setItem("dzw-list-back", path);
}

function listBack() {
  return sessionStorage.getItem("dzw-list-back") || "/home";
}

function bindListOpen(root, backPath) {
  root.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setListBack(backPath);
      go(`/${btn.dataset.kind}/${btn.dataset.open}`);
    });
  });
}

function listNav(title, backTo) {
  return `
    <div class="inbox-head list-nav">
      <button type="button" class="back" data-back="${backTo}">回首页</button>
      <div>
        <h1>${title}</h1>
        <p class="meta">岗位「${post().id}」· 与值班台同一套待办</p>
      </div>
    </div>
  `;
}

function renderHome() {
  const alerts = alertsOf();
  const checks = checksOf();
  const pending = alerts.length + checks.length;
  const allAlerts = alertsAllOf().length;
  const allChecks = checksAllOf().length;
  document.getElementById("main").innerHTML = `
    <section class="inbox home">
      <div class="inbox-head">
        <h1>现场作业</h1>
        <p class="meta">岗位「${post().id}」${pending ? ` · ${pending} 条待办` : ""}</p>
      </div>
      <div class="home-grid home-grid-3">
        <button type="button" class="home-tile" data-go="/todo">
          <span class="home-tile-kicker">优先处理</span>
          <strong>待办</strong>
          <p>告警处置与识别核查待处理任务</p>
          <span class="home-badge${pending ? " is-hot" : ""}">${pending} 待办</span>
        </button>
        <button type="button" class="home-tile" data-go="/alerts">
          <span class="home-tile-kicker">本分厂</span>
          <strong>告警中心</strong>
          <p>查看本岗位相关的全部正式告警</p>
          <span class="home-badge">${allAlerts} 条记录</span>
        </button>
        <button type="button" class="home-tile" data-go="/checks">
          <span class="home-tile-kicker">派单给我</span>
          <strong>识别核查</strong>
          <p>查看推送至本岗位的全部识别核查</p>
          <span class="home-badge">${allChecks} 条记录</span>
        </button>
      </div>
    </section>
  `;
  document.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => go(btn.dataset.go));
  });
}

function renderTodo() {
  const alerts = alertsOf();
  const checks = checksOf();
  const rows = todoTab === "alert" ? alerts : checks;
  const root = document.getElementById("main");
  root.innerHTML = `
    <section class="inbox">
      ${listNav("待办", "/home")}
      <div class="tabs">
        <button type="button" class="tab${todoTab === "alert" ? " is-on" : ""}" data-tab="alert">告警处置 <b>${alerts.length}</b></button>
        <button type="button" class="tab${todoTab === "check" ? " is-on" : ""}" data-tab="check">识别核查 <b>${checks.length}</b></button>
      </div>
      <div class="list">
        ${rows.length ? rows.map((item) => (todoTab === "alert" ? alertCard(item) : checkCard(item))).join("") : `
          <p class="empty">${todoTab === "alert"
            ? "当前没有待现场处置的正式告警。值班员在 PC 把告警转到「处理中」后会出现。"
            : "当前没有待现场确认的识别。值班员在 PC 点「送现场确认」后会出现。"}</p>
        `}
      </div>
    </section>
  `;
  bindBack(root, "/home");
  root.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      todoTab = btn.dataset.tab;
      sessionStorage.setItem("dzw-todo-tab", todoTab);
      render();
    });
  });
  bindListOpen(root, "/todo");
}

function renderAlertCenter() {
  const rows = alertsAllOf();
  const root = document.getElementById("main");
  root.innerHTML = `
    <section class="inbox">
      ${listNav("告警中心", "/home")}
      <p class="list-hint meta">本分厂「${post().plant}」全部正式告警；「处理中」可现场处置。</p>
      <div class="list">
        ${rows.length ? rows.map((item) => alertCenterCard(item)).join("") : `
          <p class="empty">当前没有与本分厂相关的正式告警记录。</p>
        `}
      </div>
    </section>
  `;
  bindBack(root, "/home");
  bindListOpen(root, "/alerts");
}

function renderCheckCenter() {
  const rows = checksAllOf();
  const root = document.getElementById("main");
  root.innerHTML = `
    <section class="inbox">
      ${listNav("识别核查", "/home")}
      <p class="list-hint meta">推送至「${post().id}」的全部识别；「待核查」且未回传可填写。</p>
      <div class="list">
        ${rows.length ? rows.map((item) => checkCenterCard(item)).join("") : `
          <p class="empty">当前没有推送到本岗位的识别核查记录。</p>
        `}
      </div>
    </section>
  `;
  bindBack(root, "/home");
  bindListOpen(root, "/checks");
}

function alertCard(item) {
  return `
    <button type="button" class="task" data-kind="alert" data-open="${item.id}">
      <div class="row">
        <strong>${item.id}</strong>
        <span class="lvl lvl-${item.level}">${LEVEL_NAME[item.level]}</span>
      </div>
      <p>${item.type} · ${item.place}</p>
      <p class="meta">处理中 · ${[alertHeldText(item), item.time, "点开填写处置"].filter(Boolean).join(" · ")}</p>
    </button>
  `;
}

function checkCard(item) {
  return `
    <button type="button" class="task" data-kind="check" data-open="${item.id}">
      <div class="row">
        <strong>${item.id}</strong>
        <span class="lvl lvl-${item.level}">${LEVEL_NAME[item.level]}</span>
      </div>
      <p>${item.type} · ${item.place}</p>
      <p class="meta">待现场确认 · ${item.fieldAsk || "请核实识别是否属实"}</p>
    </button>
  `;
}

function alertCenterCard(item) {
  const editable = item.status === "处理中";
  const log = postFieldLog(item);
  const tail = editable
    ? [alertHeldText(item), item.time, "可处置"].filter(Boolean).join(" · ")
    : `${item.status} · ${item.time}${log ? ` · ${log.note}` : ""}`;
  return `
    <button type="button" class="task${editable ? "" : " is-muted"}" data-kind="alert" data-open="${item.id}">
      <div class="row">
        <strong>${item.id}</strong>
        <span class="lvl lvl-${item.level}">${LEVEL_NAME[item.level]}</span>
      </div>
      <p>${item.type} · ${item.place}</p>
      <p class="meta">${tail}</p>
    </button>
  `;
}

function checkCenterCard(item) {
  const editable = item.status === "待核查" && !item.fieldReply;
  const tail = editable
    ? `待核查 · ${item.fieldSentAt || item.time} · 可填写`
    : `${item.status} · ${item.fieldReplyAt || item.fieldSentAt || item.time}${item.fieldReply ? ` · ${item.fieldReply}` : ""}`;
  return `
    <button type="button" class="task${editable ? "" : " is-muted"}" data-kind="check" data-open="${item.id}">
      <div class="row">
        <strong>${item.id}</strong>
        <span class="lvl lvl-${item.level}">${LEVEL_NAME[item.level]}</span>
      </div>
      <p>${item.type} · ${item.place}</p>
      <p class="meta">${tail}</p>
    </button>
  `;
}

function shotPair(cam, item) {
  return `
    <div class="shots">
      <div class="monitor">
        <span>${cam ? `${cam.name} · ${cam.code || cam.id}` : "未绑定通道"}</span>
        <b>${cam?.online === false ? "离线" : "LIVE"}</b>
        <p>${item.place || ""}</p>
      </div>
      <div class="monitor">
        <span>抓拍 ${item.time || ""}</span>
        <b>${item.type}</b>
        <p>${item.algo ? `算法 ${item.algo}` : (item.confidence != null ? `置信度 ${item.confidence}%` : (cam?.heading != null ? `朝向 ${cam.heading}°` : ""))}</p>
      </div>
    </div>
  `;
}

function timelineList(rows) {
  if (!rows?.length) return "";
  return `
    <div class="timeline">
      <h3>流转记录</h3>
      <ul>${rows.map((row) => `<li><b>${row.time}</b> ${row.status} · ${row.actor} · ${row.note}</li>`).join("")}</ul>
    </div>
  `;
}

function renderAlert(id) {
  const item = data.alerts.find((row) => row.id === id);
  const root = document.getElementById("main");
  const back = listBack();
  if (!item || item.plant !== post().plant) {
    root.innerHTML = `<section class="inbox"><p class="empty">这条告警不在当前岗位范围。<button class="back" type="button" data-back="${back}">返回</button></p></section>`;
    bindBack(root, back);
    return;
  }
  if (item.status !== "处理中") {
    const cam = cameraOf(item.camera);
    const log = postFieldLog(item);
    root.innerHTML = `
      <section class="job job-readonly">
        <div class="job-nav">
          <button type="button" class="back" data-back="${back}">返回</button>
          <h1>告警详情</h1>
        </div>
        <div class="job-body job-body-single">
          <div class="pane">
            <div class="detail-head">
              <div>
                <strong>${item.id} · ${item.type}</strong>
                <p class="meta">${item.plant} ${item.place} · ${item.status}</p>
              </div>
              <span class="lvl lvl-${item.level}">${LEVEL_NAME[item.level]}</span>
            </div>
            <dl class="kv">
              <dt>对象</dt><dd>${item.person || "—"}</dd>
              <dt>规则</dt><dd>${item.rule || "—"}</dd>
              <dt>摄像头</dt><dd>${cam ? cam.name : item.camera || "—"}</dd>
              ${log ? `<dt>现场回传</dt><dd>${log.note}</dd>` : ""}
            </dl>
            ${shotPair(cam, item)}
            ${timelineList(item.timeline)}
            <p class="meta">仅查看；需现场处置时请从「待办」或列表中状态为「处理中」的条目进入。</p>
          </div>
        </div>
      </section>
    `;
    bindJobNav(root);
    return;
  }
  const cam = cameraOf(item.camera);
  const draft = item.fieldDraft || {};
  root.innerHTML = `
    <section class="job">
      <div class="job-nav">
        <button type="button" class="back" data-back="${listBack()}">返回</button>
        <h1>告警处置</h1>
      </div>
      <div class="job-body">
        <div class="pane">
          <h2>任务与证据</h2>
          <div class="detail-head">
            <div>
              <strong>${item.id} · ${item.type}</strong>
              <p class="meta">${item.plant} ${item.place} · 处理中</p>
            </div>
            <span class="lvl lvl-${item.level}">${LEVEL_NAME[item.level]}</span>
          </div>
          <dl class="kv">
            <dt>对象</dt><dd>${item.person || "—"}</dd>
            <dt>规则</dt><dd>${item.rule || "—"}</dd>
            <dt>摄像头</dt><dd>${cam ? cam.name : item.camera || "—"}</dd>
          </dl>
          ${shotPair(cam, item)}
        </div>
        <div class="pane form">
          <div class="form-scroll">
          <h2>填写处置结果</h2>
          <div class="block">
            <span class="lbl">到场</span>
            <button type="button" class="choice${draft.arrivedAt ? " is-on" : ""}" data-arrive>${draft.arrivedAt ? `已到场 ${draft.arrivedAt}` : "我已到场"}</button>
          </div>
          <div class="block">
            <span class="lbl">措施</span>
            <div class="choices">
              ${MEASURES.map((name) => `<button type="button" class="choice${draft.measure === name ? " is-on" : ""}" data-measure="${name}">${name}</button>`).join("")}
            </div>
          </div>
          <div class="block">
            <span class="lbl">结果</span>
            <div class="choices">
              ${RESULTS.map((name) => `<button type="button" class="choice${draft.result === name ? " is-on" : ""}" data-result="${name}">${name}</button>`).join("")}
            </div>
          </div>
          <label>说明<textarea id="note" placeholder="到场情况、措施补充">${draft.note || ""}</textarea></label>
          <div class="block">
            <span class="lbl">取证</span>
            <div class="photos" id="photos">${(draft.photos || []).map((name) => `<div class="photo">${name}</div>`).join("")}</div>
            <button type="button" class="choice" data-shot>拍照</button>
          </div>
          <p class="err" id="err" hidden></p>
          </div>
          <div class="job-foot">
            <button type="button" class="btn" data-save>暂存</button>
            <button type="button" class="btn btn-primary" data-submit>提交处置</button>
          </div>
        </div>
      </div>
    </section>
  `;
  bindJobNav(root);
  const state = {
    arrivedAt: draft.arrivedAt || "",
    measure: draft.measure || "",
    result: draft.result || "",
    photos: draft.photos ? draft.photos.slice() : []
  };
  root.querySelector("[data-arrive]").addEventListener("click", (event) => {
    state.arrivedAt = nowTime();
    event.currentTarget.classList.add("is-on");
    event.currentTarget.textContent = `已到场 ${state.arrivedAt}`;
  });
  root.querySelectorAll("[data-measure]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.measure = btn.dataset.measure;
      root.querySelectorAll("[data-measure]").forEach((el) => el.classList.toggle("is-on", el === btn));
    });
  });
  root.querySelectorAll("[data-result]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.result = btn.dataset.result;
      root.querySelectorAll("[data-result]").forEach((el) => el.classList.toggle("is-on", el === btn));
    });
  });
  root.querySelector("[data-shot]").addEventListener("click", () => {
    state.photos.push(`现场${state.photos.length + 1}`);
    document.getElementById("photos").innerHTML = state.photos.map((name) => `<div class="photo">${name}</div>`).join("");
  });
  const pack = () => ({
    arrivedAt: state.arrivedAt,
    measure: state.measure,
    result: state.result,
    photos: state.photos,
    note: root.querySelector("#note").value.trim()
  });
  root.querySelector("[data-save]").addEventListener("click", () => {
    item.fieldDraft = pack();
    persist();
    showToast("已暂存，未提交值班台");
  });
  root.querySelector("[data-submit]").addEventListener("click", () => {
    const form = pack();
    const err = document.getElementById("err");
    if (!form.arrivedAt || !form.measure || !form.result) {
      err.hidden = false;
      err.textContent = "请先到场，并选择措施和结果。";
      return;
    }
    item.fieldDraft = form;
    item.arrivedAt = form.arrivedAt;
    const note = `${form.measure}；${form.result}${form.note ? `；${form.note}` : ""}${form.photos.length ? `；照片 ${form.photos.join("、")}` : ""}`;
    item.status = "待复核";
    item.timeline = item.timeline || [];
    item.timeline.push({ status: "待复核", time: nowTime(), actor: post().id, note: `到场 ${form.arrivedAt}。${note}` });
    persist();
    showToast("已回传值班台，告警进入待复核");
    setTimeout(() => go(listBack()), 600);
  });
}

function renderCheck(id) {
  const item = mobileEvents().find((row) => row.id === id);
  const root = document.getElementById("main");
  const back = listBack();
  if (!item || item.fieldTo !== post().id) {
    root.innerHTML = `<section class="inbox"><p class="empty">这条识别未推送到当前岗位。<button class="back" type="button" data-back="${back}">返回</button></p></section>`;
    bindBack(root, back);
    return;
  }
  const editable = item.status === "待核查" && !item.fieldReply;
  if (!editable) {
    const cam = cameraOf(item.camera);
    root.innerHTML = `
      <section class="job job-readonly">
        <div class="job-nav">
          <button type="button" class="back" data-back="${back}">返回</button>
          <h1>识别详情</h1>
        </div>
        <div class="job-body job-body-single">
          <div class="pane">
            <div class="detail-head">
              <div>
                <strong>${item.id} · ${item.type}</strong>
                <p class="meta">${item.plant} ${item.place} · ${item.status}</p>
              </div>
              <span class="lvl lvl-${item.level}">${LEVEL_NAME[item.level]}</span>
            </div>
            <dl class="kv">
              <dt>置信度</dt><dd>${item.confidence}%</dd>
              <dt>推送事项</dt><dd>${item.fieldAsk || "—"}</dd>
              <dt>现场回传</dt><dd>${item.fieldReply || "—"}${item.fieldReplyAt ? ` · ${item.fieldReplyAt}` : ""}</dd>
            </dl>
            ${shotPair(cam, item)}
            <p class="meta">已回传或已裁决的记录仅可查看。</p>
          </div>
        </div>
      </section>
    `;
    bindJobNav(root);
    return;
  }
  const cam = cameraOf(item.camera);
  const draft = item.fieldDraft || {};
  root.innerHTML = `
    <section class="job">
      <div class="job-nav">
        <button type="button" class="back" data-back="${listBack()}">返回</button>
        <h1>识别核查</h1>
      </div>
      <div class="job-body">
        <div class="pane">
          <h2>识别与确认事项</h2>
          <div class="detail-head">
            <div>
              <strong>${item.id} · ${item.type}</strong>
              <p class="meta">${item.plant} ${item.place} · 待核查</p>
            </div>
            <span class="lvl lvl-${item.level}">${LEVEL_NAME[item.level]}</span>
          </div>
          <dl class="kv">
            <dt>摄像头</dt><dd>${cam ? cam.name : item.camera || "—"}</dd>
            <dt>置信度</dt><dd>${item.confidence}%</dd>
            <dt>推送时间</dt><dd>${item.fieldSentAt || "—"}</dd>
          </dl>
          ${shotPair(cam, item)}
          <div class="ask">
            <h3>值班员要你确认</h3>
            <p>${item.fieldAsk || "请现场核实该识别是否属实。"}</p>
          </div>
        </div>
        <div class="pane form">
          <div class="form-scroll">
          <h2>填写核查内容</h2>
          <p class="meta">现场不判真警或误报，回传后由值班台裁决。</p>
          <div class="block">
            <span class="lbl">现场所见</span>
            <div class="choices">
              ${SEENS.map((name) => `<button type="button" class="choice${draft.seen === name ? " is-on" : ""}" data-seen="${name}">${name}</button>`).join("")}
            </div>
          </div>
          <label>说明<textarea id="note" placeholder="现场看到了什么">${draft.note || ""}</textarea></label>
          <div class="block">
            <span class="lbl">给值班台的建议（可选）</span>
            <div class="choices">
              ${ADVICES.map((name) => `<button type="button" class="choice${draft.advice === name ? " is-on" : ""}" data-advice="${name}">${name}</button>`).join("")}
            </div>
          </div>
          <div class="block">
            <span class="lbl">取证</span>
            <div class="photos" id="photos">${(draft.photos || []).map((name) => `<div class="photo">${name}</div>`).join("")}</div>
            <button type="button" class="choice" data-shot>拍照</button>
          </div>
          <p class="err" id="err" hidden></p>
          </div>
          <div class="job-foot">
            <button type="button" class="btn" data-save>暂存</button>
            <button type="button" class="btn btn-primary" data-submit>提交核查</button>
          </div>
        </div>
      </div>
    </section>
  `;
  bindJobNav(root);
  const state = {
    seen: draft.seen || "",
    advice: draft.advice || "",
    photos: draft.photos ? draft.photos.slice() : []
  };
  root.querySelectorAll("[data-seen]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.seen = btn.dataset.seen;
      root.querySelectorAll("[data-seen]").forEach((el) => el.classList.toggle("is-on", el === btn));
    });
  });
  root.querySelectorAll("[data-advice]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.advice = btn.dataset.advice;
      root.querySelectorAll("[data-advice]").forEach((el) => el.classList.toggle("is-on", el === btn));
    });
  });
  root.querySelector("[data-shot]").addEventListener("click", () => {
    state.photos.push(`现场${state.photos.length + 1}`);
    document.getElementById("photos").innerHTML = state.photos.map((name) => `<div class="photo">${name}</div>`).join("");
  });
  const pack = () => ({
    seen: state.seen,
    advice: state.advice,
    photos: state.photos,
    note: root.querySelector("#note").value.trim()
  });
  root.querySelector("[data-save]").addEventListener("click", () => {
    item.fieldDraft = pack();
    persist();
    showToast("已暂存，未提交值班台");
  });
  root.querySelector("[data-submit]").addEventListener("click", () => {
    const form = pack();
    const err = document.getElementById("err");
    if (!form.seen || !form.note) {
      err.hidden = false;
      err.textContent = "请选择现场所见，并填写说明。";
      return;
    }
    item.fieldDraft = form;
    item.fieldReply = `${form.seen}。${form.note}${form.advice ? `；${form.advice}` : ""}${form.photos.length ? `；照片 ${form.photos.join("、")}` : ""}`;
    item.fieldReplyAt = nowTime();
    item.note = `现场已回传：${item.fieldReply}`;
    persist();
    showToast("已回传值班台，仍待复核裁决");
    setTimeout(() => go(listBack()), 600);
  });
}

function bindBack(root, target) {
  root.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => go(btn.dataset.back || target));
  });
}

function bindJobNav(root) {
  bindBack(root, listBack());
}

function restoreInitial() {
  data = JSON.parse(JSON.stringify(initial));
  go("/home");
  render();
  showToast("已恢复初始演示数据");
}

function bindChrome() {
  const select = document.getElementById("post");
  select.innerHTML = POSTS.map((item) => `<option value="${item.id}"${item.id === postId ? " selected" : ""}>${item.id}</option>`).join("");
  select.addEventListener("change", () => {
    postId = select.value;
    sessionStorage.setItem("dzw-post", postId);
    go("/home");
    render();
  });
  document.getElementById("reset").addEventListener("click", () => {
    SafetyStore.reset();
    restoreInitial();
  });
}

async function boot() {
  const raw = await fetch("./data/safety.json?v=25").then((res) => res.json());
  initial = JSON.parse(JSON.stringify(raw));
  seed = { alerts: initial.alerts, events: initial.events, aiEvents: initial.aiEvents };
  data = SafetyStore.apply(JSON.parse(JSON.stringify(initial)));
  bindChrome();
  SafetyStore.subscribe((msg) => {
    if (msg.reset) {
      restoreInitial();
      return;
    }
    SafetyStore.apply(data);
    render();
  });
  window.addEventListener("hashchange", render);
  if (!location.hash || location.hash === "#/inbox") location.hash = "/home";
  else render();
}

boot();
