import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ffmpegPath from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';

const root = resolve(import.meta.dirname, '..');
const demoDir = resolve(root, 'demo');
const framesDir = resolve(demoDir, 'frames');
const workDir = resolve(demoDir, 'work');
const subtitles = resolve(demoDir, 'tracebound-demo.srt');
const joinedVideo = resolve(workDir, 'tracebound-demo-joined.mp4');
const finalVideo = resolve(demoDir, 'Tracebound-Open-Agent-Hackathon-Demo.mp4');

const scenes = [
  {
    frame: 'slide-1.png',
    narration: 'Tracebound is an evidence-first incident investigation agent built for the Open Agent Hackathon track, The Agent That Can Explain Why.',
  },
  {
    frame: 'slide-2.png',
    narration: 'During an incident, metrics, deployments, earlier incidents, and runbooks live in separate systems. A plausible explanation is not enough unless responders can inspect what supports it and what contradicts the alternatives.',
  },
  {
    frame: 'app-start.png',
    narration: 'This demo uses clearly labeled synthetic data and deterministic sample mode. Tracebound never presents the sample score as a production probability and never executes remediation.',
  },
  {
    frame: 'slide-3.png',
    narration: 'When the investigation starts, every record enters a shared World Model with a stable content-derived identifier, a SHA-256 digest, source type, locator, observation time, and agent attribution.',
  },
  {
    frame: 'app-result-top.png',
    narration: 'The same evidence cannot be silently duplicated. Every later claim links back to the exact records selected for that run.',
  },
  {
    frame: 'slide-4.png',
    narration: 'A Planner begins with a deliberately narrow four-record slice. The Investigator scores all three competing hypotheses from explicit support and contradiction links.',
  },
  {
    frame: 'app-result-mid.png',
    narration: 'The Challenger detects missing source types and uncovered alternatives. The Evaluator rejects that incomplete first pass and allows exactly one broader retry.',
  },
  {
    frame: 'app-result-mid.png',
    narration: 'On iteration two, the investigation uses all seven records and stops. The bounded loop cannot spin indefinitely.',
  },
  {
    frame: 'slide-5.png',
    narration: 'The leading explanation is a payments timeout and retry cascade. A deployment reduced the timeout from three thousand to fifteen hundred milliseconds and raised retries from one to three.',
  },
  {
    frame: 'app-result-top.png',
    narration: 'Payments p95 reached twenty-one hundred milliseconds and retry volume rose three point one times while traffic stayed flat. Database saturation remained normal.',
  },
  {
    frame: 'app-result-mid.png',
    narration: 'Tracebound therefore supports the timeout-and-retry cause while explicitly contradicting the traffic-spike and database-saturation alternatives.',
  },
  {
    frame: 'app-evidence.png',
    narration: 'The recommended action is reversible: canary the previous timeout, cap retries at one, and validate the change against the cited metrics before broad rollout.',
  },
  {
    frame: 'slide-6.png',
    narration: 'The repository includes a fail-closed Zetaris REST SQL adapter, Meterless World Model services, and a fail-closed Nightshift OpenAI-compatible adapter. NVIDIA can be configured behind Nightshift.',
  },
  {
    frame: 'slide-6.png',
    narration: 'Live sponsor verification is still pending account-owner setup, so this recording does not claim that a real Zetaris, Nightshift, or NVIDIA call succeeded.',
  },
  {
    frame: 'slide-7.png',
    narration: 'Fresh release checks pass nine tests, TypeScript type checking, the production build, a dependency audit with zero vulnerabilities, an API smoke run, and a secret-pattern scan.',
  },
  {
    frame: 'slide-9.png',
    narration: 'Tracebound makes the investigation inspectable: what was selected, which alternatives were contradicted, why a retry happened, and which bounded action follows. The code, deck, architecture notes, and three synthetic cases are public at github dot com slash sidsri fourteen slash tracebound.',
  },
];

function run(program, args) {
  const result = spawnSync(program, args, { cwd: root, encoding: 'utf8', stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${program} exited with status ${result.status}`);
}

function duration(path) {
  const result = spawnSync(
    ffprobeStatic.path,
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', path],
    { cwd: root, encoding: 'utf8' },
  );
  if (result.status !== 0) throw new Error(`ffprobe failed for ${path}`);
  return Number(result.stdout.trim());
}

function srtTime(seconds) {
  const millis = Math.max(0, Math.round(seconds * 1000));
  const ms = millis % 1000;
  const totalSeconds = Math.floor(millis / 1000);
  const sec = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const min = totalMinutes % 60;
  const hour = Math.floor(totalMinutes / 60);
  return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

function ffconcatPath(path) {
  return path.replaceAll('\\', '/').replaceAll("'", "'\\''");
}

function captionChunks(text, maxWords = 12) {
  const chunks = [];
  for (const clause of text.split(/(?<=[,;:.!?])\s+/)) {
    const words = clause.trim().split(/\s+/);
    for (let offset = 0; offset < words.length; offset += maxWords) {
      chunks.push(words.slice(offset, offset + maxWords).join(' '));
    }
  }
  return chunks;
}

rmSync(workDir, { recursive: true, force: true });
mkdirSync(workDir, { recursive: true });

const speechScript = resolve(workDir, 'synthesize.ps1');
writeFileSync(speechScript, String.raw`param(
  [Parameter(Mandatory = $true)][string]$TextPath,
  [Parameter(Mandatory = $true)][string]$OutputPath
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
try { $speaker.SelectVoice('Microsoft Zira Desktop') } catch { }
$speaker.Rate = 1
$speaker.Volume = 100
$speaker.SetOutputToWaveFile($OutputPath)
$speaker.Speak([System.IO.File]::ReadAllText($TextPath))
$speaker.Dispose()
`);

const segmentPaths = [];
const captionRows = [];
let captionIndex = 1;
let timeline = 0;
const tailDuration = 0.65;

for (const [index, scene] of scenes.entries()) {
  const sceneNumber = String(index + 1).padStart(2, '0');
  const textPath = resolve(workDir, `scene-${sceneNumber}.txt`);
  const audioPath = resolve(workDir, `scene-${sceneNumber}.wav`);
  const segmentPath = resolve(workDir, `scene-${sceneNumber}.mp4`);
  const framePath = resolve(framesDir, scene.frame);

  writeFileSync(textPath, `${scene.narration}\n`);
  run('powershell.exe', [
    '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', speechScript,
    '-TextPath', textPath, '-OutputPath', audioPath,
  ]);

  const spokenDuration = duration(audioPath);
  const segmentDuration = spokenDuration + tailDuration;
  const fadeOutStart = Math.max(0, spokenDuration - 0.45);
  const videoFadeOutStart = Math.max(0, segmentDuration - 0.3);

  const chunks = captionChunks(scene.narration);
  const wordCounts = chunks.map((chunk) => chunk.split(/\s+/).length);
  const totalWords = wordCounts.reduce((sum, count) => sum + count, 0);
  let captionStart = timeline + 0.05;
  for (const [chunkIndex, chunk] of chunks.entries()) {
    const captionEnd = chunkIndex === chunks.length - 1
      ? timeline + spokenDuration
      : captionStart + spokenDuration * (wordCounts[chunkIndex] / totalWords);
    captionRows.push(
      `${captionIndex}\n${srtTime(captionStart)} --> ${srtTime(captionEnd)}\n${chunk}`,
    );
    captionIndex += 1;
    captionStart = captionEnd;
  }

  run(ffmpegPath, [
    '-y', '-loglevel', 'error', '-loop', '1', '-i', framePath, '-i', audioPath,
    '-filter_complex',
    `[0:v]scale=1440:900:force_original_aspect_ratio=decrease,pad=1440:900:(ow-iw)/2:(oh-ih)/2,fade=t=in:st=0:d=0.25,fade=t=out:st=${videoFadeOutStart.toFixed(3)}:d=0.3[v];[1:a]afade=t=in:st=0:d=0.15,afade=t=out:st=${fadeOutStart.toFixed(3)}:d=0.4,apad=pad_dur=${tailDuration}[a]`,
    '-map', '[v]', '-map', '[a]', '-r', '30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21',
    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-ac', '2',
    '-t', segmentDuration.toFixed(3), '-movflags', '+faststart', segmentPath,
  ]);

  segmentPaths.push(segmentPath);
  timeline += segmentDuration;
  console.log(`Built scene ${sceneNumber}/${scenes.length}: ${segmentDuration.toFixed(2)} seconds`);
}

writeFileSync(subtitles, `${captionRows.join('\n\n')}\n`);
const concatList = resolve(workDir, 'segments.ffconcat');
writeFileSync(
  concatList,
  `ffconcat version 1.0\n${segmentPaths.map((path) => `file '${ffconcatPath(path)}'`).join('\n')}\n`,
);

run(ffmpegPath, [
  '-y', '-loglevel', 'error', '-safe', '0', '-f', 'concat', '-i', concatList,
  '-c', 'copy', '-movflags', '+faststart', joinedVideo,
]);

run(ffmpegPath, [
  '-y', '-loglevel', 'error', '-i', joinedVideo,
  '-vf', "subtitles=demo/tracebound-demo.srt:force_style='FontName=Arial,FontSize=13,PrimaryColour=&H00FFFFFF,OutlineColour=&H00101816,BorderStyle=3,BackColour=&H9007100F,Outline=1,Shadow=0,Alignment=2,MarginL=110,MarginR=110,MarginV=26'",
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
  '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2',
  '-movflags', '+faststart', finalVideo,
]);

console.log(`Saved ${finalVideo}`);
console.log(`Scenes: ${scenes.length}`);
console.log(`Final video: ${duration(finalVideo).toFixed(3)} seconds`);
