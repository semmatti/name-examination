import { Route } from '~/enums/routes'
import { useExamination } from '.'

/** Handles the focusing of elements in the Examine page */
export const useExaminationFocus = defineStore('examine-focus', () => {
  /** Array of element ids */
  const elements = ref<Array<string>>([])
  const focused = ref(-1)
  const examine = useExamination()

  function getCurrentRoute() {
    return useRoute().path.toString().toLowerCase()
  }

  /** Register an element to be a part of the focus cycle.
   */
  function register(index: number, elementId: string) {
    if (!elements.value.includes(elementId))
      elements.value.splice(index, 0, elementId)
  }

  /** Handle an incoming `KeyboardEvent`.
   * Will focus the proper element in the focus cycle when the `Tab` key is pressed.
   */
  function handleKeyPress(event: KeyboardEvent) {
    const route = getCurrentRoute()
    if (route !== Route.Examine || event.code !== 'Tab' || examine.isEditing)
      return

    if (event.type === 'keyup') {
      focused.value = (focused.value + 1) % elements.value.length
      document.getElementById(elements.value[focused.value])?.focus()
    } else if (event.type === 'keydown') {
      event.preventDefault()
    }
  }

  document.addEventListener('keyup', handleKeyPress)
  document.addEventListener('keydown', handleKeyPress)

  return { register, handleKeyPress }
})
