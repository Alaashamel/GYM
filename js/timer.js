/* ============================================
   IRON FORGE GYM — Rest Timer
   ============================================ */

function createRestTimer({ displayEl, ringEl, onEnd }){
  let total = 60, remaining = 60, interval = null, running = false;

  function render(){
    const m = Math.floor(remaining/60).toString().padStart(2,'0');
    const s = Math.floor(remaining%60).toString().padStart(2,'0');
    displayEl.textContent = `${m}:${s}`;
    if(ringEl){
      const pct = Math.max(0, remaining/total);
      ringEl.style.setProperty('--pct', pct);
    }
  }

  function beep(){
    try{
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880; gain.gain.value = .15;
      osc.start(); osc.stop(ctx.currentTime + .35);
    }catch(e){/* ignore */}
  }

  return {
    setDuration(sec){ total = sec; remaining = sec; render(); },
    start(){
      if(running) return; running = true;
      interval = setInterval(()=>{
        remaining -= 1;
        if(remaining <= 0){ remaining = 0; render(); this.stop(); beep(); if(onEnd) onEnd(); return; }
        render();
      }, 1000);
    },
    stop(){ running = false; clearInterval(interval); },
    reset(){ this.stop(); remaining = total; render(); },
    render,
    isRunning(){ return running; }
  };
}
