import 'dotenv/config';
import { argv } from "process";
import OpenAI from "openai";


const braveApiKey = process.env.BRAVE_SEARCH_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!braveApiKey || !openaiApiKey) {
  throw new Error(
    "OPENAI_API_KEY and BRAVE_SEARCH_API_KEY must be set"
  );
}

const openai = new OpenAI({
  apiKey: openaiApiKey,
});


function buildQuery(vendorID: string, productID: string, name: string) {
  return `${vendorID} ${productID} ${name}`
    + ` NOT site:wikidevi.wi-cat.ru`
    + ` NOT site:techinfodepot.shoutwiki.com`;
}


type BraveContext = {
  grounding?: {
    generic?: {
      url: string;
      title?: string;
      snippets?: string[];
    }[];
  };
  sources?: Record<
    string,
    {
      title?: string;
      hostname?: string;
      age?: string[];
    }
  >;
};

async function fetchBraveContext(query: string): Promise<BraveContext> {
  const response = await fetch(
    "https://api.search.brave.com/res/v1/llm/context",
    {
      method: "POST",
      headers: {
        "X-Subscription-Token": braveApiKey!,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        q: query,
        count: 10,
        maximum_number_of_urls: 10,
        maximum_number_of_tokens: 4096,
        context_threshold_mode: "strict",
        enable_source_metadata: true,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Brave API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}


type BraveEvidence = {
  source_id: number;
  url: string;
  title?: string;
  hostname?: string;
  age?: string[];
  snippets: string[];
};

function buildEvidence(braveData: BraveContext): BraveEvidence[] {
  const grounding = braveData.grounding?.generic ?? [];
  const sources = braveData.sources ?? {};

  return grounding.map((item, index) => {
    const metadata = sources[item.url] ?? {};

    return {
      source_id: index + 1,
      url: item.url,
      title: metadata.title ?? item.title,
      hostname: metadata.hostname,
      age: metadata.age,
      snippets: item.snippets ?? [],
    };
  });
}

type SourceAssessment =
  | "supports"
  | "contradicts"
  | "insufficient";

type VerificationResult = {
  evidence: {
    source_id: number;
    assessment: SourceAssessment;
    explanation: string;
  }[];
};

async function verifyDeviceName(
  vendorId: string,
  productId: string,
  deviceName: string,
  evidence: BraveEvidence[]
): Promise<VerificationResult> {
  const response = await openai.responses.create({
    model: "gpt-5.6-luna",

    instructions: `
You evaluate evidence for hardware device identity claims.

Use ONLY the supplied source material.
Do not rely on your own knowledge of hardware, USB IDs, or device models.

Do not treat multiple sources as independent confirmation if their
supplied text appears to be copied or substantially derived from the
same source. Mention suspected source duplication in the explanation.

Treat hexadecimal ID representations such as "07b8", "0x07b8",
and "VID_07B8" as equivalent when their numeric hexadecimal values
are the same. Likewise, treat product ID representations such as
"6001", "0x6001", and "PID_6001" as equivalent.

The claim is that a retail device name corresponds to an exact USB
vendor ID/product ID pair.

Do not count a source merely because it contains both the device name
and the VID/PID somewhere on the page. The source must establish a
relationship between them.

Evaluate each source independently.

For source-level assessment:

supports:
The source itself provides evidence connecting the claimed device name
to the claimed vendor ID and product ID.

contradicts:
The source itself provides evidence connecting the claimed device name
to a conflicting vendor ID and/or product ID.

insufficient:
The source does not establish either of those relationships. A source
that only confirms the device name exists, or only confirms the VID/PID
exists, is insufficient.

`,

    input: `
Claim to verify:

Device name: ${deviceName}
USB vendor ID: ${vendorId}
USB product ID: ${productId}

Brave search evidence:

${JSON.stringify(evidence, null, 2)}
`,

    text: {
      format: {
        type: "json_schema",
        name: "device_name_verification",
        strict: true,
        schema: {
          type: "object",
          properties: {
            evidence: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  source_id: {
                    type: "integer",
                  },
                  assessment: {
                    type: "string",
                    enum: ["supports", "contradicts", "insufficient"],
                  },
                  explanation: {
                    type: "string",
                  },
                },
                required: [
                  "source_id",
                  "assessment",
                  "explanation",
                ],
                additionalProperties: false,
              },
            },
          },
          required: [
            "evidence",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  return JSON.parse(response.output_text);
}

type OverallVerdict =
  | "confirmed"
  | "contradicted"
  | "inconclusive";

function getOverallVerdict(
  evidence: VerificationResult["evidence"]
): OverallVerdict {
  const supports = evidence.some(
    source => source.assessment === "supports"
  );

  const contradicts = evidence.some(
    source => source.assessment === "contradicts"
  );

  if (supports && !contradicts) {
    return "confirmed";
  }

  if (contradicts && !supports) {
    return "contradicted";
  }

  return "inconclusive";
}

async function main() {

  const [vendorID, productID, ...nameParts] = argv.slice(2);
  const name = nameParts.join(" ");

  if (!vendorID || !productID || !name) {
    console.error(
      "Usage: verify-device-names <vendor-id> <product-id> <device-name>"
    );
    process.exit(1);
  }

  const query = buildQuery(vendorID, productID, name);
  console.log("Query:", query);

  const braveContext: BraveContext = await fetchBraveContext(query);
  console.dir(braveContext, { depth: null });

  const evidence = buildEvidence(braveContext);
  console.dir(evidence, { depth: null });

  const result = await verifyDeviceName(
    vendorID,
    productID,
    name,
    evidence
  );
  console.dir(result, { depth: null });

  const overallVerdict = getOverallVerdict(result.evidence);
  console.log("Overall Verdict:", overallVerdict);

}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
