export function selectRandomOption<T>(options: readonly T[], random: () => number = Math.random): T {
  if (options.length < 1) throw new Error('Se necesita al menos una opción')
  const index = Math.min(Math.floor(random() * options.length), options.length - 1)
  return options[index]
}

export function targetRotation(optionIndex: number, optionCount: number, currentRotation = 0): number {
  const segment = 360 / optionCount
  const targetNormalized = 360 - (optionIndex * segment + segment / 2)
  const currentNormalized = ((currentRotation % 360) + 360) % 360
  const delta = (targetNormalized - currentNormalized + 360) % 360
  return currentRotation + 360 * 6 + delta
}
