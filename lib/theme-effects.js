/**
 * 主题视觉特效系统
 * 根据当前主题动态加载对应的视觉特效
 */

// 存储当前特效的清理函数
let currentEffectCleanup = null;

/**
 * 清理当前主题的特效
 */
function cleanupCurrentEffect() {
  if (currentEffectCleanup) {
    currentEffectCleanup();
    currentEffectCleanup = null;
  }
  // 移除所有特效DOM元素
  document.querySelectorAll('[data-theme-effect]').forEach(el => el.remove());
}

/**
 * 科技感主题 - 粒子动画
 */
function initTechEffect() {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('data-theme-effect', 'tech-particles');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.6;';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // 创建粒子
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(88, 166, 255, ${p.opacity})`;
      ctx.fill();

      // 绘制连线
      for (let j = i + 1; j < particles.length; j++) {
        const dx = p.x - particles[j].x;
        const dy = p.y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(88, 166, 255, ${0.1 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });

    animationId = requestAnimationFrame(animate);
  }
  animate();

  return () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
    canvas.remove();
  };
}

/**
 * 二次元主题 - 樱花飘落 + 萌萌表情
 */
function initAnimeEffect() {
  const container = document.createElement('div');
  container.setAttribute('data-theme-effect', 'anime-sakura');
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden;';
  document.body.prepend(container);

  // 樱花表情列表
  const emojis = ['🌸', '💖', '✨', '🎀', '💫', '🌙', '⭐', '💝', '🍡', '🎵'];
  
  let intervals = [];

  // 创建樱花花瓣
  function createPetal() {
    const petal = document.createElement('div');
    petal.innerHTML = '🌸';
    petal.style.cssText = `
      position:absolute;
      font-size:${Math.random() * 20 + 10}px;
      left:${Math.random() * 100}%;
      top:-30px;
      opacity:${Math.random() * 0.5 + 0.3};
      animation:sakura-fall ${Math.random() * 5 + 8}s linear infinite;
      animation-delay:${Math.random() * 5}s;
    `;
    container.appendChild(petal);

    setTimeout(() => petal.remove(), 15000);
  }

  // 创建浮动表情
  function createEmoji() {
    const emoji = document.createElement('div');
    emoji.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
    emoji.style.cssText = `
      position:absolute;
      font-size:${Math.random() * 30 + 20}px;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      opacity:0.1;
      animation:emoji-float ${Math.random() * 3 + 4}s ease-in-out infinite;
      animation-delay:${Math.random() * 2}s;
    `;
    container.appendChild(emoji);

    setTimeout(() => emoji.remove(), 8000);
  }

  // 定期生成
  intervals.push(setInterval(createPetal, 800));
  intervals.push(setInterval(createEmoji, 3000));

  // 初始生成一些
  for (let i = 0; i < 15; i++) {
    setTimeout(createPetal, i * 200);
  }

  return () => {
    intervals.forEach(clearInterval);
    container.remove();
  };
}

/**
 * 赛博朋克主题 - 扫描线 + 霓虹效果
 */
function initCyberpunkEffect() {
  // 扫描线
  const scanlines = document.createElement('div');
  scanlines.setAttribute('data-theme-effect', 'cyber-scanlines');
  scanlines.style.cssText = `
    position:fixed;
    top:0;left:0;
    width:100%;height:100%;
    pointer-events:none;z-index:9998;
    background:repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(176, 38, 255, 0.03) 2px,
      rgba(176, 38, 255, 0.03) 4px
    );
  `;
  document.body.prepend(scanlines);

  // 移动扫描线
  const scanner = document.createElement('div');
  scanner.style.cssText = `
    position:fixed;
    top:-10px;left:0;
    width:100%;height:10px;
    background:linear-gradient(
      to bottom,
      rgba(176, 38, 255, 0.2) 0%,
      transparent 100%
    );
    pointer-events:none;z-index:9999;
    animation:scanline-move 8s linear infinite;
  `;
  scanlines.appendChild(scanner);

  // 添加动画样式
  const style = document.createElement('style');
  style.setAttribute('data-theme-effect', 'cyber-style');
  style.textContent = `
    @keyframes scanline-move {
      0% { top:-10px; }
      100% { top:100vh; }
    }
  `;
  document.head.appendChild(style);

  return () => {
    scanlines.remove();
    style.remove();
  };
}

/**
 * 海洋蓝主题 - 波浪 + 气泡
 */
function initOceanEffect() {
  const container = document.createElement('div');
  container.setAttribute('data-theme-effect', 'ocean-waves');
  container.style.cssText = 'position:fixed;bottom:0;left:0;width:100%;height:200px;pointer-events:none;z-index:0;opacity:0.1;';
  document.body.prepend(container);

  // SVG 波浪
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 1200 200');
  svg.style.cssText = 'position:absolute;bottom:0;left:0;width:200%;height:100%;animation:wave-flow 10s linear infinite;';
  svg.innerHTML = `
    <path d="M0,100 C200,150 400,50 600,100 C800,150 1000,50 1200,100 L1200,200 L0,200 Z" fill="rgba(2,132,199,0.3)"/>
    <path d="M0,120 C200,170 400,70 600,120 C800,170 1000,70 1200,120 L1200,200 L0,200 Z" fill="rgba(2,132,199,0.2)"/>
  `;
  container.appendChild(svg);

  // 气泡
  function createBubble() {
    const bubble = document.createElement('div');
    const size = Math.random() * 30 + 10;
    bubble.style.cssText = `
      position:absolute;
      width:${size}px;height:${size}px;
      background:radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(0,150,255,0.2));
      border-radius:50%;
      border:1px solid rgba(0,150,255,0.3);
      left:${Math.random() * 100}%;
      bottom:-50px;
      animation:bubble-rise ${Math.random() * 3 + 4}s linear infinite;
    `;
    container.appendChild(bubble);

    setTimeout(() => bubble.remove(), 8000);
  }

  const interval = setInterval(createBubble, 2000);
  for (let i = 0; i < 5; i++) {
    setTimeout(createBubble, i * 400);
  }

  // 添加动画样式
  const style = document.createElement('style');
  style.setAttribute('data-theme-effect', 'ocean-style');
  style.textContent = `
    @keyframes wave-flow {
      0% { transform:translateX(0); }
      100% { transform:translateX(-50%); }
    }
    @keyframes bubble-rise {
      0% { transform:translateY(0) scale(0); opacity:0.8; }
      50% { opacity:0.6; }
      100% { transform:translateY(-100vh) scale(1); opacity:0; }
    }
  `;
  document.head.appendChild(style);

  return () => {
    clearInterval(interval);
    container.remove();
    style.remove();
  };
}

/**
 * 自然绿主题 - 叶子飘落
 */
function initNatureEffect() {
  const container = document.createElement('div');
  container.setAttribute('data-theme-effect', 'nature-leaves');
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden;';
  document.body.prepend(container);

  const leaves = ['🍃', '🌿', '☘️', '🍀', '🌱'];

  function createLeaf() {
    const leaf = document.createElement('div');
    leaf.innerHTML = leaves[Math.floor(Math.random() * leaves.length)];
    leaf.style.cssText = `
      position:absolute;
      font-size:${Math.random() * 20 + 15}px;
      left:${Math.random() * 100}%;
      top:-30px;
      opacity:${Math.random() * 0.4 + 0.2};
      animation:leaf-fall ${Math.random() * 5 + 10}s linear infinite;
      animation-delay:${Math.random() * 5}s;
    `;
    container.appendChild(leaf);

    setTimeout(() => leaf.remove(), 18000);
  }

  const interval = setInterval(createLeaf, 1500);
  for (let i = 0; i < 8; i++) {
    setTimeout(createLeaf, i * 500);
  }

  // 添加动画样式
  const style = document.createElement('style');
  style.setAttribute('data-theme-effect', 'nature-style');
  style.textContent = `
    @keyframes leaf-fall {
      0% { transform:translateY(-10vh) rotate(0deg) translateX(0); opacity:1; }
      100% { transform:translateY(110vh) rotate(720deg) translateX(100px); opacity:0; }
    }
  `;
  document.head.appendChild(style);

  return () => {
    clearInterval(interval);
    container.remove();
    style.remove();
  };
}

/**
 * 复古主题 - 噪点纹理
 */
function initRetroEffect() {
  const noise = document.createElement('div');
  noise.setAttribute('data-theme-effect', 'retro-noise');
  noise.style.cssText = `
    position:fixed;
    top:0;left:0;
    width:200%;height:200%;
    pointer-events:none;z-index:9997;
    opacity:0.03;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    animation:noise-move 0.5s steps(5) infinite;
  `;
  document.body.prepend(noise);

  // 添加动画样式
  const style = document.createElement('style');
  style.setAttribute('data-theme-effect', 'retro-style');
  style.textContent = `
    @keyframes noise-move {
      0% { transform:translate(0,0); }
      20% { transform:translate(-5%,-5%); }
      40% { transform:translate(-10%,5%); }
      60% { transform:translate(5%,-10%); }
      80% { transform:translate(-5%,15%); }
      100% { transform:translate(10%,5%); }
    }
  `;
  document.head.appendChild(style);

  return () => {
    noise.remove();
    style.remove();
  };
}

/**
 * 日式极简主题 - 竹叶飘落
 */
function initDefaultEffect() {
  const container = document.createElement('div');
  container.setAttribute('data-theme-effect', 'default-bamboo');
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden;';
  document.body.prepend(container);

  function createPetal() {
    const petal = document.createElement('div');
    petal.innerHTML = Math.random() > 0.5 ? '🍃' : '🌸';
    petal.style.cssText = `
      position:absolute;
      font-size:${Math.random() * 16 + 10}px;
      left:${Math.random() * 100}%;
      top:-30px;
      opacity:${Math.random() * 0.3 + 0.1};
      animation:sakura-fall ${Math.random() * 5 + 10}s linear infinite;
      animation-delay:${Math.random() * 5}s;
    `;
    container.appendChild(petal);

    setTimeout(() => petal.remove(), 16000);
  }

  const interval = setInterval(createPetal, 2000);
  for (let i = 0; i < 6; i++) {
    setTimeout(createPetal, i * 800);
  }

  return () => {
    clearInterval(interval);
    container.remove();
  };
}

/**
 * 初始化主题特效
 */
export function initThemeEffects(themeId) {
  // 先清理当前特效
  cleanupCurrentEffect();

  // 根据主题ID初始化对应特效
  switch (themeId) {
    case 'tech':
      currentEffectCleanup = initTechEffect();
      break;
    case 'anime':
      currentEffectCleanup = initAnimeEffect();
      break;
    case 'cyberpunk':
      currentEffectCleanup = initCyberpunkEffect();
      break;
    case 'ocean':
      currentEffectCleanup = initOceanEffect();
      break;
    case 'nature':
      currentEffectCleanup = initNatureEffect();
      break;
    case 'retro':
      currentEffectCleanup = initRetroEffect();
      break;
    case 'default':
      currentEffectCleanup = initDefaultEffect();
      break;
    default:
      // 其他主题暂无特效
      break;
  }
}

/**
 * 清理所有特效
 */
export function cleanupThemeEffects() {
  cleanupCurrentEffect();
}
