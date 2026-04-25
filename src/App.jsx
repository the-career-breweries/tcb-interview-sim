import { useState, useRef, useEffect } from "react";

const LIGHT = { dark:"#1C1410",amber:"#C97B2A",warm:"#E8A44A",cream:"#FAF3E8",mist:"#F0E8D8",ink:"#2D2017",soft:"#7A6652",border:"#DDD0BC",bg:"#FAF3E8" };
const DARK  = { dark:"#FAF3E8",amber:"#C97B2A",warm:"#E8A44A",cream:"#1C1410",mist:"#231A13",ink:"#F0E8D8",soft:"#C4A882",border:"#3D2E22",bg:"#141008" };
let C = { ...LIGHT };

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-font-smoothing: antialiased; transition: background 0.3s ease; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse { 0%,100%{opacity:.4;transform:scale(.95);}50%{opacity:1;transform:scale(1.05);} }
  @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
  @keyframes checkmark { 0%{opacity:0;transform:scale(.5);}60%{transform:scale(1.15);}100%{opacity:1;transform:scale(1);} }
  .fade-up { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-in { animation: fadeIn 0.35s ease both; }
  .slide-in { animation: slideIn 0.4s cubic-bezier(0.22,1,0.36,1) both; }
  textarea,input[type=text],input[type=email],input[type=tel] {
    font-family:'Plus Jakarta Sans',sans-serif; font-size:16px; color:var(--ink,#2D2017);
    background:var(--mist,#F0E8D8); border:1.5px solid var(--border,#DDD0BC);
    border-radius:12px; padding:13px 16px; width:100%; outline:none;
    transition:border-color .2s,box-shadow .2s;
  }
  textarea { resize:none; line-height:1.65; }
  textarea:focus,input:focus { border-color:var(--amber,#C97B2A); box-shadow:0 0 0 3px rgba(201,123,42,.1); }
  textarea::placeholder,input::placeholder { color:var(--border,#DDD0BC); }
  button { cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; }
  ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-track { background:var(--cream,#FAF3E8); } ::-webkit-scrollbar-thumb { background:var(--border,#DDD0BC); border-radius:3px; }
`;

const Lbl = ({children,note}) => (
  <div style={{marginBottom:"8px"}}>
    <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"11px",color:C.soft,letterSpacing:"0.08em",textTransform:"uppercase"}}>{children}</label>
    {note && <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.border,marginLeft:"8px"}}>{note}</span>}
  </div>
);
const Btn = ({children,onClick,disabled,full}) => (
  <button onClick={onClick} disabled={disabled}
    style={{background:disabled?C.border:C.amber,color:disabled?C.soft:C.cream,border:"none",borderRadius:"12px",padding:"14px 28px",fontSize:"15px",fontWeight:600,cursor:disabled?"not-allowed":"pointer",boxShadow:disabled?"none":"0 4px 14px rgba(201,123,42,.25)",transition:"all .2s",width:full?"100%":"auto",minHeight:"48px"}}
    onMouseEnter={e=>{if(!disabled){e.currentTarget.style.background=C.warm;e.currentTarget.style.transform="translateY(-1px)";}}}
    onMouseLeave={e=>{if(!disabled){e.currentTarget.style.background=C.amber;e.currentTarget.style.transform="translateY(0)";}}}>{children}</button>
);
const Ghost = ({children,onClick}) => (
  <button onClick={onClick} style={{background:"transparent",color:C.soft,border:"1.5px solid "+C.border,borderRadius:"12px",padding:"13px 22px",fontSize:"14px",transition:"all .2s"}}
    onMouseEnter={e=>{e.currentTarget.style.borderColor=C.soft;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;}}>{children}</button>
);
const Card = ({children,style}) => <div style={{background:C.mist,border:"1.5px solid "+C.border,borderRadius:"16px",padding:"22px 24px",...style}}>{children}</div>;
const Tag  = ({children}) => <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:"14px"}}>{children}</div>;
const Pulse = ({msg}) => (
  <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 0"}}>
    <div style={{width:"7px",height:"7px",borderRadius:"50%",background:C.amber,animation:"pulse 1.4s ease-in-out infinite",flexShrink:0}}/>
    <span style={{fontSize:"13px",color:C.soft,fontStyle:"italic"}}>{msg}</span>
  </div>
);

function useIsMobile() {
  const [m,setM]=useState(()=>window.innerWidth<768);
  useEffect(()=>{const fn=()=>setM(window.innerWidth<768);window.addEventListener("resize",fn,{passive:true});return()=>window.removeEventListener("resize",fn);},[]);
  return m;
}
function useRazorpay() {
  const [l,setL]=useState(false);
  useEffect(()=>{if(window.Razorpay){setL(true);return;}const s=document.createElement("script");s.src="https://checkout.razorpay.com/v1/checkout.js";s.onload=()=>setL(true);document.body.appendChild(s);},[]);
  return l;
}

// ── Theatrics Screen ──────────────────────────────────────────────────────────
const ANALYSIS_STEPS = [
  { label:"Reading the job description", detail:"Mapping key responsibilities, required skills, and experience signals", duration:1800 },
  { label:"Analysing the role requirements", detail:"Identifying what the hiring manager will be probing for in this role", duration:2000 },
  { label:"Cross-referencing your resume", detail:"Finding where your background aligns — and where gaps might surface", duration:2200 },
  { label:"Calibrating question difficulty", detail:"Setting the right level — not too easy, not a trap", duration:1900 },
  { label:"Selecting question types", detail:"Behavioural, technical, situational — balanced for this specific role", duration:1700 },
  { label:"Finalising your simulation", detail:"Eight questions. Real interview conditions. Ready.", duration:1500 },
];

function TheatricsScreen({ hasResume, onComplete }) {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let idx = 0;
    const steps = hasResume ? ANALYSIS_STEPS : ANALYSIS_STEPS.filter(s => !s.label.includes("resume"));
    const run = () => {
      if (idx >= steps.length) { setTimeout(() => { setDone(true); setTimeout(onComplete, 1200); }, 500); return; }
      setActiveStep(idx);
      setTimeout(() => {
        setCompletedSteps(p => [...p, idx]);
        idx++;
        setTimeout(run, 300);
      }, steps[idx].duration);
    };
    const t = setTimeout(run, 600);
    return () => clearTimeout(t);
  }, []);

  const steps = hasResume ? ANALYSIS_STEPS : ANALYSIS_STEPS.filter(s => !s.label.includes("resume"));

  return (
    <div style={{minHeight:"100vh",background:"#141008",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
      <div style={{maxWidth:"520px",width:"100%"}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:"32px",textAlign:"center"}}>
          {done ? "Simulation ready" : "Calibrating your interview"}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          {steps.map((step, i) => {
            const isActive = activeStep === i && !completedSteps.includes(i);
            const isDone   = completedSteps.includes(i);
            return (
              <div key={i} className={isDone||isActive?"fade-in":""} style={{display:"flex",gap:"14px",alignItems:"flex-start",opacity:isDone||isActive?1:0.2,transition:"opacity .4s"}}>
                <div style={{width:"22px",height:"22px",borderRadius:"50%",border:`1.5px solid ${isDone?"#4caf50":isActive?C.amber:"rgba(255,255,255,0.15)"}`,background:isDone?"rgba(76,175,80,0.15)":isActive?"rgba(201,123,42,0.15)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:"1px",transition:"all .4s"}}>
                  {isDone
                    ? <span style={{color:"#4caf50",fontSize:"11px",animation:"checkmark .3s ease both"}}>✓</span>
                    : isActive
                      ? <div style={{width:"6px",height:"6px",borderRadius:"50%",background:C.amber,animation:"pulse 1.2s infinite"}}/>
                      : null
                  }
                </div>
                <div>
                  <p style={{fontSize:"14px",fontWeight:isDone?400:isActive?600:400,color:isDone?"rgba(255,255,255,0.6)":isActive?"#FAF3E8":"rgba(255,255,255,0.25)",lineHeight:1.4,transition:"all .3s"}}>{step.label}</p>
                  {isActive && <p style={{fontSize:"12px",color:"rgba(255,255,255,0.35)",marginTop:"3px",lineHeight:1.5,fontStyle:"italic"}}>{step.detail}</p>}
                </div>
              </div>
            );
          })}
        </div>
        {done && (
          <div className="fade-in" style={{marginTop:"36px",textAlign:"center"}}>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:"22px",color:"#FAF3E8",fontWeight:300,marginBottom:"8px"}}>Your simulation is ready.</div>
            <p style={{fontSize:"13px",color:"rgba(255,255,255,0.4)"}}>Starting now…</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Simulation Screen ─────────────────────────────────────────────────────────
function SimulationScreen({ questions, jobTitle, company, onClose }) {
  const [currentQ, setCurrentQ]   = useState(0);
  const [answers, setAnswers]     = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [phase, setPhase]         = useState("question"); // question | answered | feedback | results
  const [answer, setAnswer]       = useState("");
  const [isListening, setIsListening] = useState(false);
  const [interim, setInterim]     = useState("");
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [muted, setMuted]         = useState(false);
  const recognitionRef = useRef(null);
  const finalRef       = useRef("");
  const mutedRef       = useRef(false);
  const scrollRef      = useRef(null);
  const voiceRef       = useRef(null);

  // always-dark overlay tokens
  const IV = {
    bg: "rgba(18,12,6,0.99)", card:"rgba(255,255,255,0.05)",
    border:"rgba(255,255,255,0.08)", text:"#FAF3E8",
    soft:"#A0876E", muted:"rgba(255,255,255,0.3)"
  };

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  // Load voice
  useEffect(() => {
    const pick = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      voiceRef.current = voices.find(v=>v.lang==="en-IN") || voices.find(v=>v.lang.startsWith("en")) || null;
    };
    pick();
    window.speechSynthesis?.addEventListener("voiceschanged", pick);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", pick);
  }, []);

  const speak = (text) => {
    if (mutedRef.current || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) utt.voice = voiceRef.current;
    utt.rate = 0.92; utt.pitch = 1.0;
    window.speechSynthesis.speak(utt);
  };

  // Speak first question on mount
  useEffect(() => {
    if (questions[0]) setTimeout(() => speak(questions[0].question), 800);
  }, []);

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    window.speechSynthesis?.cancel();
    finalRef.current = "";
    const recognition = new SR();
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = "en-US";
    recognition.onresult = (e) => {
      let iText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalRef.current = (finalRef.current + " " + e.results[i][0].transcript).trim();
        else iText += e.results[i][0].transcript;
      }
      setAnswer(finalRef.current + (iText ? " " + iText : ""));
      setInterim(iText);
    };
    recognition.onend = () => setInterim("");
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false); setInterim("");
    setAnswer(finalRef.current);
  };

  const submitAnswer = async () => {
    const finalAnswer = answer.trim();
    if (!finalAnswer) return;
    stopListening();
    const q = questions[currentQ];
    setAnswers(p => ({ ...p, [currentQ]: finalAnswer }));
    setPhase("answered");
    setLoadingFeedback(true);

    try {
      const r = await fetch("/api/interview-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q.question, answer: finalAnswer, jobTitle, company, questionType: q.type })
      });
      const d = await r.json();
      if (d.feedback) {
        setFeedbacks(p => ({ ...p, [currentQ]: d.feedback }));
        setPhase("feedback");
        if (!mutedRef.current) setTimeout(() => speak(d.feedback.verdict), 300);
      }
    } catch { setPhase("feedback"); }
    setLoadingFeedback(false);
  };

  const nextQuestion = () => {
    window.speechSynthesis?.cancel();
    if (currentQ < questions.length - 1) {
      const next = currentQ + 1;
      setCurrentQ(next); setAnswer(""); setPhase("question"); setInterim("");
      finalRef.current = "";
      setTimeout(() => speak(questions[next].question), 400);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    } else {
      setPhase("results");
    }
  };

  // Results
  if (phase === "results") {
    const scores = Object.values(feedbacks).map(f => f.score || 0);
    const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
    return (
      <div style={{position:"fixed",inset:0,background:IV.bg,zIndex:1100,overflowY:"auto",padding:"32px 20px"}}>
        <div style={{maxWidth:"680px",margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"40px"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:"16px"}}>Simulation complete</div>
            <div style={{width:"80px",height:"80px",borderRadius:"50%",border:"3px solid "+(avg>=7?"#4caf50":avg>=5?C.amber:"#e57373"),display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
              <span style={{fontFamily:"'Fraunces',serif",fontSize:"28px",color:avg>=7?"#4caf50":avg>=5?C.amber:"#e57373"}}>{avg}</span>
            </div>
            <p style={{fontSize:"15px",color:"rgba(255,255,255,0.6)"}}>{avg>=7?"Strong performance — you're interview-ready.":avg>=5?"Solid foundation — a few answers need sharpening.":"Needs work — practice these areas before the real thing."}</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            {questions.map((q, i) => {
              const fb = feedbacks[i];
              const sc = fb?.score || 0;
              return (
                <div key={i} style={{background:IV.card,border:"1px solid "+IV.border,borderRadius:"12px",padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"}}>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:IV.soft,letterSpacing:"0.1em",textTransform:"uppercase"}}>{q.type} · Q{i+1}</span>
                    {fb && <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"12px",color:sc>=7?"#4caf50":sc>=5?C.amber:"#e57373",fontWeight:600}}>{sc}/10</span>}
                  </div>
                  <p style={{fontSize:"13px",color:IV.text,lineHeight:1.6,marginBottom:"8px",fontStyle:"italic"}}>"{q.question}"</p>
                  {fb && (
                    <div style={{marginTop:"10px",paddingTop:"10px",borderTop:"1px solid "+IV.border}}>
                      <p style={{fontSize:"12px",color:C.amber,marginBottom:"4px",fontWeight:600}}>{fb.verdict}</p>
                      {fb.improve && <p style={{fontSize:"12px",color:IV.soft,lineHeight:1.55}}>↳ {fb.improve}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{marginTop:"28px",display:"flex",gap:"12px",flexWrap:"wrap",justifyContent:"center"}}>
            <button onClick={onClose} style={{background:"transparent",color:IV.muted,border:"1px solid "+IV.border,borderRadius:"10px",padding:"10px 20px",fontSize:"13px"}}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const fb = feedbacks[currentQ];
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <div style={{position:"fixed",inset:0,background:IV.bg,zIndex:1100,display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{padding:"12px 20px",borderBottom:"1px solid "+IV.border,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:C.amber,letterSpacing:"0.1em",textTransform:"uppercase"}}>{jobTitle} at {company}</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:IV.muted,marginTop:"2px"}}>Q{currentQ+1} of {questions.length} · {q?.type}</div>
        </div>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          {/* Progress dots */}
          <div style={{display:"flex",gap:"4px"}}>
            {questions.map((_,i) => (
              <div key={i} style={{width:"6px",height:"6px",borderRadius:"50%",background:i<currentQ?"#4caf50":i===currentQ?C.amber:IV.border,transition:"all .3s"}}/>
            ))}
          </div>
          <button onClick={()=>setMuted(m=>!m)} style={{background:IV.card,border:"1px solid "+IV.border,borderRadius:"8px",padding:"5px 8px",fontSize:"13px",cursor:"pointer"}} title={muted?"Unmute":"Mute"}>{muted?"🔇":"🔊"}</button>
          <button onClick={()=>{window.speechSynthesis?.cancel();onClose();}} style={{background:"transparent",color:IV.muted,border:"none",fontSize:"18px",cursor:"pointer",padding:"4px 8px"}}>✕</button>
        </div>
      </div>

      {/* Body */}
      <div ref={scrollRef} style={{flex:1,overflowY:"auto",padding:"24px 20px 80px",maxWidth:"680px",width:"100%",margin:"0 auto"}}>
        {/* Question */}
        <div style={{background:IV.card,border:"1px solid "+IV.border,borderRadius:"14px",padding:"20px 24px",marginBottom:"20px"}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:IV.soft,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"10px",display:"flex",alignItems:"center",gap:"8px"}}>
            {q?.type} question
            <span style={{background:"rgba(201,123,42,0.15)",color:C.amber,padding:"2px 8px",borderRadius:"4px",fontSize:"9px"}}>{q?.difficulty}</span>
          </div>
          <p style={{fontFamily:"'Fraunces',serif",fontSize:"18px",color:IV.text,fontWeight:300,lineHeight:1.5,marginBottom:"10px"}}>{q?.question}</p>
          {q?.hint && <p style={{fontSize:"12px",color:IV.soft,lineHeight:1.55,fontStyle:"italic"}}>Tip: {q.hint}</p>}
          {!muted && (
            <button onClick={()=>speak(q.question)} style={{marginTop:"10px",background:"transparent",border:"1px solid "+IV.border,color:IV.soft,borderRadius:"7px",padding:"5px 12px",fontSize:"11px",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>▶ Read aloud</button>
          )}
        </div>

        {/* Answer area */}
        {phase === "question" && (
          <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {isListening && (
              <div style={{background:"rgba(201,123,42,0.08)",border:"1.5px solid "+C.amber,borderRadius:"12px",padding:"14px 16px",minHeight:"80px"}}>
                <p style={{fontSize:"14px",color:IV.text,lineHeight:1.65}}>{answer}<span style={{color:IV.soft,fontStyle:"italic"}}>{interim?" "+interim:""}</span></p>
              </div>
            )}
            {!isListening && answer && (
              <div style={{background:IV.card,border:"1px solid "+IV.border,borderRadius:"12px",padding:"14px 16px"}}>
                <p style={{fontSize:"14px",color:IV.text,lineHeight:1.65}}>{answer}</p>
              </div>
            )}
            {!isListening && !answer && (
              <textarea rows={4} value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Type your answer here, or use the mic below…"
                style={{background:IV.card,border:"1px solid "+IV.border,color:IV.text,borderRadius:"12px",padding:"14px 16px",fontSize:"14px",lineHeight:1.65,minHeight:"100px"}}/>
            )}
            <div style={{display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
              {supported && (
                <button onClick={isListening?stopListening:startListening}
                  style={{background:isListening?"#c0392b":"rgba(255,255,255,0.08)",color:IV.text,border:"1px solid "+(isListening?"#c0392b":IV.border),borderRadius:"8px",padding:"9px 16px",fontSize:"13px",cursor:"pointer",display:"flex",alignItems:"center",gap:"7px",transition:"all .2s"}}>
                  {isListening
                    ? <><span style={{fontSize:"10px"}}>■</span> Stop</>
                    : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FAF3E8" strokeWidth="1.8" strokeLinecap="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> Speak</>
                  }
                </button>
              )}
              {answer.trim() && !isListening && (
                <button onClick={()=>{setAnswer("");finalRef.current="";}} style={{background:"transparent",color:IV.soft,border:"1px solid "+IV.border,borderRadius:"8px",padding:"8px 12px",fontSize:"11px",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>↺ Re-record</button>
              )}
              {answer.trim() && <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:IV.muted,marginLeft:"auto"}}>{wordCount} words</span>}
              <button onClick={submitAnswer} disabled={!answer.trim()||loadingFeedback||isListening}
                style={{marginLeft:"auto",background:!answer.trim()||loadingFeedback||isListening?"rgba(255,255,255,0.08)":C.amber,color:!answer.trim()||loadingFeedback||isListening?IV.muted:C.cream,border:"none",borderRadius:"10px",padding:"10px 22px",fontSize:"14px",fontWeight:600,cursor:!answer.trim()||loadingFeedback||isListening?"not-allowed":"pointer",transition:"all .2s"}}>
                {loadingFeedback?"Getting feedback…":"Submit answer →"}
              </button>
            </div>
          </div>
        )}

        {/* Loading feedback */}
        {phase === "answered" && <Pulse msg="Reading your answer and preparing feedback…"/>}

        {/* Feedback */}
        {phase === "feedback" && fb && (
          <div className="slide-in" style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {/* Score row */}
            <div style={{background:IV.card,border:"1px solid "+IV.border,borderRadius:"12px",padding:"16px 20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"12px"}}>
                <div style={{width:"44px",height:"44px",borderRadius:"50%",border:`2.5px solid ${fb.score>=7?"#4caf50":fb.score>=5?C.amber:"#e57373"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontFamily:"'Fraunces',serif",fontSize:"18px",color:fb.score>=7?"#4caf50":fb.score>=5?C.amber:"#e57373"}}>{fb.score}</span>
                </div>
                <div>
                  <p style={{fontSize:"14px",fontWeight:600,color:IV.text,lineHeight:1.4}}>{fb.verdict}</p>
                  <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:IV.soft,letterSpacing:"0.08em",marginTop:"3px"}}>{fb.score}/10</p>
                </div>
              </div>
              {fb.what_worked && <div style={{marginBottom:"8px"}}><p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:"#4caf50",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"4px"}}>What worked</p><p style={{fontSize:"13px",color:"rgba(255,255,255,0.7)",lineHeight:1.6}}>{fb.what_worked}</p></div>}
              {fb.improve && <div style={{marginBottom:"8px"}}><p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:C.amber,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"4px"}}>Sharpen this</p><p style={{fontSize:"13px",color:"rgba(255,255,255,0.7)",lineHeight:1.6}}>{fb.improve}</p></div>}
              {fb.stronger_angle && <div><p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:IV.soft,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"4px"}}>Stronger angle</p><p style={{fontSize:"13px",color:"rgba(255,255,255,0.6)",lineHeight:1.6,fontStyle:"italic"}}>"{fb.stronger_angle}"</p></div>}
            </div>
            <div style={{display:"flex",justifyContent:"flex-end"}}>
              <button onClick={nextQuestion} style={{background:C.amber,color:C.cream,border:"none",borderRadius:"10px",padding:"11px 24px",fontSize:"14px",fontWeight:600,cursor:"pointer"}} onMouseEnter={e=>e.target.style.background=C.warm} onMouseLeave={e=>e.target.style.background=C.amber}>
                {currentQ<questions.length-1?"Next question →":"See results →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
const SESSION_KEY = "tcb_sim_v1";

export default function App() {
  const isMobile   = useIsMobile();
  const razorReady = useRazorpay();
  const topRef     = useRef(null);

  const [isDark,setIsDark] = useState(()=>{ try{return localStorage.getItem("tcb_theme")==="dark";}catch{return false;} });
  const themeColors = isDark?DARK:LIGHT;
  Object.assign(C, themeColors);
  const toggleTheme = ()=>setIsDark(d=>{const n=!d;try{localStorage.setItem("tcb_theme",n?"dark":"light");}catch{}return n;});
  useEffect(()=>{ document.body.style.background=themeColors.bg; },[isDark]);
  const cssVars = `:root{--ink:${themeColors.ink};--mist:${themeColors.mist};--border:${themeColors.border};--cream:${themeColors.cream};--soft:${themeColors.soft};--amber:${themeColors.amber};}body{color:${themeColors.ink};}`;

  // URL params from other products
  const urlP = new URLSearchParams(window.location.search);
  const fromProduct = urlP.get("from") || "";
  const urlJobTitle = urlP.get("jobTitle") || "";
  const urlCompany  = urlP.get("company")  || "";

  // Session restore
  const saved = (()=>{ try{const r=localStorage.getItem(SESSION_KEY);return r?JSON.parse(r):null;}catch{return null;} })();

  const [step,setStep]         = useState(saved?.step||0);
  const [jobTitle,setJobTitle] = useState(saved?.jobTitle||urlJobTitle);
  const [company,setCompany]   = useState(saved?.company||urlCompany);
  const [jobDesc,setJobDesc]   = useState(saved?.jobDesc||"");
  const [resumeText,setResumeText] = useState(null); // not persisted — re-upload
  const [resumeName,setResumeName] = useState(saved?.resumeName||null);
  const [email,setEmail]       = useState(saved?.email||"");
  const [phone,setPhone]       = useState(saved?.phone||"");
  const [leadId,setLeadId]     = useState(saved?.leadId||null);
  const [paymentState,setPay]  = useState(saved?.paymentDone?"success":null);
  const [questions,setQuestions] = useState(saved?.questions||null);
  const [showTheatrics,setShowTheatrics] = useState(false);
  const [showSim,setShowSim]   = useState(false);
  const [generating,setGenerating] = useState(false);
  const [genError,setGenError] = useState("");
  const fileRef = useRef(null);

  const goTo = (s) => { if(topRef.current) topRef.current.scrollIntoView({behavior:"smooth"}); setTimeout(()=>setStep(s),80); };
  const clearAll = () => { try{localStorage.removeItem(SESSION_KEY);}catch{} setStep(0);setJobTitle(urlJobTitle);setCompany(urlCompany);setJobDesc("");setResumeText(null);setResumeName(null);setEmail("");setPhone("");setLeadId(null);setPay(null);setQuestions(null); };

  // Persist
  useEffect(()=>{
    if(step>0) {
      try{ localStorage.setItem(SESSION_KEY, JSON.stringify({step,jobTitle,company,jobDesc,resumeName,email,phone,leadId,paymentDone:paymentState==="success",questions})); }catch{}
    } else {
      try{ localStorage.removeItem(SESSION_KEY); }catch{}
    }
  },[step,jobTitle,company,jobDesc,resumeName,email,phone,leadId,paymentState,questions]);

  // Resume upload — extract text
  const handleResumeUpload = async (file) => {
    if (!file) return;
    const allowed = ["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","text/plain"];
    // For plain text extraction — use FileReader
    setResumeName(file.name);
    try {
      const text = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=()=>rej(); r.readAsText(file); });
      setResumeText(text.slice(0,4000)); // cap at 4000 chars — enough for Claude
    } catch {
      // PDF/Word — can't extract text client-side, send as name only
      setResumeText(`[Resume file: ${file.name} — questions calibrated to role and JD]`);
    }
  };

  // Payment
  const handlePayment = async () => {
    if(!window.Razorpay){ await new Promise(res=>{const s=document.createElement("script");s.src="https://checkout.razorpay.com/v1/checkout.js";s.onload=res;document.body.appendChild(s);}); }
    setPay("processing");
    try {
      const or = await fetch("/api/create-order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,jobTitle,company})});
      const order = await or.json();
      if(!or.ok||!order.orderId){setPay("failed");return;}
      new window.Razorpay({
        key:order.keyId, amount:order.amount, currency:order.currency,
        name:"The Career Breweries", description:`Interview Simulation — ${jobTitle}`,
        order_id:order.orderId,
        prefill:{email},
        theme:{color:C.amber},
        handler: async(response)=>{
          try{
            const vr=await fetch("/api/verify-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({razorpay_order_id:response.razorpay_order_id,razorpay_payment_id:response.razorpay_payment_id,razorpay_signature:response.razorpay_signature,email,phone,jobTitle,company,leadId})});
            const vd=await vr.json();
            if(vr.ok&&vd.success) setPay("success");
            else setPay("failed");
          }catch{setPay("failed");}
        },
        modal:{ondismiss:()=>setPay(null)},
      }).open();
    }catch{setPay("failed");}
  };

  // Generate questions — only called after payment
  const handleGenerate = async () => {
    setShowTheatrics(true);
  };

  const handleTheatricsDone = async () => {
    setShowTheatrics(false);
    setGenerating(true); setGenError("");
    try {
      const r = await fetch("/api/generate-questions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jobTitle,company,jobDescription:jobDesc,resumeText})});
      const d = await r.json();
      if(!r.ok||!d.questions){setGenError(d.error||"Generation failed. Try again.");setGenerating(false);return;}
      setQuestions(d.questions);
      setShowSim(true);
    }catch{setGenError("Something went wrong. Please try again.");}
    setGenerating(false);
  };

  // Simulation overlay
  if (showTheatrics) return (
    <>
      <style>{globalStyles}</style>
      <TheatricsScreen hasResume={!!resumeText} onComplete={handleTheatricsDone}/>
    </>
  );

  if (showSim && questions) return (
    <>
      <style>{globalStyles}</style>
      <SimulationScreen questions={questions} jobTitle={jobTitle} company={company} onClose={()=>setShowSim(false)}/>
    </>
  );

  // ── Header ──────────────────────────────────────────────────────────────────
  const Header = () => (
    <header style={{padding:isMobile?"13px 0":"18px 0",borderBottom:"1px solid "+C.border,marginBottom:isMobile?"28px":"44px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
        <img src={isDark?"/favicon-dark.png":"/favicon-light.png"} alt="TCB" style={{width:"34px",height:"34px",objectFit:"contain",mixBlendMode:isDark?"normal":"multiply"}}/>
        <div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:"13px",fontWeight:500,color:C.dark}}>The Career Breweries</div>
          {!isMobile&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:C.soft,letterSpacing:"0.08em",marginTop:"2px"}}>Interview Simulator</div>}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
        {step>0&&<button onClick={clearAll} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.soft,background:"transparent",border:"1px solid "+C.border,borderRadius:"8px",padding:"5px 10px",cursor:"pointer"}} onMouseEnter={e=>{e.currentTarget.style.color=C.amber;e.currentTarget.style.borderColor=C.amber;}} onMouseLeave={e=>{e.currentTarget.style.color=C.soft;e.currentTarget.style.borderColor=C.border;}}>+ New Sim</button>}
        <button onClick={toggleTheme} style={{display:"flex",alignItems:"center",gap:"4px",background:isDark?"rgba(255,255,255,0.08)":"rgba(28,20,16,0.07)",border:"1.5px solid "+C.border,borderRadius:"20px",padding:"4px 9px 4px 6px",cursor:"pointer"}}>
          <div style={{width:"22px",height:"13px",borderRadius:"7px",background:isDark?C.amber:C.border,position:"relative",flexShrink:0,transition:"background .25s"}}>
            <div style={{position:"absolute",top:"2px",left:isDark?"11px":"2px",width:"9px",height:"9px",borderRadius:"50%",background:"#fff",transition:"left .25s"}}/>
          </div>
          {!isMobile&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:C.soft}}>{isDark?"Dark":"Light"}</span>}
        </button>
      </div>
    </header>
  );

  const MobileBar = ({onBack,onNext,nextLabel,nextDisabled}) => isMobile ? (
    <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"12px 16px",background:themeColors.bg,borderTop:"1px solid "+C.border,zIndex:100,display:"flex",gap:"10px"}}>
      {onBack&&<button onClick={onBack} style={{background:"transparent",color:C.soft,border:"1.5px solid "+C.border,borderRadius:"12px",padding:"13px 18px",fontSize:"15px",cursor:"pointer",flexShrink:0}}>←</button>}
      <button onClick={onNext} disabled={nextDisabled} style={{flex:1,background:nextDisabled?C.border:C.amber,color:nextDisabled?C.soft:C.cream,border:"none",borderRadius:"12px",padding:"13px",fontSize:"15px",fontWeight:600,cursor:nextDisabled?"not-allowed":"pointer"}}>{nextLabel||"Continue →"}</button>
    </div>
  ) : null;

  const wrap = {maxWidth:"680px",margin:"0 auto",padding:isMobile?"0 16px":"0 24px"};

  // ── Step 0 — Landing ────────────────────────────────────────────────────────
  if (step===0) return (
    <>
      <style>{globalStyles}</style><style>{cssVars}</style>
      <div ref={topRef} style={{minHeight:"100vh",background:themeColors.bg}}>
        <div style={wrap}>
          <Header/>
          <div className="fade-up" style={{paddingBottom:"60px"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"11px",color:C.amber,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:"20px"}}>Interview Simulator</div>
            <h1 style={{fontFamily:"'Fraunces',serif",fontSize:isMobile?"clamp(30px,8vw,40px)":"clamp(34px,6vw,50px)",fontWeight:400,color:C.dark,lineHeight:1.15,marginBottom:"16px"}}>Practice the interview<br/><em style={{color:C.amber}}>before it counts.</em></h1>
            <p style={{fontSize:isMobile?"14px":"16px",color:C.soft,lineHeight:1.75,maxWidth:"480px",marginBottom:"10px"}}>AI-calibrated questions based on your role and JD. Answer out loud, get real feedback on every response. Walk in knowing exactly where you stand.</p>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"13px",color:C.amber,letterSpacing:"0.04em",marginBottom:"28px"}}>₹999 · 8 questions · Per-answer feedback</div>
            <div style={{display:"flex",gap:"12px",flexDirection:isMobile?"column":"row",marginBottom:"32px"}}>
              <Btn onClick={()=>goTo(1)} full={isMobile}>Start simulation →</Btn>
            </div>
            <Card style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:"16px"}}>
              {[
                {n:"01",t:"Role-specific",d:"Questions calibrated to your JD — not generic interview prep."},
                {n:"02",t:"Voice answers",d:"Speak your answers. Just like the real thing."},
                {n:"03",t:"Real feedback",d:"Score, what worked, what to sharpen — on every answer."},
              ].map(item=>(
                <div key={item.n}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,marginBottom:"6px"}}>{item.n}</div>
                  <div style={{fontSize:"13px",fontWeight:600,color:C.dark,marginBottom:"4px"}}>{item.t}</div>
                  <div style={{fontSize:"12px",color:C.soft,lineHeight:1.55}}>{item.d}</div>
                </div>
              ))}
            </Card>
            {fromProduct && (
              <div style={{marginTop:"14px",background:C.mist,border:"1px solid "+C.amber,borderRadius:"12px",padding:"14px 18px"}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:C.amber,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"6px"}}>Pre-filled from your {fromProduct}</div>
                <p style={{fontSize:"13px",color:C.ink}}>{urlJobTitle} at {urlCompany} — your details are ready on the next step.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // ── Step 1 — Role details ───────────────────────────────────────────────────
  if (step===1) return (
    <>
      <style>{globalStyles}</style><style>{cssVars}</style>
      <div ref={topRef} style={{minHeight:"100vh",background:themeColors.bg}}>
        <div style={wrap}>
          <Header/>
          <div className="fade-up" style={{paddingBottom:isMobile?"100px":"40px",display:"flex",flexDirection:"column",gap:"20px"}}>
            <div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"6px"}}>01 / 03 — The Role</div>
              <h2 style={{fontFamily:"'Fraunces',serif",fontSize:isMobile?"22px":"28px",fontWeight:400,color:C.dark,lineHeight:1.25}}>What role are you preparing for?</h2>
              <p style={{fontSize:"14px",color:C.soft,marginTop:"8px",lineHeight:1.65,maxWidth:"480px"}}>The more complete your JD, the sharper the questions. Paste the full thing — responsibilities, requirements, all of it.</p>
            </div>
            <Card style={{display:"flex",flexDirection:"column",gap:"14px"}}>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:"14px"}}>
                <div><Lbl>Job Title</Lbl><input type="text" value={jobTitle} onChange={e=>setJobTitle(e.target.value)} placeholder="Product Manager"/></div>
                <div><Lbl note="optional">Company</Lbl><input type="text" value={company} onChange={e=>setCompany(e.target.value)} placeholder="Acme Inc."/></div>
              </div>
              <div>
                <Lbl>Job Description</Lbl>
                <textarea rows={8} value={jobDesc} onChange={e=>setJobDesc(e.target.value)} placeholder="Paste the full job description here…" style={{minHeight:"160px"}}/>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"11px",color:C.soft,textAlign:"right",marginTop:"4px"}}>{jobDesc.trim().length} chars{jobDesc.trim().length<100&&jobDesc.trim().length>0?<span style={{color:C.amber}}> · add more for better questions</span>:null}</div>
              </div>
            </Card>
            {!isMobile&&<div style={{display:"flex",gap:"12px"}}><Btn onClick={()=>goTo(2)} disabled={!jobTitle.trim()||jobDesc.trim().length<50}>Continue →</Btn></div>}
          </div>
        </div>
      </div>
      <MobileBar onBack={()=>goTo(0)} onNext={()=>goTo(2)} nextDisabled={!jobTitle.trim()||jobDesc.trim().length<50}/>
    </>
  );

  // ── Step 2 — Resume upload ──────────────────────────────────────────────────
  if (step===2) return (
    <>
      <style>{globalStyles}</style><style>{cssVars}</style>
      <div ref={topRef} style={{minHeight:"100vh",background:themeColors.bg}}>
        <div style={wrap}>
          <Header/>
          <div className="fade-up" style={{paddingBottom:isMobile?"100px":"40px",display:"flex",flexDirection:"column",gap:"20px"}}>
            <div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"6px"}}>02 / 03 — Your Resume</div>
              <h2 style={{fontFamily:"'Fraunces',serif",fontSize:isMobile?"22px":"28px",fontWeight:400,color:C.dark,lineHeight:1.25}}>Share your resume for sharper questions.</h2>
              <p style={{fontSize:"14px",color:C.soft,marginTop:"8px",lineHeight:1.65,maxWidth:"480px"}}>Optional — but if you upload it, the AI will ask questions specific to your background, not just the role. The gap questions will hit closer to home too.</p>
            </div>
            <Card>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{display:"none"}} onChange={e=>handleResumeUpload(e.target.files[0])}/>
              {!resumeName ? (
                <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                  <div onClick={()=>fileRef.current?.click()} style={{background:C.cream,border:"2px dashed "+C.border,borderRadius:"12px",padding:"28px",textAlign:"center",cursor:"pointer",transition:"all .2s"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=C.amber;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;}}>
                    <div style={{fontSize:"24px",marginBottom:"8px"}}>📄</div>
                    <div style={{fontSize:"14px",fontWeight:600,color:C.dark,marginBottom:"4px"}}>Upload your resume</div>
                    <div style={{fontSize:"12px",color:C.soft}}>PDF, Word, or text · Max 5MB</div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <span style={{fontSize:"12px",color:C.soft}}>or </span>
                    <button onClick={()=>goTo(3)} style={{background:"none",border:"none",fontSize:"12px",color:C.amber,cursor:"pointer",textDecoration:"underline"}}>skip this and continue without it</button>
                  </div>
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                  <div style={{background:C.mist,border:"1.5px solid "+C.amber,borderRadius:"12px",padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"10px"}}><span style={{fontSize:"18px"}}>✅</span><span style={{fontSize:"14px",color:C.ink}}>{resumeName}</span></div>
                    <button onClick={()=>{setResumeName(null);setResumeText(null);}} style={{background:"transparent",border:"none",fontSize:"12px",color:C.soft,cursor:"pointer",textDecoration:"underline"}}>Remove</button>
                  </div>
                  {fromProduct && <div style={{background:C.mist,border:"1px solid "+C.border,borderRadius:"10px",padding:"12px 16px"}}><p style={{fontSize:"12px",color:C.soft}}>💡 If you built or rewrote your resume with The Career Breweries, upload that file here for the most calibrated questions.</p></div>}
                </div>
              )}
            </Card>
            {!isMobile&&<div style={{display:"flex",gap:"12px"}}><Ghost onClick={()=>goTo(1)}>← Back</Ghost><Btn onClick={()=>goTo(3)}>Continue →</Btn></div>}
          </div>
        </div>
      </div>
      <MobileBar onBack={()=>goTo(1)} onNext={()=>goTo(3)} nextLabel="Continue →"/>
    </>
  );

  // ── Step 3 — Lead capture + payment ────────────────────────────────────────
  if (step===3) return (
    <>
      <style>{globalStyles}</style><style>{cssVars}</style>
      <div ref={topRef} style={{minHeight:"100vh",background:themeColors.bg}}>
        <div style={wrap}>
          <Header/>
          <div className="fade-up" style={{paddingBottom:isMobile?"100px":"40px",display:"flex",flexDirection:"column",gap:"20px"}}>
            <div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"6px"}}>03 / 03 — Ready</div>
              <h2 style={{fontFamily:"'Fraunces',serif",fontSize:isMobile?"22px":"28px",fontWeight:400,color:C.dark,lineHeight:1.25}}>One payment. Eight calibrated questions.</h2>
              <p style={{fontSize:"14px",color:C.soft,marginTop:"8px",lineHeight:1.65,maxWidth:"480px"}}>For {jobTitle}{company?" at "+company:""}. {resumeName?"With your resume uploaded — questions will reflect your background.":"Questions calibrated to the JD."}</p>
            </div>

            {/* Contact */}
            {!paymentState && (
              <Card style={{display:"flex",flexDirection:"column",gap:"14px"}}>
                <Tag>Your details</Tag>
                <div><Lbl>Email</Lbl><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div>
                <div><Lbl>Phone</Lbl><input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 98765 43210"/></div>
              </Card>
            )}

            {/* What you get */}
            {!paymentState && (
              <div style={{background:"#1C1410",borderRadius:"16px",padding:"22px 26px"}}>
                <Tag>What you get</Tag>
                {["8 questions specific to your role and JD","Behavioural, technical, situational and motivation questions","Answer out loud — voice-first","Immediate feedback on every answer: score, what worked, what to sharpen","Overall readiness score at the end"].map((pt,i)=>(
                  <div key={i} style={{display:"flex",gap:"10px",marginBottom:"8px"}}>
                    <span style={{color:C.amber,flexShrink:0}}>·</span>
                    <span style={{fontSize:"13px",color:"rgba(255,255,255,0.8)",lineHeight:1.6}}>{pt}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Payment */}
            {!paymentState && (
              <div style={{display:"flex",gap:"12px",flexDirection:isMobile?"column":"row",alignItems:isMobile?"stretch":"center"}}>
                <Btn onClick={async()=>{
                  if(!leadId){ const lr=await fetch("/api/save-lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,phone,jobTitle,company})}).then(r=>r.json()).catch(()=>({})); if(lr.leadId) setLeadId(lr.leadId); }
                  handlePayment();
                }} disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||paymentState==="processing"} full={isMobile}>
                  {paymentState==="processing"?"Opening payment…":"Pay ₹999 and start →"}
                </Btn>
                {!isMobile&&<Ghost onClick={()=>goTo(2)}>← Back</Ghost>}
              </div>
            )}
            {paymentState==="failed"&&<p style={{fontSize:"13px",color:"#c0392b"}}>Payment didn't go through. <button onClick={()=>setPay(null)} style={{background:"none",border:"none",color:C.amber,cursor:"pointer",fontSize:"13px",textDecoration:"underline"}}>Try again</button></p>}

            {/* Post-payment */}
            {paymentState==="success" && !questions && (
              <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                <Card style={{borderColor:C.amber}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:C.amber,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px"}}>Payment confirmed — ₹999</div>
                  <p style={{fontSize:"14px",color:C.ink,lineHeight:1.6}}>Ready to calibrate your simulation. This takes about 15 seconds.</p>
                </Card>
                {!generating&&<Btn onClick={handleGenerate} full={isMobile}>Begin simulation →</Btn>}
                {generating&&<div style={{paddingTop:"8px"}}><Pulse msg="Generating your questions…"/></div>}
                {genError&&<p style={{fontSize:"13px",color:"#c0392b"}}>{genError} <button onClick={handleGenerate} style={{background:"none",border:"none",color:C.amber,cursor:"pointer",fontSize:"13px",textDecoration:"underline"}}>Try again</button></p>}
              </div>
            )}

            {/* Resume already done — show sim again */}
            {paymentState==="success" && questions && !showSim && (
              <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                <Card style={{borderColor:C.amber}}>
                  <p style={{fontSize:"14px",color:C.ink}}>Your simulation is ready — {questions.length} questions for {jobTitle}.</p>
                </Card>
                <Btn onClick={()=>setShowSim(true)} full={isMobile}>Resume simulation →</Btn>
              </div>
            )}
          </div>
        </div>
      </div>
      {isMobile&&!paymentState&&<MobileBar onBack={()=>goTo(2)} onNext={()=>{}} nextLabel="Pay ₹999 →"/>}
    </>
  );

  return null;
}
