---
title: "10 Design Patterns in Go"
date: "2025-12-23"
category: "Go Design Pattern"
excerpt: "10 design patterns in go that help you to become a senior"
---

![Ryo Yamada Hero Image](/images/articles/go-design-patterns/ryo-yamada-hero.png)

## 1.构造函数模式｜Constructor Pattern

### 核心价值｜Core Value

控制依赖关系，而不仅仅是使用struct创建对象

### 代码示例｜Code Example

```go
// 构造函数对象
type UserService struct {
    repo UserRepository
}
// 控制依赖关系，而不仅仅创建对象
func NewUserService(r UserRepository) *UserService {
    return &UserService{repo: r}
}
```

初级开发者常常使用硬编码依赖，这降低了代码的可复用性，使用构造函数来优雅地注入依赖，是Go语言中推荐的做法。

### 为什么重要？｜Why Important?

- 实现了依赖注入
- 提高了代码的可测试性，耦合性，可维护性
- 分离了对象创建和业务逻辑

## 2.接口隔离模式｜Interface Segregation Pattern

### 核心价值｜Core Value
保持接口精简，只暴露必要的内容

### 代码示例｜Code Example

```go
type EmailSender interface {
    Send(to, subject, body string) error
}
```

### 为什么重要？｜Why Important?

- 避免了接口臃肿
- 遵循接口隔离原则
- 提高代码灵活性和可维护性

## 3.函数选项模式｜Functional Options Pattern

### 核心价值｜Core Value
为对象提供灵活可选的配置，无需定义多个构造函数。

### 代码示例｜Code Example
```go
type Product struct {
    Name  string
    Price float64
}

type Option func(*Product)

func NewProduct(options ...Option) *Product {
    p := &Product{
        Name:  "Default Product", // 默认值
        Price: 10.0,
    }
    for _, option := range options {
        option(p)
    }
    return p
}

func WithName(name string) Option {
    return func(p *Product) {
        p.Name = name
    }
}

func WithPrice(price float64) Option {
    return func(p *Product) {
        p.Price = price
    }
}

// usage
product := NewProduct(WithName("Laptop"), WithPrice(1200.50))
```

### 为什么重要？｜Why Important?

- 避免构造函数过多（Constructor Overloading）
- 提供清晰的API
- 支持可选参数和默认值
- 符合 Open-Closed Principle（开闭原则），扩展选项无需修改构造函数

## 4.仓储模式｜Repository Pattern

### 核心价值｜Core Value
将业务逻辑与数据访问逻辑分离。

### 代码示例｜Code Example

```go
type UserRepository interface {
    Get(ctx context.Context, id string) (*User, error)
    Save(ctx context.Context, user *User) error
}

type UserService struct {
    repo UserRepository
}

// 在 Service 中使用
func (s *UserService) GetUser(ctx context.Context, id string) (*User, error) {
    return s.repo.Get(ctx, id)
}
```

### 为什么重要？｜Why Important?

- 数据库无关的应用代码
- 易于测试（可以使用内存实现 Mock Repository）
- 支持多种数据源实现（MySQL、Redis、内存等）无缝切换

## 5.错误包装模式｜Error Wrapping Pattern

### 核心价值｜Core Value

为错误添加上下文信息，保留原始错误堆栈。

### 代码示例｜Code Example

Go 1.13+ 推荐使用标准库的方式：

```go
// 使用 fmt.Errorf 包装错误
err := connectDatabase()
if err != nil {
    return fmt.Errorf("无法连接数据库: %w", err)
}

// 解包并检查特定错误
if errors.Is(err, sql.ErrNoRows) {
    // 处理记录不存在的情况
}

// 提取特定类型的错误
var sqlErr *mysql.MySQLError
if errors.As(err, &sqlErr) {
    // 处理 MySQL 特定错误
}
```

### 为什么重要？｜Why Important?

- 提供更好的错误上下文
- 支持错误链追踪 (`errors.Is` / `errors.As`)
- 便于调试和日志记录，避免信息丢失

## 6.中间件模式｜Middleware Pattern

### 核心价值｜Core Value
在主要逻辑前后添加横切关注点（Cross-cutting concerns）。

### 代码示例｜Code Example
```go
type Middleware func(http.Handler) http.Handler

func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        log.Printf("Starting Request: %s %s", r.Method, r.URL.Path)
        next.ServeHTTP(w, r)
        log.Printf("Finished Request: %s %s", r.Method, r.URL.Path)
    })
}

// 链式中间件使用
// handler := LoggingMiddleware(AuthMiddleware(mainHandler))
```

### 为什么重要？｜Why Important?

- 实现关注点分离
- 可复用的功能（日志、认证、限流等）
- 清晰的请求处理链

## 7.上下文模式｜Context Pattern

### 核心价值｜Core Value
传递请求范围的值、取消信号和截止时间。这是 Go 并发模式的核心。

### 代码示例｜Code Example
```go
// 创建带超时的 context
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

// 在函数中使用 context
func ProcessRequest(ctx context.Context, data string) error {
    select {
    case <-ctx.Done():
        return ctx.Err() // 超时或取消
    case result := <-doWork(data):
        return result
    }
}
```

### 为什么重要？｜Why Important?
- 优雅地处理超时和取消
- 传递请求级别的数据（如 TraceID、UserInfo）
- 防止 Goroutine 泄漏

## 8.策略模式｜Strategy Pattern

### 核心价值｜Core Value
定义一系列算法，使它们可以互换。

### 代码示例｜Code Example
```go
type PaymentStrategy interface {
    Pay(amount float64) error
}

type CreditCardPayment struct{}
type PayPalPayment struct{}

func (c *CreditCardPayment) Pay(amount float64) error {
    fmt.Printf("Paying %.2f using Credit Card\n", amount)
    return nil
}

func (p *PayPalPayment) Pay(amount float64) error {
    fmt.Printf("Paying %.2f using PayPal\n", amount)
    return nil
}
```

### 为什么重要？｜Why Important?
- 运行时动态选择算法
- 消除复杂的 if-else 条件语句
- 符合开闭原则

## 9.适配器模式｜Adapter Pattern

### 核心价值｜Core Value
将不兼容的接口转换为客户端所期望的接口。

### 代码示例｜Code Example
```go
type OldSystem interface {
    OldMethod() string
}

type NewSystem interface {
    NewMethod() string
}

type Adapter struct {
    old OldSystem
}

func (a *Adapter) NewMethod() string {
    return a.old.OldMethod() // 适配旧接口到新接口
}
```

### 为什么重要？｜Why Important?
- 促进接口兼容性
- 适配第三方库而无需修改源码
- 集成遗留代码

## 10.工厂模式｜Factory Pattern

### 核心价值｜Core Value
封装对象创建逻辑，根据类型生成具体实例。

### 代码示例｜Code Example
```go
type PaymentGateway interface {
    Process(amount float64) error
}

type PayPalGateway struct{}
func (p *PayPalGateway) Process(amount float64) error { return nil }

type StripeGateway struct{}
func (s *StripeGateway) Process(amount float64) error { return nil }

const (
    PayPal = iota
    Stripe
)

func NewPaymentGateway(gatewayType int) PaymentGateway {
    switch gatewayType {
    case PayPal:
        return &PayPalGateway{}
    case Stripe:
        return &StripeGateway{}
    default:
        return nil
    }
}
```

### 为什么重要？｜Why Important?
- 集中创建逻辑
- 简化客户端代码
- 易于扩展新类型

## 总结｜Conclusion

| 方面 | 初级开发者 | 高级开发者 |
|------|-----------|-----------|
| 依赖管理 | 硬编码依赖 | 依赖注入 |
| 全局状态 | 使用全局变量 | 通过参数传递 |
| 测试性 | 不考虑测试 | 代码可测试 |
| 耦合度 | 紧耦合 | 松耦合、可维护 |

### 参考文章｜Reference Articles
[10 design patterns in go that separate juniors from seniors](https://medium.com/@codingplainenglish/10-design-patterns-in-go-that-separate-juniors-from-seniors-ed2bdf70d1bc)