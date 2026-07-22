export interface ManagedAudio {
  preload: string;
  currentTime: number;
  onended: HTMLAudioElement['onended'];
  onerror: HTMLAudioElement['onerror'];
  play(): Promise<void>;
  pause(): void;
}

type AudioFactory = (url: string) => ManagedAudio;

export class ExclusiveAudioPlayer {
  private generation = 0;
  private current: ManagedAudio | null = null;

  constructor(private readonly createAudio: AudioFactory) {}

  get isActive(): boolean {
    return this.current !== null;
  }

  stop(): void {
    this.generation += 1;
    const audio = this.current;
    this.current = null;
    if (!audio) return;
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch {
      // Some browsers reject seeking before media metadata is available.
    }
  }

  async play(url: string, onStarted: () => void): Promise<boolean> {
    if (this.current) return false;

    const generation = this.generation + 1;
    this.generation = generation;
    const audio = this.createAudio(url);
    audio.preload = 'auto';
    this.current = audio;

    const release = () => {
      if (this.generation !== generation || this.current !== audio) return;
      audio.onended = null;
      audio.onerror = null;
      this.current = null;
    };
    audio.onended = release;
    audio.onerror = release;

    try {
      await audio.play();
      if (this.generation !== generation || this.current !== audio) {
        audio.pause();
        try {
          audio.currentTime = 0;
        } catch {
          // The stale instance is already detached; there is nothing else to recover.
        }
        return false;
      }
      onStarted();
      return true;
    } catch {
      release();
      return false;
    }
  }
}
