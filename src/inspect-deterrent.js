let hideTimer

function ensureToast(){
  let toast=document.querySelector('.mejora-prohibited-toast')
  if(toast)return toast
  toast=document.createElement('div')
  toast.className='mejora-prohibited-toast'
  toast.setAttribute('role','status')
  toast.setAttribute('aria-live','polite')
  toast.innerHTML='<div class="mejora-prohibited-icon">!</div><div><strong>Action prohibited</strong><span>Inspect and Developer Tools shortcuts are disabled in Mejora.</span></div>'
  document.body.appendChild(toast)
  return toast
}

function prohibited(){
  const toast=ensureToast()
  toast.classList.remove('show')
  void toast.offsetWidth
  toast.classList.add('show')
  clearTimeout(hideTimer)
  hideTimer=setTimeout(()=>toast.classList.remove('show'),2400)
}

export function initInspectDeterrent(){
  document.addEventListener('keydown',event=>{
    const key=String(event.key||'').toLowerCase()
    const ctrlShift=event.ctrlKey&&event.shiftKey
    const cmdAlt=event.metaKey&&event.altKey
    const blocked=event.key==='F12'||(ctrlShift&&['i','j','c'].includes(key))||(cmdAlt&&['i','j','c'].includes(key))||((event.ctrlKey||event.metaKey)&&key==='u')
    if(!blocked)return
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();prohibited()
  },true)
  document.addEventListener('contextmenu',event=>{event.preventDefault();prohibited()},true)
}
