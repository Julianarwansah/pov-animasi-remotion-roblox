// Entry per episode: THE LAST SERVER — Part 1 (gaya Roblox).
import React from "react";
import { registerRoot, Composition } from "remotion";
import { Rbx1, RBX1_FRAMES } from "../videos/rbx1/Film";

const Root: React.FC = () => <Composition id="Rbx1" component={Rbx1} durationInFrames={RBX1_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);
