import React, { useState, useEffect, useRef } from 'react';
import {
  Monitor,
  Volume2,
  Gamepad2,
  Cpu,
  Layers,
  Sparkles,
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Download,
  Info,
  RefreshCw,
  Sliders,
  Eye,
  Check,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AppId } from '../../types/os';
import { soundEngine } from '../../utils/sound';

interface DxDiagProps {
  onLaunchApp?: (appId: AppId) => void;
  onClose?: () => void;
}

export const DxDiag: React.FC<DxDiagProps> = ({ onLaunchApp, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    'system' | 'display' | 'sound' | 'input' | 'benchmark' | 'installer'
  >('system');

  // Benchmark & Shader Lab State
  const [d3dVersion, setD3dVersion] = useState<'dx11' | 'dx12'>('dx12');
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [raytracingSim, setRaytracingSim] = useState<boolean>(true);
  const [vrsTier, setVrsTier] = useState<'off' | '2x2' | '4x4'>('2x2');
  const [tessellationLevel, setTessellationLevel] = useState<number>(3);
  const [meshRotationSpeed, setMeshRotationSpeed] = useState<number>(1.2);
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);
  const [benchmarkProgress, setBenchmarkProgress] = useState<number>(0);
  const [benchmarkScore, setBenchmarkScore] = useState<number | null>(null);
  const [fps, setFps] = useState<number>(60);
  const [drawCalls, setDrawCalls] = useState<number>(142);
  const [vramUsageMb, setVramUsageMb] = useState<number>(2450);
  const [gpuLoad, setGpuLoad] = useState<number>(38);

  // Installer & Repair Wizard State
  const [isInstallingUpdate, setIsInstallingUpdate] = useState<boolean>(false);
  const [installProgress, setInstallProgress] = useState<number>(0);
  const [installLog, setInstallLog] = useState<string[]>([]);
  const [runtimeStatus, setRuntimeStatus] = useState<'healthy' | 'updating' | 'updated'>('healthy');

  // WebGL Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const rotationAngleRef = useRef<number>(0);

  // Live FPS & GPU load simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (isBenchmarking) {
        setFps(Math.floor(58 + Math.random() * 5));
        setGpuLoad(Math.floor(92 + Math.random() * 7));
        setDrawCalls(d3dVersion === 'dx12' ? 1240 : 420);
        setVramUsageMb(d3dVersion === 'dx12' ? 3850 : 2890);
      } else {
        setFps(Math.floor(59 + Math.random() * 3));
        setGpuLoad(d3dVersion === 'dx12' ? 32 + Math.floor(Math.random() * 6) : 46 + Math.floor(Math.random() * 8));
        setDrawCalls(d3dVersion === 'dx12' ? 148 : 86);
        setVramUsageMb(d3dVersion === 'dx12' ? 2450 : 2100);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, [d3dVersion, isBenchmarking]);

  // 3D WebGL Direct3D Hardware Emulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || (canvas.getContext('experimental-webgl') as WebGLRenderingContext);
    if (!gl) return;

    // Vertex shader
    const vsSource = `
      attribute vec3 aPosition;
      attribute vec3 aColor;
      attribute vec3 aNormal;
      uniform mat4 uMVP;
      uniform mat4 uNormalMatrix;
      uniform vec3 uLightDir;
      uniform float uAmbient;
      uniform float uSpecular;
      varying vec3 vColor;
      varying float vLight;
      void main() {
        gl_Position = uMVP * vec4(aPosition, 1.0);
        vec3 normal = normalize((uNormalMatrix * vec4(aNormal, 0.0)).xyz);
        float diff = max(dot(normal, normalize(uLightDir)), 0.0);
        vLight = uAmbient + diff + uSpecular;
        vColor = aColor;
      }
    `;

    // Fragment shader
    const fsSource = `
      precision mediump float;
      varying vec3 vColor;
      varying float vLight;
      uniform bool uWireframe;
      uniform bool uRaytracing;
      void main() {
        vec3 col = vColor * vLight;
        if (uRaytracing) {
          col += vec3(0.08, 0.12, 0.18); // DXR ambient reflection simulation
        }
        if (uWireframe) {
          col = vec3(0.0, 0.95, 0.85);
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const createShader = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Cube vertices: position (3), color (3), normal (3)
    const vertices = new Float32Array([
      // Front
      -1, -1,  1,   0.2, 0.6, 1.0,   0, 0, 1,
       1, -1,  1,   0.2, 0.6, 1.0,   0, 0, 1,
       1,  1,  1,   0.2, 0.6, 1.0,   0, 0, 1,
      -1,  1,  1,   0.2, 0.6, 1.0,   0, 0, 1,
      // Back
      -1, -1, -1,   0.9, 0.2, 0.4,   0, 0, -1,
      -1,  1, -1,   0.9, 0.2, 0.4,   0, 0, -1,
       1,  1, -1,   0.9, 0.2, 0.4,   0, 0, -1,
       1, -1, -1,   0.9, 0.2, 0.4,   0, 0, -1,
      // Top
      -1,  1, -1,   0.2, 0.9, 0.5,   0, 1, 0,
      -1,  1,  1,   0.2, 0.9, 0.5,   0, 1, 0,
       1,  1,  1,   0.2, 0.9, 0.5,   0, 1, 0,
       1,  1, -1,   0.2, 0.9, 0.5,   0, 1, 0,
      // Bottom
      -1, -1, -1,   0.9, 0.7, 0.1,   0, -1, 0,
       1, -1, -1,   0.9, 0.7, 0.1,   0, -1, 0,
       1, -1,  1,   0.9, 0.7, 0.1,   0, -1, 0,
      -1, -1,  1,   0.9, 0.7, 0.1,   0, -1, 0,
      // Right
       1, -1, -1,   0.7, 0.3, 0.9,   1, 0, 0,
       1,  1, -1,   0.7, 0.3, 0.9,   1, 0, 0,
       1,  1,  1,   0.7, 0.3, 0.9,   1, 0, 0,
       1, -1,  1,   0.7, 0.3, 0.9,   1, 0, 0,
      // Left
      -1, -1, -1,   0.1, 0.8, 0.9,  -1, 0, 0,
      -1, -1,  1,   0.1, 0.8, 0.9,  -1, 0, 0,
      -1,  1,  1,   0.1, 0.8, 0.9,  -1, 0, 0,
      -1,  1, -1,   0.1, 0.8, 0.9,  -1, 0, 0,
    ]);

    const indices = new Uint16Array([
      0, 1, 2,  0, 2, 3,       // Front
      4, 5, 6,  4, 6, 7,       // Back
      8, 9, 10, 8, 10, 11,     // Top
      12, 13, 14, 12, 14, 15,  // Bottom
      16, 17, 18, 16, 18, 19,  // Right
      20, 21, 22, 20, 22, 23,  // Left
    ]);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    const FSIZE = Float32Array.BYTES_PER_ELEMENT;
    const aPos = gl.getAttribLocation(program, 'aPosition');
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, FSIZE * 9, 0);
    gl.enableVertexAttribArray(aPos);

    const aCol = gl.getAttribLocation(program, 'aColor');
    gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, FSIZE * 9, FSIZE * 3);
    gl.enableVertexAttribArray(aCol);

    const aNorm = gl.getAttribLocation(program, 'aNormal');
    gl.vertexAttribPointer(aNorm, 3, gl.FLOAT, false, FSIZE * 9, FSIZE * 6);
    gl.enableVertexAttribArray(aNorm);

    const uMVP = gl.getUniformLocation(program, 'uMVP');
    const uNormalMatrix = gl.getUniformLocation(program, 'uNormalMatrix');
    const uLightDir = gl.getUniformLocation(program, 'uLightDir');
    const uAmbient = gl.getUniformLocation(program, 'uAmbient');
    const uSpecular = gl.getUniformLocation(program, 'uSpecular');
    const uWireframe = gl.getUniformLocation(program, 'uWireframe');
    const uRaytracing = gl.getUniformLocation(program, 'uRaytracing');

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.08, 0.09, 0.12, 1.0);

    let angle = rotationAngleRef.current;

    const render = () => {
      angle += 0.015 * meshRotationSpeed;
      rotationAngleRef.current = angle;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Simple perspective projection * model matrix
      const aspect = canvas.width / canvas.height;
      const fov = 45 * (Math.PI / 180);
      const f = 1.0 / Math.tan(fov / 2);
      const near = 0.1;
      const far = 100.0;

      const p0 = f / aspect, p5 = f, p10 = (far + near) / (near - far), p11 = -1, p14 = (2 * far * near) / (near - far);

      // Model rotation
      const cosY = Math.cos(angle);
      const sinY = Math.sin(angle);
      const cosX = Math.cos(angle * 0.7);
      const sinX = Math.sin(angle * 0.7);

      // Translation z = -4.5
      const m0 = cosY;
      const m1 = sinY * sinX;
      const m2 = sinY * cosX;
      const m4 = 0;
      const m5 = cosX;
      const m6 = -sinX;
      const m8 = -sinY;
      const m9 = cosY * sinX;
      const m10 = cosY * cosX;

      const mvp = new Float32Array([
        p0 * m0, p0 * m1, p0 * m2, 0,
        p5 * m4, p5 * m5, p5 * m6, 0,
        p10 * m8, p10 * m9, p10 * m10 + p11 * -4.5, p11,
        0, 0, p14 + -4.5 * p10, 0,
      ]);

      const normalMat = new Float32Array([
        m0, m1, m2, 0,
        m4, m5, m6, 0,
        m8, m9, m10, 0,
        0, 0, 0, 1,
      ]);

      gl.uniformMatrix4fv(uMVP, false, mvp);
      gl.uniformMatrix4fv(uNormalMatrix, false, normalMat);
      gl.uniform3f(uLightDir, 0.8, 1.2, 1.5);
      gl.uniform1f(uAmbient, d3dVersion === 'dx12' ? 0.35 : 0.2);
      gl.uniform1f(uSpecular, d3dVersion === 'dx12' && raytracingSim ? 0.45 : 0.15);
      gl.uniform1i(uWireframe, wireframe ? 1 : 0);
      gl.uniform1i(uRaytracing, d3dVersion === 'dx12' && raytracingSim ? 1 : 0);

      const drawMode = wireframe ? gl.LINES : gl.TRIANGLES;
      gl.drawElements(drawMode, indices.length, gl.UNSIGNED_SHORT, 0);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [d3dVersion, wireframe, raytracingSim, meshRotationSpeed, activeTab]);

  // Direct3D Benchmark Run Handler
  const handleStartBenchmark = () => {
    soundEngine.playClick();
    setIsBenchmarking(true);
    setBenchmarkProgress(0);
    setBenchmarkScore(null);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setBenchmarkProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsBenchmarking(false);
        soundEngine.playDing();
        const score =
          d3dVersion === 'dx12'
            ? Math.floor(18450 + Math.random() * 850)
            : Math.floor(12300 + Math.random() * 600);
        setBenchmarkScore(score);
      }
    }, 400);
  };

  // DirectX 12 Runtime Updater / Repair Handler
  const handleRunInstaller = () => {
    soundEngine.playClick();
    setIsInstallingUpdate(true);
    setInstallProgress(0);
    setRuntimeStatus('updating');
    setInstallLog([
      'DirectX Setup Wizard initialized.',
      'Checking operating system compatibility... Windows 10 x64 detected.',
      'Verifying Direct3D 12 Agility SDK runtime components...',
    ]);

    const steps = [
      { p: 20, msg: 'Validating Direct3D 11.4 core drivers (d3d11.dll) [OK]' },
      { p: 40, msg: 'Installing DirectX 12 Ultimate runtime modules (d3d12.dll, dxgi.dll)... [OK]' },
      { p: 60, msg: 'Registering HLSL Shader Model 6.6 compiler (d3dcompiler_47.dll)... [OK]' },
      { p: 80, msg: 'Enabling DirectX Raytracing (DXR 1.1) and Variable Rate Shading (VRS)... [OK]' },
      { p: 100, msg: 'DirectX 12 Runtime installation and verification complete with 0 errors.' },
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        const item = steps[stepIdx];
        setInstallProgress(item.p);
        setInstallLog((prev) => [...prev, item.msg]);
        stepIdx++;
      } else {
        clearInterval(interval);
        setIsInstallingUpdate(false);
        setRuntimeStatus('updated');
        soundEngine.playDing();
      }
    }, 700);
  };

  // Export DxDiag.txt file
  const handleSaveInformation = () => {
    soundEngine.playDing();
    const dateStr = new Date().toLocaleString();
    const report = `------------------
System Information
------------------
      Time of this report: ${dateStr}
             Machine name: DESKTOP-WIN10PRO
               Machine Id: {B48C8431-72A0-4F23-9F9C-8E281F028C39}
         Operating System: Windows 10 Pro 64-bit (10.0, Build 19045)
                 Language: English (Regional Setting: English)
      System Manufacturer: Microsoft Corporation
             System Model: Virtual System
                     BIOS: Hyper-V UEFI Release v4.0
                Processor: Intel(R) Core(TM) i9-12900K CPU @ 3.20GHz (16 CPUs), ~3.2GHz
                   Memory: 16384MB RAM
      Available OS Memory: 16298MB RAM
                Page File: 4210MB used, 20480MB available
              Windows Dir: C:\\Windows
          DirectX Version: DirectX 12
      DX Setup Parameters: Not found
         User DPI Setting: 96 DPI (100 percent)
       System DPI Setting: 96 DPI (100 percent)
          DWM DPI Scaling: Disabled
                 Miracast: Available, with HDCP
Microsoft Graphics Hybrid: Not Supported
 DirectX Database Version: 1.6.4
           DxDiag Version: 10.0.19041.3636 64bit Unicode

------------
DxDiag Notes
------------
      Display Tab 1: No problems found.
        Sound Tab 1: No problems found.
        Input Tab 1: No problems found.

--------------------
DirectX 12 / 11 Diagnostic Specs
--------------------
   Card name: NVIDIA GeForce RTX 4080
Manufacturer: NVIDIA
   Chip type: NVIDIA GeForce RTX 4080
    DAC type: Integrated RAMDAC
 Device Type: Full Device (Direct3D 12 Ultimate Supported)
  Device Key: Enum\\PCI\\VEN_10DE&DEV_2704&SUBSYS_00000000&REV_A1
Display Memory: 16120 MB
Dedicated Memory: 12150 MB
 Shared Memory: 3970 MB
Current Mode: 1920 x 1080 (32 bit) (144Hz)
HDR Support: Supported
Driver File: nvldumdx.dll,nvwgf2um.dll,nvwgf2um.dll,nvwgf2um.dll
Driver Version: 31.0.15.5176
Driver Date: 10/12/2025 00:00:00
WHQL Logo'd: Yes
WHQL Date Stamp: Unknown
Device Identifier: {D7B71E3E-6444-11CF-8A70-0F200EC2D235}
Vendor ID: 0x10DE
Device ID: 0x2704
SubSys ID: 0x00000000
Revision ID: 0x00A1
Driver Strong Name: oem28.inf:0f99238383f98294:Section001:31.0.15.5176:pci\\ven_10de&dev_2704
Rank Of Driver: 00CF2001
Video Accel: ModeMPEG2_A ModeMPEG2_C ModeVC1_C ModeWMV9_C

DirectX Features:
   DirectDraw Acceleration: Enabled
   Direct3D Acceleration: Enabled
   AGP Texture Acceleration: Enabled
   DirectX 12 Ultimate: Supported
   Feature Levels: 12_2, 12_1, 12_0, 11_1, 11_0, 10_1, 10_0, 9_3, 9_2, 9_1
   DirectX Raytracing (DXR): Tier 1.1 Supported
   Variable Rate Shading (VRS): Tier 2 Supported
   Mesh Shaders: Supported
   Sampler Feedback: Tier 0.9 / 1.0 Supported
`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DxDiag.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f0f0] dark:bg-[#1e1e1e] text-zinc-800 dark:text-zinc-200 font-sans select-none overflow-hidden text-xs">
      {/* Top Header Banner */}
      <div className="px-4 py-3 bg-[#e8e8e8] dark:bg-[#252526] border-b border-zinc-300 dark:border-zinc-700 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-gradient-to-tr from-blue-700 to-indigo-500 text-white flex items-center justify-center shadow-xs">
            <Cpu size={16} />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-zinc-900 dark:text-white flex items-center gap-2">
              DirectX Diagnostic Tool
              <span className="text-[10px] bg-blue-600 text-white font-mono px-1.5 py-0.2 rounded font-semibold">
                DirectX 12 & 11
              </span>
            </h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Windows 10 Direct3D Graphics, Audio, and Feature Level Diagnostics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
            <ShieldCheck size={13} />
            Direct3D 12 Ultimate Enabled
          </span>
        </div>
      </div>

      {/* Classic Tab Strip */}
      <div className="flex items-center gap-0.5 px-3 pt-2 bg-[#dfdfdf] dark:bg-[#2d2d2d] border-b border-zinc-300 dark:border-zinc-700 overflow-x-auto">
        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('system');
          }}
          className={`px-3 py-1.5 font-medium rounded-t border-t border-x text-xs cursor-pointer transition-colors ${
            activeTab === 'system'
              ? 'bg-[#f0f0f0] dark:bg-[#1e1e1e] border-zinc-300 dark:border-zinc-700 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          System
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('display');
          }}
          className={`px-3 py-1.5 font-medium rounded-t border-t border-x text-xs cursor-pointer transition-colors ${
            activeTab === 'display'
              ? 'bg-[#f0f0f0] dark:bg-[#1e1e1e] border-zinc-300 dark:border-zinc-700 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          Display (Direct3D 12/11)
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('sound');
          }}
          className={`px-3 py-1.5 font-medium rounded-t border-t border-x text-xs cursor-pointer transition-colors ${
            activeTab === 'sound'
              ? 'bg-[#f0f0f0] dark:bg-[#1e1e1e] border-zinc-300 dark:border-zinc-700 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          Sound
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('input');
          }}
          className={`px-3 py-1.5 font-medium rounded-t border-t border-x text-xs cursor-pointer transition-colors ${
            activeTab === 'input'
              ? 'bg-[#f0f0f0] dark:bg-[#1e1e1e] border-zinc-300 dark:border-zinc-700 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          Input
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('benchmark');
          }}
          className={`px-3 py-1.5 font-medium rounded-t border-t border-x text-xs cursor-pointer flex items-center gap-1.5 transition-colors ${
            activeTab === 'benchmark'
              ? 'bg-[#f0f0f0] dark:bg-[#1e1e1e] border-zinc-300 dark:border-zinc-700 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Sparkles size={12} className="text-amber-500" />
          <span>3D Benchmark & Shader Lab</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('installer');
          }}
          className={`px-3 py-1.5 font-medium rounded-t border-t border-x text-xs cursor-pointer flex items-center gap-1.5 transition-colors ${
            activeTab === 'installer'
              ? 'bg-[#f0f0f0] dark:bg-[#1e1e1e] border-zinc-300 dark:border-zinc-700 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Download size={12} className="text-emerald-500" />
          <span>DirectX 12 Installer & DLLs</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: SYSTEM */}
        {activeTab === 'system' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-3 bg-white dark:bg-[#252526] rounded-md border border-zinc-300 dark:border-zinc-700 shadow-2xs">
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-3">
                This tool reports detailed information about the DirectX components and drivers installed on your system. Both
                <strong> DirectX 12</strong> (Ultimate) and <strong>DirectX 11</strong> hardware acceleration runtimes are actively available.
              </p>

              <fieldset className="border border-zinc-300 dark:border-zinc-700 rounded p-3 mb-2">
                <legend className="px-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  System Information
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1.5 gap-x-4 text-xs font-mono">
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/80 py-0.5">
                    <span className="text-zinc-500 font-sans">Current Date/Time:</span>
                    <span className="font-semibold">{new Date().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/80 py-0.5">
                    <span className="text-zinc-500 font-sans">Computer Name:</span>
                    <span className="font-semibold">DESKTOP-WIN10PRO</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/80 py-0.5">
                    <span className="text-zinc-500 font-sans">Operating System:</span>
                    <span className="font-semibold">Windows 10 Pro 64-bit (10.0, Build 19045)</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/80 py-0.5">
                    <span className="text-zinc-500 font-sans">Language:</span>
                    <span>English (United States)</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/80 py-0.5">
                    <span className="text-zinc-500 font-sans">System Manufacturer:</span>
                    <span>Microsoft Corporation</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/80 py-0.5">
                    <span className="text-zinc-500 font-sans">System Model:</span>
                    <span>Surface Studio / Virtual PC</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/80 py-0.5">
                    <span className="text-zinc-500 font-sans">BIOS:</span>
                    <span>Hyper-V UEFI Release v4.0</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/80 py-0.5">
                    <span className="text-zinc-500 font-sans">Processor:</span>
                    <span className="truncate">Intel(R) Core(TM) i9-12900K @ 3.20GHz (16 CPUs)</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/80 py-0.5">
                    <span className="text-zinc-500 font-sans">Memory:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">16384MB RAM</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/80 py-0.5">
                    <span className="text-zinc-500 font-sans">Page file:</span>
                    <span>4210MB used, 20480MB available</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/80 py-0.5 col-span-1 md:col-span-2 bg-blue-50/50 dark:bg-blue-950/20 px-1 rounded">
                    <span className="text-blue-700 dark:text-blue-300 font-sans font-bold">DirectX Version:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      DirectX 12 (Ultimate) + DirectX 11.4 Feature Levels
                    </span>
                  </div>
                </div>
              </fieldset>

              <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800/60 rounded border border-zinc-200 dark:border-zinc-700 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>WHQL Digital Signature: Driver has been verified by Microsoft Windows Hardware Quality Labs.</span>
                </div>
                <button
                  onClick={() => setActiveTab('benchmark')}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium cursor-pointer"
                >
                  Launch 3D Benchmark &gt;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DISPLAY (DIRECT3D 12 & 11) */}
        {activeTab === 'display' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Device Box */}
              <fieldset className="border border-zinc-300 dark:border-zinc-700 rounded p-3 bg-white dark:bg-[#252526]">
                <legend className="px-1 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <Monitor size={13} />
                  <span>Device</span>
                </legend>
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                    <span className="text-zinc-500 font-sans">Name:</span>
                    <span className="font-semibold">NVIDIA GeForce RTX 4080</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                    <span className="text-zinc-500 font-sans">Manufacturer:</span>
                    <span>NVIDIA Corporation</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                    <span className="text-zinc-500 font-sans">Chip Type:</span>
                    <span>GeForce RTX 4080 (AD103)</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                    <span className="text-zinc-500 font-sans">DAC Type:</span>
                    <span>Integrated RAMDAC</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                    <span className="text-zinc-500 font-sans">Device Type:</span>
                    <span className="text-blue-500 font-bold">Full Device (Direct3D 12 Ultimate)</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                    <span className="text-zinc-500 font-sans">Approx. Total Memory:</span>
                    <span>16120 MB</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                    <span className="text-zinc-500 font-sans">Display Memory (VRAM):</span>
                    <span className="font-semibold text-emerald-500">12150 MB GDDR6X</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                    <span className="text-zinc-500 font-sans">Shared Memory:</span>
                    <span>3970 MB</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                    <span className="text-zinc-500 font-sans">Current Display Mode:</span>
                    <span>1920 x 1080 (32 bit) (144Hz)</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                    <span className="text-zinc-500 font-sans">HDR:</span>
                    <span className="text-emerald-500 font-semibold">Supported</span>
                  </div>
                </div>
              </fieldset>

              {/* Drivers Box */}
              <fieldset className="border border-zinc-300 dark:border-zinc-700 rounded p-3 bg-white dark:bg-[#252526]">
                <legend className="px-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Drivers & Feature Levels
                </legend>
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                    <span className="text-zinc-500 font-sans">Main Driver:</span>
                    <span>nvldumdx.dll, nvwgf2um.dll</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                    <span className="text-zinc-500 font-sans">Driver Version:</span>
                    <span className="font-semibold">31.0.15.5176 (WHQL)</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                    <span className="text-zinc-500 font-sans">Driver Date:</span>
                    <span>10/12/2025</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                    <span className="text-zinc-500 font-sans">Driver Model:</span>
                    <span className="font-semibold text-blue-500">WDDM 2.7</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                    <span className="text-zinc-500 font-sans">DirectX 12 Feature Levels:</span>
                    <span className="font-bold text-indigo-500">12_2, 12_1, 12_0</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                    <span className="text-zinc-500 font-sans">DirectX 11 Feature Levels:</span>
                    <span className="font-bold text-sky-500">11_1, 11_0, 10_1, 10_0</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                    <span className="text-zinc-500 font-sans">DirectX Raytracing (DXR):</span>
                    <span className="text-emerald-500 font-semibold">Tier 1.1</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                    <span className="text-zinc-500 font-sans">Variable Rate Shading (VRS):</span>
                    <span className="text-emerald-500 font-semibold">Tier 2</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                    <span className="text-zinc-500 font-sans">Mesh Shaders:</span>
                    <span className="text-emerald-500 font-semibold">Supported</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                    <span className="text-zinc-500 font-sans">Sampler Feedback:</span>
                    <span className="text-emerald-500 font-semibold">Tier 0.9 / 1.0</span>
                  </div>
                </div>
              </fieldset>
            </div>

            {/* DirectX Features Acceleration Status */}
            <fieldset className="border border-zinc-300 dark:border-zinc-700 rounded p-3 bg-white dark:bg-[#252526]">
              <legend className="px-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                DirectX Features Acceleration
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs">DirectDraw Acceleration:</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Enabled</div>
                  </div>
                  <button
                    onClick={() => soundEngine.playClick()}
                    className="px-2 py-0.5 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 rounded cursor-pointer"
                  >
                    Disable
                  </button>
                </div>

                <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs">Direct3D Acceleration:</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Enabled</div>
                  </div>
                  <button
                    onClick={() => soundEngine.playClick()}
                    className="px-2 py-0.5 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 rounded cursor-pointer"
                  >
                    Disable
                  </button>
                </div>

                <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs">AGP Texture Acceleration:</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Enabled</div>
                  </div>
                  <button
                    onClick={() => soundEngine.playClick()}
                    className="px-2 py-0.5 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 rounded cursor-pointer"
                  >
                    Disable
                  </button>
                </div>
              </div>
            </fieldset>

            {/* Notes */}
            <fieldset className="border border-zinc-300 dark:border-zinc-700 rounded p-3 bg-white dark:bg-[#252526]">
              <legend className="px-1 text-xs font-semibold text-zinc-500">Notes</legend>
              <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                <p>• No problems found with Direct3D 12 or Direct3D 11 graphics hardware acceleration.</p>
                <p>• To test Direct3D functionality and compare DirectX 11 vs DirectX 12 performance, click on the "3D Benchmark & Shader Lab" tab.</p>
              </div>
            </fieldset>
          </div>
        )}

        {/* TAB 3: SOUND */}
        {activeTab === 'sound' && (
          <div className="space-y-4 animate-fadeIn">
            <fieldset className="border border-zinc-300 dark:border-zinc-700 rounded p-3 bg-white dark:bg-[#252526]">
              <legend className="px-1 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Volume2 size={13} />
                <span>Audio Device</span>
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                  <span className="text-zinc-500 font-sans">Device:</span>
                  <span className="font-semibold">Speakers (High Definition Audio Device)</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                  <span className="text-zinc-500 font-sans">Hardware ID:</span>
                  <span>HDAUDIO\\FUNC_01&VEN_10EC&DEV_0892</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                  <span className="text-zinc-500 font-sans">Driver:</span>
                  <span>HdAudio.sys, XAudio2_9.dll</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                  <span className="text-zinc-500 font-sans">Version:</span>
                  <span>10.0.19041.1 (English)</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                  <span className="text-zinc-500 font-sans">DirectSound Acceleration:</span>
                  <span className="text-emerald-500 font-semibold">Standard Acceleration (Hardware Mixing)</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 py-0.5">
                  <span className="text-zinc-500 font-sans">Spatial Sound:</span>
                  <span>Windows Sonic for Headphones</span>
                </div>
              </div>
            </fieldset>

            <div className="flex items-center gap-2 p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded border border-zinc-200 dark:border-zinc-700">
              <button
                onClick={() => soundEngine.playDing()}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium cursor-pointer"
              >
                Test DirectSound Audio
              </button>
              <span className="text-xs text-zinc-500">Plays a test wave using the DirectSound audio engine.</span>
            </div>
          </div>
        )}

        {/* TAB 4: INPUT */}
        {activeTab === 'input' && (
          <div className="space-y-4 animate-fadeIn">
            <fieldset className="border border-zinc-300 dark:border-zinc-700 rounded p-3 bg-white dark:bg-[#252526]">
              <legend className="px-1 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Gamepad2 size={13} />
                <span>DirectInput Devices</span>
              </legend>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-300 dark:border-zinc-700 text-zinc-500">
                    <th className="py-1">Device Name</th>
                    <th className="py-1">Status</th>
                    <th className="py-1">Controller ID</th>
                    <th className="py-1">Vendor ID</th>
                    <th className="py-1">Product ID</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="border-b border-zinc-100 dark:border-zinc-800/50">
                    <td className="py-1 font-sans font-medium">Standard PS/2 Keyboard</td>
                    <td className="py-1 text-emerald-500">Connected (OK)</td>
                    <td className="py-1">0x0</td>
                    <td className="py-1">0x04F2</td>
                    <td className="py-1">0x0112</td>
                  </tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800/50">
                    <td className="py-1 font-sans font-medium">HID-compliant Optical Mouse</td>
                    <td className="py-1 text-emerald-500">Connected (OK)</td>
                    <td className="py-1">0x1</td>
                    <td className="py-1">0x046D</td>
                    <td className="py-1">0xC077</td>
                  </tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800/50">
                    <td className="py-1 font-sans font-medium">Xbox Wireless Controller (XInput)</td>
                    <td className="py-1 text-emerald-500">Connected (OK)</td>
                    <td className="py-1">0x2</td>
                    <td className="py-1">0x045E</td>
                    <td className="py-1">0x02EA</td>
                  </tr>
                </tbody>
              </table>
            </fieldset>

            <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded border border-zinc-200 dark:border-zinc-700 text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">DirectInput Status:</span>
              <p className="text-zinc-500 mt-0.5">All human interface devices (HID) and XInput controllers have 0 polling conflicts.</p>
            </div>
          </div>
        )}

        {/* TAB 5: 3D BENCHMARK & SHADER LAB */}
        {activeTab === 'benchmark' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-3 bg-white dark:bg-[#252526] rounded-md border border-zinc-300 dark:border-zinc-700 shadow-2xs">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* 3D WebGL Canvas Panel */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="relative rounded-lg overflow-hidden border-2 border-zinc-400 dark:border-zinc-600 shadow-lg bg-zinc-950">
                    <canvas ref={canvasRef} width={420} height={300} className="block cursor-grab" />

                    {/* Overlay Badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-600/90 text-white shadow-xs">
                        {d3dVersion === 'dx12' ? 'Direct3D 12.2 Ultimate' : 'Direct3D 11.4'}
                      </span>
                      {d3dVersion === 'dx12' && raytracingSim && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-600/90 text-white flex items-center gap-1">
                          <Zap size={9} /> DXR ON
                        </span>
                      )}
                      {wireframe && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-cyan-600/90 text-white">
                          WIREFRAME
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-xs text-white px-2 py-1 rounded text-[11px] font-mono border border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">{fps} FPS</span>
                        <span className="text-zinc-400">({(1000 / fps).toFixed(1)} ms)</span>
                      </div>
                    </div>

                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-zinc-300 px-2 py-1 rounded text-[10px] font-mono border border-white/10 flex items-center gap-3">
                      <span>Draw Calls: {drawCalls}</span>
                      <span>VRAM: {vramUsageMb} MB</span>
                      <span>GPU: {gpuLoad}%</span>
                    </div>
                  </div>

                  {/* Benchmark Running Progress */}
                  {isBenchmarking && (
                    <div className="w-full max-w-[420px] mt-3 space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <span>Running Direct3D Stress Test...</span>
                        <span>{benchmarkProgress}%</span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full transition-all duration-300"
                          style={{ width: `${benchmarkProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {benchmarkScore !== null && !isBenchmarking && (
                    <div className="w-full max-w-[420px] mt-3 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded text-center animate-fadeIn">
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        Benchmark Complete! Direct3D Score:
                      </span>
                      <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {benchmarkScore.toLocaleString()} PTS
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        Feature Level: {d3dVersion === 'dx12' ? '12_2 (Ultimate)' : '11_1'} • 0 Graphics Errors Detected
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Controls Panel */}
                <div className="w-full lg:w-72 space-y-3">
                  {/* Version Toggle */}
                  <div>
                    <label className="font-semibold text-xs text-zinc-700 dark:text-zinc-300 block mb-1">
                      DirectX API Pipeline:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          setD3dVersion('dx11');
                        }}
                        className={`p-2 rounded text-left border cursor-pointer transition-all ${
                          d3dVersion === 'dx11'
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 font-semibold'
                            : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <div className="font-bold text-xs">DirectX 11</div>
                        <div className="text-[10px] opacity-75">Feature Level 11_1</div>
                      </button>

                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          setD3dVersion('dx12');
                        }}
                        className={`p-2 rounded text-left border cursor-pointer transition-all ${
                          d3dVersion === 'dx12'
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold'
                            : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <div className="font-bold text-xs">DirectX 12</div>
                        <div className="text-[10px] opacity-75">DX12 Ultimate (12_2)</div>
                      </button>
                    </div>
                  </div>

                  {/* Feature Controls */}
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded border border-zinc-200 dark:border-zinc-700 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Wireframe Mode</span>
                      <input
                        type="checkbox"
                        checked={wireframe}
                        onChange={(e) => {
                          soundEngine.playClick();
                          setWireframe(e.target.checked);
                        }}
                        className="cursor-pointer"
                      />
                    </div>

                    {d3dVersion === 'dx12' ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">DirectX Raytracing (DXR)</span>
                          <input
                            type="checkbox"
                            checked={raytracingSim}
                            onChange={(e) => {
                              soundEngine.playClick();
                              setRaytracingSim(e.target.checked);
                            }}
                            className="cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span>Variable Rate Shading (VRS)</span>
                          <select
                            value={vrsTier}
                            onChange={(e) => setVrsTier(e.target.value as any)}
                            className="bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded px-1.5 py-0.5 text-xs"
                          >
                            <option value="off">Off (1x1)</option>
                            <option value="2x2">Tier 2 (2x2)</option>
                            <option value="4x4">Tier 2 (4x4)</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Hardware Tessellation:</span>
                          <span className="font-mono">{tessellationLevel}x</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="6"
                          value={tessellationLevel}
                          onChange={(e) => setTessellationLevel(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    )}

                    <div className="space-y-1 pt-1 border-t border-zinc-200 dark:border-zinc-700">
                      <div className="flex justify-between text-xs">
                        <span>Rotation Velocity:</span>
                        <span className="font-mono">{meshRotationSpeed.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="0.2"
                        value={meshRotationSpeed}
                        onChange={(e) => setMeshRotationSpeed(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Run Benchmark Button */}
                  <button
                    disabled={isBenchmarking}
                    onClick={handleStartBenchmark}
                    className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Play size={14} />
                    <span>Run Direct3D Stability Benchmark</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DIRECTX 12 INSTALLER & RUNTIME DLLs */}
        {activeTab === 'installer' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-3 bg-white dark:bg-[#252526] rounded-md border border-zinc-300 dark:border-zinc-700 shadow-2xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">
                  DirectX 12 & 11 End-User Runtime Status
                </h3>
                <p className="text-xs text-zinc-500">
                  Verify the integrity of all essential Direct3D 12 and Direct3D 11 runtime libraries installed in <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono">C:\Windows\System32</code>.
                </p>
              </div>

              {/* DLL Table */}
              <div className="border border-zinc-300 dark:border-zinc-700 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-b border-zinc-300 dark:border-zinc-700">
                    <tr>
                      <th className="p-2">DLL Component</th>
                      <th className="p-2">API Description</th>
                      <th className="p-2">Version</th>
                      <th className="p-2">Integrity Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono text-[11px]">
                    <tr>
                      <td className="p-2 font-bold text-blue-600 dark:text-blue-400">d3d12.dll</td>
                      <td className="p-2 font-sans">Direct3D 12 Low-level Graphics Core</td>
                      <td className="p-2">10.0.19045.3803</td>
                      <td className="p-2 font-sans font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check size={13} /> Active & Verified
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-blue-600 dark:text-blue-400">d3d11.dll</td>
                      <td className="p-2 font-sans">Direct3D 11.4 Multithreaded Core</td>
                      <td className="p-2">10.0.19045.3803</td>
                      <td className="p-2 font-sans font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check size={13} /> Active & Verified
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-blue-600 dark:text-blue-400">dxgi.dll</td>
                      <td className="p-2 font-sans">DirectX Graphics Infrastructure 1.6</td>
                      <td className="p-2">10.0.19045.3803</td>
                      <td className="p-2 font-sans font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check size={13} /> Active & Verified
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-blue-600 dark:text-blue-400">d3dcompiler_47.dll</td>
                      <td className="p-2 font-sans">Direct3D HLSL Shader Model Compiler</td>
                      <td className="p-2">10.0.19041.3636</td>
                      <td className="p-2 font-sans font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check size={13} /> Active & Verified
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-blue-600 dark:text-blue-400">XAudio2_9.dll</td>
                      <td className="p-2 font-sans">DirectX Spatial Audio Processing API</td>
                      <td className="p-2">10.0.19045.3803</td>
                      <td className="p-2 font-sans font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check size={13} /> Active & Verified
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-blue-600 dark:text-blue-400">xinput1_4.dll</td>
                      <td className="p-2 font-sans">DirectX Controller Input Subsystem</td>
                      <td className="p-2">10.0.19041.1</td>
                      <td className="p-2 font-sans font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check size={13} /> Active & Verified
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Install / Repair Action */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="font-semibold text-zinc-900 dark:text-white">Need to update or repair DirectX 12?</span>
                  <p className="text-zinc-500">Runs Windows Update DirectX component verification and reinstalls missing libraries.</p>
                </div>
                <button
                  disabled={isInstallingUpdate}
                  onClick={handleRunInstaller}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <RefreshCw size={13} className={isInstallingUpdate ? 'animate-spin' : ''} />
                  <span>{isInstallingUpdate ? 'Installing Updates...' : 'Reinstall / Repair DirectX 12'}</span>
                </button>
              </div>

              {/* Install Wizard Progress & Log */}
              {(isInstallingUpdate || installLog.length > 0) && (
                <div className="p-3 bg-black/80 rounded border border-zinc-700 text-zinc-300 font-mono text-[11px] space-y-2">
                  <div className="flex justify-between items-center text-xs text-emerald-400 font-bold font-sans">
                    <span>DirectX 12 Setup Wizard</span>
                    <span>{installProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${installProgress}%` }} />
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-0.5 text-zinc-400 pt-1">
                    {installLog.map((log, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="text-emerald-400">&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer Bar */}
      <div className="px-4 py-2.5 bg-[#e8e8e8] dark:bg-[#252526] border-t border-zinc-300 dark:border-zinc-700 flex items-center justify-between">
        <div className="text-[11px] text-zinc-500">
          <span>DxDiag version 10.0.19041.3636 64-bit Unicode</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveInformation}
            className="px-3 py-1.5 bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 border border-zinc-300 dark:border-zinc-600 rounded text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download size={13} />
            <span>Save All Information...</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('system');
            }}
            className="px-3 py-1.5 bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 border border-zinc-300 dark:border-zinc-600 rounded text-xs font-medium cursor-pointer shadow-2xs"
          >
            Help
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              if (onClose) onClose();
            }}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer shadow-xs"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};
