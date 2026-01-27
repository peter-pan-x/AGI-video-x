import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize, FileVideo, Keyboard } from 'lucide-react';
import './index.css';

const App: React.FC = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [hideControlsTimer, setHideControlsTimer] = useState<number | null>(null);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const toastTimerRef = useRef<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      triggerToast('文件已加载');
    }
  };

  const handleError = () => {
    triggerToast('不支持此视频格式或文件损坏');
    setVideoSrc(null);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
      setProgress((current / videoRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      triggerToast(seconds > 0 ? `+${seconds}s` : `${seconds}s`);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setShowToast(false), 800);
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const toggleFullscreen = () => {
    const elem = document.querySelector('.player-container');
    if (elem) {
      if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoSrc) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(prev => Math.min(prev + 0.1, 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(prev => Math.max(prev - 0.1, 0));
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoSrc, isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer) clearTimeout(hideControlsTimer);
    const timer = window.setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
    setHideControlsTimer(timer);
  };

  return (
    <div
      className={`player-container ${showControls ? 'show-controls' : ''}`}
      onMouseMove={handleMouseMove}
    >
      {!videoSrc ? (
        <div className="empty-state">
          <FileVideo size={80} color="#a0a0a0" strokeWidth={1} />
          <h1>ANTIGRAVITY PLAYER</h1>
          <p style={{ color: '#a0a0a0', marginBottom: '1rem' }}>Sleek. Fast. Minimalist.</p>
          <label className="file-input-label">
            选择视频文件
            <input type="file" accept="video/*" hidden onChange={handleFileChange} />
          </label>
          <div className="author-name">开发者：AGI彼得潘</div>
        </div>
      ) : (
        <>
          <div className="video-wrapper">
            <video
              ref={videoRef}
              src={videoSrc}
              onClick={togglePlay}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={handleError}
            />
            <div className={`toast ${showToast ? 'show' : ''}`}>{toastMsg}</div>
          </div>

          <div className="shortcut-tips">
            <Keyboard size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Space 暂停 | Arrows 快进/退 | F 全屏
          </div>

          <div className="controls-overlay">
            <div className="progress-container" onClick={handleSeek}>
              <div
                className="progress-bar"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="main-controls">
              <button className="control-btn" onClick={togglePlay}>
                {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
              </button>

              <button className="control-btn" onClick={() => skip(-5)}>
                <RotateCcw size={20} />
              </button>

              <button className="control-btn" onClick={() => skip(5)}>
                <RotateCw size={20} />
              </button>

              <div className="time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              <div className="volume-container">
                <button className="control-btn" onClick={() => setIsMuted(!isMuted)}>
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  className="volume-slider"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                />
              </div>

              <button className="control-btn" onClick={toggleFullscreen}>
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
