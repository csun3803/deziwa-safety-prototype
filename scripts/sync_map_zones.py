#!/usr/bin/env python3
"""将 deziwa-map-zones.json 合并进 safety.json 的 zones 字段。"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ZONES_FILE = ROOT / "data" / "deziwa-map-zones.json"
SAFETY_FILE = ROOT / "data" / "safety.json"


def main() -> None:
    zones = json.loads(ZONES_FILE.read_text(encoding="utf-8"))
    if not isinstance(zones, list):
        raise SystemExit("deziwa-map-zones.json 必须是数组")

    safety = json.loads(SAFETY_FILE.read_text(encoding="utf-8"))
    safety["zones"] = zones
    SAFETY_FILE.write_text(
        json.dumps(safety, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"已写入 {len(zones)} 个区域 -> {SAFETY_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
