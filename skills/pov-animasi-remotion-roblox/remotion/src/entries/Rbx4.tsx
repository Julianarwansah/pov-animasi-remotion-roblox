// Entry: FLOOR 13 — Part 4.
import React from "react";
import { registerRoot, Composition } from "remotion";
import { Rbx4, RBX4_FRAMES } from "../videos/rbx4/Film";

const Root: React.FC = () => <Composition id="Rbx4" component={Rbx4} durationInFrames={RBX4_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);
