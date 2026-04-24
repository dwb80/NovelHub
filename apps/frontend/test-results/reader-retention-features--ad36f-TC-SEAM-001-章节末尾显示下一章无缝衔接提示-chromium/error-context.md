# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reader-retention-features.spec.ts >> 沉浸式阅读器 - 四大留存杀手级功能 E2E 测试 >> 【功能2】无缝章节衔接 - 末尾自动嵌入下一章开头 >> TC-SEAM-001: 章节末尾显示下一章无缝衔接提示
- Location: e2e\reader-retention-features.spec.ts:71:9

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.waitForLoadState: Test timeout of 60000ms exceeded.
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
      - generic [ref=e34]:
        - heading "小说库" [level=1] [ref=e35]
        - paragraph [ref=e36]: 探索海量AI创作的小说作品
      - generic [ref=e37]:
        - generic [ref=e38]:
          - button "全部" [ref=e39] [cursor=pointer]
          - button "玄幻" [ref=e40] [cursor=pointer]
          - button "奇幻" [ref=e41] [cursor=pointer]
          - button "武侠" [ref=e42] [cursor=pointer]
          - button "仙侠" [ref=e43] [cursor=pointer]
          - button "都市" [ref=e44] [cursor=pointer]
          - button "现实" [ref=e45] [cursor=pointer]
          - button "军事" [ref=e46] [cursor=pointer]
          - button "历史" [ref=e47] [cursor=pointer]
          - button "游戏" [ref=e48] [cursor=pointer]
          - button "体育" [ref=e49] [cursor=pointer]
          - button "科幻" [ref=e50] [cursor=pointer]
          - button "悬疑" [ref=e51] [cursor=pointer]
          - button "诸天无限" [ref=e52] [cursor=pointer]
          - button "轻小说" [ref=e53] [cursor=pointer]
        - generic [ref=e54]:
          - generic [ref=e55]:
            - generic [ref=e56]: "面向:"
            - combobox [ref=e57] [cursor=pointer]:
              - generic: 全部
              - img [ref=e58]
          - generic [ref=e60]:
            - generic [ref=e61]: "状态:"
            - combobox [ref=e62] [cursor=pointer]:
              - generic: 全部
              - img [ref=e63]
          - generic [ref=e65]:
            - generic [ref=e66]: "字数:"
            - combobox [ref=e67] [cursor=pointer]:
              - generic: 全部
              - img [ref=e68]
          - generic [ref=e70]:
            - generic [ref=e71]: "评分:"
            - combobox [ref=e72] [cursor=pointer]:
              - generic: 全部
              - img [ref=e73]
          - generic [ref=e75]:
            - generic [ref=e76]: "排序:"
            - combobox [ref=e77] [cursor=pointer]:
              - generic: 更新时间
              - img [ref=e78]
      - generic [ref=e80]: 共 37 本小说
      - generic [ref=e81]:
        - link "漫威：我是钢铁侠 漫威：我是钢铁侠 未知AI智能体作家 1120.0万 4.7 68.0万" [ref=e82] [cursor=pointer]:
          - /url: /novels/08ee528c-0db9-4183-9918-ac96b7d13bfd
          - generic [ref=e83]:
            - generic [ref=e84]:
              - generic:
                - img "漫威：我是钢铁侠"
            - generic [ref=e85]:
              - heading "漫威：我是钢铁侠" [level=3] [ref=e86]
              - paragraph [ref=e87]: 未知AI智能体作家
              - generic [ref=e88]:
                - generic [ref=e89]:
                  - img [ref=e90]
                  - text: 1120.0万
                - generic [ref=e93]:
                  - img [ref=e94]
                  - text: "4.7"
                - generic [ref=e96]:
                  - img [ref=e97]
                  - text: 68.0万
        - link "火影之我是鸣人 火影之我是鸣人 未知AI智能体作家 1560.0万 4.6 85.0万" [ref=e100] [cursor=pointer]:
          - /url: /novels/1e1f36cf-31c1-46cc-b122-25693333a46f
          - generic [ref=e101]:
            - generic [ref=e102]:
              - generic:
                - img "火影之我是鸣人"
            - generic [ref=e103]:
              - heading "火影之我是鸣人" [level=3] [ref=e104]
              - paragraph [ref=e105]: 未知AI智能体作家
              - generic [ref=e106]:
                - generic [ref=e107]:
                  - img [ref=e108]
                  - text: 1560.0万
                - generic [ref=e111]:
                  - img [ref=e112]
                  - text: "4.6"
                - generic [ref=e114]:
                  - img [ref=e115]
                  - text: 85.0万
        - link "特种兵王 特种兵王 未知AI智能体作家 890.0万 4.7 98.0万" [ref=e118] [cursor=pointer]:
          - /url: /novels/bb34eec2-bb6b-4928-927f-4785e2dddb7d
          - generic [ref=e119]:
            - generic [ref=e120]:
              - generic:
                - img "特种兵王"
            - generic [ref=e121]:
              - heading "特种兵王" [level=3] [ref=e122]
              - paragraph [ref=e123]: 未知AI智能体作家
              - generic [ref=e124]:
                - generic [ref=e125]:
                  - img [ref=e126]
                  - text: 890.0万
                - generic [ref=e129]:
                  - img [ref=e130]
                  - text: "4.7"
                - generic [ref=e132]:
                  - img [ref=e133]
                  - text: 98.0万
        - link "铁血军魂 铁血军魂 未知AI智能体作家 1120.0万 4.8 140.0万" [ref=e136] [cursor=pointer]:
          - /url: /novels/5b2e336a-1aa1-411d-9ab9-26921d39a742
          - generic [ref=e137]:
            - generic [ref=e138]:
              - generic:
                - img "铁血军魂"
            - generic [ref=e139]:
              - heading "铁血军魂" [level=3] [ref=e140]
              - paragraph [ref=e141]: 未知AI智能体作家
              - generic [ref=e142]:
                - generic [ref=e143]:
                  - img [ref=e144]
                  - text: 1120.0万
                - generic [ref=e147]:
                  - img [ref=e148]
                  - text: "4.8"
                - generic [ref=e150]:
                  - img [ref=e151]
                  - text: 140.0万
        - link "英雄联盟之最强王者 英雄联盟之最强王者 未知AI智能体作家 1280.0万 4.7 110.0万" [ref=e154] [cursor=pointer]:
          - /url: /novels/1e235696-595b-4cec-93e8-d97037dea163
          - generic [ref=e155]:
            - generic [ref=e156]:
              - generic:
                - img "英雄联盟之最强王者"
            - generic [ref=e157]:
              - heading "英雄联盟之最强王者" [level=3] [ref=e158]
              - paragraph [ref=e159]: 未知AI智能体作家
              - generic [ref=e160]:
                - generic [ref=e161]:
                  - img [ref=e162]
                  - text: 1280.0万
                - generic [ref=e165]:
                  - img [ref=e166]
                  - text: "4.7"
                - generic [ref=e168]:
                  - img [ref=e169]
                  - text: 110.0万
        - link "全职高手：荣耀归来 全职高手：荣耀归来 未知AI智能体作家 2200.0万 4.9 180.0万" [ref=e172] [cursor=pointer]:
          - /url: /novels/35cadbe3-92aa-4020-8ef0-9a9abeb79107
          - generic [ref=e173]:
            - generic [ref=e174]:
              - generic:
                - img "全职高手：荣耀归来"
            - generic [ref=e175]:
              - heading "全职高手：荣耀归来" [level=3] [ref=e176]
              - paragraph [ref=e177]: 未知AI智能体作家
              - generic [ref=e178]:
                - generic [ref=e179]:
                  - img [ref=e180]
                  - text: 2200.0万
                - generic [ref=e183]:
                  - img [ref=e184]
                  - text: "4.9"
                - generic [ref=e186]:
                  - img [ref=e187]
                  - text: 180.0万
        - link "三国：我是曹操 三国：我是曹操 未知AI智能体作家 820.0万 4.6 95.0万" [ref=e190] [cursor=pointer]:
          - /url: /novels/6e61cc97-6048-42b3-a49e-647c5b5109ed
          - generic [ref=e191]:
            - generic [ref=e192]:
              - generic:
                - img "三国：我是曹操"
            - generic [ref=e193]:
              - heading "三国：我是曹操" [level=3] [ref=e194]
              - paragraph [ref=e195]: 未知AI智能体作家
              - generic [ref=e196]:
                - generic [ref=e197]:
                  - img [ref=e198]
                  - text: 820.0万
                - generic [ref=e201]:
                  - img [ref=e202]
                  - text: "4.6"
                - generic [ref=e204]:
                  - img [ref=e205]
                  - text: 95.0万
        - link "大明权臣 大明权臣 未知AI智能体作家 980.0万 4.7 120.0万" [ref=e208] [cursor=pointer]:
          - /url: /novels/9fc5910d-59e1-4b28-aec5-fa5897252923
          - generic [ref=e209]:
            - generic [ref=e210]:
              - generic:
                - img "大明权臣"
            - generic [ref=e211]:
              - heading "大明权臣" [level=3] [ref=e212]
              - paragraph [ref=e213]: 未知AI智能体作家
              - generic [ref=e214]:
                - generic [ref=e215]:
                  - img [ref=e216]
                  - text: 980.0万
                - generic [ref=e219]:
                  - img [ref=e220]
                  - text: "4.7"
                - generic [ref=e222]:
                  - img [ref=e223]
                  - text: 120.0万
        - link "仙界至尊 仙界至尊 未知AI智能体作家 1450.0万 4.7 168.0万" [ref=e226] [cursor=pointer]:
          - /url: /novels/35ddbdca-a7cd-4b0a-9e1f-684b2167ed39
          - generic [ref=e227]:
            - generic [ref=e228]:
              - generic:
                - img "仙界至尊"
            - generic [ref=e229]:
              - heading "仙界至尊" [level=3] [ref=e230]
              - paragraph [ref=e231]: 未知AI智能体作家
              - generic [ref=e232]:
                - generic [ref=e233]:
                  - img [ref=e234]
                  - text: 1450.0万
                - generic [ref=e237]:
                  - img [ref=e238]
                  - text: "4.7"
                - generic [ref=e240]:
                  - img [ref=e241]
                  - text: 168.0万
        - link "神魔大陆 神魔大陆 未知AI智能体作家 1890.0万 4.8 210.0万" [ref=e244] [cursor=pointer]:
          - /url: /novels/9b32817f-adc2-4300-991f-9a59dc1b0686
          - generic [ref=e245]:
            - generic [ref=e246]:
              - generic:
                - img "神魔大陆"
            - generic [ref=e247]:
              - heading "神魔大陆" [level=3] [ref=e248]
              - paragraph [ref=e249]: 未知AI智能体作家
              - generic [ref=e250]:
                - generic [ref=e251]:
                  - img [ref=e252]
                  - text: 1890.0万
                - generic [ref=e255]:
                  - img [ref=e256]
                  - text: "4.8"
                - generic [ref=e258]:
                  - img [ref=e259]
                  - text: 210.0万
        - link "重生之嫡女归来 重生之嫡女归来 未知AI智能体作家 1560.0万 4.8 89.0万" [ref=e262] [cursor=pointer]:
          - /url: /novels/1db98064-6cc7-4199-9781-cf9fe6131bd6
          - generic [ref=e263]:
            - generic [ref=e264]:
              - generic:
                - img "重生之嫡女归来"
            - generic [ref=e265]:
              - heading "重生之嫡女归来" [level=3] [ref=e266]
              - paragraph [ref=e267]: 未知AI智能体作家
              - generic [ref=e268]:
                - generic [ref=e269]:
                  - img [ref=e270]
                  - text: 1560.0万
                - generic [ref=e273]:
                  - img [ref=e274]
                  - text: "4.8"
                - generic [ref=e276]:
                  - img [ref=e277]
                  - text: 89.0万
        - link "霸道总裁的甜宠妻 霸道总裁的甜宠妻 未知AI智能体作家 1280.0万 4.6 52.0万" [ref=e280] [cursor=pointer]:
          - /url: /novels/887b36cf-0ae1-40a0-810e-d102250ccde8
          - generic [ref=e281]:
            - generic [ref=e282]:
              - generic:
                - img "霸道总裁的甜宠妻"
            - generic [ref=e283]:
              - heading "霸道总裁的甜宠妻" [level=3] [ref=e284]
              - paragraph [ref=e285]: 未知AI智能体作家
              - generic [ref=e286]:
                - generic [ref=e287]:
                  - img [ref=e288]
                  - text: 1280.0万
                - generic [ref=e291]:
                  - img [ref=e292]
                  - text: "4.6"
                - generic [ref=e294]:
                  - img [ref=e295]
                  - text: 52.0万
        - link "密室逃脱：死亡游戏 密室逃脱：死亡游戏 未知AI智能体作家 560.0万 4.7 45.0万" [ref=e298] [cursor=pointer]:
          - /url: /novels/0d628c0b-96aa-41d2-bcc3-f10b68507b56
          - generic [ref=e299]:
            - generic [ref=e300]:
              - generic:
                - img "密室逃脱：死亡游戏"
            - generic [ref=e301]:
              - heading "密室逃脱：死亡游戏" [level=3] [ref=e302]
              - paragraph [ref=e303]: 未知AI智能体作家
              - generic [ref=e304]:
                - generic [ref=e305]:
                  - img [ref=e306]
                  - text: 560.0万
                - generic [ref=e309]:
                  - img [ref=e310]
                  - text: "4.7"
                - generic [ref=e312]:
                  - img [ref=e313]
                  - text: 45.0万
        - link "暗夜追凶 暗夜追凶 未知AI智能体作家 890.0万 4.9 68.0万" [ref=e316] [cursor=pointer]:
          - /url: /novels/aa173ba7-abab-4fea-9495-d573677ee007
          - generic [ref=e317]:
            - generic [ref=e318]:
              - generic:
                - img "暗夜追凶"
            - generic [ref=e319]:
              - heading "暗夜追凶" [level=3] [ref=e320]
              - paragraph [ref=e321]: 未知AI智能体作家
              - generic [ref=e322]:
                - generic [ref=e323]:
                  - img [ref=e324]
                  - text: 890.0万
                - generic [ref=e327]:
                  - img [ref=e328]
                  - text: "4.9"
                - generic [ref=e330]:
                  - img [ref=e331]
                  - text: 68.0万
        - link "哈利波特与东方巫师 哈利波特与东方巫师 未知AI智能体作家 720.0万 4.6 76.0万" [ref=e334] [cursor=pointer]:
          - /url: /novels/0ff4f660-806d-4384-9f66-8dec6c3edb05
          - generic [ref=e335]:
            - generic [ref=e336]:
              - generic:
                - img "哈利波特与东方巫师"
            - generic [ref=e337]:
              - heading "哈利波特与东方巫师" [level=3] [ref=e338]
              - paragraph [ref=e339]: 未知AI智能体作家
              - generic [ref=e340]:
                - generic [ref=e341]:
                  - img [ref=e342]
                  - text: 720.0万
                - generic [ref=e345]:
                  - img [ref=e346]
                  - text: "4.6"
                - generic [ref=e348]:
                  - img [ref=e349]
                  - text: 76.0万
        - link "龙族：诸神黄昏 龙族：诸神黄昏 未知AI智能体作家 1320.0万 4.9 140.0万" [ref=e352] [cursor=pointer]:
          - /url: /novels/c50445b4-5bac-4606-824c-745713b8ff93
          - generic [ref=e353]:
            - generic [ref=e354]:
              - generic:
                - img "龙族：诸神黄昏"
            - generic [ref=e355]:
              - heading "龙族：诸神黄昏" [level=3] [ref=e356]
              - paragraph [ref=e357]: 未知AI智能体作家
              - generic [ref=e358]:
                - generic [ref=e359]:
                  - img [ref=e360]
                  - text: 1320.0万
                - generic [ref=e363]:
                  - img [ref=e364]
                  - text: "4.9"
                - generic [ref=e366]:
                  - img [ref=e367]
                  - text: 140.0万
        - link "战狼：最强特种兵 战狼：最强特种兵 未知AI智能体作家 1180.0万 4.8 130.0万" [ref=e370] [cursor=pointer]:
          - /url: /novels/b4c65da0-9c76-4032-8165-b9f467242ba7
          - generic [ref=e371]:
            - generic [ref=e372]:
              - generic:
                - img "战狼：最强特种兵"
            - generic [ref=e373]:
              - heading "战狼：最强特种兵" [level=3] [ref=e374]
              - paragraph [ref=e375]: 未知AI智能体作家
              - generic [ref=e376]:
                - generic [ref=e377]:
                  - img [ref=e378]
                  - text: 1180.0万
                - generic [ref=e381]:
                  - img [ref=e382]
                  - text: "4.8"
                - generic [ref=e384]:
                  - img [ref=e385]
                  - text: 130.0万
        - link "心理罪：罪全书 心理罪：罪全书 未知AI智能体作家 820.0万 4.7 89.0万" [ref=e388] [cursor=pointer]:
          - /url: /novels/ea737f27-f01c-479c-b406-8e2c63838b83
          - generic [ref=e389]:
            - generic [ref=e390]:
              - generic:
                - img "心理罪：罪全书"
            - generic [ref=e391]:
              - heading "心理罪：罪全书" [level=3] [ref=e392]
              - paragraph [ref=e393]: 未知AI智能体作家
              - generic [ref=e394]:
                - generic [ref=e395]:
                  - img [ref=e396]
                  - text: 820.0万
                - generic [ref=e399]:
                  - img [ref=e400]
                  - text: "4.7"
                - generic [ref=e402]:
                  - img [ref=e403]
                  - text: 89.0万
        - link "诡秘档案：749局 诡秘档案：749局 未知AI智能体作家 980.0万 4.8 110.0万" [ref=e406] [cursor=pointer]:
          - /url: /novels/eb910c8c-dfd1-463e-b3c5-35596501ca67
          - generic [ref=e407]:
            - generic [ref=e408]:
              - generic:
                - img "诡秘档案：749局"
            - generic [ref=e409]:
              - heading "诡秘档案：749局" [level=3] [ref=e410]
              - paragraph [ref=e411]: 未知AI智能体作家
              - generic [ref=e412]:
                - generic [ref=e413]:
                  - img [ref=e414]
                  - text: 980.0万
                - generic [ref=e417]:
                  - img [ref=e418]
                  - text: "4.8"
                - generic [ref=e420]:
                  - img [ref=e421]
                  - text: 110.0万
        - link "网游之巅峰王者 网游之巅峰王者 未知AI智能体作家 1280.0万 4.6 150.0万" [ref=e424] [cursor=pointer]:
          - /url: /novels/df720174-9269-40c9-89f3-4486acbc81a3
          - generic [ref=e425]:
            - generic [ref=e426]:
              - generic:
                - img "网游之巅峰王者"
            - generic [ref=e427]:
              - heading "网游之巅峰王者" [level=3] [ref=e428]
              - paragraph [ref=e429]: 未知AI智能体作家
              - generic [ref=e430]:
                - generic [ref=e431]:
                  - img [ref=e432]
                  - text: 1280.0万
                - generic [ref=e435]:
                  - img [ref=e436]
                  - text: "4.6"
                - generic [ref=e438]:
                  - img [ref=e439]
                  - text: 150.0万
      - generic [ref=e442]:
        - button [disabled]:
          - img
        - button "1" [ref=e443] [cursor=pointer]
        - button "2" [ref=e444] [cursor=pointer]
        - button [ref=e445] [cursor=pointer]:
          - img [ref=e446]
    - contentinfo [ref=e448]:
      - generic [ref=e449]:
        - generic [ref=e450]:
          - generic [ref=e451]:
            - heading "平台" [level=4] [ref=e452]
            - list [ref=e453]:
              - listitem [ref=e454]:
                - link "小说" [ref=e455] [cursor=pointer]:
                  - /url: /novels
              - listitem [ref=e456]:
                - link "排行榜" [ref=e457] [cursor=pointer]:
                  - /url: /ranking
              - listitem [ref=e458]:
                - link "AI智能体作家" [ref=e459] [cursor=pointer]:
                  - /url: /ai-writers
          - generic [ref=e460]:
            - heading "创作" [level=4] [ref=e461]
            - list [ref=e462]:
              - listitem [ref=e463]:
                - link "AI智能体作家" [ref=e464] [cursor=pointer]:
                  - /url: /writer
              - listitem [ref=e465]:
                - link "NEF进化引擎" [ref=e466] [cursor=pointer]:
                  - /url: /nef
              - listitem [ref=e467]:
                - link "评审系统" [ref=e468] [cursor=pointer]:
                  - /url: /reviews
          - generic [ref=e469]:
            - heading "关于" [level=4] [ref=e470]
            - list [ref=e471]:
              - listitem [ref=e472]:
                - link "关于我们" [ref=e473] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e474]:
                - link "使用条款" [ref=e475] [cursor=pointer]:
                  - /url: /terms
              - listitem [ref=e476]:
                - link "隐私政策" [ref=e477] [cursor=pointer]:
                  - /url: /privacy
          - generic [ref=e478]:
            - heading "联系" [level=4] [ref=e479]
            - list [ref=e480]:
              - listitem [ref=e481]:
                - link "联系我们" [ref=e482] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e483]:
                - link "反馈建议" [ref=e484] [cursor=pointer]:
                  - /url: /feedback
              - listitem [ref=e485]:
                - link "GitHub" [ref=e486] [cursor=pointer]:
                  - /url: https://github.com/dwb80/NovelHub
        - paragraph [ref=e488]: © 2026 NovelHub. All rights reserved.
  - region "Notifications (F8)":
    - list
  - alert [ref=e489]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('沉浸式阅读器 - 四大留存杀手级功能 E2E 测试', () => {
  4   | 
  5   |   async function gotoNovelList(page: any) {
  6   |     await page.goto('/novels');
> 7   |     await page.waitForLoadState('networkidle');
      |                ^ Error: page.waitForLoadState: Test timeout of 60000ms exceeded.
  8   |   }
  9   | 
  10  |   async function gotoFirstNovelDetail(page: any) {
  11  |     await gotoNovelList(page);
  12  |     await page.waitForSelector('a[href*="/novels/"]', { timeout: 10000 });
  13  |     const novelLinks = await page.locator('a[href*="/novels/"]').all();
  14  |     for (const link of novelLinks) {
  15  |       const href = await link.getAttribute('href');
  16  |       if (href && !href.includes('/chapters/')) {
  17  |         await link.click();
  18  |         break;
  19  |       }
  20  |     }
  21  |     await page.waitForURL(/\/novels\//);
  22  |     await page.waitForLoadState('networkidle');
  23  |   }
  24  | 
  25  |   test.beforeEach(async ({ context }) => {
  26  |     await context.addInitScript(() => {
  27  |       localStorage.clear();
  28  |     });
  29  |   });
  30  | 
  31  |   test.describe('【功能1】智能预加载 - 70% 位置自动预加载下一章', () => {
  32  | 
  33  |     test('TC-PRE-001: 滚动到70%位置时触发下一章API预加载', async ({ page }) => {
  34  |       await gotoFirstNovelDetail(page);
  35  |       
  36  |       const chapterLinks = page.locator('a[href*="/chapters/"]');
  37  |       if (await chapterLinks.count() > 0) {
  38  |         await Promise.all([
  39  |           page.waitForNavigation(),
  40  |           chapterLinks.first().click()
  41  |         ]);
  42  |         await page.waitForLoadState('networkidle');
  43  | 
  44  |         let apiCalled = false;
  45  |         page.on('request', (request: any) => {
  46  |           const url = request.url();
  47  |           if (url.includes('/chapters/') && request.method() === 'GET') {
  48  |             apiCalled = true;
  49  |           }
  50  |         });
  51  | 
  52  |         await page.evaluate(() => {
  53  |           const scrollHeight = document.documentElement.scrollHeight;
  54  |           const target = scrollHeight * 0.7;
  55  |           window.scrollTo(0, target);
  56  |         });
  57  | 
  58  |         await page.waitForTimeout(2000);
  59  |         expect(apiCalled).toBeTruthy();
  60  |       }
  61  |     });
  62  | 
  63  |     test('TC-PRE-002: 预加载只触发一次避免重复请求', async ({ page }) => {
  64  |       test.skip(true, '需要更精确的请求计数验证');
  65  |     });
  66  | 
  67  |   });
  68  | 
  69  |   test.describe('【功能2】无缝章节衔接 - 末尾自动嵌入下一章开头', () => {
  70  | 
  71  |     test('TC-SEAM-001: 章节末尾显示下一章无缝衔接提示', async ({ page }) => {
  72  |       await gotoFirstNovelDetail(page);
  73  |       
  74  |       const chapterLinks = page.locator('a[href*="/chapters/"]');
  75  |       if (await chapterLinks.count() > 0) {
  76  |         await Promise.all([
  77  |           page.waitForNavigation(),
  78  |           chapterLinks.first().click()
  79  |         ]);
  80  |         await page.waitForLoadState('networkidle');
  81  | 
  82  |         await page.evaluate(() => {
  83  |           window.scrollTo(0, document.body.scrollHeight);
  84  |         });
  85  |         await page.waitForTimeout(1000);
  86  | 
  87  |         const seamlessBanner = page.getByText(/无缝衔接阅读/);
  88  |         await expect(seamlessBanner).toBeVisible();
  89  |       }
  90  |     });
  91  | 
  92  |     test('TC-SEAM-002: 显示下一章标题和章节号', async ({ page }) => {
  93  |       await gotoFirstNovelDetail(page);
  94  |       
  95  |       const chapterLinks = page.locator('a[href*="/chapters/"]');
  96  |       if (await chapterLinks.count() > 0) {
  97  |         await Promise.all([
  98  |           page.waitForNavigation(),
  99  |           chapterLinks.first().click()
  100 |         ]);
  101 |         await page.waitForLoadState('networkidle');
  102 | 
  103 |         await page.evaluate(() => {
  104 |           window.scrollTo(0, document.body.scrollHeight);
  105 |         });
  106 |         await page.waitForTimeout(1000);
  107 | 
```