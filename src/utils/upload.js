/**
 * 上传文件到对象存储/后端，返回可公开访问的 URL
 * 依赖环境变量：
 * - VITE_UPLOAD_URL：上传接口地址（默认 /api/upload）
 * - 可选 VITE_UPLOAD_TOKEN：鉴权 token
 */
export async function uploadFile(file) {
  const endpoint = import.meta.env.VITE_UPLOAD_URL || '/api/upload'
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
