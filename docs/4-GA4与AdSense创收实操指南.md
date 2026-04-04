# Google Analytics 4 与 Google AdSense 创收实操指南（新手向）

本文面向**第一次**使用 GA4、AdSense，并第一次在网站上接广告创收的情况编写。操作界面以 Google 当前产品为准，若按钮名称有微调，以页面实际文案为准。

**与本站代码的关系：** 仓库内 `web/` 已接入 Cookie 同意横幅、条件加载 GA4/AdSense 脚本、页脚广告位占位。你仍需在 **Google 各后台** 完成开户、拿 ID、过审，并把 ID 填进环境变量（见第六节）。

**建议阅读顺序：** 先通读「第一节 推荐执行顺序」，再按顺序做，避免重复验证、反复改代码。

---

## 一、推荐执行顺序（总览）

| 阶段 | 做什么 | 主要平台 |
|------|--------|----------|
| 1 | 网站已可公网 HTTPS 访问，有基础内容与隐私页 | 你的主机 / Vercel 等 |
| 2 | 注册并验证 **Search Console**（所有权） | [Google Search Console](https://search.google.com/search-console) |
| 3 | 创建 **GA4** 媒体资源与数据流，拿到测量 ID（`G-` 开头） | [Google Analytics](https://analytics.google.com/) |
| 4 | （可选）提交 **sitemap**，便于收录 | Search Console |
| 5 | 申请 **AdSense**，按提示放置代码或等待审核 | [Google AdSense](https://www.google.com/adsense/) |
| 6 | 审核通过后配置 **ads.txt**，创建**广告单元**，把 ID 写入 `web` 环境变量并部署 | AdSense + 你的部署平台 |
| 7 | 在真实环境点一次 Cookie「全部接受」，用 **GA4 实时报告**、**AdSense 首页**确认数据 | 同上 |

说明：**GA4 与 AdSense 互不依赖**，可以并行准备；但 **AdSense 通常要求网站已可访问且有一定实质内容**，所以先上线再申请更稳。

---

## 二、开始前准备（必做）

1. **域名与 HTTPS**  
   - 使用正式域名（如 `https://yourdomain.com`），浏览器地址栏显示小锁。  
   - 在部署环境设置本项目所需环境变量（见 `web/.env.example`），至少：  
     - `NEXT_PUBLIC_SITE_URL=https://你的域名`（无末尾斜杠）

2. **页面与政策**  
   - 站点已有**隐私政策**、**服务条款**等（本项目已提供 `/privacy`、`/terms` 路由，上线后把文案里的占位说明改成你的联系方式等）。  
   - 有**实质内容**的工具页/说明文字（空壳站难过 AdSense 审核）。

3. **Google 账号**  
   - 使用一个你长期使用的 Gmail / Google 账号，后续 GA4、Search Console、AdSense 都建议**同一账号或同一 Google Analytics 组织**关联，方便管理。

4. **浏览器**  
   - 推荐使用 Chrome；若在国内网络环境，需自行解决访问 Google 服务的问题（本指南不讨论网络细节）。

---

## 三、Google Analytics 4（GA4）— 平台与操作

### 3.1 进入平台

- 打开：**[https://analytics.google.com/](https://analytics.google.com/)**  
- 若首次使用，按向导创建 **账号（Account）** 与 **媒体资源（Property）**。  
  - 媒体资源类型选 **Google Analytics 4（GA4）**。

### 3.2 创建数据流（网站）

1. 在 GA4 左侧 **管理（齿轮）** → **数据流（Data streams）**。  
2. 选择 **网站（Web）**。  
3. 填写 **网站 URL**（与生产环境一致，含 `https://`）和 **流名称**（任意便于识别的名称）。  
4. 创建后，打开该数据流详情页，找到 **衡量 ID（Measurement ID）**，格式为 **`G-XXXXXXXXXX`**。  
5. **复制**该 ID，保存到本地备忘录（勿公开提交到公开仓库）。

### 3.3 与本项目对接

1. 在部署平台（如 Vercel **Environment Variables**）或服务器环境中新增：  
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`  
2. 重新部署 `web` 应用。  
3. **重要（本站逻辑）：** GA4 脚本**仅在用户点击 Cookie 横幅的「全部接受 / Accept all」之后**才会加载（见 `web/components/conditional-analytics.tsx`）。  
4. 验证：用无痕窗口打开你的网站 → 点击 **全部接受** → 回到 GA4 → **报告（Reports）** → **实时（Realtime）**，应能看到至少 1 个活跃用户（可能有数分钟延迟）。

### 3.4 常用后续设置（可稍后做）

- **数据保留、受众、转化事件**：在「管理」中按需配置。  
- **关联 Google Ads**（若以后投广告）：管理 → 产品关联。  
- **关联 AdSense**（可选）：在 AdSense 或 GA 中按向导关联，便于统一看部分数据。

---

## 四、Google Search Console — 平台与操作

用于：证明你拥有该域名、提交站点地图、查看搜索表现（与创收间接相关，但**强烈建议尽早完成**）。

### 4.1 进入平台

- 打开：**[https://search.google.com/search-console](https://search.google.com/search-console)**

### 4.2 添加资源（属性）

1. 选择 **网域（Domain）** 或 **网址前缀（URL prefix）**。  
   - **网域**：需 DNS TXT 验证，一次验证整域所有子域。  
   - **网址前缀**：只验证例如 `https://example.com/`，验证方式可选 HTML 文件、HTML 标记、DNS 等。  
2. 按页面说明完成 **验证**。验证失败时，根据提示检查 DNS 是否生效、HTTPS 是否可访问。

### 4.3 提交 Sitemap

1. 验证通过后，左侧进入 **Sitemap（站点地图）**。  
2. 在「新增站点地图」中填入（按你的实际域名替换）：  
   - `https://你的域名/sitemap.xml`  
3. 提交后状态会变为「成功」或「无法抓取」等；若失败，检查 `NEXT_PUBLIC_SITE_URL`、服务器是否返回 200、XML 是否合法。

本项目 sitemap 由 Next.js 生成，路径为 **`/sitemap.xml`**（见 `web/app/sitemap.ts`）。

---

## 五、Google AdSense — 平台与操作

### 5.1 进入平台

- 打开：**[https://www.google.com/adsense/](https://www.google.com/adsense/)**（或搜索 “Google AdSense” 进入官方入口）  
- 使用 Google 账号登录，按向导 **开始申请**。

### 5.2 申请时需要准备什么

- **网站 URL**：填写已上线的首页地址（HTTPS）。  
- **国家/地区与收款信息**：按税务、收款方式如实填写（后续可再完善）。  
- **同意政策**：阅读《计划政策》《合作规范》等。  

Google 会审核：**内容质量、导航是否清晰、是否原创或有权使用、是否易于使用**等。审核时间从数日到数周不等，无固定承诺。

### 5.3 审核期间常见要求

- 在网站中放置 **AdSense 提供的验证代码**（有时是一小段脚本或 meta）。  
  - 若本项目已用环境变量加载 AdSense 主脚本且你尚未通过审核，可暂时**只放验证用代码**或按 AdSense 后台「站点」说明操作；**以 AdSense 当前提示为准**。  
- 保持网站**可公开访问**，不要全程维护页或密码墙。

### 5.4 审核通过之后必做几件事

1. **ads.txt（强烈建议必须）**  
   - AdSense 会在后台提供一段 **ads.txt** 内容，用于声明授权售卖你流量的发布商 ID。  
   - 该文件必须可通过 **`https://你的域名/ads.txt`** 访问（纯文本，无登录）。  
   - Next.js 常见做法：在 `web/public/ads.txt` 放置文件，或添加 `app/ads.txt/route.ts` 返回文本（若你尚未添加，需按 AdSense 给的完整内容自行加入并部署）。  

2. **创建广告单元（Ad unit）**  
   - 在 AdSense 后台：**广告 → 按网站 → 广告单元**（或类似菜单）。  
   - 新建 **展示广告（Display）**，选择 **响应式** 或与页脚布局匹配的版式。  
   - 创建后会得到：  
     - **发布商 ID**：`ca-pub-xxxxxxxxxxxxxxxx`  
     - **广告单元 ID / Slot**：一串数字（如 `1234567890`）  

3. **写入本项目环境变量并部署**  

   ```bash
   NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx
   NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=你的广告单元slot数字
   ```

   与 `web/.env.example` 中说明一致。部署后，用户需 **Cookie 选择「全部接受」**，页脚才会请求广告（见 `web/components/ad-slot.tsx`）。

### 5.5 收入与政策（心理预期）

- 收入与**流量、地区、广告主竞价、广告位位置与点击率**等有关，初期可能很低或为 0。  
- 禁止自己大量点击广告、诱导点击，会导致**封号**。  
- 定期查看 **AdSense 合作规范** 与邮件通知，避免违规改版。

---

## 六、与本项目（`web/`）的变量对照表

| 环境变量 | 从哪里拿到 | 何时加载（本站行为） |
|----------|------------|----------------------|
| `NEXT_PUBLIC_SITE_URL` | 你的正式站点 origin | 构建/运行时；与 sitemap、元数据相关 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 → 数据流 → 衡量 ID `G-...` | 仅用户 Cookie **全部接受** 后 |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | AdSense → 账号信息中的 `ca-pub-...` | 同上 |
| `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER` | AdSense → 广告单元详情 | 同上；与页脚 `AdSlot` 绑定 |

未配置 AdSense 变量时，页脚仍显示**占位区域**（固定高度），有利于减少布局抖动（CLS）。

---

## 七、隐私与同意（与欧盟/英国用户相关）

- 本站已有 **Cookie 横幅** 与 **隐私政策** 中的说明；若你面向 **EEA/英国** 用户，Google 对 **意见征求模式（Consent Mode）** 等有更细要求，可能需要在 `gtag` 中增加 consent 默认/更新参数。  
- 当前实现为：**未同意则不加载 GA/AdSense 脚本**（属于较稳妥的入门方案）。若流量主要来自上述地区，建议后续咨询官方文档或法务，考虑升级为 **Google 意见征求模式 v2** 等。

---

## 八、验收清单（打印或逐条打勾）

- [ ] 生产环境 `NEXT_PUBLIC_SITE_URL` 正确  
- [ ] Search Console 已验证，`sitemap.xml` 已提交且无严重错误  
- [ ] GA4 已创建数据流，测量 ID 已配置；无痕窗口「全部接受」后 **实时报告** 能看到访问  
- [ ] AdSense 已批准（或仍在审核中则等待）  
- [ ] `ads.txt` 可在根路径访问且内容与 AdSense 一致  
- [ ] `NEXT_PUBLIC_ADSENSE_CLIENT_ID` 与 `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER` 已配置；同意后页脚出现广告或「无填充」但不报错（无填充与流量、地区有关，属常见现象）  
- [ ] 隐私政策已更新为你的真实主体与联系方式  

---

## 九、常见问题（FAQ）

**Q：GA4 实时里一直没有数据？**  
A：是否点了「全部接受」？是否用了广告拦截扩展？测量 ID 是否配错环境（预览域 vs 生产域）？

**Q：AdSense 一直「正在审核」？**  
A：加强原创说明文字、工具可用性、关于/联系渠道；避免空白页、抄袭、敏感禁投内容。

**Q：广告位空白？**  
A：新站填充率低正常；检查是否同意 Cookie、ads.txt、广告拦截、是否在支持的国家/地区展示。

**Q：可以把测量 ID 写在 GitHub 公开仓库吗？**  
A：**不建议**。`NEXT_PUBLIC_*` 会打进前端包，虽可被看到，但仍应用 **环境变量/密钥管理** 配置，避免仓库明文泄露你的完整配置习惯。

---

## 十、官方文档入口（备查）

- GA4 帮助中心：在 analytics.google.com 内帮助或搜索 “GA4 设置”  
- Search Console 帮助：[Google Search Console 帮助](https://support.google.com/webmasters/)  
- AdSense 帮助：[Google AdSense 帮助](https://support.google.com/adsense/)  

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-04-04 | 初版：与 `web/` 当前 Cookie、环境变量、页脚广告位实现一致 |

---

**相关仓库文档：** [2-海外工具网站落地方案](./2-海外工具网站落地方案.md) · [3-海外工具网站国际化-i18n-方案](./3-海外工具网站国际化-i18n-方案.md) · `web/README.md` / `web/README.zh-CN.md`
