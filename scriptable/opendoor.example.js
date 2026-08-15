// 脱敏模板：用于说明请求结构，不包含可用的服务器地址或认证材料。
const KEY = "lianzhang.opendoor.config.v1"
const API_URL = "https://API_HOST_PLACEHOLDER:PORT_PLACEHOLDER/BASE_PATH_PLACEHOLDER"
const API_PATH = "/API_PATH_PLACEHOLDER"

function md5(input) {
  // 在实际脚本中放入经过审计的纯 JavaScript MD5 实现，或使用受支持的本地实现。
  throw new Error(`Replace with a reviewed MD5 implementation: ${input}`)
}

if (!Keychain.contains(KEY)) {
  throw new Error("请先在本机写入自己的 Keychain 配置")
}

const cfg = JSON.parse(Keychain.get(KEY))
const timestamp = Math.floor(Date.now() / 1000).toString()
const sign = md5(API_PATH + timestamp + cfg.token)
const query = `?timestamp=${encodeURIComponent(timestamp)}&openid=${encodeURIComponent(cfg.openid)}&sign=${encodeURIComponent(sign)}`

const req = new Request(API_URL + API_PATH + query)
req.method = "POST"
req.headers = {
  "Content-Type": "application/json",
  "User-Agent": cfg.userAgent,
  ...cfg.header
}
req.body = JSON.stringify({
  body: { ser_num: cfg.ser_num, msg_id: timestamp },
  header: cfg.header
})

const response = await req.loadJSON()
if (Number(response.code) !== 10000) {
  throw new Error(`${response.code || "UNKNOWN"}: ${response.message || "Open-door request failed"}`)
}

console.log("Open-door request accepted by the service")
