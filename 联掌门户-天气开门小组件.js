// 联掌门户一键开门（Scriptable）
// 发布版本：v2.2.2 | 配置格式：lianzhang.opendoor.config.v2（兼容 v1）
// 首次使用：先运行“联掌门户-配置初始化.js”，再运行本脚本。
// 配置写入 Scriptable Keychain；不要把初始化脚本分享给别人。

const KEY = "lianzhang.opendoor.config.v2"
const API_PATH = "/api/v1/opendoor/openDoorControl"
// 抓包确认联掌门户开门接口使用 6025 端口；省略端口会连到错误证书。
const API_URL = "https://lzmh.lz-qs.com:6025/lzmh_app_api" + API_PATH
const WEATHER_CACHE_NAME = "联掌门户-天气缓存.json"
const WEATHER_LOCATION_NAME = "联掌门户-天气位置.json"
const WEATHER_REFRESH_MINUTES = 30
const WEATHER_LOCATION_MAX_AGE_HOURS = 6
const WEATHER_LOCATION_SCHEMA = 2

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

async function showSuccessToastAndClose() {
  // 系统横幅受 iOS 通知设置和前台状态影响；用自动关闭的轻提示作为可见兜底。
  const web = new WebView()
  await web.loadHTML(`
    <html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
      <body style="margin:0;background:transparent;font-family:-apple-system;text-align:center;">
        <div style="margin:22px auto;padding:18px 24px;width:170px;border-radius:20px;background:rgba(20,166,106,.96);color:white;box-shadow:0 8px 30px rgba(0,0,0,.3);">
          <div style="font-size:34px;line-height:40px;">✓</div>
          <div style="font-size:18px;font-weight:700;">开门成功</div>
        </div>
      </body>
    </html>`, null)
  const presented = web.present(false)
  try {
    // Scriptable 没有可靠的 setTimeout，使用 Timer 保持提示自动关闭。
    await new Promise(resolve => Timer.schedule(0.6, false, resolve))
    if (typeof App !== "undefined" && typeof App.close === "function") App.close()
  } catch (_) {}
  try { await presented } catch (_) {}
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
  } else if (code === 3) {
    colors = ["#68717D", "#8D959E", "#B1B6BC"]
  } else if ([1, 2, 51, 53, 55, 56, 57].includes(code)) {
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
  } else if (!isNight && code === 3) {
    top = "#68717D"
    bottom = "#A8ADB3"
  } else if (!isNight && [1, 2, 51, 53, 55, 56, 57].includes(code)) {
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
      // 中国地址优先取市级行政区，避免把“滨湖区”显示成城市。
      label = place.subAdministrativeArea || place.locality || place.administrativeArea || place.subLocality || label
    } catch (_) {}
    const cached = {
      latitude: Number(location.latitude).toFixed(4),
      longitude: Number(location.longitude).toFixed(4),
      city: label,
      label,
      schema: WEATHER_LOCATION_SCHEMA,
      updatedAt: new Date().toISOString()
    }
    saveCachedLocation(cached)
    return cached
  } catch (_) {
    return null
  }
}

function locationIsFresh(location) {
  if (!location || location.schema !== WEATHER_LOCATION_SCHEMA || !location.updatedAt || !location.city) return false
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

function todayRange(weather) {
  const today = weather && Array.isArray(weather.forecast) ? weather.forecast[0] : null
  return `最高 ${(today && today.max) || "--°"} 最低 ${(today && today.min) || "--°"}`
}

function forecastDayLabel(iso, index) {
  if (index === 0) return "今天"
  const date = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(date.getTime())) return `第${index + 1}天`
  return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()]
}

function deviceFontScale() {
  // 同一组件类型在不同 iPhone 上的可用空间不同；字体只做温和缩放，避免破坏苹果式布局。
  try {
    if (typeof Device !== "undefined" && typeof Device.screenSize === "function") {
      const width = Number(Device.screenSize().width)
      if (Number.isFinite(width) && width > 0) return Math.max(0.9, Math.min(1.08, width / 390))
    }
  } catch (_) {}
  return 1
}

function adaptiveFont(size, bold = false) {
  const scaled = Math.round(size * deviceFontScale() * 10) / 10
  return bold ? Font.boldSystemFont(scaled) : Font.systemFont(scaled)
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
      forecast: [],
      updatedAt: ""
    }
  }

  try {
    const url = "https://api.open-meteo.com/v1/forecast"
      + `?latitude=${location.latitude}&longitude=${location.longitude}`
      + "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day"
      + "&daily=weather_code,temperature_2m_max,temperature_2m_min"
      + "&forecast_days=7"
      + "&timezone=auto"
    const request = new Request(url)
    request.timeoutInterval = 10
    const data = await request.loadJSON()
    if (!data || !data.current) throw new Error("天气接口没有返回当前天气")
    const description = weatherDescription(data.current.weather_code, Number(data.current.is_day) === 1)
    const daily = data.daily && Array.isArray(data.daily.time) && Array.isArray(data.daily.weather_code)
      ? data.daily.time.map((date, index) => {
          const dailyDescription = weatherDescription(data.daily.weather_code[index], true)
          return {
            label: forecastDayLabel(date, index),
            icon: dailyDescription.icon,
            text: dailyDescription.text,
            min: temperatureText(data.daily.temperature_2m_min[index]),
            max: temperatureText(data.daily.temperature_2m_max[index])
          }
        })
      : []
    const weather = {
      code: Number(data.current.weather_code),
      isDay: Number(data.current.is_day) === 1,
      icon: description.icon,
      text: description.text,
      locationLabel: location.city || location.label || "天气",
      temperature: temperatureText(data.current.temperature_2m),
      apparent: temperatureText(data.current.apparent_temperature),
      humidity: humidityText(data.current.relative_humidity_2m),
      forecast: daily,
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
      forecast: [],
      updatedAt: ""
    }
  }
}

function styleWidgetText(text, font, color = Color.white(), minScale = 0.65) {
  text.font = font
  text.textColor = color
  text.lineLimit = 1
  text.minimumScaleFactor = minScale
  return text
}

function addForecastList(panel, forecast) {
  const items = (forecast || []).slice(0, 7)
  if (items.length === 0) {
    styleWidgetText(panel.addText("多日预报暂不可用"), adaptiveFont(12), new Color("#D4E3FA"), 0.55)
    return
  }
  const list = panel.addStack()
  list.layoutVertically()
  items.forEach((day, index) => {
    const row = list.addStack()
    row.layoutHorizontally()
    styleWidgetText(row.addText(day.label), adaptiveFont(13, true), Color.white(), 0.55)
    row.addSpacer(8)
    const icon = row.addText(day.icon)
    icon.font = adaptiveFont(17)
    row.addSpacer(5)
    styleWidgetText(row.addText(day.text), adaptiveFont(13), new Color("#EAF4FF"), 0.55)
    row.addSpacer()
    styleWidgetText(row.addText(`${day.min} / ${day.max}`), adaptiveFont(13, true), Color.white(), 0.55)
    if (index < items.length - 1) list.addSpacer(3)
  })
}

function accessoryWidget(family, weather, runURL) {
  const w = new ListWidget()
  // 锁屏组件使用系统自适应背景，避免彩色背景在锁屏的 vibrant/tinted 模式下变脏。
  w.addAccessoryWidgetBackground = true
  w.refreshAfterDate = new Date(Date.now() + WEATHER_REFRESH_MINUTES * 60 * 1000)
  w.url = runURL

  if (family === "accessoryInline") {
    const text = w.addText(`${weather.locationLabel || "天气"} ${weather.temperature} ${weather.text}`)
    styleWidgetText(text, adaptiveFont(12), Color.white(), 0.55)
    return w
  }

  if (family === "accessoryCircular") {
    w.setPadding(0, 0, 0, 0)
    const stack = w.addStack()
    stack.layoutVertically()
    stack.centerAlignContent()
    const icon = stack.addText(weather.icon)
    icon.centerAlignText()
    icon.font = adaptiveFont(15)
    const temperature = stack.addText(weather.temperature)
    styleWidgetText(temperature, adaptiveFont(16, true), Color.white(), 0.6)
    temperature.centerAlignText()
    return w
  }

  // accessoryRectangular：优先保证城市、温度和天气状态完整，底部信息可缩小但不换行。
  w.setPadding(3, 5, 3, 5)
  const panel = w.addStack()
  panel.layoutVertically()
  const header = panel.addStack()
  header.layoutHorizontally()
  styleWidgetText(header.addText(weather.locationLabel || "天气"), adaptiveFont(11, true), Color.white(), 0.55)
  header.addSpacer(4)
  styleWidgetText(header.addText("开门"), adaptiveFont(10, true), new Color("#72E4AE"), 0.6)
  const row = panel.addStack()
  row.layoutHorizontally()
  const icon = row.addText(weather.icon)
  icon.font = adaptiveFont(14)
  row.addSpacer(3)
  styleWidgetText(row.addText(`${weather.temperature} ${weather.text}`), adaptiveFont(14, true), Color.white(), 0.55)
  panel.addSpacer(1)
  styleWidgetText(panel.addText(`体感 ${weather.apparent} · 湿度 ${weather.humidity}`), adaptiveFont(9), new Color("#D4E3FA"), 0.5)
  return w
}

async function widget() {
  const family = config.widgetFamily || "systemMedium"
  const runURL = URLScheme.forRunningScript()
  const weather = await loadWeather()
  const accessoryFamilies = ["accessoryInline", "accessoryCircular", "accessoryRectangular"]
  if (accessoryFamilies.includes(family)) return accessoryWidget(family, weather, runURL)

  const w = new ListWidget()
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
  panel.url = runURL

  if (family === "systemSmall") {
    panel.setPadding(10, 11, 9, 11)
    panel.addSpacer()
    const header = panel.addStack()
    header.layoutHorizontally()
    // 最小组件严格沿用上一版已验证的字号与纵向位置：14 / 11 / 20 / 18 / 36。
    styleWidgetText(header.addText(weather.locationLabel || "天气"), adaptiveFont(14, true), Color.white(), 0.55)
    header.addSpacer(3)
    styleWidgetText(header.addText("开门"), adaptiveFont(11, true), new Color("#72E4AE"), 0.6)
    panel.addSpacer(3)
    const condition = panel.addStack()
    condition.layoutHorizontally()
    const icon = condition.addText(weather.icon)
    icon.font = adaptiveFont(20)
    condition.addSpacer(3)
    styleWidgetText(condition.addText(weather.text), adaptiveFont(18, true), new Color("#EAF4FF"), 0.55)
    styleWidgetText(panel.addText(weather.temperature), adaptiveFont(36, true), Color.white(), 0.55)
    panel.addSpacer(2)
    const stats = panel.addStack()
    stats.layoutHorizontally()
    styleWidgetText(stats.addText(`体感 ${weather.apparent}`), adaptiveFont(11, true), new Color("#D4E3FA"), 0.6)
    stats.addSpacer(5)
    styleWidgetText(stats.addText(`湿度 ${weather.humidity}`), adaptiveFont(11, true), new Color("#D4E3FA"), 0.6)
    panel.addSpacer()
    const range = styleWidgetText(panel.addText(todayRange(weather)), adaptiveFont(11, true), new Color("#D4E3FA"), 0.6)
    range.centerAlignText()
    return w
  }

  if (family === "systemLarge") {
    panel.setPadding(18, 18, 16, 18)
    panel.addSpacer()
    const header = panel.addStack()
    header.layoutHorizontally()
    styleWidgetText(header.addText(weather.locationLabel || "天气"), adaptiveFont(20, true), Color.white(), 0.55)
    header.addSpacer()
    styleWidgetText(header.addText("开门"), adaptiveFont(16, true), new Color("#72E4AE"), 0.6)
    panel.addSpacer(8)
    const row = panel.addStack()
    row.layoutHorizontally()
    const icon = row.addText(weather.icon)
    icon.font = adaptiveFont(32)
    row.addSpacer(7)
    styleWidgetText(row.addText(weather.text), adaptiveFont(28, true), new Color("#EAF4FF"), 0.55)
    const temperature = panel.addText(weather.temperature)
    styleWidgetText(temperature, adaptiveFont(58, true), Color.white(), 0.55)
    styleWidgetText(panel.addText(todayRange(weather)), adaptiveFont(14, true), new Color("#D4E3FA"), 0.55)
    panel.addSpacer(7)
    const footer = panel.addStack()
    footer.layoutHorizontally()
    styleWidgetText(footer.addText(`体感 ${weather.apparent}`), adaptiveFont(16, true), new Color("#D4E3FA"), 0.55)
    footer.addSpacer(8)
    styleWidgetText(footer.addText(`湿度 ${weather.humidity}`), adaptiveFont(16, true), new Color("#D4E3FA"), 0.55)
    panel.addSpacer(7)
    addForecastList(panel, weather.forecast)
    return w
  }

  // systemMedium：参考苹果原生当前天气卡片，不塞入三日预报，保证留白和可读性。
  panel.setPadding(11, 11, 10, 11)
  panel.addSpacer()
  const header = panel.addStack()
  header.layoutHorizontally()
  styleWidgetText(header.addText(weather.locationLabel || "天气"), adaptiveFont(13, true), Color.white(), 0.55)
  header.addSpacer()
  styleWidgetText(header.addText("开门"), adaptiveFont(11, true), new Color("#72E4AE"), 0.6)
  panel.addSpacer(2)
  const body = panel.addStack()
  body.layoutHorizontally()
  const current = body.addStack()
  current.layoutVertically()
  styleWidgetText(current.addText(weather.temperature), adaptiveFont(46, true), Color.white(), 0.55)
  current.addSpacer(3)
  const condition = current.addStack()
  condition.layoutHorizontally()
  const icon = condition.addText(weather.icon)
  icon.font = adaptiveFont(22)
  condition.addSpacer(4)
  styleWidgetText(condition.addText(weather.text), adaptiveFont(23, true), new Color("#EAF4FF"), 0.55)
  body.addSpacer()
  const stats = body.addStack()
  stats.layoutVertically()
  styleWidgetText(stats.addText("体感"), adaptiveFont(11, true), new Color("#D4E3FA"), 0.55)
  styleWidgetText(stats.addText(weather.apparent), adaptiveFont(22, true), Color.white(), 0.55)
  stats.addSpacer(3)
  styleWidgetText(stats.addText("湿度"), adaptiveFont(11, true), new Color("#D4E3FA"), 0.55)
  styleWidgetText(stats.addText(weather.humidity), adaptiveFont(22, true), Color.white(), 0.55)
  panel.addSpacer()
  styleWidgetText(panel.addText(todayRange(weather)), adaptiveFont(14, true), new Color("#D4E3FA"), 0.55)
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
    // 联掌门户 6025 端口当前返回的证书链不完整，iOS/Scriptable 会拒绝握手。
    // 仅对固定的联掌接口启用兼容模式；不要将此选项用于不受信任的地址。
    req.allowInsecureRequest = true
    req.timeoutInterval = 30
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
        const code = String(response.code || "")
        const message = code === "-10001"
          ? "登录状态已过期，请重新运行账号配置管理脚本"
          : (response.message || "接口未返回成功")
        await alertMessage("开门失败", `${response.code || "未知错误"}：${message}`)
      } else {
        const notice = new Notification()
        notice.title = "联掌门户"
        notice.body = "开门成功"
        notice.sound = "complete"
        notice.threadIdentifier = "lianzhang-opendoor"
        // 采用已验证版本的通知时序：500ms 后触发，减少体感延迟。
        notice.setTriggerDate(new Date(Date.now() + 500))
        await notice.schedule()
        // 先让 iOS 投递横幅，再打开兜底提示，避免 WebView 抢占横幅显示时机。
        await new Promise(resolve => Timer.schedule(0.8, false, resolve))
        await showSuccessToastAndClose()
      }
    } catch (e) {
      await alertMessage("请求异常", String(e))
    }
    Script.complete()
  }
}
