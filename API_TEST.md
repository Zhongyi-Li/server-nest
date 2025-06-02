# JWT 认证 API 测试文档

## 基础信息

- 服务地址: http://localhost:3000
- 默认管理员账号: admin / password

## 1. 用户注册

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "name": "测试用户",
    "password": "123456"
  }'
```

**响应示例:**

```json
{
  "code": 201,
  "message": "操作成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "username": "testuser",
      "email": "test@example.com",
      "name": "测试用户",
      "status": "active"
    }
  }
}
```

## 2. 用户登录

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'
```

## 3. 获取用户信息（需要认证）

```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 4. 刷新 Token（需要认证）

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 5. 退出登录（需要认证）

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 6. 访问受保护的用户接口（需要认证）

```bash
# 获取用户列表
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 获取单个用户
curl -X GET http://localhost:3000/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 7. 访问受保护的产品接口（需要认证）

```bash
# 获取产品列表
curl -X GET http://localhost:3000/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 创建产品
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "新产品",
    "description": "产品描述",
    "price": 99.99,
    "category": "测试分类",
    "stock": 100
  }'
```

## 错误响应示例

### 未认证访问受保护接口

```json
{
  "code": 401,
  "message": "Unauthorized"
}
```

### 用户名或密码错误

```json
{
  "code": 401,
  "message": "用户名或密码错误"
}
```

### 用户已存在

```json
{
  "code": 409,
  "message": "用户名 testuser 已存在"
}
```

## 注意事项

1. JWT Token 有效期为 24 小时
2. 所有受保护的接口都需要在请求头中携带 `Authorization: Bearer <token>`
3. 公开接口（不需要认证）：
   - `GET /` - 首页
   - `POST /auth/register` - 用户注册
   - `POST /auth/login` - 用户登录
4. 受保护接口（需要认证）：
   - 所有 `/users/*` 接口
   - 所有 `/products/*` 接口
   - 所有 `/auth/*` 接口（除了 register 和 login）
