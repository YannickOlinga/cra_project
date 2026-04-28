const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
const scriptId = 'google-recaptcha-v2'

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
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('reCAPTCHA indisponible')), {
        once: true,
      })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = scriptId
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
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

  const widgetId = window.grecaptcha.render(container, {
    sitekey: siteKey,
    theme: 'light',
    callback: callbacks.onResolved,
    'expired-callback': callbacks.onExpired,
    'error-callback': callbacks.onError,
  })

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
