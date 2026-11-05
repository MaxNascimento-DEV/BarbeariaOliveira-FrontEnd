/** Banco de imagens (Unsplash). Troque pelas fotos reais da barbearia quando tiver. */
export const unsplash = (id: string, w = 1200, h?: number) =>
  `https://images.unsplash.com/${id}?w=${w}${h ? `&h=${h}&fit=crop` : ''}&auto=format&q=70`

export const HERO_IMAGE = 'photo-1585747860715-2ba37e788b70'

export const ABOUT_IMAGES = [
  { id: 'photo-1622286342621-4bd786c2447c', alt: 'Barbeiro finalizando um corte degradê' },
  { id: 'photo-1621605815971-fbc98d665033', alt: 'Ferramentas de barbearia sobre a bancada' },
  { id: 'photo-1593702275687-f8b402bf1fb5', alt: 'Cliente cortando o cabelo com máquina' },
]

export const GALLERY_IMAGES = [
  { id: 'photo-1599351431202-1e0f0137899a', alt: 'Degradê com risco lateral desenhado' },
  { id: 'photo-1567894340315-735d7c361db0', alt: 'Corte texturizado com máquina' },
  { id: 'photo-1532710093739-9470acff878f', alt: 'Barba sendo alinhada com navalha' },
  { id: 'photo-1605497788044-5a32c7078486', alt: 'Acabamento na nuca com máquina' },
  { id: 'photo-1521490683712-35a1cb235d1c', alt: 'Corte social clássico' },
  { id: 'photo-1503951914875-452162b0f3f1', alt: 'Barba na toalha quente' },
]
