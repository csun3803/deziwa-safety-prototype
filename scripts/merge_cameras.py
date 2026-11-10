# -*- coding: utf-8 -*-
import zipfile
import xml.etree.ElementTree as ET
import re
import json
import hashlib
from collections import Counter

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
DEV = r"d:\My\袋鼠云\迪兹瓦\迪兹瓦数字孪生工厂系列\raw\04、项目资料\各专题需求内容\安环相关\大华监控设备清单.xlsx"
IP = r"d:\My\袋鼠云\迪兹瓦\迪兹瓦数字孪生工厂系列\raw\04、项目资料\各专题需求内容\安环相关\视频监控Ip清单.xlsx"
OUT = r"d:\My\dsy\dzw-aq\prototype\data\cameras.json"


def col_row(ref):
    m = re.match(r"([A-Z]+)(\d+)", ref)
    return m.group(1), int(m.group(2))


def read_sheet_rows(path, sheet_name=None):
    with zipfile.ZipFile(path, "r") as z:
        shared = []
        if "xl/sharedStrings.xml" in z.namelist():
            root = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in root.findall("m:si", NS):
                texts = []
                for t in si.iter("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t"):
                    if t.text:
                        texts.append(t.text)
                shared.append("".join(texts))
        wb = ET.fromstring(z.read("xl/workbook.xml"))
        sheets = []
        for sh in wb.findall("m:sheets/m:sheet", NS):
            sheets.append(
                (
                    sh.get("name"),
                    sh.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"),
                )
            )
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        rid_to_path = {
            rel.get("Id"): "xl/" + rel.get("Target").lstrip("/")
            for rel in rels
            if rel.get("Type", "").endswith("/worksheet")
        }
        out = {}
        for name, rid in sheets:
            if sheet_name and name != sheet_name:
                continue
            spath = rid_to_path.get(rid)
            root = ET.fromstring(z.read(spath))
            grid = {}
            max_r = 0
            for row in root.findall(".//m:sheetData/m:row", NS):
                for c in row.findall("m:c", NS):
                    ref = c.get("r")
                    col, r = col_row(ref)
                    v = c.find("m:v", NS)
                    if v is None or v.text is None:
                        val = None
                    elif c.get("t") == "s":
                        val = shared[int(v.text)]
                    else:
                        val = v.text
                    grid[(r, col)] = val
                    max_r = max(max_r, r)
            cols = sorted(set(c for r, c in grid.keys()), key=lambda x: (len(x), x))
            rows = [
                [grid.get((r, c)) for c in cols]
                for r in range(1, max_r + 1)
                if any(grid.get((r, c)) for c in cols)
            ]
            out[name] = rows
        return out


def main():
    ip_rows = read_sheet_rows(IP)["Sheet1"]
    area_by_ip = {}
    fault_ips = set()
    current = None
    for row in ip_rows[1:]:
        while len(row) < 7:
            row.append(None)
        if row[0] and str(row[0]).strip():
            current = str(row[0]).strip()
        ip = row[4]
        if ip and re.match(r"^\d+\.\d+\.\d+\.\d+$", str(ip).strip()):
            ip = str(ip).strip()
            area_by_ip[ip] = current
            if row[6] and "故障" in str(row[6]):
                fault_ips.add(ip)

    AREA_PLANT = {
        "总降区域": "mill",
        "萃取一系列": "hydro",
        "萃取二系列": "hydro",
        "电积车间": "hydro",
        "溶剂油库": "hydro",
        "室外溶液池": "hydro",
        "沉钴区域": "hydro",
        "配电室": "mill",
        "矿坑": "mill",
    }

    ZONE_BY_AREA = {
        "萃取一系列": "z-sx",
        "萃取二系列": "z-sx",
        "电积车间": "z-ew",
        "沉钴区域": "z-leach",
        "矿坑": "z-crush",
        "总降区域": "z-crush",
        "配电室": "z-crush",
    }


    STORY_COORDS = {
        "cam-12": {"x": 46, "y": 22, "heading": 40, "pitch": -12, "fov": 68, "zone": "z-sx", "calib": "已标定"},
        "cam-05": {"x": 52, "y": 28, "heading": 85, "pitch": -8, "fov": 72, "zone": "z-sx", "calib": "已标定"},
        "cam-18": {"x": 74, "y": 24, "heading": 110, "pitch": -10, "fov": 70, "zone": "z-ew", "calib": "已标定"},
        "cam-07": {"x": 38, "y": 30, "heading": 200, "pitch": -15, "fov": 64, "zone": "z-leach", "calib": "标定中"},
        "cam-22": {"x": 22, "y": 56, "heading": 160, "pitch": -6, "fov": 75, "zone": "z-crush", "calib": "已标定"},
        "cam-31": {"x": 72, "y": 60, "heading": 300, "pitch": -18, "fov": 80, "zone": "z-crush", "calib": "已标定"},
        "cam-09": {"x": 16, "y": 26, "heading": 95, "pitch": -9, "fov": 60, "zone": "z-leach", "calib": "未标定"},
    }

    dev_rows = read_sheet_rows(DEV)["监控设备清单"]
    header = dev_rows[0]
    raw = []
    for row in dev_rows[1:]:
        d = dict(zip(header, row + [None] * (len(header) - len(row))))
        ip = (d.get("IP地址") or "").strip()
        if not ip:
            continue
        nvr = d.get("NVR唯一通道号")
        try:
            ch = int(float(nvr)) + 1 if nvr is not None else None
        except (TypeError, ValueError):
            ch = None
        name = (d.get("通道名称(修复后)") or d.get("设备名称") or ip).strip()
        form = (d.get("形态") or "未知").strip()
        if form == "未知" and d.get("设备类型") == "SD":
            form = "球机"
        if form == "未知" and d.get("设备类型") == "IPC":
            form = "枪机"
        area = area_by_ip.get(ip) or "未分区"
        plant = AREA_PLANT.get(area, "hydro")
        raw.append(
            {
                "ip": ip,
                "name": name,
                "form": form,
                "area": area,
                "plant": plant,
                "nvrChannel": ch,
                "model": d.get("设备型号") or None,
                "online": ip not in fault_ips,
                "maintNote": "现场故障" if ip in fault_ips else None,
                "sync": "待并表" if area == "未分区" else "已对齐",
            }
        )

    def pick_ip(pred, exclude=None):
        exclude = exclude or set()
        for c in raw:
            if c["ip"] in exclude:
                continue
            if pred(c):
                return c["ip"]
        return None

    story_candidates = {
        "cam-12": lambda c: "澄清" in c["name"] and c["area"] == "萃取一系列",
        "cam-05": lambda c: c["area"] == "萃取一系列" and "系列" in c["name"],
        "cam-18": lambda c: c["area"] == "电积车间",
        "cam-07": lambda c: c["area"] == "沉钴区域",
        "cam-22": lambda c: "雷达站边坡" in c["name"] and c["area"] == "矿坑",
        "cam-31": lambda c: "雷达站站内" in c["name"] and c["area"] == "矿坑",
        "cam-09": lambda c: c["area"] == "沉钴区域",
    }
    story_assign = {}
    used = set()
    for sid in ["cam-12", "cam-05", "cam-18", "cam-07", "cam-22", "cam-31", "cam-09"]:
        pred = story_candidates[sid]
        ip = pick_ip(pred, exclude=used)
        if ip:
            story_assign[sid] = ip
            used.add(ip)

    cameras = []
    for c in raw:
        ip = c["ip"]
        sid = next((k for k, v in story_assign.items() if v == ip), None)
        if sid:
            cid = sid
            meta = STORY_COORDS[sid]
            zone = meta["zone"]
            x, y = meta["x"], meta["y"]
            heading, pitch, fov = meta["heading"], meta["pitch"], meta["fov"]
            calib = meta["calib"]
        else:
            cid = "cam-" + ip.replace(".", "-")
            zone = ZONE_BY_AREA.get(c["area"])
            h = hashlib.md5(ip.encode()).hexdigest()
            x = int(h[0:2], 16) % 85 + 8
            y = int(h[2:4], 16) % 75 + 12
            heading = int(h[4:6], 16) % 360
            pitch = -12
            fov = 68
            calib = "未标定"

        code = f"CH-{c['nvrChannel']:03d}" if c["nvrChannel"] else f"CH-{ip.split('.')[-1]}"
        entry = {
            "id": cid,
            "name": c["name"],
            "code": code,
            "ip": ip,
            "form": c["form"],
            "plant": c["plant"],
            "area": c["area"],
            "online": c["online"],
            "heading": heading,
            "pitch": pitch,
            "fov": fov,
            "calib": calib,
            "protocol": "RTSP",
            "codec": "H.265",
            "streamConfigured": True,
            "sync": c["sync"],
        }
        if c["nvrChannel"]:
            entry["nvrChannel"] = c["nvrChannel"]
        if zone:
            entry["zone"] = zone
        if c["model"]:
            entry["model"] = c["model"]
        if c["maintNote"]:
            entry["maintNote"] = c["maintNote"]

        show_map = bool(sid)
        if not show_map and c["area"] in ("溶剂油库", "配电室", "总降区域"):
            show_map = int(hashlib.md5(ip.encode()).hexdigest()[6:8], 16) < 80
        if show_map:
            entry["x"] = x
            entry["y"] = y
        cameras.append(entry)

    cameras.sort(key=lambda x: (x.get("nvrChannel") or 9999, x["ip"]))

    area_counts = Counter(c["area"] for c in cameras)
    areas_analysis = []
    for name, n in sorted(area_counts.items(), key=lambda x: -x[1]):
        zone = ZONE_BY_AREA.get(name)
        count = max(3, min(28, n * 2 + (5 if name == "溶剂油库" else 0)))
        item = {"name": name, "count": count}
        if zone:
            item["zone"] = zone
        areas_analysis.append(item)

    hot_names = [
        ("溶剂油库储罐", "溶剂油库", "z-leach", 16, "非法闯入、异常滞留"),
        ("一系列澄清池西", "萃取一系列", "z-sx", 14, "区域入侵"),
        ("矿坑旋回顶部", "矿坑", "z-crush", 12, "安全帽缺失"),
        ("电积一系列槽面二", "电积车间", "z-ew", 11, "安全帽缺失"),
        ("沉钴脱水浓密机", "沉钴区域", "z-leach", 9, "异常滞留"),
        ("配电室主通道", "配电室", "z-crush", 8, "非法闯入"),
        ("门架西球机", "总降区域", "z-crush", 7, "烟火"),
        ("中间矿堆走廊", "矿坑", "z-crush", 6, "区域入侵"),
        ("2#雷达站边坡", "矿坑", "z-crush", 5, "边坡巡视"),
        ("辅料制备车间一", "配电室", "z-crush", 5, "安全帽缺失"),
    ]
    hotspots = []
    for i, (name, area, zone, count, types) in enumerate(hot_names, 1):
        hotspots.append(
            {
                "id": f"hs-{i}",
                "name": name,
                "area": area,
                "zone": zone,
                "count": count,
                "types": types,
                "period": "近30天",
                "sample": count,
                "note": "统计结果，非正式认定",
            }
        )

    payload = {
        "meta": {
            "source": "大华监控设备清单 + 视频监控Ip清单",
            "total": len(cameras),
            "fault": len(fault_ips),
            "unmappedArea": area_counts.get("未分区", 0),
        },
        "cameraAreas": [a for a, _ in area_counts.most_common()],
        "cameras": cameras,
        "analysisPatch": {"areas": areas_analysis, "hotspots": hotspots},
    }

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print("wrote", OUT, "cameras", len(cameras), "map", sum(1 for c in cameras if "x" in c))
    print("story", story_assign)


if __name__ == "__main__":
    main()
