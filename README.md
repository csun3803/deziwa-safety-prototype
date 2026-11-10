# 迪兹瓦安全可视化原型（静态站）

纯静态 HTML/JS，无构建步骤。通过 **GitHub Pages** 发布：仓库可为 **Private**，演示链接仍可公网访问。

## 本地预览

```powershell
cd 本目录
python -m http.server 5173
```

浏览器打开：<http://127.0.0.1:5173/index.html#/t1/overview>

## 首次发布到 GitHub（私有仓 + 公网链接）

### 你需要做的（一次性）

1. 登录 [GitHub](https://github.com) → **New repository**
   - Name：例如 `deziwa-safety-prototype`
   - **Private**
   - 不要勾选 “Add a README”（避免和本地冲突）
2. 创建后复制 **HTTPS** 地址，形如 `https://github.com/你的用户名/deziwa-safety-prototype.git`
3. 在本目录执行（把 URL 换成你的）：

```powershell
git remote add origin https://github.com/你的用户名/deziwa-safety-prototype.git
git push -u origin main
```

若提示登录：按 Git  Credential Manager 用浏览器或 Personal Access Token 登录。

4. 仓库 **Settings → Pages**
   - **Source**：Deploy from a branch
   - **Branch**：`main` / **`/(root)`**
   - Save

5. 等 1～3 分钟，页面显示站点地址，一般为：

`https://你的用户名.github.io/deziwa-safety-prototype/`

### 分享给他人（无需 GitHub 账号）

- 总览：<https://你的用户名.github.io/deziwa-safety-prototype/index.html#/t1/overview>
- 告警：<https://你的用户名.github.io/deziwa-safety-prototype/index.html#/t2/alerts>
- 平板：<https://你的用户名.github.io/deziwa-safety-prototype/mobile.html>

## 改完原型后更新线上（链接不变）

```powershell
git add -A
git commit -m "update prototype"
git push
```

推送后等约 1 分钟，让对方 **Ctrl+F5** 强刷。修改 `css`/`js` 时建议顺便增大 `index.html` 里的 `?v=` 版本号，避免浏览器缓存旧资源。
