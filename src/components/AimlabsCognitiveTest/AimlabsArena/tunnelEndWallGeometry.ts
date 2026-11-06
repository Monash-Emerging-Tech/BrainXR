// Pure vertex-array builders for TunnelEndWall's grid lines (continuing the
// corridor's wireframe onto the black end cap) and aperture border.

export function buildTunnelEndWallGridVertices(
  halfW: number,
  halfH: number,
  halfWallW: number,
  halfWallH: number,
  w: number,
  h: number
): Float32Array {
  const vertices: number[] = [];

  // Range of vertical lines across the black wall
  const iMin = Math.floor((-halfWallW - -halfW) / w);
  const iMax = Math.ceil((halfWallW - -halfW) / w);

  // Range of horizontal lines across the black wall
  const jMin = Math.floor((-halfWallH - -halfH) / h);
  const jMax = Math.ceil((halfWallH - -halfH) / h);

  // Vertical grid lines (continue floor & ceiling longitudinal lines onto the black wall)
  for (let i = iMin; i <= iMax; i++) {
    const x = -halfW + i * w;
    vertices.push(x, -halfWallH, 0, x, halfWallH, 0);
  }

  // Horizontal grid lines (continue left & right wall longitudinal lines onto the black wall)
  for (let j = jMin; j <= jMax; j++) {
    const y = -halfH + j * h;
    vertices.push(-halfWallW, y, 0, halfWallW, y, 0);
  }

  return new Float32Array(vertices);
}

export function buildTunnelEndWallBorderVertices(halfW: number, halfH: number): Float32Array {
  // 4 edges framing the corridor aperture
  return new Float32Array([
    -halfW, -halfH, 0,  halfW, -halfH, 0,
     halfW, -halfH, 0,  halfW,  halfH, 0,
     halfW,  halfH, 0, -halfW,  halfH, 0,
    -halfW,  halfH, 0, -halfW, -halfH, 0,
  ]);
}
