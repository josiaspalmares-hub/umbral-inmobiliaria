// Proyecto de muestra: abre WhatsApp con el mensaje listo pero sin número, así no le llega a nadie por error
export function abrirMensaje(texto: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank', 'noopener')
}
