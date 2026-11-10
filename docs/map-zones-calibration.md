# 卫图围栏 / 风险区坐标 — 修改方法

## 原则（避免「每一块偏移都不一样」）

1. **只改一个数据源**：`prototype/data/deziwa-map-zones.json`  
   场景里画的框、规则中心列表里的区域几何，都应来自这里（经同步脚本写入 `safety.json`）。
2. **坐标系固定为 PNG 像素**：与 `assets/deziwa-aerial.png` 一致，当前为 **宽 576 × 高 655**。  
   `app.js` 里 `SCENE_MAP_W` / `SCENE_MAP_H` 必须与 PNG 尺寸相同。
3. **不要用「全局平移」代替逐块标定**：整体 `+32,+36` 一类操作只能缓解「全体偏一个方向」，无法对齐图中每一块虚线框；**每一块单独改 `x,y,w,h`**。
4. **卫图 `<image>` 不要再加 `preserveAspectRatio="meet"`**（与 viewBox 同尺寸时易引入视觉偏差）；与 `drawMap()` 中一致即可。

## 字段说明（每个 zone 对象）

| 字段 | 含义 |
|------|------|
| `x`, `y` | 矩形左上角，单位：像素，原点左上 |
| `w`, `h` | 宽、高（像素） |
| `mapLabel` | 可选，地图上短标签 |
| 其余 | 业务字段（风险、围栏、岗位等），与位置无关 |

## 推荐工作流

### A. 可视化标定（推荐）

1. 在项目根启动静态服务（必须在 `prototype` 目录）：
   ```powershell
   Set-Location "d:\My\dsy\dzw-aq\prototype"
   python -m http.server 8080
   ```
2. 浏览器打开：`http://localhost:8080/tools/zone-calibrate.html`
3. 左侧选中区域，在卫图上 **拖拽移动**；按住 **Shift** 拖拽可改大小。
4. 点击 **复制 JSON**，保存到 `prototype/data/deziwa-map-zones.json`。
5. 刷新原型 `#/t1/overview`（`app.js` 会 **no-store** 读取该文件，无需 sync）。

可选：若还要更新规则中心等只读 `safety.json` 的副本，再执行：

```powershell
python scripts/sync_map_zones.py
```

### B. 在图像软件里读像素

1. 用 Photoshop / GIMP / 画图打开 `assets/deziwa-aerial.png`（576×655）。
2. 对照图中 **虚线框** 读左上角与宽高，写入 `deziwa-map-zones.json` 对应项。
3. 执行 `python scripts/sync_map_zones.py`。

### C. 仅改代码里的绘制（一般不推荐）

位置应改 JSON，而不是改 `drawMap()` 里写死的偏移。  
若换了一张新卫图，只需改：

```javascript
// prototype/js/app.js
const SCENE_MAP_W = 576;
const SCENE_MAP_H = 655;
const SCENE_AERIAL = "./assets/deziwa-aerial.png?v=…";
```

并 **整表重标** `deziwa-map-zones.json`。

## 人员 / 摄像头 / 告警落点

这些在 `safety.json`、`cameras.json` 里也有 `x,y`，**同一套 576×655 像素**。  
改完区域后，落点应落在对应矩形内，可手动改，或在标定工具里用「复制中心点」思路自行维护。

同步脚本 **只替换 `safety.json` 的 `zones` 数组**，不会自动挪动人员/摄像头。

## 换图后检查清单

- [ ] PNG 尺寸 ↔ `SCENE_MAP_W/H`
- [ ] `deziwa-map-zones.json` 全部重标
- [ ] `sync_map_zones.py` 已执行
- [ ] `index.html` / `boot()` 里 `safety.json?v=` 版本 +1（或硬刷新）
- [ ] 演示用人员/告警/摄像头坐标抽查 3～5 个
