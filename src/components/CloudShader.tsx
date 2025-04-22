
import React, { useRef } from 'react';
import { useWebGLSetup } from '@/hooks/useWebGLSetup';

const CloudShader: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Vertex shader source
  const vertexShaderSource = `
    attribute vec2 position;
    
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  // Enhanced fragment shader source with improved mouse interaction
  const fragmentShaderSource = `
    precision highp float;
    
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    
    // Simplex noise function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                          0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                          -0.577350269189626,  // -1.0 + 2.0 * C.x
                          0.024390243902439); // 1.0 / 41.0
      
      // First corner
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v -   i + dot(i, C.xx);
      
      // Other corners
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      
      // Permutations
      i = mod289(i); // Avoid truncation effects in permutation
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
        
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      
      // Gradients
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      
      // Normalise gradients implicitly by scaling m
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      
      // Compute final noise value at P
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    // Enhanced color palette function using our branding colors
    vec3 palette(float t) {
      // Use our color variables
      vec3 baseDeep = vec3(0.039, 0.059, 0.153);      // #0A0F27
      vec3 accentPrimary = vec3(1.0, 0.42, 0.0);      // #FF6B00
      vec3 highlightInteractive = vec3(0.0, 0.941, 1.0); // #00F0FF
      
      return mix(
        mix(baseDeep, accentPrimary, 0.5 + 0.5 * sin(t * 0.1)),
        highlightInteractive,
        0.5 + 0.5 * sin(t * 0.2 + 1.5)
      );
    }
    
    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 p = uv * 2.0 - 1.0;
      p.x *= u_resolution.x / u_resolution.y;
      
      // Enhanced mouse interaction
      vec2 mousePos = u_mouse / u_resolution.xy;
      mousePos = mousePos * 2.0 - 1.0;
      mousePos.x *= u_resolution.x / u_resolution.y;
      
      float mouseDistance = length(p - mousePos);
      float mouseFactor = smoothstep(0.8, 0.0, mouseDistance);
      
      // Time variables with mouse influence
      float time = u_time * 0.1;
      float mouseInfluencedTime = time + mouseFactor * 0.5;
      
      // Multiple layers of noise
      float noise = 0.0;
      
      // Base layer with mouse distortion
      noise += 0.5 * snoise(p * 1.0 + vec2(mouseInfluencedTime * 0.1, mouseInfluencedTime * 0.1));
      
      // Medium detail layer with more mouse influence
      noise += 0.25 * snoise(p * 2.0 + vec2(time * 0.15 + mouseFactor * 0.1, -time * 0.1));
      
      // Fine detail layer
      noise += 0.125 * snoise(p * 4.0 + vec2(-time * 0.2, time * 0.05));
      
      // Very fine detail
      noise += 0.0625 * snoise(p * 8.0 + vec2(time * 0.3, time * 0.2));
      
      // Enhanced mouse interaction - add warm glow around cursor
      float glow = smoothstep(0.5, 0.0, mouseDistance) * 0.5;
      
      // Add ripple effect from mouse position
      float ripple = sin(mouseDistance * 15.0 - u_time * 2.0) * 0.02 * mouseFactor;
      noise += ripple;
      
      // Normalize and enhance contrast
      noise = 0.5 + 0.5 * noise;
      noise = smoothstep(0.4, 0.6, noise);
      
      // Color based on noise with mouse influence
      vec3 color = palette(noise * 10.0 + time);
      
      // Enhanced base gradient
      vec3 baseGradient = mix(
        vec3(0.039, 0.059, 0.153), // #0A0F27 (base deep)
        vec3(0.078, 0.109, 0.267), // #141C44 (base deep lighter)
        uv.y
      );
      
      // Add warmer tone near mouse cursor
      baseGradient = mix(
        baseGradient,
        vec3(0.1, 0.05, 0.2), // Subtle purple tone
        glow
      );
      
      // Add some subtle sparkles (small bright points)
      float sparkle = pow(snoise(p * 50.0 + time * 2.0), 10.0) * 0.5;
      sparkle += pow(snoise(p * 100.0 - time * 3.0), 20.0) * 0.5;
      sparkle = smoothstep(0.8, 0.9, sparkle) * 0.3;
      
      // Add cyan highlight color to sparkles
      vec3 sparkleColor = mix(
        color,
        vec3(0.0, 0.941, 1.0), // #00F0FF (highlight interactive)
        sparkle * 2.0
      );
      
      // Blend everything together with enhanced mouse glow
      vec3 finalColor = mix(
        baseGradient,
        sparkleColor,
        noise * 0.5 + sparkle
      );
      
      // Add extra glow near mouse position
      finalColor = mix(
        finalColor,
        vec3(0.1, 0.5, 1.0), // Soft blue glow
        smoothstep(0.3, 0.0, mouseDistance) * 0.3
      );
      
      // Add vignette effect
      float vignette = 1.0 - smoothstep(0.5, 1.5, length(p));
      finalColor *= vignette;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  // Use the custom hook for WebGL setup
  useWebGLSetup({
    canvasRef,
    vertexShaderSource,
    fragmentShaderSource,
    startTimeRef
  });

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default CloudShader;
