import { Message } from '@ai-sdk/ui-utils';

export function experimental_buildOpenAIMessages(
  messages: Message[],
): ChatCompletionMessageParam[] {
  // @ts-ignore
  return messages.map(message => {
    switch (message.role) {
      case 'system':
      case 'user':
        return {
          role: message.role,
          content: message.content,
          // @ts-ignore
        } satisfies ChatCompletionMessageParam;

      case 'assistant': {
        const function_call = message.function_call;

        if (
          function_call !== undefined &&
          (typeof function_call === 'string' ||
            function_call.arguments === undefined ||
            function_call.name === undefined)
        ) {
          throw new Error(
            'Invalid function call in message. Expected a function call object',
          );
        }

        return {
          role: message.role,
          content: message.content,
          function_call:
            function_call === undefined
              ? undefined
              : {
                  name: function_call.name!,
                  arguments: function_call.arguments!,
                },
          // @ts-ignore
        } satisfies ChatCompletionMessageParam;
      }

      case 'function': {
        if (message.name === undefined) {
          throw new Error('Invalid function call in message. Expected a name');
        }

        return {
          role: message.role,
          content: message.content,
          name: message.name,
          // @ts-ignore
        } satisfies ChatCompletionMessageParam;
      }

      case 'data': {
        throw "unsupported message role 'data'";
      }

      case 'tool': {
        if (message.name === undefined) {
          throw new Error('Invalid tool message. Expected a name');
        }

        if (message.tool_call_id === undefined) {
          throw new Error('Invalid tool message. Expected a tool_call_id');
        }

        return {
          role: message.role,
          content: message.content,
          tool_call_id: message.tool_call_id,
          // @ts-ignore
        } satisfies ChatCompletionMessageParam;
      }
    }
  });
}

// copy of open ai messages (so we don't have a dependency on the openai package)
export type ChatCompletionMessageParam =
  | ChatCompletionSystemMessageParam
  | ChatCompletionUserMessageParam
  | ChatCompletionAssistantMessageParam
  | ChatCompletionToolMessageParam
  | ChatCompletionFunctionMessageParam;

export interface ChatCompletionSystemMessageParam {
  /**
   * The contents of the system message.
   */
  content: string;

  /**
   * The role of the messages author, in this case `system`.
   */
  role: 'system';

  /**
   * An optional name for the participant. Provides the model information to
   * differentiate between participants of the same role.
   */
  name?: string;
}

export interface ChatCompletionUserMessageParam {
  /**
   * The contents of the user message.
   */
  content: string | Array<ChatCompletionContentPart>;

  /**
   * The role of the messages author, in this case `user`.
   */
  role: 'user';

  /**
   * An optional name for the participant. Provides the model information to
   * differentiate between participants of the same role.
   */
  name?: string;
}

export type ChatCompletionContentPart =
  | ChatCompletionContentPartText
  | ChatCompletionContentPartImage;

export interface ChatCompletionContentPartText {
  /**
   * The text content.
   */
  text: string;

  /**
   * The type of the content part.
   */
  type: 'text';
}

export interface ChatCompletionContentPartImage {
  image_url: ChatCompletionContentPartImage.ImageURL;

  /**
   * The type of the content part.
   */
  type: 'image_url';
}

export namespace ChatCompletionContentPartImage {
  export interface ImageURL {
    /**
     * Either a URL of the image or the base64 encoded image data.
     */
    url: string;

    /**
     * Specifies the detail level of the image. Learn more in the
     * [Vision guide](https://platform.openai.com/docs/guides/vision/low-or-high-fidelity-image-understanding).
     */
    detail?: 'auto' | 'low' | 'high';
  }
}

export interface ChatCompletionAssistantMessageParam {
  /**
   * The role of the messages author, in this case `assistant`.
   */
  role: 'assistant';

  /**
   * The contents of the assistant message. Required unless `tool_calls` or
   * `function_call` is specified.
   */
  content?: string | null;

  /**
   * @deprecated: Deprecated and replaced by `tool_calls`. The name and arguments of
   * a function that should be called, as generated by the model.
   */
  function_call?: ChatCompletionAssistantMessageParam.FunctionCall;

  /**
   * An optional name for the participant. Provides the model information to
   * differentiate between participants of the same role.
   */
  name?: string;

  /**
   * The tool calls generated by the model, such as function calls.
   */
  tool_calls?: Array<ChatCompletionMessageToolCall>;
}

export namespace ChatCompletionAssistantMessageParam {
  /**
   * @deprecated: Deprecated and replaced by `tool_calls`. The name and arguments of
   * a function that should be called, as generated by the model.
   */
  export interface FunctionCall {
    /**
     * The arguments to call the function with, as generated by the model in JSON
     * format. Note that the model does not always generate valid JSON, and may
     * hallucinate parameters not defined by your function schema. Validate the
     * arguments in your code before calling your function.
     */
    arguments: string;

    /**
     * The name of the function to call.
     */
    name: string;
  }
}

export interface ChatCompletionMessageToolCall {
  /**
   * The ID of the tool call.
   */
  id: string;

  /**
   * The function that the model called.
   */
  function: ChatCompletionMessageToolCall.Function;

  /**
   * The type of the tool. Currently, only `function` is supported.
   */
  type: 'function';
}

export namespace ChatCompletionMessageToolCall {
  /**
   * The function that the model called.
   */
  export interface Function {
    /**
     * The arguments to call the function with, as generated by the model in JSON
     * format. Note that the model does not always generate valid JSON, and may
     * hallucinate parameters not defined by your function schema. Validate the
     * arguments in your code before calling your function.
     */
    arguments: string;

    /**
     * The name of the function to call.
     */
    name: string;
  }
}

export interface ChatCompletionToolMessageParam {
  /**
   * The contents of the tool message.
   */
  content: string;

  /**
   * The role of the messages author, in this case `tool`.
   */
  role: 'tool';

  /**
   * Tool call that this message is responding to.
   */
  tool_call_id: string;
}

export interface ChatCompletionFunctionMessageParam {
  /**
   * The return value from the function call, to return to the model.
   */
  content: string | null;

  /**
   * The name of the function to call.
   */
  name: string;

  /**
   * The role of the messages author, in this case `function`.
   */
  role: 'function';
}
