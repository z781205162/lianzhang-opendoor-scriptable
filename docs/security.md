# 安全与脱敏清单

## 禁止提交

- `.mitm`、HAR、Charles、Burp 等原始抓包文件；
- token、openid、sign、Cookie、Authorization；
- 手机号、IMEI、设备序列号、门禁序列号；
- 真实 User-Agent 中可识别的账号或设备信息；
- 配置初始化脚本和 Scriptable Keychain 导出内容；
- 日志、截图、二维码及带有个人信息的响应体。

## 公开仓库允许保留

- 脱敏后的流程和字段说明；
- 使用占位符的代码模板；
- 不含认证材料的错误处理和 UI 逻辑；
- 经过泛化的签名公式和验证步骤。

## 发布前检查

```bash
rg -n -i 'token|openid|sign|ser_num|imei|mobile|phone|cookie|authorization|password|secret|api[_-]?key' .
```

命中字段名不一定代表泄密，但必须逐行确认值是占位符、说明文字或安全的示例数据。
