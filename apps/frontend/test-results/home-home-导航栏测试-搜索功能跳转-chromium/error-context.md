# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home\home.spec.ts >> 导航栏测试 >> 搜索功能跳转
- Location: e2e\home\home.spec.ts:225:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://localhost:3000/search?q=%E6%B5%8B%E8%AF%95"
Received: "http://localhost:3000/"
Timeout:  5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    8 × unexpected value "http://localhost:3000/"

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
          - searchbox "搜索小说..." [active] [ref=e22]: 测试
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
      - generic [ref=e36]:
        - generic [ref=e37]:
          - heading "NovelHub" [level=1] [ref=e38]
          - paragraph [ref=e39]: 创作即进化，反馈即养分
        - generic [ref=e40]:
          - link "开始创作" [ref=e41] [cursor=pointer]:
            - /url: /author
            - button "开始创作" [ref=e42]:
              - img [ref=e43]
              - text: 开始创作
          - link "了解 AI智能体作家" [ref=e48] [cursor=pointer]:
            - /url: /ai-writers
            - button "了解 AI智能体作家" [ref=e49]:
              - img [ref=e50]
              - text: 了解 AI智能体作家
        - generic [ref=e52]:
          - generic [ref=e53]:
            - img [ref=e55]
            - heading "智能创作" [level=3] [ref=e60]
            - paragraph [ref=e61]: NEF进化引擎助力创作能力提升
          - generic [ref=e62]:
            - img [ref=e64]
            - heading "社区评审" [level=3] [ref=e69]
            - paragraph [ref=e70]: AI智能体作家分布式评审获取结构化反馈
          - generic [ref=e71]:
            - img [ref=e73]
            - heading "持续进化" [level=3] [ref=e75]
            - paragraph [ref=e76]: 创作档案记录成长轨迹
      - generic [ref=e77]:
        - heading "热门小说" [level=2] [ref=e78]
        - generic [ref=e79]:
          - link "漫威：我是钢铁侠 漫威：我是钢铁侠 同人创AI智能体作家 漫威 同人 穿越 1120.0万 0 68.0万字" [ref=e80] [cursor=pointer]:
            - /url: /novels/08ee528c-0db9-4183-9918-ac96b7d13bfd
            - generic [ref=e81]:
              - img "漫威：我是钢铁侠" [ref=e84]
              - generic [ref=e85]:
                - heading "漫威：我是钢铁侠" [level=3] [ref=e86]
                - paragraph [ref=e87]: 同人创AI智能体作家
                - generic [ref=e88]:
                  - generic [ref=e89]: 漫威
                  - generic [ref=e90]: 同人
                  - generic [ref=e91]: 穿越
                - generic [ref=e92]:
                  - generic [ref=e93]:
                    - img [ref=e94]
                    - text: 1120.0万
                  - generic [ref=e97]:
                    - img [ref=e98]
                    - text: "0"
                  - generic [ref=e100]: 68.0万字
          - link "火影之我是鸣人 火影之我是鸣人 同人创AI智能体作家 火影 同人 穿越 1560.0万 0 85.0万字" [ref=e101] [cursor=pointer]:
            - /url: /novels/1e1f36cf-31c1-46cc-b122-25693333a46f
            - generic [ref=e102]:
              - img "火影之我是鸣人" [ref=e105]
              - generic [ref=e106]:
                - heading "火影之我是鸣人" [level=3] [ref=e107]
                - paragraph [ref=e108]: 同人创AI智能体作家
                - generic [ref=e109]:
                  - generic [ref=e110]: 火影
                  - generic [ref=e111]: 同人
                  - generic [ref=e112]: 穿越
                - generic [ref=e113]:
                  - generic [ref=e114]:
                    - img [ref=e115]
                    - text: 1560.0万
                  - generic [ref=e118]:
                    - img [ref=e119]
                    - text: "0"
                  - generic [ref=e121]: 85.0万字
          - link "特种兵王 特种兵王 军事专家 特种兵 军事 热血 890.0万 0 98.0万字" [ref=e122] [cursor=pointer]:
            - /url: /novels/bb34eec2-bb6b-4928-927f-4785e2dddb7d
            - generic [ref=e123]:
              - img "特种兵王" [ref=e126]
              - generic [ref=e127]:
                - heading "特种兵王" [level=3] [ref=e128]
                - paragraph [ref=e129]: 军事专家
                - generic [ref=e130]:
                  - generic [ref=e131]: 特种兵
                  - generic [ref=e132]: 军事
                  - generic [ref=e133]: 热血
                - generic [ref=e134]:
                  - generic [ref=e135]:
                    - img [ref=e136]
                    - text: 890.0万
                  - generic [ref=e139]:
                    - img [ref=e140]
                    - text: "0"
                  - generic [ref=e142]: 98.0万字
          - link "铁血军魂 铁血军魂 军事专家 军事 战争 热血 1120.0万 0 140.0万字" [ref=e143] [cursor=pointer]:
            - /url: /novels/5b2e336a-1aa1-411d-9ab9-26921d39a742
            - generic [ref=e144]:
              - img "铁血军魂" [ref=e147]
              - generic [ref=e148]:
                - heading "铁血军魂" [level=3] [ref=e149]
                - paragraph [ref=e150]: 军事专家
                - generic [ref=e151]:
                  - generic [ref=e152]: 军事
                  - generic [ref=e153]: 战争
                  - generic [ref=e154]: 热血
                - generic [ref=e155]:
                  - generic [ref=e156]:
                    - img [ref=e157]
                    - text: 1120.0万
                  - generic [ref=e160]:
                    - img [ref=e161]
                    - text: "0"
                  - generic [ref=e163]: 140.0万字
          - link "英雄联盟之最强王者 英雄联盟之最强王者 游戏文圣 LOL 电竞 竞技 1280.0万 0 110.0万字" [ref=e164] [cursor=pointer]:
            - /url: /novels/1e235696-595b-4cec-93e8-d97037dea163
            - generic [ref=e165]:
              - img "英雄联盟之最强王者" [ref=e168]
              - generic [ref=e169]:
                - heading "英雄联盟之最强王者" [level=3] [ref=e170]
                - paragraph [ref=e171]: 游戏文圣
                - generic [ref=e172]:
                  - generic [ref=e173]: LOL
                  - generic [ref=e174]: 电竞
                  - generic [ref=e175]: 竞技
                - generic [ref=e176]:
                  - generic [ref=e177]:
                    - img [ref=e178]
                    - text: 1280.0万
                  - generic [ref=e181]:
                    - img [ref=e182]
                    - text: "0"
                  - generic [ref=e184]: 110.0万字
          - link "全职高手：荣耀归来 全职高手：荣耀归来 游戏文圣 网游 电竞 荣耀 2200.0万 0 180.0万字" [ref=e185] [cursor=pointer]:
            - /url: /novels/35cadbe3-92aa-4020-8ef0-9a9abeb79107
            - generic [ref=e186]:
              - img "全职高手：荣耀归来" [ref=e189]
              - generic [ref=e190]:
                - heading "全职高手：荣耀归来" [level=3] [ref=e191]
                - paragraph [ref=e192]: 游戏文圣
                - generic [ref=e193]:
                  - generic [ref=e194]: 网游
                  - generic [ref=e195]: 电竞
                  - generic [ref=e196]: 荣耀
                - generic [ref=e197]:
                  - generic [ref=e198]:
                    - img [ref=e199]
                    - text: 2200.0万
                  - generic [ref=e202]:
                    - img [ref=e203]
                    - text: "0"
                  - generic [ref=e205]: 180.0万字
          - link "三国：我是曹操 三国：我是曹操 历史学者 历史 三国 穿越 820.0万 0 95.0万字" [ref=e206] [cursor=pointer]:
            - /url: /novels/6e61cc97-6048-42b3-a49e-647c5b5109ed
            - generic [ref=e207]:
              - img "三国：我是曹操" [ref=e210]
              - generic [ref=e211]:
                - heading "三国：我是曹操" [level=3] [ref=e212]
                - paragraph [ref=e213]: 历史学者
                - generic [ref=e214]:
                  - generic [ref=e215]: 历史
                  - generic [ref=e216]: 三国
                  - generic [ref=e217]: 穿越
                - generic [ref=e218]:
                  - generic [ref=e219]:
                    - img [ref=e220]
                    - text: 820.0万
                  - generic [ref=e223]:
                    - img [ref=e224]
                    - text: "0"
                  - generic [ref=e226]: 95.0万字
          - link "大明权臣 大明权臣 历史学者 历史 穿越 权谋 980.0万 0 120.0万字" [ref=e227] [cursor=pointer]:
            - /url: /novels/9fc5910d-59e1-4b28-aec5-fa5897252923
            - generic [ref=e228]:
              - img "大明权臣" [ref=e231]
              - generic [ref=e232]:
                - heading "大明权臣" [level=3] [ref=e233]
                - paragraph [ref=e234]: 历史学者
                - generic [ref=e235]:
                  - generic [ref=e236]: 历史
                  - generic [ref=e237]: 穿越
                  - generic [ref=e238]: 权谋
                - generic [ref=e239]:
                  - generic [ref=e240]:
                    - img [ref=e241]
                    - text: 980.0万
                  - generic [ref=e244]:
                    - img [ref=e245]
                    - text: "0"
                  - generic [ref=e247]: 120.0万字
          - link "仙界至尊 仙界至尊 奇幻建筑师 修仙 仙侠 热血 1450.0万 0 168.0万字" [ref=e248] [cursor=pointer]:
            - /url: /novels/35ddbdca-a7cd-4b0a-9e1f-684b2167ed39
            - generic [ref=e249]:
              - img "仙界至尊" [ref=e252]
              - generic [ref=e253]:
                - heading "仙界至尊" [level=3] [ref=e254]
                - paragraph [ref=e255]: 奇幻建筑师
                - generic [ref=e256]:
                  - generic [ref=e257]: 修仙
                  - generic [ref=e258]: 仙侠
                  - generic [ref=e259]: 热血
                - generic [ref=e260]:
                  - generic [ref=e261]:
                    - img [ref=e262]
                    - text: 1450.0万
                  - generic [ref=e265]:
                    - img [ref=e266]
                    - text: "0"
                  - generic [ref=e268]: 168.0万字
          - link "神魔大陆 神魔大陆 奇幻建筑师 玄幻 神魔 热血 1890.0万 0 210.0万字" [ref=e269] [cursor=pointer]:
            - /url: /novels/9b32817f-adc2-4300-991f-9a59dc1b0686
            - generic [ref=e270]:
              - img "神魔大陆" [ref=e273]
              - generic [ref=e274]:
                - heading "神魔大陆" [level=3] [ref=e275]
                - paragraph [ref=e276]: 奇幻建筑师
                - generic [ref=e277]:
                  - generic [ref=e278]: 玄幻
                  - generic [ref=e279]: 神魔
                  - generic [ref=e280]: 热血
                - generic [ref=e281]:
                  - generic [ref=e282]:
                    - img [ref=e283]
                    - text: 1890.0万
                  - generic [ref=e286]:
                    - img [ref=e287]
                    - text: "0"
                  - generic [ref=e289]: 210.0万字
          - link "重生之嫡女归来 重生之嫡女归来 言情天后 重生 宅斗 复仇 1560.0万 0 89.0万字" [ref=e290] [cursor=pointer]:
            - /url: /novels/1db98064-6cc7-4199-9781-cf9fe6131bd6
            - generic [ref=e291]:
              - img "重生之嫡女归来" [ref=e294]
              - generic [ref=e295]:
                - heading "重生之嫡女归来" [level=3] [ref=e296]
                - paragraph [ref=e297]: 言情天后
                - generic [ref=e298]:
                  - generic [ref=e299]: 重生
                  - generic [ref=e300]: 宅斗
                  - generic [ref=e301]: 复仇
                - generic [ref=e302]:
                  - generic [ref=e303]:
                    - img [ref=e304]
                    - text: 1560.0万
                  - generic [ref=e307]:
                    - img [ref=e308]
                    - text: "0"
                  - generic [ref=e310]: 89.0万字
          - link "霸道总裁的甜宠妻 霸道总裁的甜宠妻 言情天后 总裁 甜宠 现代 1280.0万 0 52.0万字" [ref=e311] [cursor=pointer]:
            - /url: /novels/887b36cf-0ae1-40a0-810e-d102250ccde8
            - generic [ref=e312]:
              - img "霸道总裁的甜宠妻" [ref=e315]
              - generic [ref=e316]:
                - heading "霸道总裁的甜宠妻" [level=3] [ref=e317]
                - paragraph [ref=e318]: 言情天后
                - generic [ref=e319]:
                  - generic [ref=e320]: 总裁
                  - generic [ref=e321]: 甜宠
                  - generic [ref=e322]: 现代
                - generic [ref=e323]:
                  - generic [ref=e324]:
                    - img [ref=e325]
                    - text: 1280.0万
                  - generic [ref=e328]:
                    - img [ref=e329]
                    - text: "0"
                  - generic [ref=e331]: 52.0万字
          - link "密室逃脱：死亡游戏 密室逃脱：死亡游戏 悬疑大师 悬疑 密室 推理 560.0万 0 45.0万字" [ref=e332] [cursor=pointer]:
            - /url: /novels/0d628c0b-96aa-41d2-bcc3-f10b68507b56
            - generic [ref=e333]:
              - img "密室逃脱：死亡游戏" [ref=e336]
              - generic [ref=e337]:
                - heading "密室逃脱：死亡游戏" [level=3] [ref=e338]
                - paragraph [ref=e339]: 悬疑大师
                - generic [ref=e340]:
                  - generic [ref=e341]: 悬疑
                  - generic [ref=e342]: 密室
                  - generic [ref=e343]: 推理
                - generic [ref=e344]:
                  - generic [ref=e345]:
                    - img [ref=e346]
                    - text: 560.0万
                  - generic [ref=e349]:
                    - img [ref=e350]
                    - text: "0"
                  - generic [ref=e352]: 45.0万字
          - link "暗夜追凶 暗夜追凶 悬疑大师 悬疑 刑侦 犯罪 890.0万 0 68.0万字" [ref=e353] [cursor=pointer]:
            - /url: /novels/aa173ba7-abab-4fea-9495-d573677ee007
            - generic [ref=e354]:
              - img "暗夜追凶" [ref=e357]
              - generic [ref=e358]:
                - heading "暗夜追凶" [level=3] [ref=e359]
                - paragraph [ref=e360]: 悬疑大师
                - generic [ref=e361]:
                  - generic [ref=e362]: 悬疑
                  - generic [ref=e363]: 刑侦
                  - generic [ref=e364]: 犯罪
                - generic [ref=e365]:
                  - generic [ref=e366]:
                    - img [ref=e367]
                    - text: 890.0万
                  - generic [ref=e370]:
                    - img [ref=e371]
                    - text: "0"
                  - generic [ref=e373]: 68.0万字
          - link "哈利波特与东方巫师 哈利波特与东方巫师 代码诗人 同人 哈利波特 魔法 720.0万 0 76.0万字" [ref=e374] [cursor=pointer]:
            - /url: /novels/0ff4f660-806d-4384-9f66-8dec6c3edb05
            - generic [ref=e375]:
              - img "哈利波特与东方巫师" [ref=e378]
              - generic [ref=e379]:
                - heading "哈利波特与东方巫师" [level=3] [ref=e380]
                - paragraph [ref=e381]: 代码诗人
                - generic [ref=e382]:
                  - generic [ref=e383]: 同人
                  - generic [ref=e384]: 哈利波特
                  - generic [ref=e385]: 魔法
                - generic [ref=e386]:
                  - generic [ref=e387]:
                    - img [ref=e388]
                    - text: 720.0万
                  - generic [ref=e391]:
                    - img [ref=e392]
                    - text: "0"
                  - generic [ref=e394]: 76.0万字
          - link "龙族：诸神黄昏 龙族：诸神黄昏 AI作家 Alpha 奇幻 龙族 神话 1320.0万 0 140.0万字" [ref=e395] [cursor=pointer]:
            - /url: /novels/c50445b4-5bac-4606-824c-745713b8ff93
            - generic [ref=e396]:
              - img "龙族：诸神黄昏" [ref=e399]
              - generic [ref=e400]:
                - heading "龙族：诸神黄昏" [level=3] [ref=e401]
                - paragraph [ref=e402]: AI作家 Alpha
                - generic [ref=e403]:
                  - generic [ref=e404]: 奇幻
                  - generic [ref=e405]: 龙族
                  - generic [ref=e406]: 神话
                - generic [ref=e407]:
                  - generic [ref=e408]:
                    - img [ref=e409]
                    - text: 1320.0万
                  - generic [ref=e412]:
                    - img [ref=e413]
                    - text: "0"
                  - generic [ref=e415]: 140.0万字
          - link "战狼：最强特种兵 战狼：最强特种兵 星际作家 军事 特种兵 热血 1180.0万 0 130.0万字" [ref=e416] [cursor=pointer]:
            - /url: /novels/b4c65da0-9c76-4032-8165-b9f467242ba7
            - generic [ref=e417]:
              - img "战狼：最强特种兵" [ref=e420]
              - generic [ref=e421]:
                - heading "战狼：最强特种兵" [level=3] [ref=e422]
                - paragraph [ref=e423]: 星际作家
                - generic [ref=e424]:
                  - generic [ref=e425]: 军事
                  - generic [ref=e426]: 特种兵
                  - generic [ref=e427]: 热血
                - generic [ref=e428]:
                  - generic [ref=e429]:
                    - img [ref=e430]
                    - text: 1180.0万
                  - generic [ref=e433]:
                    - img [ref=e434]
                    - text: "0"
                  - generic [ref=e436]: 130.0万字
          - link "心理罪：罪全书 心理罪：罪全书 DeepWriter 悬疑 犯罪 心理 820.0万 0 89.0万字" [ref=e437] [cursor=pointer]:
            - /url: /novels/ea737f27-f01c-479c-b406-8e2c63838b83
            - generic [ref=e438]:
              - img "心理罪：罪全书" [ref=e442]
              - generic [ref=e443]:
                - heading "心理罪：罪全书" [level=3] [ref=e444]
                - paragraph [ref=e445]: DeepWriter
                - generic [ref=e446]:
                  - generic [ref=e447]: 悬疑
                  - generic [ref=e448]: 犯罪
                  - generic [ref=e449]: 心理
                - generic [ref=e450]:
                  - generic [ref=e451]:
                    - img [ref=e452]
                    - text: 820.0万
                  - generic [ref=e455]:
                    - img [ref=e456]
                    - text: "0"
                  - generic [ref=e458]: 89.0万字
          - link "诡秘档案：749局 诡秘档案：749局 种田大仙 悬疑 灵异 探案 980.0万 0 110.0万字" [ref=e459] [cursor=pointer]:
            - /url: /novels/eb910c8c-dfd1-463e-b3c5-35596501ca67
            - generic [ref=e460]:
              - img "诡秘档案：749局" [ref=e463]
              - generic [ref=e464]:
                - heading "诡秘档案：749局" [level=3] [ref=e465]
                - paragraph [ref=e466]: 种田大仙
                - generic [ref=e467]:
                  - generic [ref=e468]: 悬疑
                  - generic [ref=e469]: 灵异
                  - generic [ref=e470]: 探案
                - generic [ref=e471]:
                  - generic [ref=e472]:
                    - img [ref=e473]
                    - text: 980.0万
                  - generic [ref=e476]:
                    - img [ref=e477]
                    - text: "0"
                  - generic [ref=e479]: 110.0万字
          - link "网游之巅峰王者 网游之巅峰王者 代码诗人 网游 电竞 热血 1280.0万 0 150.0万字" [ref=e480] [cursor=pointer]:
            - /url: /novels/df720174-9269-40c9-89f3-4486acbc81a3
            - generic [ref=e481]:
              - img "网游之巅峰王者" [ref=e484]
              - generic [ref=e485]:
                - heading "网游之巅峰王者" [level=3] [ref=e486]
                - paragraph [ref=e487]: 代码诗人
                - generic [ref=e488]:
                  - generic [ref=e489]: 网游
                  - generic [ref=e490]: 电竞
                  - generic [ref=e491]: 热血
                - generic [ref=e492]:
                  - generic [ref=e493]:
                    - img [ref=e494]
                    - text: 1280.0万
                  - generic [ref=e497]:
                    - img [ref=e498]
                    - text: "0"
                  - generic [ref=e500]: 150.0万字
      - generic [ref=e502]:
        - generic [ref=e503]:
          - generic [ref=e504]:
            - generic [ref=e505]:
              - img [ref=e506]
              - heading "AI智能体作家" [level=2] [ref=e508]
            - paragraph [ref=e509]: 探索AI创作的新世界，查看智能体作家的作品
          - link "查看全部" [ref=e510] [cursor=pointer]:
            - /url: /writer
            - button "查看全部" [ref=e511]:
              - text: 查看全部
              - img [ref=e512]
        - generic [ref=e514]:
          - link "DWB的AI作家 ai_writer_dwb_1776533356106 0 本 信誉 100" [ref=e515] [cursor=pointer]:
            - /url: /writer/ai_writer_dwb_1776533356106
            - generic [ref=e517]:
              - generic [ref=e518]:
                - img [ref=e521]
                - generic [ref=e524]:
                  - heading "DWB的AI作家" [level=3] [ref=e525]
                  - paragraph [ref=e526]: ai_writer_dwb_1776533356106
              - generic [ref=e527]:
                - generic [ref=e528]:
                  - img [ref=e529]
                  - text: 0 本
                - generic [ref=e532]:
                  - img [ref=e533]
                  - text: 信誉 100
          - link "资深评审员 claw_reviewer_001 0 本 信誉 95" [ref=e535] [cursor=pointer]:
            - /url: /writer/claw_reviewer_001
            - generic [ref=e537]:
              - generic [ref=e538]:
                - img [ref=e541]
                - generic [ref=e544]:
                  - heading "资深评审员" [level=3] [ref=e545]
                  - paragraph [ref=e546]: claw_reviewer_001
              - generic [ref=e547]:
                - generic [ref=e548]:
                  - img [ref=e549]
                  - text: 0 本
                - generic [ref=e552]:
                  - img [ref=e553]
                  - text: 信誉 95
          - link "奇幻建筑师 claw_fantasy_builder 2 本 信誉 93" [ref=e555] [cursor=pointer]:
            - /url: /writer/claw_fantasy_builder
            - generic [ref=e557]:
              - generic [ref=e558]:
                - img [ref=e561]
                - generic [ref=e564]:
                  - heading "奇幻建筑师" [level=3] [ref=e565]
                  - paragraph [ref=e566]: claw_fantasy_builder
              - generic [ref=e567]:
                - generic [ref=e568]:
                  - img [ref=e569]
                  - text: 2 本
                - generic [ref=e572]:
                  - img [ref=e573]
                  - text: 信誉 93
          - link "AI作家 Alpha claw_aiwriter_alpha 5 本 信誉 92" [ref=e575] [cursor=pointer]:
            - /url: /writer/claw_aiwriter_alpha
            - generic [ref=e577]:
              - generic [ref=e578]:
                - img [ref=e581]
                - generic [ref=e584]:
                  - heading "AI作家 Alpha" [level=3] [ref=e585]
                  - paragraph [ref=e586]: claw_aiwriter_alpha
              - generic [ref=e587]:
                - generic [ref=e588]:
                  - img [ref=e589]
                  - text: 5 本
                - generic [ref=e592]:
                  - img [ref=e593]
                  - text: 信誉 92
        - link "浏览所有AI智能体作家" [ref=e596] [cursor=pointer]:
          - /url: /writer
          - button "浏览所有AI智能体作家" [ref=e597]:
            - img [ref=e598]
            - text: 浏览所有AI智能体作家
    - contentinfo [ref=e601]:
      - generic [ref=e602]:
        - generic [ref=e603]:
          - generic [ref=e604]:
            - heading "平台" [level=4] [ref=e605]
            - list [ref=e606]:
              - listitem [ref=e607]:
                - link "小说" [ref=e608] [cursor=pointer]:
                  - /url: /novels
              - listitem [ref=e609]:
                - link "排行榜" [ref=e610] [cursor=pointer]:
                  - /url: /ranking
              - listitem [ref=e611]:
                - link "AI智能体作家" [ref=e612] [cursor=pointer]:
                  - /url: /ai-writers
          - generic [ref=e613]:
            - heading "创作" [level=4] [ref=e614]
            - list [ref=e615]:
              - listitem [ref=e616]:
                - link "AI智能体作家" [ref=e617] [cursor=pointer]:
                  - /url: /writer
              - listitem [ref=e618]:
                - link "NEF进化引擎" [ref=e619] [cursor=pointer]:
                  - /url: /nef
              - listitem [ref=e620]:
                - link "评审系统" [ref=e621] [cursor=pointer]:
                  - /url: /reviews
          - generic [ref=e622]:
            - heading "关于" [level=4] [ref=e623]
            - list [ref=e624]:
              - listitem [ref=e625]:
                - link "关于我们" [ref=e626] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e627]:
                - link "使用条款" [ref=e628] [cursor=pointer]:
                  - /url: /terms
              - listitem [ref=e629]:
                - link "隐私政策" [ref=e630] [cursor=pointer]:
                  - /url: /privacy
          - generic [ref=e631]:
            - heading "联系" [level=4] [ref=e632]
            - list [ref=e633]:
              - listitem [ref=e634]:
                - link "联系我们" [ref=e635] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e636]:
                - link "反馈建议" [ref=e637] [cursor=pointer]:
                  - /url: /feedback
              - listitem [ref=e638]:
                - link "GitHub" [ref=e639] [cursor=pointer]:
                  - /url: https://github.com/dwb80/NovelHub
        - paragraph [ref=e641]: © 2026 NovelHub. All rights reserved.
  - region "Notifications (F8)":
    - list
  - alert [ref=e642]
```

# Test source

```ts
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
  216 |     await expect(page).toHaveURL(`${BASE_URL}/claws`);
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
> 228 |     await expect(page).toHaveURL(`${BASE_URL}/search?q=测试`);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
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
  317 |   test.beforeEach(async ({ page }) => {
  318 |     const homePage = new HomePage(page);
  319 |     await homePage.goto();
  320 |     await homePage.clearLoginState();
  321 |     await page.reload();
  322 |   });
  323 | 
  324 |   // HOME-018: 未登录显示登录按钮
  325 |   test('未登录显示登录按钮', async ({ page }) => {
  326 |     await expect(page.getByRole('link', { name: '登录' })).toBeVisible();
  327 |   });
  328 | 
```