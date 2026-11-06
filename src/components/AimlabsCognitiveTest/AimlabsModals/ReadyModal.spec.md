# ReadyModal

The initial rules modal (`status === "ready"`): explains the CPT/SART go/no-go mapping for the upcoming round and the one after it, before the player presses Play.

**Props**: `currentRound`, `onStartGame`, `onExit`, plus the shared `ScreenTransitionProps` (`mounted`, `isFadingOut`, `handleAction`).

Shows two side-by-side round cards whose go/no-go stimulus mapping flips depending on `currentRound` (1 = CPT first, 2 = SART first). Includes the [[../../common/AccessibilityMenu|AccessibilityMenu]] for color-vision filters.
