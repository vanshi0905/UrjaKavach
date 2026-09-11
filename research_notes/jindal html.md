\<\!DOCTYPE html\>

\<html lang="en"\>

\<head\>

\<meta charset="UTF-8"\>

\<meta name="viewport" content="width=device-width, initial-scale=1.0"\>

\<title\>Charge Sheet — Stainless Steel Carbon \&amp; Energy Calculator\</title\>

\<link rel="preconnect" href="https://fonts.googleapis.com"\>

\<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700\&family=IBM+Plex+Sans:wght@400;500;600\&family=IBM+Plex+Mono:wght@400;500\&display=swap" rel="stylesheet"\>

\<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"\>\</script\>

\<style\>

  :root{

    \--bg:\#14171a; \--bg-raise:\#1b1f23; \--panel:\#20252a; \--line:\#333a41;

    \--text:\#eceeef; \--muted:\#8b9298;

    \--cold:\#4a90a4; \--cold-bright:\#6fc7dd;

    \--hot:\#e8622c; \--hot-bright:\#ff7f45;

    \--good:\#4fbf9f; \--warn:\#e0b84a;

    \--s1:\#8b9298; \--s2:\#4a90a4; \--s3:\#e0b84a;

  }

  \*{box-sizing:border-box;}

  html,body{margin:0;padding:0;}

  body{

    background:radial-gradient(1200px 600px at 15% \-10%, \#23282e 0%, transparent 60%),

      radial-gradient(900px 500px at 110% 10%, \#1c2a2c 0%, transparent 55%), var(--bg);

    color:var(--text); font-family:'IBM Plex Sans', sans-serif; \-webkit-font-smoothing:antialiased;

  }

  .wrap{max-width:1220px;margin:0 auto;padding:36px 22px 80px;}

  header{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;border-bottom:1px solid var(--line);padding-bottom:22px;margin-bottom:28px;flex-wrap:wrap;}

  .kicker{font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:.04em;color:var(--muted);margin:0 0 6px;}

  h1{font-family:'Oswald',sans-serif;font-weight:600;font-size:34px;line-height:1.1;margin:0 0 8px;letter-spacing:.01em;}

  h1 span{color:var(--hot-bright);}

  .sub{color:var(--muted);font-size:14.5px;max-width:560px;line-height:1.5;margin:0;}

  .plant-id{font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--muted);text-align:right;line-height:1.7;}

  .plant-id b{color:var(--text);}

  .grid{display:grid;grid-template-columns:360px 1fr;gap:20px;}

  @media (max-width:940px){.grid{grid-template-columns:1fr;}}

  .panel{background:var(--panel);border:1px solid var(--line);padding:20px 20px 22px;}

  .panel h2{font-family:'Oswald',sans-serif;font-weight:500;font-size:15px;text-transform:uppercase;letter-spacing:.06em;margin:0 0 16px;color:var(--muted);border-bottom:1px solid var(--line);padding-bottom:10px;}

  .subhead{font-family:'IBM Plex Mono',monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--cold-bright);margin:18px 0 10px;border-top:1px solid var(--line);padding-top:14px;}

  .subhead:first-of-type{border-top:none;padding-top:0;margin-top:0;}

  .field{margin-bottom:18px;}

  .field label{display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:8px;color:var(--text);}

  .field label .val{font-family:'IBM Plex Mono',monospace;color:var(--cold-bright);font-size:13px;}

  select{width:100%;background:var(--bg-raise);color:var(--text);border:1px solid var(--line);padding:9px 10px;font-family:'IBM Plex Sans',sans-serif;font-size:13.5px;}

  input\[type=range\]{-webkit-appearance:none;width:100%;height:4px;background:var(--line);outline:none;margin-top:4px;}

  input\[type=range\]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;background:var(--cold-bright);cursor:pointer;border:2px solid var(--bg);}

  input\[type=range\]::-moz-range-thumb{width:14px;height:14px;background:var(--cold-bright);cursor:pointer;border:2px solid var(--bg);border-radius:0;}

  .hint{font-size:11.5px;color:var(--muted);margin-top:5px;line-height:1.4;}

  .num-row{display:flex;align-items:center;gap:8px;}

  .num-row input\[type=range\]{flex:1;margin-top:0;}

  .num-row input\[type=number\]{width:58px;background:var(--bg-raise);color:var(--cold-bright);border:1px solid var(--line);padding:5px 6px;font-family:'IBM Plex Mono',monospace;font-size:13px;text-align:right;}

  .num-row .pct{color:var(--muted);font-size:12px;width:10px;}

  .toggle-row{display:flex;gap:8px;flex-wrap:wrap;}

  .toggle{flex:1;min-width:64px;text-align:center;padding:8px 6px;border:1px solid var(--line);background:var(--bg-raise);font-size:11.5px;cursor:pointer;color:var(--muted);}

  .toggle.active{border-color:var(--cold-bright);color:var(--cold-bright);background:\#1d2b30;}

  .checkbox-row{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--text);cursor:pointer;}

  .checkbox-row input{accent-color:var(--cold-bright);}

  .grade-desc{font-size:12px;color:var(--muted);line-height:1.5;margin-top:8px;padding:10px;background:var(--bg-raise);border-left:2px solid var(--cold);}

  .grade-desc b{color:var(--text);}

  \#optimizeBtn{width:100%;padding:13px;margin-top:6px;background:var(--hot);border:none;color:\#161311;font-family:'Oswald',sans-serif;font-weight:600;font-size:14px;letter-spacing:.03em;text-transform:uppercase;cursor:pointer;}

  \#optimizeBtn:hover{background:var(--hot-bright);}

  \#resetBtn{width:100%;padding:9px;margin-top:8px;background:transparent;border:1px solid var(--line);color:var(--muted);font-size:12px;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;}

  \#overrideToggle{width:100%;padding:9px;margin-top:8px;background:transparent;border:1px dashed var(--line);color:var(--muted);font-size:11.5px;cursor:pointer;font-family:'IBM Plex Mono',monospace;}

  .readout{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;}

  @media (max-width:700px){.readout{grid-template-columns:1fr;}}

  .big-number{background:var(--panel);border:1px solid var(--line);padding:24px 24px 20px;}

  .big-number .label{font-size:12.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-family:'IBM Plex Mono',monospace;}

  .big-number .num{font-family:'Oswald',sans-serif;font-size:58px;font-weight:600;line-height:1;margin:10px 0 4px;transition:color .25s;}

  .big-number .unit{font-size:14px;color:var(--muted);}

  .equiv{font-size:12.5px;color:var(--cold-bright);margin-top:10px;line-height:1.4;}

  .delta{font-size:13px;margin-top:12px;padding-top:12px;border-top:1px solid var(--line);}

  .delta.good{color:var(--good);} .delta.bad{color:var(--hot-bright);}

  .scope-split{display:flex;gap:0;margin-top:14px;border-top:1px solid var(--line);padding-top:12px;font-size:11px;}

  .scope-split div{flex:1;text-align:center;}

  .scope-split .sw{display:inline-block;width:8px;height:8px;margin-right:4px;}

  .energy-number{background:var(--panel);border:1px solid var(--line);padding:24px;}

  .mini-stats{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px;}

  .mini-stats div{border-top:1px solid var(--line);padding-top:10px;}

  .mini-stats .mval{font-family:'Oswald',sans-serif;font-size:19px;}

  .mini-stats .mlab{font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;}

  .chart-panel{background:var(--panel);border:1px solid var(--line);padding:20px;margin-bottom:20px;}

  .chart-panel h2{font-family:'Oswald',sans-serif;font-weight:500;font-size:15px;text-transform:uppercase;letter-spacing:.06em;margin:0 0 4px;color:var(--muted);}

  .chart-panel .note{font-size:12px;color:var(--muted);margin-bottom:14px;}

  canvas{max-height:280px;}

  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:20px;}

  @media (max-width:940px){.two-col{grid-template-columns:1fr;}}

  \#optNote{font-size:12.5px;color:var(--good);margin-top:10px;line-height:1.5;display:none;padding:10px;background:\#132420;border-left:2px solid var(--good);}

  .steptable{width:100%;border-collapse:collapse;font-size:12px;margin-top:6px;}

  .steptable th,.steptable td{border:1px solid var(--line);padding:7px 8px;text-align:right;}

  .steptable th:first-child,.steptable td:first-child{text-align:left;}

  .steptable th{color:var(--muted);font-weight:500;background:var(--bg-raise);font-size:11px;text-transform:uppercase;}

  .steptable tr.total td{font-weight:600;color:var(--text);border-top:2px solid var(--line);}

  .rstep{display:flex;gap:14px;padding:12px 0;border-top:1px solid var(--line);align-items:flex-start;}

  .rstep:first-child{border-top:none;}

  .rstep .rnum{font-family:'Oswald',sans-serif;font-size:20px;color:var(--muted);width:26px;flex-shrink:0;}

  .rstep .rbody{flex:1;}

  .rstep .rtitle{font-size:13.5px;color:var(--text);margin-bottom:4px;}

  .rstep .rmeta{display:flex;gap:10px;flex-wrap:wrap;font-size:11px;}

  .rtag{padding:2px 8px;border:1px solid var(--line);color:var(--muted);}

  .rtag.easy{border-color:var(--good);color:var(--good);}

  .rtag.medium{border-color:var(--warn);color:var(--warn);}

  .rtag.hard{border-color:var(--hot);color:var(--hot-bright);}

  .rstep .rdelta{font-family:'IBM Plex Mono',monospace;color:var(--cold-bright);white-space:nowrap;}

  .rstep .rrun{font-size:11px;color:var(--muted);margin-top:2px;}

  .override-panel{display:none;background:var(--bg-raise);border:1px dashed var(--line);padding:14px;margin-top:10px;}

  .override-panel .of{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:12px;}

  .override-panel .of input{width:70px;background:var(--panel);color:var(--cold-bright);border:1px solid var(--line);padding:4px 6px;font-family:'IBM Plex Mono',monospace;font-size:12px;text-align:right;}

  .elem-grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(220px,1fr));gap:12px;}

  .elem-card{background:var(--bg-raise);border:1px solid var(--line);padding:14px;border-left:3px solid var(--cold);}

  .elem-card.hot-elem{border-left-color:var(--hot);}

  .elem-card .ename{font-family:'Oswald',sans-serif;font-size:15px;color:var(--text);display:flex;justify-content:space-between;align-items:baseline;}

  .elem-card .epct{font-family:'IBM Plex Mono',monospace;color:var(--cold-bright);font-size:14px;}

  .elem-card.hot-elem .epct{color:var(--hot-bright);}

  .elem-card .erole{font-size:12px;color:\#c7ccd0;margin:8px 0 6px;line-height:1.45;}

  .elem-card .ecarbon{font-size:11px;color:var(--muted);line-height:1.4;padding-top:6px;border-top:1px solid var(--line);}

  .reality-box{background:var(--panel);border:1px solid var(--line);padding:20px;margin-bottom:20px;}

  .reality-box h2{font-family:'Oswald',sans-serif;font-weight:500;font-size:15px;text-transform:uppercase;letter-spacing:.06em;margin:0 0 12px;color:var(--muted);}

  .reality-grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(200px,1fr));gap:16px;}

  .reality-grid div{border-left:2px solid var(--good);padding-left:12px;}

  .reality-grid .rval{font-family:'Oswald',sans-serif;font-size:24px;color:var(--text);}

  .reality-grid .rlab{font-size:11.5px;color:var(--muted);margin-top:2px;}

  details{background:var(--panel);border:1px solid var(--line);padding:16px 20px;margin-top:22px;}

  summary{cursor:pointer;font-family:'Oswald',sans-serif;font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);}

  .methodology{margin-top:16px;font-size:13px;line-height:1.7;color:\#c7ccd0;}

  .methodology table{width:100%;border-collapse:collapse;font-size:12px;margin:10px 0 18px;}

  .methodology th,.methodology td{border:1px solid var(--line);padding:6px 8px;text-align:left;}

  .methodology th{color:var(--muted);font-weight:500;background:var(--bg-raise);}

  .methodology code{font-family:'IBM Plex Mono',monospace;color:var(--cold-bright);}

  .methodology h3{font-family:'Oswald',sans-serif;font-weight:500;font-size:14px;color:var(--text);margin:18px 0 6px;}

  .src{color:var(--muted);}

  .disclaimer{margin-top:16px;padding:12px;background:var(--bg-raise);border-left:2px solid var(--warn);font-size:12px;color:var(--muted);line-height:1.6;}

  footer{margin-top:26px;font-size:12px;color:var(--muted);text-align:center;}

\</style\>

\</head\>

\<body\>

\<div class="wrap"\>

  \<header\>

    \<div\>

      \<p class="kicker"\>JINDAL STAINLESS · SUSTAINABILITY TOOLING\</p\>

      \<h1\>Charge Sheet\<span\>.\</span\>\</h1\>

      \<p class="sub"\>A furnace-to-finished-coil carbon \&amp; energy planner for stainless steelmaking — built on 34 real JSL grades, JSL's actual product range, and India-specific data. Set the melt route, charge mix, casting method and final product — watch the tonne of CO₂ move.\</p\>

    \</div\>

    \<div class="plant-id"\>

      ROUTE: \<b\>EAF/IF \+ AOD(/VOD)\</b\>\<br\>

      GRID (default): \<b\>India, CEA CM FY24-25\</b\>\<br\>

      BASIS: \<b\>1 tonne finished product\</b\>

    \</div\>

  \</header\>

  \<div class="grid"\>

    \<div class="panel"\>

      \<div class="subhead"\>1 · Grade \&amp; final product\</div\>

      \<div class="field"\>

        \<label\>Grade \<span class="val" id="gradeVal"\>J304\</span\>\</label\>

        \<select id="grade"\>\</select\>

        \<div class="grade-desc" id="gradeDesc"\>\</div\>

      \</div\>

      \<div class="field" id="customFields" style="display:none;"\>

        \<label\>Build your own composition\</label\>

        \<div class="hint" style="margin-bottom:10px;"\>Not restricted to a named grade — set each alloying element's share yourself and the model computes its footprint live. Every % here is on top of the iron balance.\</div\>

        \<div class="num-row" style="margin-bottom:8px;"\>\<span style="width:70px;font-size:12.5px;"\>Cr %\</span\>\<input type="range" id="customCr" min="10.5" max="28" step="0.1" value="18.2"\>\<input type="number" id="customCrNum" min="10.5" max="28" step="0.1" value="18.2"\>\</div\>

        \<div class="num-row" style="margin-bottom:8px;"\>\<span style="width:70px;font-size:12.5px;"\>Ni %\</span\>\<input type="range" id="customNi" min="0" max="28" step="0.1" value="8.1"\>\<input type="number" id="customNiNum" min="0" max="28" step="0.1" value="8.1"\>\</div\>

        \<div class="num-row" style="margin-bottom:8px;"\>\<span style="width:70px;font-size:12.5px;"\>Mo %\</span\>\<input type="range" id="customMo" min="0" max="5" step="0.1" value="0"\>\<input type="number" id="customMoNum" min="0" max="5" step="0.1" value="0"\>\</div\>

        \<div class="num-row" style="margin-bottom:8px;"\>\<span style="width:70px;font-size:12.5px;"\>Mn %\</span\>\<input type="range" id="customMn" min="0" max="11" step="0.1" value="0"\>\<input type="number" id="customMnNum" min="0" max="11" step="0.1" value="0"\>\</div\>

        \<div class="num-row"\>\<span style="width:70px;font-size:12.5px;"\>Cu %\</span\>\<input type="range" id="customCu" min="0" max="4" step="0.1" value="0"\>\<input type="number" id="customCuNum" min="0" max="4" step="0.1" value="0"\>\</div\>

      \</div\>

      \<div class="field"\>

        \<label\>Final product\</label\>

        \<select id="product"\>\</select\>

        \<div class="hint" id="productHint"\>\</div\>

      \</div\>

      \<div class="subhead"\>2 · Furnace route\</div\>

      \<div class="field"\>

        \<label\>Primary steelmaking route\</label\>

        \<div class="toggle-row"\>

          \<div class="toggle active" data-group="furnace" data-val="eaf"\>EAF\</div\>

          \<div class="toggle" data-group="furnace" data-val="if"\>Induction Furnace\</div\>

          \<div class="toggle" data-group="furnace" data-val="bfbof"\>Blast Furnace–BOF\</div\>

        \</div\>

        \<div class="hint" id="furnaceHint"\>EAF is the route JSL and every other stainless producer actually uses. Induction furnaces are common among smaller Indian secondary producers but run less energy-efficiently. Blast Furnace–BOF is included for direct comparison against the classic public steel-carbon calculators — see the warning below if you select it.\</div\>

        \<div class="hint" id="bfbofWarning" style="display:none;color:var(--hot-bright);background:var(--bg-raise);border-left:2px solid var(--hot);padding:9px;margin-top:8px;"\>⚠ Blast Furnace–BOF cannot carry chromium, nickel or molybdenum through the process — those elements oxidise and are lost in the oxidising BOF vessel, which is exactly why no stainless steel in the world is made this way. Selecting it zeroes out the grade's alloy content and models the plain-carbon-steel equivalent instead, so you can compare directly against BF-BOF benchmarks (worldsteel, EU ETS, CBAM, India's CCTS). Scrap share is also capped at \~30%, the real physical limit of a BOF's heat balance — unlike an EAF, a BOF has no separate power source to melt extra scrap.\</div\>

      \</div\>

      \<div class="field" id="refineField"\>

        \<label\>Refining\</label\>

        \<div class="toggle-row"\>

          \<div class="toggle active" data-group="refine" data-val="aod"\>AOD only\</div\>

          \<div class="toggle" data-group="refine" data-val="aodvod"\>AOD \+ VOD\</div\>

        \</div\>

        \<div class="hint"\>VOD adds vacuum decarburisation for ultra-low-carbon / high-purity grades (L-grades, some duplex) — better quality, extra electricity. Not applicable to the Blast Furnace–BOF route (replaced by BOF oxygen-blowing).\</div\>

      \</div\>

      \<div class="field"\>

        \<label\>Casting method\</label\>

        \<div class="toggle-row"\>

          \<div class="toggle active" data-group="cast" data-val="continuous"\>Continuous\</div\>

          \<div class="toggle" data-group="cast" data-val="ingot"\>Ingot\</div\>

        \</div\>

        \<div class="hint"\>Continuous casting is standard practice today. Ingot casting still appears for some heavy/duplex plate — extra reheating fuel and lower yield.\</div\>

      \</div\>

      \<div class="subhead"\>3 · Charge mix\</div\>

      \<div class="field"\>

        \<label\>Scrap share of charge\</label\>

        \<div class="num-row"\>

          \<input type="range" id="scrap" min="0" max="90" value="60" step="1"\>

          \<input type="number" id="scrapNum" min="0" max="90" value="60" step="1"\>

          \<span class="pct"\>%\</span\>

        \</div\>

        \<div class="hint" id="scrapHint"\>Scrap carries its Cr/Ni/Mo with it — every tonne substituted avoids virgin ferrochrome, nickel and ferromolybdenum together.\</div\>

      \</div\>

      \<div class="field"\>

        \<label\>Virgin iron unit\</label\>

        \<div class="toggle-row"\>

          \<div class="toggle active" data-group="feSource" data-val="coalDRI"\>Coal DRI\</div\>

          \<div class="toggle" data-group="feSource" data-val="gasDRI"\>Gas DRI\</div\>

          \<div class="toggle" data-group="feSource" data-val="pigIron"\>Pig iron\</div\>

        \</div\>

        \<div class="hint"\>India's sponge iron is \~85% coal-based rotary-kiln DRI — the most avoidable lever most calculators ignore.\</div\>

      \</div\>

      \<div class="field"\>

        \<label\>Ferrochrome source\</label\>

        \<div class="toggle-row"\>

          \<div class="toggle active" data-group="fecrSource" data-val="standard"\>Standard SAF\</div\>

          \<div class="toggle" data-group="fecrSource" data-val="lowc"\>Closed \+ preheat\</div\>

        \</div\>

      \</div\>

      \<div class="field"\>

        \<label\>Alloy recovery practice \<span class="val" id="recovVal"\>standard\</span\>\</label\>

        \<div class="toggle-row"\>

          \<div class="toggle active" data-group="recovery" data-val="standard"\>Standard\</div\>

          \<div class="toggle" data-group="recovery" data-val="optimised"\>Optimised\</div\>

        \</div\>

      \</div\>

      \<div class="subhead"\>4 · Power\</div\>

      \<div class="field"\>

        \<label\>Grid region\</label\>

        \<select id="gridRegion"\>

          \<option value="india" selected\>India — CEA CM (0.72 tCO₂/MWh)\</option\>

          \<option value="mixedfossil"\>Mixed fossil (0.50 tCO₂/MWh)\</option\>

          \<option value="gas"\>Natural gas (0.40 tCO₂/MWh)\</option\>

          \<option value="eumix"\>EU mixed (0.30 tCO₂/MWh)\</option\>

          \<option value="hydro"\>Hydro-dominated (0.10 tCO₂/MWh)\</option\>

          \<option value="nuclear"\>Nuclear-dominated (0.075 tCO₂/MWh)\</option\>

          \<option value="renewheavy"\>Renewable-heavy (0.05 tCO₂/MWh)\</option\>

        \</select\>

      \</div\>

      \<div class="field"\>

        \<label\>Renewable / captive PPA share \<span class="val" id="renVal"\>30%\</span\>\</label\>

        \<div class="num-row"\>

          \<input type="range" id="renewable" min="0" max="100" value="30" step="1"\>

          \<input type="number" id="renewableNum" min="0" max="100" value="30" step="1"\>

          \<span class="pct"\>%\</span\>

        \</div\>

      \</div\>

      \<div class="field"\>

        \<label class="checkbox-row"\>\<input type="checkbox" id="idealYield"\> Assume ideal 100% yield (comparison only — real losses hidden)\</label\>

      \</div\>

      \<button id="optimizeBtn"\>Find lowest-carbon practical mix\</button\>

      \<button id="resetBtn"\>Reset to baseline\</button\>

      \<button id="overrideToggle"\>⚙ Override emission-factor assumptions\</button\>

      \<div class="override-panel" id="overridePanel"\>\</div\>

      \<div id="optNote"\>\</div\>

    \</div\>

    \<div\>

      \<div class="readout"\>

        \<div class="big-number"\>

          \<div class="label"\>Embodied Carbon\</div\>

          \<div class="num" id="co2Num"\>—\</div\>

          \<div class="unit"\>tonnes CO₂e / tonne finished product\</div\>

          \<div class="equiv" id="equivLine"\>\</div\>

          \<div class="delta" id="deltaVsGlobal"\>\</div\>

          \<div class="scope-split" id="scopeSplit"\>\</div\>

        \</div\>

        \<div class="energy-number"\>

          \<div class="label"\>Energy Intensity\</div\>

          \<div class="num" id="energyNum" style="font-size:44px;"\>—\</div\>

          \<div class="unit"\>GJ / tonne (electricity \+ fuel)\</div\>

          \<div class="mini-stats"\>

            \<div\>\<div class="mval" id="elecMWh"\>—\</div\>\<div class="mlab"\>MWh electricity/t\</div\>\</div\>

            \<div\>\<div class="mval" id="gridFactor"\>—\</div\>\<div class="mlab"\>Blended grid, tCO₂/MWh\</div\>\</div\>

            \<div\>\<div class="mval" id="castRatio"\>—\</div\>\<div class="mlab"\>t cast / t finished\</div\>\</div\>

            \<div\>\<div class="mval" id="fuelGJ"\>—\</div\>\<div class="mlab"\>Fuel GJ/t (Scope 1)\</div\>\</div\>

          \</div\>

        \</div\>

      \</div\>

      \<div class="chart-panel" id="comparePanel"\>

        \<h2\>Your mix vs. the lowest-carbon practical mix\</h2\>

        \<p class="note"\>Your current setup, side by side with the best the optimiser found within a 15% cost premium — not a theoretical zero, a mix you could actually order next quarter.\</p\>

        \<table class="steptable" id="compareTable"\>\</table\>

      \</div\>

      \<div class="chart-panel" id="roadmapPanel"\>

        \<h2\>How to get there — a step-by-step roadmap\</h2\>

        \<p class="note"\>Ordered by how hard each change actually is to make, not by how much carbon it saves — so you can bank the easy wins first while the harder ones go through procurement or capex approval.\</p\>

        \<div id="roadmapList"\>\</div\>

      \</div\>

      \<div class="chart-panel"\>

        \<h2\>What's actually in your steel?\</h2\>

        \<p class="note" id="elemNote"\>Every stainless grade is iron plus a handful of alloying elements, each doing a specific metallurgical job — and each with its own carbon cost.\</p\>

        \<div class="elem-grid" id="elemGrid"\>\</div\>

      \</div\>

      \<div class="chart-panel"\>

        \<h2\>Where the tonne of CO₂ comes from\</h2\>

        \<p class="note"\>Stacked by source — grey \= Scope 3 purchased inputs, blue \= Scope 2 electricity, amber \= Scope 1 on-site fuel.\</p\>

        \<canvas id="waterfall"\>\</canvas\>

      \</div\>

      \<div class="chart-panel"\>

        \<h2\>Process-step breakdown\</h2\>

        \<p class="note"\>Itemised the way a real carbon footprint statement would show it.\</p\>

        \<table class="steptable" id="stepTable"\>\</table\>

      \</div\>

      \<div class="two-col"\>

        \<div class="chart-panel"\>

          \<h2\>Benchmark against known routes\</h2\>

          \<p class="note"\>Your mix vs. published industry reference points.\</p\>

          \<canvas id="benchmark"\>\</canvas\>

        \</div\>

        \<div class="chart-panel"\>

          \<h2\>Cost vs. carbon frontier\</h2\>

          \<p class="note"\>Illustrative relative cost index, not a market quote.\</p\>

          \<canvas id="pareto"\>\</canvas\>

        \</div\>

      \</div\>

      \<div class="chart-panel"\>

        \<h2\>Legal \&amp; regulatory carbon benchmarks\</h2\>

        \<p class="note"\>Real numbers from real carbon regulation, not just industry averages — so you can see where your mix sits against the law, not only against the market. Boundaries differ (flagged in the table), so read the caveats before quoting these.\</p\>

        \<canvas id="legalChart"\>\</canvas\>

        \<table class="steptable" id="legalTable" style="margin-top:16px;"\>\</table\>

      \</div\>

      \<div class="reality-box"\>

        \<h2\>Reality check — Jindal Stainless's own numbers\</h2\>

        \<div class="reality-grid"\>

          \<div\>\<div class="rval"\>1.76\</div\>\<div class="rlab"\>tCO₂e / tonne crude steel, FY26 (down from 2.15 in FY23) — company BRSR filing\</div\>\</div\>

          \<div\>\<div class="rval"\>70.1%\</div\>\<div class="rlab"\>Recycled scrap share of input mix, FY26 — company BRSR filing\</div\>\</div\>

          \<div\>\<div class="rval"\>\~47%\</div\>\<div class="rlab"\>Renewable share of imported power, Hisar \+ Jajpur plants\</div\>\</div\>

          \<div\>\<div class="rval"\>3.62M\</div\>\<div class="rlab"\>tCO₂e total Scope 1+2 operational emissions, FY25, across all plants (−4.3% YoY)\</div\>\</div\>

        \</div\>

        \<p class="hint" style="margin-top:14px;"\>Jindal Stainless also holds third-party-verified Environmental Product Declarations (International EPD System) for its Austenitic Hot Rolled Annealed \&amp; Pickled and Cold Rolled Annealed \&amp; Pickled product forms — genuine independently-audited carbon data exists for this company, which is worth citing directly in a submission even if this tool's own numbers stay illustrative.\</p\>

      \</div\>

    \</div\>

  \</div\>

  \<details\>

    \<summary\>Methodology, grade \&amp; product dataset, sources \&amp; disclaimer\</summary\>

    \<div class="methodology"\>

      \<p\>This tool computes emissions from a \<b\>mass-and-energy balance keyed to real metallurgy and a real process route\</b\> — 34 JSL grades pulled from JSL's own technical datasheets, plus JSL's actual product taxonomy (slabs, blooms, HR coils, CR coils, plates, rebar, wire rod, specialty finishes), with furnace type, refining route and casting method all as independent, explainable levers. Everything is split by accounting scope: Scope 3 for purchased ferroalloys/iron units, Scope 2 for purchased electricity, Scope 1 for on-site fuel.\</p\>

      \<h3\>1. Grade dataset (midpoint of each JSL datasheet's range)\</h3\>

      \<div id="gradeTableHolder"\>\</div\>

      \<p class="src"\>Source: Jindal Stainless technical datasheets, 200/300/400/Duplex series (jindalstainless.com/products/grades/).\</p\>

      \<h3\>2. Product route (from JSL's own product categories)\</h3\>

      \<table\>

        \<tr\>\<th\>Product\</th\>\<th\>Route\</th\>\<th\>Extra electricity\</th\>\<th\>Extra fuel (Scope 1)\</th\>\<th\>Typical yield\</th\>\</tr\>

        \<tr\>\<td\>Slab\</td\>\<td\>Cast only, semi-finished\</td\>\<td\>—\</td\>\<td\>—\</td\>\<td\>98%\</td\>\</tr\>

        \<tr\>\<td\>Bloom\</td\>\<td\>Cast only, feeds long-product mills\</td\>\<td\>—\</td\>\<td\>—\</td\>\<td\>97%\</td\>\</tr\>

        \<tr\>\<td\>Hot Rolled (HR) Coil\</td\>\<td\>Slab \+ hot strip/Steckel mill (JSL Jajpur)\</td\>\<td\>+150 kWh/t\</td\>\<td\>+0.80 GJ/t\</td\>\<td\>95%\</td\>\</tr\>

        \<tr\>\<td\>Plate\</td\>\<td\>Slab \+ plate mill\</td\>\<td\>+140 kWh/t\</td\>\<td\>+0.75 GJ/t\</td\>\<td\>94%\</td\>\</tr\>

        \<tr\>\<td\>Cold Rolled (CR) Coil\</td\>\<td\>HR coil \+ cold mill \+ anneal \&amp; pickle line\</td\>\<td\>+430 kWh/t\</td\>\<td\>+1.10 GJ/t\</td\>\<td\>92%\</td\>\</tr\>

        \<tr\>\<td\>Specialty / Coated finish\</td\>\<td\>CR coil \+ BA/coating/embossing line\</td\>\<td\>+510 kWh/t\</td\>\<td\>+1.10 GJ/t\</td\>\<td\>90%\</td\>\</tr\>

        \<tr\>\<td\>Rebar\</td\>\<td\>Bloom \+ bar mill\</td\>\<td\>+140 kWh/t\</td\>\<td\>+0.70 GJ/t\</td\>\<td\>93%\</td\>\</tr\>

        \<tr\>\<td\>Wire Rod\</td\>\<td\>Bloom \+ rod mill\</td\>\<td\>+130 kWh/t\</td\>\<td\>+0.65 GJ/t\</td\>\<td\>92%\</td\>\</tr\>

      \</table\>

      \<p class="src"\>Engineering estimates consistent with typical stainless finishing lines; JSL's Jajpur plant specifically operates the hot-rolling Steckel mill referenced here. Replace with plant-metered data for operational use.\</p\>

      \<h3\>3. Furnace \&amp; casting route\</h3\>

      \<table\>

        \<tr\>\<th\>Lever\</th\>\<th\>Option\</th\>\<th\>Electricity\</th\>\</tr\>

        \<tr\>\<td\>Melting\</td\>\<td\>EAF\</td\>\<td\>550 kWh/t\</td\>\</tr\>

        \<tr\>\<td\>Melting\</td\>\<td\>Induction Furnace\</td\>\<td\>700 kWh/t (less efficient, batch process, no continuous preheat)\</td\>\</tr\>

        \<tr\>\<td\>Refining\</td\>\<td\>AOD only\</td\>\<td\>150 kWh/t\</td\>\</tr\>

        \<tr\>\<td\>Refining\</td\>\<td\>AOD \+ VOD\</td\>\<td\>250 kWh/t (ultra-low-C/high-purity finishing)\</td\>\</tr\>

        \<tr\>\<td\>Casting\</td\>\<td\>Continuous\</td\>\<td\>30 kWh/t, \~97% yield\</td\>\</tr\>

        \<tr\>\<td\>Casting\</td\>\<td\>Ingot\</td\>\<td\>50 kWh/t \+ 0.3 GJ/t reheat fuel, \~90% yield (cropping losses)\</td\>\</tr\>

      \</table\>

      \<h3\>4. Scope classification\</h3\>

      \<table\>

        \<tr\>\<th\>Source\</th\>\<th\>Scope\</th\>\<th\>Why\</th\>\</tr\>

        \<tr\>\<td\>Virgin Fe unit, FeCr, Ni, FeMo, scrap\</td\>\<td\>Scope 3\</td\>\<td\>Purchased inputs; production emissions happen upstream at suppliers\</td\>\</tr\>

        \<tr\>\<td\>Electricity (melt+refine+cast+finishing)\</td\>\<td\>Scope 2\</td\>\<td\>Purchased power, grid or PPA\</td\>\</tr\>

        \<tr\>\<td\>Reheat/anneal/ingot-soak fuel\</td\>\<td\>Scope 1\</td\>\<td\>Combusted on-site\</td\>\</tr\>

      \</table\>

      \<h3\>5. Emission factors\</h3\>

      \<table\>

        \<tr\>\<th\>Input\</th\>\<th\>Factor\</th\>\<th\>Source\</th\>\</tr\>

        \<tr\>\<td\>Coal-based DRI, India\</td\>\<td\>2.6 tCO₂/t Fe unit\</td\>\<td class="src"\>Engineering estimate; consistent with DRI-EAF average 1.65 tCO₂/t crude steel, Columbia Business School CKI\</td\>\</tr\>

        \<tr\>\<td\>Gas-based DRI\</td\>\<td\>0.9 tCO₂/t Fe unit\</td\>\<td class="src"\>Natural gas reduction route\</td\>\</tr\>

        \<tr\>\<td\>Pig iron (allocated)\</td\>\<td\>1.8 tCO₂/t Fe unit\</td\>\<td class="src"\>From BF-BOF benchmark 1.99–2.32 tCO₂/t crude steel (worldsteel/IEEFA/Columbia CKI)\</td\>\</tr\>

        \<tr\>\<td\>Recycled scrap\</td\>\<td\>0.12 tCO₂/t\</td\>\<td class="src"\>Collection/processing/melt-loss only\</td\>\</tr\>

        \<tr\>\<td\>Standard HC-ferrochrome\</td\>\<td\>3.5 tCO₂/t FeCr\</td\>\<td class="src"\>Midpoint 1.8–5.5 tCO₂/t FeCr, Chen et al., \<i\>JOM\</i\> 2023\</td\>\</tr\>

        \<tr\>\<td\>Low-carbon FeCr\</td\>\<td\>1.9 tCO₂/t FeCr\</td\>\<td class="src"\>Closed furnace \+ preheat, same source\</td\>\</tr\>

        \<tr\>\<td\>Primary nickel\</td\>\<td\>15 tCO₂/t Ni\</td\>\<td class="src"\>Illustrative mid-estimate; range \~8–60 tCO₂/t Ni — largest uncertainty in the model\</td\>\</tr\>

        \<tr\>\<td\>Ferromolybdenum\</td\>\<td\>8.5 tCO₂/t FeMo\</td\>\<td class="src"\>Midpoint 3.16–14.79 tCO₂/t FeMo, Wei et al., \<i\>J. Sustainable Metallurgy\</i\>\</td\>\</tr\>

        \<tr\>\<td\>India grid (CEA CM)\</td\>\<td\>0.72 tCO₂/MWh\</td\>\<td class="src"\>CEA CO₂ Baseline Database, FY 2024-25\</td\>\</tr\>

        \<tr\>\<td\>Other grid archetypes\</td\>\<td\>0.05–0.50 tCO₂/MWh\</td\>\<td class="src"\>Illustrative country bands, adapted from SteelOnTheNet emissions-calculator methodology\</td\>\</tr\>

      \</table\>

      \<h3\>6. What the optimiser does\</h3\>

      \<p\>A constrained grid search across scrap share, renewable share, FeCr source, DRI type, alloy recovery and furnace type — returning the lowest-CO₂ combination within a 15% cost-index premium over your current setting.\</p\>

      \<h3\>7. References\</h3\>

      \<p class="src"\>

        worldsteel, \<i\>World Steel in Figures 2025\</i\> \&amp; \<i\>Sustainability Indicators 2025\</i\> — worldsteel.org ·

        Columbia Business School CKI — business.columbia.edu ·

        Chen et al., \<i\>JOM\</i\> (2023) — link.springer.com/article/10.1007/s11837-023-05707-8 ·

        Wei et al., \<i\>J. Sustainable Metallurgy\</i\> — researchgate.net/publication/338415997 ·

        CEA, \<i\>CO₂ Baseline Database for the Indian Power Sector\</i\> — cea.nic.in ·

        IPCC 2006 Guidelines, Metal Industry — ipcc-nggip.iges.or.jp ·

        European Commission, Iron \&amp; Steel Benchmark Study — climate.ec.europa.eu ·

        SteelOnTheNet, Steel Production Emissions Calculator — steelonthenet.com/tools/emissions-calculator.php ·

        Jindal Stainless technical datasheets — jindalstainless.com/products/grades/ ·

        Jindal Stainless BRSR/Annual Report FY26 — jindalstainless.com/annual-reports/ ·

        Jindal Stainless EPDs, Austenitic HRAP/CRAP — environdec.com (EPD-IES-0007840, EPD-IES-0007804).

      \</p\>

      \<h3\>8. Legal \&amp; regulatory carbon benchmarks used\</h3\>

      \<table\>

        \<tr\>\<th\>Benchmark\</th\>\<th\>Value\</th\>\<th\>Boundary\</th\>\<th\>Applies to\</th\>\<th\>Source\</th\>\</tr\>

        \<tr\>\<td\>EU ETS — EAF high-alloy steel (top-10% efficiency)\</td\>\<td\>0.176 tCO₂e/t\</td\>\<td\>Scope 1 direct only\</td\>\<td\>Stainless/high-alloy via EAF\</td\>\<td class="src"\>EU Implementing Regulation 2026/1412, benchmarks for 2026–2030\</td\>\</tr\>

        \<tr\>\<td\>EU ETS — EAF carbon steel (top-10% efficiency)\</td\>\<td\>0.142 tCO₂e/t\</td\>\<td\>Scope 1 direct only\</td\>\<td\>Carbon steel via EAF\</td\>\<td class="src"\>Same regulation\</td\>\</tr\>

        \<tr\>\<td\>EU ETS — Hot metal (top-10% efficiency)\</td\>\<td\>1.248 tCO₂e/t\</td\>\<td\>Scope 1 direct only\</td\>\<td\>BF ironmaking stage\</td\>\<td class="src"\>Same regulation\</td\>\</tr\>

        \<tr\>\<td\>CBAM — HRC, BF/BOF route (provisional)\</td\>\<td\>1.53 tCO₂/t\</td\>\<td\>Total embedded, incl. precursors\</td\>\<td\>Carbon steel HRC\</td\>\<td class="src"\>Draft CBAM Free Allocation Annex, reported by Fastmarkets, late 2025 — subject to 2026 finalisation\</td\>\</tr\>

        \<tr\>\<td\>CBAM — HRC, DRI/EAF route (provisional)\</td\>\<td\>1.033 tCO₂/t\</td\>\<td\>Total embedded\</td\>\<td\>Carbon steel HRC\</td\>\<td class="src"\>Same source\</td\>\</tr\>

        \<tr\>\<td\>CBAM — HRC, Scrap-EAF route (provisional)\</td\>\<td\>0.288 tCO₂/t\</td\>\<td\>Total embedded\</td\>\<td\>Carbon steel HRC\</td\>\<td class="src"\>Same source\</td\>\</tr\>

        \<tr\>\<td\>India CCTS — Iron \&amp; Steel, BF-BOF benchmark\</td\>\<td\>1.46 tCO₂e/t\</td\>\<td\>Gate-to-gate, Scope 1+2\</td\>\<td\>Crude steel, BF-BOF route\</td\>\<td class="src"\>MoEFCC draft notification under the Carbon Credit Trading Scheme, June 2026\</td\>\</tr\>

        \<tr\>\<td\>India — national average crude steel intensity\</td\>\<td\>2.54 tCO₂/t\</td\>\<td\>Total embedded\</td\>\<td\>All routes, national average, FY 2023-24\</td\>\<td class="src"\>Ministry of Steel / CCTS baseline reporting\</td\>\</tr\>

        \<tr\>\<td\>India — Ministry of Steel 2030 target\</td\>\<td\>2.2 tCO₂/t\</td\>\<td\>Total embedded\</td\>\<td\>National average target\</td\>\<td class="src"\>Ministry of Steel, India\</td\>\</tr\>

        \<tr\>\<td\>Global average crude steel intensity\</td\>\<td\>1.9 tCO₂/t\</td\>\<td\>Total embedded\</td\>\<td\>All routes, global average\</td\>\<td class="src"\>Cited in CCTS/worldsteel-style sector reporting\</td\>\</tr\>

        \<tr\>\<td\>Global average stainless steel intensity\</td\>\<td\>2.93 tCO₂/t\</td\>\<td\>Total embedded\</td\>\<td\>Stainless steel specifically\</td\>\<td class="src"\>Chen et al., \<i\>JOM\</i\> 2023, citing ISSF\</td\>\</tr\>

      \</table\>

      \<p class="src"\>\<b\>Why the EU ETS figures look so much smaller:\</b\> they cover Scope 1 direct process emissions only (furnace fuel, not purchased electricity or purchased alloy production), and they're set at the top-10%-most-efficient-installations level for free-allocation purposes — not an average, and not a legal cap on any single plant. Compare them only against your own \<i\>Scope 1\</i\> figure shown above, never against your total. CBAM and India's CCTS use a broader gate-to-gate boundary closer to (but not identical to) this tool's Scope 1+2+3(purchased-goods) total, so those are more directly comparable to your headline number.\</p\>

      \<h3\>9. Challenges — stated plainly\</h3\>

      \<p\>\<b\>Nickel/Mo route uncertainty\</b\> is the widest band in the model (sulfide vs. laterite/NPI can differ 7x). \<b\>Average vs. marginal grid factors\</b\> matter differently depending on the decision being made. \<b\>Scrap is a shared, constrained resource\</b\> — not a dial one mill controls alone. \<b\>Imported alloy transport\</b\> (sea freight for chrome ore/Ni/FeMo) is outside this Scope-1+2+3(purchased-goods) boundary and named here rather than silently dropped. \<b\>Public emission factors are generic\</b\> — a real decarbonisation claim needs plant-metered, third-party-verified data (which is exactly what JSL's own EPDs provide, and this tool doesn't replace).\</p\>

      \<div class="disclaimer"\>

        \<b\>Disclaimer:\</b\> planning-grade estimator for a case-competition prototype, not a certified LCA or compliance tool. Excludes upstream mining/transport and most Scope 3 logistics beyond purchased ferroalloys. For investment, compliance or carbon-market decisions, use site-metered data and a professional GHG Protocol / ISO 14064-aligned assessment — or JSL's own published EPDs.

      \</div\>

    \</div\>

  \</details\>

  \<footer\>Built as a decision-support prototype — override the emission-factor panel with plant-specific data before operational use.\</footer\>

\</div\>

\<script\>

// \============ GRADE DATASET \============

const GRADES \= {

  'J4':      {family:'200 Series (Lean-Austenitic)', cr:15.5, ni:1.5,  mo:0, mn:9.25, cu:1.75, scrapCap:75, desc:'\<b\>J4\</b\>: Cr-Mn austenitic, replaces 301/304 economically. Lowest-Ni grade in the 200 series.'},

  'J4-16Cr': {family:'200 Series (Lean-Austenitic)', cr:16.5, ni:1.5,  mo:0, mn:9.75, cu:1.75, scrapCap:75, desc:'\<b\>J4-16Cr\</b\>: higher-Cr variant of J4 for improved corrosion resistance.'},

  'J201':    {family:'200 Series (Lean-Austenitic)', cr:17.0, ni:4.5,  mo:0, mn:6.5, scrapCap:75, desc:'\<b\>J201\</b\>: cost-effective substitute for 301, lean-nickel austenitic.'},

  'J202':    {family:'200 Series (Lean-Austenitic)', cr:18.0, ni:5.0,  mo:0, mn:8.75, scrapCap:75, desc:'\<b\>J202\</b\>: Mn-alloyed, cost-effective substitute for 302, comparable to 304 in moderate media.'},

  'J204':    {family:'200 Series (Lean-Austenitic)', cr:18.75,ni:3.25, mo:0, mn:6.5, scrapCap:75, desc:'\<b\>J204\</b\>: bridges 200/300 series cost-property gap, replaces 304 where lower cost matters.'},

  'J204Cu':  {family:'200 Series (Lean-Austenitic)', cr:16.75,ni:2.5,  mo:0, mn:7.75, cu:3.0, scrapCap:75, desc:'\<b\>J204Cu\</b\>: Cu-added variant of J204 for better formability; cost alternative to 201/304.'},

  'J216L':   {family:'200 Series (Lean-Austenitic)', cr:17.0, ni:7.0,  mo:1.75, mn:7.0, cu:1.75, scrapCap:70, desc:'\<b\>J216L\</b\>: rare Mo-bearing 200-series grade — a cost-effective substitute for 316L.'},

  'JSL AUS': {family:'200 Series (Lean-Austenitic)', cr:17.0, ni:5.0,  mo:0, mn:7.0, cu:1.75, scrapCap:75, desc:'\<b\>JSL AUS\</b\>: economical 304 replacement with comparable formability and weldability.'},

  'JSL U DD':{family:'200 Series (Lean-Austenitic)', cr:15.5, ni:0.65, mo:0, mn:10.4, cu:2.1, scrapCap:75, desc:'\<b\>JSL U DD\</b\>: very low-Ni Cr-Mn grade purpose-built for deep-drawn utensils.'},

  'J301':  {family:'300 Series (Austenitic)', cr:17.0, ni:7.0,  mo:0,   scrapCap:90, desc:'\<b\>J301\</b\>: lower Cr/Ni than 304 for higher work-hardening rate; transport & architectural use.'},

  'J304':  {family:'300 Series (Austenitic)', cr:18.5, ni:9.25, mo:0,   scrapCap:90, desc:'\<b\>J304\</b\>: the workhorse austenitic grade — general purpose, excellent formability.'},

  'J304L': {family:'300 Series (Austenitic)', cr:18.5, ni:10.0, mo:0,   scrapCap:90, desc:'\<b\>J304L\</b\>: low-carbon 304 for weld-heavy applications, no post-weld treatment needed.'},

  'J305':  {family:'300 Series (Austenitic)', cr:18.0, ni:11.75,mo:0,   scrapCap:85, desc:'\<b\>J305\</b\>: higher-Ni 304 variant for maximum formability (deep drawing, spinning).'},

  'J309S': {family:'300 Series (Austenitic)', cr:23.0, ni:13.5, mo:0,   scrapCap:70, desc:'\<b\>J309S\</b\>: high-temperature Cr-Ni grade for furnace parts and heat exchangers.'},

  'J310S': {family:'300 Series (Austenitic)', cr:25.0, ni:20.5, mo:0,   scrapCap:65, desc:'\<b\>J310S\</b\>: highly alloyed, high-Ni high-temperature grade — among the most carbon-intensive here.'},

  'J316':  {family:'300 Series (Austenitic)', cr:17.0, ni:12.0, mo:2.5, scrapCap:85, desc:'\<b\>J316\</b\>: standard Mo-alloyed grade for chloride/pitting resistance.'},

  'J317L': {family:'300 Series (Austenitic)', cr:19.0, ni:13.0, mo:3.5, scrapCap:75, desc:'\<b\>J317L\</b\>: higher-Mo than 316L for extreme chloride/halide environments.'},

  'J321':  {family:'300 Series (Austenitic)', cr:18.0, ni:11.0, mo:0,   scrapCap:85, desc:'\<b\>J321\</b\>: Ti-stabilised 304 for high-temperature intergranular corrosion resistance.'},

  'J347':  {family:'300 Series (Austenitic)', cr:18.0, ni:11.0, mo:0,   scrapCap:85, desc:'\<b\>J347\</b\>: Nb-stabilised austenitic, for aerospace/rocket & high-temp gaskets.'},

  'J904L': {family:'300 Series (Super-Austenitic)', cr:21.0, ni:25.5, mo:4.5, cu:1.5, scrapCap:70, desc:'\<b\>J904L\</b\>: super-austenitic, highest Ni/Mo in the range — the carbon-intensity ceiling.'},

  '1.4835':{family:'300 Series (Heat-Resistant)', cr:21.0, ni:11.0, mo:0,   scrapCap:65, desc:'\<b\>EN 1.4835\</b\>: Cr-Ni-Si heat-resistant grade for furnace/exhaust components up to 1100°C.'},

  '1.4841':{family:'300 Series (Heat-Resistant)', cr:25.0, ni:20.5, mo:0,   scrapCap:65, desc:'\<b\>EN 1.4841\</b\>: high Cr-Ni for continuous service up to 1200°C.'},

  'J409L':  {family:'400 Series (Ferritic)', cr:11.1, ni:0.25, mo:0,   scrapCap:65, desc:'\<b\>J409L\</b\>: leanest ferritic (Ti-stabilised), automotive exhaust systems.'},

  'J410S':  {family:'400 Series (Ferritic)', cr:12.5, ni:0.3,  mo:0,   scrapCap:65, desc:'\<b\>J410S\</b\>: higher-Cr ferritic than 409 for better corrosion resistance.'},

  'J430':   {family:'400 Series (Ferritic)', cr:17.0, ni:0.375,mo:0,   scrapCap:70, desc:'\<b\>J430\</b\>: most common general-purpose ferritic, chromium-only, no nickel.'},

  'J436L':  {family:'400 Series (Ferritic)', cr:17.5, ni:0.25, mo:1.1, scrapCap:65, desc:'\<b\>J436L\</b\>: Mo-added stabilised ferritic for pitting/crevice resistance.'},

  'J439':   {family:'400 Series (Ferritic)', cr:18.0, ni:0.25, mo:0,   scrapCap:70, desc:'\<b\>J439\</b\>: higher-Cr version of 409L, \~304-level pitting resistance without nickel.'},

  'J441':   {family:'400 Series (Ferritic)', cr:18.0, ni:0,    mo:0,   scrapCap:70, desc:'\<b\>J441\</b\>: dual-stabilised (Nb+Ti) ferritic for high-temp exhaust systems.'},

  'J444':   {family:'400 Series (Ferritic)', cr:18.5, ni:0.5,  mo:2.1, scrapCap:65, desc:'\<b\>J444\</b\>: dual-stabilised Mo-bearing ferritic, exceptional pitting resistance.'},

  'J445':   {family:'400 Series (Ferritic)', cr:20.0, ni:0.3,  mo:0, cu:0.45,   scrapCap:65, desc:'\<b\>J445\</b\>: highest-Cr ferritic here, \~304-equivalent general corrosion resistance.'},

  '1.4003': {family:'400 Series (Ferritic)', cr:11.5, ni:0.5,  mo:0,   scrapCap:65, desc:'\<b\>EN 1.4003\</b\>: utility ferritic, structural steel alternative with corrosion resistance.'},

  'J410':   {family:'400 Series (Martensitic)', cr:12.5, ni:0.375,mo:0,   scrapCap:60, desc:'\<b\>J410\</b\>: moderate-corrosion martensitic for cutlery, pump parts, fasteners.'},

  'J410DB': {family:'400 Series (Martensitic)', cr:12.25,ni:0.3,  mo:0,   scrapCap:60, desc:'\<b\>J410DB\</b\>: disc-brake application grade, abrasion resistance focus.'},

  'J415':   {family:'400 Series (Martensitic)', cr:12.75,ni:4.5,  mo:0.75,scrapCap:55, desc:'\<b\>J415\</b\>: high-toughness Ni-Mo martensitic for heavy engineering.'},

  'J420J1': {family:'400 Series (Martensitic)', cr:13.0, ni:0.3,  mo:0,   scrapCap:60, desc:'\<b\>J420J1\</b\>: hardenable martensitic for cutlery, pump bushings, valves.'},

  'J431':   {family:'400 Series (Martensitic)', cr:16.0, ni:1.875,mo:0,   scrapCap:60, desc:'\<b\>J431\</b\>: higher-Cr/Ni martensitic for heavy machinery structural components.'},

  '1.4116': {family:'400 Series (Martensitic)', cr:14.5, ni:0,    mo:0.65,scrapCap:55, desc:'\<b\>EN 1.4116\</b\>: high-carbon Mo-bearing martensitic for professional knife cutlery.'},

  'J2101':  {family:'Duplex', cr:21.5, ni:1.5, mo:0.45, mn:5.0, cu:0.45, scrapCap:60, desc:'\<b\>J2101\</b\> (lean duplex): 316L-comparable corrosion resistance at low Ni/Mo cost.'},

  'J2304':  {family:'Duplex', cr:23.0, ni:4.25,mo:0.325, scrapCap:60, desc:'\<b\>J2304\</b\> (lean duplex): higher strength than 316L, moderate alloy cost.'},

  'J2205':  {family:'Duplex', cr:22.5, ni:5.5, mo:3.25, scrapCap:55, desc:'\<b\>J2205\</b\> (standard duplex): \~80% of the global duplex market, better corrosion than 316L.'},

  'J31803': {family:'Duplex', cr:22.0, ni:5.5, mo:3.0,  scrapCap:55, desc:'\<b\>J31803\</b\> (standard duplex): near-identical to 2205 with slightly less Mo.'},

  'J2507':  {family:'Duplex (Super)', cr:25.0, ni:7.0, mo:4.0, scrapCap:50, desc:'\<b\>J2507\</b\> (super duplex): 6% Mo super-austenitic-level localized corrosion resistance.'},

  'J32760': {family:'Duplex (Super)', cr:25.0, ni:7.0, mo:3.5, scrapCap:50, desc:'\<b\>J32760\</b\> (super duplex): W-alloyed super duplex for offshore/desalination service.'},

  'carbonRef': {family:'Reference (Non-Stainless)', cr:0, ni:0, mo:0, scrapCap:100, desc:'\<b\>Plain carbon steel (reference)\</b\>: zero alloy content — for direct comparison against BF-BOF, EU ETS, CBAM and India CCTS benchmarks, all of which describe this kind of steel, not stainless.'},

  '\_\_custom\_\_': {family:'Build Your Own', cr:18.2, ni:8.1, mo:0, scrapCap:90, desc:'\<b\>Custom composition\</b\> — set each element\\'s share yourself in the panel below.'}

};

const PRODUCTS \= {

  slab:     {label:'Slab (semi-finished)', elecKWh:0,   fuelGJ:0,    yieldF:0.98, hint:'Cast only — the semi-finished starting block for flat products. Minimal further processing, so minimal additional footprint.'},

  bloom:    {label:'Bloom (semi-finished, long products)', elecKWh:0, fuelGJ:0, yieldF:0.97, hint:'Cast only — feeds JSL\\'s long-product mills (rebar, wire rod).'},

  hrCoil:   {label:'Hot Rolled (HR) Coil', elecKWh:150, fuelGJ:0.80, yieldF:0.95, hint:'Slab rolled on JSL\\'s hot strip/Steckel mill at Jajpur. Primary feedstock for cold rolling and heavy fabrication.'},

  plate:    {label:'Plate', elecKWh:140, fuelGJ:0.75, yieldF:0.94, hint:'Thicker-gauge hot-rolled flat product for structural and heavy-industrial use.'},

  crCoil:   {label:'Cold Rolled (CR) Coil', elecKWh:430, fuelGJ:1.10, yieldF:0.92, hint:'HR coil, further cold-reduced then annealed & pickled for dimensional accuracy and surface finish. The highest-energy flat-product route.'},

  specialty:{label:'Specialty / Coated Finish', elecKWh:510, fuelGJ:1.10, yieldF:0.90, hint:'CR coil plus BA, coloured, embossed or coated finishing lines — JSL\\'s specialty product range.'},

  rebar:    {label:'Rebar (long product)', elecKWh:140, fuelGJ:0.70, yieldF:0.93, hint:'Bloom rolled on a bar mill — construction reinforcement steel.'},

  wireRod:  {label:'Wire Rod (long product)', elecKWh:130, fuelGJ:0.65, yieldF:0.92, hint:'Bloom rolled on a rod mill — feedstock for wire drawing.'}

};

const FURNACE \= { eaf:{kwh:550,label:'EAF'}, if:{kwh:700,label:'Induction Furnace'}, bfbof:{kwh:50,label:'Blast Furnace–BOF'} };

const BFBOF\_SCRAP\_CAP \= 30;

const LEGAL\_BENCHMARKS \= \[

  {label:'EU ETS: hot metal (Scope 1)', value:1.248, group:'scope1'},

  {label:'EU ETS: EAF high-alloy (Scope 1)', value:0.176, group:'scope1'},

  {label:'EU ETS: EAF carbon steel (Scope 1)', value:0.142, group:'scope1'},

  {label:'CBAM: HRC BF/BOF (provisional)', value:1.53, group:'total'},

  {label:'CBAM: HRC DRI/EAF (provisional)', value:1.033, group:'total'},

  {label:'CBAM: HRC Scrap-EAF (provisional)', value:0.288, group:'total'},

  {label:'India CCTS: BF-BOF benchmark', value:1.46, group:'total'},

  {label:'India: national average', value:2.54, group:'total'},

  {label:'India: 2030 target', value:2.2, group:'total'},

  {label:'Global: crude steel average', value:1.9, group:'total'},

  {label:'Global: stainless average', value:2.93, group:'total'}

\];

const REFINE  \= { aod:{kwh:150,label:'AOD only'}, aodvod:{kwh:250,label:'AOD \+ VOD'} };

const CAST    \= { continuous:{kwh:30, fuelGJ:0, yieldF:0.97, label:'Continuous'}, ingot:{kwh:50, fuelGJ:0.3, yieldF:0.90, label:'Ingot'} };

const GRID\_REGIONS \= {

  india:{ label:'India (CEA)', value:0.72 }, mixedfossil:{ label:'Mixed fossil', value:0.50 },

  gas:{ label:'Natural gas', value:0.40 }, eumix:{ label:'EU mixed', value:0.30 },

  hydro:{ label:'Hydro-dominated', value:0.10 }, nuclear:{ label:'Nuclear-dominated', value:0.075 },

  renewheavy:{ label:'Renewable-heavy', value:0.05 }

};

const ELEMENT\_INFO \= {

  fe:{name:'Iron (Fe)', role:'The base metal — makes up most of the alloy by weight and gives stainless steel its structural backbone.', carbon:'Embodied carbon depends entirely on source: near-zero from recycled scrap, highest single lever in this model from virgin ore reduction.'},

  cr:{name:'Chromium (Cr)', role:'The element that makes steel "stainless" — forms a thin, self-healing invisible oxide layer that resists rusting. Present in every stainless grade, always 10.5%+.', carbon:'Ferrochrome production is carbon-intensive — chromium alone typically drives \~30% of a tonne\\'s footprint.'},

  ni:{name:'Nickel (Ni)', role:'Stabilises the austenitic crystal structure, giving toughness, ductility and better cold-temperature performance. The signature ingredient of 300-series grades.', carbon:'The most carbon-intensive element by weight in this model — primary nickel can emit 8–60 tCO₂ per tonne contained, depending on ore route.'},

  mo:{name:'Molybdenum (Mo)', role:'Boosts resistance to pitting and crevice corrosion from chlorides — seawater, industrial acids. Found in 316-family and duplex grades.', carbon:'Ferromolybdenum production is energy-intensive — a real but smaller lever than chromium or nickel.'},

  mn:{name:'Manganese (Mn)', role:'Substitutes for some of the nickel while still stabilising the austenitic structure — the basis of the cost-optimised 200-series grades.', carbon:'Modest production footprint of its own; its real carbon value is indirect — every % of Mn substituted is nickel you don\\'t have to buy.'},

  cu:{name:'Copper (Cu)', role:'Improves cold-forming behaviour and adds corrosion resistance in reducing acids like dilute sulphuric or phosphoric acid.', carbon:'Minor by mass; folded into the general alloy allowance rather than modelled separately.'}

};

const EF \= {

  scrap: 0.12, coalDRI: 2.6, gasDRI: 0.9, pigIron: 1.8,

  fecrStandard: 3.5, fecrLowC: 1.9, fecrCrContent: 0.55,

  crRecoveryStd: 0.92, crRecoveryOpt: 0.96,

  niPrimary: 15, niRecoveryStd: 0.98, niRecoveryOpt: 0.99,

  femoRate: 8.5, femoMoContent: 0.65, moRecoveryStd: 0.95, moRecoveryOpt: 0.97,

  gridRenewable: 0.03

};

const state \= { grade:'J304', product:'crCoil', scrap:60, feSource:'coalDRI', fecrSource:'standard',

  furnace:'eaf', refine:'aod', cast:'continuous', gridRegion:'india', renewable:30, recovery:'standard', idealYield:false };

function compute(s){

  const g \= GRADES\[s.grade\];

  const p \= PRODUCTS\[s.product\];

  const isBFBOF \= s.furnace \=== 'bfbof';

  const effScrap \= isBFBOF ? Math.min(s.scrap, BFBOF\_SCRAP\_CAP) : s.scrap;

  const virgin \= 1 \- effScrap/100;

  // BF-BOF physically cannot carry Cr/Ni/Mo through the process — zero them out and model plain carbon steel

  const crMass \= isBFBOF ? 0 : g.cr/100;

  const niMass \= isBFBOF ? 0 : g.ni/100;

  const moMass \= isBFBOF ? 0 : (g.mo||0)/100;

  const crRec \= s.recovery \=== 'optimised' ? EF.crRecoveryOpt : EF.crRecoveryStd;

  const niRec \= s.recovery \=== 'optimised' ? EF.niRecoveryOpt : EF.niRecoveryStd;

  const moRec \= s.recovery \=== 'optimised' ? EF.moRecoveryOpt : EF.moRecoveryStd;

  const castF \= CAST\[s.cast\];

  const finishingYield \= s.idealYield ? 1.0 : (castF.yieldF \* p.yieldF);

  const castPerFinished \= 1 / finishingYield;

  // BF-BOF's iron unit is always blast-furnace hot metal, regardless of the DRI/pig-iron toggle

  const feCO2rate \= isBFBOF ? EF.pigIron : {coalDRI:EF.coalDRI, gasDRI:EF.gasDRI, pigIron:EF.pigIron}\[s.feSource\];

  const virginFeMass \= virgin \* (1 \- crMass \- niMass \- moMass);

  const scrapMass \= effScrap/100;

  const fecrRate \= s.fecrSource \=== 'lowc' ? EF.fecrLowC : EF.fecrStandard;

  const virginFeCrTonnes \= (virgin \* crMass / crRec) / EF.fecrCrContent;

  const virginNiTonnes \= virgin \* niMass / niRec;

  const virginFeMoTonnes \= (virgin \* moMass / moRec) / EF.femoMoContent;

  const co2\_fe\_virgin \= virginFeMass \* feCO2rate \* castPerFinished;

  const co2\_fe\_scrap \= scrapMass \* EF.scrap \* castPerFinished;

  const co2\_fecr \= virginFeCrTonnes \* fecrRate \* castPerFinished;

  const co2\_ni \= virginNiTonnes \* EF.niPrimary \* castPerFinished;

  const co2\_femo \= virginFeMoTonnes \* EF.femoRate \* castPerFinished;

  const baseGrid \= GRID\_REGIONS\[s.gridRegion\].value;

  const gridBlend \= (s.renewable/100)\*EF.gridRenewable \+ (1-s.renewable/100)\*baseGrid;

  // BF-BOF uses BOF oxygen-blowing (\~50 kWh/t, no AOD/VOD refining stage)

  const refineKWh \= isBFBOF ? 0 : REFINE\[s.refine\].kwh;

  const totalElecKWh \= FURNACE\[s.furnace\].kwh \+ refineKWh \+ castF.kwh \+ p.elecKWh;

  const totalFuelGJ \= (s.idealYield ? 0 : castF.fuelGJ) \+ p.fuelGJ;

  const co2\_elec \= (totalElecKWh/1000) \* gridBlend \* castPerFinished;

  const co2\_fuel \= totalFuelGJ \* 0.0561 \* castPerFinished; // natural gas \~56.1 kgCO2/GJ (IPCC default) \-\> tCO2/GJ \= 0.0561

  const scope3 \= co2\_fe\_virgin \+ co2\_fe\_scrap \+ co2\_fecr \+ co2\_ni \+ co2\_femo;

  const scope2 \= co2\_elec;

  const scope1 \= co2\_fuel;

  const total \= scope1 \+ scope2 \+ scope3;

  const energyGJ \= (totalElecKWh/1000) \* 3.6 \* castPerFinished \+ totalFuelGJ \* castPerFinished;

  return {

    total, energyGJ, gridBlend, scope1, scope2, scope3, castPerFinished,

    elecMWhPerT: (totalElecKWh/1000) \* castPerFinished, fuelGJPerT: totalFuelGJ \* castPerFinished,

    breakdown: { feVirgin:co2\_fe\_virgin, feScrap:co2\_fe\_scrap, fecr:co2\_fecr, ni:co2\_ni, femo:co2\_femo, elec:co2\_elec, fuel:co2\_fuel }

  };

}

function costIndex(s){

  let c \= 100;

  c \-= s.scrap \* 0.15;

  c \+= s.renewable \* 0.05;

  if (s.fecrSource \=== 'lowc') c \+= 12;

  if (s.feSource \=== 'gasDRI') c \+= 8;

  if (s.feSource \=== 'pigIron') c \+= 4;

  if (s.recovery \=== 'optimised') c \+= 5;

  if (s.furnace \=== 'if') c \-= 6; // cheaper capex route, illustrative

  if (s.refine \=== 'aodvod') c \+= 10;

  if (s.cast \=== 'ingot') c \+= 6;

  return c;

}

let waterfallChart, benchmarkChart, paretoChart, legalChart;

function colorForCO2(v){

  const t \= Math.max(0, Math.min(1, (v \- 0.6) / (2.9 \- 0.6)));

  const cold \= \[74,144,164\], hot \= \[232,98,44\];

  const rgb \= cold.map((c,i)=\> Math.round(c \+ (hot\[i\]-c)\*t));

  return \`rgb(${rgb\[0\]},${rgb\[1\]},${rgb\[2\]})\`;

}

function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

function renderElements(){

  const g \= GRADES\[state.grade\];

  const cr=g.cr, ni=g.ni||0, mo=g.mo||0, mn=g.mn||0, cu=g.cu||0;

  const fe \= Math.max(0, 100 \- cr \- ni \- mo \- mn \- cu);

  const items \= \[

    {key:'fe', pct:fe, hot:false},

    {key:'cr', pct:cr, hot:true},

  \];

  if (ni\>0) items.push({key:'ni', pct:ni, hot:true});

  if (mo\>0) items.push({key:'mo', pct:mo, hot:true});

  if (mn\>0) items.push({key:'mn', pct:mn, hot:false});

  if (cu\>0) items.push({key:'cu', pct:cu, hot:false});

  let html \= '';

  items.forEach(it=\>{

    const info \= ELEMENT\_INFO\[it.key\];

    html \+= \`\<div class="elem-card ${it.hot?'hot-elem':''}"\>

      \<div class="ename"\>${info.name}\<span class="epct"\>${it.pct.toFixed(2)}%\</span\>\</div\>

      \<div class="erole"\>${info.role}\</div\>

      \<div class="ecarbon"\>${info.carbon}\</div\>

    \</div\>\`;

  });

  document.getElementById('elemGrid').innerHTML \= html;

}

function render(){

  const r \= compute(state);

  const numEl \= document.getElementById('co2Num');

  numEl.textContent \= r.total.toFixed(2);

  numEl.style.color \= colorForCO2(r.total);

  document.getElementById('energyNum').textContent \= r.energyGJ.toFixed(1);

  document.getElementById('elecMWh').textContent \= r.elecMWhPerT.toFixed(2);

  document.getElementById('gridFactor').textContent \= r.gridBlend.toFixed(3);

  document.getElementById('castRatio').textContent \= r.castPerFinished.toFixed(3);

  document.getElementById('fuelGJ').textContent \= r.fuelGJPerT.toFixed(2);

  const kmEquiv \= (r.total \* 1000 / 0.15).toFixed(0);

  document.getElementById('equivLine').textContent \= \`≈ the CO₂ of driving an average passenger car ${Number(kmEquiv).toLocaleString()} km (illustrative, \~0.15 kg CO₂/km).\`;

  const globalAvg \= 2.93;

  const diff \= r.total \- globalAvg;

  const pct \= Math.abs(diff/globalAvg\*100).toFixed(0);

  const deltaEl \= document.getElementById('deltaVsGlobal');

  if (diff \< 0){

    deltaEl.className \= 'delta good';

    deltaEl.textContent \= \`${pct}% below the global stainless steel average (2.93 tCO₂/t, ISSF).\`;

  } else {

    deltaEl.className \= 'delta bad';

    deltaEl.textContent \= \`${pct}% above the global stainless steel average (2.93 tCO₂/t, ISSF).\`;

  }

  const s1p \= (r.scope1/r.total\*100).toFixed(0), s2p=(r.scope2/r.total\*100).toFixed(0), s3p=(r.scope3/r.total\*100).toFixed(0);

  document.getElementById('scopeSplit').innerHTML \=

    \`\<div\>\<span class="sw" style="background:var(--s3)"\>\</span\>Scope 3 ${s3p}%\</div\>\`+

    \`\<div\>\<span class="sw" style="background:var(--s2)"\>\</span\>Scope 2 ${s2p}%\</div\>\`+

    \`\<div\>\<span class="sw" style="background:var(--s1)"\>\</span\>Scope 1 ${s1p}%\</div\>\`;

  const b \= r.breakdown;

  const labels \= \['Virgin Fe unit','Scrap Fe unit','Ferrochrome','Nickel','Ferromolybdenum','Electricity','Fuel'\];

  const values \= \[b.feVirgin, b.feScrap, b.fecr, b.ni, b.femo, b.elec, b.fuel\];

  const colors \= \['\#8b9298','\#8b9298','\#8b9298','\#8b9298','\#8b9298','\#4a90a4','\#e0b84a'\];

  if (\!waterfallChart){

    waterfallChart \= new Chart(document.getElementById('waterfall'), {

      type:'bar',

      data:{ labels:\['Your mix'\], datasets: labels.map((l,i)=\>({label:l, data:\[values\[i\]\], backgroundColor:colors\[i\]})) },

      options:{ indexAxis:'y', responsive:true,

        scales:{ x:{stacked:true, grid:{color:'\#333a41'}, ticks:{color:'\#8b9298'}, title:{display:true,text:'tCO₂ / tonne',color:'\#8b9298'}},

                 y:{stacked:true, grid:{display:false}, ticks:{color:'\#eceeef'}} },

        plugins:{ legend:{position:'bottom', labels:{color:'\#c7ccd0', boxWidth:12, font:{size:11}}} } }

    });

  } else {

    waterfallChart.data.datasets.forEach((ds,i)=\> ds.data \= \[values\[i\]\]);

    waterfallChart.update();

  }

  const stepRows \= \[

    \['Virgin iron unit', b.feVirgin, 'Scope 3'\], \['Scrap iron unit', b.feScrap, 'Scope 3'\],

    \['Ferrochrome', b.fecr, 'Scope 3'\], \['Nickel', b.ni, 'Scope 3'\], \['Ferromolybdenum', b.femo, 'Scope 3'\],

    \['Electricity (melt+refine+cast+finish)', b.elec, 'Scope 2'\], \['Fuel (reheat/anneal/soak)', b.fuel, 'Scope 1'\]

  \];

  let stepHTML \= '\<tr\>\<th\>Process step\</th\>\<th\>tCO₂/t\</th\>\<th\>Scope\</th\>\</tr\>';

  stepRows.forEach(row=\>{ if (row\[1\] \> 0.0001) stepHTML \+= \`\<tr\>\<td\>${row\[0\]}\</td\>\<td\>${row\[1\].toFixed(3)}\</td\>\<td\>${row\[2\]}\</td\>\</tr\>\`; });

  stepHTML \+= \`\<tr class="total"\>\<td\>Total\</td\>\<td\>${r.total.toFixed(3)}\</td\>\<td\>—\</td\>\</tr\>\`;

  document.getElementById('stepTable').innerHTML \= stepHTML;

  const benchLabels \= \['BF-BOF\\ncarbon steel','Scrap-EAF\\ncarbon steel','Global avg\\nstainless','Your mix'\];

  const benchValues \= \[2.2, 0.4, 2.93, r.total\];

  const benchColors \= \['\#5a5f65','\#5a5f65','\#5a5f65', colorForCO2(r.total)\];

  if (\!benchmarkChart){

    benchmarkChart \= new Chart(document.getElementById('benchmark'), {

      type:'bar',

      data:{ labels: benchLabels, datasets:\[{ data: benchValues, backgroundColor: benchColors }\] },

      options:{ responsive:true, plugins:{ legend:{display:false} },

        scales:{ y:{beginAtZero:true, grid:{color:'\#333a41'}, ticks:{color:'\#8b9298'}, title:{display:true,text:'tCO₂/t',color:'\#8b9298'}},

                 x:{grid:{display:false}, ticks:{color:'\#c7ccd0', font:{size:11}}} } }

    });

  } else {

    benchmarkChart.data.datasets\[0\].data \= benchValues;

    benchmarkChart.data.datasets\[0\].backgroundColor \= benchColors;

    benchmarkChart.update();

  }

  // Legal & regulatory benchmark chart (total-embedded-boundary bars only, for a fair comparison)

  const legalTotal \= LEGAL\_BENCHMARKS.filter(b=\>b.group==='total');

  const legalLabels \= legalTotal.map(b=\>b.label).concat(\['Your mix (total)'\]);

  const legalValues \= legalTotal.map(b=\>b.value).concat(\[r.total\]);

  const legalColors \= legalTotal.map(()=\> '\#5a5f65').concat(\[colorForCO2(r.total)\]);

  if (\!legalChart){

    legalChart \= new Chart(document.getElementById('legalChart'), {

      type:'bar',

      data:{ labels: legalLabels, datasets:\[{ data: legalValues, backgroundColor: legalColors }\] },

      options:{ indexAxis:'y', responsive:true, plugins:{ legend:{display:false} },

        scales:{ x:{beginAtZero:true, grid:{color:'\#333a41'}, ticks:{color:'\#8b9298'}, title:{display:true,text:'tCO₂(e)/t — total embedded boundary',color:'\#8b9298'}},

                 y:{grid:{display:false}, ticks:{color:'\#c7ccd0', font:{size:10.5}}} } }

    });

  } else {

    legalChart.data.datasets\[0\].data \= legalValues;

    legalChart.data.datasets\[0\].backgroundColor \= legalColors;

    legalChart.update();

  }

  let legalTableHTML \= '\<tr\>\<th\>Benchmark\</th\>\<th\>Value tCO₂(e)/t\</th\>\<th\>Boundary\</th\>\</tr\>';

  LEGAL\_BENCHMARKS.forEach(b=\>{

    legalTableHTML \+= \`\<tr\>\<td\>${b.label}\</td\>\<td\>${b.value.toFixed(3)}\</td\>\<td\>${b.group==='scope1'?'Scope 1 only':'Total embedded'}\</td\>\</tr\>\`;

  });

  legalTableHTML \+= \`\<tr class="total"\>\<td\>Your Scope 1 (compare to EU ETS rows above)\</td\>\<td\>${r.scope1.toFixed(3)}\</td\>\<td\>Scope 1 only\</td\>\</tr\>\`;

  legalTableHTML \+= \`\<tr class="total"\>\<td\>Your total (compare to CBAM/CCTS/global rows above)\</td\>\<td\>${r.total.toFixed(3)}\</td\>\<td\>Total embedded\</td\>\</tr\>\`;

  document.getElementById('legalTable').innerHTML \= legalTableHTML;

  renderElements();

  return r;

}

function gradientSearch(){

  const g \= GRADES\[state.grade\];

  const baseCost \= costIndex(state);

  let best \= null;

  const explored \= \[\];

  for (let scrap=0; scrap\<=g.scrapCap; scrap+=10){

    for (let ren=0; ren\<=100; ren+=20){

      for (const fe of \['coalDRI','gasDRI','pigIron'\]){

        for (const fc of \['standard','lowc'\]){

          for (const rec of \['standard','optimised'\]){

            for (const fu of \['eaf','if'\]){

              const cand \= {grade:state.grade, product:state.product, scrap, feSource:fe, fecrSource:fc,

                furnace:fu, refine:state.refine, cast:state.cast, gridRegion:state.gridRegion, renewable:ren, recovery:rec, idealYield:state.idealYield};

              const r \= compute(cand);

              const cost \= costIndex(cand);

              explored.push({co2:r.total, cost});

              if (cost \<= baseCost\*1.15){

                if (\!best || r.total \< best.r.total) best \= {cand, r, cost};

              }

            }

          }

        }

      }

    }

  }

  const currentCost \= costIndex(state);

  const currentR \= compute(state);

  if (\!paretoChart){

    paretoChart \= new Chart(document.getElementById('pareto'), {

      type:'scatter',

      data:{ datasets:\[

        { label:'Explored mixes', data: explored.map(e=\>({x:e.cost, y:e.co2})), backgroundColor:'rgba(139,146,152,0.35)', pointRadius:2.5 },

        { label:'Your current mix', data:\[{x:currentCost, y:currentR.total}\], backgroundColor:'\#e8622c', pointRadius:7 },

        { label:'Recommended', data: best? \[{x:best.cost, y:best.r.total}\]:\[\], backgroundColor:'\#4fbf9f', pointRadius:7 }

      \]},

      options:{ responsive:true,

        scales:{ x:{title:{display:true,text:'Relative cost index',color:'\#8b9298'}, grid:{color:'\#333a41'}, ticks:{color:'\#8b9298'}},

                 y:{title:{display:true,text:'tCO₂/t',color:'\#8b9298'}, grid:{color:'\#333a41'}, ticks:{color:'\#8b9298'}} },

        plugins:{ legend:{position:'bottom', labels:{color:'\#c7ccd0', boxWidth:12, font:{size:11}}} } }

    });

  } else {

    paretoChart.data.datasets\[0\].data \= explored.map(e=\>({x:e.cost, y:e.co2}));

    paretoChart.data.datasets\[1\].data \= \[{x:currentCost, y:currentR.total}\];

    paretoChart.data.datasets\[2\].data \= best? \[{x:best.cost, y:best.r.total}\]:\[\];

    paretoChart.update();

  }

  renderComparisonAndRoadmap(best, currentR);

  return best;

}

const FE\_SOURCE\_LABELS \= {coalDRI:'Coal DRI', gasDRI:'Gas DRI', pigIron:'Pig iron / hot metal'};

const FECR\_LABELS \= {standard:'Standard SAF', lowc:'Closed furnace \+ preheat'};

const RECOVERY\_LABELS \= {standard:'Standard practice', optimised:'Optimised slag control'};

const ROADMAP\_LEVERS \= \[

  {key:'recovery', label:v=\>\`Move to ${RECOVERY\_LABELS\[v\].toLowerCase()} for alloy recovery\`, effort:'easy', effortLabel:'Easy — no capex', note:'Process/operational discipline only. Nothing to buy, nothing to negotiate.'},

  {key:'fecrSource', label:v=\>\`Switch to ${FECR\_LABELS\[v\].toLowerCase()} ferrochrome\`, effort:'medium', effortLabel:'Medium — supplier change', note:'Requires qualifying a new ferrochrome supplier and accepting a moderate cost premium.'},

  {key:'scrap', label:v=\>\`Raise scrap share to ${v}%\`, effort:'medium', effortLabel:'Medium — sourcing contracts', note:'Needs stronger long-term scrap collection/purchase agreements — scrap availability is a shared, constrained resource.'},

  {key:'renewable', label:v=\>\`Raise renewable/PPA power to ${v}%\`, effort:'medium', effortLabel:'Medium-hard — PPA/capex', note:'Requires a power purchase agreement or captive renewable capacity — a real investment decision, not a switch flip.'},

  {key:'feSource', label:v=\>\`Switch virgin iron unit to ${FE\_SOURCE\_LABELS\[v\].toLowerCase()}\`, effort:'hard', effortLabel:'Hard — infrastructure', note:'Requires a different DRI/hot-metal supplier or fuel infrastructure — the slowest lever to pull.'},

  {key:'furnace', label:v=\>\`Switch melting furnace to ${FURNACE\[v\].label}\`, effort:'hard', effortLabel:'Hard — major capex', note:'A different furnace is a capital project, not an operating decision — only relevant when planning a new line.'}

\];

function renderComparisonAndRoadmap(best, currentR){

  const compareEl \= document.getElementById('compareTable');

  const roadmapEl \= document.getElementById('roadmapList');

  if (\!best || best.r.total \>= currentR.total \- 0.001){

    compareEl.innerHTML \= '\<tr\>\<td colspan="3" style="text-align:center;color:var(--good);"\>Your current mix already matches the lowest-carbon practical option the optimiser found — no cheaper carbon available within the cost cap right now.\</td\>\</tr\>';

    roadmapEl.innerHTML \= '\<p class="hint"\>Nothing to recommend — try loosening the cost cap by pushing scrap or renewable share manually to see what a bigger investment could buy.\</p\>';

    return;

  }

  const cand \= best.cand;

  const rows \= \[

    \['Melting furnace', FURNACE\[state.furnace\].label, FURNACE\[cand.furnace\].label\],

    \['Scrap share', state.scrap+'%', cand.scrap+'%'\],

    \['Virgin iron unit', FE\_SOURCE\_LABELS\[state.feSource\], FE\_SOURCE\_LABELS\[cand.feSource\]\],

    \['Ferrochrome source', FECR\_LABELS\[state.fecrSource\], FECR\_LABELS\[cand.fecrSource\]\],

    \['Alloy recovery', RECOVERY\_LABELS\[state.recovery\], RECOVERY\_LABELS\[cand.recovery\]\],

    \['Renewable / PPA power', state.renewable+'%', cand.renewable+'%'\]

  \];

  let html \= '\<tr\>\<th\>Parameter\</th\>\<th\>Your mix\</th\>\<th\>Recommended\</th\>\</tr\>';

  rows.forEach(r=\>{

    const changed \= r\[1\] \!== r\[2\];

    html \+= \`\<tr\>\<td\>${r\[0\]}\</td\>\<td\>${r\[1\]}\</td\>\<td style="${changed?'color:var(--good);font-weight:600;':''}"\>${r\[2\]}\</td\>\</tr\>\`;

  });

  const pctDown \= (100\*(currentR.total-best.r.total)/currentR.total).toFixed(0);

  html \+= \`\<tr class="total"\>\<td\>Total CO₂/t\</td\>\<td\>${currentR.total.toFixed(3)}\</td\>\<td style="color:var(--good);"\>${best.r.total.toFixed(3)} (−${pctDown}%)\</td\>\</tr\>\`;

  compareEl.innerHTML \= html;

  // Build the step-by-step transition, applying each changed lever in easy→hard order and tracking the running total

  let scenario \= Object.assign({}, state);

  let runningTotal \= currentR.total;

  let stepNum \= 0;

  let stepsHTML \= '';

  ROADMAP\_LEVERS.forEach(lever=\>{

    const targetVal \= cand\[lever.key\];

    if (scenario\[lever.key\] \=== targetVal) return;

    const before \= compute(scenario).total;

    scenario \= Object.assign({}, scenario, {\[lever.key\]: targetVal});

    const after \= compute(scenario).total;

    const delta \= before \- after;

    stepNum++;

    stepsHTML \+= \`\<div class="rstep"\>

      \<div class="rnum"\>${stepNum}\</div\>

      \<div class="rbody"\>

        \<div class="rtitle"\>${lever.label(targetVal)}\</div\>

        \<div class="rmeta"\>

          \<span class="rtag ${lever.effort}"\>${lever.effortLabel}\</span\>

          \<span class="rdelta"\>${delta\>=0?'−':'+'}${Math.abs(delta).toFixed(3)} tCO₂/t\</span\>

        \</div\>

        \<div class="rrun"\>${lever.note} Running total after this step: ${after.toFixed(3)} tCO₂/t.\</div\>

      \</div\>

    \</div\>\`;

  });

  roadmapEl.innerHTML \= stepsHTML || '\<p class="hint"\>No lever changes needed.\</p\>';

}

function applyCandidate(cand){

  state.scrap \= cand.scrap; state.feSource \= cand.feSource; state.fecrSource \= cand.fecrSource;

  state.renewable \= cand.renewable; state.recovery \= cand.recovery; state.furnace \= cand.furnace;

  syncControlsFromState(); render();

}

function syncControlsFromState(){

  document.getElementById('scrap').value \= state.scrap;

  document.getElementById('scrapNum').value \= state.scrap;

  document.getElementById('renewable').value \= state.renewable;

  document.getElementById('renewableNum').value \= state.renewable;

  document.getElementById('gridRegion').value \= state.gridRegion;

  document.getElementById('product').value \= state.product;

  document.getElementById('idealYield').checked \= state.idealYield;

  document.querySelectorAll('\[data-group=feSource\]').forEach(t=\> t.classList.toggle('active', t.dataset.val===state.feSource));

  document.querySelectorAll('\[data-group=fecrSource\]').forEach(t=\> t.classList.toggle('active', t.dataset.val===state.fecrSource));

  document.querySelectorAll('\[data-group=recovery\]').forEach(t=\> t.classList.toggle('active', t.dataset.val===state.recovery));

  document.querySelectorAll('\[data-group=furnace\]').forEach(t=\> t.classList.toggle('active', t.dataset.val===state.furnace));

  document.querySelectorAll('\[data-group=refine\]').forEach(t=\> t.classList.toggle('active', t.dataset.val===state.refine));

  document.querySelectorAll('\[data-group=cast\]').forEach(t=\> t.classList.toggle('active', t.dataset.val===state.cast));

  document.getElementById('recovVal').textContent \= state.recovery \=== 'optimised' ? 'optimised' : 'standard';

  document.getElementById('productHint').textContent \= PRODUCTS\[state.product\].hint;

  document.getElementById('customFields').style.display \= (state.grade \=== '\_\_custom\_\_') ? 'block' : 'none';

  const isBF \= state.furnace \=== 'bfbof';

  document.getElementById('bfbofWarning').style.display \= isBF ? 'block' : 'none';

  document.getElementById('refineField').style.display \= isBF ? 'none' : 'block';

}

function populateGradeSelect(){

  const sel \= document.getElementById('grade');

  const families \= {};

  Object.keys(GRADES).forEach(k=\>{ const f \= GRADES\[k\].family; if (\!families\[f\]) families\[f\] \= \[\]; families\[f\].push(k); });

  let html \= '';

  Object.keys(families).forEach(f=\>{

    html \+= \`\<optgroup label="${f}"\>\`;

    families\[f\].forEach(k=\> html \+= \`\<option value="${k}"\>${k}\</option\>\`);

    html \+= \`\</optgroup\>\`;

  });

  sel.innerHTML \= html; sel.value \= state.grade;

}

function populateProductSelect(){

  const sel \= document.getElementById('product');

  let html \= '';

  Object.keys(PRODUCTS).forEach(k=\> html \+= \`\<option value="${k}"\>${PRODUCTS\[k\].label}\</option\>\`);

  sel.innerHTML \= html; sel.value \= state.product;

}

function buildGradeTable(){

  let html \= '\<table\>\<tr\>\<th\>Grade\</th\>\<th\>Family\</th\>\<th\>Cr%\</th\>\<th\>Ni%\</th\>\<th\>Mo%\</th\>\<th\>Scrap ceiling\</th\>\</tr\>';

  Object.keys(GRADES).forEach(k=\>{

    const g \= GRADES\[k\];

    html \+= \`\<tr\>\<td\>${k}\</td\>\<td\>${g.family}\</td\>\<td\>${g.cr}\</td\>\<td\>${g.ni}\</td\>\<td\>${g.mo||0}\</td\>\<td\>${g.scrapCap}%\</td\>\</tr\>\`;

  });

  html \+= '\</table\>';

  document.getElementById('gradeTableHolder').innerHTML \= html;

}

function buildOverridePanel(){

  const fields \= \[

    \['coalDRI','Coal DRI tCO₂/t'\], \['gasDRI','Gas DRI tCO₂/t'\], \['pigIron','Pig iron tCO₂/t'\],

    \['fecrStandard','Standard FeCr tCO₂/t'\], \['fecrLowC','Low-C FeCr tCO₂/t'\],

    \['niPrimary','Primary Ni tCO₂/t'\], \['femoRate','FeMo tCO₂/t'\]

  \];

  let html \= '';

  fields.forEach((\[key,label\])=\>{ html \+= \`\<div class="of"\>\<span\>${label}\</span\>\<input type="number" step="0.01" data-ef="${key}" value="${EF\[key\]}"\>\</div\>\`; });

  document.getElementById('overridePanel').innerHTML \= html;

  document.querySelectorAll('\[data-ef\]').forEach(inp=\>{

    inp.addEventListener('input', e=\>{

      const key \= e.target.dataset.ef; const v \= parseFloat(e.target.value);

      if (\!isNaN(v)) { EF\[key\] \= v; render(); gradientSearch(); }

    });

  });

}

document.getElementById('grade').addEventListener('change', e=\>{

  state.grade \= e.target.value;

  const g \= GRADES\[state.grade\];

  document.getElementById('gradeVal').textContent \= state.grade;

  document.getElementById('gradeDesc').innerHTML \= g.desc;

  document.getElementById('scrap').max \= g.scrapCap;

  document.getElementById('scrapNum').max \= g.scrapCap;

  if (state.scrap \> g.scrapCap) state.scrap \= g.scrapCap;

  document.getElementById('scrapHint').textContent \= \`Scrap ceiling for this grade: ${g.scrapCap}% (tramp-element / collection infrastructure limit).\`;

  document.getElementById('customFields').style.display \= (state.grade \=== '\_\_custom\_\_') ? 'block' : 'none';

  syncControlsFromState(); render(); gradientSearch();

});

function syncCustomGrade(){

  GRADES\['\_\_custom\_\_'\].cr \= \+document.getElementById('customCr').value;

  GRADES\['\_\_custom\_\_'\].ni \= \+document.getElementById('customNi').value;

  GRADES\['\_\_custom\_\_'\].mo \= \+document.getElementById('customMo').value;

  GRADES\['\_\_custom\_\_'\].mn \= \+document.getElementById('customMn').value;

  GRADES\['\_\_custom\_\_'\].cu \= \+document.getElementById('customCu').value;

  if (state.grade \=== '\_\_custom\_\_') { render(); gradientSearch(); }

}

\['Cr','Ni','Mo','Mn','Cu'\].forEach(el=\>{

  const slider \= document.getElementById('custom'+el), num \= document.getElementById('custom'+el+'Num');

  slider.addEventListener('input', ()=\>{ num.value \= slider.value; syncCustomGrade(); });

  num.addEventListener('input', ()=\>{ slider.value \= num.value; syncCustomGrade(); });

});

document.querySelectorAll('\[data-group=furnace\]').forEach(t=\>{

  t.addEventListener('click', ()=\>{

    state.furnace \= t.dataset.val;

    const isBF \= state.furnace \=== 'bfbof';

    document.getElementById('bfbofWarning').style.display \= isBF ? 'block' : 'none';

    document.getElementById('refineField').style.display \= isBF ? 'none' : 'block';

    if (isBF){

      const cap \= Math.min(GRADES\[state.grade\].scrapCap, BFBOF\_SCRAP\_CAP);

      document.getElementById('scrap').max \= cap;

      document.getElementById('scrapNum').max \= cap;

      if (state.scrap \> cap) state.scrap \= cap;

    } else {

      const cap \= GRADES\[state.grade\].scrapCap;

      document.getElementById('scrap').max \= cap;

      document.getElementById('scrapNum').max \= cap;

    }

    syncControlsFromState(); render(); gradientSearch();

  });

});

document.getElementById('product').addEventListener('change', e=\>{ state.product \= e.target.value; syncControlsFromState(); render(); gradientSearch(); });

document.getElementById('scrap').addEventListener('input', e=\>{ state.scrap \= \+e.target.value; document.getElementById('scrapNum').value \= state.scrap; render(); });

document.getElementById('scrapNum').addEventListener('input', e=\>{

  const max \= \+document.getElementById('scrap').max; let v \= clamp(+e.target.value || 0, 0, max);

  state.scrap \= v; document.getElementById('scrap').value \= v; render();

});

document.getElementById('renewable').addEventListener('input', e=\>{ state.renewable \= \+e.target.value; document.getElementById('renewableNum').value \= state.renewable; render(); });

document.getElementById('renewableNum').addEventListener('input', e=\>{

  let v \= clamp(+e.target.value || 0, 0, 100); state.renewable \= v; document.getElementById('renewable').value \= v; render();

});

document.getElementById('gridRegion').addEventListener('change', e=\>{ state.gridRegion \= e.target.value; render(); gradientSearch(); });

document.getElementById('idealYield').addEventListener('change', e=\>{ state.idealYield \= e.target.checked; render(); gradientSearch(); });

\['feSource','fecrSource','recovery','refine','cast'\].forEach(group=\>{

  document.querySelectorAll(\`\[data-group=${group}\]\`).forEach(t=\>{

    t.addEventListener('click', ()=\>{ state\[group\] \= t.dataset.val; syncControlsFromState(); render(); gradientSearch(); });

  });

});

document.getElementById('optimizeBtn').addEventListener('click', ()=\>{

  const best \= gradientSearch();

  const note \= document.getElementById('optNote');

  if (best){

    const before \= compute(state).total;

    note.style.display \= 'block';

    note.textContent \= \`Best practical mix found: ${best.cand.scrap}% scrap, ${best.cand.renewable}% renewable, ${best.cand.fecrSource==='lowc'?'closed-furnace FeCr':'standard FeCr'}, ${best.cand.feSource} for virgin iron, ${FURNACE\[best.cand.furnace\].label} melting, ${best.cand.recovery} recovery — ${best.r.total.toFixed(2)} tCO₂/t vs. ${before.toFixed(2)} today (${(100\*(before-best.r.total)/before).toFixed(0)}% lower), within a 15% cost premium cap.\`;

    applyCandidate(best.cand);

  }

});

document.getElementById('resetBtn').addEventListener('click', ()=\>{

  state.grade='J304'; state.product='crCoil'; state.scrap=60; state.feSource='coalDRI'; state.fecrSource='standard';

  state.furnace='eaf'; state.refine='aod'; state.cast='continuous';

  state.gridRegion='india'; state.renewable=30; state.recovery='standard'; state.idealYield=false;

  document.getElementById('grade').value='J304';

  document.getElementById('gradeVal').textContent='J304';

  document.getElementById('gradeDesc').innerHTML \= GRADES\['J304'\].desc;

  document.getElementById('scrap').max \= GRADES\['J304'\].scrapCap;

  document.getElementById('scrapNum').max \= GRADES\['J304'\].scrapCap;

  document.getElementById('optNote').style.display='none';

  syncControlsFromState(); render(); gradientSearch();

});

document.getElementById('overrideToggle').addEventListener('click', ()=\>{

  const p \= document.getElementById('overridePanel');

  p.style.display \= p.style.display \=== 'block' ? 'none' : 'block';

});

// init

populateGradeSelect();

populateProductSelect();

document.getElementById('gradeDesc').innerHTML \= GRADES\['J304'\].desc;

document.getElementById('scrapHint').textContent \= \`Scrap ceiling for this grade: ${GRADES\['J304'\].scrapCap}% (tramp-element / collection infrastructure limit).\`;

document.getElementById('scrap').max \= GRADES\['J304'\].scrapCap;

document.getElementById('scrapNum').max \= GRADES\['J304'\].scrapCap;

buildGradeTable();

buildOverridePanel();

syncControlsFromState();

render();

gradientSearch();

\</script\>

\</body\>

\</html\>