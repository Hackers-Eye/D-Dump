/* Radar scan background and FX toggle */
(function(){
  const body = document.body;
  const canvas = document.getElementById('radar-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const lightningCanvas = document.getElementById('lightning-canvas');
  const lctx = lightningCanvas ? lightningCanvas.getContext('2d') : null;
  const fxCanvas = document.getElementById('fx-canvas');
  const fctx = fxCanvas ? fxCanvas.getContext('2d') : null;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width=0, height=0, animationId=null, t=0;
  let lightningId=null, bolts=[];
  let fxId=null, particles=[], waves=[];
  let mx=0.5, my=0.5, lastX=null, lastY=null;

  function resize(){
    const dpr = window.devicePixelRatio || 1;
    width = canvas.clientWidth = window.innerWidth;
    height = canvas.clientHeight = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    if(lightningCanvas){
      lightningCanvas.width = Math.floor(width * dpr);
      lightningCanvas.height = Math.floor(height * dpr);
      lctx.setTransform(dpr,0,0,dpr,0,0);
    }
    if(fxCanvas){
      fxCanvas.width = Math.floor(width * dpr);
      fxCanvas.height = Math.floor(height * dpr);
      fctx.setTransform(dpr,0,0,dpr,0,0);
    }
  }

  function draw(){
    if(body.dataset.fx === 'off') return;
    ctx.clearRect(0,0,width,height);

    const cx = width*(0.65 + 0.15*(mx-0.5)), cy = height*(0.30 + 0.15*(my-0.5)); // radar origin parallax
    const maxR = Math.hypot(width, height) * 0.6;

    // background fade
    ctx.fillStyle = 'rgba(7,10,16,0.55)';
    ctx.fillRect(0,0,width,height);

    // concentric circles
    for(let r=80; r<maxR; r+=120){
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(53,182,255,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // sweep
    const angle = (t%360) * Math.PI/180;
    const sweep = Math.PI/6; // 30deg
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    grad.addColorStop(0, 'rgba(53,182,255,0.35)');
    grad.addColorStop(1, 'rgba(53,182,255,0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, maxR, angle, angle + sweep);
    ctx.closePath();
    ctx.fill();

    // blips
    for(let i=0;i<8;i++){
      const r = (i+1)/9 * maxR;
      const a = ((i*47 + t*2)%360) * Math.PI/180;
      const x = cx + Math.cos(a)*r;
      const y = cy + Math.sin(a)*r;
      const alpha = 0.6 - i*0.06;
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI*2);
      ctx.fillStyle = `rgba(179,91,255,${alpha})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(53,182,255,${alpha*0.5})`;
      ctx.stroke();
    }

    t = (t + 1.5) % 360;
    animationId = requestAnimationFrame(draw);
  }

  function start(){
    if(prefersReduced || body.dataset.fx === 'off') return;
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(draw);
    if(lightningCanvas){
      cancelAnimationFrame(lightningId);
      lightningId = requestAnimationFrame(lightningLoop);
    }
    if(fxCanvas){
      cancelAnimationFrame(fxId);
      fxId = requestAnimationFrame(fxLoop);
    }
  }

  window.addEventListener('resize', ()=>{ resize(); start(); });
  resize(); start();

  // Track mouse for parallax and particles
  window.addEventListener('mousemove', (e)=>{
    mx = e.clientX / window.innerWidth;
    my = e.clientY / window.innerHeight;
    if(!fctx) return;
    const x = e.clientX, y = e.clientY;
    if(lastX!==null){
      const dx = x - lastX, dy = y - lastY;
      const mag = Math.hypot(dx,dy) || 1;
      for(let i=0;i<6;i++){
        particles.push({ x, y, vx: (dx/mag)*(Math.random()*2), vy:(dy/mag)*(Math.random()*2), life: 0.8, size: 1.6+Math.random()*1.2 });
      }
      if(particles.length>220) particles.splice(0, particles.length-220);
    }
    lastX = x; lastY = y;
  }, {passive:true});

  window.addEventListener('click', (e)=>{
    waves.push({x:e.clientX, y:e.clientY, r:8, alpha:0.9, speed:3});
    const pulse = document.createElement('span');
    pulse.className = 'pulse';
    const reticle = document.getElementById('reticle');
    if(reticle){ reticle.appendChild(pulse); setTimeout(()=>pulse.remove(), 600); }
  }, {passive:true});

  // FX toggle
  const toggle = document.getElementById('toggleFx');
  if(toggle){
    toggle.addEventListener('click', ()=>{
      const turnOn = body.dataset.fx === 'off';
      body.dataset.fx = turnOn ? 'on' : 'off';
      toggle.setAttribute('aria-pressed', String(turnOn));
      if(turnOn) start(); else { cancelAnimationFrame(animationId); cancelAnimationFrame(lightningId); cancelAnimationFrame(fxId);}
    });
  }

  // Lightning bolts
  function makeBolt(){
    const startX = Math.random()*width;
    const endX = startX + (Math.random()*200-100);
    const endY = height * (0.4 + Math.random()*0.5);
    const segments = [];
    const steps = 28 + (Math.random()*10|0);
    let x = startX, y = -20;
    for(let i=0;i<steps;i++){
      const nx = x + (Math.random()*40-20);
      const ny = y + (endY - y)/ (steps - i) + (Math.random()*20-10);
      segments.push([x,y,nx,ny]);
      x=nx; y=ny;
    }
    return {segments, life:1.0};
  }
  function lightningLoop(){
    if(body.dataset.fx === 'off') return;
    // fade
    lctx.fillStyle = 'rgba(0,0,0,0.15)';
    lctx.fillRect(0,0,width,height);
    // draw bolts
    for(let i=bolts.length-1;i>=0;i--){
      const b = bolts[i];
      lctx.save();
      lctx.globalAlpha = b.life;
      lctx.strokeStyle = '#bffff0';
      lctx.shadowColor = 'rgba(10,255,157,0.8)';
      lctx.shadowBlur = 18;
      lctx.lineWidth = 2;
      lctx.beginPath();
      b.segments.forEach((s,idx)=>{ if(idx===0) lctx.moveTo(s[0],s[1]); lctx.lineTo(s[2],s[3]); });
      lctx.stroke();
      lctx.restore();
      b.life -= 0.02;
      if(b.life<=0){ bolts.splice(i,1); }
    }
    // randomly create a new bolt
    if(Math.random() < 0.02 && bolts.length<2){ bolts.push(makeBolt()); }
    lightningId = requestAnimationFrame(lightningLoop);
  }

  // FX canvas particles & waves
  function fxLoop(){
    if(body.dataset.fx === 'off') return;
    // fade
    fctx.fillStyle = 'rgba(0,0,0,0.2)';
    fctx.fillRect(0,0,width,height);
    // particles
    for(let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.life -= 0.02;
      fctx.beginPath();
      fctx.fillStyle = `rgba(10,255,157,${Math.max(0,p.life)})`;
      fctx.shadowColor = 'rgba(10,255,157,0.8)';
      fctx.shadowBlur = 12;
      fctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      fctx.fill();
      if(p.life<=0) particles.splice(i,1);
    }
    // waves
    for(let i=waves.length-1;i>=0;i--){
      const w = waves[i];
      w.r += w.speed; w.alpha -= 0.02;
      fctx.beginPath();
      fctx.strokeStyle = `rgba(10,255,157,${Math.max(0,w.alpha)})`;
      fctx.lineWidth = 2;
      fctx.shadowColor = 'rgba(10,255,157,0.6)';
      fctx.shadowBlur = 10;
      fctx.arc(w.x,w.y,w.r,0,Math.PI*2);
      fctx.stroke();
      if(w.alpha<=0) waves.splice(i,1);
    }
    fxId = requestAnimationFrame(fxLoop);
  }

  // Typing placeholder effect (home page)
  const searchInput = document.getElementById('searchInput');
  if(searchInput){
    const samples = ['john.doe@example.com', 'Alice Kumar', '+91 98765 43210'];
    let idx = 0, p = 0, dir = 1;
    function type(){
      const text = samples[idx];
      p += dir;
      searchInput.setAttribute('placeholder', text.slice(0, p));
      if(p === text.length){ dir = -1; setTimeout(type, 1200); return; }
      if(p === 0){ dir = 1; idx = (idx+1)%samples.length; }
      setTimeout(type, dir>0 ? 60 : 35);
    }
    setTimeout(type, 600);
  }

  // Hover tilt
  const tilts = document.querySelectorAll('[data-tilt]');
  tilts.forEach(el => {
    const strength = 8;
    function onMove(e){
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `rotateX(${(-py*strength).toFixed(2)}deg) rotateY(${(px*strength).toFixed(2)}deg)`;
    }
    function reset(){ el.style.transform = 'rotateX(0) rotateY(0)'; }
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', reset);
  });

  // Text scramble (password cracking vibe)
  const randomChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%';
  function scramble(el, time=900){
    const text = el.textContent;
    const out = text.split('');
    const revealSteps = out.map(()=> Math.floor(Math.random()*20)+10);
    let frame = 0;
    const timer = setInterval(()=>{
      let done=true;
      for(let i=0;i<out.length;i++){
        if(frame < revealSteps[i]){ out[i] = randomChars[(Math.random()*randomChars.length)|0]; done=false; }
        else { out[i] = text[i]; }
      }
      el.textContent = out.join('');
      frame++;
      if(done){ clearInterval(timer); el.textContent = text; }
    }, Math.max(16, time/40));
  }
  document.querySelectorAll('.scramble').forEach(el=>{
    el.addEventListener('mouseenter', ()=>scramble(el));
    setTimeout(()=>scramble(el, 700), 500);
  });

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('revealed'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else { revealEls.forEach(el => el.classList.add('revealed')); }

  // Button ripple
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if(!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size/2}px`;
    ripple.style.top = `${e.clientY - rect.top - size/2}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }, { passive: true });

  // Reticle and noise overlays
  if(!prefersReduced){
    const reticle = document.createElement('div');
    reticle.id = 'reticle';
    const core = document.createElement('span');
    core.className = 'core';
    reticle.appendChild(core);
    document.body.appendChild(reticle);
    const noise = document.createElement('div');
    noise.className = 'noise';
    document.body.appendChild(noise);
    let raf;
    window.addEventListener('mousemove', (e)=>{
      if(raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{
        reticle.style.left = `${e.clientX}px`;
        reticle.style.top = `${e.clientY}px`;
      });
    }, { passive:true });
  }
})();
