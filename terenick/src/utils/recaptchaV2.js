const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
const scriptId = 'google-recaptcha-v2'

function waitForRecaptcha() {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now()
    const intervalId = window.setInterval(() => {
      if (window.grecaptcha?.render) {
        window.clearInterval(intervalId)
        resolve()
        return
      }

      if (Date.now() - startedAt > 10000) {
        window.clearInterval(intervalId)
        reject(new Error('reCAPTCHA ne répond pas'))
      }
    }, 100)
  })
}

function loadRecaptchaScript() {
  if (!siteKey) {
    return Promise.reject(new Error('VITE_RECAPTCHA_SITE_KEY manquant'))
  }

  if (window.grecaptcha?.render) {
    return Promise.resolve()
  }

  const existingScript = document.getElementById(scriptId)
  if (existingScript) {
    return new Promise((resolve, reject) => {
      if (window.grecaptcha?.render) {
        resolve()
        return
      }

      existingScript.addEventListener('load', () => waitForRecaptcha().then(resolve).catch(reject), {
        once: true,
      })
      existingScript.addEventListener('error', () => reject(new Error('reCAPTCHA indisponible')), {
        once: true,
      })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = scriptId
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit&hl=fr'
    script.async = true
    script.defer = true
    script.onload = () => waitForRecaptcha().then(resolve).catch(reject)
    script.onerror = () => reject(new Error('reCAPTCHA indisponible'))
    document.head.appendChild(script)
  })
}

export async function renderRecaptchaV2(container, callbacks = {}) {
  await loadRecaptchaScript()

  if (!container) {
    throw new Error('Conteneur reCAPTCHA introuvable')
  }

  if (container.dataset.widgetId) {
    return Number(container.dataset.widgetId)
  }

  let widgetId

  try {
    widgetId = window.grecaptcha.render(container, {
      sitekey: siteKey,
      theme: 'light',
      callback: callbacks.onResolved,
      'expired-callback': callbacks.onExpired,
      'error-callback': callbacks.onError,
    })
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Rendu reCAPTCHA impossible',
    )
  }

  container.dataset.widgetId = String(widgetId)
  return widgetId
}

export function getRecaptchaV2Response(widgetId) {
  if (widgetId === null || widgetId === undefined || !window.grecaptcha) {
    return ''
  }

  return window.grecaptcha.getResponse(widgetId)
}

export function resetRecaptchaV2(widgetId) {
  if (widgetId !== null && widgetId !== undefined && window.grecaptcha) {
    window.grecaptcha.reset(widgetId)
  }
}

export function isRecaptchaConfigured() {
  return Boolean(siteKey)
}
