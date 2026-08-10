import { describe, expect, it, vi } from 'vitest';
import { ExclusiveAudioPlayer, type ManagedAudio } from './exclusiveAudioPlayer';

class FakeAudio implements ManagedAudio {
  preload = '';
  currentTime = 12;
  onended: HTMLAudioElement['onended'] = null;
  onerror: HTMLAudioElement['onerror'] = null;
  pause = vi.fn();
  private resolvePlay: (() => void) | null = null;

  play(): Promise<void> {
    return new Promise((resolve) => {
      this.resolvePlay = resolve;
    });
  }

  start(): void {
    this.resolvePlay?.();
  }
}

describe('ExclusiveAudioPlayer', () => {
  it('invalidates a pending playback before starting the next question audio', async () => {
    const audioByUrl = new Map<string, FakeAudio>();
    const player = new ExclusiveAudioPlayer((url) => {
      const audio = new FakeAudio();
      audioByUrl.set(url, audio);
      return audio;
    });
    const firstStarted = vi.fn();
    const secondStarted = vi.fn();

    const firstPlay = player.play('question-1.wav', firstStarted);
    player.stop();
    const secondPlay = player.play('questions-11-15.wav', secondStarted);
    audioByUrl.get('question-1.wav')?.start();
    audioByUrl.get('questions-11-15.wav')?.start();

    await expect(firstPlay).resolves.toBe(false);
    await expect(secondPlay).resolves.toBe(true);
    expect(firstStarted).not.toHaveBeenCalled();
    expect(secondStarted).toHaveBeenCalledOnce();
    expect(audioByUrl.get('question-1.wav')?.pause).toHaveBeenCalled();
    expect(audioByUrl.get('question-1.wav')?.currentTime).toBe(0);
  });

  it('keeps a stopped audio invalid after leaving the exam', async () => {
    const audio = new FakeAudio();
    const player = new ExclusiveAudioPlayer(() => audio);
    const started = vi.fn();

    const pendingPlay = player.play('question-7.wav', started);
    player.stop();
    audio.start();

    await expect(pendingPlay).resolves.toBe(false);
    expect(started).not.toHaveBeenCalled();
    expect(audio.pause).toHaveBeenCalled();
    expect(player.isActive).toBe(false);
  });

  it('does not create a second audio while the current one is active', async () => {
    const audios: FakeAudio[] = [];
    const player = new ExclusiveAudioPlayer(() => {
      const audio = new FakeAudio();
      audios.push(audio);
      return audio;
    });

    const firstPlay = player.play('question-7.wav', vi.fn());
    await expect(player.play('questions-11-15.wav', vi.fn())).resolves.toBe(false);
    expect(audios).toHaveLength(1);
    player.stop();
    audios[0].start();
    await expect(firstPlay).resolves.toBe(false);
  });
});
