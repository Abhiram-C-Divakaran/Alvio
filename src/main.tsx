import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Disable Troika WebWorker to apply our patches cleanly on the main thread
// The 3D text runtime is configured by the lazy-loaded learning layouts.

// Patch WebGL context to prevent troika-three-text from crashing the GPU process
// when ANGLE_instanced_arrays is not supported. We provide a mock extension so it doesn't throw.
if (typeof WebGLRenderingContext !== 'undefined') {
  const origGetExtension = WebGLRenderingContext.prototype.getExtension as (
    this: WebGLRenderingContext,
    name: string
  ) => unknown;
  const patchedGetExtension = function (this: WebGLRenderingContext, name: string): unknown {
    const ext = origGetExtension.call(this, name);
    if (name === 'ANGLE_instanced_arrays' && !ext) {
      return {
        VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE: 0x88fe,
        drawArraysInstancedANGLE: () => {},
        drawElementsInstancedANGLE: () => {},
        vertexAttribDivisorANGLE: () => {},
      } satisfies ANGLE_instanced_arrays;
    }
    return ext;
  };
  WebGLRenderingContext.prototype.getExtension =
    patchedGetExtension as typeof WebGLRenderingContext.prototype.getExtension;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
