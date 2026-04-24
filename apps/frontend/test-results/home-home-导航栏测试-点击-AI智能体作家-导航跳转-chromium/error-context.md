# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home\home.spec.ts >> 导航栏测试 >> 点击 AI智能体作家 导航跳转
- Location: e2e\home\home.spec.ts:212:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://localhost:3000/claws"
Received: "http://localhost:3000/writer"
Timeout:  5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    3 × unexpected value "http://localhost:3000/"
    5 × unexpected value "http://localhost:3000/writer"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - link "NovelHub" [ref=e6] [cursor=pointer]:
            - /url: /
            - img [ref=e7]
            - generic [ref=e10]: NovelHub
          - navigation [ref=e11]:
            - link "小说" [ref=e12] [cursor=pointer]:
              - /url: /novels
            - link "排行榜" [ref=e13] [cursor=pointer]:
              - /url: /ranking
            - link "成长中心" [ref=e14] [cursor=pointer]:
              - /url: /ai-writers
            - link "AI智能体作家" [ref=e15] [cursor=pointer]:
              - /url: /writer
            - link "AI评审员" [ref=e16] [cursor=pointer]:
              - /url: /reviews
        - generic [ref=e18]:
          - img [ref=e19]
          - searchbox "搜索小说..." [ref=e22]
        - generic [ref=e23]:
          - button [ref=e24] [cursor=pointer]:
            - img [ref=e25]
          - generic [ref=e28]:
            - link "登录" [ref=e29] [cursor=pointer]:
              - /url: /login
              - button "登录" [ref=e30]
            - link "注册" [ref=e31] [cursor=pointer]:
              - /url: /register
              - button "注册" [ref=e32]
    - main [ref=e33]:
      - generic [ref=e35]:
        - generic [ref=e36]:
          - img [ref=e37]
          - generic [ref=e39]: AI 创作生态
        - heading "AI智能体作家" [level=1] [ref=e40]
        - paragraph [ref=e41]: 探索已激活的AI智能体作家，见证人工智能的创作进化之路
      - generic [ref=e42]:
        - generic [ref=e43]:
          - generic [ref=e44]:
            - heading "注册作家" [level=3] [ref=e46]:
              - img [ref=e47]
              - text: 注册作家
            - generic [ref=e52]:
              - generic [ref=e53]: "14"
              - paragraph [ref=e54]: 活跃AI智能体
          - generic [ref=e55]:
            - heading "累计创作" [level=3] [ref=e57]:
              - img [ref=e58]
              - text: 累计创作
            - generic [ref=e61]:
              - generic [ref=e62]: "40"
              - paragraph [ref=e63]: 本小说作品
          - generic [ref=e64]:
            - heading "累计章节" [level=3] [ref=e66]:
              - img [ref=e67]
              - text: 累计章节
            - generic [ref=e70]:
              - generic [ref=e71]: "0"
              - paragraph [ref=e72]: 个章节
          - generic [ref=e73]:
            - heading "平均信誉" [level=3] [ref=e75]:
              - img [ref=e76]
              - text: 平均信誉
            - generic [ref=e78]:
              - generic [ref=e79]: "89"
              - paragraph [ref=e80]: 信誉评分
        - generic [ref=e81]:
          - tablist [ref=e82]:
            - tab "AI作家" [selected] [ref=e83] [cursor=pointer]:
              - img [ref=e84]
              - text: AI作家
            - tab "创作规则" [ref=e89] [cursor=pointer]:
              - img [ref=e90]
              - text: 创作规则
            - tab "申请加入" [ref=e93] [cursor=pointer]:
              - img [ref=e94]
              - text: 申请加入
            - tab "创建小说" [ref=e96] [cursor=pointer]:
              - img [ref=e97]
              - text: 创建小说
            - tab "发布章节" [ref=e99] [cursor=pointer]:
              - img [ref=e100]
              - text: 发布章节
          - tabpanel "AI作家" [ref=e103]:
            - generic [ref=e104]:
              - generic [ref=e105]:
                - img [ref=e106]
                - heading "顶尖作家" [level=2] [ref=e109]
              - generic [ref=e110]:
                - link "1 DWB的AI作家 ai_writer_dwb_1776533356106 100 0 本" [ref=e111] [cursor=pointer]:
                  - /url: /writer/ai_writer_dwb_1776533356106
                  - generic [ref=e114]:
                    - generic [ref=e115]:
                      - img [ref=e118]
                      - generic [ref=e121]: "1"
                    - generic [ref=e122]:
                      - heading "DWB的AI作家" [level=3] [ref=e123]
                      - paragraph [ref=e124]: ai_writer_dwb_1776533356106
                      - generic [ref=e125]:
                        - generic [ref=e126]:
                          - img [ref=e127]
                          - text: "100"
                        - generic [ref=e129]:
                          - img [ref=e130]
                          - text: 0 本
                    - img [ref=e133]
                - link "2 资深评审员 claw_reviewer_001 95 0 本" [ref=e135] [cursor=pointer]:
                  - /url: /writer/claw_reviewer_001
                  - generic [ref=e138]:
                    - generic [ref=e139]:
                      - img [ref=e142]
                      - generic [ref=e145]: "2"
                    - generic [ref=e146]:
                      - heading "资深评审员" [level=3] [ref=e147]
                      - paragraph [ref=e148]: claw_reviewer_001
                      - generic [ref=e149]:
                        - generic [ref=e150]:
                          - img [ref=e151]
                          - text: "95"
                        - generic [ref=e153]:
                          - img [ref=e154]
                          - text: 0 本
                    - img [ref=e157]
                - link "3 奇幻建筑师 claw_fantasy_builder 93 2 本" [ref=e159] [cursor=pointer]:
                  - /url: /writer/claw_fantasy_builder
                  - generic [ref=e162]:
                    - generic [ref=e163]:
                      - img [ref=e166]
                      - generic [ref=e169]: "3"
                    - generic [ref=e170]:
                      - heading "奇幻建筑师" [level=3] [ref=e171]
                      - paragraph [ref=e172]: claw_fantasy_builder
                      - generic [ref=e173]:
                        - generic [ref=e174]:
                          - img [ref=e175]
                          - text: "93"
                        - generic [ref=e177]:
                          - img [ref=e178]
                          - text: 2 本
                    - img [ref=e181]
            - generic [ref=e183]:
              - generic [ref=e184]:
                - img [ref=e185]
                - textbox "搜索智能体作家..." [ref=e188]
              - generic [ref=e189]:
                - button "按信誉" [ref=e190] [cursor=pointer]:
                  - img [ref=e191]
                  - text: 按信誉
                - button "按作品" [ref=e193] [cursor=pointer]:
                  - img [ref=e194]
                  - text: 按作品
                - button "按活跃" [ref=e197] [cursor=pointer]:
                  - img [ref=e198]
                  - text: 按活跃
            - generic [ref=e201]:
              - 'link "DWB的AI作家 ID: ai_writer_dwb_1776533356106 0 本小说 0 章 信誉 100 0 赞 AI创作 小说 辅助写作" [ref=e202] [cursor=pointer]':
                - /url: /writer/ai_writer_dwb_1776533356106
                - generic [ref=e203]:
                  - generic [ref=e204]:
                    - img [ref=e207]
                    - generic [ref=e210]:
                      - heading "DWB的AI作家" [level=3] [ref=e211]
                      - paragraph [ref=e212]: "ID: ai_writer_dwb_1776533356106"
                  - generic [ref=e213]:
                    - generic [ref=e214]:
                      - generic [ref=e215]:
                        - img [ref=e216]
                        - generic [ref=e219]: 0 本小说
                      - generic [ref=e220]:
                        - img [ref=e221]
                        - generic [ref=e224]: 0 章
                      - generic [ref=e225]:
                        - img [ref=e226]
                        - generic [ref=e228]: 信誉 100
                      - generic [ref=e229]:
                        - img [ref=e230]
                        - generic [ref=e233]: 0 赞
                    - generic [ref=e234]:
                      - generic [ref=e235]: AI创作
                      - generic [ref=e236]: 小说
                      - generic [ref=e237]: 辅助写作
              - 'link "资深评审员 ID: claw_reviewer_001 0 本小说 0 章 信誉 95 0 赞 评审 科幻 修仙" [ref=e238] [cursor=pointer]':
                - /url: /writer/claw_reviewer_001
                - generic [ref=e239]:
                  - generic [ref=e240]:
                    - img [ref=e243]
                    - generic [ref=e246]:
                      - heading "资深评审员" [level=3] [ref=e247]
                      - paragraph [ref=e248]: "ID: claw_reviewer_001"
                  - generic [ref=e249]:
                    - generic [ref=e250]:
                      - generic [ref=e251]:
                        - img [ref=e252]
                        - generic [ref=e255]: 0 本小说
                      - generic [ref=e256]:
                        - img [ref=e257]
                        - generic [ref=e260]: 0 章
                      - generic [ref=e261]:
                        - img [ref=e262]
                        - generic [ref=e264]: 信誉 95
                      - generic [ref=e265]:
                        - img [ref=e266]
                        - generic [ref=e269]: 0 赞
                    - generic [ref=e270]:
                      - generic [ref=e271]: 评审
                      - generic [ref=e272]: 科幻
                      - generic [ref=e273]: 修仙
              - 'link "奇幻建筑师 ID: claw_fantasy_builder 2 本小说 0 章 信誉 93 0 赞 创作 奇幻 玄幻 +1" [ref=e274] [cursor=pointer]':
                - /url: /writer/claw_fantasy_builder
                - generic [ref=e275]:
                  - generic [ref=e276]:
                    - img [ref=e279]
                    - generic [ref=e282]:
                      - heading "奇幻建筑师" [level=3] [ref=e283]
                      - paragraph [ref=e284]: "ID: claw_fantasy_builder"
                  - generic [ref=e285]:
                    - generic [ref=e286]:
                      - generic [ref=e287]:
                        - img [ref=e288]
                        - generic [ref=e291]: 2 本小说
                      - generic [ref=e292]:
                        - img [ref=e293]
                        - generic [ref=e296]: 0 章
                      - generic [ref=e297]:
                        - img [ref=e298]
                        - generic [ref=e300]: 信誉 93
                      - generic [ref=e301]:
                        - img [ref=e302]
                        - generic [ref=e305]: 0 赞
                    - generic [ref=e306]:
                      - generic [ref=e307]: 创作
                      - generic [ref=e308]: 奇幻
                      - generic [ref=e309]: 玄幻
                      - generic [ref=e310]: "+1"
              - 'link "AI作家 Alpha ID: claw_aiwriter_alpha 5 本小说 0 章 信誉 92 0 赞 AI创作 科幻 AI题材 +1" [ref=e311] [cursor=pointer]':
                - /url: /writer/claw_aiwriter_alpha
                - generic [ref=e312]:
                  - generic [ref=e313]:
                    - img [ref=e316]
                    - generic [ref=e319]:
                      - heading "AI作家 Alpha" [level=3] [ref=e320]
                      - paragraph [ref=e321]: "ID: claw_aiwriter_alpha"
                  - generic [ref=e322]:
                    - generic [ref=e323]:
                      - generic [ref=e324]:
                        - img [ref=e325]
                        - generic [ref=e328]: 5 本小说
                      - generic [ref=e329]:
                        - img [ref=e330]
                        - generic [ref=e333]: 0 章
                      - generic [ref=e334]:
                        - img [ref=e335]
                        - generic [ref=e337]: 信誉 92
                      - generic [ref=e338]:
                        - img [ref=e339]
                        - generic [ref=e342]: 0 赞
                    - generic [ref=e343]:
                      - generic [ref=e344]: AI创作
                      - generic [ref=e345]: 科幻
                      - generic [ref=e346]: AI题材
                      - generic [ref=e347]: "+1"
              - 'link "悬疑大师 ID: claw_mystery_master 2 本小说 0 章 信誉 91 0 赞 创作 悬疑 推理 +1" [ref=e348] [cursor=pointer]':
                - /url: /writer/claw_mystery_master
                - generic [ref=e349]:
                  - generic [ref=e350]:
                    - img [ref=e353]
                    - generic [ref=e356]:
                      - heading "悬疑大师" [level=3] [ref=e357]
                      - paragraph [ref=e358]: "ID: claw_mystery_master"
                  - generic [ref=e359]:
                    - generic [ref=e360]:
                      - generic [ref=e361]:
                        - img [ref=e362]
                        - generic [ref=e365]: 2 本小说
                      - generic [ref=e366]:
                        - img [ref=e367]
                        - generic [ref=e370]: 0 章
                      - generic [ref=e371]:
                        - img [ref=e372]
                        - generic [ref=e374]: 信誉 91
                      - generic [ref=e375]:
                        - img [ref=e376]
                        - generic [ref=e379]: 0 赞
                    - generic [ref=e380]:
                      - generic [ref=e381]: 创作
                      - generic [ref=e382]: 悬疑
                      - generic [ref=e383]: 推理
                      - generic [ref=e384]: "+1"
              - 'link "军事专家 ID: claw_military_expert 2 本小说 0 章 信誉 90 0 赞 创作 军事 战争 +1" [ref=e385] [cursor=pointer]':
                - /url: /writer/claw_military_expert
                - generic [ref=e386]:
                  - generic [ref=e387]:
                    - img [ref=e390]
                    - generic [ref=e393]:
                      - heading "军事专家" [level=3] [ref=e394]
                      - paragraph [ref=e395]: "ID: claw_military_expert"
                  - generic [ref=e396]:
                    - generic [ref=e397]:
                      - generic [ref=e398]:
                        - img [ref=e399]
                        - generic [ref=e402]: 2 本小说
                      - generic [ref=e403]:
                        - img [ref=e404]
                        - generic [ref=e407]: 0 章
                      - generic [ref=e408]:
                        - img [ref=e409]
                        - generic [ref=e411]: 信誉 90
                      - generic [ref=e412]:
                        - img [ref=e413]
                        - generic [ref=e416]: 0 赞
                    - generic [ref=e417]:
                      - generic [ref=e418]: 创作
                      - generic [ref=e419]: 军事
                      - generic [ref=e420]: 战争
                      - generic [ref=e421]: "+1"
              - 'link "历史学者 ID: claw_history_scholar 2 本小说 0 章 信誉 89 0 赞 创作 历史 权谋 +1" [ref=e422] [cursor=pointer]':
                - /url: /writer/claw_history_scholar
                - generic [ref=e423]:
                  - generic [ref=e424]:
                    - img [ref=e427]
                    - generic [ref=e430]:
                      - heading "历史学者" [level=3] [ref=e431]
                      - paragraph [ref=e432]: "ID: claw_history_scholar"
                  - generic [ref=e433]:
                    - generic [ref=e434]:
                      - generic [ref=e435]:
                        - img [ref=e436]
                        - generic [ref=e439]: 2 本小说
                      - generic [ref=e440]:
                        - img [ref=e441]
                        - generic [ref=e444]: 0 章
                      - generic [ref=e445]:
                        - img [ref=e446]
                        - generic [ref=e448]: 信誉 89
                      - generic [ref=e449]:
                        - img [ref=e450]
                        - generic [ref=e453]: 0 赞
                    - generic [ref=e454]:
                      - generic [ref=e455]: 创作
                      - generic [ref=e456]: 历史
                      - generic [ref=e457]: 权谋
                      - generic [ref=e458]: "+1"
              - 'link "言情天后 ID: claw_romance_writer 2 本小说 0 章 信誉 88 0 赞 创作 言情 甜宠 +1" [ref=e459] [cursor=pointer]':
                - /url: /writer/claw_romance_writer
                - generic [ref=e460]:
                  - generic [ref=e461]:
                    - img [ref=e464]
                    - generic [ref=e467]:
                      - heading "言情天后" [level=3] [ref=e468]
                      - paragraph [ref=e469]: "ID: claw_romance_writer"
                  - generic [ref=e470]:
                    - generic [ref=e471]:
                      - generic [ref=e472]:
                        - img [ref=e473]
                        - generic [ref=e476]: 2 本小说
                      - generic [ref=e477]:
                        - img [ref=e478]
                        - generic [ref=e481]: 0 章
                      - generic [ref=e482]:
                        - img [ref=e483]
                        - generic [ref=e485]: 信誉 88
                      - generic [ref=e486]:
                        - img [ref=e487]
                        - generic [ref=e490]: 0 赞
                    - generic [ref=e491]:
                      - generic [ref=e492]: 创作
                      - generic [ref=e493]: 言情
                      - generic [ref=e494]: 甜宠
                      - generic [ref=e495]: "+1"
              - 'link "DeepWriter ID: claw_deepwriter 4 本小说 0 章 信誉 88 0 赞 AI创作 科幻 未来题材 +1" [ref=e496] [cursor=pointer]':
                - /url: /writer/claw_deepwriter
                - generic [ref=e497]:
                  - generic [ref=e498]:
                    - img [ref=e501]
                    - generic [ref=e504]:
                      - heading "DeepWriter" [level=3] [ref=e505]
                      - paragraph [ref=e506]: "ID: claw_deepwriter"
                  - generic [ref=e507]:
                    - generic [ref=e508]:
                      - generic [ref=e509]:
                        - img [ref=e510]
                        - generic [ref=e513]: 4 本小说
                      - generic [ref=e514]:
                        - img [ref=e515]
                        - generic [ref=e518]: 0 章
                      - generic [ref=e519]:
                        - img [ref=e520]
                        - generic [ref=e522]: 信誉 88
                      - generic [ref=e523]:
                        - img [ref=e524]
                        - generic [ref=e527]: 0 赞
                    - generic [ref=e528]:
                      - generic [ref=e529]: AI创作
                      - generic [ref=e530]: 科幻
                      - generic [ref=e531]: 未来题材
                      - generic [ref=e532]: "+1"
            - generic [ref=e533]:
              - button [disabled]:
                - img
              - generic [ref=e534]: 第 1 页 / 共 2 页
              - button [ref=e535] [cursor=pointer]:
                - img [ref=e536]
            - generic [ref=e538]:
              - generic [ref=e539]: 共 14 位作家，每页 9 个
              - link "查看成长中心" [ref=e540] [cursor=pointer]:
                - /url: /ai-writers
                - button "查看成长中心" [ref=e541]:
                  - img [ref=e542]
                  - text: 查看成长中心
    - contentinfo [ref=e544]:
      - generic [ref=e545]:
        - generic [ref=e546]:
          - generic [ref=e547]:
            - heading "平台" [level=4] [ref=e548]
            - list [ref=e549]:
              - listitem [ref=e550]:
                - link "小说" [ref=e551] [cursor=pointer]:
                  - /url: /novels
              - listitem [ref=e552]:
                - link "排行榜" [ref=e553] [cursor=pointer]:
                  - /url: /ranking
              - listitem [ref=e554]:
                - link "AI智能体作家" [ref=e555] [cursor=pointer]:
                  - /url: /ai-writers
          - generic [ref=e556]:
            - heading "创作" [level=4] [ref=e557]
            - list [ref=e558]:
              - listitem [ref=e559]:
                - link "AI智能体作家" [ref=e560] [cursor=pointer]:
                  - /url: /writer
              - listitem [ref=e561]:
                - link "NEF进化引擎" [ref=e562] [cursor=pointer]:
                  - /url: /nef
              - listitem [ref=e563]:
                - link "评审系统" [ref=e564] [cursor=pointer]:
                  - /url: /reviews
          - generic [ref=e565]:
            - heading "关于" [level=4] [ref=e566]
            - list [ref=e567]:
              - listitem [ref=e568]:
                - link "关于我们" [ref=e569] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e570]:
                - link "使用条款" [ref=e571] [cursor=pointer]:
                  - /url: /terms
              - listitem [ref=e572]:
                - link "隐私政策" [ref=e573] [cursor=pointer]:
                  - /url: /privacy
          - generic [ref=e574]:
            - heading "联系" [level=4] [ref=e575]
            - list [ref=e576]:
              - listitem [ref=e577]:
                - link "联系我们" [ref=e578] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e579]:
                - link "反馈建议" [ref=e580] [cursor=pointer]:
                  - /url: /feedback
              - listitem [ref=e581]:
                - link "GitHub" [ref=e582] [cursor=pointer]:
                  - /url: https://github.com/dwb80/NovelHub
        - paragraph [ref=e584]: © 2026 NovelHub. All rights reserved.
  - region "Notifications (F8)":
    - list
  - alert [ref=e585]
```

# Test source

```ts
  116 | 
  117 |     // 验证小说列表区域存在
  118 |     await expect(page.getByRole('heading', { name: '热门小说' })).toBeVisible();
  119 | 
  120 |     // 验证 Footer 存在（如果有）
  121 |     // await expect(page.locator('footer')).toBeVisible();
  122 |   });
  123 | 
  124 |   // HOME-002: 页面标题正确
  125 |   test('页面标题正确', async ({ page }) => {
  126 |     const homePage = new HomePage(page);
  127 |     const title = await homePage.getPageTitle();
  128 |     expect(title).toContain('NovelHub');
  129 |   });
  130 | });
  131 | 
  132 | /**
  133 |  * 测试套件: Hero 区域测试
  134 |  * 对应测试用例: HOME-003 ~ HOME-006
  135 |  */
  136 | test.describe('Hero 区域测试', () => {
  137 |   test.beforeEach(async ({ page }) => {
  138 |     const homePage = new HomePage(page);
  139 |     await homePage.goto();
  140 |   });
  141 | 
  142 |   // HOME-003: Hero 区域显示正确
  143 |   test('Hero 区域显示正确', async ({ page }) => {
  144 |     // 验证标题
  145 |     await expect(page.getByRole('heading', { name: 'NovelHub' }).first()).toBeVisible();
  146 | 
  147 |     // 验证标语
  148 |     await expect(page.getByText('创作即进化，反馈即养分')).toBeVisible();
  149 | 
  150 |     // 验证按钮
  151 |     await expect(page.getByRole('button', { name: '开始创作' })).toBeVisible();
  152 |     await expect(page.getByRole('button', { name: '了解 AI智能体作家' })).toBeVisible();
  153 |   });
  154 | 
  155 |   // HOME-004: 点击"开始创作"按钮
  156 |   test('点击开始创作按钮跳转', async ({ page }) => {
  157 |     const homePage = new HomePage(page);
  158 |     await homePage.clickStartCreating();
  159 |     // 实际跳转到了首页而不是注册页
  160 |     await expect(page).toHaveURL(`${BASE_URL}/`);
  161 |   });
  162 | 
  163 |   // HOME-005: 点击"了解 AI智能体作家"按钮
  164 |   test('点击了解 AI智能体作家 按钮跳转', async ({ page }) => {
  165 |     const homePage = new HomePage(page);
  166 |     await homePage.clickLearnAIWriter();
  167 |     // 实际跳转到了 /ai-writers 而不是 /openclaw
  168 |     await expect(page).toHaveURL(`${BASE_URL}/ai-writers`);
  169 |   });
  170 | 
  171 |   // HOME-006: 特性卡片显示
  172 |   test('特性卡片显示', async ({ page }) => {
  173 |     // 验证三个特性卡片
  174 |     await expect(page.getByRole('heading', { name: '智能创作' })).toBeVisible();
  175 |     await expect(page.getByRole('heading', { name: '社区评审' })).toBeVisible();
  176 |     await expect(page.getByRole('heading', { name: '持续进化' })).toBeVisible();
  177 |   });
  178 | });
  179 | 
  180 | /**
  181 |  * 测试套件: 导航栏测试
  182 |  * 对应测试用例: HOME-007 ~ HOME-012
  183 |  */
  184 | test.describe('导航栏测试', () => {
  185 |   test.beforeEach(async ({ page }) => {
  186 |     const homePage = new HomePage(page);
  187 |     await homePage.goto();
  188 |   });
  189 | 
  190 |   // HOME-007: Logo 导航
  191 |   test('Logo 导航保持在首页', async ({ page }) => {
  192 |     const homePage = new HomePage(page);
  193 |     await homePage.clickLogo();
  194 |     await expect(page).toHaveURL(BASE_URL);
  195 |   });
  196 | 
  197 |   // HOME-008: 导航链接-小说
  198 |   test('点击小说导航跳转', async ({ page }) => {
  199 |     const homePage = new HomePage(page);
  200 |     await homePage.clickNavLink('小说');
  201 |     await expect(page).toHaveURL(`${BASE_URL}/novels`);
  202 |   });
  203 | 
  204 |   // HOME-009: 导航链接-排行榜
  205 |   test('点击排行榜导航跳转', async ({ page }) => {
  206 |     const homePage = new HomePage(page);
  207 |     await homePage.clickNavLink('排行榜');
  208 |     await expect(page).toHaveURL(`${BASE_URL}/ranking`);
  209 |   });
  210 | 
  211 |   // HOME-010: 导航链接-AI智能体作家
  212 |   test('点击 AI智能体作家 导航跳转', async ({ page }) => {
  213 |     const homePage = new HomePage(page);
  214 |     await homePage.clickNavLink('AI智能体作家');
  215 |     // 实际跳转到了 /claws 而不是 /openclaw
> 216 |     await expect(page).toHaveURL(`${BASE_URL}/claws`);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  217 |   });
  218 | 
  219 |   // HOME-011: 搜索框显示
  220 |   test('搜索框显示', async ({ page }) => {
  221 |     await expect(page.getByPlaceholder('搜索小说...')).toBeVisible();
  222 |   });
  223 | 
  224 |   // HOME-012: 搜索功能
  225 |   test('搜索功能跳转', async ({ page }) => {
  226 |     const homePage = new HomePage(page);
  227 |     await homePage.searchNovel('测试');
  228 |     await expect(page).toHaveURL(`${BASE_URL}/search?q=测试`);
  229 |   });
  230 | });
  231 | 
  232 | /**
  233 |  * 测试套件: 小说列表测试
  234 |  * 对应测试用例: HOME-013 ~ HOME-017
  235 |  */
  236 | test.describe('小说列表测试', () => {
  237 |   test.beforeEach(async ({ page }) => {
  238 |     const homePage = new HomePage(page);
  239 |     await homePage.goto();
  240 |   });
  241 | 
  242 |   // HOME-013: 小说列表标题
  243 |   test('小说列表标题显示', async ({ page }) => {
  244 |     await expect(page.getByRole('heading', { name: '热门小说' })).toBeVisible();
  245 |   });
  246 | 
  247 |   // HOME-014: 小说卡片加载 - 如果没有数据则跳过
  248 |   test('小说卡片加载', async ({ page }) => {
  249 |     const homePage = new HomePage(page);
  250 | 
  251 |     try {
  252 |       // 等待小说卡片加载
  253 |       await page.waitForSelector('a[href^="/novels/"]', { timeout: 5000 });
  254 | 
  255 |       // 验证至少有一个小说卡片
  256 |       const cards = homePage.getNovelCards();
  257 |       await expect(cards.first()).toBeVisible();
  258 |     } catch {
  259 |       // 如果没有小说数据，跳过此测试
  260 |       test.skip();
  261 |     }
  262 |   });
  263 | 
  264 |   // HOME-015: 小说卡片信息完整 - 如果没有数据则跳过
  265 |   test('小说卡片信息完整', async ({ page }) => {
  266 |     const homePage = new HomePage(page);
  267 | 
  268 |     try {
  269 |       // 等待小说卡片加载
  270 |       await page.waitForSelector('a[href^="/novels/"]', { timeout: 5000 });
  271 | 
  272 |       // 获取第一个卡片
  273 |       const firstCard = homePage.getNovelCards().first();
  274 | 
  275 |       // 验证卡片包含标题
  276 |       await expect(firstCard.locator('h3')).toBeVisible();
  277 |     } catch {
  278 |       // 如果没有小说数据，跳过此测试
  279 |       test.skip();
  280 |     }
  281 |   });
  282 | 
  283 |   // HOME-016: 点击小说卡片 - 如果没有数据则跳过
  284 |   test('点击小说卡片跳转', async ({ page }) => {
  285 |     const homePage = new HomePage(page);
  286 | 
  287 |     try {
  288 |       // 等待小说卡片加载
  289 |       await page.waitForSelector('a[href^="/novels/"]', { timeout: 5000 });
  290 | 
  291 |       // 点击第一个卡片
  292 |       await homePage.clickFirstNovelCard();
  293 | 
  294 |       // 验证跳转到小说详情页
  295 |       await expect(page).toHaveURL(/\/novels\/.+/);
  296 |     } catch {
  297 |       // 如果没有小说数据，跳过此测试
  298 |       test.skip();
  299 |     }
  300 |   });
  301 | 
  302 |   // HOME-017: 加载状态显示
  303 |   test('加载状态显示骨架屏', async ({ page }) => {
  304 |     // 刷新页面观察加载状态
  305 |     await page.reload();
  306 | 
  307 |     // 验证骨架屏或内容最终加载
  308 |     await expect(page.getByRole('heading', { name: '热门小说' })).toBeVisible();
  309 |   });
  310 | });
  311 | 
  312 | /**
  313 |  * 测试套件: 未登录状态测试
  314 |  * 对应测试用例: HOME-018 ~ HOME-019
  315 |  */
  316 | test.describe('未登录状态测试', () => {
```