import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { useMouseParallax } from '../hooks/useMouseParallax';
import { useReducedMotion } from '../hooks/useReducedMotion';

type NodeType = 'healthy' | 'risk' | 'recovering';

interface TransactionNode {
  id: number;
  position: THREE.Vector3;
  type: NodeType;
  connections: number[];
}

function generateNetwork(count: number): TransactionNode[] {
  const nodes: TransactionNode[] = [];
  for (let i = 0; i < count; i++) {
    const theta = (i / count) * Math.PI * 2;
    const r = 2.5 + (i % 3) * 0.6;
    const type: NodeType = i % 5 === 0 ? 'risk' : i % 7 === 0 ? 'recovering' : 'healthy';
    nodes.push({
      id: i,
      position: new THREE.Vector3(
        Math.cos(theta) * r + (Math.sin(i) * 0.4),
        ((i % 4) - 1.5) * 0.8,
        Math.sin(theta) * r + (Math.cos(i) * 0.4)
      ),
      type,
      connections: [],
    });
  }
  nodes.forEach((node, i) => {
    const numConn = 1 + (i % 2);
    for (let c = 0; c < numConn; c++) {
      const target = (i + 1 + c * 3) % count;
      node.connections.push(target);
    }
  });
  return nodes;
}

function NetworkNodes({ nodes }: { nodes: TransactionNode[] }) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const reducedMotion = useReducedMotion();

  const sphereGeo = useMemo(() => new THREE.SphereGeometry(0.08, 12, 12), []);
  const materials = useMemo(() => ({
    healthy: new THREE.MeshBasicMaterial({ color: '#00D4FF' }),
    risk: new THREE.MeshBasicMaterial({ color: '#F59E0B' }),
    recovering: new THREE.MeshBasicMaterial({ color: '#10B981' }),
  }), []);

  useEffect(() => {
    return () => {
      sphereGeo.dispose();
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [sphereGeo, materials]);

  useFrame(() => {
    if (reducedMotion) return;
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const node = nodes[i];
      if (node.type === 'risk') {
        const s = 1 + Math.sin(Date.now() * 0.004 + i) * 0.35;
        mesh.scale.set(s, s, s);
      }
    });
  });

  return (
    <>
      {nodes.map((node, i) => (
        <mesh
          key={node.id}
          ref={(el) => { meshRefs.current[i] = el; }}
          position={node.position}
          geometry={sphereGeo}
          material={materials[node.type]}
        />
      ))}
    </>
  );
}

function ConnectionLines({ nodes }: { nodes: TransactionNode[] }) {
  const linePositions = useMemo(() => {
    const posList: number[] = [];
    nodes.forEach((node) => {
      node.connections.forEach((targetId) => {
        const target = nodes[targetId];
        if (target) {
          posList.push(
            node.position.x, node.position.y, node.position.z,
            target.position.x, target.position.y, target.position.z
          );
        }
      });
    });
    return new Float32Array(posList);
  }, [nodes]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    return geo;
  }, [linePositions]);

  const material = useMemo(
    () => new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.08 }),
    []
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return <primitive object={new THREE.LineSegments(geometry, material)} />;
}

function FlowParticles({ nodes }: { nodes: TransactionNode[] }) {
  const pointsRef = useRef<THREE.Points | null>(null);
  const reducedMotion = useReducedMotion();

  const { positions, speeds } = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const count = isMobile ? 40 : 90;
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const node = nodes[i % nodes.length];
      pos[i * 3] = node.position.x + (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 1] = node.position.y + (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 2] = node.position.z + (Math.random() - 0.5) * 1.5;
      spd[i] = 0.002 + Math.random() * 0.004;
    }
    return { positions: pos, speeds: spd };
  }, [nodes]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
    return geo;
  }, [positions]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: '#00D4FF',
        size: 0.03,
        transparent: true,
        opacity: 0.7,
      }),
    []
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  const posCopyRef = useRef(positions.slice());

  useFrame(() => {
    if (reducedMotion || !pointsRef.current) return;
    const posArr = posCopyRef.current;
    const count = posArr.length / 3;
    for (let i = 0; i < count; i++) {
      posArr[i * 3 + 1] += speeds[i];
      if (posArr[i * 3 + 1] > 3) {
        const node = nodes[Math.floor(Math.random() * nodes.length)];
        posArr[i * 3] = node.position.x + (Math.random() - 0.5) * 2;
        posArr[i * 3 + 1] = -3;
        posArr[i * 3 + 2] = node.position.z + (Math.random() - 0.5) * 2;
      }
    }
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute;
    attr.set(posArr);
    attr.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

function CameraRig({ mouseOffset }: { mouseOffset: { x: number; y: number } }) {
  const { camera } = useThree();
  const reducedMotion = useReducedMotion();

  useFrame(() => {
    if (reducedMotion) return;
    camera.position.x += (mouseOffset.x * 2.5 - camera.position.x) * 0.04;
    camera.position.y += (-mouseOffset.y * 1.5 - camera.position.y + 0.3) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function Scene() {
  const mouseOffset = useMouseParallax(0.3);
  const nodes = useMemo(() => generateNetwork(20), []);

  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 2, 4]} intensity={0.6} color="#00D4FF" />
      <CameraRig mouseOffset={mouseOffset} />
      <ConnectionLines nodes={nodes} />
      <NetworkNodes nodes={nodes} />
      <FlowParticles nodes={nodes} />
    </>
  );
}

export default function RecoveryScene() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0.5, 7], fov: 55 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
