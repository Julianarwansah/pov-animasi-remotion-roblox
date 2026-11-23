// Entry: BLOXY LAND — Part 3.
import React from "react";
import { registerRoot, Composition } from "remotion";
import { Rbx7, RBX7_FRAMES } from "../videos/rbx7/Film";

const Root: React.FC = () => <Composition id="Rbx7" component={Rbx7} durationInFrames={RBX7_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);
