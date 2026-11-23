// Entry: FLOOR 13 — Part 2.
import React from "react";
import { registerRoot, Composition } from "remotion";
import { Rbx2, RBX2_FRAMES } from "../videos/rbx2/Film";

const Root: React.FC = () => <Composition id="Rbx2" component={Rbx2} durationInFrames={RBX2_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);
