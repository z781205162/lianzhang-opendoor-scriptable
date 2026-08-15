// 联掌门户一键开门（Scriptable）
// 首次使用：先运行“联掌门户-配置初始化.js”，再运行本脚本。
// 配置写入 Scriptable Keychain；不要把初始化脚本分享给别人。

const KEY = "lianzhang.opendoor.config.v1"
const API_PATH = "/api/v1/opendoor/openDoorControl"
// 抓包确认联掌门户开门接口使用 6025 端口；省略端口会连到错误证书。
const API_URL = "https://lzmh.lz-qs.com:6025/lzmh_app_api" + API_PATH
const WEATHER_CACHE_NAME = "联掌门户-天气缓存.json"
const WEATHER_LOCATION_NAME = "联掌门户-天气位置.json"
const WEATHER_REFRESH_MINUTES = 30
const WEATHER_LOCATION_MAX_AGE_HOURS = 6

// Scriptable 没有统一可用的原生 MD5，这里使用纯 JavaScript 实现。
function md5(input) {
  function safeAdd(x, y) {
    const lsw = (x & 0xffff) + (y & 0xffff)
    const msw = (x >>> 16) + (y >>> 16) + (lsw >>> 16)
    return (msw << 16) | (lsw & 0xffff)
  }
  function rol(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)) }
  function cmn(q, a, b, x, s, t) {
    return safeAdd(rol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
  }
  function ff(a,b,c,d,x,s,t) { return cmn((b & c) | ((~b) & d),a,b,x,s,t) }
  function gg(a,b,c,d,x,s,t) { return cmn((b & d) | (c & (~d)),a,b,x,s,t) }
  function hh(a,b,c,d,x,s,t) { return cmn(b ^ c ^ d,a,b,x,s,t) }
  function ii(a,b,c,d,x,s,t) { return cmn(c ^ (b | (~d)),a,b,x,s,t) }
  function utf8(s) { return unescape(encodeURIComponent(s)) }
  function hex(n) {
    let out = ""
    for (let j = 0; j < 4; j++) out += ((n >>> (j * 8)) & 0xff).toString(16).padStart(2, "0")
    return out
  }

  const str = utf8(input)
  const x = []
  for (let i = 0; i < str.length; i++) x[i >> 2] = (x[i >> 2] || 0) | (str.charCodeAt(i) << ((i % 4) * 8))
  x[str.length >> 2] = (x[str.length >> 2] || 0) | (0x80 << ((str.length % 4) * 8))
  x[(((str.length + 8) >>> 6) << 4) + 14] = str.length * 8

  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476
  for (let k = 0; k < x.length; k += 16) {
    const oa = a, ob = b, oc = c, od = d
    a=ff(a,b,c,d,x[k+0]||0,7,-680876936); d=ff(d,a,b,c,x[k+1]||0,12,-389564586); c=ff(c,d,a,b,x[k+2]||0,17,606105819); b=ff(b,c,d,a,x[k+3]||0,22,-1044525330)
    a=ff(a,b,c,d,x[k+4]||0,7,-176418897); d=ff(d,a,b,c,x[k+5]||0,12,1200080426); c=ff(c,d,a,b,x[k+6]||0,17,-1473231341); b=ff(b,c,d,a,x[k+7]||0,22,-45705983)
    a=ff(a,b,c,d,x[k+8]||0,7,1770035416); d=ff(d,a,b,c,x[k+9]||0,12,-1958414417); c=ff(c,d,a,b,x[k+10]||0,17,-42063); b=ff(b,c,d,a,x[k+11]||0,22,-1990404162)
    a=ff(a,b,c,d,x[k+12]||0,7,1804603682); d=ff(d,a,b,c,x[k+13]||0,12,-40341101); c=ff(c,d,a,b,x[k+14]||0,17,-1502002290); b=ff(b,c,d,a,x[k+15]||0,22,1236535329)
    a=gg(a,b,c,d,x[k+1]||0,5,-165796510); d=gg(d,a,b,c,x[k+6]||0,9,-1069501632); c=gg(c,d,a,b,x[k+11]||0,14,643717713); b=gg(b,c,d,a,x[k+0]||0,20,-373897302)
    a=gg(a,b,c,d,x[k+5]||0,5,-701558691); d=gg(d,a,b,c,x[k+10]||0,9,38016083); c=gg(c,d,a,b,x[k+15]||0,14,-660478335); b=gg(b,c,d,a,x[k+4]||0,20,-405537848)
    a=gg(a,b,c,d,x[k+9]||0,5,568446438); d=gg(d,a,b,c,x[k+14]||0,9,-1019803690); c=gg(c,d,a,b,x[k+3]||0,14,-187363961); b=gg(b,c,d,a,x[k+8]||0,20,1163531501)
    a=gg(a,b,c,d,x[k+13]||0,5,-1444681467); d=gg(d,a,b,c,x[k+2]||0,9,-51403784); c=gg(c,d,a,b,x[k+7]||0,14,1735328473); b=gg(b,c,d,a,x[k+12]||0,20,-1926607734)
    a=hh(a,b,c,d,x[k+5]||0,4,-378558); d=hh(d,a,b,c,x[k+8]||0,11,-2022574463); c=hh(c,d,a,b,x[k+11]||0,16,1839030562); b=hh(b,c,d,a,x[k+14]||0,23,-35309556)
    a=hh(a,b,c,d,x[k+1]||0,4,-1530992060); d=hh(d,a,b,c,x[k+4]||0,11,1272893353); c=hh(c,d,a,b,x[k+7]||0,16,-155497632); b=hh(b,c,d,a,x[k+10]||0,23,-1094730640)
    a=hh(a,b,c,d,x[k+13]||0,4,681279174); d=hh(d,a,b,c,x[k+0]||0,11,-358537222); c=hh(c,d,a,b,x[k+3]||0,16,-722521979); b=hh(b,c,d,a,x[k+6]||0,23,76029189)
    a=hh(a,b,c,d,x[k+9]||0,4,-640364487); d=hh(d,a,b,c,x[k+12]||0,11,-421815835); c=hh(c,d,a,b,x[k+15]||0,16,530742520); b=hh(b,c,d,a,x[k+2]||0,23,-995338651)
    a=ii(a,b,c,d,x[k+0]||0,6,-198630844); d=ii(d,a,b,c,x[k+7]||0,10,1126891415); c=ii(c,d,a,b,x[k+14]||0,15,-1416354905); b=ii(b,c,d,a,x[k+5]||0,21,-57434055)
    a=ii(a,b,c,d,x[k+12]||0,6,1700485571); d=ii(d,a,b,c,x[k+3]||0,10,-1894986606); c=ii(c,d,a,b,x[k+10]||0,15,-1051523); b=ii(b,c,d,a,x[k+1]||0,21,-2054922799)
    a=ii(a,b,c,d,x[k+8]||0,6,1873313359); d=ii(d,a,b,c,x[k+15]||0,10,-30611744); c=ii(c,d,a,b,x[k+6]||0,15,-1560198380); b=ii(b,c,d,a,x[k+13]||0,21,1309151649)
    a=ii(a,b,c,d,x[k+4]||0,6,-145523070); d=ii(d,a,b,c,x[k+11]||0,10,-1120210379); c=ii(c,d,a,b,x[k+2]||0,15,718787259); b=ii(b,c,d,a,x[k+9]||0,21,-343485551)
    a=safeAdd(a,oa); b=safeAdd(b,ob); c=safeAdd(c,oc); d=safeAdd(d,od)
  }
  return hex(a)+hex(b)+hex(c)+hex(d)
}

async function alertMessage(title, message) {
  const a = new Alert()
  a.title = title
  a.message = message
  a.addAction("知道了")
  return await a.presentAlert()
}

function weatherDescription(code, isDay = true) {
  const n = Number(code)
  if (n === 0) return { icon: isDay ? "☀️" : "🌙", text: "晴" }
  if ([1, 2, 3].includes(n)) return { icon: "⛅️", text: n === 3 ? "阴" : "多云" }
  if ([45, 48].includes(n)) return { icon: "🌫️", text: "雾" }
  if ([51, 53, 55, 56, 57].includes(n)) return { icon: "🌦️", text: "毛毛雨" }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(n)) return { icon: "🌧️", text: "下雨" }
  if ([71, 73, 75, 77, 85, 86].includes(n)) return { icon: "🌨️", text: "下雪" }
  if ([95, 96, 99].includes(n)) return { icon: "⛈️", text: "雷雨" }
  return { icon: "🌤️", text: "天气" }
}

function weatherGradient(weather) {
  const code = Number(weather.code)
  if (code < 0) {
    const fallback = new LinearGradient()
    fallback.colors = [new Color("#39424E"), new Color("#687482"), new Color("#8C99A5")]
    fallback.locations = [0, 0.56, 1]
    fallback.startPoint = new Point(0, 0)
    fallback.endPoint = new Point(1, 1)
    return fallback
  }
  const isNight = weather.isDay === false
  let colors
  if (isNight) {
    colors = ["#102A5C", "#1C3568", "#263A69"]
  } else if ([61, 63, 65, 80, 81, 82].includes(code)) {
    colors = ["#2E6B9A", "#4B88AC", "#7AAAC1"]
  } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
    colors = ["#5B83A3", "#86A9C1", "#B6CDD8"]
  } else if ([45, 48, 95, 96, 99].includes(code)) {
    colors = ["#394B62", "#61758A", "#8FA2AF"]
  } else if ([1, 2, 3, 51, 53, 55, 56, 57].includes(code)) {
    colors = ["#3E82B6", "#72A7C6", "#A8C8D4"]
  } else {
    colors = ["#E59D4A", "#F2B85B", "#F5D28A"]
  }
  const gradient = new LinearGradient()
  gradient.colors = colors.map(color => new Color(color))
  gradient.locations = [0, 0.56, 1]
  gradient.startPoint = new Point(0, 0)
  gradient.endPoint = new Point(1, 1)
  return gradient
}

function mixColor(start, end, amount) {
  const a = start.replace("#", "")
  const b = end.replace("#", "")
  const ar = parseInt(a.slice(0, 2), 16), ag = parseInt(a.slice(2, 4), 16), ab = parseInt(a.slice(4, 6), 16)
  const br = parseInt(b.slice(0, 2), 16), bg = parseInt(b.slice(2, 4), 16), bb = parseInt(b.slice(4, 6), 16)
  const r = Math.round(ar + (br - ar) * amount).toString(16).padStart(2, "0")
  const g = Math.round(ag + (bg - ag) * amount).toString(16).padStart(2, "0")
  const bl = Math.round(ab + (bb - ab) * amount).toString(16).padStart(2, "0")
  return `#${r}${g}${bl}`
}

function weatherBackgroundImage(weather) {
  const code = Number(weather.code)
  const isNight = weather.isDay === false
  let top = "#172350"
  let bottom = "#2B3F78"
  if (!isNight && code === 0) {
    top = "#25366F"
    bottom = "#172650"
  } else if (!isNight && [1, 2, 3, 51, 53, 55, 56, 57].includes(code)) {
    top = "#26396F"
    bottom = "#334B82"
  } else if ([61, 63, 65, 80, 81, 82].includes(code)) {
    top = "#182B5A"
    bottom = "#304879"
  } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
    top = "#304B7B"
    bottom = "#536F9A"
  } else if ([45, 48, 95, 96, 99].includes(code)) {
    top = "#151E3D"
    bottom = "#35456F"
  }

  const context = new DrawContext()
  context.size = new Size(600, 600)
  context.opaque = true
  context.respectScreenScale = false

  for (let i = 0; i < 30; i++) {
    const amount = i / 29
    context.setFillColor(new Color(mixColor(top, bottom, amount)))
    context.fillRect(new Rect(0, i * 20, 600, 22))
  }

  // 原生天气组件的背景是整块深蓝底，天气差异主要体现在色温和明暗，
  // 不绘制大面积云团、雨线或气泡，避免盖住文字并产生“插画卡片”效果。
  if (!isNight && code === 0) {
    context.setFillColor(new Color("#6D82C4", 0.08))
    context.fillEllipse(new Rect(380, 10, 260, 260))
  }
  context.setFillColor(new Color("#050A1A", 0.14))
  context.fillEllipse(new Rect(-180, 430, 520, 260))
  context.fillEllipse(new Rect(280, 470, 520, 230))
  return context.getImage()
}

function weatherCachePath() {
  const fm = FileManager.local()
  return fm.joinPath(fm.documentsDirectory(), WEATHER_CACHE_NAME)
}

function weatherLocationPath() {
  const fm = FileManager.local()
  return fm.joinPath(fm.documentsDirectory(), WEATHER_LOCATION_NAME)
}

function loadCachedWeather() {
  const fm = FileManager.local()
  const path = weatherCachePath()
  try {
    if (fm.fileExists(path)) return JSON.parse(fm.readString(path))
  } catch (_) {}
  return null
}

function saveCachedWeather(weather) {
  try {
    FileManager.local().writeString(weatherCachePath(), JSON.stringify(weather))
  } catch (_) {}
}

function loadCachedLocation() {
  const fm = FileManager.local()
  const path = weatherLocationPath()
  try {
    if (fm.fileExists(path)) return JSON.parse(fm.readString(path))
  } catch (_) {}
  return null
}

function saveCachedLocation(location) {
  try {
    FileManager.local().writeString(weatherLocationPath(), JSON.stringify(location))
  } catch (_) {}
}

async function cacheCurrentLocation() {
  try {
    Location.setAccuracyToKilometer()
    const location = await Location.current()
    let label = "天气"
    try {
      const places = await Location.reverseGeocode(location.latitude, location.longitude, "zh-CN")
      const place = places && places[0] ? places[0] : {}
      label = place.locality || place.administrativeArea || place.subLocality || label
    } catch (_) {}
    const cached = {
      latitude: Number(location.latitude).toFixed(4),
      longitude: Number(location.longitude).toFixed(4),
      city: label,
      label,
      updatedAt: new Date().toISOString()
    }
    saveCachedLocation(cached)
    return cached
  } catch (_) {
    return null
  }
}

function locationIsFresh(location) {
  if (!location || !location.updatedAt || !location.city) return false
  const updatedAt = new Date(location.updatedAt).getTime()
  if (!Number.isFinite(updatedAt)) return false
  return Date.now() - updatedAt < WEATHER_LOCATION_MAX_AGE_HOURS * 60 * 60 * 1000
}

async function refreshLocationIfNeeded() {
  const cached = loadCachedLocation()
  if (locationIsFresh(cached)) return cached
  return await cacheCurrentLocation() || cached
}

function temperatureText(value) {
  const n = Number(value)
  return Number.isFinite(n) ? `${Math.round(n)}°` : "--°"
}

function humidityText(value) {
  const n = Number(value)
  return Number.isFinite(n) ? `${Math.round(n)}%` : "--%"
}

function timeText(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  const hh = String(date.getHours()).padStart(2, "0")
  const mm = String(date.getMinutes()).padStart(2, "0")
  return `${hh}:${mm}`
}

async function loadWeather() {
  const cached = loadCachedWeather()
  let location = loadCachedLocation()

  // 小组件首次渲染不能等待定位授权，否则容易触发 Scriptable 超时。
  // 位置只在脚本正常打开时获取一次，后续小组件直接读取缓存。
  if (!location && !config.runsInWidget) location = await refreshLocationIfNeeded()
  if (!location) {
    return cached || {
      code: -1,
      isDay: true,
      icon: "🌤️",
      text: "先运行一次脚本",
      locationLabel: "天气",
      temperature: "--°",
      apparent: "--°",
      humidity: "--%",
      updatedAt: ""
    }
  }

  try {
    const url = "https://api.open-meteo.com/v1/forecast"
      + `?latitude=${location.latitude}&longitude=${location.longitude}`
      + "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day"
      + "&timezone=auto"
    const request = new Request(url)
    request.timeoutInterval = 10
    const data = await request.loadJSON()
    if (!data || !data.current) throw new Error("天气接口没有返回当前天气")
    const description = weatherDescription(data.current.weather_code, Number(data.current.is_day) === 1)
    const weather = {
      code: Number(data.current.weather_code),
      isDay: Number(data.current.is_day) === 1,
      icon: description.icon,
      text: description.text,
      locationLabel: location.city || location.label || "天气",
      temperature: temperatureText(data.current.temperature_2m),
      apparent: temperatureText(data.current.apparent_temperature),
      humidity: humidityText(data.current.relative_humidity_2m),
      updatedAt: new Date().toISOString()
    }
    saveCachedWeather(weather)
    return weather
  } catch (_) {
    return cached || {
      code: -1,
      isDay: true,
      icon: "⚠️",
      text: "天气暂不可用",
      locationLabel: location.city || location.label || "天气",
      temperature: "--°",
      apparent: "--°",
      humidity: "--%",
      updatedAt: ""
    }
  }
}

async function widget() {
  const w = new ListWidget()
  const runURL = URLScheme.forRunningScript()
  const weather = await loadWeather()
  try {
    w.backgroundImage = weatherBackgroundImage(weather)
  } catch (_) {
    w.backgroundGradient = weatherGradient(weather)
  }
  w.url = runURL
  w.refreshAfterDate = new Date(Date.now() + WEATHER_REFRESH_MINUTES * 60 * 1000)
  w.setPadding(0, 0, 0, 0)

  const panel = w.addStack()
  panel.layoutVertically()
  panel.backgroundColor = new Color("#06132F", 0.08)
  panel.setPadding(14, 14, 12, 14)
  panel.url = runURL
  panel.addSpacer()

  const header = panel.addStack()
  header.layoutHorizontally()
  const locationLabel = header.addText(weather.locationLabel || "天气")
  locationLabel.textColor = Color.white()
  locationLabel.font = Font.boldSystemFont(16)
  locationLabel.lineLimit = 1
  header.addSpacer()
  const door = header.addText("开门")
  door.textColor = new Color("#72E4AE")
  door.font = Font.boldSystemFont(13)

  panel.addSpacer(5)
  const conditionRow = panel.addStack()
  conditionRow.layoutHorizontally()
  const icon = conditionRow.addText(weather.icon)
  icon.font = Font.systemFont(24)
  conditionRow.addSpacer(5)
  const condition = conditionRow.addText(weather.text)
  condition.textColor = new Color("#EAF4FF")
  condition.font = Font.boldSystemFont(24)
  conditionRow.addSpacer()

  const temperature = panel.addText(weather.temperature)
  temperature.textColor = Color.white()
  temperature.font = Font.boldSystemFont(42)

  panel.addSpacer()
  const footer = panel.addStack()
  footer.layoutHorizontally()
  const feelsLike = footer.addText(`体感 ${weather.apparent}`)
  feelsLike.textColor = new Color("#D4E3FA")
  feelsLike.font = Font.boldSystemFont(12)
  footer.addSpacer(4)
  const humidity = footer.addText(`湿度 ${weather.humidity || "--%"}`)
  humidity.textColor = new Color("#D4E3FA")
  humidity.font = Font.boldSystemFont(12)
  return w
}

if (config.runsInWidget) {
  Script.setWidget(await widget())
  Script.complete()
} else {
  if (!Keychain.contains(KEY)) {
    await alertMessage("还没有配置", "请先运行“联掌门户-配置初始化.js”，初始化完成后再运行本脚本。")
    Script.complete()
  } else {
    const cfg = JSON.parse(Keychain.get(KEY))
    // 正常打开脚本时允许重新定位；小组件后台渲染不执行这一步，避免超时。
    await refreshLocationIfNeeded()
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const msgId = timestamp
    const sign = md5(API_PATH + timestamp + cfg.token)
    const query = `?timestamp=${encodeURIComponent(timestamp)}&openid=${encodeURIComponent(cfg.openid)}&sign=${sign}`
    const req = new Request(API_URL + query)
    req.method = "POST"
    req.headers = {
      "Content-Type": "application/json",
      "Accept": "*/*",
      "Accept-Language": "zh-Hans-CN;q=1, en-CN;q=0.9",
      "User-Agent": cfg.userAgent
    }
    req.body = JSON.stringify({
      body: { ser_num: cfg.ser_num, msg_id: msgId },
      header: cfg.header
    })
    try {
      const response = await req.loadJSON()
      if (Number(response.code) !== 10000) {
        await alertMessage("开门失败", `${response.code || "未知错误"}：${response.message || "接口未返回成功"}`)
      } else {
        const notice = new Notification()
        notice.title = "联掌门户"
        notice.body = "开门成功"
        notice.sound = "complete"
        notice.threadIdentifier = "lianzhang-opendoor"
        // 使用短暂的未来时间，确保 iOS 能投递横幅，但不造成明显等待。
        notice.setTriggerDate(new Date(Date.now() + 500))
        await notice.schedule()
        // 避免脚本立即结束导致已排队的横幅丢失。
        await new Promise(resolve => Timer.schedule(0.8, false, resolve))
      }
    } catch (e) {
      await alertMessage("请求异常", String(e))
    }
    Script.complete()
  }
}
