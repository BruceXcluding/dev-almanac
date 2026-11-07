export type BandMode = 'card' | 'open' | 'gone'
/** Today's slip; `count` is how many times it has been shaken today. */
export type DrawnSlip = { date: string; number: number; count?: number }

declare module 'claude-code' {
  interface PluginState {
    'dev-almanac': {
      /** The card above the prompt: one line, expanded, or gone after the first prompt. */
      band: BandMode
      /** The sign the pane shows when the person browses away from their own. */
      shownSign: number | null
      /** Today's slip once drawn (mirrors $.store, so drawings redraw). */
      slip: Shaped<DrawnSlip | null>
      /** The language picked in the UI (mirrors $.store); null: the setting's. */
      lang: 'zh' | 'en' | null
      /** The card's ticker: which segment it shows. */
      tick: number
      /** The pane's draw animation: the frame, or 0 when still. */
      shake: number
      /** The tube is shaking (the drawn surfaces read only this, so they are not redrawn every frame). */
      isShaking: boolean
      /** The 宜/忌 lists show every line, not just the first five. */
      isActivitiesOpen: boolean
      /** The birthday set in the UI (mirrors $.store); null: the setting's. */
      birthday: string | null
      /** A real prompt has been sent this session: the card's ticker holds still. */
      hasPrompted: boolean
      /** The card is turned off in every session (mirrors $.store 'cardOff'). */
      isCardOff: boolean
      /** The pane's birthday field is open for editing. */
      isEditingBirthday: boolean
      /** The pane's entrance: the terminal's frame, or 0 when still. */
      intro: number
      /** Counts entrances, so the drawn motion replays on each. */
      introRun: number
    }
  }
}
