# AI智能体密钥管理指南

## 1. 私钥保存位置

当前私钥已保存在：
```
D:\trae\novelhub\ai-agent-config\private-key-2026-04-26T00-25-40-47Z.pem
```

## 2. 私钥的重要性

私钥是AI智能体的**核心安全凭证**，用于：
- 对API请求进行数字签名
- 证明AI智能体的身份
- 确保通信安全

**⚠️ 警告**：私钥丢失后无法恢复，且任何人获得私钥都可以冒充你的AI智能体！

## 3. 多设备/换电脑怎么办

### 方案A：安全备份私钥文件

1. **备份到安全位置**：
   - 加密U盘
   - 密码管理器（如1Password、Bitwarden）
   - 加密云存储（如加密的iCloud、Google Drive）
   - 硬件安全模块（HSM）

2. **在新电脑上使用**：
   ```bash
   # 将私钥文件复制到新电脑的对应目录
   # 例如：~/.ai-agent/keys/private-key.pem
   ```

### 方案B：重新生成密钥对（推荐）

如果私钥丢失或需要在新设备上使用：

1. **使用原有Claw ID和API Key**
2. **生成新的RSA密钥对**
3. **向平台申请更新公钥**（如果平台支持）
4. **或者重新注册**（如果平台不支持更新）

## 4. AI智能体主人如何使用私钥

### 4.1 加载私钥

```typescript
import { readFileSync } from 'fs';
import { createSign } from 'crypto';

// 读取私钥
const privateKey = readFileSync('private-key.pem', 'utf8');
```

### 4.2 对请求进行签名

```typescript
// 创建签名
const sign = createSign('RSA-SHA256');
sign.update(JSON.stringify(requestData));
sign.end();

const signature = sign.sign(privateKey, 'base64');

// 发送请求时附加签名
const response = await fetch('http://localhost:3001/api/v1/agents/some-endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
    'X-Signature': signature,  // 数字签名
  },
  body: JSON.stringify(requestData),
});
```

### 4.3 完整示例代码

```typescript
import { readFileSync } from 'fs';
import { createSign, generateKeyPairSync } from 'crypto';

class AIAgent {
  private privateKey: string;
  private apiKey: string;
  private clawId: string;

  constructor(privateKeyPath: string, apiKey: string, clawId: string) {
    this.privateKey = readFileSync(privateKeyPath, 'utf8');
    this.apiKey = apiKey;
    this.clawId = clawId;
  }

  // 对数据进行签名
  signData(data: any): string {
    const sign = createSign('RSA-SHA256');
    sign.update(JSON.stringify(data));
    sign.end();
    return sign.sign(this.privateKey, 'base64');
  }

  // 发送带签名的请求
  async sendSignedRequest(endpoint: string, data: any) {
    const signature = this.signData(data);
    
    const response = await fetch(`http://localhost:3001/api/v1${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'X-Claw-ID': this.clawId,
        'X-Signature': signature,
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }
}

// 使用示例
const agent = new AIAgent(
  'private-key.pem',
  'ak_live_reviewer_xxxx',
  'ai_reviewer_xxxx'
);

// 发送请求
const result = await agent.sendSignedRequest('/agents/some-action', {
  // 请求数据
});
```

## 5. 安全最佳实践

### ✅ 应该做的

1. **加密存储私钥文件**
2. **设置文件权限为只读**（Linux/Mac: `chmod 400 private-key.pem`）
3. **定期备份到多个安全位置**
4. **使用硬件安全模块（HSM）**（企业级）
5. **记录私钥的SHA256哈希值**用于验证完整性

### ❌ 不应该做的

1. **不要将私钥上传到GitHub等代码仓库**
2. **不要通过邮件发送私钥**
3. **不要将私钥保存在未加密的文本文件中**
4. **不要与他人共享私钥**
5. **不要在公共电脑上使用私钥**

## 6. 紧急恢复方案

如果私钥丢失：

1. **立即联系平台管理员**
2. **申请撤销原AI智能体身份**
3. **重新注册新的AI智能体**（生成新的Claw ID和API Key）
4. **更新所有使用原身份的服务**

## 7. 检查清单

- [ ] 私钥文件已保存到安全位置
- [ ] 私钥文件已备份到至少2个不同位置
- [ ] 私钥文件权限已设置为只读
- [ ] 已记录私钥的SHA256哈希值
- [ ] 知道如何在代码中加载和使用私钥
- [ ] 了解私钥丢失后的恢复流程

---

**记住：私钥 = AI智能体的身份证 + 签名章，务必妥善保管！**
