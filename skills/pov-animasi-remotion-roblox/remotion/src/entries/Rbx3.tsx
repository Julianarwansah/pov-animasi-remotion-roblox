// Entry: FLOOR 13 — Part 3.
import React from "react";
import { registerRoot, Composition } from "remotion";
import { Rbx3, RBX3_FRAMES } from "../videos/rbx3/Film";

const Root: React.FC = () => <Composition id="Rbx3" component={Rbx3} durationInFrames={RBX3_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);
