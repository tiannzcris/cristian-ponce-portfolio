/** Configure a separate, approved public-use track here when one is available. */
const publicTrack: string | null = null

// This private local test file is never enabled in a production bundle.
export const backgroundMusic: { src: string | null } = {
  src: import.meta.env.DEV ? '/audio/background.mp3' : publicTrack,
}
