import chunk0 from './chunk0.js'
import rest from './rest.js'

let url=''
export function exactAuthBackground(){
  if(url)return url
  const raw=atob(chunk0+rest)
  const bytes=new Uint8Array(raw.length)
  for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i)
  url=URL.createObjectURL(new Blob([bytes],{type:'image/webp'}))
  return url
}
