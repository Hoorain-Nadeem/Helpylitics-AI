import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// A rotating network of people: nodes are members, lines are help connections.
export default function HeroScene() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.z = 15;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);
    const palette = [0x4f46ff, 0x0b8f6f, 0xf08a24];
    const pts = [];
    const N = 70;
    for (let i = 0; i < N; i++) {
      const r = 4.5 + Math.random() * 2.8;
      const phi = Math.acos(2 * Math.random() - 1);
      const th = Math.random() * Math.PI * 2;
      const p = new THREE.Vector3(r * Math.sin(phi) * Math.cos(th), r * Math.sin(phi) * Math.sin(th), r * Math.cos(phi));
      pts.push(p);
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.1 + Math.random() * 0.16, 16, 16),
        new THREE.MeshBasicMaterial({ color: palette[i % 3] })
      );
      m.position.copy(p);
      group.add(m);
    }
    const verts = [];
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) if (pts[i].distanceTo(pts[j]) < 3.7) verts.push(pts[i], pts[j]);
    group.add(new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(verts),
      new THREE.LineBasicMaterial({ color: 0x4f46ff, transparent: true, opacity: 0.22 })
    ));

    const mouse = { x: 0, y: 0 };
    const onMove = (e) => { mouse.x = (e.clientX / window.innerWidth - 0.5) * 2; mouse.y = (e.clientY / window.innerHeight - 0.5) * 2; };
    window.addEventListener('mousemove', onMove);

    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener('resize', onResize);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf;
    const tick = () => {
      group.rotation.y += 0.0025;
      group.rotation.x += (mouse.y * 0.3 - group.rotation.x) * 0.03;
      group.position.x += (mouse.x * 0.6 - group.position.x) * 0.03;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    if (reduce) renderer.render(scene, camera); else tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={ref} className="hero-scene" aria-hidden="true" />;
}
