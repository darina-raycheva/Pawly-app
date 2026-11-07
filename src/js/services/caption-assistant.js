const fallbackCaptions = {
  funny: [
    'Малки лапички, голям характер и още по-голямо приключение!',
    'Когато си толкова сладък, правилата са само препоръки.',
    'Днешната доза пакости е поднесена с много любов.',
  ],
  sweet: [
    'Най-хубавите дни са тези, които споделяме заедно.',
    'Една опашка, две очи и безкрайна обич.',
    'Домът е там, където те посрещат с радост.',
  ],
  emotional: [
    'Благодарни сме за всеки малък момент, превърнат в голям спомен.',
    'Ти си нашето тихо щастие във всеки ден.',
    'Любовта има лапички и остава завинаги в сърцето.',
  ],
}

const endings = {
  funny: [' Какъв герой!', ' И да, пак беше забавно!', ' Този момент заслужава аплодисменти!'],
  sweet: [' Точно такива мигове пазим близо до сърцето.', ' Най-милата ни история.', ' Заедно е най-хубаво.'],
  emotional: [' Такъв момент остава завинаги.', ' Сърцето ни е пълно.', ' Благодарим ти за тази обич.'],
}

/**
 * Stable interface for a future server-side AI provider.
 * The browser deliberately uses local templates until a secured, rate-limited backend exists.
 */
export async function generateCaptionSuggestions({ description = '', tone = 'sweet', petName = '' } = {}) {
  const selectedTone = fallbackCaptions[tone] ? tone : 'sweet'
  const name = petName.trim() || 'нашият любимец'
  const detail = description.trim()
  return fallbackCaptions[selectedTone].map((caption, index) => {
    if (!detail) return `${name}: ${caption}`
    return `${name} — ${detail}. ${caption}${endings[selectedTone][index]}`
  })
}
