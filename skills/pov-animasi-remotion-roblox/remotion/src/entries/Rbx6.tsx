// Entry: BLOXY LAND — Part 2.
import React from "react";
import { registerRoot, Composition } from "remotion";
import { Rbx6, RBX6_FRAMES } from "../videos/rbx6/Film";

const Root: React.FC = () => <Composition id="Rbx6" component={Rbx6} durationInFrames={RBX6_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);
