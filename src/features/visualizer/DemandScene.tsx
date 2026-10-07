import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/** Let existing mesh interpolation settle, then stop drawing until something changes. */
export default function DemandScene({ revision, moving, reduced }: { revision: unknown; moving: boolean; reduced: boolean }) {
  const { invalidate, gl, setFrameloop } = useThree();
  useEffect(() => {
    let frame = 0;
    let until = performance.now() + (reduced ? 100 : 1200);
    const visible = () => !document.hidden && gl.domElement.getBoundingClientRect().width > 0 && gl.domElement.getBoundingClientRect().height > 0;
    const draw = () => {
      if (visible() && (performance.now() < until || (moving && !reduced))) { invalidate(); frame = requestAnimationFrame(draw); }
    };
    const wake = () => {
      cancelAnimationFrame(frame);
      setFrameloop(visible() ? 'demand' : 'never');
      until = performance.now() + (reduced ? 100 : 1200);
      if (visible()) { invalidate(); frame = requestAnimationFrame(draw); }
    };
    const resize = new ResizeObserver(wake); resize.observe(gl.domElement);
    document.addEventListener('visibilitychange', wake);
    gl.domElement.addEventListener('pointerdown', wake);
    wake();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); document.removeEventListener('visibilitychange', wake); gl.domElement.removeEventListener('pointerdown', wake); };
  }, [revision, moving, reduced, invalidate, gl, setFrameloop]);
  return null;
}
