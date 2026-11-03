import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Eye,
  Trophy,
  LayoutGrid,
  Zap,
  Target,
  Shuffle,
  Flame,
  Plus,
  Minus,
  Crown,
  Award
} from 'lucide-react';
import { PHILOSOPHY_QUESTIONS } from './data/questions';
import { sounds } from './utils/audio';

const CONFETTI_COLORS = [
  '#ff6b00',
  '#ff8c33',
  '#ffa502',
  '#00e676',
  '#ffffff',
  '#ffd166',
  '#00e5ff'
];

// 8 groups in exact order 1, 2, 3, 4, 5, 6, 8, 9 (skipping 7)
const INITIAL_TEAMS = [
  { id: 1, name: 'Nhóm 1', score: 0 },
  { id: 2, name: 'Nhóm 2', score: 0 },
  { id: 3, name: 'Nhóm 3', score: 0 },
  { id: 4, name: 'Nhóm 4', score: 0 },
  { id: 5, name: 'Nhóm 5', score: 0 },
  { id: 6, name: 'Nhóm 6', score: 0 },
  { id: 8, name: 'Nhóm 8', score: 0 },
  { id: 9, name: 'Nhóm 9', score: 0 }
];

function App() {
  // Questions state
  const [questions, setQuestions] = useState(() =>
    PHILOSOPHY_QUESTIONS.map(q => {
      const cleanScramble = q.scramble.replace(/[-]/g, ' ').trim().replace(/\s+/g, ' ');
      const tokens = cleanScramble.split(/\s+/);
      const isCharList = tokens.length > 1 && tokens.every(t => t.length === 1);
      const scrambleWords = isCharList ? [tokens.join('')] : tokens;

      return {
        ...q,
        targetWords: q.answer.trim().split(/\s+/),
        scrambleWords,
        isCompleted: false
      };
    })
  );

  // Teams Leaderboard State
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  // Track which team was awarded points for which question { [questionId]: teamId }
  const [awardedTeams, setAwardedTeams] = useState({});

  const [currentView, setCurrentView] = useState('menu'); // 'menu' | 'question'
  const [currentIndex, setCurrentIndex] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showVictory, setShowVictory] = useState(false);

  const canvasRef = useRef(null);
  const confettiParticles = useRef([]);
  const animFrameId = useRef(null);

  // Confetti system
  const launchConfetti = useCallback((count = 50) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i = 0; i < count; i++) {
      confettiParticles.current.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 360,
        y: canvas.height * 0.42 + (Math.random() - 0.5) * 140,
        vx: (Math.random() - 0.5) * 16,
        vy: Math.random() * -14 - 4,
        size: Math.random() * 8 + 4,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        life: 1.0,
        decay: Math.random() * 0.015 + 0.011
      });
    }

    if (!animFrameId.current) {
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = confettiParticles.current.length - 1; i >= 0; i--) {
          const p = confettiParticles.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.35;
          p.rotation += p.rotSpeed;
          p.life -= p.decay;

          if (p.life <= 0 || p.y > canvas.height) {
            confettiParticles.current.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }

        if (confettiParticles.current.length > 0) {
          animFrameId.current = requestAnimationFrame(animate);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          animFrameId.current = null;
        }
      };
      animFrameId.current = requestAnimationFrame(animate);
    }
  }, []);

  // Handle window resize for confetti canvas
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const completedCount = questions.filter(q => q.isCompleted).length;
  const progressPercent = Math.round((completedCount / questions.length) * 100);
  const currentQuestion = currentIndex !== null ? questions[currentIndex] : null;

  // Sound toggle
  const toggleSound = () => {
    const newState = sounds.toggle();
    setSoundEnabled(newState);
  };

  // Switch to Menu
  const goToMenu = () => {
    sounds.playTileRemove();
    setCurrentView('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open a question
  const openQuestion = (index) => {
    if (questions[index].isCompleted) return;
    sounds.playTileSelect();
    setCurrentIndex(index);
    setCurrentView('question');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset all questions & game
  const resetAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại tất cả 10 câu hỏi để chơi lại từ đầu không?')) {
      setQuestions(prev => prev.map(q => ({ ...q, isCompleted: false })));
      setCurrentIndex(null);
      setShowVictory(false);
      sounds.playShuffle();
      setCurrentView('menu');
    }
  };

  // Reset Leaderboard points
  const resetLeaderboard = () => {
    if (window.confirm('Bạn có muốn đặt lại điểm của tất cả các nhóm về 0 không?')) {
      setTeams(INITIAL_TEAMS);
      setAwardedTeams({});
      sounds.playShuffle();
    }
  };

  // Adjust score for a team
  const adjustTeamScore = (teamId, delta) => {
    setTeams(prev =>
      prev.map(team =>
        team.id === teamId
          ? { ...team, score: Math.max(0, team.score + delta) }
          : team
      )
    );
    if (delta > 0) {
      sounds.playHint();
    } else {
      sounds.playTileRemove();
    }
  };

  // Award points to a team for current question
  const awardPointForQuestion = (teamId) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    const prevAwarded = awardedTeams[qId];

    // If already awarded to this same team, do nothing
    if (prevAwarded === teamId) return;

    // If previously awarded to another team, decrement that team first
    if (prevAwarded) {
      setTeams(prev =>
        prev.map(t =>
          t.id === prevAwarded
            ? { ...t, score: Math.max(0, t.score - 1) }
            : t.id === teamId
            ? { ...t, score: t.score + 1 }
            : t
        )
      );
    } else {
      // Award +1 to this team
      setTeams(prev =>
        prev.map(t =>
          t.id === teamId ? { ...t, score: t.score + 1 } : t
        )
      );
    }

    setAwardedTeams(prev => ({ ...prev, [qId]: teamId }));
    sounds.playCorrect();
    launchConfetti(35);
  };

  // Reveal Answer
  const revealAnswer = useCallback(() => {
    if (currentIndex === null) return;
    const currentQ = questions[currentIndex];
    if (currentQ.isCompleted) return;

    const nextQuestions = questions.map((q, i) =>
      i === currentIndex ? { ...q, isCompleted: true } : q
    );
    setQuestions(nextQuestions);

    sounds.playCorrect();
    launchConfetti(45);

    // Check if all finished
    const allDone = nextQuestions.every(q => q.isCompleted);
    if (allDone) {
      setTimeout(() => {
        sounds.playCompleteAll();
        launchConfetti(120);
        setShowVictory(true);
      }, 1400);
    }
  }, [currentIndex, questions, launchConfetti]);

  // Next Question logic
  const findNextIndex = () => {
    if (currentIndex === null) return -1;
    // Next uncompleted after current
    const nextIdx = questions.findIndex((q, i) => !q.isCompleted && i > currentIndex);
    if (nextIdx !== -1) return nextIdx;
    // First uncompleted from beginning
    const firstIdx = questions.findIndex((q, i) => !q.isCompleted && i !== currentIndex);
    return firstIdx;
  };

  const nextIndex = findNextIndex();

  const goToNextQuestion = () => {
    if (nextIndex !== -1) {
      sounds.playTileSelect();
      setCurrentIndex(nextIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      goToMenu();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentView === 'question') {
        if (e.key === 'Escape') {
          goToMenu();
        } else if (e.key === 'Enter' || e.key === ' ') {
          if (currentQuestion && !currentQuestion.isCompleted) {
            e.preventDefault();
            revealAnswer();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, currentQuestion, revealAnswer]);

  // Sort teams strictly by score descending; if equal score, sort by ID ascending
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score || a.id - b.id);

  return (
    <>
      {/* Ambient Glow Effects */}
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>
      <div className="bg-grid-overlay"></div>

      {/* Header Section */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand" onClick={goToMenu} role="button" tabIndex={0}>
            <div className="brand-badge">
              <span className="brand-badge-dot"></span>
              MLN131
            </div>
            <div className="brand-text">
              <h1>TRIẾT HỌC <span className="text-orange">XẾP CHỮ</span></h1>
              <p className="tagline">Trò chơi giải mã mật mã triết học Mác – Lênin</p>
            </div>
          </div>

          <div className="header-controls">
            <div className="stat-pill">
              <div className="stat-icon-wrapper">
                <Target size={16} strokeWidth={2.5} />
              </div>
              <span className="stat-label">Tiến độ:</span>
              <span className="stat-value">{completedCount}/{questions.length}</span>
              <div className="progress-mini-bar" title={`Đã hoàn thành ${progressPercent}%`}>
                <div
                  className={`progress-mini-fill ${completedCount === questions.length ? 'full' : ''}`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            <button
              className="icon-btn"
              onClick={toggleSound}
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              aria-label="Bật/Tắt âm thanh"
            >
              {soundEnabled ? (
                <Volume2 size={19} strokeWidth={2.2} />
              ) : (
                <VolumeX size={19} strokeWidth={2.2} />
              )}
            </button>

            <button
              className="icon-btn"
              onClick={resetAll}
              title="Chơi lại từ đầu"
              aria-label="Chơi lại từ đầu"
            >
              <RotateCcw size={18} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Balanced Layout */}
      <div className="app-layout-wrapper">
        
        {/* ================= LEFT SIDEBAR: COMPACT LEADERBOARD (8 GROUPS SORTED BY SCORE) ================= */}
        <aside className="leaderboard-sidebar">
          <div className="leaderboard-card">
            
            <div className="leaderboard-header">
              <div className="lb-title-group">
                <div className="lb-fire-icon">
                  <Flame size={15} className="flame-pulse-icon" />
                </div>
                <h3 className="lb-title">BẢNG XẾP HẠNG</h3>
              </div>

              <button
                className="lb-reset-btn"
                onClick={resetLeaderboard}
                title="Đặt lại điểm các nhóm về 0"
              >
                <RotateCcw size={12} />
              </button>
            </div>

            {/* List of 8 Groups sorted dynamically by score (descending) */}
            <div className="leaderboard-list">
              {sortedTeams.map((team, index) => {
                const rank = index + 1;
                const isTop1 = rank === 1;
                const isTop2 = rank === 2;
                const isTop3 = rank === 3;
                const isFiery = isTop1 || isTop2 || isTop3;

                return (
                  <div
                    key={team.id}
                    className={`lb-team-row ${isFiery ? `rank-fiery rank-${rank}` : 'rank-normal'}`}
                  >
                    {/* Rank Badge: 1, 2, 3 get dramatic fiery style */}
                    <div className={`lb-rank-badge ${isFiery ? 'badge-fire' : ''}`}>
                      {isTop1 ? (
                        <span className="fire-rank-content">
                          <Crown size={12} className="crown-fire-icon" />
                          <span>1</span>
                        </span>
                      ) : isTop2 ? (
                        <span className="fire-rank-content">
                          <Flame size={12} className="flame-fire-icon" />
                          <span>2</span>
                        </span>
                      ) : isTop3 ? (
                        <span className="fire-rank-content">
                          <Award size={12} className="award-fire-icon" />
                          <span>3</span>
                        </span>
                      ) : (
                        <span className="normal-rank-num">#{rank}</span>
                      )}
                    </div>

                    {/* Team Info */}
                    <div className="lb-team-info">
                      <span className={`lb-team-name ${isFiery ? 'name-fiery' : ''}`}>
                        {team.name}
                      </span>
                    </div>

                    {/* Score display */}
                    <div className="lb-score-box">
                      <span className={`lb-score-num ${team.score > 0 ? 'has-points' : ''}`}>
                        {team.score}
                      </span>
                      <span className="lb-score-unit">đ</span>
                    </div>

                    {/* Score Tick Controls */}
                    <div className="lb-actions">
                      <button
                        className="btn-tick-plus"
                        onClick={() => adjustTeamScore(team.id, 1)}
                        title={`Cộng 1 điểm cho ${team.name}`}
                      >
                        <Plus size={13} strokeWidth={3} />
                      </button>
                      {team.score > 0 && (
                        <button
                          className="btn-tick-minus"
                          onClick={() => adjustTeamScore(team.id, -1)}
                          title={`Trừ 1 điểm ${team.name}`}
                        >
                          <Minus size={11} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </aside>

        {/* ================= RIGHT COLUMN: MAIN GAME CONTENT (LARGER TILES & ANSWERS) ================= */}
        <main className="game-content-area">
          {/* ================= VIEW 1: MENU SCREEN (1 to 10) ================= */}
          {currentView === 'menu' && (
            <section className="view-section active">
              <div className="menu-hero">
                <div className="badge-sub">
                  <BookOpen size={14} strokeWidth={2.5} />
                  <span>MÔN HỌC MLN131</span>
                </div>
                <h2 className="menu-title">DANH SÁCH 10 CÂU HỎI XẾP CHỮ</h2>
                <p className="menu-desc">
                  Hãy chọn một câu hỏi bất kỳ để bắt đầu giải mật mã triết học. Sau khi mở đáp án, bạn có thể tick cộng điểm cho nhóm trả lời đúng.
                </p>
              </div>

              {/* 10 Question Cards Grid */}
              <div className="menu-grid">
                {questions.map((q, idx) => {
                  const qNumStr = (idx + 1).toString().padStart(2, '0');
                  if (q.isCompleted) {
                    return (
                      <div
                        key={q.id}
                        className="menu-card completed"
                        aria-disabled="true"
                        title={`Câu ${idx + 1} đã hoàn thành, không thể chọn lại`}
                      >
                        <div className="card-q-number">{qNumStr}</div>
                        <div className="card-q-label">CÂU HỎI {idx + 1}</div>
                        <span className="card-status-pill">
                          <CheckCircle2 size={13} strokeWidth={2.5} />
                          <span>ĐÃ HOÀN THÀNH</span>
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={q.id}
                      className="menu-card"
                      onClick={() => openQuestion(idx)}
                      title={`Bấm để vào Câu hỏi ${idx + 1}`}
                    >
                      <div className="card-q-number text-orange">{qNumStr}</div>
                      <div className="card-q-label">CÂU HỎI {idx + 1}</div>
                      <span className="card-status-pill">
                        <Zap size={13} strokeWidth={2.5} />
                        <span>CHƯA MỞ</span>
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="menu-footer">
                <button className="btn btn-secondary" onClick={resetAll}>
                  <RotateCcw size={16} strokeWidth={2.2} />
                  <span>Đặt lại tất cả câu hỏi</span>
                </button>
              </div>
            </section>
          )}

          {/* ================= VIEW 2: QUESTION DETAIL SCREEN ================= */}
          {currentView === 'question' && currentQuestion && (
            <section className="view-section active">
              <div className="game-card">
                {/* Question Top Bar */}
                <div className="card-top">
                  <button
                    className="btn btn-nav btn-back"
                    onClick={goToMenu}
                    title="Quay lại danh sách câu hỏi"
                  >
                    <ArrowLeft size={16} strokeWidth={2.4} />
                    <span>Quay lại Menu</span>
                  </button>

                  <div className="q-badge">
                    <span className="pulse-dot"></span>
                    <span>CÂU HỎI SỐ {(currentIndex + 1).toString().padStart(2, '0')} / {questions.length}</span>
                  </div>

                  <div className="q-nav-mini">
                    {questions.map((q, idx) => (
                      <button
                        key={q.id}
                        className={`mini-dot ${idx === currentIndex ? 'active' : ''} ${q.isCompleted ? 'completed' : ''}`}
                        onClick={() => !q.isCompleted && openQuestion(idx)}
                        disabled={q.isCompleted}
                        title={`Câu ${idx + 1} ${q.isCompleted ? '(Đã hoàn thành)' : '(Chưa mở - bấm để xem)'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Question Content */}
                <div className="question-box">
                  <span className="q-subhead">
                    <Brain size={15} strokeWidth={2.5} />
                    <span>NỘI DUNG CÂU HỎI:</span>
                  </span>
                  <h2 className="question-content">{currentQuestion.question}</h2>
                </div>

                {/* Scrambled Letters Section - ENLARGED TILES */}
                <div className="scramble-section">
                  <div className="section-label">
                    <div className="section-label-icon">
                      <Shuffle size={18} strokeWidth={2.4} />
                    </div>
                    <span>CÁC CHỮ CÁI XÁO TRỘN:</span>
                  </div>
                  <div className="scramble-tiles-container">
                    {currentQuestion.scrambleWords.map((word, wIdx) => (
                      <div key={wIdx} className="scramble-word-chunk">
                        {word.split('').map((char, cIdx) => (
                          <div key={cIdx} className="scramble-tile">
                            {char.toUpperCase()}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Answer Section - ENLARGED SLOTS */}
                <div className="answer-reveal-section">
                  <div className="section-label">
                    <div className="section-label-icon">
                      <Target size={18} strokeWidth={2.4} />
                    </div>
                    <span>ĐÁP ÁN:</span>
                    <span className={`status-tag ${currentQuestion.isCompleted ? 'revealed' : 'locked'}`}>
                      {currentQuestion.isCompleted ? (
                        <>
                          <CheckCircle2 size={13} strokeWidth={2.5} />
                          <span>Đã mở</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} strokeWidth={2.5} />
                          <span>Chưa mở</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="answer-display-container">
                    {currentQuestion.targetWords.map((word, wIdx) => (
                      <div key={wIdx} className="answer-word-block">
                        {word.split('').map((char, cIdx) => (
                          <div
                            key={cIdx}
                            className={`answer-slot ${currentQuestion.isCompleted ? 'revealed' : 'masked'}`}
                          >
                            {currentQuestion.isCompleted ? char.toUpperCase() : '?'}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation Banner */}
                {currentQuestion.isCompleted && (
                  <div className="explanation-banner">
                    <div className="exp-header">
                      <div className="exp-icon">
                        <Brain size={18} strokeWidth={2.4} />
                      </div>
                      <strong>GIẢI THÍCH TRIẾT HỌC:</strong>
                    </div>
                    <p className="exp-content">{currentQuestion.explanation}</p>
                  </div>
                )}

                {/* Point Awarding Section: Appears once answered */}
                {currentQuestion.isCompleted && (
                  <div className="point-award-panel">
                    <div className="award-panel-header">
                      <Flame size={16} className="flame-award-icon" />
                      <span>CỘNG ĐIỂM CÂU NÀY CHO NHÓM NÀO?</span>
                      {awardedTeams[currentQuestion.id] && (
                        <span className="awarded-badge">
                          ✓ Đã cộng cho Nhóm {awardedTeams[currentQuestion.id]}
                        </span>
                      )}
                    </div>
                    <div className="award-teams-grid">
                      {teams.map((team) => {
                        const isSelected = awardedTeams[currentQuestion.id] === team.id;
                        return (
                          <button
                            key={team.id}
                            className={`award-team-btn ${isSelected ? 'selected' : ''}`}
                            onClick={() => awardPointForQuestion(team.id)}
                            title={`Bấm để cộng +1 điểm cho ${team.name}`}
                          >
                            <span className="award-team-name">{team.name}</span>
                            <span className="award-team-score">+{team.score}đ</span>
                            {isSelected && (
                              <span className="award-check-dot">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Bottom Bar */}
                <div className="card-footer">
                  <button className="btn btn-secondary" onClick={goToMenu}>
                    <ArrowLeft size={16} strokeWidth={2.4} />
                    <span>Về Menu</span>
                  </button>

                  <div className="footer-center">
                    <button
                      className={`btn btn-primary btn-reveal ${!currentQuestion.isCompleted ? 'pulse-btn' : ''}`}
                      onClick={revealAnswer}
                      disabled={currentQuestion.isCompleted}
                    >
                      {currentQuestion.isCompleted ? (
                        <>
                          <CheckCircle2 size={18} strokeWidth={2.4} />
                          <span>ĐÃ HIỂN THỊ KẾT QUẢ</span>
                        </>
                      ) : (
                        <>
                          <Eye size={18} strokeWidth={2.4} />
                          <span>HIỂN THỊ KẾT QUẢ</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    className="btn btn-nav highlight-next"
                    onClick={goToNextQuestion}
                    disabled={nextIndex === -1}
                    title={
                      nextIndex !== -1
                        ? `Chuyển tới Câu ${nextIndex + 1}`
                        : 'Đã hoàn thành hết tất cả câu hỏi'
                    }
                  >
                    <span>Câu tiếp theo</span>
                    <ArrowRight size={16} strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Modal: Congratulations All Completed */}
      {showVictory && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-glow"></div>
            <div className="trophy-container">
              <Trophy size={46} strokeWidth={2} />
            </div>
            <div className="badge-sub">
              <CheckCircle2 size={14} strokeWidth={2.5} />
              <span>MLN131 HOÀN TẤT</span>
            </div>
            <h2 className="modal-title">XUẤT SẮC!</h2>
            <p className="modal-subtitle">
              Bạn đã giải mã thành công toàn bộ 10 đáp án triết học Mác – Lênin!
            </p>

            {/* Victory Podium Preview */}
            <div className="podium-mini">
              <div className="podium-rank">
                <Crown size={18} className="crown-fire-icon" />
                <span>Quán quân: <strong>{sortedTeams[0].name}</strong> ({sortedTeams[0].score} điểm)</span>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary full-width"
                onClick={() => {
                  setShowVictory(false);
                  setCurrentView('menu');
                }}
              >
                <LayoutGrid size={17} strokeWidth={2.2} />
                <span>Xem lại Menu 10 câu</span>
              </button>
              <button
                className="btn btn-primary full-width"
                onClick={resetAll}
              >
                <RotateCcw size={17} strokeWidth={2.2} />
                <span>Chơi lại lượt mới</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confetti Canvas */}
      <canvas ref={canvasRef} id="confetti-canvas"></canvas>
    </>
  );
}

export default App;
