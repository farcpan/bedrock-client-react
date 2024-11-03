import { Box, Typography, TextareaAutosize, Button } from "@mui/material";
import { useState } from "react";
import {
  BedrockClient,
  ListFoundationModelsCommand,
} from "@aws-sdk/client-bedrock";

const title = import.meta.env.VITE_TITLE;
const version = import.meta.env.VITE_VERSION;

// For Bedrock
///////////////////////////////////////////////////////////////////////////////////////////////
// API Reference: https://docs.aws.amazon.com/bedrock/latest/APIReference/welcome.html
///////////////////////////////////////////////////////////////////////////////////////////////
const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
const bedrockClient = new BedrockClient({
  region: "ap-northeast-1",
  credentials: { accessKeyId: accessKeyId, secretAccessKey: secretAccessKey },
});

/**
 * App
 */
export const App = () => {
  // input prompt
  const [prompt, setPrompt] = useState("");

  // button click event handler
  const onClickStart = async () => {
    const response = await bedrockClient.send(
      new ListFoundationModelsCommand({})
    );
    const models = response.modelSummaries ?? [];
    for (const model of models) {
      console.log("=".repeat(42));
      console.log(` Model: ${model.modelId}`);
      console.log("-".repeat(42));
      console.log(` Name: ${model.modelName}`);
      console.log(` Provider: ${model.providerName}`);
      console.log(` Model ARN: ${model.modelArn}`);
      console.log(` Input modalities: ${model.inputModalities}`);
      console.log(` Output modalities: ${model.outputModalities}`);
      console.log(
        ` Supported customizations: ${model.customizationsSupported}`
      );
      console.log(
        ` Supported inference types: ${model.inferenceTypesSupported}`
      );
      console.log(`${"=".repeat(42)}\n`);
    }
  };

  return (
    <Box>
      {/* title */}
      <Typography sx={{ fontSize: "14px", color: "#444444" }}>
        {title}({version})
      </Typography>

      {/* user input */}
      <TextareaAutosize
        value={prompt}
        onChange={(e) => {
          setPrompt(e.currentTarget.value);
        }}
      />

      {/* button */}
      <Button variant="contained" color="primary" onClick={onClickStart}>
        START
      </Button>
    </Box>
  );
};
