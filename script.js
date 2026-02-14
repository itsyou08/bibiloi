/* ── Floating mini hearts on landing ── */
(function spawnFloatingHearts(){
  const bg=document.getElementById('hearts-bg');
  if(!bg) return;
  const sizes=[14,18,12,20,16,11,22];
  const opacs=[.12,.18,.10,.14,.16,.09,.13];
  for(let i=0;i<14;i++){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    const s=sizes[i%sizes.length];
    svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('fill','rgba(255,120,100,'+opacs[i%opacs.length]+')');
    svg.style.cssText=`width:${s}px;height:${s}px;`;
    svg.innerHTML='<path d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.8 3.9 12 5C12.2 3.9 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 14.5 12 21 12 21Z"/>';
    const el=document.createElement('div');
    el.className='hfloat';
    const left=8+Math.random()*84;
    const top=10+Math.random()*80;
    const dur=4+Math.random()*5;
    const delay=Math.random()*6;
    const rot=(Math.random()-.5)*40;
    el.style.cssText=`left:${left}%;top:${top}%;--dur:${dur}s;--delay:${delay}s;--rot:${rot}deg;`;
    el.appendChild(svg);
    bg.appendChild(el);
  }
})();

/* ── OPTIMIZED NAVIGATION WITH HARDWARE ACCELERATION ── */
let isTransitioning = false;

function goTo(id){
  if(isTransitioning) return; // Prevent multiple transitions
  
  const currentScreen = document.querySelector('.screen.active');
  const targetScreen = document.getElementById(id);
  
  if(!targetScreen || currentScreen === targetScreen) return;
  
  isTransitioning = true;
  
  // Exit current screen
  if(currentScreen){
    currentScreen.classList.remove('entering');
    currentScreen.classList.add('exiting');
  }
  
  // Wait for exit animation
  setTimeout(() => {
    // Hide current screen
    if(currentScreen){
      currentScreen.classList.remove('active', 'exiting');
    }
    
    // Show and animate new screen
    targetScreen.classList.add('active');
    
    // Force reflow for animation
    void targetScreen.offsetWidth;
    
    targetScreen.classList.add('entering');
    
    // Smooth scroll
    window.scrollTo(0, 0);
    
    // ✅ START CAROUSEL AUTO-SCROLL WHEN ENTERING SCREEN-3
    if(id === 'screen-3') {
      const carousel = document.getElementById('carousel');
      if(carousel && carousel.carouselAutoScroll) {
        console.log('Starting carousel auto-scroll...');
        setTimeout(() => {
          carousel.carouselAutoScroll.start();
          console.log('Carousel started!');
        }, 1200);
      } else {
        console.log('Carousel or autoScroll API not found');
      }
    }
    
    // Re-enable transitions after animation completes
    setTimeout(() => {
      isTransitioning = false;
    }, 600);
    
  }, 400);
}

/* ── Continue with GIF, then confetti, then proceed ── */
function handleContinue(){
  // Start background music
  const bgMusic = document.getElementById('bg-music');
  if(bgMusic){
    bgMusic.volume = 0.3; // Set volume to 30%
    bgMusic.play().catch(err => console.log('Background music autoplay prevented:', err));
  }
  
  // Get the GIF overlay and iframe
  const gifOverlay = document.getElementById('gif-overlay');
  const tenorEmbed = gifOverlay.querySelector('.tenor-gif-embed');
  
  // Function to show GIF and continue
  function showGifAndContinue() {
    // Show the GIF overlay
    gifOverlay.classList.add('show');
    
    // Launch confetti in background
    launchConfetti();
    
    // GIF DISPLAY DURATION - Change this to control how long the GIF shows
    const GIF_DURATION = 4000; // 4 seconds (4000ms) - adjust as needed
    
    // Hide GIF and proceed to screen 2 after specified duration
    setTimeout(() => {
      gifOverlay.classList.remove('show');
      // Wait for fade out, then navigate
      setTimeout(() => goTo('screen-2'), 400);
    }, GIF_DURATION);
  }
  
  // Check if Tenor iframe is already loaded
  const iframe = tenorEmbed ? tenorEmbed.querySelector('iframe') : null;
  
  if(iframe && iframe.contentWindow) {
    // If iframe exists, wait a bit to ensure it's rendered, then show
    setTimeout(showGifAndContinue, 300);
  } else {
    // If no iframe yet, wait for Tenor to load it
    let checkCount = 0;
    const checkInterval = setInterval(() => {
      const newIframe = tenorEmbed ? tenorEmbed.querySelector('iframe') : null;
      checkCount++;
      
      if(newIframe || checkCount > 20) { // Max 2 seconds wait
        clearInterval(checkInterval);
        setTimeout(showGifAndContinue, 300);
      }
    }, 100);
  }
}

/* ════════════════════════════════════════
   ADVANCED EXPLOSION ENGINE
════════════════════════════════════════ */
let boomFired=false;

function handleBoom(btn){
  if(boomFired) return;
  boomFired=true;

  /* Play explosion sound */
  const explosionSound = document.getElementById('explosion-sound');
  if(explosionSound){
    explosionSound.currentTime = 0; // Reset to start
    explosionSound.volume = 0.6; // Set volume to 60%
    explosionSound.play().catch(err => console.log('Explosion sound error:', err));
  }

  /* 1. Vanish the button instantly */
  btn.classList.add('vanish');
  setTimeout(()=>{ btn.style.display='none'; },260);

  /* 2. Get explosion origin (center of button) */
  const br=btn.getBoundingClientRect();
  const ox=br.left+br.width/2;
  const oy=br.top+br.height/2;

  /* 3. Trigger all visual layers */
  triggerShockwaves(ox,oy);
  triggerBurstFlash(ox,oy);
  triggerScreenTint();
  triggerCardBlast();
  spawnExplosionParticles(ox,oy);

  /* 4. Swap reaction image — instantly on explosion */
  const wrap=document.getElementById('reaction-wrap');
  if(wrap) wrap.classList.add('exploded');

  /* 5. Alert dialog — pops AFTER image reaction settles (~2.5s) */
  setTimeout(()=>openAlert(), 2500);
}

/* ── Shockwave rings ── */
function triggerShockwaves(ox,oy){
  const types=['fire','heat','cold'];
  types.forEach((type,i)=>{
    const ring=document.createElement('div');
    ring.className='shock-ring';
    ring.style.cssText=`left:${ox}px;top:${oy}px;`;
    document.body.appendChild(ring);
    void ring.offsetWidth;
    ring.classList.add(type);
    setTimeout(()=>ring.remove(), 1600+i*200);
  });
}

/* ── Radial burst flash ── */
function triggerBurstFlash(ox,oy){
  const el=document.getElementById('burst-flash');
  const pctX=(ox/window.innerWidth*100).toFixed(1)+'%';
  const pctY=(oy/window.innerHeight*100).toFixed(1)+'%';
  el.style.setProperty('--bx',pctX);
  el.style.setProperty('--by',pctY);
  el.classList.remove('go');
  void el.offsetWidth;
  el.classList.add('go');
  setTimeout(()=>el.classList.remove('go'),700);
}

/* ── Screen heat tint ── */
function triggerScreenTint(){
  const el=document.getElementById('screen-tint');
  el.classList.remove('go');
  void el.offsetWidth;
  el.classList.add('go');
  setTimeout(()=>el.classList.remove('go'),1400);
}

/* ── Card blast shake + scorch ── */
function triggerCardBlast(){
  const card=document.getElementById('landing-card');
  card.classList.remove('blasted','scorched');
  void card.offsetWidth;
  card.classList.add('blasted');
  setTimeout(()=>{
    card.classList.remove('blasted');
    card.classList.add('scorched');
  },700);
}

/* ════════════════════════════════════════
   PARTICLE ENGINE — OPTIMIZED FOR MOBILE
════════════════════════════════════════ */
function spawnExplosionParticles(ox,oy){
  const cv=document.getElementById('boom-canvas');
  const ctx=cv.getContext('2d', { alpha: true, desynchronized: true });
  cv.width=window.innerWidth;
  cv.height=window.innerHeight;

  const particles=[];

  // Reduced particle count for mobile performance
  /* System A: Core fireball shards */
  for(let i=0;i<50;i++){
    const angle=Math.random()*Math.PI*2;
    const speed=6+Math.random()*18;
    const sz=2+Math.random()*6;
    const hue=Math.random()>0.5
      ? `rgba(255,${180+Math.floor(Math.random()*75)},${Math.floor(Math.random()*40)},1)`
      : `rgba(255,${Math.floor(Math.random()*80)},0,1)`;
    particles.push({
      x:ox,y:oy,
      vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed,
      r:sz, col:hue,
      gravity:.22, drag:.97,
      spin:0, ang:Math.random()*Math.PI*2,
      op:1, fadeRate:.018,
      type:'shard',
      trail:[], maxTrail:3 // Reduced trail
    });
  }

  /* System B: Ember sparks */
  for(let i=0;i<40;i++){
    const angle=-Math.PI*.5 + (Math.random()-.5)*Math.PI*1.6;
    const speed=4+Math.random()*14;
    particles.push({
      x:ox,y:oy,
      vx:Math.cos(angle)*speed*(0.6+Math.random()),
      vy:Math.sin(angle)*speed*(0.6+Math.random())-2,
      r:1+Math.random()*2.5,
      col:`rgba(255,${200+Math.floor(Math.random()*55)},${Math.floor(Math.random()*80)},1)`,
      gravity:.14, drag:.985,
      spin:0, ang:0,
      op:1, fadeRate:.009,
      type:'ember',
      trail:[], maxTrail:4 // Reduced trail
    });
  }

  /* System C: Chunky debris */
  for(let i=0;i<15;i++){
    const angle=Math.random()*Math.PI*2;
    const speed=2+Math.random()*8;
    const w=6+Math.random()*10;
    const h=3+Math.random()*6;
    particles.push({
      x:ox,y:oy,
      vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed-3,
      r:w, rh:h,
      col:`rgba(${60+Math.floor(Math.random()*40)},${Math.floor(Math.random()*20)},0,1)`,
      gravity:.35, drag:.96,
      spin:(Math.random()-.5)*.28, ang:Math.random()*Math.PI*2,
      op:1, fadeRate:.012,
      type:'chunk',
      trail:[], maxTrail:0
    });
  }

  /* System D: Smoke puffs */
  for(let i=0;i<12;i++){
    const angle=-Math.PI*.5+(Math.random()-.5)*Math.PI;
    const speed=.8+Math.random()*3;
    const sz=20+Math.random()*50;
    const grey=Math.floor(20+Math.random()*40);
    particles.push({
      x:ox+(Math.random()-.5)*40, y:oy+(Math.random()-.5)*30,
      vx:Math.cos(angle)*speed+(Math.random()-.5)*1.5,
      vy:Math.sin(angle)*speed-1,
      r:sz, scaleGrow:1.012,
      col:`rgba(${grey},${grey*.6},${grey*.5},`,
      gravity:-.04, drag:.99,
      spin:(Math.random()-.5)*.04, ang:Math.random()*Math.PI*2,
      op:.55, fadeRate:.006,
      type:'smoke',
      trail:[], maxTrail:0
    });
  }

  /* System E: Secondary explosions - reduced */
  for(let i=0;i<4;i++){
    const delay=80+i*120;
    const angle=Math.random()*Math.PI*2;
    const dist=30+Math.random()*80;
    const sx=ox+Math.cos(angle)*dist;
    const sy=oy+Math.sin(angle)*dist;
    setTimeout(()=>{
      for(let j=0;j<12;j++){
        const a2=Math.random()*Math.PI*2;
        const sp=2+Math.random()*7;
        particles.push({
          x:sx,y:sy,
          vx:Math.cos(a2)*sp, vy:Math.sin(a2)*sp-1,
          r:1.5+Math.random()*3.5,
          col:`rgba(255,${160+Math.floor(Math.random()*95)},${Math.floor(Math.random()*60)},1)`,
          gravity:.18, drag:.97,
          spin:0, ang:0,
          op:.9, fadeRate:.016,
          type:'ember',
          trail:[], maxTrail:3
        });
      }
    }, delay);
  }

  /* ── Optimized render loop ── */
  let rafId;
  let lastT=performance.now();
  const TOTAL_DURATION=4000; // Slightly shorter
  let elapsed=0;

  function render(ts){
    const dt=Math.min(ts-lastT,40);
    lastT=ts;
    elapsed+=dt;

    ctx.clearRect(0,0,cv.width,cv.height);

    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i];

      /* Physics */
      p.vx*=p.drag;
      p.vy=p.vy*p.drag+p.gravity;
      p.x+=p.vx;
      p.y+=p.vy;
      p.ang+=p.spin;
      if(p.scaleGrow) p.r*=p.scaleGrow;

      /* Trail record */
      if(p.maxTrail>0){
        p.trail.push({x:p.x,y:p.y,op:p.op});
        if(p.trail.length>p.maxTrail) p.trail.shift();
      }

      /* Fade */
      p.op-=p.fadeRate;
      if(p.op<=0){ particles.splice(i,1); continue; }

      ctx.save();

      if(p.type==='smoke'){
        /* Soft radial smoke puff */
        const grad=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
        grad.addColorStop(0,  p.col+(p.op*.9)+')');
        grad.addColorStop(0.5,p.col+(p.op*.5)+')');
        grad.addColorStop(1,  p.col+'0)');
        ctx.fillStyle=grad;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fill();

      } else if(p.type==='chunk'){
        /* Tumbling rectangular chunk with glow */
        ctx.globalAlpha=p.op;
        ctx.translate(p.x,p.y);
        ctx.rotate(p.ang);
        const rh=p.rh||p.r*.4;
        ctx.shadowColor='rgba(255,120,0,.7)';
        ctx.shadowBlur=8;
        ctx.fillStyle=p.col;
        ctx.beginPath();
        ctx.roundRect(-p.r/2,-rh/2,p.r,rh,2);
        ctx.fill();

      } else {
        /* Draw trail */
        if(p.trail.length>1){
          for(let t=0;t<p.trail.length-1;t++){
            const ta=p.trail[t];
            const tb=p.trail[t+1];
            const frac=t/p.trail.length;
            ctx.globalAlpha=ta.op*frac*.55;
            ctx.strokeStyle=p.col;
            ctx.lineWidth=p.r*(frac*.8+.2);
            ctx.lineCap='round';
            ctx.beginPath();
            ctx.moveTo(ta.x,ta.y);
            ctx.lineTo(tb.x,tb.y);
            ctx.stroke();
          }
        }

        /* Core particle with bloom glow */
        ctx.globalAlpha=p.op;
        ctx.shadowColor=p.col;
        ctx.shadowBlur=p.type==='ember'?12:16;
        ctx.fillStyle=p.col;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fill();

        /* Bright center */
        ctx.globalAlpha=p.op*.7;
        ctx.shadowBlur=0;
        ctx.fillStyle='rgba(255,255,220,.9)';
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r*.35,0,Math.PI*2);
        ctx.fill();
      }

      ctx.restore();
    }

    if(elapsed<TOTAL_DURATION || particles.length>0){
      rafId=requestAnimationFrame(render);
    } else {
      ctx.clearRect(0,0,cv.width,cv.height);
      cancelAnimationFrame(rafId);
    }
  }

  cancelAnimationFrame(rafId);
  elapsed=0; lastT=performance.now();
  rafId=requestAnimationFrame(render);
}

/* ── Alert dialog ── */
function openAlert(){
  document.getElementById('alert-backdrop').classList.add('open');
}
function closeAlert(){
  const backdrop=document.getElementById('alert-backdrop');
  const dialog=document.getElementById('alert-dialog');
  dialog.style.transform='scale(.88) translateY(16px)';
  dialog.style.opacity='0';
  setTimeout(()=>{
    backdrop.classList.remove('open');
    dialog.style.transform='';
    dialog.style.opacity='';
    /* Restore the boom button */
    const btn=document.getElementById('btn-boom');
    if(btn){
      btn.style.display='';
      btn.classList.remove('vanish');
      boomFired=false;
    }
    /* Un-scorch the card */
    const card=document.getElementById('landing-card');
    card.classList.remove('scorched','blasted');
    /* Reset reaction image */
    const wrap=document.getElementById('reaction-wrap');
    if(wrap) wrap.classList.remove('exploded');
  },300);
}
function handleAlertBackdrop(e){
  if(e.target===document.getElementById('alert-backdrop')) closeAlert();
}

/* ── Flip cards ── */
function flipCard(card){
  card.classList.toggle('flipped');
}

/* ── Carousel dots ── */
(function(){
  const t=document.getElementById('carousel');
  const ds=document.querySelectorAll('#dots .dot');
  if(!t||!ds.length) return;
  t.addEventListener('scroll',()=>{
    const w=t.querySelector('.photo-card').offsetWidth+16;
    const a=Math.round(t.scrollLeft/w);
    ds.forEach((d,i)=>d.classList.toggle('on',i===a));
  });
})();

/* ════════════════════════════════════════
   UNIFIED INFINITE CAROUSEL ENGINE
════════════════════════════════════════ */
(function() {
  const carousel = document.getElementById('carousel');
  const dots = document.querySelectorAll('#dots .dot');
  if (!carousel) return;

  // 1. CLONE ITEMS FOR INFINITE LOOP
  const originalItems = [...carousel.children];
  originalItems.forEach(item => {
    const clone = item.cloneNode(true);
    carousel.appendChild(clone);
  });

  let autoScrollRAF;
  let isUserInteracting = false;
  let idleTimer;
  let isStarted = false;
  const SPEED = 0.5; // Adjusted for the new loop logic

  // 2. THE RENDER LOOP
  function autoScroll() {
    if (!isUserInteracting) {
      carousel.scrollLeft += SPEED;

      // INSTANT LOOP RESET
      // When we reach the end of the original set, jump back to 0
      if (carousel.scrollLeft >= carousel.scrollWidth / 2) {
        carousel.scrollLeft = 0;
      }
    }
    
    // UPDATE DOTS (Synced with movement)
    updateDots();
    
    autoScrollRAF = requestAnimationFrame(autoScroll);
  }

  function updateDots() {
    if (!dots.length) return;
    const cardWidth = originalItems[0].offsetWidth + 16;
    // Calculate index based on original items only
    const activeIndex = Math.round((carousel.scrollLeft % (carousel.scrollWidth / 2)) / cardWidth);
    
    dots.forEach((dot, i) => {
      dot.classList.toggle('on', i === (activeIndex % originalItems.length));
    });
  }

  // 3. CONTROL METHODS
  function startAutoScroll() {
    if (isStarted) return;
    isStarted = true;
    isUserInteracting = false;
    autoScrollRAF = requestAnimationFrame(autoScroll);
  }

  function stopAutoScroll() {
    cancelAnimationFrame(autoScrollRAF);
    isStarted = false;
  }

  function handleInteraction() {
    isUserInteracting = true;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      isUserInteracting = false;
    }, 2500); // Resume after 2.5s of no touch
  }

  // 4. EVENT LISTENERS
  carousel.addEventListener('mousedown', handleInteraction);
  carousel.addEventListener('touchstart', handleInteraction, { passive: true });
  carousel.addEventListener('wheel', handleInteraction, { passive: true });

  // Expose API for goTo()
  carousel.carouselAutoScroll = {
    start: startAutoScroll,
    stop: stopAutoScroll
  };
})();


/* ── Final actions ── */
function handleScreenshot(){
  const r=document.getElementById('love-resp');
  r.textContent='Saved in your heart forever.';r.style.opacity='1';
}
function handleShare(){
  const r=document.getElementById('love-resp');
  if(navigator.share){
    navigator.share({title:'My Valentine',url:window.location.href}).catch(()=>{});
  } else {
    navigator.clipboard?.writeText(window.location.href).then(()=>{
      r.textContent='Link copied! Send it with love.';r.style.opacity='1';
    }).catch(()=>{r.textContent='Copy the URL and share it.';r.style.opacity='1';});
  }
}
function handleILoveYou(){
  launchConfetti();
  const r=document.getElementById('love-resp');
  r.textContent='I love you more.';r.style.opacity='1';
}

/* ── OPTIMIZED CONFETTI SYSTEM FOR MOBILE ── */
function launchConfetti(){
  const cv=document.getElementById('cv');
  const ctx=cv.getContext('2d', { alpha: true });
  cv.width=window.innerWidth;cv.height=window.innerHeight;
  
  const cols=['#FF6B6B','#C4302B','#FF9090','#FFBBBB','#E03030','#FF4D45','rgba(255,255,255,.95)','rgba(255,180,160,.9)','#8C1007','#FF4D6B','#FFD4D4'];
  const sh=['circle','rect','heart','star','ring'];
  const ps=[];
  
  /* Reduced particle count for mobile */
  for(let i=0;i<100;i++){
    const isSpecial=Math.random()>.85;
    ps.push({
      x:Math.random()*cv.width,
      y:-10-Math.random()*200,
      r:(isSpecial?5:3)+Math.random()*(isSpecial?8:6),
      col:cols[Math.floor(Math.random()*cols.length)],
      sh:sh[Math.floor(Math.random()*sh.length)],
      vx:(Math.random()-.5)*(isSpecial?5:4),
      vy:1.5+Math.random()*(isSpecial?5:4.5),
      ang:Math.random()*Math.PI*2,
      spin:(Math.random()-.5)*(isSpecial?.35:.25),
      op:1,
      wobble:Math.random()*Math.PI*2,
      wobbleSpeed:.02+Math.random()*.04,
      wobbleAmp:8+Math.random()*15,
      glow:isSpecial,
      trail:[],
      maxTrail:isSpecial?4:0
    });
  }
  
  /* Secondary sparkle burst */
  setTimeout(()=>{
    for(let i=0;i<25;i++){
      const angle=Math.random()*Math.PI*2;
      const speed=3+Math.random()*6;
      ps.push({
        x:cv.width/2,
        y:cv.height*.3,
        r:2+Math.random()*4,
        col:Math.random()>.5?'rgba(255,255,255,.95)':'#FFD700',
        sh:'circle',
        vx:Math.cos(angle)*speed,
        vy:Math.sin(angle)*speed-2,
        ang:0,spin:0,op:1,
        wobble:0,wobbleSpeed:0,wobbleAmp:0,
        glow:true,trail:[],maxTrail:3
      });
    }
  },300);
  
  let fr,el=0,last=performance.now();
  const DUR=4000;
  
  function draw(ts){
    el+=ts-last;last=ts;
    ctx.clearRect(0,0,cv.width,cv.height);
    
    for(let i=ps.length-1;i>=0;i--){
      const p=ps[i];
      
      /* Physics */
      p.wobble+=p.wobbleSpeed;
      p.vx*=.993;
      p.x+=p.vx+Math.cos(p.wobble)*p.wobbleAmp*.016;
      p.y+=p.vy;
      p.vy+=.062;
      p.ang+=p.spin;
      
      /* Trail recording */
      if(p.maxTrail>0){
        p.trail.push({x:p.x,y:p.y,op:p.op});
        if(p.trail.length>p.maxTrail)p.trail.shift();
      }
      
      /* Fade out */
      if(el>DUR*.6)p.op-=.011;
      if(p.op<=0||p.y>cv.height+50){ps.splice(i,1);continue;}
      
      ctx.save();
      ctx.globalAlpha=Math.max(0,p.op);
      
      /* Draw trail */
      if(p.trail.length>1){
        for(let t=0;t<p.trail.length-1;t++){
          const ta=p.trail[t],tb=p.trail[t+1];
          const frac=t/p.trail.length;
          ctx.globalAlpha=ta.op*frac*.5;
          ctx.strokeStyle=p.col;
          ctx.lineWidth=p.r*(.4+frac*.4);
          ctx.lineCap='round';
          ctx.beginPath();
          ctx.moveTo(ta.x,ta.y);
          ctx.lineTo(tb.x,tb.y);
          ctx.stroke();
        }
        ctx.globalAlpha=Math.max(0,p.op);
      }
      
      /* Glow effect */
      if(p.glow){
        ctx.shadowColor=p.col;
        ctx.shadowBlur=14;
      }
      
      ctx.translate(p.x,p.y);
      ctx.rotate(p.ang);
      ctx.fillStyle=p.col;
      ctx.beginPath();
      
      /* Shapes */
      if(p.sh==='circle'){
        ctx.arc(0,0,p.r,0,Math.PI*2);
      }else if(p.sh==='rect'){
        ctx.rect(-p.r,-p.r*.6,p.r*2,p.r*1.2);
      }else if(p.sh==='heart'){
        const s=p.r*.75;
        ctx.moveTo(0,s*.6);
        ctx.bezierCurveTo(-s*1.5,-s*.15,-s*1.5,-s*1.2,0,-s*.5);
        ctx.bezierCurveTo(s*1.5,-s*1.2,s*1.5,-s*.15,0,s*.6);
      }else if(p.sh==='star'){
        const pts=5,o=p.r,i=p.r*.4;
        for(let pt=0;pt<pts*2;pt++){
          const rad=(pt/pts)*Math.PI;
          const r=pt%2===0?o:i;
          if(pt===0)ctx.moveTo(Math.cos(rad)*r,Math.sin(rad)*r);
          else ctx.lineTo(Math.cos(rad)*r,Math.sin(rad)*r);
        }
        ctx.closePath();
      }else if(p.sh==='ring'){
        ctx.arc(0,0,p.r,0,Math.PI*2);
        ctx.arc(0,0,p.r*.5,0,Math.PI*2,true);
      }
      
      ctx.fill();
      
      /* Bright center for glowing particles */
      if(p.glow&&p.sh==='circle'){
        ctx.shadowBlur=0;
        ctx.fillStyle='rgba(255,255,255,.8)';
        ctx.beginPath();
        ctx.arc(0,0,p.r*.3,0,Math.PI*2);
        ctx.fill();
      }
      
      ctx.restore();
    }
    
    if(el<DUR||ps.length>0){
      fr=requestAnimationFrame(draw);
    }else{
      ctx.clearRect(0,0,cv.width,cv.height);
      cancelAnimationFrame(fr);
    }
  }
  
  cancelAnimationFrame(fr);
  el=0;last=performance.now();
  fr=requestAnimationFrame(draw);
}

const envelope = document.querySelector('.envelope');
const modal = document.getElementById('letter-modal');

function openEnvelope(){
  if(envelope.classList.contains('open')) return;

  envelope.classList.remove('closing');
  envelope.classList.add('open');

  setTimeout(() => {
    modal.classList.add('show');
  }, 900);
}

function closeLetter(e){
  if(e && e.target !== e.currentTarget) return;

  modal.classList.remove('show');

  envelope.classList.add('closing');

  const flap = envelope.querySelector('.env-flap');

  flap.addEventListener('transitionend', function handler(ev){
    if(ev.propertyName !== 'transform') return;

    envelope.classList.remove('open');
    envelope.classList.remove('closing');

    flap.removeEventListener('transitionend', handler);
  });
}