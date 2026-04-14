# NovelHub 安全渗透测试用例

## 测试概述

**测试目标**: 全面评估 NovelHub 平台的安全性，识别潜在安全漏洞并提供修复建议
**测试范围**: Web应用安全、API安全、认证授权、数据保护、业务逻辑安全
**测试类型**: 黑盒测试、灰盒测试、白盒代码审计
**关联需求**: SEC-WEB-001, SEC-API-001, SEC-AUTH-001, SEC-DATA-001
**优先级**: P2
**合规标准**: OWASP Top 10 2021, CWE/SANS Top 25

---

## 1. 信息收集与侦察

### SEC-INFO-001: 基础信息收集

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-INFO-001 |
| **用例名称** | 目标系统信息收集 |
| **测试方法** | 被动侦察、主动扫描 |
| **优先级** | P2 |
| **所属需求** | SEC-WEB-001 |

**测试步骤**:
1. 域名信息查询（WHOIS、DNS记录）
2. 子域名枚举
3. 端口扫描和服务识别
4. 技术栈识别（Wappalyzer、BuiltWith）
5. 目录和文件枚举
6. 敏感文件发现（robots.txt, .git, .env等）

**检查清单**:
- [ ] 服务器版本信息泄露
- [ ] 框架版本信息泄露
- [ ] 敏感目录可访问
- [ ] 备份文件暴露
- [ ] 源代码泄露

**工具**: Nmap, Dirb, Gobuster, Wappalyzer, theHarvester

---

### SEC-INFO-002: 网络架构分析

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-INFO-002 |
| **用例名称** | 网络架构和防护分析 |
| **测试方法** | 网络扫描、指纹识别 |
| **优先级** | P2 |
| **所属需求** | SEC-WEB-001 |

**测试步骤**:
1. CDN识别和绕过测试
2. WAF检测和规则测试
3. 负载均衡检测
4. 防火墙规则探测
5. 反向代理识别

**检查清单**:
- [ ] CDN配置安全性
- [ ] WAF规则有效性
- [ ] 真实IP暴露
- [ ] 内部网络暴露

---

## 2. 身份认证安全测试

### SEC-AUTH-001: 登录爆破防护

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-AUTH-001 |
| **用例名称** | 登录暴力破解防护测试 |
| **测试方法** | 自动化爆破、速率限制测试 |
| **优先级** | P2 |
| **所属需求** | SEC-AUTH-001 |

**测试步骤**:
1. 使用常见密码字典尝试登录
2. 测试账户锁定机制
3. 测试验证码绕过
4. 测试速率限制
5. 测试多IP分布式爆破

**预期结果**:
- 连续失败5次后账户锁定15分钟
- 验证码不可绕过
- 单IP请求频率限制为10次/分钟
- 异常登录触发安全告警

**测试数据**:
```json
{
  "common_passwords": [
    "123456", "password", "12345678", "qwerty", "12345",
    "123456789", "letmein", "1234567", "football", "iloveyou"
  ],
  "test_accounts": [
    { "username": "testuser1", "password": "Test@123" },
    { "username": "admin", "password": "admin123" }
  ]
}
```

---

### SEC-AUTH-002: 会话管理安全

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-AUTH-002 |
| **用例名称** | 会话管理安全测试 |
| **测试方法** | Cookie分析、会话固定测试 |
| **优先级** | P2 |
| **所属需求** | SEC-AUTH-001 |

**测试步骤**:
1. 分析Session ID生成机制
2. 测试会话固定攻击
3. 测试会话劫持防护
4. 测试会话超时机制
5. 测试并发登录限制
6. 测试登出后会话销毁

**检查清单**:
- [ ] Session ID随机性（>=128位熵）
- [ ] HttpOnly标志设置
- [ ] Secure标志（HTTPS）
- [ ] SameSite属性设置
- [ ] 会话超时时间合理
- [ ] 登出后会话立即失效

---

### SEC-AUTH-003: 密码策略验证

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-AUTH-003 |
| **用例名称** | 密码策略强度测试 |
| **测试方法** | 边界值测试、策略绕过测试 |
| **优先级** | P2 |
| **所属需求** | SEC-AUTH-001 |

**测试步骤**:
1. 测试最小长度限制
2. 测试复杂度要求
3. 测试常见密码拒绝
4. 测试密码历史检查
5. 测试密码传输加密
6. 测试密码存储（哈希+盐）

**测试用例**:

| 密码 | 预期结果 |
|------|----------|
| "123" | 拒绝（太短） |
| "password" | 拒绝（常见密码） |
| "abcdefgh" | 拒绝（无复杂度） |
| "Test123" | 拒绝（无特殊字符） |
| "Test@123" | 接受 |
| "旧密码" | 修改时拒绝（历史检查） |

---

### SEC-AUTH-004: JWT Token安全

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-AUTH-004 |
| **用例名称** | JWT Token安全测试 |
| **测试方法** | Token分析、算法混淆测试 |
| **优先级** | P2 |
| **所属需求** | SEC-AUTH-001 |

**测试步骤**:
1. 分析JWT结构（Header.Payload.Signature）
2. 测试算法混淆攻击（alg: none）
3. 测试密钥暴力破解
4. 测试Token过期机制
5. 测试Token刷新机制
6. 测试Token撤销机制

**检查清单**:
- [ ] 使用强签名算法（RS256/ES256）
- [ ] 密钥长度足够（>=2048位）
- [ ] 包含exp声明
- [ ] 包含iat声明
- [ ] 包含jti声明（Token唯一标识）
- [ ] 敏感信息不在Payload中

---

## 3. 访问控制安全测试

### SEC-AC-001: 水平越权测试

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-AC-001 |
| **用例名称** | 水平权限越权测试 |
| **测试方法** | IDOR（不安全的直接对象引用）测试 |
| **优先级** | P2 |
| **所属需求** | SEC-AUTH-001 |

**测试步骤**:
1. 用户A登录，记录用户ID
2. 访问用户A的个人资料
3. 修改URL参数为用户B的ID
4. 尝试访问用户B的敏感数据
5. 测试以下接口:
   - GET /api/users/{id}/profile
   - GET /api/users/{id}/bookshelf
   - GET /api/users/{id}/history
   - PUT /api/users/{id}/settings

**预期结果**:
- 返回403 Forbidden或401 Unauthorized
- 无法访问其他用户数据
- 服务端进行权限校验

---

### SEC-AC-002: 垂直越权测试

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-AC-002 |
| **用例名称** | 垂直权限越权测试 |
| **测试方法** | 角色权限绕过测试 |
| **优先级** | P2 |
| **所属需求** | SEC-AUTH-001 |

**测试步骤**:
1. 普通用户登录
2. 尝试访问管理员接口:
   - GET /api/admin/users
   - POST /api/admin/novels/review
   - DELETE /api/admin/comments/{id}
   - GET /api/admin/dashboard
3. 修改请求中的role参数
4. 尝试访问管理后台页面

**预期结果**:
- 所有管理员接口返回403
- 无法通过参数修改提升权限
- 服务端强制角色验证

---

### SEC-AC-003: 未授权访问测试

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-AC-003 |
| **用例名称** | 未授权访问测试 |
| **测试方法** | 匿名访问测试 |
| **优先级** | P2 |
| **所属需求** | SEC-AUTH-001 |

**测试步骤**:
1. 清除所有Cookie和Token
2. 尝试访问需要登录的接口:
   - GET /api/users/me
   - POST /api/bookshelf
   - GET /api/users/{id}/favorites
3. 尝试访问管理后台
4. 尝试访问敏感文件

**预期结果**:
- 返回401 Unauthorized
- 重定向到登录页面
- 敏感资源不可访问

---

## 4. 输入验证与注入攻击测试

### SEC-INJ-001: SQL注入测试

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-INJ-001 |
| **用例名称** | SQL注入漏洞测试 |
| **测试方法** | 手工注入、自动化扫描 |
| **优先级** | P2 |
| **所属需求** | SEC-WEB-001 |

**测试步骤**:
1. 识别所有输入点:
   - 搜索框: q 参数
   - 登录框: username, password
   - URL参数: id, page, sort
   - API请求体
2. 测试经典注入:
   - 单引号测试: `'`
   - 布尔注入: `' OR '1'='1`
   - 时间盲注: `'; WAITFOR DELAY '0:0:5'--`
   - 联合注入: `' UNION SELECT null,null--`
3. 测试盲注
4. 测试报错注入

**测试Payload**:
```sql
-- 基础测试
'
''
' OR '1'='1
' OR '1'='1' --
' OR '1'='1' /*

-- 时间盲注
'; WAITFOR DELAY '0:0:5'--
' AND (SELECT * FROM (SELECT(SLEEP(5)))a)--

-- 联合注入
' UNION SELECT null,null--
' UNION SELECT username,password FROM users--

-- 报错注入
' AND 1=CONVERT(int,(SELECT @@version))--
```

**预期结果**:
- 所有注入尝试被过滤或转义
- 无SQL错误信息泄露
- 使用参数化查询

---

### SEC-INJ-002: XSS跨站脚本测试

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-INJ-002 |
| **用例名称** | XSS跨站脚本攻击测试 |
| **测试方法** | 反射型、存储型、DOM型XSS测试 |
| **优先级** | P2 |
| **所属需求** | SEC-WEB-001 |

**测试步骤**:
1. **反射型XSS测试**:
   - 在URL参数中注入: `?q=<script>alert(1)</script>`
   - 测试搜索框、错误页面

2. **存储型XSS测试**:
   - 在评论中提交: `<script>alert('XSS')</script>`
   - 在用户资料中提交恶意代码
   - 在小说内容中测试（如支持富文本）

3. **DOM型XSS测试**:
   - 测试URL hash: `#<img src=x onerror=alert(1)>`
   - 测试JavaScript动态内容

4. **绕过测试**:
   - 编码绕过: `%3Cscript%3Ealert(1)%3C/script%3E`
   - 大小写绕过: `<ScRiPt>alert(1)</ScRiPt>`
   - 事件绕过: `<img src=x onerror=alert(1)>`
   - SVG绕过: `<svg onload=alert(1)>`

**测试Payload**:
```html
<!-- 基础XSS -->
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>

<!-- 编码绕过 -->
&lt;script&gt;alert('XSS')&lt;/script&gt;
&#60;script&#62;alert('XSS')&#60;/script&#62;

<!-- 事件绕过 -->
<body onload=alert('XSS')>
<input onfocus=alert('XSS') autofocus>

<!-- 伪协议 -->
<a href="javascript:alert('XSS')">click</a>
<iframe src="javascript:alert('XSS')">
```

**预期结果**:
- 所有XSS payload被过滤或编码
- 输出进行HTML实体编码
- 使用CSP策略

---

### SEC-INJ-003: 命令注入测试

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-INJ-003 |
| **用例名称** | 命令注入漏洞测试 |
| **测试方法** | 系统命令注入测试 |
| **优先级** | P2 |
| **所属需求** | SEC-WEB-001 |

**测试步骤**:
1. 识别可能的命令执行点:
   - 文件处理功能
   - 图片处理功能
   - 系统管理功能
2. 测试命令分隔符:
   - `; ls -la`
   - `| cat /etc/passwd`
   - `&& whoami`
   - `|| id`
3. 测试命令注入

**测试Payload**:
```bash
; cat /etc/passwd
| whoami
`id`
$(ls -la)
&& ping -c 4 attacker.com
|| netstat -an
```

**预期结果**:
- 命令注入被阻止
- 使用参数化命令执行
- 禁用危险函数

---

### SEC-INJ-004: 路径遍历测试

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-INJ-004 |
| **用例名称** | 路径遍历/目录穿越测试 |
| **测试方法** | 文件路径注入测试 |
| **优先级** | P2 |
| **所属需求** | SEC-WEB-001 |

**测试步骤**:
1. 识别文件操作接口:
   - 文件下载: `/api/download?file=report.pdf`
   - 图片加载: `/api/image?name=avatar.jpg`
   - 配置文件读取
2. 测试路径遍历:
   - `../../../etc/passwd`
   - `....//....//....//etc/passwd`
   - `%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd`
   - `..%252f..%252f..%252fetc%252fpasswd`

**测试Payload**:
```
../../../etc/passwd
....//....//....//etc/passwd
..\..\..\windows\system32\drivers\etc\hosts
%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd
..%c0%af..%c0%af..%c0%afetc/passwd
```

**预期结果**:
- 路径遍历被阻止
- 文件访问限制在指定目录
- 输入路径规范化处理

---

## 5. 业务逻辑安全测试

### SEC-BIZ-001: 购买/支付逻辑测试

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-BIZ-001 |
| **用例名称** | 购买支付业务逻辑测试 |
| **测试方法** | 参数篡改、重放攻击测试 |
| **优先级** | P2 |
| **所属需求** | SEC-API-001 |

**测试步骤**:
1. 测试价格篡改:
   - 修改请求中的price参数
   - 尝试负数价格
   - 尝试零元购买
2. 测试数量篡改:
   - 修改数量为负数
   - 修改数量为超大值
3. 测试重放攻击:
   - 重复提交同一订单
   - 拦截并重放支付请求
4. 测试并发购买:
   - 超卖测试
   - 库存竞争条件

**测试数据**:
```json
{
  "price_tampering": [
    { "price": -100, "expected": "拒绝" },
    { "price": 0, "expected": "拒绝" },
    { "price": 0.01, "expected": "拒绝或接受（根据业务）" }
  ],
  "quantity_tampering": [
    { "quantity": -1, "expected": "拒绝" },
    { "quantity": 0, "expected": "拒绝" },
    { "quantity": 999999, "expected": "拒绝（超出库存）" }
  ]
}
```

---

### SEC-BIZ-002: 评论/内容安全测试

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-BIZ-002 |
| **用例名称** | 用户生成内容安全测试 |
| **测试方法** | 内容过滤、敏感词测试 |
| **优先级** | P2 |
| **所属需求** | SEC-API-001 |

**测试步骤**:
1. 测试敏感词过滤:
   - 提交包含敏感词的评论
   - 测试敏感词变体（拼音、谐音）
   - 测试敏感词绕过（插入特殊字符）
2. 测试HTML过滤:
   - 提交包含HTML标签的内容
   - 测试事件处理器
   - 测试危险标签（script, iframe等）
3. 测试内容长度限制
4. 测试评论频率限制

**敏感词测试**:
```
直接敏感词
拼音: wei fa
谐音: 违-法
分隔: 违*法
变体: 违 法
```

---

### SEC-BIZ-003: 投票/评分逻辑测试

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-BIZ-003 |
| **用例名称** | 投票评分业务逻辑测试 |
| **测试方法** | 刷票、重复投票测试 |
| **优先级** | P2 |
| **所属需求** | SEC-API-001 |

**测试步骤**:
1. 测试重复投票:
   - 同一账号多次投票
   - 清除Cookie后再次投票
   - 更换IP后再次投票
2. 测试评分篡改:
   - 超出范围的评分（如11分）
   - 负数评分
3. 测试批量刷票:
   - 自动化脚本投票
   - 投票频率测试

---

## 6. 客户端安全测试

### SEC-CLI-001: CSP策略测试

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-CLI-001 |
| **用例名称** | 内容安全策略测试 |
| **测试方法** | CSP配置分析、绕过测试 |
| **优先级** | P2 |
| **所属需求** | SEC-WEB-001 |

**测试步骤**:
1. 检查CSP响应头
2. 分析CSP指令配置
3. 测试CSP绕过:
   - 'unsafe-inline'绕过
   - 'unsafe-eval'绕过
   - 通配符域名滥用
4. 测试CSP报告

**预期CSP配置**:
```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' https:;
  connect-src 'self' https:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
```

---

### SEC-CLI-002: 敏感信息泄露测试

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-CLI-002 |
| **用例名称** | 敏感信息泄露测试 |
| **测试方法** | 信息泄露扫描 |
| **优先级** | P2 |
| **所属需求** | SEC-DATA-001 |

**测试步骤**:
1. 检查前端代码:
   - API密钥泄露
   - 数据库连接字符串
   - 内部IP地址
   - 调试信息
2. 检查响应头:
   - Server版本信息
   - X-Powered-By
   - 内部服务器信息
3. 检查错误信息:
   - 堆栈跟踪
   - 数据库错误
   - 系统路径
4. 检查源代码映射:
   - .map文件访问
   - 源码泄露

---

### SEC-CLI-003: 点击劫持测试

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-CLI-003 |
| **用例名称** | 点击劫持防护测试 |
| **测试方法** | Frame嵌入测试 |
| **优先级** | P2 |
| **所属需求** | SEC-WEB-001 |

**测试步骤**:
1. 创建测试页面嵌入目标站点:
   ```html
   <iframe src="https://target-site.com"></iframe>
   ```
2. 检查X-Frame-Options响应头
3. 检查frame-ancestors CSP指令
4. 测试透明覆盖攻击

**预期结果**:
- X-Frame-Options: DENY 或 SAMEORIGIN
- CSP frame-ancestors: 'none' 或 'self'

---

## 7. API安全测试

### SEC-API-001: API认证测试

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-API-001 |
| **用例名称** | API认证机制安全测试 |
| **测试方法** | Token安全、认证绕过测试 |
| **优先级** | P2 |
| **所属需求** | SEC-API-001 |

**测试步骤**:
1. 测试Token有效期
2. 测试Token刷新机制
3. 测试Token撤销
4. 测试API密钥安全
5. 测试OAuth流程
6. 测试认证绕过

---

### SEC-API-002: API限流测试

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-API-002 |
| **用例名称** | API速率限制测试 |
| **测试方法** | 频率限制、配额测试 |
| **优先级** | P2 |
| **所属需求** | SEC-API-001 |

**测试步骤**:
1. 测试请求频率限制
2. 测试并发请求限制
3. 测试配额消耗
4. 测试限流绕过（IP轮换）
5. 测试429响应

---

### SEC-API-003: 批量分配测试

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-API-003 |
| **用例名称** | 批量赋值/质量分配测试 |
| **测试方法** | 参数注入测试 |
| **优先级** | P2 |
| **所属需求** | SEC-API-001 |

**测试步骤**:
1. 识别API端点接收的参数
2. 尝试添加额外参数:
   ```json
   {
     "username": "test",
     "password": "pass",
     "role": "admin",  // 额外参数
     "isAdmin": true   // 额外参数
   }
   ```
3. 测试敏感字段更新
4. 测试内部字段访问

---

## 8. 安全配置测试

### SEC-CONF-001: 安全响应头测试

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-CONF-001 |
| **用例名称** | HTTP安全响应头测试 |
| **测试方法** | 响应头扫描 |
| **优先级** | P2 |
| **所属需求** | SEC-WEB-001 |

**检查清单**:

| 响应头 | 预期值 | 状态 |
|--------|--------|------|
| Strict-Transport-Security | max-age=31536000; includeSubDomains | 待检查 |
| X-Content-Type-Options | nosniff | 待检查 |
| X-Frame-Options | DENY 或 SAMEORIGIN | 待检查 |
| X-XSS-Protection | 1; mode=block | 待检查 |
| Content-Security-Policy | 配置合理 | 待检查 |
| Referrer-Policy | strict-origin-when-cross-origin | 待检查 |
| Permissions-Policy | 限制敏感API | 待检查 |

---

### SEC-CONF-002: HTTPS/TLS配置测试

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-CONF-002 |
| **用例名称** | HTTPS和TLS配置测试 |
| **测试方法** | SSL/TLS扫描 |
| **优先级** | P2 |
| **所属需求** | SEC-WEB-001 |

**测试步骤**:
1. 使用SSL Labs扫描
2. 检查证书有效性
3. 检查TLS版本（最低TLS 1.2）
4. 检查加密套件
5. 检查HSTS配置
6. 检查混合内容

**预期配置**:
```
TLS版本: 1.2, 1.3
加密套件: 仅前向保密套件
证书: 有效、未过期、可信CA签发
HSTS: 启用，max-age >= 31536000
```

---

### SEC-CONF-003: Cookie安全测试

| 属性 | 内容 |
|------|------|
| **用例ID** | SEC-CONF-003 |
| **用例名称** | Cookie安全配置测试 |
| **测试方法** | Cookie属性分析 |
| **优先级** | P2 |
| **所属需求** | SEC-WEB-001 |

**检查清单**:

| Cookie | HttpOnly | Secure | SameSite | 状态 |
|--------|----------|--------|----------|------|
| session_id | 必需 | 必需 | Strict/Lax | 待检查 |
| csrf_token | 必需 | 必需 | Strict | 待检查 |
| auth_token | 必需 | 必需 | Strict | 待检查 |

---

## 9. 测试工具清单

### 自动化工具

| 工具 | 用途 | 版本 |
|------|------|------|
| Burp Suite | Web应用安全测试 | 2024.x |
| OWASP ZAP | 漏洞扫描 | 2.14 |
| Nmap | 端口扫描 | 7.94 |
| SQLMap | SQL注入测试 | 1.7 |
| Nikto | Web服务器扫描 | 2.5 |
| Dirb/Gobuster | 目录枚举 | 最新 |
| JWT_Tool | JWT安全测试 | 最新 |

### 手动测试工具

| 工具 | 用途 |
|------|------|
| Browser DevTools | 前端调试、请求分析 |
| Postman | API测试 |
| Curl | HTTP请求 |
| Wireshark | 流量分析 |
| Fiddler | HTTP代理调试 |

---

## 10. 漏洞评级标准

| 严重程度 | CVSS评分 | 描述 |
|----------|----------|------|
| 严重 | 9.0-10.0 | 可导致系统完全 compromised |
| 高危 | 7.0-8.9 | 可导致敏感数据泄露或系统损坏 |
| 中危 | 4.0-6.9 | 可导致部分功能异常或信息泄露 |
| 低危 | 0.1-3.9 | 轻微安全问题 |
| 信息 | 0.0 | 仅信息收集，无直接风险 |

---

## 11. 测试报告模板

```markdown
# 安全测试报告

## 执行摘要
- 测试日期: [日期]
- 测试范围: [范围]
- 发现漏洞: [数量]
- 风险评级: [严重/高危/中危/低危]

## 漏洞详情

### [漏洞名称]
**严重程度**: [严重/高危/中危/低危]
**CVE/CWE**: [编号]
**位置**: [URL/文件/接口]
**描述**: [漏洞描述]
**复现步骤**:
1. [步骤1]
2. [步骤2]

**影响**: [影响描述]
**修复建议**: [建议]
**参考**: [链接]

## 修复跟踪
| 漏洞 | 状态 | 负责人 | 预计修复日期 |
|------|------|--------|--------------|
| [名称] | [待修复/修复中/已修复] | [姓名] | [日期] |
```

---

## 相关文档

- [安全模块代码](../../html/assets/js/modules/security.js)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [CWE Top 25](https://cwe.mitre.org/top25/)

---

**编制**: 安全测试工程师  
**审核**: 待审核  
**更新日期**: 2026-04-12
