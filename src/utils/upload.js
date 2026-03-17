/**
 * 上传文件到后端解析/存储接口
 * 需要在 .env 配置 VITE_UPLOAD_URL（必填）、VITE_UPLOAD_TOKEN（可选）
 * 返回 { url }
 */
export async function uploadFile(file) {
  const endpoint = import.meta.env.VITE_UPLOAD_URL
  if (!endpoint) throw new Error('未配置 VITE_UPLOAD_URL')
  const token = import.meta.env.VITE_UPLOAD_TOKEN

  const form = new FormData()
  form.append('file', file)

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || body.error || `上传失败(${res.status})`)
  }

  const data = await res.json()
  if (!data.url) throw new Error('上传返回缺少 url')
  return { url: data.url }
}

export function summarizeFailedAttachments(list = []) {
  if (!list.length) return ''
  return `以下附件上传失败：${list.map(i => i.name).join('、')}`
}
