export function resolveVueState(vm){
  const candidates=[
    vm?.$?.setupState,
    document.querySelector('#app')?.firstElementChild?.__vueParentComponent?.setupState,
    document.querySelector('#app')?.__vue_app__?._instance?.setupState
  ]
  return candidates.find(Boolean)||null
}

export function readState(state,key){
  const value=state?.[key]
  return value&&value.__v_isRef?value.value:value
}

export function writeState(state,key,value){
  if(!state)return
  const current=state[key]
  if(current&&current.__v_isRef)current.value=value
  else state[key]=value
}

export function cloneStateValue(value){
  try{return JSON.parse(JSON.stringify(value))}catch{return value}
}
