// Entry: BLOXY LAND — Part 1.
import React from "react";
import { registerRoot, Composition } from "remotion";
import { Rbx5, RBX5_FRAMES } from "../videos/rbx5/Film";

const Root: React.FC = () => <Composition id="Rbx5" component={Rbx5} durationInFrames={RBX5_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);
