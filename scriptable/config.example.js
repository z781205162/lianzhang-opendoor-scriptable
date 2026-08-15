// 仅作为结构示例，不包含任何真实认证材料。
// 请不要把真实配置提交到 GitHub。
const KEY = "lianzhang.opendoor.config.v1"
const CONFIG = {
  openid: "OPENID_PLACEHOLDER",
  token: "TOKEN_PLACEHOLDER",
  ser_num: "SERIAL_PLACEHOLDER",
  header: {
    mobile_phone: "PHONE_PLACEHOLDER",
    imei: "IMEI_PLACEHOLDER",
    appVersion: "APP_VERSION_PLACEHOLDER"
  },
  userAgent: "USER_AGENT_PLACEHOLDER"
}

Keychain.set(KEY, JSON.stringify(CONFIG))
console.log("Example configuration written. Replace placeholders only on your own device.")
