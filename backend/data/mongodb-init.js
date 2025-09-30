// MongoDB 初始化脚本
// 路径: /mnt/okcomputer/output/backend/data/mongodb-init.js

// 创建数据库
db = db.getSiblingDB('policypulse');

// 创建用户
db.createUser({
  user: "app_user",
  pwd: "app_password",
  roles: [
    {
      role: "readWrite",
      db: "policypulse"
    }
  ]
});

// 创建集合
db.createCollection("users");
db.createCollection("raw_pages");
db.createCollection("raw_bids");
db.createCollection("cleaned_docs");
db.createCollection("cleaned_bids");
db.createCollection("insights");
db.createCollection("bid_insights");
db.createCollection("subscriptions");
db.createCollection("notifications");
db.createCollection("stats_snap");

// 创建索引
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "created_at": 1 });

db.raw_pages.createIndex({ "url": 1 }, { unique: true });
db.raw_pages.createIndex({ "source": 1 });
db.raw_pages.createIndex({ "publishDate": 1 });
db.raw_pages.createIndex({ "status": 1 });

db.raw_bids.createIndex({ "url": 1 }, { unique: true });
db.raw_bids.createIndex({ "source": 1 });
db.raw_bids.createIndex({ "publishDate": 1 });
db.raw_bids.createIndex({ "status": 1 });

db.cleaned_docs.createIndex({ "rawId": 1 });
db.cleaned_docs.createIndex({ "category": 1 });
db.cleaned_docs.createIndex({ "region": 1 });
db.cleaned_docs.createIndex({ "industry": 1 });
db.cleaned_docs.createIndex({ "effectiveDate": 1 });

db.cleaned_bids.createIndex({ "rawId": 1 });
db.cleaned_bids.createIndex({ "category": 1 });
db.cleaned_bids.createIndex({ "region": 1 });
db.cleaned_bids.createIndex({ "deadline": 1 });

db.insights.createIndex({ "docId": 1 });
db.insights.createIndex({ "analyzedAt": 1 });
db.insights.createIndex({ "riskLevel": 1 });

db.bid_insights.createIndex({ "bidId": 1 });
db.bid_insights.createIndex({ "analyzedAt": 1 });
db.bid_insights.createIndex({ "opportunity": 1 });

db.subscriptions.createIndex({ "userId": 1 });
db.subscriptions.createIndex({ "status": 1 });
db.subscriptions.createIndex({ "expireAt": 1 });

db.notifications.createIndex({ "userId": 1 });
db.notifications.createIndex({ "createdAt": 1 });
db.notifications.createIndex({ "status": 1 });

// 插入测试数据
if (db.users.countDocuments() === 0) {
  db.users.insertOne({
    email: "admin@policypulse.com",
    name: "管理员",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewqNNgL3GJ5yq6W.", // Admin123456
    role: "admin",
    status: "active",
    subscription: {
      type: "all",
      status: "active",
      trialEnd: null,
      expireAt: new Date("2030-12-31")
    },
    preferences: {
      keywords: [],
      regions: [],
      industries: [],
      signalTypes: [],
      conservative: true
    },
    notifications: {
      wechat: null,
      feishu: null,
      dingding: null,
      email: "admin@policypulse.com",
      phone: null
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });

  db.users.insertOne({
    email: "test@example.com",
    name: "测试用户",
    password: "$2b$12$X8e7F6e5d4c3b2a1Z9Y8X7v6w5e4d3c2b1a9Z8Y7X6w5v4e3d2c1b0a9Z8.", // Test123456
    role: "user",
    status: "trial",
    subscription: {
      type: "policy",
      status: "active",
      trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    preferences: {
      keywords: ["人工智能", "数字经济"],
      regions: ["北京市", "上海市"],
      industries: ["信息技术", "金融服务"],
      signalTypes: ["opportunity", "trend"],
      conservative: true
    },
    notifications: {
      wechat: null,
      feishu: null,
      dingding: null,
      email: "test@example.com",
      phone: null
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

// 插入示例政策数据
if (db.raw_pages.countDocuments() === 0) {
  db.raw_pages.insertMany([
    {
      url: "https://www.gov.cn/zhengce/2024-01/01/content_123456.htm",
      title: "关于促进人工智能产业发展的指导意见",
      content: "为贯彻落实党中央、国务院关于发展人工智能的决策部署，加快推进人工智能产业发展，特制定本指导意见...",
      source: "gov.cn",
      region: "全国",
      industry: "信息技术",
      publishDate: new Date("2024-01-01"),
      crawlDate: new Date(),
      status: "pending",
      metadata: {
        category: "policy",
        level: "national",
        department: "国务院"
      },
      retryCount: 0
    },
    {
      url: "https://www.beijing.gov.cn/zhengce/2024-01/02/content_234567.htm",
      title: "北京市数字经济发展行动计划",
      content: "为加快推进北京市数字经济发展，提升城市数字化水平，制定本行动计划...",
      source: "beijing.gov.cn",
      region: "北京市",
      industry: "数字经济",
      publishDate: new Date("2024-01-02"),
      crawlDate: new Date(),
      status: "pending",
      metadata: {
        category: "policy", 
        level: "municipal",
        department: "北京市政府"
      },
      retryCount: 0
    }
  ]);
}

// 插入示例招标数据
if (db.raw_bids.countDocuments() === 0) {
  db.raw_bids.insertMany([
    {
      url: "https://www.ccgp.gov.cn/cggg/2024-01/03/content_345678.htm",
      title: "北京市政府数据中心建设采购项目",
      content: "采购内容：数据中心硬件设备、软件系统、网络设备等...",
      source: "ccgp.gov.cn",
      region: "北京市",
      industry: "信息技术",
      publishDate: new Date("2024-01-03"),
      deadline: new Date("2024-02-03"),
      crawlDate: new Date(),
      status: "pending",
      metadata: {
        category: "bid",
        budget: "10000000",
        purchaser: "北京市政府"
      },
      retryCount: 0
    }
  ]);
}

print("MongoDB initialization completed!");