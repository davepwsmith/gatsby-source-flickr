import { jest, test } from "@jest/globals";
import { sourceNodes } from "../src/source-nodes";
import path from "path";
import nock from "nock";

const nodeIdPlaceholder = `unique-id`;
const contentDigestPlaceholder = `unique-content-digest`;

let gatsbyApi;

describe(`sourceNodes`, () => {
  beforeEach(() => {
    gatsbyApi = {
      cache: {
        set: jest.fn(),
        get: jest.fn(),
      },
      actions: {
        createNode: jest.fn((data) => data),
      },
      createContentDigest: jest.fn().mockReturnValue(contentDigestPlaceholder),
      createNodeId: jest.fn().mockReturnValue(nodeIdPlaceholder),
      store: jest.fn(),
      reporter: {
        info: jest.fn(),
        error: jest.fn(),
        panic: jest.fn(),
        activityTimer: (): Record<string, unknown> => ({
          start: jest.fn(),
          end: jest.fn(),
          setStatus: jest.fn(),
          panicOnBuild: jest.fn(),
        }),
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("Do shit", async () => {
    nock.back.fixtures = path.join(__dirname, "fixtures");
    nock.back.setMode("record");
    const { nockDone } = await nock.back("post-data.json");
    const spy = jest.spyOn(gatsbyApi.actions, "createNode");

    // @ts-expect-error Mocked functions for spying on createNodes
    await sourceNodes(gatsbyApi, {
      api_key: "API_KEY",
      username: "USER_NAME",
      extras: ["geo"],
      plugins: [],
    });

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(6);
    nockDone();
  });
});
