# Headset3D.tsx

A procedural placeholder headset (wireframe dome + node spheres) in its own
`Canvas`, built for the Act 3 handoff crossfade from the story intro to the
live digital twin. Accepts real `children` instead of its own geometry so a
caller can swap in the actual interactive headset.

**Props**: `opacity`, `className?`, `children?`.

**Non-obvious**: nothing currently imports this component — it was built for
an Act 3 handoff crossfade that doesn't exist in the component tree. The
real headset lives on the landing page ([[../Scene|Scene]]/[[../HeadWrapper/index|HeadWrapper]])
and was never wired into the story flow via this placeholder.
