import { Box, Typography, TextareaAutosize, Button } from "@mui/material";
import { useState } from "react";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
/*
import {
  BedrockClient,
  InvokeModelCommand, 
  ListFoundationModelsCommand,
} from "@aws-sdk/client-bedrock";
 */

const title = import.meta.env.VITE_TITLE;
const version = import.meta.env.VITE_VERSION;

// For Bedrock
///////////////////////////////////////////////////////////////////////////////////////////////
// API Reference: https://docs.aws.amazon.com/bedrock/latest/APIReference/welcome.html
///////////////////////////////////////////////////////////////////////////////////////////////
const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
const bedrockClient = new BedrockRuntimeClient({
  region: "ap-northeast-1",
  credentials: { accessKeyId: accessKeyId, secretAccessKey: secretAccessKey },
});

/**
 * App
 */
export const App = () => {
  // input prompt
  const [prompt, setPrompt] = useState("");

  // output
  const [invokeResultText, setInvokeResultText] = useState("");

  // button click event handler
  const onClickStart = async () => {
    console.log("onClickStart");
    if (!prompt) {
      console.log("please set prompt!");
      return;
    }
    console.log(prompt);

    const body = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1024,
      system:
        "あなたはオフィス内のユーザーのクレームや要望をチェックし、必要な部署に情報を転送する役割を持っています。",
      /*
      system:
        "あなたはオフィス内のユーザーのクレームや要望をチェックし、必要な部署に情報を転送する役割を持っています。" +
        "与えられたプロンプトの内容をチェックし、必ずJSON形式で結果を返却してください。JSONフォーマットは必ず順守してください。" +
        "JSONフォーマットは以下の通りとします。\n" +
        '{"active": true, "desired": 1, "detailed": "additional information"}' +
        "\n" +
        "各キーについて説明します。\n" +
        "`active`: 与えられたプロンプト内に、オフィス内・室内の温度や湿度に関する内容が含まれている場合はtrue、それ以外の場合はfalseを設定してください。\n" +
        "`desired`: `active`がfalseの場合は必ず0を設定してください。`active`がtrueである場合は、以下の条件に従って1または2を設定してください。\n" +
        "・ユーザーが暑い、温度が高いと感じている場合は1を設定する\n" +
        "・ユーザーが寒い、温度が低いと感じている場合は2を設定する\n" +
        "`detailed`: `active`および`desired`を判定する際の根拠となった情報をユーザープロンプトから抽出して返却してください。最大で50文字程度に要約するようにしてください。",
        */
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    const invokeModelCommandInput = {
      modelId: "anthropic.claude-v2:1",
      contentType: "application/json",
      accept: "*/*",
      body: body,
      /*
      body: JSON.stringify({
        prompt:
          "\n\nHuman: " +
          "あなたはオフィス内のユーザーのクレームや要望をチェックし、必要な部署に情報を転送する役割を持っています。" +
          "与えられたプロンプトの内容をチェックし、室内の温度や湿度に関する要望が記載されているか判定してください。ユーザープロンプトは次の行以降に記載されます。\n" +
          prompt +
          "\n\nAssistant: ",
        max_tokens_to_sample: 200,
        temperature: 0.5,
        top_k: 250,
        top_p: 1,
        stop_sequences: ["\n\nHuman:"],
        anthropic_version: "bedrock-2023-05-31",
      }),
      */
      // Claude v3 Sonet
      // modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
    };

    for (let retryCount = 0; retryCount < 3; retryCount++) {
      try {
        const bedrockResponse = await bedrockClient.send(
          new InvokeModelCommand(invokeModelCommandInput)
        );
        const text = JSON.parse(
          Buffer.from(bedrockResponse.body).toString("utf-8")
        );
        setInvokeResultText(text);
        break;
      } catch (e) {
        console.error(e);
        // sleep
        console.log("retry!");
        await sleep(1000 * (retryCount + 1) ** 2);
      }
    }
  };

  const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

      <Typography sx={{ fontSize: "12px", color: "#111111" }}>
        {invokeResultText}
      </Typography>
    </Box>
  );
};
