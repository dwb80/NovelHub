# ADR-001: 全文搜索技术选型决策记录

**状态**: 已接受 (Accepted)  
**日期**: 2026-04-15  
**优先级**: P0  
**决策人**: 技术架构团队

---

## 1. 背景与上下文

NovelHub 是一个小说阅读与创作平台，需要支持以下搜索场景：

- **小说搜索**: 标题、作者、标签、简介全文检索
- **章节搜索**: 章节标题、内容片段搜索
- **用户搜索**: 用户名、Claw ID 搜索
- **高级筛选**: 分类、状态、评分、字数等多维度组合筛选
- **实时建议**: 搜索关键词自动补全

### 1.1 现有方案评估

当前系统使用 PostgreSQL 的 `tsvector` 和 `LIKE` 查询实现搜索功能：

```sql
-- 当前实现
SELECT * FROM novels
WHERE title ILIKE '%关键词%' OR description ILIKE '%关键词%';

-- 或使用全文搜索
SELECT * FROM novels
WHERE to_tsvector('chinese', title || ' ' || description) @@ plainto_tsquery('关键词');
```

**问题**:
- 中文分词效果差，无法准确理解语义
- 不支持拼音搜索、同义词扩展
- 大数据量时性能急剧下降
- 无法支持复杂的聚合和排序
- 缺乏实时索引更新机制

---

## 2. 决策

### 2.1 选定的方案

**采用 OpenSearch 作为全文搜索引擎**

OpenSearch 是 Elasticsearch 的开源分支，提供：
- 强大的全文搜索能力
- 实时索引更新
- 分布式架构
- 丰富的中文分词插件
- 与 Elasticsearch 兼容的 API

### 2.2 架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                        NovelHub 应用层                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   小说搜索   │  │   章节搜索   │  │   用户搜索   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │ OpenSearch Client
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      OpenSearch 集群                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    协调节点 (Coordinator)                │   │
│  │         接收查询请求，分发到数据节点，聚合结果            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│          ┌───────────────────┼───────────────────┐              │
│          ▼                   ▼                   ▼              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐        │
│  │  数据节点 1   │   │  数据节点 2   │   │  数据节点 3   │        │
│  │  ( novels )  │   │  (chapters)  │   │  (  users  ) │        │
│  └──────────────┘   └──────────────┘   └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
          │
          │ 数据同步 (CDC)
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL 主库                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    novels    │  │   chapters   │  │    users     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 方案对比

### 3.1 候选方案评估

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **PostgreSQL tsvector** | 无需额外组件，数据一致性高 | 中文分词差，性能受限 | 小规模数据 (< 10万条) |
| **OpenSearch** | 功能强大，中文支持好，生态成熟 | 运维复杂度高，资源消耗大 | 大规模搜索，复杂查询 |
| **Meilisearch** | 轻量，易部署，响应快 | 功能相对简单，中文支持一般 | 中小型项目，快速启动 |
| **Typesense** | 实时性好，容错强 | 社区较小，功能有限 | 实时搜索场景 |
| **Solr** | 功能丰富，稳定 | 配置复杂，学习曲线陡 | 企业级应用 |

### 3.2 详细对比

#### 功能对比

| 功能 | PostgreSQL | OpenSearch | Meilisearch | Typesense |
|------|------------|------------|-------------|-----------|
| 中文分词 | ❌ 差 | ✅ 优秀 | ⚠️ 一般 | ⚠️ 一般 |
| 拼音搜索 | ❌ | ✅ | ❌ | ❌ |
| 同义词 | ❌ | ✅ | ⚠️ | ⚠️ |
| 模糊匹配 | ⚠️ | ✅ | ✅ | ✅ |
| 聚合查询 | ⚠️ | ✅ | ⚠️ | ⚠️ |
| 实时索引 | ⚠️ | ✅ | ✅ | ✅ |
| 高亮显示 | ⚠️ | ✅ | ✅ | ✅ |
| 自动补全 | ❌ | ✅ | ✅ | ✅ |
| 地理搜索 | ❌ | ✅ | ❌ | ✅ |
| 机器学习 | ❌ | ✅ | ❌ | ❌ |

#### 性能对比 (预估)

| 指标 | PostgreSQL | OpenSearch | Meilisearch |
|------|------------|------------|-------------|
| 索引速度 | 100 doc/s | 10K doc/s | 50K doc/s |
| 查询延迟 (P95) | 500ms | 50ms | 20ms |
| 并发查询 | 100 QPS | 10K QPS | 5K QPS |
| 数据容量 | < 100万 | 无限制 | < 1亿 |

#### 运维对比

| 维度 | OpenSearch | Meilisearch |
|------|------------|-------------|
| 部署复杂度 | 中等 | 低 |
| 集群扩展 | 原生支持 | 有限支持 |
| 监控工具 | 丰富 | 基础 |
| 社区活跃度 | 高 | 中 |
| 云托管服务 | AWS/OpenSearch | 无官方服务 |

---

## 4. OpenSearch 详细设计

### 4.1 索引设计

#### 小说索引 (novels)

```json
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "novel_analyzer": {
          "type": "custom",
          "tokenizer": "ik_max_word",
          "filter": [
            "lowercase",
            "synonym_filter",
            "pinyin_filter"
          ]
        },
        "novel_search_analyzer": {
          "type": "custom",
          "tokenizer": "ik_smart",
          "filter": [
            "lowercase",
            "synonym_filter"
          ]
        }
      },
      "filter": {
        "synonym_filter": {
          "type": "synonym",
          "synonyms": [
            "修真,修仙,修炼",
            "魔法,法术,巫术",
            "穿越,重生,转世"
          ]
        },
        "pinyin_filter": {
          "type": "pinyin",
          "keep_first_letter": true,
          "keep_full_pinyin": false,
          "keep_original": true
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "title": {
        "type": "text",
        "analyzer": "novel_analyzer",
        "search_analyzer": "novel_search_analyzer",
        "fields": {
          "keyword": { "type": "keyword" },
          "pinyin": {
            "type": "text",
            "analyzer": "novel_analyzer"
          }
        }
      },
      "description": {
        "type": "text",
        "analyzer": "novel_analyzer",
        "search_analyzer": "novel_search_analyzer"
      },
      "author_name": {
        "type": "text",
        "analyzer": "novel_analyzer",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "tags": { "type": "keyword" },
      "categories": { "type": "keyword" },
      "status": { "type": "keyword" },
      "rating": { "type": "float" },
      "word_count": { "type": "integer" },
      "view_count": { "type": "integer" },
      "chapter_count": { "type": "integer" },
      "created_at": { "type": "date" },
      "updated_at": { "type": "date" },
      "is_completed": { "type": "boolean" },
      "suggest": {
        "type": "completion",
        "analyzer": "novel_analyzer"
      }
    }
  }
}
```

#### 章节索引 (chapters)

```json
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "chapter_analyzer": {
          "type": "custom",
          "tokenizer": "ik_max_word",
          "filter": ["lowercase"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "novel_id": { "type": "keyword" },
      "title": {
        "type": "text",
        "analyzer": "chapter_analyzer"
      },
      "content": {
        "type": "text",
        "analyzer": "chapter_analyzer",
        "store": false
      },
      "order_index": { "type": "integer" },
      "created_at": { "type": "date" }
    }
  }
}
```

### 4.2 数据同步方案

#### 方案 A: 应用层双写 (推荐)

```typescript
// services/novel.service.ts
@Injectable()
export class NovelService {
  constructor(
    private prisma: PrismaService,
    private openSearch: OpenSearchService,
  ) {}

  async createNovel(data: CreateNovelDto) {
    // 1. 写入 PostgreSQL
    const novel = await this.prisma.novel.create({ data });

    // 2. 同步到 OpenSearch
    await this.openSearch.indexDocument('novels', novel.id, {
      id: novel.id,
      title: novel.title,
      description: novel.description,
      // ... 其他字段
    });

    return novel;
  }

  async updateNovel(id: string, data: UpdateNovelDto) {
    // 1. 更新 PostgreSQL
    const novel = await this.prisma.novel.update({
      where: { id },
      data,
    });

    // 2. 更新 OpenSearch
    await this.openSearch.updateDocument('novels', id, {
      title: novel.title,
      description: novel.description,
      // ... 其他字段
    });

    return novel;
  }

  async deleteNovel(id: string) {
    // 1. 删除 PostgreSQL
    await this.prisma.novel.delete({ where: { id } });

    // 2. 删除 OpenSearch 文档
    await this.openSearch.deleteDocument('novels', id);
  }
}
```

**优点**:
- 实现简单，可控性强
- 可以自定义同步逻辑
- 失败时可重试

**缺点**:
- 代码侵入性强
- 可能产生数据不一致

#### 方案 B: CDC (Change Data Capture)

使用 Debezium 监听 PostgreSQL WAL 日志，自动同步到 OpenSearch。

```yaml
# docker-compose.cdc.yml
version: '3.8'
services:
  debezium:
    image: debezium/connect:2.5
    environment:
      BOOTSTRAP_SERVERS: kafka:9092
      GROUP_ID: debezium-connect
      CONFIG_STORAGE_TOPIC: debezium_configs
      OFFSET_STORAGE_TOPIC: debezium_offsets
    depends_on:
      - kafka
      - postgres

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    # ... Kafka 配置

  kafka-connect-opensearch:
    image: confluentinc/kafka-connect-opensearch:latest
    # ... OpenSearch Sink 配置
```

**优点**:
- 对应用无侵入
- 实时性高
- 自动处理数据变更

**缺点**:
- 架构复杂
- 需要维护 Kafka 集群
- 初始配置复杂

**决策**: MVP 阶段使用方案 A (应用层双写)，数据量增大后迁移到方案 B (CDC)。

### 4.3 搜索服务实现

```typescript
// services/search.service.ts
@Injectable()
export class SearchService {
  constructor(private openSearch: OpenSearchService) {}

  async searchNovels(query: SearchNovelsDto) {
    const {
      keyword,
      categories,
      status,
      minRating,
      maxWordCount,
      sortBy = 'relevance',
      page = 1,
      limit = 20,
    } = query;

    const must: any[] = [];
    const filter: any[] = [];

    // 全文搜索
    if (keyword) {
      must.push({
        multi_match: {
          query: keyword,
          fields: ['title^3', 'author_name^2', 'description', 'tags'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    // 分类筛选
    if (categories?.length) {
      filter.push({
        terms: { categories },
      });
    }

    // 状态筛选
    if (status) {
      filter.push({
        term: { status },
      });
    }

    // 评分筛选
    if (minRating) {
      filter.push({
        range: { rating: { gte: minRating } },
      });
    }

    // 字数筛选
    if (maxWordCount) {
      filter.push({
        range: { word_count: { lte: maxWordCount } },
      });
    }

    // 排序
    let sort: any[] = [];
    switch (sortBy) {
      case 'relevance':
        sort = ['_score'];
        break;
      case 'rating':
        sort = [{ rating: 'desc' }];
        break;
      case 'word_count':
        sort = [{ word_count: 'desc' }];
        break;
      case 'updated':
        sort = [{ updated_at: 'desc' }];
        break;
    }

    const result = await this.openSearch.search({
      index: 'novels',
      body: {
        query: {
          bool: {
            must,
            filter,
          },
        },
        sort,
        from: (page - 1) * limit,
        size: limit,
        highlight: {
          fields: {
            title: {},
            description: { fragment_size: 150 },
          },
        },
        aggs: {
          categories: {
            terms: { field: 'categories' },
          },
          status: {
            terms: { field: 'status' },
          },
          rating_ranges: {
            range: {
              field: 'rating',
              ranges: [
                { to: 6, key: 'below_6' },
                { from: 6, to: 8, key: '6_to_8' },
                { from: 8, key: 'above_8' },
              ],
            },
          },
        },
      },
    });

    return {
      total: result.body.hits.total.value,
      page,
      limit,
      novels: result.body.hits.hits.map(hit => ({
        ...hit._source,
        highlight: hit.highlight,
        score: hit._score,
      })),
      aggregations: result.body.aggregations,
    };
  }

  async getSuggestions(keyword: string) {
    const result = await this.openSearch.search({
      index: 'novels',
      body: {
        suggest: {
          title_suggest: {
            prefix: keyword,
            completion: {
              field: 'suggest',
              fuzzy: true,
              size: 10,
            },
          },
        },
      },
    });

    return result.body.suggest.title_suggest[0].options.map(opt => ({
      text: opt.text,
      score: opt._score,
    }));
  }
}
```

---

## 5. 部署配置

### 5.1 Docker Compose

```yaml
# docker-compose.opensearch.yml
version: '3.8'

services:
  opensearch:
    image: opensearchproject/opensearch:2.11.0
    environment:
      - discovery.type=single-node
      - bootstrap.memory_lock=true
      - "OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m"
      - plugins.security.disabled=true
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - opensearch_data:/usr/share/opensearch/data
    ports:
      - "9200:9200"
      - "9600:9600"

  opensearch-dashboards:
    image: opensearchproject/opensearch-dashboards:2.11.0
    ports:
      - "5601:5601"
    environment:
      - 'OPENSEARCH_HOSTS=["http://opensearch:9200"]'
    depends_on:
      - opensearch

  # 中文分词插件安装
  opensearch-setup:
    image: opensearchproject/opensearch:2.11.0
    command: >
      bash -c "
        /usr/share/opensearch/bin/opensearch-plugin install analysis-ik
      "
    depends_on:
      - opensearch

volumes:
  opensearch_data:
```

### 5.2 生产环境配置

```yaml
# opensearch.yml (生产配置)
cluster.name: novelhub-search
node.name: node-1
path.data: /var/lib/opensearch
path.logs: /var/log/opensearch

# 集群配置
discovery.seed_hosts: ["node-1", "node-2", "node-3"]
cluster.initial_master_nodes: ["node-1", "node-2", "node-3"]

# 性能配置
indices.memory.index_buffer_size: 20%
indices.queries.cache.size: 10%
indices.fielddata.cache.size: 30%

# 安全配置 (生产启用)
plugins.security.ssl.transport.pemcert_filepath: certificates/node-1.pem
plugins.security.ssl.transport.pemkey_filepath: certificates/node-1-key.pem
plugins.security.ssl.transport.pemtrustedcas_filepath: certificates/root-ca.pem
plugins.security.ssl.http.enabled: true
plugins.security.ssl.http.pemcert_filepath: certificates/node-1.pem
plugins.security.ssl.http.pemkey_filepath: certificates/node-1-key.pem
plugins.security.ssl.http.pemtrustedcas_filepath: certificates/root-ca.pem
```

---

## 6. 性能与容量规划

### 6.1 资源需求

| 环境 | 节点数 | CPU | 内存 | 存储 | 说明 |
|------|--------|-----|------|------|------|
| 开发 | 1 | 2核 | 4GB | 50GB | 单节点 |
| 测试 | 3 | 4核 | 8GB | 100GB | 3节点集群 |
| 生产 | 5+ | 8核 | 32GB | 1TB+ | 高可用集群 |

### 6.2 性能指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 索引延迟 | < 1s | 文档索引到可搜索 |
| 查询延迟 (P95) | < 50ms | 简单查询 |
| 复杂查询延迟 | < 200ms | 带聚合的查询 |
| 并发查询 | > 1000 QPS | 单集群 |
| 数据容量 | > 1000万文档 | 小说+章节 |

---

## 7. 监控与运维

### 7.1 关键指标

```yaml
# 监控指标
opensearch_metrics:
  # 集群健康
  - cluster_health_status
  - cluster_nodes_count
  - cluster_pending_tasks

  # 索引性能
  - indices_indexing_rate
  - indices_search_rate
  - indices_query_latency

  # 资源使用
  - jvm_heap_usage
  - os_cpu_usage
  - os_memory_usage
  - disk_usage

  # 缓存性能
  - cache_hit_ratio
  - cache_evictions
```

### 7.2 告警规则

```yaml
# 告警规则
alerts:
  - name: Cluster Health Red
    condition: cluster_health_status == "red"
    severity: critical

  - name: High JVM Heap Usage
    condition: jvm_heap_usage > 85%
    severity: warning

  - name: Slow Queries
    condition: query_latency_p95 > 500ms
    severity: warning

  - name: Disk Space Low
    condition: disk_usage > 80%
    severity: warning
```

---

## 8. 回滚计划

如果 OpenSearch 无法满足需求，回滚到 PostgreSQL 方案：

1. **保留 PostgreSQL 搜索逻辑**作为 fallback
2. **双写阶段**保持 PostgreSQL 数据完整
3. **切换开关**控制搜索源
4. **数据导出脚本**从 OpenSearch 迁回 PostgreSQL

---

## 9. 结论

### 决策结果

**采用 OpenSearch 作为 NovelHub 的全文搜索引擎**

### 实施计划

| 阶段 | 时间 | 任务 |
|------|------|------|
| 阶段 1 | Week 1-2 | 部署 OpenSearch 开发环境，安装中文分词插件 |
| 阶段 2 | Week 3-4 | 实现 novels 索引和搜索服务 |
| 阶段 3 | Week 5-6 | 实现 chapters 索引，完善搜索功能 |
| 阶段 4 | Week 7-8 | 性能测试，生产环境部署 |

### 预期收益

- ✅ 搜索准确率提升 50%+
- ✅ 查询响应时间 < 50ms (P95)
- ✅ 支持拼音、同义词、模糊匹配
- ✅ 实时搜索建议
- ✅ 复杂的聚合分析能力

---

## 10. 相关文档

- [技术架构文档](./技术架构文档.md)
- [OpenSearch 官方文档](https://opensearch.org/docs/)
- [IK 分词器文档](https://github.com/medcl/elasticsearch-analysis-ik)

---

**决策记录编号**: ADR-001  
**状态**: 已接受  
**日期**: 2026-04-15
